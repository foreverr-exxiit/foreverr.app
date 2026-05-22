-- PART 2 of 3: Migrations 00019-00027

-- === 00019_daily_engagement.sql ===

-- ============================================================
-- Migration 00019: Daily Engagement System
-- Phase 5, Sprint 3: Daily Life Integration
-- ============================================================

-- ============================================================
-- Table: daily_prompts
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_prompts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text     text NOT NULL,
  prompt_category text NOT NULL CHECK (prompt_category IN ('gratitude','remembrance','appreciation','reflection','connection','milestone')),
  icon            text DEFAULT 'sparkles',
  is_active       boolean DEFAULT true,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Table: user_prompt_responses
-- ============================================================
CREATE TABLE IF NOT EXISTS user_prompt_responses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id          uuid NOT NULL REFERENCES daily_prompts(id) ON DELETE CASCADE,
  content            text NOT NULL,
  media_url          text,
  is_public          boolean DEFAULT true,
  tagged_memorial_id uuid REFERENCES memorials(id) ON DELETE SET NULL,
  tagged_user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reaction_count     integer DEFAULT 0,
  created_at         timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_prompt_responses_daily
  ON user_prompt_responses (user_id, prompt_id, ((created_at AT TIME ZONE 'UTC')::date));

-- ============================================================
-- Table: smart_reminders
-- ============================================================
CREATE TABLE IF NOT EXISTS smart_reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type   text NOT NULL CHECK (reminder_type IN ('birthday','anniversary','death_anniversary','holiday','custom','auto_generated')),
  title           text NOT NULL,
  description     text,
  memorial_id     uuid REFERENCES memorials(id) ON DELETE SET NULL,
  recurrence      text DEFAULT 'annual' CHECK (recurrence IN ('once','annual','monthly','weekly')),
  reminder_date   date NOT NULL,
  reminder_time   time DEFAULT '09:00',
  days_before     integer DEFAULT 0,
  is_enabled      boolean DEFAULT true,
  last_triggered  timestamptz,
  notification_sent boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Table: engagement_streaks
