/**
 * File: payments.controller.ts
 *
 * Description: Handles payment endpoints: creating Razorpay orders, verifying payment signatures, activating subscriptions, and fetching payment history.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { paymentService } from '../services/payment.service';
import { success, error } from '../utils/apiResponse';

/**
 * POST /api/payments/create-order
 * Create a new payment order for a subscription plan
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { plan_type } = req.body;

    const order = await paymentService.createOrder(plan_type, userId);

    res.status(201).json(success(order));
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to create order', 500));
  }
};

/**
 * POST /api/payments/verify
 * Verify a Razorpay payment and activate the subscription
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { gateway_order_id, gateway_payment_id, gateway_signature } = req.body;

    // Look up the pending payment to get plan_type
    const { data: pendingPayment, error: lookupError } = await supabase
      .from('payments')
      .select('plan_type')
      .eq('gateway_order_id', gateway_order_id)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (lookupError || !pendingPayment) {
      res.status(404).json(error('PAYMENT_NOT_FOUND', 'No pending payment found for this order', 404));
      return;
    }

    const subscription = await paymentService.processPayment(
      userId,
      gateway_order_id,
      gateway_payment_id,
      gateway_signature,
      pendingPayment.plan_type as 'monthly' | 'annual'
    );

    res.status(200).json(success(subscription));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to verify payment';

    if (message === 'Invalid payment signature') {
      res.status(400).json(error('PAYMENT_VERIFICATION_FAILED', 'Payment verification failed. Please try again.', 400));
      return;
    }

    console.error('verifyPayment error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to verify payment', 500));
  }
};

/**
 * GET /api/payments/history
 * Fetch the authenticated user's payment history
 */
export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data: payments, error: queryError } = await supabase
      .from('payments')
      .select('id, gateway, gateway_order_id, gateway_payment_id, amount, currency, amount_display, status, plan_type, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(success(payments));
  } catch (err) {
    console.error('getPaymentHistory error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch payment history', 500));
  }
};
