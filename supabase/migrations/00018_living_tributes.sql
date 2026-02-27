-- ============================================================
-- Migration 00018: Living Tributes & Appreciation Letters
-- Phase 5, Sprint 2: Honor the Living
-- ============================================================

-- ============================================================
-- Table: living_tributes
-- Tribute pages for people who are ALIVE
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tributes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  honoree_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  honoree_name    text NOT NULL,
  honoree_email   text,
  honoree_photo_url text,
  cover_photo_url text,
  title           text NOT NULL,
  description     text,
  occasion        text CHECK (occasion IN (
    'birthday', 'anniversary', 'retirement', 'graduation',
    'appreciation', 'get_well', 'wedding', 'achievement',
    'just_because', 'other'
  )),
  occasion_date   date,
  privacy         text DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invited', 'honoree_only')),
  status          text DEFAULT 'active' CHECK (status IN ('active', 'converted_to_memorial', 'archived')),
  memorial_id     uuid REFERENCES memorials(id) ON DELETE SET NULL,
  slug            text NOT NULL UNIQUE,
  contributor_count integer DEFAULT 0,
  message_count   integer DEFAULT 0,
  view_count      integer DEFAULT 0,
  is_surprise     boolean DEFAULT false,
  reveal_at       timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_living_tribute_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM living_tributes WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_living_tribute_slug
  BEFORE INSERT ON living_tributes
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_living_tribute_slug();

-- ============================================================
-- Table: living_tribute_messages
-- Messages/contributions on living tributes
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tribute_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id      uuid NOT NULL REFERENCES living_tributes(id) ON DELETE CASCADE,
  author_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text,
  media_url       text,
  media_type      text CHECK (media_type IN ('photo', 'video', 'voice')),
  reaction_count  integer DEFAULT 0,
  is_anonymous    boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-increment contributor_count and message_count
CREATE OR REPLACE FUNCTION update_living_tribute_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE living_tributes
    SET message_count = message_count + 1,
        contributor_count = (
          SELECT COUNT(DISTINCT author_id)
          FROM living_tribute_messages
          WHERE tribute_id = NEW.tribute_id
        ),
        updated_at = now()
    WHERE id = NEW.tribute_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE living_tributes
    SET message_count = GREATEST(message_count - 1, 0),
        contributor_count = (
          SELECT COUNT(DISTINCT author_id)
          FROM living_tribute_messages
          WHERE tribute_id = OLD.tribute_id
        ),
        updated_at = now()
    WHERE id = OLD.tribute_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_living_tribute_message_counts
  AFTER INSERT OR DELETE ON living_tribute_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_living_tribute_counts();

-- ============================================================
-- Table: living_tribute_invites
-- Invite people to contribute to a living tribute
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tribute_invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id      uuid NOT NULL REFERENCES living_tributes(id) ON DELETE CASCADE,
  invited_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_email   text,
  invited_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code     text DEFAULT encode(gen_random_bytes(8), 'hex'),
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at      timestamptz DEFAULT now(),
  UNIQUE(tribute_id, invited_email)
);

-- ============================================================
-- Table: appreciation_letters
-- Letters of appreciation for living people
-- ============================================================
CREATE TABLE IF NOT EXISTS appreciation_letters (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_name    text NOT NULL,
  recipient_email   text,
  subject           text NOT NULL,
  content           text NOT NULL,
  media_url         text,
  delivery_type     text DEFAULT 'immediate' CHECK (delivery_type IN ('immediate', 'scheduled', 'on_occasion')),
  delivery_date     date,
  occasion          text,
  is_delivered      boolean DEFAULT false,
  delivered_at      timestamptz,
  is_read           boolean DEFAULT false,
  read_at           timestamptz,
  is_public         boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_living_tributes_created_by ON living_tributes(created_by);
CREATE INDEX idx_living_tributes_honoree ON living_tributes(honoree_user_id);
CREATE INDEX idx_living_tributes_slug ON living_tributes(slug);
CREATE INDEX idx_living_tributes_status ON living_tributes(status);
CREATE INDEX idx_living_tributes_occasion ON living_tributes(occasion);

CREATE INDEX idx_living_tribute_messages_tribute ON living_tribute_messages(tribute_id);
CREATE INDEX idx_living_tribute_messages_author ON living_tribute_messages(author_id);

CREATE INDEX idx_living_tribute_invites_tribute ON living_tribute_invites(tribute_id);
CREATE INDEX idx_living_tribute_invites_code ON living_tribute_invites(invite_code);
CREATE INDEX idx_living_tribute_invites_email ON living_tribute_invites(invited_email);

CREATE INDEX idx_appreciation_letters_author ON appreciation_letters(author_id);
CREATE INDEX idx_appreciation_letters_recipient ON appreciation_letters(recipient_user_id);
CREATE INDEX idx_appreciation_letters_delivery ON appreciation_letters(delivery_type, delivery_date);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE living_tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_tribute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_tribute_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE appreciation_letters ENABLE ROW LEVEL SECURITY;

-- Living Tributes: public readable, creator-manageable
CREATE POLICY "living_tributes_select" ON living_tributes
  FOR SELECT USING (
    privacy = 'public'
    OR created_by = auth.uid()
    OR honoree_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM living_tribute_invites
      WHERE tribute_id = living_tributes.id
      AND (invited_user_id = auth.uid() OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      AND status = 'accepted'
    )
  );

CREATE POLICY "living_tributes_insert" ON living_tributes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "living_tributes_update" ON living_tributes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "living_tributes_delete" ON living_tributes
  FOR DELETE USING (auth.uid() = created_by);

-- Messages: readable if tribute is visible, insertable by authenticated
CREATE POLICY "living_tribute_messages_select" ON living_tribute_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM living_tributes
      WHERE id = living_tribute_messages.tribute_id
      AND (privacy = 'public' OR created_by = auth.uid() OR honoree_user_id = auth.uid())
    )
  );

CREATE POLICY "living_tribute_messages_insert" ON living_tribute_messages
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "living_tribute_messages_update" ON living_tribute_messages
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "living_tribute_messages_delete" ON living_tribute_messages
  FOR DELETE USING (auth.uid() = author_id);

-- Invites: visible to inviter and invitee
CREATE POLICY "living_tribute_invites_select" ON living_tribute_invites
  FOR SELECT USING (
    invited_by = auth.uid()
    OR invited_user_id = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "living_tribute_invites_insert" ON living_tribute_invites
  FOR INSERT WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "living_tribute_invites_update" ON living_tribute_invites
  FOR UPDATE USING (
    invited_by = auth.uid()
    OR invited_user_id = auth.uid()
  );

-- Appreciation Letters: visible to author and recipient
CREATE POLICY "appreciation_letters_select" ON appreciation_letters
  FOR SELECT USING (
    author_id = auth.uid()
    OR recipient_user_id = auth.uid()
    OR is_public = true
  );

CREATE POLICY "appreciation_letters_insert" ON appreciation_letters
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "appreciation_letters_update" ON appreciation_letters
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = recipient_user_id);

CREATE POLICY "appreciation_letters_delete" ON appreciation_letters
  FOR DELETE USING (auth.uid() = author_id);
