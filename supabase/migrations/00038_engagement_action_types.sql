-- ============================================================
-- 00038_engagement_action_types.sql
-- Extend legacy_points action_type CHECK to support all engagement actions
-- ============================================================

-- 1. Drop the existing narrow CHECK constraint
ALTER TABLE public.legacy_points
  DROP CONSTRAINT IF EXISTS legacy_points_action_type_check;

-- 2. Add the expanded CHECK constraint with all engagement action types
ALTER TABLE public.legacy_points
  ADD CONSTRAINT legacy_points_action_type_check
  CHECK (action_type IN (
    -- Original action types (from 00023)
    'daily_login',
    'create_memorial',
    'create_tribute',
    'send_gift',
    'send_flowers',
    'invite_accepted',
    'share_content',
    'respond_to_prompt',
    'complete_streak_day',
    'create_living_tribute',
    'write_appreciation',
    'contribute_to_tribute',
    'follow_memorial',
    'add_photo',
    'add_video',
    'complete_profile',
    'first_memorial',
    'first_tribute',
    'milestone_100_tributes',
    'campaign_participation',
    'referral_signup',
    -- New engagement action types
    'add_milestone',
    'create_event',
    'add_family_member',
    'upload_photo',
    'follow_user',
    'rsvp_event',
    'add_reaction',
    'send_message',
    'complete_quest',
    'earn_badge',
    'invite_user',
    'add_comment',
    'create_timeline_event',
    'purchase'
  ));
