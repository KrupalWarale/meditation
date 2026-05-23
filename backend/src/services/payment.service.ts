/**
 * File: payment.service.ts
 *
 * Description: Handles Razorpay payment order creation, signature verification (HMAC SHA256),
 * and subscription lifecycle management. Processes verified payments by updating records and
 * upserting user subscriptions with calculated billing periods.
 *
 * Author: Navnit(Ninjacode911)
 */

import crypto from 'crypto';
import { supabase } from './supabase.service';

interface OrderResult {
  order_id: string;
  amount: number;
  currency: string;
  plan_type: string;
  payment_id: string;
}

interface SubscriptionResult {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  expires_at: string;
}

type PlanType = 'monthly' | 'annual';

const PLAN_AMOUNTS: Record<PlanType, number> = {
  monthly: 19900,
  annual: 149900,
};

const PLAN_DAYS: Record<PlanType, number> = {
  monthly: 30,
  annual: 365,
};

/**
 * Generate a mock order ID for development
 */
const generateOrderId = (): string => {
  return `order_${crypto.randomBytes(12).toString('hex')}`;
};

export const paymentService = {
  /**
   * Create a new payment order
   * In production, this would call the Razorpay SDK to create an order
   */
  async createOrder(planType: PlanType, userId: string): Promise<OrderResult> {
    const amount = PLAN_AMOUNTS[planType];
    const orderId = generateOrderId();

    // Create a pending payment record
    // NOTE: amount_display is GENERATED ALWAYS in the DB — do not include it in the insert
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        gateway: 'razorpay',
        gateway_order_id: orderId,
        amount,
        currency: 'INR',
        status: 'pending',
        plan_type: planType,
      })
      .select('id')
      .single();

    if (paymentError) {
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    return {
      order_id: orderId,
      amount,
      currency: 'INR',
      plan_type: planType,
      payment_id: payment.id,
    };
  },

  /**
   * Verify Razorpay payment signature
   * In production: HMAC SHA256 verification with Razorpay secret
   * For development: validates presence of all required fields
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpaySecret) {
      // Production: HMAC SHA256 verification with timing-safe comparison
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(body)
        .digest('hex');

      try {
        return crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'hex'),
          Buffer.from(signature, 'hex')
        );
      } catch {
        return false;
      }
    }

    // Block in production if secret is not configured
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RAZORPAY_KEY_SECRET is not configured — cannot verify payments');
    }

    // Development only: validate all fields are present
    console.warn('[PaymentService] Signature verification bypassed in development mode');
    return orderId.length > 0 && paymentId.length > 0 && signature.length > 0;
  },

  /**
   * Process a verified payment: update payment record, create/update subscription
   */
  async processPayment(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string,
    planType: PlanType
  ): Promise<SubscriptionResult> {
    // Verify signature
    const isValid = this.verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update payment record to captured (only if still pending — prevents double-processing)
    const { data: capturedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        gateway_payment_id: paymentId,
        gateway_signature: signature,
        status: 'captured',
        updated_at: new Date().toISOString(),
      })
      .eq('gateway_order_id', orderId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .select('id')
      .single();

    if (updateError) {
      throw new Error(`Failed to update payment record: ${updateError.message}`);
    }

    // Calculate subscription period
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + PLAN_DAYS[planType]);

    // Upsert subscription (one active subscription per user)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          plan_type: planType === 'annual' ? 'yearly' : 'monthly',
          status: 'active',
          amount_cents: PLAN_AMOUNTS[planType],
          currency: 'INR',
          billing_cycle: planType === 'annual' ? 'yearly' : 'monthly',
          current_period_start: now.toISOString(),
          current_period_end: expiresAt.toISOString(),
          payment_method_id: capturedPayment?.id ?? null,
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          cancel_at_period_end: false,
          cancelled_at: null,
          cancellation_reason: null,
          updated_at: now.toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (subError) {
      throw new Error(`Failed to upsert subscription: ${subError.message}`);
    }

    return subscription as SubscriptionResult;
  },
};
