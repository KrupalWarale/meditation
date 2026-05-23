-- =====================================================
-- Content Directory Table
-- Searchable library of spiritual media content:
-- Bhajans, Meditations, Satsangs, Podcasts, etc.
-- =====================================================

CREATE TABLE IF NOT EXISTS content_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core content
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,

  -- Media
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,       -- For display (e.g. "14 min")

  -- Categorisation
  category TEXT NOT NULL CHECK (category IN (
    'bhajan', 'meditation', 'satsang', 'podcast',
    'talk', 'chanting', 'breathwork', 'other'
  )),
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'hi',     -- Hindi default for Indian market

  -- Access control
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Full-text search support
  -- Postgres tsvector column for efficient searching
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(instructor_name, ''))
  ) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_directory_category ON content_directory (category);
CREATE INDEX IF NOT EXISTS idx_content_directory_premium ON content_directory (is_premium);
CREATE INDEX IF NOT EXISTS idx_content_directory_active ON content_directory (is_active);
CREATE INDEX IF NOT EXISTS idx_content_directory_search ON content_directory USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_content_directory_tags ON content_directory USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_content_directory_view_count ON content_directory (view_count DESC);

-- Auto-update timestamp trigger
CREATE TRIGGER update_content_directory_updated_at
  BEFORE UPDATE ON content_directory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
