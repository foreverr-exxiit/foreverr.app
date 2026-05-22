-- ============================================================
-- Migration 00035: Universal Host System, Welcome Journey & Quests
-- ============================================================
-- Extends the host/co-host/contributor concept to ALL page types
-- (not just memorials), adds 7-day welcome journey for new users,
-- and introduces achievement quests for gamification.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. UNIVERSAL PAGE HOSTS
-- ────────────────────────────────────────────────────────────
-- Polymorphic table: page_type + page_id targets any content type.
-- Replaces memorial_hosts for new pages; legacy memorial_hosts
-- data is migrated below.

CREATE TABLE IF NOT EXISTS page_hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL CHECK (page_type IN (
    'memorial', 'living_tribute', 'event', 'family_tree',
    'virtual_space', 'wedding', 'pet_page'
  )),
  page_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN (
    'owner', 'co_host', 'contributor', 'moderator'
  )),
  relationship text CHECK (relationship IN (
    'immediate_family', 'extended_family', 'friend', 'colleague',
    'fan', 'spouse', 'partner', 'pet_owner', 'caretaker',
    'wedding_party', 'organizer', 'other'
  )),
  relationship_detail text,
  permissions jsonb DEFAULT '{
    "can_edit_details": false,
    "can_add_media": true,
    "can_invite_others": false,
    "can_delete_content": false,
    "can_manage_hosts": false,
    "can_moderate": false
  }'::jsonb,
  invited_by uuid REFERENCES profiles(id),
  invite_status text DEFAULT 'accepted' CHECK (invite_status IN (
    'pending', 'accepted', 'declined'
  )),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_type, page_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_page_hosts_page ON page_hosts(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_hosts_user ON page_hosts(user_id);
CREATE INDEX IF NOT EXISTS idx_page_hosts_invite ON page_hosts(invite_status) WHERE invite_status = 'pending';

-- Default permissions by role (applied via trigger on insert)
CREATE OR REPLACE FUNCTION set_page_host_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'owner' THEN
    NEW.permissions = '{
      "can_edit_details": true,
      "can_add_media": true,
      "can_invite_others": true,
      "can_delete_content": true,
      "can_manage_hosts": true,
      "can_moderate": true
    }'::jsonb;
  ELSIF NEW.role = 'co_host' THEN
    NEW.permissions = '{
      "can_edit_details": true,
      "can_add_media": true,
      "can_invite_others": true,
      "can_delete_content": false,
      "can_manage_hosts": false,
      "can_moderate": true
    }'::jsonb;
  ELSIF NEW.role = 'moderator' THEN
    NEW.permissions = '{
      "can_edit_details": false,
      "can_add_media": false,
      "can_invite_others": false,
      "can_delete_content": true,
      "can_manage_hosts": false,
      "can_moderate": true
    }'::jsonb;
  ELSE  -- contributor
    NEW.permissions = '{
      "can_edit_details": false,
      "can_add_media": true,
      "can_invite_others": false,
      "can_delete_content": false,
      "can_manage_hosts": false,
      "can_moderate": false
    }'::jsonb;
  END IF;

  IF NEW.invite_status = 'accepted' AND NEW.accepted_at IS NULL THEN
    NEW.accepted_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_page_host_permissions
  BEFORE INSERT ON page_hosts
  FOR EACH ROW
  EXECUTE FUNCTION set_page_host_permissions();

-- RLS policies
ALTER TABLE page_hosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_hosts_select" ON page_hosts
  FOR SELECT USING (true);

CREATE POLICY "page_hosts_insert" ON page_hosts
  FOR INSERT WITH CHECK (
    -- Owner/co_host of the same page can invite, OR self-insert as owner on creation
    user_id = auth.uid()
    OR (
      invited_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM page_hosts ph
        WHERE ph.page_type = page_hosts.page_type
          AND ph.page_id = page_hosts.page_id
          AND ph.user_id = auth.uid()
          AND ph.role IN ('owner', 'co_host')
          AND ph.invite_status = 'accepted'
      )
    )
  );

CREATE POLICY "page_hosts_update" ON page_hosts
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = page_hosts.page_type
        AND ph.page_id = page_hosts.page_id
        AND ph.user_id = auth.uid()
        AND ph.role = 'owner'
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "page_hosts_delete" ON page_hosts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = page_hosts.page_type
        AND ph.page_id = page_hosts.page_id
        AND ph.user_id = auth.uid()
        AND ph.role = 'owner'
        AND ph.invite_status = 'accepted'
    )
    AND role != 'owner'
  );

