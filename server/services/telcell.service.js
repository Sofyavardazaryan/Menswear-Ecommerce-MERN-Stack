/**
 * Telcell Wallet — Armenian Mobile Payment Gateway
 *
 * Flow:
 *   1. Call initiatePayment via API → receive payment_url
 *   2. Redirect user to payment_url
 *   3. Telcell sends a server-to-server POST callback to /api/payment/callback/telcell
 *   4. verifyCallback validates HMAC-SHA256 signature and returns result
 *   5. Optionally call verifyPayment to check status by payment_id
 *
 * Environment variables required:
 *   TELCELL_SHOP_ID     — merchant shop ID
 *   TELCELL_SECRET_KEY  — HMAC secret
 *   TELCELL_API_URL     — API base URL
 */
import crypto from 'crypto';
import axios from 'axios';
import AppError from '../utils/AppError.js';

const API_URL = () => process.env.TELCELL_API_URL || 'https://telcell.am/paymentgateway/api';
const SHOP_ID = () => process.env.TELCELL_SHOP_ID;
const SECRET_KEY = () => process.env.TELCELL_SECRET_KEY;

const assertConfigured = () => {
  if (!process.env.TELCELL_SHOP_ID || !process.env.TELCELL_SECRET_KEY) {
    throw new AppError('Telcell payment gateway is not configured', 500);
  }
};

/**
 * Telcell signature: HMAC-SHA256 of sorted key=value pairs joined with '&'
 */
const buildSignature = (params) => {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHmac('sha256', SECRET_KEY()).update(payload).digest('hex');
};

export const initiatePayment = async ({ orderId, amount, description, returnUrl, failUrl }) => {
  assertConfigured();

  const params = {
    shop_id: SHOP_ID(),
    amount: parseFloat(amount).toFixed(2),
    currency: 'AMD',
    product: description || `Order ${orderId}`,
    order: orderId,
    valid_days: 1,
    lang: 'am',
    success_url: returnUrl,
    fail_url: failUrl,
  };
  params.checksum = buildSignature(params);

  try {
    const { data } = await axios.post(`${API_URL()}/payment/create`, params);
    if (!data.success) {
      throw new AppError(`Telcell error: ${data.message || 'Unknown error'}`, 400);
    }
    return {
      paymentUrl: data.payment_url,
      providerOrderId: data.payment_id,
    };
  } catch (err) {
    if (err.isOperational) throw err;
    throw new AppError(`Telcell initiation failed: ${err.message}`, 502);
  }
};

/**
 * Verifies Telcell's server-to-server POST callback.
 */
export const verifyCallback = (body) => {
  assertConfigured();

  const { order, payment_id, amount, currency, status, checksum } = body;

  const verifyParams = { order, payment_id, amount, currency, status };
  const expected = buildSignature(verifyParams);

  const isValid = expected === checksum;

  return {
    success: isValid && status === 'success',
    orderId: order,
    transactionId: payment_id,
    amount,
  };
};

/**
 * Active status poll — checks payment status by Telcell payment_id.
 */
export const verifyPayment = async (paymentId) => {
  assertConfigured();

  const params = { shop_id: SHOP_ID(), payment_id: paymentId };
  params.checksum = buildSignature(params);

  try {
    const { data } = await axios.post(`${API_URL()}/payment/status`, params);
    return {
      success: data.status === 'success',
      transactionId: paymentId,
      rawResponse: data,
    };
  } catch (err) {
    throw new AppError(`Telcell status check failed: ${err.message}`, 502);
  }
};
