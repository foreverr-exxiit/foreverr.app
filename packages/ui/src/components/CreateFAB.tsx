import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Pressable,
  Animated,
  Platform,
  StyleSheet,
  Easing,
  useColorScheme,
  Dimensions,
} from "react-native";

const USE_NATIVE_DRIVER = Platform.OS !== "web";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";
import { FeatureGateModal } from "./FeatureGateModal";

// ── The 9 create options ─────────────────────────────────────────────
export const CREATE_OPTIONS = [
  {
    key: "living-tribute",
    route: "/living-tribute/create",
    title: "Living\nTribute",
    emoji: "\uD83C\uDF89",
    color: "#059669",
    bg: "#ecfdf5",
    bgDark: "#064e3b",
  },
  {
    key: "memorial",
    route: "/lifecycle/create/basic-info",
    title: "Memorial",
    emoji: "\uD83D\uDD4A\uFE0F",
    color: "#4A2D7A",
    bg: "#f3e8ff",
    bgDark: "#3b0764",
  },
  {
    key: "announce",
    route: "/announce",
    title: "Announce\n& Share",
    emoji: "\uD83D\uDCE3",
    color: "#2563EB",
    bg: "#eff6ff",
    bgDark: "#1e3a5f",
  },
  {
    key: "appreciation",
    route: "/appreciation/compose",
    title: "Appreciation\nLetter",
    emoji: "\uD83D\uDC8C",
    color: "#8B5CF6",
    bg: "#f5f3ff",
    bgDark: "#4c1d95",
  },
  {
    key: "vault",
    route: "/memory-vault/create",
    title: "Add to\nCore",
    emoji: "\uD83D\uDD12",
    color: "#4f46e5",
    bg: "#eef2ff",
    bgDark: "#312e81",
  },
  {
    key: "scrapbook",
    route: "/scrapbook/create",
    title: "Scrapbook",
    emoji: "\uD83D\uDCD6",
    color: "#EC4899",
    bg: "#fdf2f8",
    bgDark: "#831843",
  },
  {
    key: "flowers",
    route: "/gifts",
    title: "Give\nFlowers",
    emoji: "\uD83C\uDF38",
    color: "#e11d48",
    bg: "#fff1f2",
    bgDark: "#881337",
  },
  {
    key: "celebrity",
    route: "/trust",
    title: "Celebrity\nMemorial",
    emoji: "\u2B50",
    color: "#d97706",
    bg: "#fffbeb",
    bgDark: "#78350f",
  },
  {
    key: "event",
    route: "/events/create",
    title: "Create\nEvent",
    emoji: "\uD83D\uDCC5",
    color: "#0891b2",
    bg: "#ecfeff",
    bgDark: "#164e63",
  },
  {
    key: "import",
    route: "/import",
    title: "Import\nContent",
    emoji: "\uD83D\uDCE5",
    color: "#64748b",
    bg: "#f8fafc",
    bgDark: "#334155",
  },
] as const;

// ── Progressive unlocking ───────────────────────────────────────────
// Level each create option is gated behind (migration 00044). Level 1 =
// the core creative acts a brand-new user reaches for; secondary/creator
// options reveal as they engage. Creating a memorial stays Level 1.
const OPTION_LEVELS: Record<string, number> = {
  "living-tribute": 1,
  memorial: 1,
  announce: 1,
  appreciation: 1,
  vault: 1,
  scrapbook: 2,
  flowers: 2,
  event: 2,
  import: 2,
  celebrity: 3,
};

// Level → minimum total Core Points, mirrors LEVEL_TIERS in
// @foreverr/core's useFeatureAccess. Used for "N points to go".
const LEVEL_MIN_POINTS: Record<number, number> = {
  1: 0, 2: 100, 3: 500, 4: 2000, 5: 5000, 6: 15000, 7: 50000,
};

// ── Component ──────────────────────────────────────────────────────
interface CreateFABProps {
  onOptionPress: (route: string) => void;
  /** Current progressive-unlocking level. Omit (or undefined) to show
      every option unlocked — used for guests / while level loads. */
  currentLevel?: number;
  /** Current total Core Points, for the unlock modal's "points to go". */
  currentPoints?: number;
  /** Routes to the points/progress screen from the unlock modal. */
  onViewProgress?: () => void;
}

