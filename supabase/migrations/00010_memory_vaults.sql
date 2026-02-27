-- Phase 4: Memory Vaults, Time Capsules & Legacy Letters
-- Migration: 00010_memory_vaults.sql

-- ============================================================
-- Memory Vault Items (Digital Memory Box per memorial)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('document', 'recipe', 'letter', 'audio_playlist', 'quote', 'photo_album', 'video', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- For text-based items (recipes, quotes, letters)
  media_url TEXT, -- For file-based items
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}', -- Flexible metadata (ingredients for recipes, attribution for quotes, etc.)
  is_private BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memory_vault_memorial ON memory_vault_items(memorial_id);
CREATE INDEX idx_memory_vault_type ON memory_vault_items(item_type);
CREATE INDEX idx_memory_vault_uploaded_by ON memory_vault_items(uploaded_by);

ALTER TABLE memory_vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public vault items" ON memory_vault_items
  FOR SELECT USING (is_private = false);

CREATE POLICY "Memorial hosts can view all vault items" ON memory_vault_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_vault_items.memorial_id AND user_id = auth.uid())
  );

CREATE POLICY "Memorial hosts can insert vault items" ON memory_vault_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_vault_items.memorial_id AND user_id = auth.uid())
    OR uploaded_by = auth.uid()
  );

CREATE POLICY "Uploader or host can update vault items" ON memory_vault_items
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_vault_items.memorial_id AND user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Uploader or host can delete vault items" ON memory_vault_items
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_vault_items.memorial_id AND user_id = auth.uid() AND role = 'owner')
  );

-- ============================================================
-- Time Capsules (content that unlocks on future dates)
-- ============================================================
CREATE TABLE IF NOT EXISTS time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- The hidden message/content
  media_url TEXT, -- Optional media attachment
  unlock_date TIMESTAMPTZ NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  recipient_ids UUID[] DEFAULT '{}', -- Specific recipients, empty = all followers
  notify_on_unlock BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_time_capsules_memorial ON time_capsules(memorial_id);
CREATE INDEX idx_time_capsules_unlock_date ON time_capsules(unlock_date);
CREATE INDEX idx_time_capsules_created_by ON time_capsules(created_by);

ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view unlocked capsules" ON time_capsules
  FOR SELECT USING (is_unlocked = true);

CREATE POLICY "Creator can view own capsules" ON time_capsules
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Memorial hosts can view all capsules" ON time_capsules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = time_capsules.memorial_id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create capsules" ON time_capsules
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update own capsules" ON time_capsules
  FOR UPDATE USING (created_by = auth.uid() AND is_unlocked = false);

CREATE POLICY "Creator can delete own capsules" ON time_capsules
  FOR DELETE USING (created_by = auth.uid() AND is_unlocked = false);

-- ============================================================
-- Legacy Letters (delivered to specific people on specific dates)
-- ============================================================
CREATE TABLE IF NOT EXISTS legacy_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id),
  memorial_id UUID REFERENCES memorials(id) ON DELETE SET NULL, -- Optional memorial association
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_user_id UUID REFERENCES profiles(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  delivery_date TIMESTAMPTZ NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'in_app' CHECK (delivery_type IN ('in_app', 'email', 'both')),
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_legacy_letters_author ON legacy_letters(author_id);
CREATE INDEX idx_legacy_letters_recipient ON legacy_letters(recipient_user_id);
CREATE INDEX idx_legacy_letters_delivery_date ON legacy_letters(delivery_date);

ALTER TABLE legacy_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Author can manage own letters" ON legacy_letters
  FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Recipient can view delivered letters" ON legacy_letters
  FOR SELECT USING (recipient_user_id = auth.uid() AND is_delivered = true);

-- ============================================================
-- Scrapbook Pages (digital scrapbooking)
-- ============================================================
CREATE TABLE IF NOT EXISTS scrapbook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  page_number INTEGER NOT NULL DEFAULT 1,
  layout_data JSONB NOT NULL DEFAULT '{}', -- Positions, sizes, rotations of elements
  background_color TEXT DEFAULT '#FFFFFF',
  background_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(memorial_id, page_number)
);

CREATE INDEX idx_scrapbook_memorial ON scrapbook_pages(memorial_id);

ALTER TABLE scrapbook_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages" ON scrapbook_pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Memorial hosts can manage pages" ON scrapbook_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = scrapbook_pages.memorial_id AND user_id = auth.uid())
  );

-- ============================================================
-- Memorial QR Codes (physical-to-digital bridge)
-- ============================================================
CREATE TABLE IF NOT EXISTS memorial_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  code TEXT UNIQUE NOT NULL, -- Short unique code for QR
  label TEXT, -- e.g., "Headstone QR", "Urn Plaque"
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  scan_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qr_codes_memorial ON memorial_qr_codes(memorial_id);
CREATE INDEX idx_qr_codes_code ON memorial_qr_codes(code);

ALTER TABLE memorial_qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active QR codes" ON memorial_qr_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Memorial hosts can manage QR codes" ON memorial_qr_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memorial_qr_codes.memorial_id AND user_id = auth.uid())
  );

-- Storage bucket for memory vault files
INSERT INTO storage.buckets (id, name, public) VALUES ('memory-vault', 'memory-vault', true) ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER handle_memory_vault_updated_at BEFORE UPDATE ON memory_vault_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_time_capsules_updated_at BEFORE UPDATE ON time_capsules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_legacy_letters_updated_at BEFORE UPDATE ON legacy_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_scrapbook_updated_at BEFORE UPDATE ON scrapbook_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