-- ============================================================
CREATE TABLE IF NOT EXISTS engagement_streaks (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak         integer DEFAULT 0,
  longest_streak         integer DEFAULT 0,
  last_activity_date     date,
  total_days_active      integer DEFAULT 0,
  total_prompts_answered integer DEFAULT 0,
  total_shares           integer DEFAULT 0,
  streak_shared_at       timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_daily_prompts_category ON daily_prompts(prompt_category);
CREATE INDEX idx_daily_prompts_active ON daily_prompts(is_active);
CREATE INDEX idx_user_prompt_responses_user ON user_prompt_responses(user_id);
CREATE INDEX idx_user_prompt_responses_prompt ON user_prompt_responses(prompt_id);
CREATE INDEX idx_smart_reminders_user ON smart_reminders(user_id);
CREATE INDEX idx_smart_reminders_date ON smart_reminders(reminder_date);
CREATE INDEX idx_engagement_streaks_user ON engagement_streaks(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_streaks ENABLE ROW LEVEL SECURITY;

-- Daily prompts: readable by all
CREATE POLICY "daily_prompts_select" ON daily_prompts FOR SELECT USING (true);

-- Responses: public ones readable, own always readable, insertable by owner
CREATE POLICY "user_prompt_responses_select" ON user_prompt_responses
  FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "user_prompt_responses_insert" ON user_prompt_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_prompt_responses_update" ON user_prompt_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Reminders: owner only
CREATE POLICY "smart_reminders_select" ON smart_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "smart_reminders_insert" ON smart_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "smart_reminders_update" ON smart_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "smart_reminders_delete" ON smart_reminders FOR DELETE USING (auth.uid() = user_id);

-- Streaks: owner only
CREATE POLICY "engagement_streaks_select" ON engagement_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "engagement_streaks_insert" ON engagement_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "engagement_streaks_update" ON engagement_streaks FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- SEED: Daily prompts
-- ============================================================
INSERT INTO daily_prompts (prompt_text, prompt_category, icon, sort_order) VALUES
-- Gratitude
('Who made you smile today?', 'gratitude', 'happy', 1),
('Name someone who changed your life for the better.', 'gratitude', 'heart', 2),
('What kindness did you witness or receive today?', 'gratitude', 'hand-left', 3),
('What is one thing you are grateful for right now?', 'gratitude', 'sparkles', 4),
('Who deserves a thank you that you haven''t given yet?', 'gratitude', 'gift', 5),
('What small moment brought you joy recently?', 'gratitude', 'sunny', 6),
('Name a teacher, mentor, or guide who shaped who you are.', 'gratitude', 'school', 7),
('What is a skill someone taught you that you still use?', 'gratitude', 'bulb', 8),
-- Remembrance
('Share a favorite memory of someone you miss.', 'remembrance', 'heart-circle', 10),
('What song reminds you of a loved one?', 'remembrance', 'musical-notes', 11),
('What lesson did you learn from someone who has passed?', 'remembrance', 'book', 12),
('Describe a tradition that keeps a loved one''s memory alive.', 'remembrance', 'flame', 13),
('What would you say if you had one more conversation?', 'remembrance', 'chatbubble', 14),
('Share a photo that captures a special moment.', 'remembrance', 'camera', 15),
('What smell or taste brings back a cherished memory?', 'remembrance', 'rose', 16),
('How do you honor someone who is no longer with you?', 'remembrance', 'candle', 17),
-- Appreciation
('Tell someone alive how they''ve impacted you.', 'appreciation', 'person', 20),
('Who deserves a thank you today?', 'appreciation', 'thumbs-up', 21),
('Name someone whose work ethic inspires you.', 'appreciation', 'star', 22),
('Who is your biggest cheerleader?', 'appreciation', 'megaphone', 23),
('What friend has stood by you through thick and thin?', 'appreciation', 'people', 24),
('Who in your family deserves more recognition?', 'appreciation', 'home', 25),
('Name a colleague who makes your work life better.', 'appreciation', 'briefcase', 26),
('Who is a quiet hero in your community?', 'appreciation', 'shield', 27),
-- Reflection
('What life lesson would you pass on to the next generation?', 'reflection', 'bulb', 30),
('What moment shaped who you are today?', 'reflection', 'compass', 31),
('If you could relive one day, which would it be?', 'reflection', 'time', 32),
('What do you want to be remembered for?', 'reflection', 'ribbon', 33),
('What advice would your younger self need to hear?', 'reflection', 'chatbubble-ellipses', 34),
('What is the bravest thing you''ve ever done?', 'reflection', 'flash', 35),
('How has your definition of success changed over time?', 'reflection', 'trending-up', 36),
('What value do you hold most dear?', 'reflection', 'diamond', 37),
-- Connection
('Who should you call today?', 'connection', 'call', 40),
('Share a family tradition worth preserving.', 'connection', 'people-circle', 41),
('What community do you feel most connected to?', 'connection', 'earth', 42),
('Name someone you''ve lost touch with that you miss.', 'connection', 'person-add', 43),
('How do you stay connected with loved ones far away?', 'connection', 'globe', 44),
('What meal brings your family together?', 'connection', 'restaurant', 45),
('Share a story that gets told at every family gathering.', 'connection', 'chatbubbles', 46),
('Who would you invite to your dream dinner party?', 'connection', 'wine', 47),
-- Milestone
('What achievement are you most proud of?', 'milestone', 'trophy', 50),
('Celebrate someone''s recent win — who accomplished something great?', 'milestone', 'ribbon', 51),
('What goal are you working toward right now?', 'milestone', 'flag', 52),
('Name a milestone birthday or anniversary coming up.', 'milestone', 'gift', 53),
('What is the best compliment you''ve ever received?', 'milestone', 'star', 54),
('Share a "first" that was meaningful to you.', 'milestone', 'rocket', 55),
('What skill have you recently learned or improved?', 'milestone', 'school', 56),
('What is something you accomplished that once seemed impossible?', 'milestone', 'checkmark-circle', 57)
ON CONFLICT DO NOTHING;

-- === 00020_viral_growth.sql ===

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

-- === 00021_living_legacy_polish.sql ===

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

-- === 00022_gift_economy.sql ===

-- ============================================================
-- 00022_gift_economy.sql
-- Gift Economy: Gift Catalog, Transactions, Flower Walls, Reactions
-- ============================================================

-- ============================================================
-- 1. Gift Catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('flowers', 'candles', 'cards', 'stuffed_animals', 'balloons', 'custom', 'money')),
  icon text NOT NULL DEFAULT 'gift',
  image_url text,
  price_cents integer NOT NULL DEFAULT 0,
  is_premium boolean DEFAULT false,
  is_physical boolean DEFAULT false,
  physical_partner_id uuid,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gift_catalog_category ON public.gift_catalog(category);

-- ============================================================
-- 2. Gift Transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_type text NOT NULL CHECK (recipient_type IN ('user', 'memorial', 'living_tribute')),
  recipient_id uuid NOT NULL,
  recipient_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  gift_id uuid NOT NULL REFERENCES public.gift_catalog(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  message text,
  is_anonymous boolean DEFAULT false,
  amount_cents integer DEFAULT 0,
  currency text DEFAULT 'USD',
  payment_status text DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id text,
  is_physical boolean DEFAULT false,
  shipping_address jsonb,
  delivery_status text CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'returned')),
  tracking_number text,
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gift_transactions_recipient ON public.gift_transactions(recipient_type, recipient_id);
CREATE INDEX idx_gift_transactions_sender ON public.gift_transactions(sender_id);

