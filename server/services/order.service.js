import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import AppError from '../utils/AppError.js';

export const createPendingOrder = async ({
  userId,
  items,
  total,
  shippingInfo,
  paymentProvider,
}) => {
  return Order.create({
    user: userId || null,
    items,
    totalAmount: total,
    currency: 'AMD',
    paymentProvider,
    shippingInfo,
    paymentStatus: 'pending',
    orderStatus: 'pending',
  });
};

export const confirmOrder = async (orderId, { transactionId, providerOrderId }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.paymentStatus === 'paid') {
    throw new AppError('Order has already been paid', 400);
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.transactionId = transactionId;
  if (providerOrderId) order.providerOrderId = providerOrderId;
  order.paidAt = new Date();
  await order.save();

  // Decrement stock for each item
  await decrementStock(order.items);

  return order;
};

export const failOrder = async (orderId) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { paymentStatus: 'failed', orderStatus: 'cancelled' },
    { new: true }
  );
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

export const getOrdersByUser = async (userId) =>
  Order.find({ user: userId })
    .sort('-createdAt')
    .populate('items.product', 'name images slug');

export const getOrderById = async (orderId, userId = null) => {
  const order = await Order.findById(orderId).populate('items.product', 'name images slug');
  if (!order) throw new AppError('Order not found', 404);
  if (userId && order.user && order.user.toString() !== userId.toString()) {
    throw new AppError('Not authorized to access this order', 403);
  }
  return order;
};

export const findOrderByInternalId = async (internalOrderId) => {
  const order = await Order.findOne({ internalOrderId });
  if (!order) throw new AppError(`Order not found for ref: ${internalOrderId}`, 404);
  return order;
};

// Private helper — do not export
const decrementStock = async (items) => {
  const ops = items.map((item) =>
    Product.updateOne(
      { _id: item.product, 'stock.size': item.size },
      { $inc: { 'stock.$.quantity': -item.quantity } }
    )
  );
  await Promise.all(ops);
};