-- ── Migrate existing memorial_hosts → page_hosts ──
INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, relationship_detail, invited_by, invite_status, accepted_at, created_at)
SELECT
  'memorial',
  mh.memorial_id,
  mh.user_id,
  CASE
    WHEN mh.role = 'co_host' THEN 'co_host'
    WHEN mh.role = 'owner' THEN 'owner'
    ELSE 'contributor'
  END,
  mh.relationship,
  mh.relationship_detail,
  mh.invited_by,
  CASE WHEN mh.accepted_at IS NOT NULL THEN 'accepted' ELSE 'pending' END,
  mh.accepted_at,
  mh.created_at
FROM memorial_hosts mh
ON CONFLICT (page_type, page_id, user_id) DO NOTHING;

-- ── Auto-insert owners for existing living_tributes ──
INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
SELECT 'living_tribute', lt.id, lt.created_by, 'owner', 'other', 'accepted'
FROM living_tributes lt
WHERE lt.created_by IS NOT NULL
ON CONFLICT (page_type, page_id, user_id) DO NOTHING;

-- ── Auto-insert owners for existing events ──
INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
SELECT 'event', e.id, e.created_by, 'owner', 'organizer', 'accepted'
FROM events e
WHERE e.created_by IS NOT NULL
ON CONFLICT (page_type, page_id, user_id) DO NOTHING;

