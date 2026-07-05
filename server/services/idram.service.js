/**
 * Idram — Armenian E-Wallet Payment
 *
 * Flow:
 *   1. Call initiatePayment → build redirect URL with signed params
 *   2. Redirect user to Idram's payment page
 *   3. Idram sends a server-to-server POST callback to /api/payment/callback/idram
 *   4. verifyCallback validates HMAC-MD5 signature and returns result
 *   5. User is separately redirected to client returnUrl by Idram
 *
 * Environment variables required:
 *   IDRAM_ACCOUNT_ID   — merchant account number
 *   IDRAM_SECRET_KEY   — HMAC secret
 *   IDRAM_API_URL      — Idram payment page URL
 */
import crypto from 'crypto';
import AppError from '../utils/AppError.js';

const PAYMENT_URL = () => process.env.IDRAM_API_URL || 'https://idram.am/payment';
const ACCOUNT_ID = () => process.env.IDRAM_ACCOUNT_ID;
const SECRET_KEY = () => process.env.IDRAM_SECRET_KEY;

const assertConfigured = () => {
  if (!process.env.IDRAM_ACCOUNT_ID || !process.env.IDRAM_SECRET_KEY) {
    throw new AppError('Idram payment gateway is not configured', 500);
  }
};

const buildHmacMd5 = (data, secret) =>
  crypto.createHmac('md5', secret).update(data).digest('hex').toUpperCase();

export const initiatePayment = async ({ orderId, amount, description, returnUrl }) => {
  assertConfigured();

  const amountFormatted = parseFloat(amount).toFixed(2);

  // Signature = HMAC-MD5( SECRET_KEY + ACCOUNT_ID + AMOUNT + BILL_NO )
  const sigData = `${SECRET_KEY()}${ACCOUNT_ID()}${amountFormatted}${orderId}`;
  const checksum = buildHmacMd5(sigData, SECRET_KEY());

  const params = new URLSearchParams({
    EDP_LANGUAGE: 'AM',
    EDP_REC_ACCOUNT: ACCOUNT_ID(),
    EDP_AMOUNT: amountFormatted,
    EDP_BILL_NO: orderId,
    EDP_DESCRIPTION: description || "Edgers Men's Wear Order",
    EDP_CHECKSUM: checksum,
    EDP_BILL_RETURN_URL: returnUrl,
  });

  return {
    paymentUrl: `${PAYMENT_URL()}?${params.toString()}`,
    providerOrderId: orderId, // Idram uses our orderId as reference
  };
};

/**
 * Verifies Idram's server-to-server POST callback.
 * Returns { success, orderId, transactionId, amount }
 */
export const verifyCallback = (body) => {
  assertConfigured();

  const { EDP_PAYER_ACCOUNT, EDP_AMOUNT, EDP_BILL_NO, EDP_CHECKSUM } = body;

  if (!EDP_CHECKSUM || !EDP_BILL_NO) {
    throw new AppError('Idram callback missing required fields', 400);
  }

  // Signature = HMAC-MD5( SECRET_KEY + ACCOUNT_ID + AMOUNT + BILL_NO + PAYER_ACCOUNT )
  const sigData = `${SECRET_KEY()}${ACCOUNT_ID()}${parseFloat(EDP_AMOUNT).toFixed(2)}${EDP_BILL_NO}${EDP_PAYER_ACCOUNT}`;
  const expected = buildHmacMd5(sigData, SECRET_KEY());

  const isValid = expected === EDP_CHECKSUM?.toUpperCase();

  return {
    success: isValid,
    orderId: EDP_BILL_NO,
    transactionId: EDP_PAYER_ACCOUNT || EDP_BILL_NO,
    amount: EDP_AMOUNT,
  };
};
