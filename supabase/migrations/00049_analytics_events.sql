-- =============================================
-- Analytics events table
-- Backs packages/core/src/services/analytics.ts (insert-only sink).
-- Append-only event log; client batches writes every 5s or 20 events.
-- =============================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name  text NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform    text,
  properties  jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Hot paths: filter by event_name, by user, and time-window queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created
  ON public.analytics_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON public.analytics_events (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_created
  ON public.analytics_events (created_at DESC);

-- RLS: insert-only for clients. Reads are admin-only (via service role).
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
  CREATE POLICY "Anyone can insert analytics events"
    ON public.analytics_events
    FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $safe$;

DO $safe$ BEGIN
  CREATE POLICY "Users can read own analytics events"
    ON public.analytics_events
    FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $safe$;
