-- Migration 00015: Vault Enhancements
-- Adds: vault_folders, vault_item_tags, vault_item_folders, scrapbook_elements, prompt_categories
-- Alters: memory_vault_items (+ folder_id), memory_prompts (+ category_id, is_ai_suggested)

-- ============================================================
-- Vault Folders (collection/folder organization for vault items)
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#7C3AED',
  parent_folder_id UUID REFERENCES vault_folders(id) ON DELETE SET NULL,
  item_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_folders_memorial ON vault_folders(memorial_id);
CREATE INDEX IF NOT EXISTS idx_vault_folders_created_by ON vault_folders(created_by);

ALTER TABLE vault_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vault folders"
  ON vault_folders FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create vault folders"
  ON vault_folders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their vault folders"
  ON vault_folders FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their vault folders"
  ON vault_folders FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================
-- Vault Item Tags (many-to-many tagging)
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES memory_vault_items(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_vault_item_tags_memorial ON vault_item_tags(memorial_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_tags_item ON vault_item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_tags_tag ON vault_item_tags(tag);

ALTER TABLE vault_item_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vault item tags"
  ON vault_item_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can tag items"
  ON vault_item_tags FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can untag items"
  ON vault_item_tags FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- Vault Item Folder Assignment
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_item_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES memory_vault_items(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES vault_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, folder_id)
);

CREATE INDEX IF NOT EXISTS idx_vault_item_folders_item ON vault_item_folders(item_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_folders_folder ON vault_item_folders(folder_id);

ALTER TABLE vault_item_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vault item folders"
  ON vault_item_folders FOR SELECT USING (true);

CREATE POLICY "Authenticated users can assign items to folders"
  ON vault_item_folders FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can remove items from folders"
  ON vault_item_folders FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- Scrapbook Elements (individual elements on a page)
-- ============================================================
CREATE TABLE IF NOT EXISTS scrapbook_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES scrapbook_pages(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('photo', 'text', 'sticker', 'shape', 'divider')),
  content TEXT,
  media_url TEXT,
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  width DOUBLE PRECISION DEFAULT 200,
  height DOUBLE PRECISION DEFAULT 200,
  rotation DOUBLE PRECISION DEFAULT 0,
  z_index INTEGER DEFAULT 0,
  style_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scrapbook_elements_page ON scrapbook_elements(page_id);

ALTER TABLE scrapbook_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scrapbook elements"
  ON scrapbook_elements FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create scrapbook elements"
  ON scrapbook_elements FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update scrapbook elements"
  ON scrapbook_elements FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete scrapbook elements"
  ON scrapbook_elements FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- Prompt Categories (pre-defined prompt groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS prompt_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'bulb',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prompt categories"
  ON prompt_categories FOR SELECT USING (true);

-- Seed prompt categories
INSERT INTO prompt_categories (name, slug, description, icon, sort_order) VALUES
  ('Childhood', 'childhood', 'Memories from growing up', 'happy', 1),
  ('Career', 'career', 'Professional life and achievements', 'briefcase', 2),
  ('Relationships', 'relationships', 'Family, friends, and loved ones', 'heart', 3),
  ('Favorites', 'favorites', 'Favorite things and preferences', 'star', 4),
  ('Milestones', 'milestones', 'Key life events and achievements', 'trophy', 5),
  ('Traditions', 'traditions', 'Family and cultural traditions', 'gift', 6),
  ('Personality', 'personality', 'Character traits and quirks', 'sparkles', 7),
  ('Travel', 'travel', 'Places visited and adventures', 'airplane', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ALTER existing tables
-- ============================================================

-- Add folder_id to memory_vault_items
ALTER TABLE memory_vault_items ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES vault_folders(id) ON DELETE SET NULL;

-- Add category_id and is_ai_suggested to memory_prompts
ALTER TABLE memory_prompts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES prompt_categories(id) ON DELETE SET NULL;
ALTER TABLE memory_prompts ADD COLUMN IF NOT EXISTS is_ai_suggested BOOLEAN DEFAULT false;

-- ============================================================
-- Trigger: Auto-update vault_folders.item_count
-- ============================================================
CREATE OR REPLACE FUNCTION update_vault_folder_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE vault_folders SET item_count = item_count + 1 WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE vault_folders SET item_count = item_count - 1 WHERE id = OLD.folder_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vault_folder_item_count
  AFTER INSERT OR DELETE ON vault_item_folders
  FOR EACH ROW EXECUTE FUNCTION update_vault_folder_item_count();

-- ============================================================
-- Trigger: Auto-update updated_at timestamps
-- ============================================================
CREATE TRIGGER set_vault_folders_updated_at
  BEFORE UPDATE ON vault_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_scrapbook_elements_updated_at
  BEFORE UPDATE ON scrapbook_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
