-- =====================================================
-- Daily Quotes Table
-- Inspirational spiritual quotes shown on the home screen
-- One quote is shown per day based on the date field
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  quote_text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Unknown',
  source TEXT,                      -- Book, scripture, or origin reference

  -- Scheduling — one quote per calendar date
  quote_date DATE UNIQUE,          -- NULL = unscheduled / pool quote

  -- Categorisation
  category TEXT DEFAULT 'general' CHECK (category IN (
    'general', 'meditation', 'gratitude', 'courage',
    'love', 'wisdom', 'spirituality', 'mindfulness'
  )),
  language TEXT DEFAULT 'en',

  -- Display
  background_color TEXT DEFAULT '#1B4332',
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_quotes_date ON daily_quotes (quote_date);
CREATE INDEX IF NOT EXISTS idx_daily_quotes_active ON daily_quotes (is_active);
CREATE INDEX IF NOT EXISTS idx_daily_quotes_category ON daily_quotes (category);

-- Auto-update timestamp trigger
CREATE TRIGGER update_daily_quotes_updated_at
  BEFORE UPDATE ON daily_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
