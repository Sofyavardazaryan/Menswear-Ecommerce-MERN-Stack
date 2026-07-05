import mongoose from 'mongoose';

const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '40', '41', '42', '43', '44', '45', '46', '48', '50', '52', '54', 'ONE SIZE'];
const VALID_CATEGORIES = ['shirts', 'pants', 'jackets', 'suits', 'accessories', 'shoes', 'other'];

const stockSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      enum: { values: VALID_SIZES, message: '{VALUE} is not a valid size' },
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: 'AMD',
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: VALID_CATEGORIES, message: '{VALUE} is not a valid category' },
    },
    sizes: [
      {
        type: String,
        enum: { values: VALID_SIZES, message: '{VALUE} is not a valid size' },
      },
    ],
    stock: [stockSchema],
    images: {
      type: [String],
      validate: [(arr) => arr.length > 0, 'At least one product image is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Auto-generate slug from name + timestamp to ensure uniqueness
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    const base = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    this.slug = `${base}-${Date.now()}`;
  }
  next();
});

productSchema.virtual('inStock').get(function () {
  return this.stock.some((s) => s.quantity > 0);
});

productSchema.virtual('totalStock').get(function () {
  return this.stock.reduce((sum, s) => sum + s.quantity, 0);
});

// Useful for admin bulk import: find by slug or ID
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
