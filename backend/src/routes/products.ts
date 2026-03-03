import express from 'express';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, sortBy, series, type, color, storage } = req.query;
    let query: any = {};
    
    if (search) {
      query.model = { $regex: search, $options: 'i' };
    }
    
    if (series) {
      query.series = series;
    }
    
    if (type) {
      query.type = type;
    }

    let products = await Product.find(query);
    
    // Filter by variant properties
    if (color || storage) {
      products = products.map((product: any) => {
        const productObj = product.toObject();
        const filteredVariants = productObj.variants.filter((v: any) => {
          if (color && !v.color.toLowerCase().includes(color.toString().toLowerCase())) return false;
          if (storage && v.storage !== storage) return false;
          return true;
        });
        return { ...productObj, variants: filteredVariants };
      }).filter(p => p.variants.length > 0);
    }
    
    // Sort by lowest variant price
    if (sortBy === 'asc') {
      products.sort((a: any, b: any) => {
        const minA = Math.min(...a.variants.map((v: any) => v.price));
        const minB = Math.min(...b.variants.map((v: any) => v.price));
        return minA - minB;
      });
    } else if (sortBy === 'desc') {
      products.sort((a: any, b: any) => {
        const maxA = Math.max(...a.variants.map((v: any) => v.price));
        const maxB = Math.max(...b.variants.map((v: any) => v.price));
        return maxB - maxA;
      });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;