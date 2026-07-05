import apiClient from './apiClient.js';

export const getMyOrders = async () => {
  const { data } = await apiClient.get('/orders/my');
  return data.data.orders;
};

export const getOrderById = async (orderId) => {
  const { data } = await apiClient.get(`/orders/${orderId}`);
  return data.data.order;
};
