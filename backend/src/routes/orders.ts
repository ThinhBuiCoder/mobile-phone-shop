import express from 'express';
import Order from '../models/Order.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { items, totalAmount } = req.body;
    const order = new Order({
      userId: req.userId,
      items,
      totalAmount
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/revenue', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { period, date } = req.query;
    let matchStage: any = { userId: req.userId };

    if (period && date) {
      const targetDate = new Date(date as string);
      let startDate, endDate;

      if (period === 'day') {
        startDate = new Date(targetDate.setHours(0, 0, 0, 0));
        endDate = new Date(targetDate.setHours(23, 59, 59, 999));
      } else if (period === 'month') {
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (period === 'year') {
        startDate = new Date(targetDate.getFullYear(), 0, 1);
        endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
      }

      matchStage.orderDate = { $gte: startDate, $lte: endDate };
    }

    const result = await Order.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } }
    ]);

    const revenue = result.length > 0 ? result[0] : { totalRevenue: 0, orderCount: 0 };
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;