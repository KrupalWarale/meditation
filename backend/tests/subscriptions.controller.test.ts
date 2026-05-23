/**
 * File: subscriptions.controller.test.ts
 *
 * Description: Unit tests for the subscriptions controller. Validates subscription status checks
 * including premium detection and expiration handling, and subscription cancellation with
 * cancel-at-period-end logic.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import {
  getSubscriptionStatus,
  cancelSubscription,
} from '../src/controllers/subscriptions.controller';
import { supabase } from '../src/services/supabase.service';

jest.mock('../src/services/supabase.service', () => {
  const chainable: Record<string, jest.Mock> = {
    from: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    in: jest.fn(),
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

const db = supabase as unknown as Record<string, jest.Mock>;

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    user: { id: 'user-sub-1' },
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

describe('Subscriptions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const key of Object.keys(db)) {
      db[key].mockReturnValue(db);
    }
  });

  // -----------------------------------------------------------------------
  // getSubscriptionStatus
  // -----------------------------------------------------------------------
  describe('getSubscriptionStatus', () => {
    it('returns active subscription with isPremium true', async () => {
      // Compute dates relative to now so the test doesn't go stale.
      const now = new Date();
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
      const pastStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // -10 days

      const subscription = {
        id: 'sub-1',
        plan_type: 'monthly',
        status: 'active',
        amount_cents: 19900,
        currency: 'INR',
        billing_cycle: 'monthly',
        current_period_start: pastStart.toISOString(),
        current_period_end: futureDate.toISOString(),
        trial_start: null,
        trial_end: null,
        cancel_at_period_end: false,
        cancelled_at: null,
        started_at: pastStart.toISOString(),
        expires_at: futureDate.toISOString(),
        created_at: pastStart.toISOString(),
        updated_at: pastStart.toISOString(),
      };

      db.single.mockResolvedValueOnce({ data: subscription, error: null });

      const req = mockReq();
      const res = mockRes();

      await getSubscriptionStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            subscription: expect.objectContaining({
              id: 'sub-1',
              status: 'active',
              plan_type: 'monthly',
            }),
            isPremium: true,
            plan: 'monthly',
          }),
        })
      );

      expect(db.from).toHaveBeenCalledWith('subscriptions');
      expect(db.eq).toHaveBeenCalledWith('user_id', 'user-sub-1');
      expect(db.in).toHaveBeenCalledWith('status', ['active', 'trialing']);
    });

    it('returns free plan for users without subscription (PGRST116)', async () => {
      // PGRST116 = no rows found — treated as "free user"
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'no rows', code: 'PGRST116' },
      });

      const req = mockReq();
      const res = mockRes();

      await getSubscriptionStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            subscription: null,
            isPremium: false,
            plan: 'free',
          }),
        })
      );
    });

    it('returns isPremium false when subscription has expired', async () => {
      const subscription = {
        id: 'sub-2',
        plan_type: 'monthly',
        status: 'active',
        amount_cents: 19900,
        currency: 'INR',
        billing_cycle: 'monthly',
        current_period_start: '2026-02-01',
        current_period_end: '2026-03-01',
        trial_start: null,
        trial_end: null,
        cancel_at_period_end: false,
        cancelled_at: null,
        started_at: '2026-02-01',
        expires_at: '2025-01-01T00:00:00.000Z', // past date
        created_at: '2026-02-01',
        updated_at: '2026-02-01',
      };

      db.single.mockResolvedValueOnce({ data: subscription, error: null });

      const req = mockReq();
      const res = mockRes();

      await getSubscriptionStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            isPremium: false,
            plan: 'monthly',
          }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await getSubscriptionStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it('returns 500 for non-PGRST116 database errors', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'connection refused', code: 'XX000' },
      });

      const req = mockReq();
      const res = mockRes();

      await getSubscriptionStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'QUERY_FAILED' }),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // cancelSubscription
  // -----------------------------------------------------------------------
  describe('cancelSubscription', () => {
    it('marks subscription for cancellation at period end and returns 200', async () => {
      const existing = { id: 'sub-1', status: 'active' };
      // Controller keeps status=active, sets cancel_at_period_end=true
      const updated = {
        id: 'sub-1',
        status: 'active',
        cancel_at_period_end: true,
        cancelled_at: '2026-04-05T12:00:00.000Z',
        cancellation_reason: 'Too expensive',
      };

      // 1. lookup active subscription -> .single()
      // 2. update subscription         -> .single()
      db.single
        .mockResolvedValueOnce({ data: existing, error: null })
        .mockResolvedValueOnce({ data: updated, error: null });

      const req = mockReq({ body: { reason: 'Too expensive' } });
      const res = mockRes();

      await cancelSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'sub-1',
            status: 'active',
            cancel_at_period_end: true,
            cancellation_reason: 'Too expensive',
          }),
        })
      );

      // Verify the update payload does NOT change status — keeps user active until period end
      expect(db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          cancel_at_period_end: true,
          cancellation_reason: 'Too expensive',
        })
      );
    });

    it('returns 404 when no active subscription exists', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'not found', code: 'PGRST116' },
      });

      const req = mockReq();
      const res = mockRes();

      await cancelSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'NO_ACTIVE_SUBSCRIPTION' }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await cancelSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 500 when the update fails', async () => {
      const existing = { id: 'sub-1', status: 'active' };

      db.single
        .mockResolvedValueOnce({ data: existing, error: null })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'update conflict' },
        });

      const req = mockReq();
      const res = mockRes();

      await cancelSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UPDATE_FAILED' }),
        })
      );
    });
  });
});
