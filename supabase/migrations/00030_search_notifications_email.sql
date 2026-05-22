-- ============================================================
-- Migration 00030: Full-text Search, Push Triggers & Email Log
-- ============================================================

-- ============================================================
-- 1. FULL-TEXT SEARCH — tsvector columns + indexes
-- ============================================================

-- Memorials search
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION memorials_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.nickname, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.biography, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.place_of_birth, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.place_of_death, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memorials_search ON memorials;
CREATE TRIGGER trg_memorials_search
  BEFORE INSERT OR UPDATE OF first_name, last_name, nickname, biography, place_of_birth, place_of_death
  ON memorials FOR EACH ROW EXECUTE FUNCTION memorials_search_update();

CREATE INDEX IF NOT EXISTS idx_memorials_search ON memorials USING gin(search_vector);

-- Backfill existing memorials
UPDATE memorials SET search_vector =
  setweight(to_tsvector('english', COALESCE(first_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(last_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(nickname, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(biography, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(place_of_birth, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(place_of_death, '')), 'D')
WHERE search_vector IS NULL;

-- Tributes search
ALTER TABLE tributes ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION tributes_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tributes_search ON tributes;
CREATE TRIGGER trg_tributes_search
  BEFORE INSERT OR UPDATE OF content
  ON tributes FOR EACH ROW EXECUTE FUNCTION tributes_search_update();

CREATE INDEX IF NOT EXISTS idx_tributes_search ON tributes USING gin(search_vector);

UPDATE tributes SET search_vector = to_tsvector('english', COALESCE(content, ''))
WHERE search_vector IS NULL;

-- Directory listings search
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION directory_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.business_type, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_directory_search ON directory_listings;
CREATE TRIGGER trg_directory_search
  BEFORE INSERT OR UPDATE OF business_name, description, city, business_type
  ON directory_listings FOR EACH ROW EXECUTE FUNCTION directory_search_update();

CREATE INDEX IF NOT EXISTS idx_directory_search ON directory_listings USING gin(search_vector);

UPDATE directory_listings SET search_vector =
  setweight(to_tsvector('english', COALESCE(business_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(business_type, '')), 'C')
WHERE search_vector IS NULL;

-- ============================================================
-- 2. PUSH NOTIFICATION TRIGGERS
-- ============================================================

-- Trigger: New tribute → notify memorial creator
CREATE OR REPLACE FUNCTION notify_tribute_created() RETURNS TRIGGER AS $$
DECLARE
  memorial_creator_id uuid;
  memorial_name text;
  author_name text;
BEGIN
  SELECT created_by, CONCAT(first_name, ' ', last_name)
    INTO memorial_creator_id, memorial_name
    FROM memorials WHERE id = NEW.memorial_id;

  SELECT COALESCE(display_name, username, 'Someone')
    INTO author_name
    FROM profiles WHERE id = NEW.author_id;

  -- Don't notify self
  IF memorial_creator_id IS NOT NULL AND memorial_creator_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      memorial_creator_id,
      'tribute',
      'New Tribute',
      author_name || ' left a tribute on ' || memorial_name,
      jsonb_build_object(
        'type', 'tribute',
        'memorial_id', NEW.memorial_id,
        'tribute_id', NEW.id,
        'author_id', NEW.author_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_tribute ON tributes;
CREATE TRIGGER trg_notify_tribute
  AFTER INSERT ON tributes
  FOR EACH ROW EXECUTE FUNCTION notify_tribute_created();

-- Trigger: Gift received → notify recipient
CREATE OR REPLACE FUNCTION notify_gift_received() RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
  gift_name text;
  gift_emoji text;
BEGIN
  SELECT COALESCE(display_name, username, 'Someone')
    INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  SELECT name, icon INTO gift_name, gift_emoji
    FROM gift_catalog WHERE id = NEW.gift_id;

  IF NEW.recipient_id IS NOT NULL AND NEW.recipient_id != NEW.sender_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.recipient_id,
      'gift',
      COALESCE(gift_emoji, '🌸') || ' Gift Received!',
      sender_name || ' sent you ' || COALESCE(gift_name, 'a gift'),
      jsonb_build_object(
        'type', 'gift',
        'gift_transaction_id', NEW.id,
        'sender_id', NEW.sender_id,
        'gift_name', COALESCE(gift_name, 'gift')
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_gift ON gift_transactions;
CREATE TRIGGER trg_notify_gift
  AFTER INSERT ON gift_transactions
  FOR EACH ROW EXECUTE FUNCTION notify_gift_received();

-- Trigger: New follower → notify
CREATE OR REPLACE FUNCTION notify_new_follower() RETURNS TRIGGER AS $$
DECLARE
  follower_name text;
BEGIN
  SELECT COALESCE(display_name, username, 'Someone')
    INTO follower_name FROM profiles WHERE id = NEW.follower_id;

  IF NEW.following_id != NEW.follower_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.following_id,
      'follow',
      'New Follower',
      follower_name || ' started following you',
      jsonb_build_object(
        'type', 'follow',
        'follower_id', NEW.follower_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_follow ON user_follows;
CREATE TRIGGER trg_notify_follow
  AFTER INSERT ON user_follows
  FOR EACH ROW EXECUTE FUNCTION notify_new_follower();

-- Trigger: Milestone added → notify memorial followers
CREATE OR REPLACE FUNCTION notify_milestone_added() RETURNS TRIGGER AS $$
DECLARE
  memorial_name text;
  creator_name text;
BEGIN
  SELECT CONCAT(first_name, ' ', last_name) INTO memorial_name
    FROM memorials WHERE id = NEW.memorial_id;

  SELECT COALESCE(display_name, username, 'Someone')
    INTO creator_name FROM profiles WHERE id = NEW.created_by;

  -- Notify memorial creator if different from milestone creator
  DECLARE memorial_owner uuid;
  BEGIN
    SELECT created_by INTO memorial_owner FROM memorials WHERE id = NEW.memorial_id;
    IF memorial_owner IS NOT NULL AND memorial_owner != NEW.created_by THEN
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        memorial_owner,
        'milestone',
        'New Milestone Added',
        creator_name || ' added "' || NEW.title || '" to ' || memorial_name || '''s timeline',
        jsonb_build_object(
          'type', 'memorial',
          'memorial_id', NEW.memorial_id,
          'milestone_id', NEW.id
        )
      );
    END IF;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_milestone ON life_milestones;
CREATE TRIGGER trg_notify_milestone
  AFTER INSERT ON life_milestones
  FOR EACH ROW EXECUTE FUNCTION notify_milestone_added();

-- ============================================================
-- 3. EMAIL LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  email_type text NOT NULL,
  subject text,
  status text DEFAULT 'sent' CHECK (status IN ('sent','failed','bounced')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email log"
  ON email_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log(created_at DESC);

-- ============================================================
-- 4. SEARCH FUNCTION — Universal search across all content
-- ============================================================
CREATE OR REPLACE FUNCTION search_all(query text, result_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  result_type text,
  title text,
  subtitle text,
  image_url text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Memorials
    SELECT
      m.id,
      'memorial'::text as result_type,
      CONCAT(m.first_name, ' ', m.last_name) as title,
      COALESCE(m.place_of_birth, '') as subtitle,
      m.cover_photo_url as image_url,
      ts_rank(m.search_vector, websearch_to_tsquery('english', query)) as rank
    FROM memorials m
    WHERE m.search_vector @@ websearch_to_tsquery('english', query)
      AND m.status = 'active'

    UNION ALL

    -- Directory Listings
    SELECT
      d.id,
      'directory'::text,
      d.business_name,
      CONCAT(d.city, ', ', COALESCE(d.state, '')),
      d.photo_url,
      ts_rank(d.search_vector, websearch_to_tsquery('english', query))
    FROM directory_listings d
    WHERE d.search_vector @@ websearch_to_tsquery('english', query)
      AND d.status = 'active'
  ) results
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;
