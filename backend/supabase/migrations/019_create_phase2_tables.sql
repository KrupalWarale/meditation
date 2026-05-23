-- =====================================================
-- Phase 2 Tables
-- Vision Board, Day Journey, Performance Ratings, Bookmarks
-- =====================================================

-- =====================================================
-- Vision Board Table
-- Users can pin motivational images to their board
-- =====================================================

CREATE TABLE IF NOT EXISTS vision_board (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vision_board_user ON vision_board(user_id);

ALTER TABLE vision_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_board FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own vision board"
  ON vision_board FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vision board items"
  ON vision_board FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vision board items"
  ON vision_board FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vision board items"
  ON vision_board FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_vision_board_updated_at
  BEFORE UPDATE ON vision_board
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Day Journey Table
-- Predefined time-slot-based daily activities
-- =====================================================

CREATE TABLE IF NOT EXISTS day_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  time_slot_start TIME NOT NULL,
  time_slot_end TIME NOT NULL,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_day_journey_active ON day_journey(is_active);
CREATE INDEX IF NOT EXISTS idx_day_journey_sort ON day_journey(sort_order);

ALTER TABLE day_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_journey FORCE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active day journey entries"
  ON day_journey FOR SELECT USING (is_active = true);

CREATE TRIGGER update_day_journey_updated_at
  BEFORE UPDATE ON day_journey
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed day journey with default time slots
INSERT INTO day_journey (title, description, time_slot_start, time_slot_end, icon_name, sort_order)
VALUES
  ('Morning Breathing', 'Start your day with focused breathing exercises to energise body and mind', '06:00', '08:00', 'sunrise', 1),
  ('Afternoon Freshness', 'Re-energise your afternoon with a quick mindfulness session', '13:00', '15:00', 'sun', 2),
  ('Night Wind-down', 'Calm your mind and prepare for restful sleep with guided relaxation', '21:00', '23:00', 'moon', 3);

-- =====================================================
-- Performance Ratings Table
-- Daily productivity self-ratings
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  productivity_rating INTEGER NOT NULL CHECK (productivity_rating >= 1 AND productivity_rating <= 5),
  rated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, rated_date)
);

CREATE INDEX IF NOT EXISTS idx_performance_ratings_user ON performance_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_ratings_date ON performance_ratings(rated_date DESC);

ALTER TABLE performance_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_ratings FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own performance ratings"
  ON performance_ratings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own performance ratings"
  ON performance_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance ratings"
  ON performance_ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_performance_ratings_updated_at
  BEFORE UPDATE ON performance_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Bookmarks Table
-- Tracks user bookmarks for content directory items
-- =====================================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_directory(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content ON bookmarks(content_id);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmarks"
  ON bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);