-- ============================================================
-- 3. Flower Walls (Aggregated gift counts per target)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flower_walls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('user', 'memorial', 'living_tribute')),
  target_id uuid NOT NULL,
  total_flowers integer DEFAULT 0,
  total_candles integer DEFAULT 0,
  total_gifts integer DEFAULT 0,
  total_amount_cents integer DEFAULT 0,
  last_gift_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(target_type, target_id)
);

-- ============================================================
-- 4. Gift Reactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_transaction_id uuid NOT NULL REFERENCES public.gift_transactions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('heart', 'pray', 'thanks', 'hug')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(gift_transaction_id, user_id)
);

-- ============================================================
-- 5. Row Level Security
-- ============================================================

-- gift_catalog: readable by all
ALTER TABLE public.gift_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_catalog_select" ON public.gift_catalog
  FOR SELECT USING (true);

-- gift_transactions: readable by all, insertable by authenticated
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_transactions_select" ON public.gift_transactions
  FOR SELECT USING (true);

CREATE POLICY "gift_transactions_insert" ON public.gift_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- flower_walls: readable by all
ALTER TABLE public.flower_walls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flower_walls_select" ON public.flower_walls
  FOR SELECT USING (true);

-- gift_reactions: readable by all, insertable by authenticated
ALTER TABLE public.gift_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_reactions_select" ON public.gift_reactions
  FOR SELECT USING (true);

CREATE POLICY "gift_reactions_insert" ON public.gift_reactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 6. Trigger: Auto-update flower_walls + calculate points_earned
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_gift_transaction()
RETURNS TRIGGER AS $$
DECLARE
  gift_category text;
  earned_points integer;
BEGIN
  -- Look up the gift category
  SELECT category INTO gift_category
  FROM public.gift_catalog
  WHERE id = NEW.gift_id;

  -- Calculate points earned based on category
  CASE gift_category
    WHEN 'flowers' THEN earned_points := 5;
    WHEN 'candles' THEN earned_points := 5;
    WHEN 'cards' THEN earned_points := 10;
    WHEN 'money' THEN earned_points := 15;
    ELSE earned_points := 10;
  END CASE;

  -- Set points_earned on the new row
  NEW.points_earned := earned_points;

  -- Upsert into flower_walls
  INSERT INTO public.flower_walls (target_type, target_id, total_flowers, total_candles, total_gifts, total_amount_cents, last_gift_at, updated_at)
  VALUES (
    NEW.recipient_type,
    NEW.recipient_id,
    CASE WHEN gift_category = 'flowers' THEN NEW.quantity ELSE 0 END,
    CASE WHEN gift_category = 'candles' THEN NEW.quantity ELSE 0 END,
    NEW.quantity,
    COALESCE(NEW.amount_cents, 0),
    now(),
    now()
  )
  ON CONFLICT (target_type, target_id) DO UPDATE SET
    total_flowers = flower_walls.total_flowers + CASE WHEN gift_category = 'flowers' THEN NEW.quantity ELSE 0 END,
    total_candles = flower_walls.total_candles + CASE WHEN gift_category = 'candles' THEN NEW.quantity ELSE 0 END,
    total_gifts = flower_walls.total_gifts + NEW.quantity,
    total_amount_cents = flower_walls.total_amount_cents + COALESCE(NEW.amount_cents, 0),
    last_gift_at = now(),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_gift_transaction_insert
  BEFORE INSERT ON public.gift_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_gift_transaction();

-- ============================================================
-- 7. Seed Data: Gift Catalog (30+ items)
-- ============================================================

