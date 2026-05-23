-- =====================================================
-- Course Reviews Table
-- User reviews and ratings for courses
-- =====================================================

CREATE TABLE public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews FORCE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read all reviews"
  ON public.course_reviews FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews"
  ON public.course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.course_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_course_reviews_course ON public.course_reviews(course_id);
CREATE INDEX idx_course_reviews_user ON public.course_reviews(user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_course_reviews_updated_at
  BEFORE UPDATE ON public.course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