const FAB_BOTTOM = Platform.OS === "ios" ? 100 : 76;
const ANIM_DURATION = 260;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SHEET_PADDING = 20;
const GRID_GAP = 10;
const COLUMNS = 3;
const TILE_SIZE = Math.min(
  (SCREEN_WIDTH - SHEET_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS,
  105
);

export function CreateFAB({
  onOptionPress,
  currentLevel,
  currentPoints = 0,
  onViewProgress,
}: CreateFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [gatedOption, setGatedOption] = useState<
    (typeof CREATE_OPTIONS)[number] | null
  >(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // A brand-new user (level 1) sees the core creative acts; higher-level
  // options appear as they engage. If currentLevel is undefined (guest /
  // still loading) nothing is gated — better to over-show than block.
  const isLocked = useCallback(
    (optKey: string): number | null => {
      if (currentLevel == null) return null;
      const req = OPTION_LEVELS[optKey] ?? 1;
      return req > currentLevel ? req : null;
    },
    [currentLevel],
  );

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(500)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    setIsExpanded(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: ANIM_DURATION,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(fabRotation, {
        toValue: 1,
        duration: ANIM_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [overlayOpacity, sheetTranslateY, fabRotation]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 500,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(fabRotation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => setIsExpanded(false));
  }, [overlayOpacity, sheetTranslateY, fabRotation]);

  const toggle = useCallback(() => {
    if (isExpanded) close();
    else open();
  }, [isExpanded, open, close]);

  const rotateInterpolation = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // Build 3×3 grid rows
  const rows: (typeof CREATE_OPTIONS[number])[][] = [];
  for (let i = 0; i < CREATE_OPTIONS.length; i += COLUMNS) {
    rows.push(CREATE_OPTIONS.slice(i, i + COLUMNS) as any);
  }

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <Pressable
          onPress={close}
          style={[StyleSheet.absoluteFill, { zIndex: 998 }]}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
              opacity: overlayOpacity,
            }}
          />
        </Pressable>
      )}

      {/* Bottom Sheet */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              transform: [{ translateY: sheetTranslateY }],
              paddingBottom: Platform.OS === "ios" ? 34 : 20,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleRow}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? "#4b5563" : "#d1d5db" },
              ]}
            />
          </View>

          {/* Title row */}
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.titleText,
                { color: isDark ? "#f9fafb" : "#111827" },
              ]}
            >
              Create
            </Text>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close create menu"
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name="close"
                size={18}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
            </Pressable>
          </View>

          {/* 3×3 Grid */}
          <View style={styles.grid}>
            {rows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.gridRow}>
                {row.map((opt) => {
                  const lockedAt = isLocked(opt.key);
                  const locked = lockedAt != null;
                  return (
                  <Pressable
                    key={opt.key}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: locked }}
                    accessibilityLabel={
                      locked
                        ? `${opt.title.replace(/\n/g, " ")}, locked, unlocks at level ${lockedAt}`
                        : opt.title.replace(/\n/g, " ")
                    }
                    onPress={() => {
                      if (locked) {
                        setGatedOption(opt);
                        return;
                      }
                      close();
                      setTimeout(() => onOptionPress(opt.route), 220);
                    }}
                    style={({ pressed }) => [
                      styles.tile,
                      {
                        width: TILE_SIZE,
                        backgroundColor: isDark ? opt.bgDark : opt.bg,
                        borderColor: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)",
                      },
                      locked && { opacity: 0.5 },
                      pressed && { transform: [{ scale: 0.94 }], opacity: 0.85 },
                    ]}
                  >
                    <View
                      style={[
                        styles.emojiWrap,
                        { backgroundColor: opt.color + "18" },
                      ]}
                    >
                      <Text style={styles.emoji}>{opt.emoji}</Text>
                    </View>
                    <Text
                      style={[
                        styles.tileLabel,
                        { color: isDark ? "#e5e7eb" : "#374151" },
                      ]}
                      numberOfLines={2}
                    >
                      {opt.title}
                    </Text>
                    {locked && (
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={9} color="#ffffff" />
                        <Text style={styles.lockBadgeText}>Lv {lockedAt}</Text>
                      </View>
                    )}
                  </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* FAB button */}
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={isExpanded ? "Close create menu" : "Create"}
        accessibilityState={{ expanded: isExpanded }}
        style={({ pressed }) => [
          styles.fab,
          { bottom: FAB_BOTTOM },
          pressed && { transform: [{ scale: 0.92 }] },
        ]}
      >
        <Animated.View
          style={{ transform: [{ rotate: rotateInterpolation }] }}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </Animated.View>
      </Pressable>

      {/* Locked-option explainer */}
      <FeatureGateModal
        visible={gatedOption !== null}
        onClose={() => setGatedOption(null)}
        featureLabel={gatedOption ? gatedOption.title.replace(/\n/g, " ") : ""}
        featureIcon={null}
        requiredLevel={gatedOption ? OPTION_LEVELS[gatedOption.key] ?? 1 : 1}
        currentLevel={currentLevel ?? 1}
        pointsNeeded={
          gatedOption
            ? Math.max(
                0,
                (LEVEL_MIN_POINTS[OPTION_LEVELS[gatedOption.key] ?? 1] ?? 0) -
                  currentPoints,
              )
            : 0
        }
        onViewProgress={onViewProgress}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SHEET_PADDING,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleRow: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  closeBtn: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    gap: GRID_GAP,
    paddingBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: GRID_GAP,
  },
  tile: {
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    padding: 6,
  },
  emojiWrap: {
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emoji: {
    fontSize: 22,
  },
  tileLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 14,
  },
  lockBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(17,24,39,0.8)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  lockBadgeText: {
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Inter_700Bold",
  },
});
