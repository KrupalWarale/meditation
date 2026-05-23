-- =====================================================
-- Events Table
-- Live and upcoming spiritual wellness events
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT NOT NULL,
  instructor_avatar_url TEXT,

  -- Scheduling
  event_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',

  -- Media
  thumbnail_url TEXT,
  stream_url TEXT,           -- Live stream URL (revealed only to registered users)
  recording_url TEXT,        -- Post-event recording

  -- Metadata
  category TEXT DEFAULT 'meditation' CHECK (category IN ('meditation', 'yoga', 'satsang', 'pranayama', 'chanting', 'other')),
  is_live BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  max_participants INTEGER,
  registration_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);
CREATE INDEX IF NOT EXISTS idx_events_is_live ON events (is_live);

-- Auto-update timestamp trigger
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
