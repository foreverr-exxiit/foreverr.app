# Migration Deployment Guide

Migrations 00001-00005 are already live on the Supabase instance.
Migrations 00006-00034 need to be run via the **SQL Editor** in the Supabase Dashboard.

## Supabase Dashboard
URL: https://supabase.com/dashboard/project/icwinmkpsmfejuucpmdo/sql/new

## Run Order (copy each file's SQL into the SQL Editor and execute)

1. `00006_marketplace.sql` — Marketplace tables
2. `00007_directory.sql` — Directory listings, reviews, leads
3. `00008_nft_system.sql` — NFT minting/trading
4. `00009_live_rooms.sql` — Live streaming rooms
5. `00010_memory_vaults.sql` — Secure memory vaults
6. `00011_family_trees.sql` — Genealogy/family trees
7. `00012_virtual_spaces.sql` — 3D/VR memorial spaces
8. `00013_seed_sample_content.sql` — Sample seed data
9. `00014_celebrity_content.sql` — Celebrity memorials
10. `00015_vault_enhancements.sql` — Vault folders/tags
11. `00016_advanced_social.sql` — Follows, badges, mentions
12. `00017_sharing_deep_links.sql` — Deep linking & analytics
13. `00018_living_tributes.sql` — Living tributes
14. `00019_daily_engagement.sql` — Prompts & reminders
15. `00020_viral_growth.sql` — Invite links & campaigns
16. `00021_living_legacy_polish.sql` — Phase 5 polish
17. `00022_gift_economy.sql` — Gift catalog & transactions
18. `00023_legacy_points.sql` — Points & leaderboard
19. `00024_trust_system.sql` — Trust levels & claims
20. `00025_content_import.sql` — Third-party content import
21. `00026_directory_lifecycle.sql` — Lifecycle stages
22. `00027_phase6_polish.sql` — Phase 6 UI polish
23. `00028_premium_subscriptions.sql` — Premium tiers & billing
24. `00029_life_timeline_photos.sql` — Life timeline & photo tagging
25. `00030_search_notifications_email.sql` — Full-text search, push notification triggers & email log
26. `00031_celebrity_profiles.sql` — Lifecycle stage column & celebrity profile seed data
27. `00032_proximity_support.sql` — Lat/long on events & profiles for proximity feed
28. `00033_profiles_role_donation_rpc.sql` — Add profiles.role column + atomic fundraiser donation RPC
29. `00034_enrich_seed_content.sql` — Rich milestones, timeline events & varied tribute types for sample profiles

## After Running All Migrations

Set these Supabase secrets (Dashboard > Settings > Edge Functions > Secrets):
- `OPENAI_API_KEY` — For AI obituary, biography, tribute, life story generation
- `STRIPE_SECRET_KEY` — For payment processing (stripe-webhook)
- `STRIPE_WEBHOOK_SECRET` — For webhook signature verification
- `RESEND_API_KEY` — For email delivery (send-email edge function)
- `GOOGLE_PLACES_API_KEY` — For directory mass import
- `YELP_API_KEY` — For directory mass import
- `ELEVENLABS_API_KEY` — For AI voice synthesis (optional)
- `HUGGING_FACE_TOKEN` — For AI photo restoration (optional)
- `GOOGLE_VISION_API_KEY` — For face recognition (optional)
- `CREATOMATE_API_KEY` — For AI memorial video generation (optional, falls back to mock)

## Verification
Run this query to verify all tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```
