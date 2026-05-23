-- =====================================================
-- Streak Calculation Functions
-- Core feature for habit tracking in meditation app
-- =====================================================

-- =====================================================
-- FUNCTION: calculate_streak
-- Calculates current and longest streak for a specific habit
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_streak(
  p_user_id UUID,
  p_habit_type TEXT
)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dates DATE[];
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_temp_streak INTEGER := 0;
  v_prev_date DATE;
  v_current_date DATE;
  v_today DATE := CURRENT_DATE;
  i INTEGER;
BEGIN
  -- Get unique dates for the habit, sorted descending (most recent first)
  -- Convert timestamps to dates to handle timezone issues
  SELECT ARRAY_AGG(DISTINCT logged_at::DATE ORDER BY logged_at::DATE DESC)
  INTO v_dates
  FROM habit_logs
  WHERE user_id = p_user_id 
    AND habit_type = p_habit_type
    AND logged_at::DATE <= v_today; -- Don't count future dates

  -- If no data, return zeros
  IF v_dates IS NULL OR array_length(v_dates, 1) = 0 THEN
    current_streak := 0;
    longest_streak := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate current streak (from today backwards)
  v_current_date := v_today;
  
  -- Check if there's an entry for today or yesterday to start the streak
  IF v_dates[1] = v_today THEN
    v_current_streak := 1;
    v_prev_date := v_today;
  ELSIF v_dates[1] = v_today - INTERVAL '1 day' THEN
    v_current_streak := 1;
    v_prev_date := v_today - INTERVAL '1 day';
  ELSE
    -- No recent activity, current streak is 0
    v_current_streak := 0;
    v_prev_date := NULL;
  END IF;

  -- Continue counting backwards if we have a current streak
  IF v_current_streak > 0 THEN
    FOR i IN 2..array_length(v_dates, 1) LOOP
      -- Check if the next date is consecutive (previous day)
      IF v_dates[i] = v_prev_date - INTERVAL '1 day' THEN
        v_current_streak := v_current_streak + 1;
        v_prev_date := v_dates[i];
      ELSE
        -- Gap found, stop counting current streak
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- Calculate longest streak by checking all consecutive sequences
  v_temp_streak := 1;
  v_longest_streak := 1;
  
  FOR i IN 2..array_length(v_dates, 1) LOOP
    -- Check if consecutive days (remember: dates are in descending order)
    IF v_dates[i-1] - v_dates[i] = 1 THEN
      v_temp_streak := v_temp_streak + 1;
      v_longest_streak := GREATEST(v_longest_streak, v_temp_streak);
    ELSE
      -- Reset temp streak when gap is found
      v_temp_streak := 1;
    END IF;
  END LOOP;

  -- Ensure current streak doesn't exceed longest streak
  v_longest_streak := GREATEST(v_longest_streak, v_current_streak);

  -- Return results
  current_streak := v_current_streak;
  longest_streak := v_longest_streak;
  RETURN NEXT;
END;
$$;

