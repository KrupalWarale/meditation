-- =====================================================
-- Row Level Security (RLS) Policies
-- Ensures users can only access their own data
-- =====================================================

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Force RLS (no bypassing even for table owners)
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE habit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE enrollments FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- MEDITATION SESSIONS POLICIES
-- =====================================================

-- Users can view their own meditation sessions
CREATE POLICY "meditation_sessions_select_own" ON meditation_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own meditation sessions
CREATE POLICY "meditation_sessions_insert_own" ON meditation_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own meditation sessions
CREATE POLICY "meditation_sessions_update_own" ON meditation_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own meditation sessions
CREATE POLICY "meditation_sessions_delete_own" ON meditation_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HABIT LOGS POLICIES
-- =====================================================

-- Users can view their own habit logs
CREATE POLICY "habit_logs_select_own" ON habit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own habit logs
CREATE POLICY "habit_logs_insert_own" ON habit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own habit logs
CREATE POLICY "habit_logs_update_own" ON habit_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own habit logs
CREATE POLICY "habit_logs_delete_own" ON habit_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- ENROLLMENTS POLICIES
-- =====================================================

-- Users can view their own enrollments
CREATE POLICY "enrollments_select_own" ON enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own enrollments
CREATE POLICY "enrollments_insert_own" ON enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments
CREATE POLICY "enrollments_update_own" ON enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own enrollments
CREATE POLICY "enrollments_delete_own" ON enrollments
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- SUBSCRIPTIONS POLICIES
-- =====================================================

-- Users can view their own subscriptions
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "subscriptions_insert_own" ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (handled by service role)
-- No INSERT policy for users - notifications are created by system

-- =====================================================
-- PUBLIC TABLES (No RLS needed)
-- =====================================================
-- These tables are public and don't need RLS:
-- - courses
-- - lessons
-- - events
-- - daily_quotes
-- - content_directory

-- =====================================================
-- ADMIN ACCESS
-- =====================================================
-- Service role key bypasses all RLS policies
-- This allows backend operations and admin functions
-- Never expose service role key to frontend!