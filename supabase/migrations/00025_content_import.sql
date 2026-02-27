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
