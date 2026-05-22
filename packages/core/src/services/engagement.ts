/**
 * Engagement Service — Centralized point-awarding for ǝterrn
 *
 * This is a plain module (NOT a React hook) so it can be called from
 * TanStack Query `onSuccess` callbacks where hooks can't be used.
 *
 * Usage:
 *   import { awardEngagementPoints } from "@foreverr/core";
 *   awardEngagementPoints(userId, "create_tribute");
 *
 * Points are awarded fire-and-forget — errors are silently caught
 * so they never block the primary user action.
 */

import { supabase } from "../supabase/client";

// ── Point values per action type ────────────────────────────

export const POINT_VALUES: Record<string, number> = {
  // Creation (high value)
  create_memorial: 50,
  create_tribute: 20,
  create_living_tribute: 20,
  add_milestone: 15,
  create_event: 15,
  create_timeline_event: 15,

  // Content & contribution
  send_gift: 10,
  send_flowers: 10,
  add_family_member: 10,
  share_content: 10,
  upload_photo: 10,
  add_photo: 10,
  add_video: 10,
  write_appreciation: 10,
  contribute_to_tribute: 10,

  // Social
  follow_user: 5,
  follow_memorial: 5,
  rsvp_event: 5,
  daily_login: 5,
  respond_to_prompt: 5,
  complete_streak_day: 5,

  // Micro-interactions
  add_reaction: 2,
  send_message: 2,
  add_comment: 2,

  // Achievements
  complete_quest: 25,
  earn_badge: 20,
  invite_user: 15,
  invite_accepted: 15,
  referral_signup: 15,
  campaign_participation: 10,

  // Turning Points
  complete_profile: 25,
  first_memorial: 50,
  first_tribute: 25,
  milestone_100_tributes: 100,

  // Purchases (revenue actions)
  purchase: 0,

  // Stewardship actions
  transfer_page: 30,
  accept_stewardship: 25,
  complete_stewardship: 50,
  smooth_transfer_bonus: 20,
  founding_steward_bonus: 100,
  page_growth_bonus: 15,
  designate_successor: 10,

  // Baby Journey ("Little Arcs")
  create_baby_page: 50,
  add_baby_milestone: 15,
  add_baby_update: 10,
  complete_stage_milestones: 30,

  // Relationship Lifecycle
  add_relationship_event: 15,
  update_relationship_status: 10,
  link_wedding_chapters: 20,
};

// ── Action categories for UI grouping ───────────────────────

export type EngagementCategory = "creation" | "content" | "social" | "engagement" | "achievement";

export const ACTION_CATEGORIES: Record<string, EngagementCategory> = {
  create_memorial: "creation",
  create_tribute: "creation",
  create_living_tribute: "creation",
  create_event: "creation",
  create_timeline_event: "creation",
  add_milestone: "creation",

  send_gift: "content",
  send_flowers: "content",
  upload_photo: "content",
  add_photo: "content",
  add_video: "content",
  add_family_member: "content",
  write_appreciation: "content",
  contribute_to_tribute: "content",
  share_content: "content",

  follow_user: "social",
  follow_memorial: "social",
  send_message: "social",
  invite_user: "social",
  invite_accepted: "social",
  referral_signup: "social",

  add_reaction: "engagement",
  add_comment: "engagement",
  rsvp_event: "engagement",
  respond_to_prompt: "engagement",
  daily_login: "engagement",
  complete_streak_day: "engagement",
  campaign_participation: "engagement",

  complete_quest: "achievement",
  earn_badge: "achievement",
  complete_profile: "achievement",
  first_memorial: "achievement",
  first_tribute: "achievement",
  milestone_100_tributes: "achievement",

  transfer_page: "social",
  accept_stewardship: "social",
  complete_stewardship: "achievement",
  smooth_transfer_bonus: "achievement",
  founding_steward_bonus: "achievement",
  page_growth_bonus: "achievement",
  designate_successor: "social",

  create_baby_page: "creation",
  add_baby_milestone: "creation",
  add_baby_update: "content",
  complete_stage_milestones: "achievement",

  add_relationship_event: "content",
  update_relationship_status: "social",
  link_wedding_chapters: "social",
};

