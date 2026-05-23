/**
 * File: session.validator.ts
 *
 * Description: Zod validation schema for meditation session creation. Validates duration,
 * session type (guided, unguided, breathing, body scan, loving kindness), optional lesson
 * reference, and optional before/after mood ratings with notes.
 *
 * Author: Navnit(Ninjacode911)
 */

import { z } from 'zod';

export const createSessionSchema = z.object({
  duration_minutes: z.number().positive('Duration must be greater than 0'),
  session_type: z
    .enum(['guided', 'unguided', 'free', 'breathing', 'body_scan', 'loving_kindness'])
    .default('guided'),
  lesson_id: z.string().uuid('Invalid lesson ID').optional(),
  mood_before: z.number().int().min(1).max(10).optional(),
  mood_after: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),
  started_at: z.string().datetime({ message: 'started_at must be ISO 8601' }).optional(),
  completed_at: z.string().datetime({ message: 'completed_at must be ISO 8601' }).optional(),
});
