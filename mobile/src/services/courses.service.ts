/**
 * File: courses.service.ts
 *
 * Description: Provides service methods for fetching, enrolling in, and managing
 * meditation courses. Handles course listing, detail retrieval, progress tracking,
 * and lesson completion status for the mobile app.
 *
 * Author: Navnit(Ninjacode911)
 */

import { get, post, patch } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty_level: string;
  thumbnail_url?: string;
  is_premium: boolean;
  total_lessons: number;
  duration_minutes: number;
  rating_average: number;
  rating_count: number;
  enrollment_count: number;
  instructor_id: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  lesson_number: number;
  title: string;
  description?: string;
  duration_minutes: number;
  media_url?: string;
  is_free_preview: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'dropped';
  progress_percentage: number;
  lessons_completed: number;
  total_lessons: number;
  last_lesson_id?: string;
}

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review_text?: string;
  user_name?: string;
  created_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

/**
 * List published courses with optional filters and pagination
 * GET /api/courses
 */
export async function listCourses(filters?: {
  category?: string;
  difficulty_level?: string;
  is_premium?: boolean;
  sort?: 'sort_order' | 'enrollment_count' | 'published_at' | 'title';
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<Course>> {
  // Use `params` for query string configuration in axios
  return get<PaginatedResult<Course>>('/courses', { params: filters });
}

/**
 * Get a single course with its lessons and user's enrollment status
 * GET /api/courses/:id
 */
export async function getCourse(id: string): Promise<Course & { lessons: Lesson[]; enrollment: Enrollment | null }> {
  return get<Course & { lessons: Lesson[]; enrollment: Enrollment | null }>(`/courses/${id}`);
}

/**
 * Enroll the authenticated user in a course
 * POST /api/courses/:id/enroll
 */
export async function enrollCourse(id: string): Promise<Enrollment> {
  return post<Enrollment>(`/courses/${id}/enroll`);
}

/**
 * Update enrollment progress
 * PATCH /api/courses/enrollments/:id/progress
 */
export async function updateProgress(
  enrollmentId: string,
  data: {
    lessons_completed: number;
    last_lesson_id?: string;
    progress_percentage: number;
  }
): Promise<Enrollment> {
  return patch<Enrollment>(`/courses/enrollments/${enrollmentId}/progress`, data);
}

/**
 * List reviews for a course
 * GET /api/courses/:id/reviews
 */
export async function getReviews(id: string, page: number = 1, limit: number = 20): Promise<PaginatedResult<CourseReview>> {
  return get<PaginatedResult<CourseReview>>(`/courses/${id}/reviews`, { params: { page, limit } });
}

/**
 * Submit a review for a course
 * POST /api/courses/:id/reviews
 */
export async function submitReview(id: string, rating: number, reviewText?: string): Promise<CourseReview> {
  return post<CourseReview>(`/courses/${id}/reviews`, { rating, review_text: reviewText });
}
