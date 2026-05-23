/**
 * File: habits.routes.ts
 *
 * Description: Defines API routes for the habits and wellness tracking module. Covers habit logging,
 * streak tracking, daily check-ins, vision board management, day journey entries, and weekly
 * performance ratings. All routes require authentication.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Router } from 'express';
import {
  getAllHabits,
  logHabit,
  getStreak,
  checkin,
  getVisionBoard,
  addVisionBoard,
  removeVisionBoard,
  getDayJourney,
  ratePerformance,
  getWeeklyPerformance,
} from '../controllers/habits.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { logHabitSchema, ratePerformanceSchema } from '../validators/habit.validator';

const router = Router();

// GET /api/habits/all — get all habit streaks and heatmap data
router.get('/all', authenticateToken, getAllHabits);

// POST /api/habits/log — log a habit completion
router.post('/log', authenticateToken, validate(logHabitSchema), logHabit);

// GET /api/habits/streak — get streak for a specific habit type
router.get('/streak', authenticateToken, getStreak);

// POST /api/habits/checkin — manual daily check-in
router.post('/checkin', authenticateToken, checkin);

// GET /api/habits/vision-board — get user's vision board
router.get('/vision-board', authenticateToken, getVisionBoard);

// POST /api/habits/vision-board — add image to vision board
router.post('/vision-board', authenticateToken, addVisionBoard);

// DELETE /api/habits/vision-board/:id — remove image from vision board
router.delete('/vision-board/:id', authenticateToken, removeVisionBoard);

// GET /api/habits/day-journey — get active day journey entries
router.get('/day-journey', authenticateToken, getDayJourney);

// POST /api/habits/performance/rate — rate today's productivity
router.post('/performance/rate', authenticateToken, validate(ratePerformanceSchema), ratePerformance);

// GET /api/habits/performance/weekly — get last 7 days of ratings
router.get('/performance/weekly', authenticateToken, getWeeklyPerformance);

export default router;
