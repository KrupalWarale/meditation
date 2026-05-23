/**
 * File: payments.controller.test.ts
 *
 * Description: Unit tests for the payments controller. Validates order creation for monthly and
 * annual plans, payment verification with signature checks, and payment history retrieval.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
} from '../src/controllers/payments.controller';
import { supabase } from '../src/services/supabase.service';
import { paymentService } from '../src/services/payment.service';

jest.mock('../src/services/supabase.service', () => {
  const chainable: Record<string, jest.Mock> = {
    from: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
    insert: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    limit: jest.fn(),
    rpc: jest.fn(),
  };

  for (const key of Object.keys(chainable)) {
    chainable[key].mockReturnValue(chainable);
  }

  return { supabase: chainable };
});

jest.mock('../src/services/payment.service', () => ({
  paymentService: {
    createOrder: jest.fn(),
    processPayment: jest.fn(),
    verifySignature: jest.fn(),
  },
}));

const db = supabase as unknown as Record<string, jest.Mock>;

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    user: { id: 'user-789' },
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as unknown as Request);

const mockRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Payments Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const key of Object.keys(db)) {
      db[key].mockReturnValue(db);
    }
  });

  // -----------------------------------------------------------------------
  // createOrder
  // -----------------------------------------------------------------------
  describe('createOrder', () => {
    it('returns 201 with order details for monthly plan', async () => {
      const order = {
        order_id: 'order_abc123',
        amount: 19900,
        currency: 'INR',
        plan_type: 'monthly',
        payment_id: 'pay-1',
      };

      (paymentService.createOrder as jest.Mock).mockResolvedValueOnce(order);

      const req = mockReq({ body: { plan_type: 'monthly' } });
      const res = mockRes();

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            order_id: 'order_abc123',
            amount: 19900,
            currency: 'INR',
            plan_type: 'monthly',
          }),
        })
      );

      expect(paymentService.createOrder).toHaveBeenCalledWith('monthly', 'user-789');
    });

    it('returns 201 with order details for annual plan', async () => {
      const order = {
        order_id: 'order_xyz456',
        amount: 149900,
        currency: 'INR',
        plan_type: 'annual',
        payment_id: 'pay-2',
      };

      (paymentService.createOrder as jest.Mock).mockResolvedValueOnce(order);

      const req = mockReq({ body: { plan_type: 'annual' } });
      const res = mockRes();

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            order_id: 'order_xyz456',
            amount: 149900,
            currency: 'INR',
            plan_type: 'annual',
          }),
        })
      );

      expect(paymentService.createOrder).toHaveBeenCalledWith('annual', 'user-789');
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it('returns 500 when payment service throws', async () => {
      (paymentService.createOrder as jest.Mock).mockRejectedValueOnce(
        new Error('Gateway unavailable')
      );

      const req = mockReq({ body: { plan_type: 'monthly' } });
      const res = mockRes();

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'INTERNAL_SERVER_ERROR' }),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // verifyPayment
  // -----------------------------------------------------------------------
  describe('verifyPayment', () => {
    it('updates payment status and returns 200 with subscription', async () => {
      const pendingPayment = { plan_type: 'monthly' };
      const subscription = {
        id: 'sub-1',
        user_id: 'user-789',
        plan_type: 'monthly',
        status: 'active',
        current_period_start: '2026-04-05',
        current_period_end: '2026-05-05',
        expires_at: '2026-05-05',
      };

      // Lookup pending payment -> .single()
      db.single.mockResolvedValueOnce({ data: pendingPayment, error: null });

      // processPayment returns the subscription
      (paymentService.processPayment as jest.Mock).mockResolvedValueOnce(subscription);

      const req = mockReq({
        body: {
          gateway_order_id: 'order_abc',
          gateway_payment_id: 'pay_abc',
          gateway_signature: 'sig_abc',
        },
      });
      const res = mockRes();

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'sub-1',
            status: 'active',
            plan_type: 'monthly',
          }),
        })
      );

      expect(paymentService.processPayment).toHaveBeenCalledWith(
        'user-789',
        'order_abc',
        'pay_abc',
        'sig_abc',
        'monthly'
      );
    });

    it('returns 404 when no pending payment exists', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'not found', code: 'PGRST116' },
      });

      const req = mockReq({
        body: {
          gateway_order_id: 'order_fake',
          gateway_payment_id: 'pay_fake',
          gateway_signature: 'sig_fake',
        },
      });
      const res = mockRes();

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'PAYMENT_NOT_FOUND' }),
        })
      );
    });

    it('returns 400 when payment signature is invalid', async () => {
      const pendingPayment = { plan_type: 'monthly' };
      db.single.mockResolvedValueOnce({ data: pendingPayment, error: null });

      (paymentService.processPayment as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid payment signature')
      );

      const req = mockReq({
        body: {
          gateway_order_id: 'order_abc',
          gateway_payment_id: 'pay_abc',
          gateway_signature: 'bad_sig',
        },
      });
      const res = mockRes();

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'PAYMENT_VERIFICATION_FAILED' }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // -----------------------------------------------------------------------
  // getPaymentHistory
  // -----------------------------------------------------------------------
  describe('getPaymentHistory', () => {
    it("returns 200 with user's payment records", async () => {
      const payments = [
        {
          id: 'p1',
          gateway: 'razorpay',
          gateway_order_id: 'order_1',
          gateway_payment_id: 'pay_1',
          amount: 19900,
          currency: 'INR',
          amount_display: '₹199.00',
          status: 'captured',
          plan_type: 'monthly',
          created_at: '2026-03-01',
          updated_at: '2026-03-01',
        },
        {
          id: 'p2',
          gateway: 'razorpay',
          gateway_order_id: 'order_2',
          gateway_payment_id: null,
          amount: 149900,
          currency: 'INR',
          amount_display: '₹1499.00',
          status: 'pending',
          plan_type: 'annual',
          created_at: '2026-04-01',
          updated_at: '2026-04-01',
        },
      ];

      // The query chain ends at .order() for getPaymentHistory
      db.order.mockResolvedValueOnce({ data: payments, error: null });

      const req = mockReq();
      const res = mockRes();

      await getPaymentHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ id: 'p1', status: 'captured', amount: 19900 }),
            expect.objectContaining({ id: 'p2', status: 'pending', amount: 149900 }),
          ]),
        })
      );

      expect(db.from).toHaveBeenCalledWith('payments');
      expect(db.eq).toHaveBeenCalledWith('user_id', 'user-789');
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await getPaymentHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 500 when the query fails', async () => {
      db.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'timeout' },
      });

      const req = mockReq();
      const res = mockRes();

      await getPaymentHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'QUERY_FAILED' }),
        })
      );
    });
  });
});
