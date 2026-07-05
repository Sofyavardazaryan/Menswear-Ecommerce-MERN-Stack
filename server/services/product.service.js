import Product from '../models/Product.model.js';
import AppError from '../utils/AppError.js';

export const getAllProducts = async (query = {}) => {
  const { category, featured, search, sort = '-createdAt', page = 1, limit = 12 } = query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return { products, total, page: pageNum, pages: Math.ceil(total / limitNum) };
};

export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, isActive: true });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const createProduct = async (data) => Product.create(data);

export const updateProduct = async (id, updates) => {
  const product = await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

/**
 * Validates cart items against live DB data.
 * Recalculates total server-side — prevents price tampering.
 * Returns validated items array and authoritative total.
 */
export const validateCartItems = async (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const validated = [];

  for (const item of cartItems) {
    const { productId, size, quantity } = item;

    if (!productId || !size || !quantity || quantity < 1) {
      throw new AppError('Invalid cart item: productId, size, and quantity are required', 400);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError(`Product not available: ${productId}`, 404);
    }

    const stockEntry = product.stock.find((s) => s.size === size);
    if (!stockEntry || stockEntry.quantity < quantity) {
      throw new AppError(
        `Insufficient stock for "${product.name}" (size: ${size}). Available: ${stockEntry?.quantity ?? 0}`,
        400
      );
    }

    validated.push({
      product: product._id,
      name: product.name,
      price: product.price, // authoritative price from DB
      quantity,
      size,
      imageUrl: product.images[0] || '',
    });
  }

  const total = validated.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items: validated, total };
};
