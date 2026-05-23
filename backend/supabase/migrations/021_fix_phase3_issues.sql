-- =====================================================
-- Migration 021: Fix Phase 3 issues
-- Adds UNIQUE constraint on subscriptions.user_id for upsert support
-- =====================================================

-- Required for ON CONFLICT (user_id) upsert in payment.service.ts
ALTER TABLE subscriptions
  ADD CONSTRAINT uq_subscriptions_user_id UNIQUE (user_id);