-- Flowers (sort_order 1-6)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Single Rose', 'A single red rose to show you care', 'flowers', 'rose', 0, false, 1),
  ('Bouquet', 'A beautiful mixed bouquet of fresh flowers', 'flowers', 'rose', 299, false, 2),
  ('Sunflower', 'A bright sunflower to bring warmth and light', 'flowers', 'rose', 199, false, 3),
  ('Lily', 'An elegant lily symbolizing peace and remembrance', 'flowers', 'rose', 249, false, 4),
  ('Orchid', 'A graceful orchid representing eternal love', 'flowers', 'rose', 399, false, 5),
  ('Eternal Rose', 'A preserved rose that lasts forever, just like your love', 'flowers', 'rose', 999, true, 6);

-- Candles (sort_order 7-10)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Prayer Candle', 'Light a prayer candle in remembrance', 'candles', 'flame', 0, false, 7),
  ('Memorial Candle', 'A memorial candle that burns bright', 'candles', 'flame', 199, false, 8),
  ('Vigil Light', 'A vigil light to keep the memory alive', 'candles', 'flame', 299, false, 9),
  ('Eternal Flame', 'An eternal flame that never goes out', 'candles', 'flame', 799, true, 10);

-- Cards (sort_order 11-16)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Thank You Card', 'Express your gratitude with a heartfelt thank you', 'cards', 'mail', 0, false, 11),
  ('Thinking of You', 'Let someone know they are in your thoughts', 'cards', 'mail', 149, false, 12),
  ('Birthday Card', 'Celebrate a birthday with a special card', 'cards', 'mail', 199, false, 13),
  ('Get Well', 'Send warm wishes for a speedy recovery', 'cards', 'mail', 149, false, 14),
  ('Anniversary Card', 'Mark a special anniversary with love', 'cards', 'mail', 199, false, 15),
  ('Custom Message', 'Write your own personal message from the heart', 'cards', 'mail', 0, false, 16);

-- Stuffed Animals (sort_order 17-19)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Comfort Bear', 'A soft bear to bring comfort during difficult times', 'stuffed_animals', 'heart', 499, false, 17),
  ('Memorial Butterfly', 'A butterfly symbolizing transformation and hope', 'stuffed_animals', 'heart', 599, false, 18),
  ('Guardian Angel', 'A guardian angel to watch over your loved ones', 'stuffed_animals', 'heart', 699, false, 19);

-- Balloons (sort_order 20-22)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Celebration Bundle', 'A festive bundle of balloons for any occasion', 'balloons', 'balloon', 399, false, 20),
  ('Birthday Balloons', 'Colorful birthday balloons to brighten the day', 'balloons', 'balloon', 299, false, 21),
  ('Congratulations', 'Congratulations balloons to celebrate achievements', 'balloons', 'balloon', 349, false, 22);

-- Custom (sort_order 23-24)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Photo Frame', 'A digital photo frame to display cherished memories', 'custom', 'gift', 499, false, 23),
  ('Memory Book', 'A collaborative memory book for friends and family', 'custom', 'gift', 799, false, 24);

-- === 00023_legacy_points.sql ===

-- ============================================================
-- 00023_legacy_points.sql
-- Legacy Points & Reward System
-- ============================================================

-- ============================================================
-- 1. Legacy Levels (catalog — created first for FK reference)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_levels (
  id integer PRIMARY KEY,
  level_name text NOT NULL,
  min_points integer NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  perks text[]
);

-- ============================================================
-- 2. Legacy Point Balances
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_point_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  current_balance integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  level_name text NOT NULL DEFAULT 'Seedling',
  next_level_at integer NOT NULL DEFAULT 100,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legacy_point_balances_user ON public.legacy_point_balances(user_id);

