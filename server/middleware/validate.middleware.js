import AppError from '../utils/AppError.js';

/**
 * Middleware factory — validates that all required fields exist and are non-empty.
 * Supports dot-notation for nested fields: 'shippingInfo.email'
 */
export const validateBody = (requiredFields) => (req, res, next) => {
  const missing = requiredFields.filter((field) => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], req.body);
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
  }

  next();
};
