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
  created_at         timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id, (created_at::date))
);

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
