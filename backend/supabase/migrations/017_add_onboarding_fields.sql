-- Migration 017: Add onboarding fields to users table
-- Required for Phase 1 onboarding flow

ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS meditation_goal_minutes INTEGER DEFAULT 10;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'beginner';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'phone';

-- Add check constraints
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'super_admin'));
ALTER TABLE public.users ADD CONSTRAINT users_level_check CHECK (level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE public.users ADD CONSTRAINT users_auth_provider_check CHECK (auth_provider IN ('phone', 'email', 'google'));

-- Index for onboarding status queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON public.users(onboarding_complete);
