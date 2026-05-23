-- =====================================================
-- Habit Logs Table
-- Tracks daily habit completion for streak calculations
-- =====================================================

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Habit details
  habit_type VARCHAR(50) NOT NULL CHECK (habit_type IN ('meditation', 'cold_shower', 'early_wakeup', 'exercise')),
  
  -- Completion tracking
  completed BOOLEAN NOT NULL DEFAULT true,
  duration_minutes INTEGER, -- Optional: how long the habit took
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10), -- Optional: intensity rating
  
  -- Notes and context
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  
  -- Timestamps
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When the habit was actually done
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When the log entry was created
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance (especially for streak calculations)
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_type ON habit_logs (habit_type);
CREATE INDEX IF NOT EXISTS idx_habit_logs_logged_at ON habit_logs (logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_habit_date ON habit_logs (user_id, habit_type, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed ON habit_logs (completed) WHERE completed = true;

-- Unique constraint to prevent duplicate habit logs for the same day
-- Note: This allows multiple entries per day but they should be handled in application logic
CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_logs_user_habit_day 
ON habit_logs (user_id, habit_type, DATE(logged_at));

-- Update timestamp trigger
CREATE TRIGGER update_habit_logs_updated_at 
  BEFORE UPDATE ON habit_logs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();