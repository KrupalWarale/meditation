-- =====================================================
-- Lessons Table
-- Individual lessons within courses
-- =====================================================

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Lesson details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Content
  audio_url TEXT,
  video_url TEXT,
  transcript TEXT,
  
  -- Lesson structure
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  lesson_number INTEGER NOT NULL,
  
  -- Content type
  lesson_type VARCHAR(50) DEFAULT 'guided_meditation' CHECK (lesson_type IN (
    'guided_meditation',
    'breathing_exercise', 
    'body_scan',
    'loving_kindness',
    'mindfulness',
    'theory',
    'practice'
  )),
  
  -- Access control
  is_preview BOOLEAN DEFAULT false, -- Can be accessed without enrollment
  is_premium BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons (course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_number ON lessons (course_id, lesson_number);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons (status);
CREATE INDEX IF NOT EXISTS idx_lessons_is_preview ON lessons (is_preview) WHERE is_preview = true;

-- Unique constraint for lesson numbering within a course
CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_course_number 
ON lessons (course_id, lesson_number);

-- Update timestamp trigger
CREATE TRIGGER update_lessons_updated_at 
  BEFORE UPDATE ON lessons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();