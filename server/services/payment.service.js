/**
 * Payment Service — provider-agnostic facade.
 * Routes initiation, callback verification, and status checks
 * to the correct provider service.
 */
import * as arcaService from './arca.service.js';
import * as idramService from './idram.service.js';
import * as telcellService from './telcell.service.js';
import AppError from '../utils/AppError.js';

const PROVIDERS = {
  arca: arcaService,
  idram: idramService,
  telcell: telcellService,
};

const getProvider = (name) => {
  const provider = PROVIDERS[name];
  if (!provider) throw new AppError(`Unsupported payment provider: ${name}`, 400);
  return provider;
};

/**
 * Initiates a payment session with the given provider.
 * Returns { paymentUrl, providerOrderId }
 */
export const initiatePayment = async (providerName, paymentData) => {
  const provider = getProvider(providerName);
  return provider.initiatePayment(paymentData);
};

/**
 * Verifies a server-to-server callback from Idram or Telcell.
 * Returns { success, orderId, transactionId, amount }
 */
export const verifyProviderCallback = (providerName, callbackData) => {
  const provider = getProvider(providerName);
  if (typeof provider.verifyCallback !== 'function') {
    throw new AppError(`Provider "${providerName}" does not support callback verification`, 400);
  }
  return provider.verifyCallback(callbackData);
};

/**
 * Actively verifies payment status (used for ArCa redirect return).
 * Returns { success, transactionId, rawResponse }
 */
export const verifyPaymentStatus = async (providerName, providerOrderId) => {
  const provider = getProvider(providerName);
  if (typeof provider.verifyPayment !== 'function') {
    throw new AppError(`Provider "${providerName}" does not support status verification`, 400);
  }
  return provider.verifyPayment(providerOrderId);
};
