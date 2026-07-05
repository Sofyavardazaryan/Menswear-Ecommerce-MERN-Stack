/**
 * Format a price in AMD (Armenian Dram).
 * e.g. 18500 → "18,500 ֏"
 */
export const formatPrice = (amount, currency = 'AMD') => {
  if (typeof amount !== 'number' || isNaN(amount)) return '—';

  const formatted = new Intl.NumberFormat('hy-AM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const symbols = { AMD: '֏', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || currency;

  return `${formatted} ${symbol}`;
};

/**
 * Format a date string to a human-readable Armenian/EN date.
 * e.g. "2026-02-26T10:30:00Z" → "Feb 26, 2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Capitalize the first letter of a string.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Calculate discount percentage.
 * e.g. price=18500, compareAtPrice=22000 → "16% OFF"
 */
export const getDiscountPercent = (price, compareAtPrice) => {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const pct = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return `${pct}% OFF`;
};

/**
 * Truncate text to a max length with ellipsis.
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
};
