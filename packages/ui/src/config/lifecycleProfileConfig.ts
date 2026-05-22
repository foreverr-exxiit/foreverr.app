// ── Lifecycle Profile Configuration ──────────────────────────────────
// Maps lifecycle_stage values to profile UI behavior.
// Two main modes: "memorial" (death/remembrance) vs "celebration" (living moments)

export interface LifecycleQuickAction {
  key: string;
  label: string;
  icon: string;
  color: string;
  bgClass: string;
  textClass: string;
  action: "wall" | "donate" | "gifts" | "share" | "honor-day";
}

export interface LifecycleSupportButton {
  label: string;
  icon: string;
  color: string;
}

export interface LifecycleTab {
  key: string;
  label: string;
  icon: string;
}

export interface LifecycleProfileConfig {
  mode: "memorial" | "celebration";
  label: string;
  dateLabels: { birth: string; death: string | null };
  tabs: LifecycleTab[];
  quickActions: LifecycleQuickAction[];
  wallSubTabs: string[];
  tributeLabel: string;
  tributeComposerPlaceholder: string;
  emptyTributeText: string;
  supportTitle: string;
  supportHeading: string;
  supportButtons: LifecycleSupportButton[];
  shareText: string;
  shareMessage: string;
  showAiObituary: boolean;
  fundraiserPurpose: string;
  timelineLabels: {
    born: string;
    passed: string | null;
    created: string;
    emptyState: string;
  };
}

// ── Memorial Mode Config ────────────────────────────────────────────
const MEMORIAL_CONFIG: LifecycleProfileConfig = {
  mode: "memorial",
  label: "Memorial",
  dateLabels: { birth: "Born", death: "Passed" },
  tabs: [
    { key: "index", label: "Biography", icon: "book-outline" },
    { key: "timeline", label: "The Arc", icon: "time-outline" },
    { key: "gallery", label: "Gallery", icon: "images-outline" },
    { key: "events", label: "Events", icon: "calendar-outline" },
    { key: "obituary", label: "Support", icon: "heart-outline" },
    { key: "wall", label: "Wall", icon: "chatbubbles-outline" },
    { key: "fundraiser", label: "Fundraiser", icon: "heart-outline" },
  ],
  quickActions: [
    {
      key: "tribute",
      label: "Tribute",
      icon: "chatbubble-outline",
      color: "#4A2D7A",
      bgClass: "bg-brand-50 dark:bg-brand-900/20",
      textClass: "text-brand-700",
      action: "wall",
    },
    {
      key: "candle",
      label: "Candle",
      icon: "flame",
      color: "#d97706",
      bgClass: "bg-amber-50 dark:bg-amber-900/20",
      textClass: "text-amber-700",
      action: "donate",
    },
    {
      key: "flowers",
      label: "Flowers",
      icon: "flower",
      color: "#ec4899",
      bgClass: "bg-rose-50 dark:bg-rose-900/20",
      textClass: "text-rose-700",
      action: "gifts",
    },
    {
      key: "honor-day",
      label: "Honor Day",
      icon: "sunny-outline",
      color: "#0891b2",
      bgClass: "bg-cyan-50 dark:bg-cyan-900/20",
      textClass: "text-cyan-700",
      action: "honor-day",
    },
  ],
  wallSubTabs: ["Condolences", "Tribute", "Social Tags"],
  tributeLabel: "Write a Tribute",
  tributeComposerPlaceholder: "A tribute for",
  emptyTributeText:
    "Be the first to share a tribute, memory, or photo.",
  supportTitle: "Support",
  supportHeading: "Memorial Details",
  supportButtons: [
    { label: "Send Flowers", icon: "flower-outline", color: "#ec4899" },
    { label: "Memorial Gift", icon: "gift-outline", color: "#8b5cf6" },
    { label: "Donate", icon: "heart-outline", color: "#ef4444" },
    { label: "Light a Candle", icon: "flame-outline", color: "#d97706" },
  ],
  shareText: "Memorial on ǝterrn",
  shareMessage: "Remember",
  showAiObituary: true,
  fundraiserPurpose:
    "Raise funds for funeral costs, family support, or memorial upkeep",
  timelineLabels: {
    born: "Born",
    passed: "Passed Away",
    created: "Memorial Created",
    emptyState: "Add birth and death dates to see the timeline.",
  },
};

