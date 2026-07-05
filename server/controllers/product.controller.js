import asyncHandler from '../utils/asyncHandler.js';
import * as productService from '../services/product.service.js';

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json({ status: 'success', data: result });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  res.status(200).json({ status: 'success', data: { product } });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ status: 'success', data: { product } });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { product } });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ status: 'success', message: 'Product deleted' });
});