-- ============================================================
-- 3. Legacy Points (individual point transactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  action_type text NOT NULL CHECK (action_type IN (
    'daily_login',
    'create_memorial',
    'create_tribute',
    'send_gift',
    'send_flowers',
    'invite_accepted',
    'share_content',
    'respond_to_prompt',
    'complete_streak_day',
    'create_living_tribute',
    'write_appreciation',
    'contribute_to_tribute',
    'follow_memorial',
    'add_photo',
    'add_video',
    'complete_profile',
    'first_memorial',
    'first_tribute',
    'milestone_100_tributes',
    'campaign_participation',
    'referral_signup'
  )),
  reference_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legacy_points_user ON public.legacy_points(user_id, created_at DESC);

-- ============================================================
-- 4. Point Redemptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.point_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_spent integer NOT NULL,
  redemption_type text NOT NULL CHECK (redemption_type IN (
    'gift_purchase',
    'premium_feature',
    'donation_boost',
    'custom_theme'
  )),
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. Trigger: Auto-update balances on points earned
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_legacy_points_insert()
RETURNS TRIGGER AS $$
DECLARE
  _balance_row public.legacy_point_balances%ROWTYPE;
  _new_total integer;
  _new_level integer;
  _level_row public.legacy_levels%ROWTYPE;
  _next_level public.legacy_levels%ROWTYPE;
BEGIN
  -- Upsert the balance row
  INSERT INTO public.legacy_point_balances (user_id, total_earned, current_balance, level, level_name, next_level_at)
  VALUES (NEW.user_id, NEW.points, NEW.points, 1, 'Seedling', 100)
  ON CONFLICT (user_id) DO UPDATE SET
    total_earned = public.legacy_point_balances.total_earned + NEW.points,
    current_balance = public.legacy_point_balances.current_balance + NEW.points,
    updated_at = now()
  RETURNING * INTO _balance_row;

  _new_total := _balance_row.total_earned;

  -- Determine current level based on total earned
  SELECT * INTO _level_row
  FROM public.legacy_levels
  WHERE min_points <= _new_total
  ORDER BY min_points DESC
  LIMIT 1;

  IF _level_row IS NOT NULL THEN
    _new_level := _level_row.id;

    -- Determine next level threshold
    SELECT * INTO _next_level
    FROM public.legacy_levels
    WHERE id = _level_row.id + 1;

    UPDATE public.legacy_point_balances SET
      level = _level_row.id,
      level_name = _level_row.level_name,
      next_level_at = COALESCE(_next_level.min_points, _level_row.min_points),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_legacy_points_insert ON public.legacy_points;
CREATE TRIGGER trg_legacy_points_insert
  AFTER INSERT ON public.legacy_points
  FOR EACH ROW EXECUTE FUNCTION public.handle_legacy_points_insert();

-- ============================================================
-- 6. Trigger: Auto-update balances on point redemption
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_point_redemption_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.legacy_point_balances SET
    total_spent = total_spent + NEW.points_spent,
    current_balance = GREATEST(current_balance - NEW.points_spent, 0),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_point_redemption_insert ON public.point_redemptions;
CREATE TRIGGER trg_point_redemption_insert
  AFTER INSERT ON public.point_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_point_redemption_insert();

-- ============================================================
-- 7. RLS Policies
-- ============================================================

-- legacy_points
ALTER TABLE public.legacy_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON public.legacy_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert points"
  ON public.legacy_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- legacy_point_balances
ALTER TABLE public.legacy_point_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view point balances"
  ON public.legacy_point_balances FOR SELECT
  USING (true);

CREATE POLICY "Users can update own balance"
  ON public.legacy_point_balances FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert balances"
  ON public.legacy_point_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- legacy_levels
ALTER TABLE public.legacy_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view levels"
  ON public.legacy_levels FOR SELECT
  USING (true);

-- point_redemptions
ALTER TABLE public.point_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON public.point_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
  ON public.point_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. Seed Legacy Levels
-- ============================================================
INSERT INTO public.legacy_levels (id, level_name, min_points, icon, color, perks) VALUES
  (1, 'Seedling',   0,     'leaf',     '#22C55E', ARRAY['Basic access']),
  (2, 'Sprout',     100,   'leaf',     '#16A34A', ARRAY['Custom themes']),
  (3, 'Bloom',      500,   'flower',   '#A855F7', ARRAY['Premium gifts']),
  (4, 'Tree',       2000,  'tree',     '#059669', ARRAY['Badge showcase']),
  (5, 'Grove',      5000,  'forest',   '#0D9488', ARRAY['Profile highlight']),
  (6, 'Forest',     15000, 'mountain', '#1D4ED8', ARRAY['Legacy builder badge']),
  (7, 'Eternal',    50000, 'star',     '#F59E0B', ARRAY['Legendary status'])
ON CONFLICT (id) DO NOTHING;

-- === 00024_trust_system.sql ===

-- ============================================================
-- 00024_trust_system.sql
-- Phase 6 Sprint 3: Trust System & Memorial Creation Logic
-- Tables: trust_levels, memorial_claims, memorial_managers,
--         duplicate_reports, fundraise_campaigns_v2
-- Alters: profiles, memorials
-- ============================================================

-- 1. Trust Levels (lookup table)
CREATE TABLE IF NOT EXISTS trust_levels (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  can_create_memorial boolean DEFAULT true,
  can_fundraise boolean DEFAULT false,
  can_claim_memorial boolean DEFAULT false,
  can_moderate boolean DEFAULT false,
  max_fundraise_amount_cents integer DEFAULT 0,
  verification_required boolean DEFAULT false
);

-- 2. Memorial Claims
CREATE TABLE IF NOT EXISTS memorial_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  claimer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('spouse','parent','child','sibling','grandchild','grandparent','extended_family','executor','close_friend')),
  evidence_type text CHECK (evidence_type IN ('obituary_link','death_certificate','family_photo','other')),
  evidence_url text,
  evidence_note text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','disputed')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(memorial_id, claimer_id)
);

