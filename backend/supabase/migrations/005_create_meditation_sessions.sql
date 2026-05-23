-- =====================================================
-- Meditation Sessions Table
-- Tracks individual meditation sessions
-- =====================================================

CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  
  -- Session details
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  session_type VARCHAR(50) NOT NULL DEFAULT 'guided' CHECK (session_type IN ('guided', 'unguided', 'breathing', 'body_scan', 'loving_kindness')),
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('started', 'paused', 'completed', 'abandoned')),
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 100 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  
  -- Session notes
  notes TEXT,
  tags TEXT[], -- Array of tags like ['stress-relief', 'sleep', 'focus']
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON meditation_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_lesson_id ON meditation_sessions (lesson_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_completed_at ON meditation_sessions (completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_completed ON meditation_sessions (user_id, completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_type ON meditation_sessions (session_type);

-- Update timestamp trigger
CREATE TRIGGER update_meditation_sessions_updated_at 
  BEFORE UPDATE ON meditation_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();