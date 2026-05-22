-- ============================================================
-- Migration 00044: Progressive Feature Unlocking
-- Gates features behind user point levels so new users
-- aren't overwhelmed and must earn access to advanced features.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. FEATURE UNLOCKS — maps features to required levels
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feature_unlocks (
  id              serial PRIMARY KEY,
  feature_key     text UNIQUE NOT NULL,
  label           text NOT NULL,
  description     text,
  required_level  integer NOT NULL DEFAULT 1 CHECK (required_level >= 1 AND required_level <= 7),
  required_trust_level integer NOT NULL DEFAULT 1,
  required_premium_tier integer NOT NULL DEFAULT 0,
  category        text NOT NULL DEFAULT 'general',
  icon            text,
  unlock_message  text,
  sort_order      integer DEFAULT 0,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. USER FEATURE UNLOCKS — tracks per-user unlock state
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_feature_unlocks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key       text NOT NULL,
  unlocked_at       timestamptz DEFAULT now(),
  seen_notification boolean DEFAULT false,
  UNIQUE(user_id, feature_key)
);

CREATE INDEX idx_user_feature_unlocks_user ON user_feature_unlocks(user_id);
CREATE INDEX idx_user_feature_unlocks_unseen ON user_feature_unlocks(user_id) WHERE seen_notification = false;