-- 3. Memorial Managers
CREATE TABLE IF NOT EXISTS memorial_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','family_admin','contributor','moderator')),
  granted_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(memorial_id, user_id)
);

-- 4. Duplicate Reports
CREATE TABLE IF NOT EXISTS duplicate_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memorial_id_a uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  memorial_id_b uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','merged')),
  merged_into_id uuid REFERENCES memorials(id),
  notes text,
  reviewed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Fundraise Campaigns V2 (trust-gated)
CREATE TABLE IF NOT EXISTS fundraise_campaigns_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  goal_cents integer NOT NULL,
  raised_cents integer DEFAULT 0,
  donor_count integer DEFAULT 0,
  beneficiary_name text,
  beneficiary_relation text,
  is_verified boolean DEFAULT false,
  trust_level integer DEFAULT 1,
  platform_fee_pct numeric DEFAULT 5.0,
  status text DEFAULT 'active' CHECK (status IN ('draft','active','paused','completed','cancelled')),
  expires_at timestamptz,
  payout_method text CHECK (payout_method IN ('stripe','paypal','check')),
  payout_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- ALTER existing tables
-- ============================================================

-- Add trust_level to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_level integer DEFAULT 1;

-- Add claim & celebrity columns to memorials
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS claimed_by uuid;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS is_celebrity boolean DEFAULT false;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS celebrity_verified boolean DEFAULT false;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_memorial_claims_memorial ON memorial_claims(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_managers_memorial ON memorial_managers(memorial_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_reports_status ON duplicate_reports(status);
CREATE INDEX IF NOT EXISTS idx_fundraise_v2_memorial ON fundraise_campaigns_v2(memorial_id);

-- ============================================================
-- Seed trust levels
-- ============================================================

INSERT INTO trust_levels (id, name, description, can_create_memorial, can_fundraise, can_claim_memorial, can_moderate, max_fundraise_amount_cents, verification_required)
VALUES
  (1, 'Community', 'Default level', true, false, false, false, 0, false),
  (2, 'Verified', 'Email and phone verified', true, true, false, false, 100000, true),
  (3, 'Family Verified', 'Approved family claim', true, true, true, true, 2500000, true),
  (4, 'Executor', 'Legal documentation provided', true, true, true, true, 0, true),
  (5, 'Admin', 'Platform moderator', true, true, true, true, 0, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE trust_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraise_campaigns_v2 ENABLE ROW LEVEL SECURITY;

-- trust_levels: readable by all
CREATE POLICY "trust_levels_select" ON trust_levels
  FOR SELECT USING (true);

-- memorial_claims: readable by claimer or memorial creator
CREATE POLICY "memorial_claims_select" ON memorial_claims
  FOR SELECT USING (
    claimer_id = auth.uid()
    OR memorial_id IN (
      SELECT id FROM memorials WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "memorial_claims_insert" ON memorial_claims
  FOR INSERT WITH CHECK (claimer_id = auth.uid());

-- memorial_managers: readable by memorial participants
CREATE POLICY "memorial_managers_select" ON memorial_managers
  FOR SELECT USING (
    user_id = auth.uid()
    OR memorial_id IN (
      SELECT memorial_id FROM memorial_managers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "memorial_managers_insert" ON memorial_managers
  FOR INSERT WITH CHECK (
    granted_by = auth.uid()
    AND memorial_id IN (
      SELECT memorial_id FROM memorial_managers
      WHERE user_id = auth.uid() AND role IN ('owner', 'family_admin')
    )
  );

CREATE POLICY "memorial_managers_delete" ON memorial_managers
  FOR DELETE USING (
    memorial_id IN (
      SELECT memorial_id FROM memorial_managers
      WHERE user_id = auth.uid() AND role IN ('owner', 'family_admin')
    )
  );

-- duplicate_reports: readable by reporter
CREATE POLICY "duplicate_reports_select" ON duplicate_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "duplicate_reports_insert" ON duplicate_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- fundraise_campaigns_v2: readable by all, insertable by authenticated
CREATE POLICY "fundraise_v2_select" ON fundraise_campaigns_v2
  FOR SELECT USING (true);

CREATE POLICY "fundraise_v2_insert" ON fundraise_campaigns_v2
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "fundraise_v2_update" ON fundraise_campaigns_v2
  FOR UPDATE USING (creator_id = auth.uid());

-- ============================================================
-- Updated_at trigger helper (reuse if exists)
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memorial_claims_updated_at
  BEFORE UPDATE ON memorial_claims
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER duplicate_reports_updated_at
  BEFORE UPDATE ON duplicate_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER fundraise_v2_updated_at
  BEFORE UPDATE ON fundraise_campaigns_v2
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- === 00025_content_import.sql ===

-- ============================================================
-- 00025_content_import.sql
-- Phase 6 Sprint 4: Content Import Center
-- Tables: import_jobs, import_items, connected_accounts
-- ============================================================

-- -------------------------------------------------------
-- 1. import_jobs — tracks bulk import operations
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type   text NOT NULL CHECK (source_type IN (
    'facebook','instagram','twitter','tiktok','google_photos','apple_photos',
    'gedcom','csv','legacy_com','findagrave','ancestry','manual'
  )),
  target_type   text NOT NULL CHECK (target_type IN (
    'memorial','living_tribute','memory_vault','family_tree','profile'
  )),
  target_id     uuid,
  status        text DEFAULT 'pending' CHECK (status IN (
    'pending','processing','completed','failed','partial'
  )),
  total_items     integer DEFAULT 0,
  imported_items  integer DEFAULT 0,
  failed_items    integer DEFAULT 0,
  error_log       jsonb DEFAULT '[]'::jsonb,
  source_metadata jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- -------------------------------------------------------
-- 2. import_items — individual items within an import job
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id   uuid NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  source_url      text,
  source_id       text,
  content_type    text NOT NULL CHECK (content_type IN (
    'photo','video','text','post','story','memory','person','relationship'
  )),
  content         text,
  media_url       text,
  metadata        jsonb,
  status          text DEFAULT 'pending' CHECK (status IN (
    'pending','imported','skipped','failed'
  )),
  target_item_id  uuid,
  created_at      timestamptz DEFAULT now()
);

-- -------------------------------------------------------
-- 3. connected_accounts — OAuth social account links
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS connected_accounts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform                text NOT NULL CHECK (platform IN (
    'facebook','instagram','twitter','tiktok','google','apple'
  )),
  platform_user_id        text,
  access_token_encrypted  text,
  refresh_token_encrypted text,
  token_expires_at        timestamptz,
  display_name            text,
  avatar_url              text,
  is_active               boolean DEFAULT true,
  last_sync_at            timestamptz,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_import_jobs_user
  ON import_jobs (user_id, status);

CREATE INDEX IF NOT EXISTS idx_import_items_job
  ON import_items (import_job_id);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user
  ON connected_accounts (user_id);

-- -------------------------------------------------------
-- RLS — all tables private to the owning user
-- -------------------------------------------------------

-- import_jobs
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_jobs_select_own"
  ON import_jobs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "import_jobs_insert_own"
  ON import_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "import_jobs_update_own"
  ON import_jobs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "import_jobs_delete_own"
  ON import_jobs FOR DELETE
  USING (user_id = auth.uid());

-- import_items (access via parent job ownership)
ALTER TABLE import_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_items_select_own"
  ON import_items FOR SELECT
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_insert_own"
  ON import_items FOR INSERT
  WITH CHECK (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_update_own"
  ON import_items FOR UPDATE
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_delete_own"
  ON import_items FOR DELETE
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

-- connected_accounts
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connected_accounts_select_own"
  ON connected_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "connected_accounts_insert_own"
  ON connected_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "connected_accounts_update_own"
  ON connected_accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "connected_accounts_delete_own"
  ON connected_accounts FOR DELETE
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- updated_at trigger for import_jobs
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_import_jobs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_import_jobs_updated_at();

-- -------------------------------------------------------
-- updated_at trigger for connected_accounts
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_connected_accounts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_connected_accounts_updated_at
  BEFORE UPDATE ON connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_connected_accounts_updated_at();

-- === 00026_directory_lifecycle.sql ===

-- ============================================================
-- Migration 00026: Directory Mass Import & Lifecycle Stages
-- Phase 6, Sprint 5
-- ============================================================

-- 1. Directory Import Batches
CREATE TABLE IF NOT EXISTS directory_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('google_places','yelp','manual_csv','partnership','web_scrape')),
  category text NOT NULL,
  region text,
  total_listings integer DEFAULT 0,
  imported_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  imported_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Celebrity Memorial Requests
CREATE TABLE IF NOT EXISTS celebrity_memorial_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  celebrity_name text NOT NULL,
  wikipedia_url text,
  known_for text,
  date_of_birth date,
  date_of_death date,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','created','rejected')),
  memorial_id uuid REFERENCES memorials(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3. Lifecycle Stages
CREATE TABLE IF NOT EXISTS lifecycle_stages (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  color text NOT NULL,
  features text[],
  sort_order integer
);

-- 4. ALTER existing tables
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'remember';

-- living_tributes may not exist yet; wrap in DO block
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'living_tributes') THEN
    ALTER TABLE living_tributes ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'celebrate';
  END IF;
END $$;

-- ============================================================
-- SEED: Lifecycle Stages
-- ============================================================
INSERT INTO lifecycle_stages (id, name, description, icon, color, features, sort_order) VALUES
  (1, 'Celebrate', 'Honor achievements, milestones, and birthdays while they are living', 'sparkles', '#F59E0B', ARRAY['Living tributes','Birthday celebrations','Achievement honors'], 1),
  (2, 'Preserve', 'Capture stories, photos, and memories before they fade', 'camera', '#3B82F6', ARRAY['Memory vault','Family tree','Story recording'], 2),
  (3, 'Support', 'Rally around those who are aging, ill, or transitioning', 'heart', '#EC4899', ARRAY['Care circles','Gift flowers','Support messages'], 3),
  (4, 'Remember', 'After passing, keep their memory alive', 'flame', '#8B5CF6', ARRAY['Memorials','Tribute wall','Candle lighting'], 4),
  (5, 'Legacy', 'Their impact continues through stories, lessons, and inspiration', 'star', '#F97316', ARRAY['Legacy profiles','Inspiration feed','Impact stories'], 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: Sample Directory Import Batches
-- ============================================================
INSERT INTO directory_import_batches (source, category, region, total_listings, imported_count, status) VALUES
  ('google_places', 'Funeral Homes', 'New York, NY', 250, 250, 'completed'),
  ('yelp', 'Florists', 'Los Angeles, CA', 180, 180, 'completed'),
  ('manual_csv', 'Grief Counselors', 'Chicago, IL', 45, 45, 'completed'),
  ('partnership', 'Memorial Parks', 'Houston, TX', 120, 98, 'processing'),
  ('web_scrape', 'Estate Attorneys', 'Miami, FL', 90, 0, 'pending')
ON CONFLICT DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

-- directory_import_batches: readable by admins only
ALTER TABLE directory_import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read import batches"
  ON directory_import_batches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert import batches"
  ON directory_import_batches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- celebrity_memorial_requests: insertable by authenticated, readable by requester
ALTER TABLE celebrity_memorial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can request celebrity memorials"
  ON celebrity_memorial_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can read their own requests"
  ON celebrity_memorial_requests FOR SELECT
  USING (auth.uid() = requested_by);

-- lifecycle_stages: readable by all (public reference data)
ALTER TABLE lifecycle_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lifecycle stages"
  ON lifecycle_stages FOR SELECT
  USING (true);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_directory_import_batches_status ON directory_import_batches(status);
CREATE INDEX IF NOT EXISTS idx_directory_import_batches_region ON directory_import_batches(region);
CREATE INDEX IF NOT EXISTS idx_celebrity_memorial_requests_status ON celebrity_memorial_requests(status);
CREATE INDEX IF NOT EXISTS idx_celebrity_memorial_requests_requested_by ON celebrity_memorial_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_lifecycle_stages_sort_order ON lifecycle_stages(sort_order);
CREATE INDEX IF NOT EXISTS idx_memorials_lifecycle_stage ON memorials(lifecycle_stage);

-- === 00027_phase6_polish.sql ===

-- Phase 6 Sprint 6: Polish & notifications enhancement
-- Add metadata column for rich notification data
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);