// ── Legacy Mode Config ──────────────────────────────────────────────
const LEGACY_CONFIG: LifecycleProfileConfig = {
  ...MEMORIAL_CONFIG,
  label: "The Core",
  shareText: "The Core on ǝterrn",
  shareMessage: "Explore the legacy of",
  timelineLabels: {
    ...MEMORIAL_CONFIG.timelineLabels,
    created: "Core Page Created",
  },
};

// ── Celebration Mode Config ─────────────────────────────────────────
const CELEBRATION_CONFIG: LifecycleProfileConfig = {
  mode: "celebration",
  label: "Celebration",
  dateLabels: { birth: "Born", death: null },
  tabs: [
    { key: "index", label: "About", icon: "book-outline" },
    { key: "timeline", label: "The Arc", icon: "time-outline" },
    { key: "gallery", label: "Gallery", icon: "images-outline" },
    { key: "events", label: "Events", icon: "calendar-outline" },
    { key: "obituary", label: "About", icon: "information-circle-outline" },
    { key: "wall", label: "Cheers", icon: "chatbubbles-outline" },
  ],
  quickActions: [
    {
      key: "cheer",
      label: "Cheer",
      icon: "happy-outline",
      color: "#4A2D7A",
      bgClass: "bg-brand-50 dark:bg-brand-900/20",
      textClass: "text-brand-700",
      action: "wall",
    },
    {
      key: "gift",
      label: "Gift",
      icon: "gift-outline",
      color: "#d97706",
      bgClass: "bg-amber-50 dark:bg-amber-900/20",
      textClass: "text-amber-700",
      action: "gifts",
    },
    {
      key: "flowers",
      label: "Flowers",
      icon: "flower",
      color: "#ec4899",
      bgClass: "bg-rose-50 dark:bg-rose-900/20",
      textClass: "text-rose-700",
      action: "gifts",
    },
  ],
  wallSubTabs: ["Cheers", "Media", "Social Tags"],
  tributeLabel: "Send a Cheer",
  tributeComposerPlaceholder: "A cheer for",
  emptyTributeText:
    "Be the first to send a cheer, memory, or photo!",
  supportTitle: "About",
  supportHeading: "Details",
  supportButtons: [
    { label: "Send Gift", icon: "gift-outline", color: "#8b5cf6" },
    { label: "Send Flowers", icon: "flower-outline", color: "#ec4899" },
    { label: "Share Story", icon: "book-outline", color: "#3b82f6" },
    { label: "Celebrate", icon: "sparkles-outline", color: "#f59e0b" },
  ],
  shareText: "Celebration on ǝterrn",
  shareMessage: "Celebrate",
  showAiObituary: false,
  fundraiserPurpose:
    "Raise funds for the celebration, gifts, or event expenses",
  timelineLabels: {
    born: "Born",
    passed: null,
    created: "Page Created",
    emptyState: "Add key dates to see the timeline.",
  },
};

// ── Stage-to-Config mapping ─────────────────────────────────────────
const STAGE_CONFIG_MAP: Record<string, LifecycleProfileConfig> = {
  remember: MEMORIAL_CONFIG,
  legacy: LEGACY_CONFIG,
  celebrate: CELEBRATION_CONFIG,
  preserve: CELEBRATION_CONFIG,
  support: CELEBRATION_CONFIG,
};

/**
 * Returns the profile UI configuration for a given lifecycle_stage value.
 * Defaults to memorial config if stage is unknown or undefined.
 */
export function getLifecycleConfig(
  stage?: string | null,
): LifecycleProfileConfig {
  if (!stage) return MEMORIAL_CONFIG;
  return STAGE_CONFIG_MAP[stage] ?? CELEBRATION_CONFIG;
}
