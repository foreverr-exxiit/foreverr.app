-- ============================================================
-- Migration 00020: Viral Growth Mechanics
-- Sprint 4 of Phase 5 — invite links, conversions, share
-- card templates, seasonal campaigns
-- ============================================================

-- ----------------------------------------------------------
-- 1. invite_links — trackable invite URLs
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_links (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invite_type     text NOT NULL CHECK (invite_type IN ('memorial_contributor','living_tribute_contributor','app_invite','family_tree_join')),
    target_id       uuid,
    invite_code     text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    message         text,
    max_uses        integer,
    use_count       integer DEFAULT 0,
    expires_at      timestamptz,
    is_active       boolean DEFAULT true,
    created_at      timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 2. invite_conversions — tracks who signed up via invites
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_conversions (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_link_id    uuid NOT NULL REFERENCES public.invite_links(id) ON DELETE CASCADE,
    converted_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    conversion_type   text NOT NULL CHECK (conversion_type IN ('app_signup','memorial_follow','tribute_contribution','family_tree_join')),
    created_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 3. share_card_templates — visual templates for share cards
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.share_card_templates (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name              text NOT NULL,
    template_type     text NOT NULL CHECK (template_type IN ('memorial','tribute','living_tribute','streak','badge','prompt_response','event','milestone')),
    background_color  text DEFAULT '#2D1B4E',
    text_color        text DEFAULT '#FFFFFF',
    layout            text DEFAULT 'standard' CHECK (layout IN ('standard','photo_overlay','minimal','celebration')),
    is_active         boolean DEFAULT true,
    sort_order        integer DEFAULT 0,
    created_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 4. campaigns — seasonal & special campaigns
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title             text NOT NULL,
    description       text,
    campaign_type     text NOT NULL CHECK (campaign_type IN ('mothers_day','fathers_day','memorial_day','veterans_day','grandparents_day','remembrance_day','foreverr_day','custom')),
    start_date        date NOT NULL,
    end_date          date NOT NULL,
    cover_image_url   text,
    cta_text          text DEFAULT 'Honor Someone Special',
    cta_route         text DEFAULT '/living-tribute/create',
    is_active         boolean DEFAULT true,
    participant_count integer DEFAULT 0,
    created_at        timestamptz DEFAULT now(),
    updated_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invite_links_creator ON public.invite_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_invite_links_code ON public.invite_links(invite_code);
CREATE INDEX IF NOT EXISTS idx_invite_conversions_link ON public.invite_conversions(invite_link_id);
CREATE INDEX IF NOT EXISTS idx_share_card_templates_type ON public.share_card_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);

-- ----------------------------------------------------------
-- Trigger: auto-increment use_count on conversion
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_invite_use_count()
RETURNS trigger AS $$
BEGIN
    UPDATE public.invite_links
    SET use_count = use_count + 1
    WHERE id = NEW.invite_link_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_invite_use ON public.invite_conversions;
CREATE TRIGGER trg_increment_invite_use
    AFTER INSERT ON public.invite_conversions
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_invite_use_count();

-- ----------------------------------------------------------
-- RLS Policies
-- ----------------------------------------------------------
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- invite_links: creator can manage, anyone can read active links
CREATE POLICY "invite_links_read" ON public.invite_links
    FOR SELECT USING (is_active = true);
CREATE POLICY "invite_links_insert" ON public.invite_links
    FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "invite_links_update" ON public.invite_links
    FOR UPDATE USING (auth.uid() = creator_id);

-- invite_conversions: readable by invite creator, insertable by authenticated
CREATE POLICY "invite_conversions_read" ON public.invite_conversions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invite_links
            WHERE id = invite_link_id AND creator_id = auth.uid()
        )
    );
CREATE POLICY "invite_conversions_insert" ON public.invite_conversions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- share_card_templates: readable by all
CREATE POLICY "share_card_templates_read" ON public.share_card_templates
    FOR SELECT USING (is_active = true);

-- campaigns: readable by all
CREATE POLICY "campaigns_read" ON public.campaigns
    FOR SELECT USING (is_active = true);

-- ----------------------------------------------------------
-- Seed: Share card templates
-- ----------------------------------------------------------
INSERT INTO public.share_card_templates (name, template_type, background_color, text_color, layout, sort_order) VALUES
    ('Memorial Classic',    'memorial',        '#2D1B4E', '#FFFFFF', 'standard',      1),
    ('Memorial Photo',      'memorial',        '#1F1145', '#FFFFFF', 'photo_overlay', 2),
    ('Tribute Elegant',     'tribute',         '#4A2D7A', '#FFFFFF', 'standard',      1),
    ('Tribute Minimal',     'tribute',         '#FFFFFF', '#2D1B4E', 'minimal',       2),
    ('Living Tribute',      'living_tribute',  '#059669', '#FFFFFF', 'celebration',   1),
    ('Living Tribute Photo','living_tribute',  '#047857', '#FFFFFF', 'photo_overlay', 2),
    ('Streak Fire',         'streak',          '#EF4444', '#FFFFFF', 'celebration',   1),
    ('Badge Earned',        'badge',           '#7C3AED', '#FFFFFF', 'celebration',   1),
    ('Prompt Response',     'prompt_response', '#F59E0B', '#FFFFFF', 'standard',      1),
    ('Event Invite',        'event',           '#2563EB', '#FFFFFF', 'standard',      1),
    ('Milestone',           'milestone',       '#2D1B4E', '#F59E0B', 'celebration',   1);

-- ----------------------------------------------------------
-- Seed: Campaign definitions
-- ----------------------------------------------------------
INSERT INTO public.campaigns (title, description, campaign_type, start_date, end_date, cta_text, cta_route) VALUES
    ('Mother''s Day',
     'Honor the mothers and maternal figures in your life with a living tribute.',
     'mothers_day', '2026-05-04', '2026-05-10',
     'Honor a Mother', '/living-tribute/create'),
    ('Father''s Day',
     'Celebrate fathers and father figures with a heartfelt tribute.',
     'fathers_day', '2026-06-15', '2026-06-21',
     'Honor a Father', '/living-tribute/create'),
    ('Memorial Day',
     'Remember and honor those who served our country.',
     'memorial_day', '2026-05-22', '2026-05-25',
     'Remember a Hero', '/memorial/create/basic-info'),
    ('Veterans Day',
     'Thank a veteran for their service with a living tribute.',
     'veterans_day', '2026-11-09', '2026-11-11',
     'Thank a Veteran', '/living-tribute/create'),
    ('Grandparents Day',
     'Celebrate the wisdom and love of grandparents.',
     'grandparents_day', '2026-09-07', '2026-09-13',
     'Honor a Grandparent', '/living-tribute/create'),
    ('Foreverr Day',
     'Our annual celebration of legacy, love, and remembrance.',
     'foreverr_day', '2026-10-01', '2026-10-07',
     'Join the Celebration', '/living-tribute/create');
