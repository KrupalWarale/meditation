-- =====================================================
-- Performance Indexes
-- Optimizes queries for streak calculations and user data
-- =====================================================

-- =====================================================
-- HABIT LOGS INDEXES
-- =====================================================

-- Composite index for streak calculations
-- Covers: user_id, habit_type, logged_at (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_habit_date 
ON habit_logs (user_id, habit_type, logged_at DESC);

-- Individual indexes for flexibility
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id 
ON habit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_type 
ON habit_logs (habit_type);

CREATE INDEX IF NOT EXISTS idx_habit_logs_logged_at 
ON habit_logs (logged_at DESC);

-- =====================================================
-- MEDITATION SESSIONS INDEXES
-- =====================================================

-- User meditation sessions ordered by completion date
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_completed 
ON meditation_sessions (user_id, completed_at DESC) 
WHERE completed_at IS NOT NULL;

-- User sessions by status
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_status 
ON meditation_sessions (user_id, status);

-- =====================================================
-- USERS INDEXES
-- =====================================================

-- Email lookup (for authentication)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email 
ON users (email);

-- Phone lookup (if used for authentication)
CREATE INDEX IF NOT EXISTS idx_users_phone 
ON users (phone) 
WHERE phone IS NOT NULL;

-- =====================================================
-- ENROLLMENTS INDEXES
-- =====================================================

-- User enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id 
ON enrollments (user_id);

-- Course enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id 
ON enrollments (course_id);

-- User-course composite (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_user_course 
ON enrollments (user_id, course_id);

-- =====================================================
-- SUBSCRIPTIONS INDEXES
-- =====================================================

-- Active user subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON subscriptions (user_id, status) 
WHERE status = 'active';

-- Subscription expiry tracking
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at 
ON subscriptions (expires_at) 
WHERE expires_at IS NOT NULL;

-- =====================================================
-- NOTIFICATIONS INDEXES
-- =====================================================

-- User notifications ordered by creation date
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications (user_id, created_at DESC);

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications (user_id, read_at) 
WHERE read_at IS NULL;

-- =====================================================
-- EVENT REGISTRATIONS INDEXES
-- =====================================================

-- User event registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id 
ON event_registrations (user_id);

-- Event registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id 
ON event_registrations (event_id);

-- User-event composite (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_user_event 
ON event_registrations (user_id, event_id);

-- =====================================================
-- PERFORMANCE NOTES
-- =====================================================
-- 
-- These indexes optimize:
-- 1. Streak calculations (habit_logs queries)
-- 2. User data retrieval (RLS filtered queries)
-- 3. Authentication lookups (email/phone)
-- 4. Subscription status checks
-- 5. Notification queries
-- 
-- Index maintenance:
-- - PostgreSQL automatically maintains these indexes
-- - Monitor query performance with EXPLAIN ANALYZE
-- - Consider partial indexes for large tables with sparse data