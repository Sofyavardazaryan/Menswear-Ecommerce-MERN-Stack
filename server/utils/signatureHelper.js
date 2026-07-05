import crypto from 'crypto';

export const hmacSha256Hex = (data, secret) =>
  crypto.createHmac('sha256', secret).update(data).digest('hex');

export const hmacMd5Hex = (data, secret) =>
  crypto.createHmac('md5', secret).update(data).digest('hex');

export const md5Hex = (data) =>
  crypto.createHash('md5').update(data).digest('hex');

/**
 * Constant-time comparison to prevent timing attacks on signature verification.
 */
export const safeCompare = (a, b) => {
  const bufA = Buffer.from(String(a).toLowerCase(), 'hex');
  const bufB = Buffer.from(String(b).toLowerCase(), 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Generates a unique internal order ID.
 * Format: EDG-<timestamp>-<random6>
 */
export const generateOrderRef = () =>
  `EDG-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
