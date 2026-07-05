import apiClient from './apiClient.js';

export const getStats = async () => {
  const { data } = await apiClient.get('/admin/stats');
  return data.data;
};

export const getAllOrders = async (page = 1) => {
  const { data } = await apiClient.get('/admin/orders', { params: { page } });
  return data.data;
};

export const getAllProducts = async () => {
  const { data } = await apiClient.get('/admin/products');
  return data.data.products;
};

export const updateProduct = async (id, updates) => {
  const { data } = await apiClient.put(`/products/${id}`, updates);
  return data.data.product;
};

export const createProduct = async (productData) => {
  const { data } = await apiClient.post('/products', productData);
  return data.data.product;
};

export const deleteProduct = async (id) => {
  const { data } = await apiClient.delete(`/products/${id}`);
  return data;
};
