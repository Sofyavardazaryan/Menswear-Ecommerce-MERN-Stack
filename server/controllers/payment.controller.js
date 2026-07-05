import asyncHandler from '../utils/asyncHandler.js';
import * as paymentService from '../services/payment.service.js';
import * as orderService from '../services/order.service.js';
import * as productService from '../services/product.service.js';
import Order from '../models/Order.model.js';
import AppError from '../utils/AppError.js';

const CLIENT_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = () => process.env.SERVER_URL || 'http://localhost:5000';

/**
 * POST /api/payment/checkout
 *
 * 1. Validates cart items and recalculates total from DB (prevents price tampering)
 * 2. Creates a pending order
 * 3. Initiates payment session with selected provider
 * 4. Returns { paymentUrl, orderId, total } to client
 */
export const initiateCheckout = asyncHandler(async (req, res) => {
  const { cartItems, shippingInfo, paymentProvider } = req.body;

  if (!['arca', 'idram', 'telcell'].includes(paymentProvider)) {
    throw new AppError('Invalid payment provider', 400);
  }

  // Server-side price recalculation
  const { items, total } = await productService.validateCartItems(cartItems);

  // Create pending order before redirecting
  const order = await orderService.createPendingOrder({
    userId: req.user?._id || null,
    items,
    total,
    shippingInfo,
    paymentProvider,
  });

  // For ArCa: user is redirected to our server endpoint which then verifies & redirects to client
  // For Idram/Telcell: user goes directly to client result page; payment confirmed via server callback
  const arcaReturnUrl = `${SERVER_URL()}/api/payment/callback/arca?internalOrderId=${order.internalOrderId}`;
  const clientReturnUrl = `${CLIENT_URL()}/payment/result?orderId=${order._id}`;
  const failUrl = `${CLIENT_URL()}/payment/result?orderId=${order._id}&failed=1`;

  const { paymentUrl, providerOrderId } = await paymentService.initiatePayment(paymentProvider, {
    orderId: order.internalOrderId,
    amount: total,
    currency: 'AMD',
    description: `Edgers Men's Wear — Order ${order.internalOrderId}`,
    returnUrl: paymentProvider === 'arca' ? arcaReturnUrl : clientReturnUrl,
    failUrl,
  });

  if (providerOrderId) {
    await Order.findByIdAndUpdate(order._id, { providerOrderId });
  }

  res.status(200).json({
    status: 'success',
    data: {
      orderId: order._id,
      internalOrderId: order.internalOrderId,
      paymentUrl,
      total,
      currency: 'AMD',
    },
  });
});

/**
 * GET /api/payment/callback/arca
 *
 * ArCa redirects the user back here after payment.
 * We verify status server-side then redirect to client.
 */
export const handleArcaReturn = asyncHandler(async (req, res) => {
  const { internalOrderId, orderId: arcaOrderId } = req.query;

  let order;
  if (internalOrderId) {
    order = await Order.findOne({ internalOrderId });
  } else if (arcaOrderId) {
    order = await Order.findOne({ providerOrderId: arcaOrderId });
  }

  if (!order) {
    return res.redirect(`${CLIENT_URL()}/payment/result?failed=1&error=order_not_found`);
  }

  if (order.paymentStatus === 'paid') {
    return res.redirect(`${CLIENT_URL()}/payment/result?orderId=${order._id}`);
  }

  const providerRef = order.providerOrderId || arcaOrderId;
  if (!providerRef) {
    await orderService.failOrder(order._id.toString());
    return res.redirect(`${CLIENT_URL()}/payment/result?orderId=${order._id}&failed=1`);
  }

  const verification = await paymentService.verifyPaymentStatus('arca', providerRef);

  if (verification.success) {
    await orderService.confirmOrder(order._id.toString(), {
      transactionId: verification.transactionId,
      providerOrderId: providerRef,
    });
    return res.redirect(`${CLIENT_URL()}/payment/result?orderId=${order._id}`);
  }

  await orderService.failOrder(order._id.toString());
  return res.redirect(`${CLIENT_URL()}/payment/result?orderId=${order._id}&failed=1`);
});

/**
 * POST /api/payment/callback/idram
 *
 * Idram server-to-server callback.
 * Must respond with plain text "OK" on success, "FAIL" otherwise.
 */
export const handleIdramCallback = asyncHandler(async (req, res) => {
  const verification = paymentService.verifyProviderCallback('idram', req.body);

  if (!verification.success) {
    return res.status(400).send('FAIL');
  }

  const order = await Order.findOne({ internalOrderId: verification.orderId });
  if (!order) return res.status(404).send('NOT_FOUND');

  if (order.paymentStatus !== 'paid') {
    await orderService.confirmOrder(order._id.toString(), {
      transactionId: verification.transactionId,
      providerOrderId: verification.orderId,
    });
  }

  return res.status(200).send('OK');
});

/**
 * POST /api/payment/callback/telcell
 *
 * Telcell server-to-server callback.
 */
export const handleTelcellCallback = asyncHandler(async (req, res) => {
  const verification = paymentService.verifyProviderCallback('telcell', req.body);

  if (!verification.success) {
    return res.status(400).json({ status: 'fail', message: 'Invalid signature or payment failed' });
  }

  const order = await Order.findOne({ internalOrderId: verification.orderId });
  if (!order) throw new AppError('Order not found', 404);

  if (order.paymentStatus !== 'paid') {
    await orderService.confirmOrder(order._id.toString(), {
      transactionId: verification.transactionId,
      providerOrderId: verification.orderId,
    });
  }

  return res.status(200).json({ status: 'success' });
});

/**
 * GET /api/payment/status/:orderId
 *
 * Client polls this to check if payment has been confirmed.
 * Used by PaymentRedirectHandler on the frontend.
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).select(
    'paymentStatus orderStatus internalOrderId totalAmount currency paidAt'
  );
  if (!order) throw new AppError('Order not found', 404);

  res.status(200).json({
    status: 'success',
    data: {
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      internalOrderId: order.internalOrderId,
      totalAmount: order.totalAmount,
      currency: order.currency,
      paidAt: order.paidAt,
    },
  });
});