-- ────────────────────────────────────────────────────────────
-- 3. ALTER profiles — add feature tier tracking
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN feature_tier integer DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN features_unlocked text[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- 4. RLS POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE feature_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_unlocks ENABLE ROW LEVEL SECURITY;

-- feature_unlocks: anyone can read (public catalog)
CREATE POLICY "feature_unlocks_select" ON feature_unlocks
  FOR SELECT USING (true);

-- user_feature_unlocks: users see only their own
CREATE POLICY "user_feature_unlocks_select" ON user_feature_unlocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_feature_unlocks_insert" ON user_feature_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_feature_unlocks_update" ON user_feature_unlocks
  FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 5. AUTO-UNLOCK TRIGGER — when user levels up
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_level_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when level actually changes upward
  IF NEW.level > OLD.level THEN
    -- Insert unlocks for all features at or below new level
    INSERT INTO user_feature_unlocks (user_id, feature_key, unlocked_at, seen_notification)
    SELECT NEW.user_id, fu.feature_key, now(), false
    FROM feature_unlocks fu
    WHERE fu.required_level <= NEW.level
      AND fu.is_active = true
    ON CONFLICT (user_id, feature_key) DO NOTHING;

    -- Update profile feature_tier
    UPDATE profiles
    SET feature_tier = NEW.level,
        features_unlocked = ARRAY(
          SELECT feature_key FROM user_feature_unlocks WHERE user_id = NEW.user_id
        )
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_level_change
  AFTER UPDATE OF level ON legacy_point_balances
  FOR EACH ROW
  EXECUTE FUNCTION handle_level_change();

-- ────────────────────────────────────────────────────────────
-- 6. SEED FEATURE UNLOCK CATALOG
-- ────────────────────────────────────────────────────────────

-- Level 1 — Seedling (0 points) — Core basics
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('create_page',         'Create Pages',          'Create memorial, celebration, and lifecycle pages',  1, 'core',       'add-circle',    'Welcome! Start creating pages to honor lives.',          1),
  ('post_tribute',        'Post Tributes',         'Write tributes on pages you follow',                 1, 'social',     'heart',         'Share your memories and tributes.',                       2),
  ('follow_pages',        'Follow Pages',          'Follow pages to stay updated',                       1, 'social',     'people',        'Follow pages that matter to you.',                       3),
  ('reactions',           'Reactions',             'React to tributes, photos, and updates',             1, 'social',     'thumbs-up',     'Express yourself with reactions.',                        4),
  ('basic_profile',       'Profile Setup',         'Set up your basic profile',                          1, 'core',       'person',        'Personalize your ǝterrn profile.',                       5),
  ('echoes_feed',         'Echoes Feed',           'View your personalized Echoes activity feed',        1, 'core',       'pulse',         'Stay connected with Echoes.',                            6),
  ('browse_directory',    'Browse Directory',      'Browse the public page directory',                   1, 'discovery',  'search',        'Explore pages in the directory.',                        7),
  ('view_timeline',       'View The Arc',          'View timeline events on pages',                      1, 'core',       'time',          'Explore life stories in The Arc.',                       8)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 2 — Sprout (100 points) — Social & collaboration
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('chat_dms',            'Chat & DMs',            'Send direct messages to other users',                2, 'social',     'chatbubbles',   'You can now chat with other members!',                  10),
  ('create_events',       'Create Events',         'Create and manage events',                           2, 'social',     'calendar',      'Start organizing events and gatherings.',               11),
  ('photo_albums',        'Photo Albums',          'Create photo albums on pages',                       2, 'content',    'images',        'Create beautiful photo albums.',                        12),
  ('family_tree',         'Family Tree',           'Build and manage family trees',                      2, 'content',    'git-branch',    'Connect family members in your tree.',                  13),
  ('share_links',         'Share Links',           'Generate shareable links for pages',                 2, 'social',     'share-social',  'Share pages with anyone via link.',                     14),
  ('send_gifts',          'Send Gifts',            'Send virtual gifts to pages',                        2, 'social',     'gift',          'Send meaningful virtual gifts.',                        15),
  ('baby_journey',        'Little Arcs',           'Create baby journey pages to track milestones',      2, 'content',    'happy',         'Track your little one''s journey!',                     16),
  ('relationship_events', 'Relationship Events',   'Record relationship milestones and transitions',     2, 'content',    'heart-half',    'Document your relationship journey.',                   17)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 3 — Bloom (500 points) — Creator economy entry
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('creator_hub',         'Creator Hub',           'Access the Creator Hub to offer services and earn',  3, 'creator',    'briefcase',     'Welcome to the Creator Hub! Start earning.',           20),
  ('service_listings',    'Service Listings',      'Create and manage service listings',                 3, 'creator',    'storefront',    'List your services for others to discover.',            21),
  ('templates',           'Templates',             'Create and sell memorial templates',                 3, 'creator',    'document',      'Design templates for the community.',                   22),
  ('honor_fundraisers',   'Honor Fundraisers',     'Create fundraisers in someone''s honor',             3, 'community',  'ribbon',        'Start fundraisers to honor loved ones.',                23),
  ('marketplace_browse',  'Marketplace',           'Browse the full marketplace',                        3, 'discovery',  'cart',          'Explore the marketplace.',                              24),
  ('stewardship',         'Stewardship',           'Access page stewardship and transfer features',      3, 'community',  'shield-checkmark', 'Manage page stewardship.',                           25),
  ('grief_coaching',      'Grief Coaching',        'Access grief coaching services',                     3, 'community',  'medkit',        'Connect with grief coaching professionals.',            26)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 4 — Tree (2,000 points) — Advanced features
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('content_licensing',       'Content Licensing',       'License your content for use by others',        4, 'creator',    'document-lock', 'License your creative work.',                        30),
  ('channel_subscriptions',   'Channel Subscriptions',   'Create subscription channels',                  4, 'creator',    'tv',            'Launch your subscription channel.',                   31),
  ('honor_a_day',             'Honor-a-Day',             'Sponsor Honor-a-Day micro-sponsorships',        4, 'community',  'sunny',         'Sponsor a day in someone''s honor.',                  32),
  ('advanced_analytics',      'Advanced Analytics',      'View detailed page analytics and insights',     4, 'creator',    'analytics',     'Unlock powerful analytics insights.',                 33),
  ('vault_preservation',      'Vault Preservation',      'Order vault preservation services',              4, 'community',  'archive',       'Preserve memories with vault services.',              34)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 5 — Grove (5,000 points) — Elite features
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('featured_placement',      'Featured Placement',      'Eligible for featured placement in directory',  5, 'discovery',  'star',          'You''re now eligible for featured placement!',       40),
  ('community_governance',    'Community Governance',    'Participate in community governance decisions',  5, 'community',  'people-circle', 'Help shape the community.',                          41),
  ('reduced_fees',            'Reduced Fees',            'Reduced platform fees on all transactions',      5, 'creator',    'trending-down', 'Enjoy reduced fees on transactions.',                42)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 6 — Forest (15,000 points) — Veteran features
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('mentorship_tools',        'Mentorship Tools',        'Access tools to mentor newer members',           6, 'community',  'school',        'Guide newer members with mentorship tools.',         50),
  ('beta_features',           'Beta Features',           'Early access to new features',                   6, 'discovery',  'flask',         'Get early access to beta features.',                 51),
  ('priority_support',        'Priority Support',        'Priority customer support queue',                 6, 'core',       'flash',         'You now have priority support access.',               52)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 7 — Eternal (50,000 points) — Legendary
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('founding_member',         'Founding Member',         'Permanent founding member status and perks',      7, 'core',       'trophy',        'You''ve achieved Founding Member status! Thank you.', 60),
  ('zero_fee_transfers',      'Zero-Fee Transfers',      '0% platform fee on first 3 transfers/year',      7, 'creator',    'swap-horizontal', 'Enjoy zero-fee transfers.',                         61)
ON CONFLICT (feature_key) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 7. BOOTSTRAP — auto-unlock Level 1 features for all existing users
-- ────────────────────────────────────────────────────────────

INSERT INTO user_feature_unlocks (user_id, feature_key, unlocked_at, seen_notification)
SELECT p.id, fu.feature_key, now(), true
FROM profiles p
CROSS JOIN feature_unlocks fu
WHERE fu.required_level = 1 AND fu.is_active = true
ON CONFLICT (user_id, feature_key) DO NOTHING;

-- Also unlock features for users who are already at higher levels
INSERT INTO user_feature_unlocks (user_id, feature_key, unlocked_at, seen_notification)
SELECT lpb.user_id, fu.feature_key, now(), true
FROM legacy_point_balances lpb
JOIN feature_unlocks fu ON fu.required_level <= lpb.level AND fu.is_active = true
ON CONFLICT (user_id, feature_key) DO NOTHING;
