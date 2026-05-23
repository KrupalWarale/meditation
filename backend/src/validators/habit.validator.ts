/**
 * File: habit.validator.ts
 *
 * Description: Zod validation schemas for habit tracking endpoints. Validates habit log entries
 * with supported habit types (meditation, cold shower, early wakeup, exercise), optional
 * duration and mood/energy ratings, and daily performance rating submissions.
 *
 * Author: Navnit(Ninjacode911)
 */

import { z } from 'zod';

export const logHabitSchema = z.object({
  habit_type: z.enum(['meditation', 'cold_shower', 'early_wakeup', 'exercise'], {
    message: 'Habit type is required',
  }),
  completed: z.boolean().default(true),
  duration_minutes: z.number().int().positive().optional(),
  mood_rating: z.number().int().min(1).max(10).optional(),
  energy_level: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export const ratePerformanceSchema = z.object({
  productivity_rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  notes: z.string().max(1000).optional(),
});
