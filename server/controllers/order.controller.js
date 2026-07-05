import asyncHandler from '../utils/asyncHandler.js';
import * as orderService from '../services/order.service.js';

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrdersByUser(req.user._id);
  res.status(200).json({ status: 'success', data: { orders } });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id);
  res.status(200).json({ status: 'success', data: { order } });
});
