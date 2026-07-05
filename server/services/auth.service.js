import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const registerUser = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email is already registered', 400);

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  return { user: user.toSafeObject(), token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id);
  return { user: user.toSafeObject(), token };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user.toSafeObject();
};

export const updateUserProfile = async (userId, updates) => {
  const ALLOWED = ['name', 'address'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => ALLOWED.includes(k))
  );

  const user = await User.findByIdAndUpdate(userId, filtered, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user.toSafeObject();
};
