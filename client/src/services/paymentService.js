import apiClient from './apiClient.js';

/**
 * Initiates checkout — sends cart + shipping info + provider to backend.
 * Backend recalculates total, creates pending order, returns payment URL.
 *
 * @param {Array}  cartItems       — [{ productId, size, quantity }]
 * @param {Object} shippingInfo    — { firstName, lastName, email, phone, addressLine1, city, country }
 * @param {string} paymentProvider — 'arca' | 'idram' | 'telcell'
 */
export const initiateCheckout = async ({ cartItems, shippingInfo, paymentProvider }) => {
  const { data } = await apiClient.post('/payment/checkout', {
    cartItems,
    shippingInfo,
    paymentProvider,
  });
  return data.data; // { orderId, internalOrderId, paymentUrl, total, currency }
};

/**
 * Poll backend for payment status.
 * Used by PaymentRedirectHandler after returning from provider.
 */
export const getPaymentStatus = async (orderId) => {
  const { data } = await apiClient.get(`/payment/status/${orderId}`);
  return data.data; // { paymentStatus, orderStatus, internalOrderId, totalAmount, currency, paidAt }
};
