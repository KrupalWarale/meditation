/**
 * File: payments.service.ts
 *
 * Description: Handles subscription and payment processing for the mobile app.
 * Provides methods for initiating purchases, verifying receipts, managing subscription
 * tiers, and checking active subscription status through the payment gateway.
 *
 * Author: Navnit(Ninjacode911)
 */

import { get, post } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'monthly' | 'annual';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface PaymentHistoryItem {
  id: string;
  gateway: string;
  gateway_order_id: string;
  gateway_payment_id?: string;
  amount: number;
  currency: string;
  amount_display: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  plan_type: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

/**
 * Create a new payment order for a subscription plan
 * POST /api/payments/create-order
 */
export async function createOrder(planType: 'monthly' | 'annual'): Promise<PaymentOrder> {
  return post<PaymentOrder>('/payments/create-order', { plan_type: planType });
}

/**
 * Verify a Razorpay payment and activate the subscription
 * POST /api/payments/verify
 */
export async function verifyPayment(data: {
  gateway_order_id: string;
  gateway_payment_id: string;
  gateway_signature: string;
}): Promise<Subscription> {
  return post<Subscription>('/payments/verify', data);
}

/**
 * Fetch the authenticated user's payment history
 * GET /api/payments/history
 */
export async function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
  return get<PaymentHistoryItem[]>('/payments/history');
}
