/**
 * ArCa / Local Bank vPOS — Armenian Card Payment Gateway
 *
 * Flow:
 *   1. Call initiatePayment → receive ArCa's formUrl + their orderId
 *   2. Redirect user to formUrl
 *   3. ArCa redirects user to our returnUrl with ?orderId=<arcaOrderId>
 *   4. Call verifyPayment with arcaOrderId to confirm status
 *
 * Environment variables required:
 *   ARCA_MERCHANT_ID  — merchant username
 *   ARCA_SECRET       — merchant password
 *   ARCA_API_URL      — e.g. https://ipay.arca.am/payment
 */
import axios from 'axios';
import AppError from '../utils/AppError.js';

const API_URL = () => process.env.ARCA_API_URL || 'https://ipay.arca.am/payment';
const credentials = () => ({
  userName: process.env.ARCA_MERCHANT_ID,
  password: process.env.ARCA_SECRET,
});

const assertConfigured = () => {
  if (!process.env.ARCA_MERCHANT_ID || !process.env.ARCA_SECRET) {
    throw new AppError('ArCa payment gateway is not configured', 500);
  }
};

export const initiatePayment = async ({
  orderId,
  amount,
  currency = 'AMD',
  description,
  returnUrl,
  failUrl,
}) => {
  assertConfigured();

  // ArCa expects amount in minor units (1 AMD = 100 luma)
  const amountMinor = Math.round(amount * 100);

  const params = {
    ...credentials(),
    orderNumber: orderId,           // our internalOrderId
    amount: amountMinor,
    currency: '051',                // AMD — ISO 4217 numeric code
    returnUrl,
    failUrl,
    description: description || "Edgers Men's Wear Purchase",
    language: 'am',
  };

  try {
    const { data } = await axios.post(`${API_URL()}/register.do`, null, { params });

    if (data.errorCode && data.errorCode !== '0') {
      throw new AppError(`ArCa error [${data.errorCode}]: ${data.errorMessage}`, 400);
    }

    return {
      paymentUrl: data.formUrl,
      providerOrderId: data.orderId, // ArCa's internal order ID
    };
  } catch (err) {
    if (err.isOperational) throw err;
    throw new AppError(`ArCa initiation failed: ${err.message}`, 502);
  }
};

export const verifyPayment = async (providerOrderId) => {
  assertConfigured();

  const params = {
    ...credentials(),
    orderId: providerOrderId,
    language: 'am',
  };

  try {
    const { data } = await axios.post(`${API_URL()}/getOrderStatus.do`, null, { params });

    if (data.errorCode && data.errorCode !== '0') {
      throw new AppError(`ArCa verification error [${data.errorCode}]: ${data.errorMessage}`, 400);
    }

    /*
     * ArCa orderStatus codes:
     *   0 — registered, not paid
     *   1 — pre-authorised
     *   2 — authorised (fully paid) ✓
     *   3 — cancelled
     *   4 — refunded
     *   6 — declined
     */
    return {
      success: data.orderStatus === 2,
      status: data.orderStatus,
      transactionId: data.authCode || providerOrderId,
      rawResponse: data,
    };
  } catch (err) {
    if (err.isOperational) throw err;
    throw new AppError(`ArCa verification failed: ${err.message}`, 502);
  }
};
