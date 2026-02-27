-- ============================================================
-- Migration 00017: Social Sharing Infrastructure & Deep Links
-- Phase 5, Sprint 1: Make every piece of content shareable
-- ============================================================

-- ─── Share Cards (analytics for every share action) ─────────
CREATE TABLE IF NOT EXISTS public.share_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type     text NOT NULL CHECK (target_type IN ('memorial','tribute','event','profile','living_tribute','badge')),
  target_id       uuid NOT NULL,
  share_platform  text CHECK (share_platform IN ('instagram_story','facebook','twitter','whatsapp','sms','copy_link','native','other')),
  share_url       text NOT NULL,
  og_title        text,
  og_description  text,
  og_image_url    text,
  click_count     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_cards_target ON public.share_cards (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_user ON public.share_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_created ON public.share_cards (created_at DESC);

-- RLS for share_cards
ALTER TABLE public.share_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Share cards are viewable by everyone"
  ON public.share_cards FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create share cards"
  ON public.share_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ─── Legacy Links (vanity URLs for user profiles) ──────────
CREATE TABLE IF NOT EXISTS public.legacy_links (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  slug            text NOT NULL UNIQUE,
  is_active       boolean NOT NULL DEFAULT true,
  click_count     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_legacy_links_slug ON public.legacy_links (slug);
CREATE INDEX IF NOT EXISTS idx_legacy_links_user ON public.legacy_links (user_id);

-- Slug validation: lowercase alphanumeric + hyphens, 3-30 chars
ALTER TABLE public.legacy_links
  ADD CONSTRAINT legacy_links_slug_format
  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$');

-- RLS for legacy_links
ALTER TABLE public.legacy_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legacy links are viewable by everyone"
  ON public.legacy_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own legacy link"
  ON public.legacy_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legacy link"
  ON public.legacy_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legacy link"
  ON public.legacy_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── Add legacy_link_slug to profiles for quick lookups ─────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legacy_link_slug text UNIQUE;

-- ─── Auto-update profiles.legacy_link_slug on legacy_links change ───
CREATE OR REPLACE FUNCTION public.sync_legacy_link_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.profiles SET legacy_link_slug = NEW.slug WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET legacy_link_slug = NULL WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_legacy_link_change
  AFTER INSERT OR UPDATE OR DELETE ON public.legacy_links
  FOR EACH ROW EXECUTE FUNCTION public.sync_legacy_link_slug();

-- ─── Auto-update updated_at on legacy_links ─────────────────
CREATE OR REPLACE FUNCTION public.update_legacy_link_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_legacy_link_update
  BEFORE UPDATE ON public.legacy_links
  FOR EACH ROW EXECUTE FUNCTION public.update_legacy_link_timestamp();
