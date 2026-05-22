# Foreverr — Database Migration Deployment Guide

## Current State
- Migrations **00001–00009** are already live on the remote Supabase DB
- Migrations **00010–00034** need to be deployed (25 migrations)

## How to Run Each Step

1. Go to **Supabase Dashboard** → **SQL Editor**
   - URL: https://supabase.com/dashboard/project/icwinmkpsmfejuucpmdo/sql/new
2. Open the migration file listed for each step
3. **Copy the entire file contents** and paste into the SQL Editor
4. Click **Run** (or Cmd+Enter)
5. Confirm it says "Success" with no errors
6. Move to the next step

If a step fails, **stop** and check the error. Do NOT skip ahead.

---

## Step 0: Pre-flight Fix (REQUIRED)
**File:** `supabase/deploy/step_0_preflight_fix.sql`

Patches the existing `gift_catalog` table to add columns expected by later migrations.

---

## Step 1: Memory Vaults
**File:** `supabase/migrations/00010_memory_vaults.sql`

Creates: `memory_vault_items`, `time_capsules`, `legacy_letters`, `scrapbook_pages`, `memorial_qr_codes`

---

## Step 2: Family Trees
**File:** `supabase/migrations/00011_family_trees.sql`

Creates: `family_trees`, `family_tree_members`, `family_tree_connections`, `memory_prompts`, `memory_prompt_responses`

---

## Step 3: Virtual Spaces
**File:** `supabase/migrations/00012_virtual_spaces.sql`

Creates: `virtual_spaces`, `virtual_space_items`, `memory_streaks`, `seasonal_decorations`, `applied_decorations`

---

## Step 4: Seed Sample Content
**File:** `supabase/migrations/00013_seed_sample_content.sql`

Inserts sample users, 5 demo memorials, and tributes so the app feels alive on first launch.

---

## Step 5: Celebrity Content
**File:** `supabase/migrations/00014_celebrity_content.sql`

Creates: `celebrity_memorials`, `news_items`, `celebrity_quotes`, `celebrity_galleries`, `timeline_milestones`

---

## Step 6: Vault Enhancements
**File:** `supabase/migrations/00015_vault_enhancements.sql`

Adds columns and features to the memory vault tables created in Step 1.

---

## Step 7: Advanced Social
**File:** `supabase/migrations/00016_advanced_social.sql`

Creates: `user_follows`, `user_activities`, `badges`, `user_badges`, `announcements`, `appreciation_wall`

---

## Step 8: Sharing & Deep Links
**File:** `supabase/migrations/00017_sharing_deep_links.sql`

Creates: `share_cards`, `content_shares`, `deep_link_clicks`

---

## Step 9: Living Tributes
**File:** `supabase/migrations/00018_living_tributes.sql`

Creates: `living_tributes`, `living_tribute_contributions`

---

## Step 10: Daily Engagement
**File:** `supabase/migrations/00019_daily_engagement.sql`

Creates: `daily_prompts`, `daily_prompt_responses`, `user_streaks`

---

## Step 11: Viral Growth
**File:** `supabase/migrations/00020_viral_growth.sql`

Creates: `referrals` and viral growth tracking features.

---

## Step 12: Living Legacy Polish
**File:** `supabase/migrations/00021_living_legacy_polish.sql`

Adds columns to `living_tributes` and `memorials` for memorial conversion flow.

---

## Step 13: Gift Economy
**File:** `supabase/migrations/00022_gift_economy.sql`

Creates: `gift_transactions`, `flower_walls`, `gift_reactions`. Seeds 24 gift catalog items.

Note: The `gift_catalog` CREATE TABLE will be skipped (already exists). The new seed data will be inserted using the columns added in Step 0.

---

## Step 14: Legacy Points
**File:** `supabase/migrations/00023_legacy_points.sql`

Creates: `legacy_levels`, `legacy_point_balances`, `legacy_points`, `point_redemptions`

---

## Step 15: Trust System
**File:** `supabase/migrations/00024_trust_system.sql`

Creates: `trust_levels`, `memorial_claims`, `memorial_managers`, `duplicate_reports`, `fundraise_campaigns_v2`. Adds `trust_level` to profiles and claim columns to memorials.

---

## Step 16: Content Import
**File:** `supabase/migrations/00025_content_import.sql`

Creates: `import_jobs`, `import_items`, `connected_accounts`

---

## Step 17: Directory & Lifecycle
**File:** `supabase/migrations/00026_directory_lifecycle.sql`

Creates: `directory_import_batches`, `celebrity_memorial_requests`, `lifecycle_stages`. Adds `lifecycle_stage` to memorials.

---

## Step 18: Phase 6 Polish
**File:** `supabase/migrations/00027_phase6_polish.sql`

Adds `metadata` column to notifications table.

---

## Step 19: Premium Subscriptions
**File:** `supabase/migrations/00028_premium_subscriptions.sql`

Creates: `subscription_plans`, `user_subscriptions`, `premium_entitlements`, `billing_history`, `premium_feature_gates`. Seeds 3 plans and 20 feature gates.

---

## Step 20: Life Timeline & Photos
**File:** `supabase/migrations/00029_life_timeline_photos.sql`

Creates: `life_milestones`, `life_timeline_events`, `milestone_templates`, `photo_face_tags`, `face_embeddings`, `auto_reminder_rules`. Seeds 28 milestone templates.

---

## Step 21: Search, Notifications & Email
**File:** `supabase/migrations/00030_search_notifications_email.sql`

Adds full-text search (tsvector) to memorials, tributes, directory_listings. Creates push notification triggers and `email_log` table. Creates `search_all()` RPC.

---

## Step 22: Celebrity Profiles Seed
**File:** `supabase/migrations/00031_celebrity_profiles.sql`

Adds optional columns to memorials and inserts 7 celebrity/demo profiles (Chadwick Boseman, Kobe Bryant, Queen Elizabeth II, etc.)

---

## Step 23: Proximity Support
**File:** `supabase/migrations/00032_proximity_support.sql`

Adds lat/long to events and profiles. Creates `nearby_content()` RPC.

---

## Step 24: Profiles Role & Donation RPC
**File:** `supabase/migrations/00033_profiles_role_donation_rpc.sql`

Adds `role` column to profiles (user/admin/moderator). Creates `increment_fundraiser_donation()` RPC.

---

## Step 25: Enrich Seed Content
**File:** `supabase/migrations/00034_enrich_seed_content.sql`

Adds milestones, timeline events, and varied tributes to the 5 sample memorials from Step 4.

---

## After All Steps

Run this quick verification:

```sql
SELECT
  (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  (SELECT count(*) FROM life_milestones) as milestones,
  (SELECT count(*) FROM subscription_plans) as plans,
  (SELECT count(*) FROM gift_catalog) as gifts,
  (SELECT count(*) FROM lifecycle_stages) as stages;
```

Expected: 60+ tables, 21 milestones, 3 plans, 30+ gifts, 5 stages.
