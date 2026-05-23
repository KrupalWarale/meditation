/**
 * File: course.validator.ts
 *
 * Description: Zod validation schemas for course-related endpoints. Defines rules for course
 * filtering (category, difficulty, premium status), review creation with rating constraints,
 * and progress tracking with lesson completion data.
 *
 * Author: Navnit(Ninjacode911)
 */

import { z } from 'zod';

export const courseFiltersSchema = z.object({
  category: z.string().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  is_premium: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    },
    z.boolean().optional()
  ),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  review_text: z.string().max(2000, 'Review text must be under 2000 characters').optional(),
});

export const updateProgressSchema = z.object({
  lessons_completed: z.number().int().min(0, 'Lessons completed must be non-negative'),
  last_lesson_id: z.string().uuid('Invalid lesson ID'),
  progress_percentage: z.number().int().min(0).max(100, 'Progress must be between 0 and 100'),
});
