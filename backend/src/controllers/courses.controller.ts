/**
 * File: courses.controller.ts
 *
 * Description: Manages course CRUD operations: listing with filters, detail with lessons, enrollment, progress tracking, and reviews.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/courses
 * List published courses with optional filters and pagination
 */
export const listCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const {
      category,
      difficulty_level,
      is_premium,
      sort = 'sort_order',
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (category) {
      query = query.eq('category', category as string);
    }

    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level as string);
    }

    if (is_premium !== undefined) {
      const premiumVal = is_premium === 'true';
      query = query.eq('is_premium', premiumVal);
    }

    // Sorting
    const sortField = sort as string;
    if (sortField === 'enrollment_count') {
      query = query.order('enrollment_count', { ascending: false });
    } else if (sortField === 'published_at') {
      query = query.order('published_at', { ascending: false });
    } else if (sortField === 'title') {
      query = query.order('title', { ascending: true });
    } else {
      query = query.order('sort_order', { ascending: true });
    }

    query = query.range(offset, offset + limitNum - 1);

    const { data: courses, error: queryError, count } = await query;

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(
      success({
        results: courses ?? [],
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count ?? 0,
          totalPages: count ? Math.ceil(count / limitNum) : 0,
        }
      })
    );
  } catch (err) {
    console.error('listCourses error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch courses', 500));
  }
};

/**
 * GET /api/courses/:id
 * Get a single course with its lessons
 */
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id } = req.params;

    // Fetch course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (courseError || !course) {
      res.status(404).json(error('NOT_FOUND', 'Course not found', 404));
      return;
    }

    // Fetch lessons ordered by lesson_number
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('lesson_number', { ascending: true });

    if (lessonsError) {
      res.status(500).json(error('QUERY_FAILED', lessonsError.message, 500));
      return;
    }

    // Check user enrollment status
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status, progress_percentage, lessons_completed, last_lesson_id')
      .eq('user_id', userId)
      .eq('course_id', id)
      .single();

    res.status(200).json(
      success({
        ...course,
        lessons: lessons ?? [],
        enrollment: enrollment ?? null,
      })
    );
  } catch (err) {
    console.error('getCourse error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch course', 500));
  }
};

/**
 * POST /api/courses/:id/enroll
 * Enroll the authenticated user in a course
 */
export const enrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: courseId } = req.params;

    // Verify course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, total_lessons, status')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      res.status(404).json(error('NOT_FOUND', 'Course not found', 404));
      return;
    }

    if (course.status !== 'published') {
      res.status(400).json(error('COURSE_NOT_AVAILABLE', 'Course is not available for enrollment', 400));
      return;
    }

    // Upsert enrollment (handles already-enrolled case gracefully)
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          status: 'active',
          total_lessons: course.total_lessons ?? 0,
          enrolled_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,course_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (enrollError) {
      res.status(500).json(error('ENROLLMENT_FAILED', enrollError.message, 500));
      return;
    }

    // Atomically increment enrollment_count on the course
    await supabase.rpc('increment_counter', {
      p_table: 'courses',
      p_column: 'enrollment_count',
      p_id: courseId,
      p_delta: 1
    });

    res.status(201).json(success(enrollment));
  } catch (err) {
    console.error('enrollCourse error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to enroll in course', 500));
  }
};

/**
 * PATCH /api/courses/enrollments/:id/progress
 * Update enrollment progress
 */
export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: enrollmentId } = req.params;
    const { lessons_completed, last_lesson_id, progress_percentage } = req.body;

    // Verify enrollment belongs to user
    const { data: existingEnrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('id, user_id, total_lessons')
      .eq('id', enrollmentId)
      .single();

    if (fetchError || !existingEnrollment) {
      res.status(404).json(error('NOT_FOUND', 'Enrollment not found', 404));
      return;
    }

    if (existingEnrollment.user_id !== userId) {
      res.status(403).json(error('FORBIDDEN', 'You can only update your own enrollment', 403));
      return;
    }

    // Determine if course is completed
    const isCompleted =
      progress_percentage === 100 ||
      (existingEnrollment.total_lessons && lessons_completed >= existingEnrollment.total_lessons);

    const updateData: Record<string, unknown> = {
      lessons_completed,
      last_lesson_id,
      progress_percentage,
      last_accessed_at: new Date().toISOString(),
    };

    if (isCompleted) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    const { data: enrollment, error: updateError } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .select()
      .single();

    if (updateError) {
      res.status(500).json(error('UPDATE_FAILED', updateError.message, 500));
      return;
    }

    res.status(200).json(success(enrollment));
  } catch (err) {
    console.error('updateProgress error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to update progress', 500));
  }
};

/**
 * GET /api/courses/:id/reviews
 * List reviews for a course
 */
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: courseId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { data: reviews, error: queryError, count } = await supabase
      .from('course_reviews')
      .select(
        `
        id,
        user_id,
        course_id,
        rating,
        review_text,
        created_at,
        updated_at
      `,
        { count: 'exact' }
      )
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    // Fetch user names for the reviews
    const userIds = (reviews ?? []).map((r) => r.user_id);
    let usersMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);

      if (users) {
        usersMap = users.reduce<Record<string, string>>((acc, u) => {
          acc[u.id] = u.full_name ?? 'Anonymous';
          return acc;
        }, {});
      }
    }

    const reviewsWithUser = (reviews ?? []).map((review) => ({
      ...review,
      user_name: usersMap[review.user_id] ?? 'Anonymous',
    }));

    res.status(200).json(
      success(reviewsWithUser, {
        page: pageNum,
        limit: limitNum,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limitNum) : 0,
      })
    );
  } catch (err) {
    console.error('getReviews error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch reviews', 500));
  }
};

/**
 * POST /api/courses/:id/reviews
 * Submit a review for a course
 */
export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: courseId } = req.params;
    const { rating, review_text } = req.body;

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      res.status(404).json(error('NOT_FOUND', 'Course not found', 404));
      return;
    }

    // Upsert review (user can only have one review per course)
    const { data: review, error: reviewError } = await supabase
      .from('course_reviews')
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          rating,
          review_text: review_text ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,course_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (reviewError) {
      res.status(500).json(error('REVIEW_FAILED', reviewError.message, 500));
      return;
    }

    // Update course average rating aggregate
    const { data: ratingAgg } = await supabase
      .from('course_reviews')
      .select('rating')
      .eq('course_id', courseId);

    if (ratingAgg && ratingAgg.length > 0) {
      const avgRating =
        ratingAgg.reduce((sum, r) => sum + r.rating, 0) / ratingAgg.length;
      const roundedAvg = Math.round(avgRating * 10) / 10;

      await supabase
        .from('courses')
        .update({
          rating_average: roundedAvg,
          rating_count: ratingAgg.length,
        })
        .eq('id', courseId);
    }

    res.status(201).json(success(review));
  } catch (err) {
    console.error('submitReview error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to submit review', 500));
  }
};
