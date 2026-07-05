import apiClient from './apiClient.js';

export const getProducts = async (params = {}) => {
  const { data } = await apiClient.get('/products', { params });
  return data.data; // { products, total, page, pages }
};

export const getProductBySlug = async (slug) => {
  const { data } = await apiClient.get(`/products/${slug}`);
  return data.data.product;
};
