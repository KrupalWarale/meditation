/**
 * File: events.controller.test.ts
 *
 * Description: Unit tests for the events controller. Validates event listing with registration
 * status, event registration with capacity checks, and stream URL retrieval for registered users.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import {
  listEvents,
  registerForEvent,
  getStreamUrl,
} from '../src/controllers/events.controller';
import { supabase } from '../src/services/supabase.service';

jest.mock('../src/services/supabase.service', () => {
  const chainable: Record<string, jest.Mock> = {
    from: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    neq: jest.fn(),
    gt: jest.fn(),
    in: jest.fn(),
    single: jest.fn(),
    insert: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    limit: jest.fn(),
    rpc: jest.fn(),
  };

  // Every chainable method returns the chain object so calls can be stacked
  for (const key of Object.keys(chainable)) {
    chainable[key].mockReturnValue(chainable);
  }

  return { supabase: chainable };
});

// Cast for convenience
const db = supabase as unknown as Record<string, jest.Mock>;

/** Helper: build a mock Express request */
const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    user: { id: 'test-user-id' },
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as unknown as Request);

/** Helper: build a mock Express response with spy methods */
const mockRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Events Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-establish chainability after clearAllMocks
    for (const key of Object.keys(db)) {
      db[key].mockReturnValue(db);
    }
  });

  // -----------------------------------------------------------------------
  // listEvents
  // -----------------------------------------------------------------------
  describe('listEvents', () => {
    it('returns upcoming events sorted by date with registration status', async () => {
      const events = [
        {
          id: 'event-1',
          title: 'Morning Satsang',
          event_date: '2026-04-10T06:00:00Z',
          status: 'upcoming',
          category: 'satsang',
        },
        {
          id: 'event-2',
          title: 'Evening Meditation',
          event_date: '2026-04-12T18:00:00Z',
          status: 'upcoming',
          category: 'meditation',
        },
      ];

      const registrations = [
        { event_id: 'event-1', status: 'registered' },
      ];

      // listEvents flow:
      // 1. from('events').select(*,{count}).gt().neq().order().range()
      //    -> range() is terminal
      // 2. from('event_registrations').select().eq('user_id').in('event_id').eq('status')
      //    -> last eq() is terminal
      //    eq is called twice in this chain: eq('user_id') then eq('status')
      //    The 2nd eq call needs to resolve.
      db.range.mockResolvedValueOnce({ data: events, error: null, count: 2 });

      // For the registration chain, eq is called twice:
      // #1 eq('user_id', userId) - returns db (chainable, in() follows)
      // #2 eq('status', 'registered') - terminal, needs to resolve
      db.eq
        .mockReturnValueOnce(db)  // #1 eq('user_id')
        .mockResolvedValueOnce({ data: registrations, error: null }); // #2 eq('status') - terminal

      const req = mockReq({ query: { page: '1', limit: '20' } });
      const res = mockRes();

      await listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              id: 'event-1',
              title: 'Morning Satsang',
              is_registered: true,
            }),
            expect.objectContaining({
              id: 'event-2',
              title: 'Evening Meditation',
              is_registered: false,
            }),
          ]),
          meta: expect.objectContaining({
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
          }),
        })
      );

      expect(db.from).toHaveBeenCalledWith('events');
      expect(db.neq).toHaveBeenCalledWith('status', 'cancelled');
      expect(db.order).toHaveBeenCalledWith('event_date', { ascending: true });
    });

    it('returns empty events list with proper pagination meta', async () => {
      db.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      // No events means no registration lookup (eventIds.length === 0)

      const req = mockReq({ query: {} });
      const res = mockRes();

      await listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
          meta: expect.objectContaining({
            total: 0,
            totalPages: 0,
          }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('returns 500 when the database query fails', async () => {
      db.range.mockResolvedValueOnce({
        data: null,
        error: { message: 'database error' },
        count: null,
      });

      const req = mockReq({ query: {} });
      const res = mockRes();

      await listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'QUERY_FAILED' }),
        })
      );
    });

    it('handles null registrations gracefully', async () => {
      const events = [
        {
          id: 'event-1',
          title: 'Yoga Retreat',
          event_date: '2026-05-01T09:00:00Z',
          status: 'upcoming',
        },
      ];

      db.range.mockResolvedValueOnce({ data: events, error: null, count: 1 });

      // Registration lookup returns null data
      db.eq
        .mockReturnValueOnce(db)
        .mockResolvedValueOnce({ data: null, error: null });

      const req = mockReq({ query: {} });
      const res = mockRes();

      await listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              id: 'event-1',
              is_registered: false,
            }),
          ]),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // registerForEvent
  // -----------------------------------------------------------------------
  describe('registerForEvent', () => {
    it('creates a registration record and returns 201', async () => {
      const event = {
        id: 'event-1',
        status: 'upcoming',
        max_participants: 100,
        registration_count: 50,
      };
      const registration = {
        id: 'reg-1',
        event_id: 'event-1',
        user_id: 'test-user-id',
        status: 'registered',
      };

      // registerForEvent flow:
      // 1. from('events').select().eq('id').single() -> single() terminal
      // 2. from('event_registrations').select('id').eq('event_id').eq('user_id').single()
      //    -> single() terminal (returns null = not registered yet)
      // 3. from('event_registrations').insert(...).select().single()
      //    -> single() terminal
      // 4. rpc('increment_counter', ...)
      db.single
        .mockResolvedValueOnce({ data: event, error: null })                    // event exists
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })     // no existing registration
        .mockResolvedValueOnce({ data: registration, error: null });             // insert registration

      db.rpc.mockResolvedValueOnce({ data: null, error: null });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await registerForEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'reg-1',
            event_id: 'event-1',
            user_id: 'test-user-id',
            status: 'registered',
          }),
        })
      );

      expect(db.from).toHaveBeenCalledWith('events');
      expect(db.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_id: 'event-1',
          user_id: 'test-user-id',
          status: 'registered',
        })
      );
      expect(db.rpc).toHaveBeenCalledWith('increment_counter', {
        p_table: 'events',
        p_column: 'registration_count',
        p_id: 'event-1',
        p_delta: 1,
      });
    });

    it('is idempotent and returns existing registration without duplicating', async () => {
      const event = {
        id: 'event-1',
        status: 'upcoming',
        max_participants: 100,
        registration_count: 51,
      };
      const existingRegistration = {
        id: 'reg-1',
        event_id: 'event-1',
        user_id: 'test-user-id',
        status: 'registered',
      };

      // 1. event lookup -> single()
      // 2. existing registration check -> single() (returns the existing record)
      db.single
        .mockResolvedValueOnce({ data: event, error: null })
        .mockResolvedValueOnce({ data: existingRegistration, error: null });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await registerForEvent(req, res);

      // Should return 200 (not 201) with the existing registration
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: 'reg-1' }),
        })
      );

      // Verify insert was NOT called (no duplicate)
      expect(db.insert).not.toHaveBeenCalled();
      // Verify RPC was NOT called (no counter increment)
      expect(db.rpc).not.toHaveBeenCalled();
    });

    it('returns 404 when event does not exist', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'not found' },
      });

      const req = mockReq({ params: { id: 'nonexistent' } });
      const res = mockRes();

      await registerForEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'NOT_FOUND' }),
        })
      );
    });

    it('returns 400 when event is cancelled', async () => {
      const event = {
        id: 'event-1',
        status: 'cancelled',
        max_participants: 100,
        registration_count: 30,
      };

      db.single.mockResolvedValueOnce({ data: event, error: null });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await registerForEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'EVENT_CANCELLED' }),
        })
      );
    });

    it('returns 400 when event has already completed', async () => {
      const event = {
        id: 'event-1',
        status: 'completed',
        max_participants: 50,
        registration_count: 50,
      };

      db.single.mockResolvedValueOnce({ data: event, error: null });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await registerForEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'EVENT_COMPLETED' }),
        })
      );
    });

    it('returns 400 when event is at maximum capacity', async () => {
      const event = {
        id: 'event-1',
        status: 'upcoming',
        max_participants: 100,
        registration_count: 100,
      };

      db.single.mockResolvedValueOnce({ data: event, error: null });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await registerForEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'EVENT_FULL' }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await registerForEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('returns 500 when registration insert fails', async () => {
      const event = {
        id: 'event-1',
        status: 'upcoming',
        max_participants: null,
        registration_count: 10,
      };

      db.single
        .mockResolvedValueOnce({ data: event, error: null })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'insert failed' } });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await registerForEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'REGISTRATION_FAILED' }),
        })
      );
    });

    it('allows registration when max_participants is null (unlimited)', async () => {
      const event = {
        id: 'event-1',
        status: 'upcoming',
        max_participants: null,
        registration_count: 5000,
      };
      const registration = {
        id: 'reg-2',
        event_id: 'event-1',
        user_id: 'test-user-id',
        status: 'registered',
      };

      db.single
        .mockResolvedValueOnce({ data: event, error: null })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: registration, error: null });

      db.rpc.mockResolvedValueOnce({ data: null, error: null });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await registerForEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: 'reg-2' }),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // getStreamUrl
  // -----------------------------------------------------------------------
  describe('getStreamUrl', () => {
    it('returns stream URL for registered users', async () => {
      const registration = { id: 'reg-1', status: 'registered' };
      const event = {
        id: 'event-1',
        title: 'Live Satsang',
        stream_url: 'https://stream.maa.org/live/satsang',
        recording_url: 'https://cdn.maa.org/recordings/satsang.mp4',
        is_live: true,
        status: 'live',
      };

      // getStreamUrl flow:
      // 1. from('event_registrations').select('id, status')
      //      .eq('event_id').eq('user_id').eq('status').single()
      //    -> single() terminal
      // 2. from('events').select('id, title, ...').eq('id').single()
      //    -> single() terminal
      db.single
        .mockResolvedValueOnce({ data: registration, error: null })
        .mockResolvedValueOnce({ data: event, error: null });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await getStreamUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            event_id: 'event-1',
            title: 'Live Satsang',
            stream_url: 'https://stream.maa.org/live/satsang',
            recording_url: 'https://cdn.maa.org/recordings/satsang.mp4',
            is_live: true,
            status: 'live',
          }),
        })
      );

      expect(db.from).toHaveBeenCalledWith('event_registrations');
      expect(db.eq).toHaveBeenCalledWith('event_id', 'event-1');
      expect(db.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(db.eq).toHaveBeenCalledWith('status', 'registered');
    });

    it('returns 403 for unregistered users', async () => {
      // Registration check returns no data (user not registered)
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'not found', code: 'PGRST116' },
      });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await getStreamUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_REGISTERED',
            message: 'You must be registered for this event to access the stream',
          }),
        })
      );
    });

    it('returns 404 when event does not exist but user is registered', async () => {
      const registration = { id: 'reg-1', status: 'registered' };

      db.single
        .mockResolvedValueOnce({ data: registration, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'not found' } });

      const req = mockReq({ params: { id: 'deleted-event' } });
      const res = mockRes();

      await getStreamUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'NOT_FOUND' }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await getStreamUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('returns null stream_url when event has no stream configured', async () => {
      const registration = { id: 'reg-1', status: 'registered' };
      const event = {
        id: 'event-1',
        title: 'Upcoming Retreat',
        stream_url: null,
        recording_url: null,
        is_live: false,
        status: 'upcoming',
      };

      db.single
        .mockResolvedValueOnce({ data: registration, error: null })
        .mockResolvedValueOnce({ data: event, error: null });

      const req = mockReq({ params: { id: 'event-1' } });
      const res = mockRes();

      await getStreamUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            event_id: 'event-1',
            stream_url: null,
            recording_url: null,
            is_live: false,
          }),
        })
      );
    });
  });
});
