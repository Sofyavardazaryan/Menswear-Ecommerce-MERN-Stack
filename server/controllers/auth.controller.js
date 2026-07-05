import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.registerUser({ name, email, password });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({ status: 'success', data: { user, token } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(200).json({ status: 'success', data: { user, token } });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user._id);
  res.status(200).json({ status: 'success', data: { user } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);
  res.status(200).json({ status: 'success', data: { user } });
});
