/**
 * File: payments.routes.ts
 *
 * Description: Defines API routes for payment processing including order creation, payment
 * verification, and payment history retrieval. Applies rate limiting and validation to
 * protect against abuse.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentHistory } from '../controllers/payments.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator';
import { paymentRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// POST /api/payments/create-order — create a payment order for a plan
router.post('/create-order', authenticateToken, paymentRateLimiter, validate(createOrderSchema), createOrder);

// POST /api/payments/verify — verify payment and activate subscription
router.post('/verify', authenticateToken, paymentRateLimiter, validate(verifyPaymentSchema), verifyPayment);

// GET /api/payments/history — fetch user's payment history
router.get('/history', authenticateToken, getPaymentHistory);

export default router;
