import mongoose from 'mongoose';
import { generateOrderRef } from '../utils/signatureHelper.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true },
    imageUrl: { type: String, default: '' },
  },
  { _id: false }
);

const shippingInfoSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: 'Armenia' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // null for guest orders
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'Order must contain at least one item'],
    },
    // Server-calculated — never trusted from client
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'AMD',
      uppercase: true,
    },
    paymentProvider: {
      type: String,
      enum: ['arca', 'idram', 'telcell'],
      required: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    // Provider's own order/payment reference ID
    providerOrderId: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingInfo: {
      type: shippingInfoSchema,
      required: true,
    },
    // Stable human-readable reference (used as orderNumber for payment providers)
    internalOrderId: {
      type: String,
      unique: true,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (this.isNew && !this.internalOrderId) {
    this.internalOrderId = generateOrderRef();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
