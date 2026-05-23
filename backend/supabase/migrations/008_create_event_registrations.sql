-- =====================================================
-- Event Registrations Table
-- Tracks which users have registered for which events
-- =====================================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),

  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT now(),
  attended_at TIMESTAMPTZ,

  -- Prevent duplicate registrations
  CONSTRAINT unique_event_registration UNIQUE (event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations (status);
