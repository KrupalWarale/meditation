/**
 * File: courses.routes.ts
 *
 * Description: Defines API routes for the courses module including listing, enrollment,
 * progress tracking, and reviews. All routes require authentication via JWT token middleware.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Router } from 'express';
import {
  listCourses,
  getCourse,
  enrollCourse,
  updateProgress,
  getReviews,
  submitReview,
} from '../controllers/courses.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { createReviewSchema, updateProgressSchema } from '../validators/course.validator';

const router = Router();

// GET /api/courses — list published courses with filters
router.get('/', authenticateToken, listCourses);

// GET /api/courses/:id — get a single course with lessons
router.get('/:id', authenticateToken, getCourse);

// POST /api/courses/:id/enroll — enroll in a course
router.post('/:id/enroll', authenticateToken, enrollCourse);

// PATCH /api/courses/enrollments/:id/progress — update enrollment progress
router.patch('/enrollments/:id/progress', authenticateToken, validate(updateProgressSchema), updateProgress);

// GET /api/courses/:id/reviews — list reviews for a course
router.get('/:id/reviews', authenticateToken, getReviews);

// POST /api/courses/:id/reviews — submit a review for a course
router.post('/:id/reviews', authenticateToken, validate(createReviewSchema), submitReview);

export default router;
