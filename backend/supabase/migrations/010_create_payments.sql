-- =====================================================
-- Payments Table
-- Payment transaction records (Razorpay + Stripe)
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Payment gateway details
  gateway TEXT NOT NULL CHECK (gateway IN ('razorpay', 'stripe')),
  gateway_order_id TEXT,           -- Razorpay order_id / Stripe payment_intent id
  gateway_payment_id TEXT UNIQUE,  -- Razorpay payment_id / Stripe charge id
  gateway_signature TEXT,          -- Razorpay signature (for verification)

  -- Amount
  amount INTEGER NOT NULL,         -- In smallest currency unit (paise for INR, cents for USD)
  currency TEXT NOT NULL DEFAULT 'INR',
  amount_display NUMERIC(10, 2) GENERATED ALWAYS AS (amount / 100.0) STORED,

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),

  -- Plan context
  plan_type TEXT CHECK (plan_type IN ('monthly', 'annual', 'lifetime')),

  -- Webhook / metadata
  webhook_payload JSONB,
  failure_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order ON payments (gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);

-- Auto-update timestamp trigger
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