-- ── Auto-insert owners for existing family_trees ──
INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
SELECT 'family_tree', ft.id, ft.created_by, 'owner', 'immediate_family', 'accepted'
FROM family_trees ft
WHERE ft.created_by IS NOT NULL
ON CONFLICT (page_type, page_id, user_id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. PAGE INVITATIONS (unified invite system)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL,
  page_id uuid NOT NULL,
  invited_by uuid NOT NULL REFERENCES profiles(id),
  invited_email text,
  invited_user_id uuid REFERENCES profiles(id),
  proposed_role text NOT NULL DEFAULT 'contributor' CHECK (proposed_role IN (
    'co_host', 'contributor', 'moderator'
  )),
  invite_code text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_invitations_page ON page_invitations(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_invitations_user ON page_invitations(invited_user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_page_invitations_email ON page_invitations(invited_email) WHERE status = 'pending';

ALTER TABLE page_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_invitations_select" ON page_invitations
  FOR SELECT USING (
    invited_user_id = auth.uid()
    OR invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = page_invitations.page_type
        AND ph.page_id = page_invitations.page_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
    )
  );

CREATE POLICY "page_invitations_insert" ON page_invitations
  FOR INSERT WITH CHECK (
    invited_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = page_invitations.page_type
        AND ph.page_id = page_invitations.page_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "page_invitations_update" ON page_invitations
  FOR UPDATE USING (
    invited_user_id = auth.uid()
    OR invited_by = auth.uid()
  );


-- ────────────────────────────────────────────────────────────
-- 3. WELCOME JOURNEY (7-day new user onboarding)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS welcome_journey (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  task_key text NOT NULL,
  task_title text NOT NULL,
  task_description text,
  points_reward integer NOT NULL DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  is_claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_welcome_journey_user ON welcome_journey(user_id);

ALTER TABLE welcome_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "welcome_journey_select" ON welcome_journey
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "welcome_journey_update" ON welcome_journey
  FOR UPDATE USING (user_id = auth.uid());

-- Trigger: create welcome journey for every new user
CREATE OR REPLACE FUNCTION create_welcome_journey()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO welcome_journey (user_id, day_number, task_key, task_title, task_description, points_reward) VALUES
    (NEW.id, 1, 'complete_profile',  'Complete Your Profile',     'Add a photo and bio to your profile',                           25),
    (NEW.id, 2, 'explore_page',      'Explore & Follow a Page',   'Visit any memorial, tribute, or celebration and follow it',     15),
    (NEW.id, 3, 'daily_prompt',      'Answer a Daily Prompt',     'Share a memory or reflection to today''s prompt',               15),
    (NEW.id, 4, 'send_gift',         'Send Your First Gift',      'Send a free flower or candle to any page',                      20),
    (NEW.id, 5, 'create_page',       'Create Your First Page',    'Start a memorial, tribute, pet page, or wedding page',          50),
    (NEW.id, 6, 'invite_friend',     'Invite a Friend',           'Share Foreverr with someone you care about',                    25),
    (NEW.id, 7, 'week_complete',     'Week One Complete!',         'Return for 7 days and claim your bonus',                        100);

  -- Award Day 1 signup bonus (25 points)
  INSERT INTO legacy_points (user_id, points, action_type, description)
  VALUES (NEW.id, 25, 'daily_login', 'Welcome to Foreverr! Signup bonus')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only fire if welcome_journey doesn't already exist for this user
CREATE OR REPLACE FUNCTION maybe_create_welcome_journey()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM welcome_journey WHERE user_id = NEW.id LIMIT 1) THEN
    PERFORM create_welcome_journey();
    -- Manually insert since we can't call trigger functions directly
    INSERT INTO welcome_journey (user_id, day_number, task_key, task_title, task_description, points_reward) VALUES
      (NEW.id, 1, 'complete_profile',  'Complete Your Profile',     'Add a photo and bio to your profile',                           25),
      (NEW.id, 2, 'explore_page',      'Explore & Follow a Page',   'Visit any memorial, tribute, or celebration and follow it',     15),
      (NEW.id, 3, 'daily_prompt',      'Answer a Daily Prompt',     'Share a memory or reflection to today''s prompt',               15),
      (NEW.id, 4, 'send_gift',         'Send Your First Gift',      'Send a free flower or candle to any page',                      20),
      (NEW.id, 5, 'create_page',       'Create Your First Page',    'Start a memorial, tribute, pet page, or wedding page',          50),
      (NEW.id, 6, 'invite_friend',     'Invite a Friend',           'Share Foreverr with someone you care about',                    25),
      (NEW.id, 7, 'week_complete',     'Week One Complete!',         'Return for 7 days and claim your bonus',                        100)
    ON CONFLICT (user_id, day_number) DO NOTHING;

    -- Award signup bonus
    INSERT INTO legacy_points (user_id, points, action_type, description)
    VALUES (NEW.id, 25, 'daily_login', 'Welcome to Foreverr! Signup bonus')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_welcome_journey ON profiles;
CREATE TRIGGER trg_create_welcome_journey
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION maybe_create_welcome_journey();


-- ────────────────────────────────────────────────────────────
-- 4. ACHIEVEMENT QUESTS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievement_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'trophy',
  emoji text DEFAULT '🏆',
  category text CHECK (category IN ('newcomer', 'social', 'creator', 'collector', 'community')),
  action_type text NOT NULL,     -- e.g., 'create_tribute', 'send_gift', 'follow_user'
  required_count integer NOT NULL DEFAULT 1,
  reward_points integer NOT NULL DEFAULT 50,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES achievement_quests(id) ON DELETE CASCADE,
  current_count integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  reward_claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user ON user_quest_progress(user_id);

ALTER TABLE achievement_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievement_quests_select" ON achievement_quests
  FOR SELECT USING (true);

CREATE POLICY "user_quest_progress_select" ON user_quest_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_quest_progress_upsert" ON user_quest_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_quest_progress_update" ON user_quest_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Seed starter quests
INSERT INTO achievement_quests (name, description, icon, emoji, category, action_type, required_count, reward_points, sort_order) VALUES
  ('First Tribute',      'Write your first tribute to someone special',        'create',      '✍️', 'newcomer',  'create_tribute',     1,   50,  1),
  ('Gift Giver',         'Send 3 gifts to show your love',                      'gift',        '🎁', 'social',    'send_gift',          3,   40,  2),
  ('Memory Keeper',      'Upload 10 photos to preserve memories',               'camera',      '📸', 'collector', 'upload_photo',       10,  60,  3),
  ('Social Butterfly',   'Follow 5 users or pages',                             'people',      '🦋', 'social',    'follow',             5,   30,  4),
  ('Family Historian',   'Add 5 members to a family tree',                      'git-branch',  '🌳', 'creator',   'add_family_member',  5,   75,  5),
  ('Streak Champion',    'Maintain a 7-day engagement streak',                  'flame',       '🔥', 'community', 'streak_day',         7,  100,  6),
  ('Storyteller',        'Write 5 tributes sharing memories',                   'book',        '📖', 'creator',   'create_tribute',     5,   80,  7),
  ('Generous Heart',     'Send 10 gifts total',                                 'heart',       '💝', 'social',    'send_gift',          10, 100,  8),
  ('Community Builder',  'Invite 3 friends to join Foreverr',                   'person-add',  '🤝', 'community', 'invite_friend',      3,   75,  9),
  ('Daily Devotion',     'Answer 10 daily prompts',                             'chatbox',     '💭', 'community', 'answer_prompt',      10,  80, 10)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 5. DAILY SPOTLIGHT (random kindness)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_spotlight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spotlight_date date NOT NULL UNIQUE,
  reason text DEFAULT 'random_kindness',
  bonus_points integer DEFAULT 50,
  has_paid_forward boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_spotlight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_spotlight_select" ON daily_spotlight
  FOR SELECT USING (true);

CREATE POLICY "daily_spotlight_update" ON daily_spotlight
  FOR UPDATE USING (user_id = auth.uid());
