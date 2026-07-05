import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

export const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [summary, monthly, topProducts] = await Promise.all([
    // Overall counts and revenue
    Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]),

    // Monthly revenue for last 6 months (paid orders only)
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          paidAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Top 5 products by revenue
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          unitsSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // Flatten summary aggregation
  const stats = { totalRevenue: 0, totalOrders: 0, paidOrders: 0, pendingOrders: 0, failedOrders: 0 };
  for (const s of summary) {
    stats.totalOrders += s.count;
    if (s._id === 'paid') {
      stats.totalRevenue = s.revenue;
      stats.paidOrders = s.count;
    } else if (s._id === 'pending') {
      stats.pendingOrders = s.count;
    } else if (s._id === 'failed') {
      stats.failedOrders = s.count;
    }
  }

  // Build full 6-month array (fill gaps with 0)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const found = monthly.find(
      (m) => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1
    );
    monthlyRevenue.push({
      label: monthNames[d.getMonth()],
      revenue: found?.revenue ?? 0,
      orders: found?.orders ?? 0,
    });
  }

  res.status(200).json({
    status: 'success',
    data: { stats, monthlyRevenue, topProducts },
  });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  // Admin sees ALL products regardless of isActive
  const products = await Product.find().sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { products } });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email'),
    Order.countDocuments(),
  ]);

  res.status(200).json({
    status: 'success',
    data: { orders, total, page, pages: Math.ceil(total / limit) },
  });
});
