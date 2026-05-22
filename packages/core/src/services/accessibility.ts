/**
 * Accessibility Service for ǝterrn
 *
 * Provides helpers for:
 * - Screen reader announcements
 * - Accessibility labels/hints for common patterns
 * - Reduced motion detection
 * - Font scaling awareness
 * - Focus management utilities
 *
 * Usage:
 *   import { a11y, useAccessibility } from "@foreverr/core";
 *   <Pressable {...a11y.button("Light a candle")} />
 *   const { reduceMotion, fontScale } = useAccessibility();
 */

import { useEffect, useState, useCallback, useRef } from "react";
import {
  AccessibilityInfo,
  Platform,
  PixelRatio,
  type AccessibilityRole,
} from "react-native";

// ── Types ──────────────────────────────────────────────────

interface A11yProps {
  accessible: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: Record<string, boolean | string | undefined>;
}

// ── Accessibility Props Builders ─────────────────────────

/**
 * Quick a11y prop builders for common patterns.
 */
export const a11y = {
  /** Button with label and optional hint */
  button(label: string, hint?: string): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "button",
      accessibilityLabel: label,
      ...(hint ? { accessibilityHint: hint } : {}),
    };
  },

  /** Link with label */
  link(label: string, hint?: string): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "link",
      accessibilityLabel: label,
      ...(hint ? { accessibilityHint: hint } : {}),
    };
  },

  /** Image with description */
  image(description: string): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "image",
      accessibilityLabel: description,
    };
  },

  /** Decorative image (hidden from screen readers) */
  decorative(): { accessible: false; importantForAccessibility: "no" } {
    return {
      accessible: false,
      importantForAccessibility: "no",
    };
  },

  /** Header / section title */
  header(label: string): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "header",
      accessibilityLabel: label,
    };
  },

  /** Text input with label and optional hint */
  input(label: string, hint?: string): A11yProps {
    return {
      accessible: true,
      accessibilityLabel: label,
      ...(hint ? { accessibilityHint: hint } : {}),
    };
  },

  /** Toggle / switch */
  toggle(label: string, isOn: boolean): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "switch",
      accessibilityLabel: label,
      accessibilityState: { checked: isOn },
    };
  },

  /** Checkbox */
  checkbox(label: string, isChecked: boolean): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "checkbox",
      accessibilityLabel: label,
      accessibilityState: { checked: isChecked },
    };
  },

  /** Tab item */
  tab(label: string, isSelected: boolean): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "tab",
      accessibilityLabel: label,
      accessibilityState: { selected: isSelected },
    };
  },

  /** Progress indicator */
  progress(label: string, value: number, max: number = 100): A11yProps {
    const percent = Math.round((value / max) * 100);
    return {
      accessible: true,
      accessibilityRole: "progressbar",
      accessibilityLabel: `${label}: ${percent}%`,
    };
  },

  /** Alert / notification */
  alert(message: string): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "alert",
      accessibilityLabel: message,
    };
  },

  /** Summary text (e.g. stats, counts) */
  summary(label: string): A11yProps {
    return {
      accessible: true,
      accessibilityRole: "summary",
      accessibilityLabel: label,
    };
  },

  /** Live region that auto-announces changes */
  liveRegion(label: string): A11yProps & { accessibilityLiveRegion: "polite" } {
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityLiveRegion: "polite",
    };
  },
};

// ── Announcements ─────────────────────────────────────────

/**
 * Announce a message to screen readers.
 */
export function announce(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

// ── useAccessibility Hook ──────────────────────────────────

interface AccessibilityState {
  /** Whether the user prefers reduced motion */
  reduceMotion: boolean;
  /** Whether a screen reader is active */
  screenReaderEnabled: boolean;
  /** Current font scale (1.0 = default) */
  fontScale: number;
  /** Whether bold text is enabled (iOS) */
  boldTextEnabled: boolean;
  /** Announce a message to screen readers */
  announce: (message: string) => void;
}

export function useAccessibility(): AccessibilityState {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [boldTextEnabled, setBoldTextEnabled] = useState(false);

  useEffect(() => {
    // Initial checks
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);
    if (Platform.OS === "ios") {
      AccessibilityInfo.isBoldTextEnabled?.()?.then(setBoldTextEnabled);
    }

    // Listeners
    const reduceMotionSub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );
    const screenReaderSub = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setScreenReaderEnabled
    );

    return () => {
      reduceMotionSub.remove();
      screenReaderSub.remove();
    };
  }, []);

  return {
    reduceMotion,
    screenReaderEnabled,
    fontScale: PixelRatio.getFontScale(),
    boldTextEnabled,
    announce,
  };
}

// ── useFocusManagement ─────────────────────────────────────

/**
 * Returns a ref and function to set accessibility focus on an element.
 * Useful after navigation or modal open.
 */
export function useA11yFocus() {
  const ref = useRef<any>(null);

  const focus = useCallback(() => {
    if (ref.current) {
      AccessibilityInfo.setAccessibilityFocus(ref.current);
    }
  }, []);

  return { ref, focus };
}

// ── Memorial-Specific A11y Helpers ─────────────────────────

/**
 * Generate accessibility label for a memorial card.
 */
export function memorialCardLabel(memorial: {
  first_name?: string | null;
  last_name?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  tribute_count?: number;
}): string {
  const name = `${memorial.first_name ?? ""} ${memorial.last_name ?? ""}`.trim() || "Unknown";
  const parts = [`Memorial for ${name}`];

  if (memorial.birth_date && memorial.death_date) {
    const birth = new Date(memorial.birth_date).getFullYear();
    const death = new Date(memorial.death_date).getFullYear();
    parts.push(`${birth} to ${death}`);
  } else if (memorial.birth_date) {
    const birth = new Date(memorial.birth_date).getFullYear();
    parts.push(`born ${birth}`);
  }

  if (memorial.tribute_count !== undefined && memorial.tribute_count > 0) {
    parts.push(`${memorial.tribute_count} tribute${memorial.tribute_count !== 1 ? "s" : ""}`);
  }

  return parts.join(", ");
}

/**
 * Generate accessibility label for a tribute.
 */
export function tributeLabel(tribute: {
  content?: string | null;
  author_name?: string | null;
  reaction_count?: number;
}): string {
  const author = tribute.author_name ?? "Someone";
  const preview = tribute.content
    ? tribute.content.length > 80
      ? tribute.content.slice(0, 80) + "..."
      : tribute.content
    : "a tribute";

  const parts = [`Tribute by ${author}: ${preview}`];

  if (tribute.reaction_count !== undefined && tribute.reaction_count > 0) {
    parts.push(`${tribute.reaction_count} reaction${tribute.reaction_count !== 1 ? "s" : ""}`);
  }

  return parts.join(". ");
}

/**
 * Generate accessibility label for a timeline event.
 */
export function timelineEventLabel(event: {
  title: string;
  event_date?: string | null;
  event_type?: string;
  description?: string | null;
}): string {
  const parts = [event.title];

  if (event.event_date) {
    parts.push(
      new Date(event.event_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }

  if (event.event_type) {
    parts.push(event.event_type.replace(/_/g, " "));
  }

  return parts.join(", ");
}
