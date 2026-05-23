/**
 * File: habits.controller.test.ts
 *
 * Description: Unit tests for the habits controller. Covers retrieving habit streaks with heatmap
 * data, logging habit entries, and fetching per-habit streak statistics with defaults.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import {
  getAllHabits,
  logHabit,
  getStreak,
} from '../src/controllers/habits.controller';
import { supabase } from '../src/services/supabase.service';
import { streakService } from '../src/services/streak.service';

jest.mock('../src/services/supabase.service', () => {
  const chainable: Record<string, jest.Mock> = {
    from: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
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

jest.mock('../src/services/streak.service', () => ({
  streakService: {
    getUserStreaks: jest.fn(),
    calculateStreak: jest.fn(),
    getHabitStats: jest.fn(),
  },
}));

const db = supabase as unknown as Record<string, jest.Mock>;

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    user: { id: 'user-456' },
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

describe('Habits Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const key of Object.keys(db)) {
      db[key].mockReturnValue(db);
    }
  });

  // -----------------------------------------------------------------------
  // getAllHabits
  // -----------------------------------------------------------------------
  describe('getAllHabits', () => {
    it('returns 200 with streaks and heatmap data', async () => {
      const streaks = {
        meditation_current_streak: 7,
        meditation_longest_streak: 14,
        cold_shower_current_streak: 3,
        cold_shower_longest_streak: 10,
        early_wakeup_current_streak: 0,
        early_wakeup_longest_streak: 5,
        exercise_current_streak: 2,
        exercise_longest_streak: 8,
      };

      const habitLogs = [
        {
          id: 'h1',
          habit_type: 'meditation',
          completed: true,
          duration_minutes: 15,
          mood_rating: 4,
          energy_level: 3,
          logged_at: '2026-04-01T00:00:00.000Z',
        },
        {
          id: 'h2',
          habit_type: 'cold_shower',
          completed: true,
          duration_minutes: 5,
          mood_rating: 5,
          energy_level: 5,
          logged_at: '2026-04-02T00:00:00.000Z',
        },
      ];

      (streakService.getUserStreaks as jest.Mock).mockResolvedValueOnce(streaks);

      // The habit_logs query ends with .order(), which is the awaited call
      db.order.mockResolvedValueOnce({ data: habitLogs, error: null });

      const req = mockReq();
      const res = mockRes();

      await getAllHabits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            streaks,
            heatmap: expect.objectContaining({
              meditation: expect.arrayContaining([
                expect.objectContaining({ date: '2026-04-01T00:00:00.000Z', completed: true }),
              ]),
              cold_shower: expect.arrayContaining([
                expect.objectContaining({ date: '2026-04-02T00:00:00.000Z', completed: true }),
              ]),
            }),
          }),
        })
      );

      expect(streakService.getUserStreaks).toHaveBeenCalledWith('user-456');
      expect(db.from).toHaveBeenCalledWith('habit_logs');
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await getAllHabits(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it('returns 500 when habit logs query fails', async () => {
      (streakService.getUserStreaks as jest.Mock).mockResolvedValueOnce(null);
      db.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'db connection lost' },
      });

      const req = mockReq();
      const res = mockRes();

      await getAllHabits(req, res);

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
  // logHabit
  // -----------------------------------------------------------------------
  describe('logHabit', () => {
    it('inserts a habit log and returns 201', async () => {
      const savedLog = {
        id: 'h1',
        user_id: 'user-456',
        habit_type: 'meditation',
        completed: true,
        duration_minutes: 20,
        mood_rating: 4,
        energy_level: 3,
        notes: null,
        logged_at: '2026-04-05T00:00:00.000Z',
      };

      db.single.mockResolvedValueOnce({ data: savedLog, error: null });

      const req = mockReq({
        body: {
          habit_type: 'meditation',
          completed: true,
          duration_minutes: 20,
          mood_rating: 4,
          energy_level: 3,
        },
      });
      const res = mockRes();

      await logHabit(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'h1',
            habit_type: 'meditation',
            completed: true,
            duration_minutes: 20,
          }),
        })
      );

      // Verify upsert was called with the right conflict key
      expect(db.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-456',
          habit_type: 'meditation',
          completed: true,
        }),
        expect.objectContaining({ onConflict: 'user_id,habit_type,logged_at' })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await logHabit(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 500 when the upsert fails', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'constraint violation' },
      });

      const req = mockReq({ body: { habit_type: 'meditation' } });
      const res = mockRes();

      await logHabit(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'LOG_FAILED' }),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // getStreak
  // -----------------------------------------------------------------------
  describe('getStreak', () => {
    it('returns 200 with streak count and stats', async () => {
      const streak = { current_streak: 12, longest_streak: 30 };
      const stats = {
        current_streak: 12,
        longest_streak: 30,
        total_days: 45,
        completion_rate: 0.75,
        days_this_week: 5,
        days_this_month: 20,
      };

      (streakService.calculateStreak as jest.Mock).mockResolvedValueOnce(streak);
      (streakService.getHabitStats as jest.Mock).mockResolvedValueOnce(stats);

      const req = mockReq({ query: { habit_type: 'meditation' } });
      const res = mockRes();

      await getStreak(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            habit_type: 'meditation',
            streak: expect.objectContaining({
              current_streak: 12,
              longest_streak: 30,
            }),
            stats: expect.objectContaining({
              total_days: 45,
              completion_rate: 0.75,
            }),
          }),
        })
      );

      expect(streakService.calculateStreak).toHaveBeenCalledWith('user-456', 'meditation');
      expect(streakService.getHabitStats).toHaveBeenCalledWith('user-456', 'meditation', 30);
    });

    it('defaults to meditation habit type when none is provided', async () => {
      (streakService.calculateStreak as jest.Mock).mockResolvedValueOnce(null);
      (streakService.getHabitStats as jest.Mock).mockResolvedValueOnce(null);

      const req = mockReq({ query: {} });
      const res = mockRes();

      await getStreak(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            habit_type: 'meditation',
            streak: { current_streak: 0, longest_streak: 0 },
            stats: null,
          }),
        })
      );

      expect(streakService.calculateStreak).toHaveBeenCalledWith('user-456', 'meditation');
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await getStreak(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
