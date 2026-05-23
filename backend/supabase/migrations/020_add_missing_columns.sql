-- =====================================================
-- Migration 020: Add missing columns and atomic increment functions
-- Adds columns referenced by controllers but missing from schema
-- =====================================================

-- Add missing columns to courses table
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_average NUMERIC(3,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- =====================================================
-- Atomic increment function for safe concurrent updates
-- Avoids race conditions from read-modify-write patterns
-- =====================================================

CREATE OR REPLACE FUNCTION increment_counter(
  p_table TEXT,
  p_column TEXT,
  p_id UUID,
  p_delta INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = COALESCE(%I, 0) + $1 WHERE id = $2',
    p_table, p_column, p_column
  ) USING p_delta, p_id;
END;
$$;

-- =====================================================
-- Fix SECURITY DEFINER functions: add SET search_path
-- Recreate functions from migration 016 with proper search_path
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_streak(
  p_user_id UUID,
  p_habit_type TEXT DEFAULT 'meditation'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_entry BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM habit_logs
      WHERE user_id = p_user_id
        AND habit_type = p_habit_type
        AND log_date = check_date
        AND is_completed = true
    ) INTO has_entry;

    IF NOT has_entry THEN
      IF check_date = CURRENT_DATE THEN
        check_date := check_date - 1;
        CONTINUE;
      ELSE
        EXIT;
      END IF;
    END IF;

    streak := streak + 1;
    check_date := check_date - 1;
  END LOOP;

  RETURN streak;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_streaks(p_user_id UUID)
RETURNS TABLE(habit_type TEXT, current_streak INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT hl.habit_type::TEXT, calculate_streak(p_user_id, hl.habit_type)::INTEGER
  FROM habit_logs hl
  WHERE hl.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_habit_stats(
  p_user_id UUID,
  p_habit_type TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  total_completed BIGINT,
  total_days BIGINT,
  completion_rate NUMERIC,
  current_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE hl.is_completed = true) AS total_completed,
    COUNT(DISTINCT hl.log_date) AS total_days,
    ROUND(
      (COUNT(*) FILTER (WHERE hl.is_completed = true))::NUMERIC /
      GREATEST(p_days, 1) * 100, 1
    ) AS completion_rate,
    calculate_streak(p_user_id, p_habit_type) AS current_streak
  FROM habit_logs hl
  WHERE hl.user_id = p_user_id
    AND hl.habit_type = p_habit_type
    AND hl.log_date >= CURRENT_DATE - p_days;
END;
$$;
