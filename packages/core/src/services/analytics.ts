/**
 * Analytics Service — Event tracking for ǝterrn
 *
 * Provides a unified tracking interface. Currently logs to Supabase
 * (analytics_events table). Can be swapped/extended for Mixpanel,
 * Amplitude, PostHog, etc.
 *
 * Usage:
 *   import { analytics } from "@foreverr/core";
 *   analytics.track("memorial_created", { memorial_id: "abc" });
 */

import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "../supabase/client";
import { captureException } from "./errorReporting";

const APP_VERSION =
  Constants.expoConfig?.version ??
  (Constants.manifest as Record<string, unknown> | undefined)?.version as string ??
  "1.0.0";

// ── Event Types ─────────────────────────────────────────────

type EventName =
  // Auth
  | "sign_up" | "sign_in" | "sign_out"
  // Memorials
  | "memorial_created" | "memorial_viewed" | "memorial_shared"
  // Tributes
  | "tribute_created" | "tribute_viewed"
  // Timeline & Turning Points
  | "milestone_added" | "timeline_event_added" | "timeline_viewed"
  // Photos
  | "photo_uploaded" | "photo_tagged"
  // Social
  | "user_followed" | "gift_sent" | "flower_sent"
  // Engagement
  | "daily_prompt_answered" | "streak_maintained"
  // Premium
  | "paywall_shown" | "purchase_started" | "purchase_completed" | "subscription_cancelled"
  // Navigation
  | "screen_view" | "tab_changed" | "feature_opened"
  // Search
  | "search_performed" | "search_result_clicked"
  // Custom
  | string;

interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

// ── In-memory batch for performance ──

const eventBatch: Array<{
  event: string;
  properties: AnalyticsProperties;
  timestamp: string;
}> = [];

let flushTimeout: ReturnType<typeof setTimeout> | null = null;
let userId: string | null = null;

// ── Public API ──────────────────────────────────────────────

export const analytics = {
  /**
   * Identify the current user for analytics.
   */
  identify(id: string, traits?: AnalyticsProperties) {
    userId = id;

    // Log user identification
    this.track("identify", { user_id: id, ...traits });
  },

  /**
   * Reset user identity (on sign out).
   */
  reset() {
    userId = null;
  },

  /**
   * Track an event with optional properties.
   */
  track(event: EventName, properties?: AnalyticsProperties) {
    const enriched: AnalyticsProperties = {
      ...properties,
      user_id: userId,
      platform: Platform.OS,
      app_version: APP_VERSION,
    };

    eventBatch.push({
      event,
      properties: enriched,
      timestamp: new Date().toISOString(),
    });

    // Debounce flush — batch events for 5 seconds
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(() => flush(), 5000);

    // Also flush if batch gets large
    if (eventBatch.length >= 20) flush();
  },

  /**
   * Track a screen view.
   */
  screen(name: string, properties?: AnalyticsProperties) {
    this.track("screen_view", { screen_name: name, ...properties });
  },

  /**
   * Force flush all pending events.
   */
  flush() {
    flush();
  },
};

// ── Flush to Supabase ───────────────────────────────────────

async function flush() {
  if (eventBatch.length === 0) return;

  const batch = [...eventBatch];
  eventBatch.length = 0;

  try {
    // Insert into analytics_events table (created in migration 00049)
    const { error } = await (supabase as any)
      .from("analytics_events")
      .insert(
        batch.map((e) => ({
          event_name: e.event,
          properties: e.properties,
          user_id: userId,
          platform: Platform.OS,
          created_at: e.timestamp,
        })),
      );
    if (error) throw error;
  } catch (err) {
    // Report dropped batches to Sentry so silent analytics loss is visible.
    captureException(err, {
      where: "analytics.flush",
      batch_size: batch.length,
      first_event: batch[0]?.event,
    });
    if (__DEV__) {
      for (const e of batch) {
        console.log(`[Analytics] ${e.event}`, e.properties);
      }
    }
  }
}

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean;
