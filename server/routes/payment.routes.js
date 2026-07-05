import { Router } from 'express';
import {
  initiateCheckout,
  handleArcaReturn,
  handleIdramCallback,
  handleTelcellCallback,
  getPaymentStatus,
} from '../controllers/payment.controller.js';

const router = Router();

// Client-initiated checkout — optional auth (guest checkout supported)
router.post('/checkout', initiateCheckout);

// Payment status poll — used by frontend PaymentRedirectHandler
router.get('/status/:orderId', getPaymentStatus);

// Provider callbacks — NO auth middleware (called by external payment systems)
router.get('/callback/arca', handleArcaReturn);
router.post('/callback/idram', handleIdramCallback);
router.post('/callback/telcell', handleTelcellCallback);

export default router;
