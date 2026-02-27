-- ============================================================
-- 00016_advanced_social.sql
-- Advanced Social Features: Follows, Activity Feed, Badges, Mentions
-- ============================================================

-- ============================================================
-- 1. User Follows
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

-- ============================================================
-- 2. User Activities (Activity Feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN (
    'tribute_posted', 'memorial_followed', 'candle_lit', 'comment_posted',
    'reaction_given', 'streak_achieved', 'badge_earned', 'vault_item_added',
    'capsule_created', 'photo_uploaded', 'event_created', 'donation_made',
    'nft_minted', 'live_room_created', 'scrapbook_published', 'user_followed'
  )),
  target_type text, -- 'memorial', 'tribute', 'user', 'event', etc.
  target_id uuid,
  metadata jsonb DEFAULT '{}',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_activities_user ON public.user_activities(user_id, created_at DESC);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX idx_user_activities_public ON public.user_activities(is_public, created_at DESC);

-- ============================================================
-- 3. Badge Definitions (Catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_type text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'ribbon',
  category text NOT NULL CHECK (category IN (
    'contribution', 'engagement', 'streak', 'social', 'special'
  )),
  requirement_count integer NOT NULL DEFAULT 1,
  tier_thresholds jsonb DEFAULT '{"bronze": 1, "silver": 5, "gold": 25, "platinum": 100}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. User Badges (Earned)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL REFERENCES public.badge_definitions(badge_type) ON DELETE CASCADE,
  badge_tier text NOT NULL DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  progress integer NOT NULL DEFAULT 0,
  is_displayed boolean NOT NULL DEFAULT true,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_displayed ON public.user_badges(user_id, is_displayed) WHERE is_displayed = true;

-- ============================================================
-- 5. Mentions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentioned_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentioned_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type text NOT NULL CHECK (context_type IN ('tribute', 'comment', 'chat')),
  context_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentions_user ON public.mentions(mentioned_user_id, created_at DESC);
CREATE INDEX idx_mentions_unread ON public.mentions(mentioned_user_id, is_read) WHERE is_read = false;

-- ============================================================
-- 6. ALTER profiles — add social count columns
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS follower_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_count integer NOT NULL DEFAULT 0;

-- ============================================================
-- 7. Triggers — Auto-update follower/following counts
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_follow_count_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_follow_count ON public.user_follows;
CREATE TRIGGER trg_follow_count
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_count_change();

-- Auto-update badge count on profiles
CREATE OR REPLACE FUNCTION public.handle_badge_count_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET badge_count = badge_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET badge_count = GREATEST(badge_count - 1, 0) WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_badge_count ON public.user_badges;
CREATE TRIGGER trg_badge_count
  AFTER INSERT OR DELETE ON public.user_badges
  FOR EACH ROW EXECUTE FUNCTION public.handle_badge_count_change();

-- ============================================================
-- 8. RLS Policies
-- ============================================================

-- user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
  ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public activities visible to all"
  ON public.user_activities FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- badge_definitions
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badge definitions"
  ON public.badge_definitions FOR SELECT USING (true);

-- user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view earned badges"
  ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "System can insert badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can toggle badge display"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- mentions
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their mentions"
  ON public.mentions FOR SELECT
  USING (auth.uid() = mentioned_user_id OR auth.uid() = mentioned_by);

CREATE POLICY "Users can create mentions"
  ON public.mentions FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by);

CREATE POLICY "Users can mark mentions read"
  ON public.mentions FOR UPDATE
  USING (auth.uid() = mentioned_user_id)
  WITH CHECK (auth.uid() = mentioned_user_id);

-- ============================================================
-- 9. Seed Badge Definitions
-- ============================================================
INSERT INTO public.badge_definitions (badge_type, name, description, icon, category, requirement_count, tier_thresholds) VALUES
  ('first_tribute', 'First Tribute', 'Posted your first tribute to a memorial', 'heart', 'contribution', 1, '{"bronze": 1, "silver": 10, "gold": 50, "platinum": 200}'),
  ('candlelight', 'Candlelight', 'Lit candles in remembrance', 'flame', 'contribution', 1, '{"bronze": 1, "silver": 25, "gold": 100, "platinum": 500}'),
  ('devoted', 'Devoted', 'Visited memorials consistently', 'calendar', 'streak', 7, '{"bronze": 7, "silver": 30, "gold": 90, "platinum": 365}'),
  ('memory_keeper', 'Memory Keeper', 'Added items to the Memory Vault', 'archive', 'contribution', 1, '{"bronze": 1, "silver": 10, "gold": 50, "platinum": 200}'),
  ('community_builder', 'Community Builder', 'Followed other community members', 'people', 'social', 5, '{"bronze": 5, "silver": 25, "gold": 100, "platinum": 500}'),
  ('storyteller', 'Storyteller', 'Shared stories and memories', 'book', 'contribution', 1, '{"bronze": 1, "silver": 5, "gold": 25, "platinum": 100}'),
  ('generous_heart', 'Generous Heart', 'Made donations to memorial campaigns', 'gift', 'engagement', 1, '{"bronze": 1, "silver": 5, "gold": 20, "platinum": 50}'),
  ('event_planner', 'Event Planner', 'Created memorial events', 'calendar', 'engagement', 1, '{"bronze": 1, "silver": 5, "gold": 15, "platinum": 50}'),
  ('time_traveler', 'Time Traveler', 'Created time capsules', 'time', 'special', 1, '{"bronze": 1, "silver": 3, "gold": 10, "platinum": 25}'),
  ('digital_artist', 'Digital Artist', 'Published scrapbook pages', 'brush', 'special', 1, '{"bronze": 1, "silver": 5, "gold": 15, "platinum": 50}')
ON CONFLICT (badge_type) DO NOTHING;
