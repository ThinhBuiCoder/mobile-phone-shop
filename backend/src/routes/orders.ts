import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const VALID_PAYMENT_METHODS = ['cod', 'bank_transfer', 'card'];

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, shippingAddress, payment, idempotencyKey } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return res.status(400).json({ message: 'idempotencyKey is required' });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city
    ) {
      return res.status(400).json({ message: 'Shipping address is incomplete' });
    }

    if (!payment?.method || !VALID_PAYMENT_METHODS.includes(payment.method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const existingOrder = await Order.findOne({ userId: req.userId, idempotencyKey });
    if (existingOrder) {
      return res.status(200).json(existingOrder);
    }

    const sanitizedItems = items.map((item: any) => ({
      productId: item.productId,
      variantSku: String(item.variantSku || ''),
      quantity: Number(item.quantity || 0),
    }));

    if (sanitizedItems.some((item: any) => !item.productId || !item.variantSku || item.quantity <= 0)) {
      return res.status(400).json({ message: 'Invalid order items' });
    }

    let totalAmount = 0;
    const persistedItems: any[] = [];

    await session.withTransaction(async () => {
      for (const item of sanitizedItems) {
        const product = await Product.findById(item.productId).session(session);

        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND');
        }

        const variant = product.variants.find((v: any) => v.sku === item.variantSku);

        if (!variant) {
          throw new Error('VARIANT_NOT_FOUND');
        }

        if (variant.stock < item.quantity) {
          throw new Error(`OUT_OF_STOCK:${variant.sku}`);
        }

        variant.stock -= item.quantity;
        product.markModified('variants');
        await product.save({ session });

        totalAmount += variant.price * item.quantity;

        persistedItems.push({
          productId: product._id,
          variantSku: variant.sku,
          model: product.model,
          color: variant.color,
          storage: variant.storage,
          condition: variant.condition,
          quantity: item.quantity,
          price: variant.price,
        });
      }

      const paymentStatus = payment.method === 'cod' ? 'pending' : 'paid';
      const orderStatus = payment.method === 'cod' ? 'pending' : 'paid';

      const [order] = await Order.create(
        [
          {
            userId: req.userId,
            items: persistedItems,
            totalAmount,
            shippingAddress: {
              fullName: shippingAddress.fullName,
              phone: shippingAddress.phone,
              addressLine: shippingAddress.addressLine,
              city: shippingAddress.city,
              note: shippingAddress.note || '',
            },
            payment: {
              method: payment.method,
              status: paymentStatus,
              transactionId: payment.transactionId || '',
            },
            status: orderStatus,
            statusHistory: [{ status: orderStatus, note: 'Order created' }],
            idempotencyKey,
          },
        ],
        { session }
      );

      res.status(201).json(order);
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      const existed = await Order.findOne({ userId: req.userId, idempotencyKey: req.body?.idempotencyKey });
      if (existed) {
        return res.status(200).json(existed);
      }
    }

    if (error.message === 'PRODUCT_NOT_FOUND' || error.message === 'VARIANT_NOT_FOUND') {
      return res.status(404).json({ message: 'A product in your cart no longer exists' });
    }

    if (typeof error.message === 'string' && error.message.startsWith('OUT_OF_STOCK:')) {
      const sku = error.message.split(':')[1];
      return res.status(409).json({ message: `Variant ${sku} is out of stock` });
    }

    res.status(500).json({ message: 'Server error' });
  } finally {
    await session.endSession();
  }
});

router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/revenue', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { period, date } = req.query;
    const matchStage: any = { userId: req.userId };

    if (period && date) {
      const targetDate = new Date(date as string);
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (period === 'day') {
        startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (period === 'month') {
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (period === 'year') {
        startDate = new Date(targetDate.getFullYear(), 0, 1);
        endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
      }

      if (startDate && endDate) {
        matchStage.orderDate = { $gte: startDate, $lte: endDate };
      }
    }

    const orders = await Order.find(matchStage).sort({ orderDate: -1 });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      totalRevenue,
      orderCount: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