export const CATEGORY_LABELS: Record<EngagementCategory, string> = {
  creation: "Creation",
  content: "Content",
  social: "Social",
  engagement: "Engagement",
  achievement: "Achievement",
};

export const CATEGORY_ICONS: Record<EngagementCategory, string> = {
  creation: "create",
  content: "images",
  social: "people",
  engagement: "pulse",
  achievement: "trophy",
};

export const CATEGORY_COLORS: Record<EngagementCategory, string> = {
  creation: "#7C3AED",
  content: "#EC4899",
  social: "#2563EB",
  engagement: "#D97706",
  achievement: "#059669",
};

// ── Human-readable action labels ────────────────────────────

export const ACTION_LABELS: Record<string, string> = {
  create_memorial: "Created a memorial",
  create_tribute: "Wrote a tribute",
  create_living_tribute: "Created a living tribute",
  add_milestone: "Added a turning point",
  create_event: "Created an event",
  create_timeline_event: "Added an Arc event",
  send_gift: "Sent a gift",
  send_flowers: "Sent flowers",
  add_family_member: "Added a family member",
  share_content: "Shared content",
  upload_photo: "Uploaded a photo",
  add_photo: "Added a photo",
  add_video: "Added a video",
  write_appreciation: "Wrote an appreciation",
  contribute_to_tribute: "Contributed to a tribute",
  follow_user: "Followed a user",
  follow_memorial: "Followed a memorial",
  rsvp_event: "RSVP'd to an event",
  daily_login: "Daily login",
  respond_to_prompt: "Answered a prompt",
  complete_streak_day: "Maintained streak",
  add_reaction: "Added a reaction",
  send_message: "Sent a message",
  add_comment: "Added a comment",
  complete_quest: "Completed a quest",
  earn_badge: "Earned a badge",
  invite_user: "Sent an invite",
  invite_accepted: "Invite was accepted",
  referral_signup: "Referral signed up",
  campaign_participation: "Participated in campaign",
  complete_profile: "Completed profile",
  first_memorial: "Created first memorial",
  first_tribute: "Wrote first tribute",
  milestone_100_tributes: "100 tributes milestone",
  purchase: "Made a purchase",

  transfer_page: "Transferred a page",
  accept_stewardship: "Accepted stewardship",
  complete_stewardship: "Completed stewardship",
  smooth_transfer_bonus: "Smooth transfer bonus",
  founding_steward_bonus: "Founding steward bonus",
  page_growth_bonus: "Page growth bonus",
  designate_successor: "Designated a successor",

  create_baby_page: "Created a Little Arc",
  add_baby_milestone: "Added a baby milestone",
  add_baby_update: "Added a journal entry",
  complete_stage_milestones: "Completed stage milestones",

  add_relationship_event: "Added a relationship event",
  update_relationship_status: "Updated relationship status",
  link_wedding_chapters: "Linked wedding chapters",
};

// ── Core function: award points ─────────────────────────────

/**
 * Award engagement points to a user. Fire-and-forget: errors are
 * silently caught and never block the primary action.
 *
 * @param userId - The authenticated user's UUID
 * @param actionType - The action that was performed (e.g. "create_tribute")
 * @param metadata - Optional description or reference ID
 */
export function awardEngagementPoints(
  userId: string,
  actionType: string,
  metadata?: { description?: string; referenceId?: string }
): void {
  const points = POINT_VALUES[actionType];

  // Skip if action type isn't recognized or has 0 points
  if (!points || points <= 0) return;

  // Skip if no userId (guest / unauthenticated)
  if (!userId) return;

  // Fire-and-forget insert — don't await, just let it happen
  (supabase as any)
    .from("legacy_points")
    .insert({
      user_id: userId,
      points,
      action_type: actionType,
      reference_id: metadata?.referenceId ?? null,
      description: metadata?.description ?? ACTION_LABELS[actionType] ?? actionType,
    })
    .then(() => {
      // Points inserted — the DB trigger auto-updates the balance
    })
    .catch(() => {
      // Silently ignore — engagement points should never block primary actions
    });
}
