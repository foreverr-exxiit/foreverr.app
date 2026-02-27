-- ============================================================
-- Migration 00021: Living Legacy Polish
-- Sprint 5 of Phase 5 — profile enhancements, memorial
-- conversion tracking, user share stats
-- ============================================================

-- ----------------------------------------------------------
-- 1. Profile enhancements for legacy features
-- ----------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legacy_message text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_living_tribute_enabled boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prompt_streak integer DEFAULT 0;

-- ----------------------------------------------------------
-- 2. Memorial conversion tracking
-- ----------------------------------------------------------
ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS converted_from_living_tribute_id uuid;
ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS page_type text DEFAULT 'memorial';

-- ----------------------------------------------------------
-- 3. user_share_stats — aggregate sharing metrics per user
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_share_stats (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    total_shares          integer DEFAULT 0,
    total_invites_sent    integer DEFAULT 0,
    total_conversions     integer DEFAULT 0,
    total_prompts_answered integer DEFAULT 0,
    most_shared_type      text,
    created_at            timestamptz DEFAULT now(),
    updated_at            timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_share_stats_user ON public.user_share_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_memorials_converted ON public.memorials(converted_from_living_tribute_id)
    WHERE converted_from_living_tribute_id IS NOT NULL;

-- ----------------------------------------------------------
-- Trigger: auto-create user_share_stats on profile creation
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_user_share_stats()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_share_stats ON public.profiles;
CREATE TRIGGER trg_ensure_share_stats
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_share_stats();

-- ----------------------------------------------------------
-- Trigger: auto-update share stats on share_cards insert
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_share_stats_on_share()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id, total_shares, most_shared_type)
    VALUES (NEW.user_id, 1, NEW.target_type)
    ON CONFLICT (user_id) DO UPDATE SET
        total_shares = user_share_stats.total_shares + 1,
        most_shared_type = NEW.target_type,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_share_stats ON public.share_cards;
CREATE TRIGGER trg_update_share_stats
    AFTER INSERT ON public.share_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_share_stats_on_share();

-- ----------------------------------------------------------
-- Trigger: auto-update invite stats on invite_links insert
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_invite_stats()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id, total_invites_sent)
    VALUES (NEW.creator_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_invites_sent = user_share_stats.total_invites_sent + 1,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invite_stats ON public.invite_links;
CREATE TRIGGER trg_update_invite_stats
    AFTER INSERT ON public.invite_links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_invite_stats();

-- ----------------------------------------------------------
-- RLS Policies
-- ----------------------------------------------------------
ALTER TABLE public.user_share_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_share_stats_read" ON public.user_share_stats
    FOR SELECT USING (true);
CREATE POLICY "user_share_stats_insert" ON public.user_share_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_share_stats_update" ON public.user_share_stats
    FOR UPDATE USING (auth.uid() = user_id);
