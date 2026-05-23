-- =====================================================
-- Courses Table
-- Meditation courses and programs
-- =====================================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Course details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Content
  thumbnail_url TEXT,
  cover_image_url TEXT,
  instructor_name VARCHAR(255),
  instructor_bio TEXT,
  
  -- Course structure
  total_lessons INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER,
  difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Categories and tags
  category VARCHAR(50) NOT NULL DEFAULT 'meditation',
  tags TEXT[],
  
  -- Pricing and access
  is_premium BOOLEAN DEFAULT false,
  price_cents INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses (category);
CREATE INDEX IF NOT EXISTS idx_courses_is_premium ON courses (is_premium);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses (published_at DESC) WHERE status = 'published';

-- Update timestamp trigger
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();