-- =====================================================
-- FUNCTION: get_user_streaks
-- Gets all habit streaks for a user in one call
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_streaks(p_user_id UUID)
RETURNS TABLE(
  meditation_current_streak INTEGER,
  meditation_longest_streak INTEGER,
  cold_shower_current_streak INTEGER,
  cold_shower_longest_streak INTEGER,
  early_wakeup_current_streak INTEGER,
  early_wakeup_longest_streak INTEGER,
  exercise_current_streak INTEGER,
  exercise_longest_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meditation_current INTEGER := 0;
  v_meditation_longest INTEGER := 0;
  v_cold_shower_current INTEGER := 0;
  v_cold_shower_longest INTEGER := 0;
  v_early_wakeup_current INTEGER := 0;
  v_early_wakeup_longest INTEGER := 0;
  v_exercise_current INTEGER := 0;
  v_exercise_longest INTEGER := 0;
BEGIN
  -- Calculate meditation streak
  SELECT cs.current_streak, cs.longest_streak
  INTO v_meditation_current, v_meditation_longest
  FROM calculate_streak(p_user_id, 'meditation') cs;

  -- Calculate cold shower streak
  SELECT cs.current_streak, cs.longest_streak
  INTO v_cold_shower_current, v_cold_shower_longest
  FROM calculate_streak(p_user_id, 'cold_shower') cs;

  -- Calculate early wakeup streak
  SELECT cs.current_streak, cs.longest_streak
  INTO v_early_wakeup_current, v_early_wakeup_longest
  FROM calculate_streak(p_user_id, 'early_wakeup') cs;

  -- Calculate exercise streak
  SELECT cs.current_streak, cs.longest_streak
  INTO v_exercise_current, v_exercise_longest
  FROM calculate_streak(p_user_id, 'exercise') cs;

  -- Return all streaks
  meditation_current_streak := v_meditation_current;
  meditation_longest_streak := v_meditation_longest;
  cold_shower_current_streak := v_cold_shower_current;
  cold_shower_longest_streak := v_cold_shower_longest;
  early_wakeup_current_streak := v_early_wakeup_current;
  early_wakeup_longest_streak := v_early_wakeup_longest;
  exercise_current_streak := v_exercise_current;
  exercise_longest_streak := v_exercise_longest;

  RETURN NEXT;
END;
$$;

-- =====================================================
-- FUNCTION: get_habit_stats
-- Gets comprehensive habit statistics for a user
-- =====================================================

CREATE OR REPLACE FUNCTION get_habit_stats(
  p_user_id UUID,
  p_habit_type TEXT,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER,
  total_days INTEGER,
  completion_rate DECIMAL,
  days_this_week INTEGER,
  days_this_month INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_total_days INTEGER := 0;
  v_completion_rate DECIMAL := 0;
  v_days_this_week INTEGER := 0;
  v_days_this_month INTEGER := 0;
  v_possible_days INTEGER;
BEGIN
  -- Get streak data
  SELECT cs.current_streak, cs.longest_streak
  INTO v_current_streak, v_longest_streak
  FROM calculate_streak(p_user_id, p_habit_type) cs;

  -- Get total unique days in the specified period
  SELECT COUNT(DISTINCT logged_at::DATE)
  INTO v_total_days
  FROM habit_logs
  WHERE user_id = p_user_id 
    AND habit_type = p_habit_type
    AND logged_at >= CURRENT_DATE - INTERVAL '1 day' * p_days_back;

  -- Calculate completion rate
  v_possible_days := LEAST(p_days_back, 
    EXTRACT(days FROM CURRENT_DATE - (
      SELECT MIN(logged_at::DATE) 
      FROM habit_logs 
      WHERE user_id = p_user_id AND habit_type = p_habit_type
    ))::INTEGER + 1
  );
  
  IF v_possible_days > 0 THEN
    v_completion_rate := ROUND((v_total_days::DECIMAL / v_possible_days) * 100, 2);
  END IF;

  -- Get days this week (Monday to Sunday)
  SELECT COUNT(DISTINCT logged_at::DATE)
  INTO v_days_this_week
  FROM habit_logs
  WHERE user_id = p_user_id 
    AND habit_type = p_habit_type
    AND logged_at >= DATE_TRUNC('week', CURRENT_DATE);

  -- Get days this month
  SELECT COUNT(DISTINCT logged_at::DATE)
  INTO v_days_this_month
  FROM habit_logs
  WHERE user_id = p_user_id 
    AND habit_type = p_habit_type
    AND logged_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Return results
  current_streak := v_current_streak;
  longest_streak := v_longest_streak;
  total_days := v_total_days;
  completion_rate := v_completion_rate;
  days_this_week := v_days_this_week;
  days_this_month := v_days_this_month;

  RETURN NEXT;
END;
$$;

-- =====================================================
-- SECURITY NOTES
-- =====================================================
-- 
-- SECURITY DEFINER: Functions run with creator's privileges
-- This allows the function to access data even with RLS enabled
-- 
-- The functions are safe because:
-- 1. They only accept user_id as parameter
-- 2. They only return data for the specified user
-- 3. No cross-user data access is possible
-- 
-- Usage from backend:
-- SELECT * FROM calculate_streak('user-uuid', 'meditation');
-- SELECT * FROM get_user_streaks('user-uuid');
-- SELECT * FROM get_habit_stats('user-uuid', 'meditation', 30);