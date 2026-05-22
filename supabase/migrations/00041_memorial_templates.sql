-- ============================================================
-- Migration 00041: Memorial Templates & Template Downloads
-- ============================================================
-- Supports the template marketplace where creators can sell
-- or share memorial/celebration page designs.
-- ============================================================

-- ── Memorial Templates ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS memorial_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'memorial'
    CHECK (category IN ('memorial', 'celebration', 'tribute_page', 'life_story', 'milestone', 'anniversary', 'wedding', 'pet', 'other')),
  price_cents INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  preview_images TEXT[] DEFAULT '{}',
  template_data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Template Downloads / Purchases ──────────────────────────
CREATE TABLE IF NOT EXISTS template_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES memorial_templates(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'completed'
    CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, buyer_id)
);

-- ── Template Reviews ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES memorial_templates(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, reviewer_id)
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_templates_creator ON memorial_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON memorial_templates(category) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_templates_published ON memorial_templates(is_published, download_count DESC);
CREATE INDEX IF NOT EXISTS idx_template_downloads_buyer ON template_downloads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_template_downloads_template ON template_downloads(template_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_template ON template_reviews(template_id);

-- ── RLS Policies ────────────────────────────────────────────
ALTER TABLE memorial_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;

-- Templates: anyone can read published, creators manage their own
CREATE POLICY "templates_public_read" ON memorial_templates
  FOR SELECT USING (is_published = true);
CREATE POLICY "templates_creator_all" ON memorial_templates
  FOR ALL USING (
    creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
  );

-- Downloads: users see their own, template owners see all for their templates
CREATE POLICY "downloads_own" ON template_downloads
  FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "downloads_insert" ON template_downloads
  FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "downloads_creator_view" ON template_downloads
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM memorial_templates WHERE creator_id IN (
        SELECT id FROM creator_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Reviews: anyone reads, authenticated users create their own
CREATE POLICY "template_reviews_read" ON template_reviews
  FOR SELECT USING (true);
CREATE POLICY "template_reviews_insert" ON template_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- ── Auto-update template rating trigger ─────────────────────
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE memorial_templates SET
    rating_avg = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM template_reviews WHERE template_id = NEW.template_id), 0),
    rating_count = (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id)
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_template_rating
  AFTER INSERT OR UPDATE OR DELETE ON template_reviews
  FOR EACH ROW EXECUTE FUNCTION update_template_rating();

-- ── Record template sale earnings ───────────────────────────
CREATE OR REPLACE FUNCTION record_template_sale_earning()
RETURNS TRIGGER AS $$
DECLARE
  v_template memorial_templates%ROWTYPE;
  v_platform_fee INTEGER;
  v_net INTEGER;
BEGIN
  IF NEW.amount_paid_cents > 0 AND NEW.payment_status = 'completed' THEN
    SELECT * INTO v_template FROM memorial_templates WHERE id = NEW.template_id;
    v_platform_fee := GREATEST(1, (NEW.amount_paid_cents * 15 / 100)); -- 15% platform fee on templates
    v_net := NEW.amount_paid_cents - v_platform_fee;

    INSERT INTO creator_earnings (creator_id, type, gross_amount_cents, platform_fee_cents, net_amount_cents, source_id, description)
    VALUES (v_template.creator_id, 'template_sale', NEW.amount_paid_cents, v_platform_fee, v_net, NEW.id, 'Template sale: ' || v_template.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_template_sale
  AFTER INSERT ON template_downloads
  FOR EACH ROW EXECUTE FUNCTION record_template_sale_earning();
