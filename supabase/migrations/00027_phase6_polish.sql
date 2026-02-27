-- Phase 6 Sprint 6: Polish & notifications enhancement
-- Add metadata column for rich notification data
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);
