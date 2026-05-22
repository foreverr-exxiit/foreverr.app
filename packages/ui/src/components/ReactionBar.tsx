import { useState, useCallback } from "react";
import { View, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";
import { CandleAnimation } from "./CandleAnimation";
import { HeartAnimation } from "./HeartAnimation";
import { DoveAnimation } from "./DoveAnimation";
import { BalloonAnimation } from "./BalloonAnimation";
import { CheersAnimation } from "./CheersAnimation";
import { FlowerAnimation } from "./FlowerAnimation";
import { heavyTap, lightTap, mediumTap, successHaptic } from "@foreverr/core";

// ── Reaction definitions per lifecycle mode ─────────────────────────

export interface ReactionDef {
  type: string;
  icon: keyof typeof Ionicons.glyphMap;
  outlineIcon: keyof typeof Ionicons.glyphMap;
  activeColor: string;
  inactiveColor: string;
  label: string;
  animation: "heart" | "candle" | "dove" | "balloon" | "cheers" | "flower" | null;
  hapticLevel: "light" | "medium" | "heavy";
  /** If set, render this emoji instead of an Ionicons icon */
  emoji?: string;
}

export const MEMORIAL_REACTIONS: ReactionDef[] = [
  {
    type: "heart",
    icon: "heart",
    outlineIcon: "heart-outline",
    activeColor: "#ef4444",
    inactiveColor: "#6b7280",
    label: "Love",
    animation: "heart",
    hapticLevel: "medium",
  },
  {
    type: "candle",
    icon: "flame",
    outlineIcon: "flame-outline",
    activeColor: "#d97706",
    inactiveColor: "#6b7280",
    label: "Candle",
    animation: "candle",
    hapticLevel: "heavy",
  },
  {
    type: "dove",
    icon: "paper-plane",
    outlineIcon: "paper-plane-outline",
    activeColor: "#10b981",
    inactiveColor: "#6b7280",
    label: "Honor",
    animation: "dove",
    hapticLevel: "light",
    emoji: "\uD83D\uDD4A\uFE0F",
  },
  {
    type: "balloon",
    icon: "ellipse",
    outlineIcon: "ellipse-outline",
    activeColor: "#7C3AED",
    inactiveColor: "#6b7280",
    label: "Remember",
    animation: "balloon",
    hapticLevel: "medium",
    emoji: "\uD83C\uDF88",
  },
  {
    type: "flower",
    icon: "flower",
    outlineIcon: "flower-outline",
    activeColor: "#ec4899",
    inactiveColor: "#6b7280",
    label: "Flower",
    animation: "flower",
    hapticLevel: "light",
  },
];

export const CELEBRATION_REACTIONS: ReactionDef[] = [
  {
    type: "heart",
    icon: "heart",
    outlineIcon: "heart-outline",
    activeColor: "#ef4444",
    inactiveColor: "#6b7280",
    label: "Love",
    animation: "heart",
    hapticLevel: "medium",
  },
  {
    type: "cheers",
    icon: "sparkles",
    outlineIcon: "sparkles-outline",
    activeColor: "#F59E0B",
    inactiveColor: "#6b7280",
    label: "Cheers!",
    animation: "cheers",
    hapticLevel: "heavy",
  },
  {
    type: "balloon",
    icon: "ellipse",
    outlineIcon: "ellipse-outline",
    activeColor: "#7C3AED",
    inactiveColor: "#6b7280",
    label: "Celebrate",
    animation: "balloon",
    hapticLevel: "medium",
  },
  {
    type: "flower",
    icon: "flower",
    outlineIcon: "flower-outline",
    activeColor: "#ec4899",
    inactiveColor: "#6b7280",
    label: "Flower",
    animation: "flower",
    hapticLevel: "light",
  },
  {
    type: "gift",
    icon: "gift",
    outlineIcon: "gift-outline",
    activeColor: "#8b5cf6",
    inactiveColor: "#6b7280",
    label: "Gift",
    animation: null,
    hapticLevel: "medium",
  },
];

// ── Component ───────────────────────────────────────────────────────

interface ReactionBarProps {
  onReact: (type: string) => void;
  counts?: Record<string, number>;
  /** @deprecated Use userReactions instead */
  userReaction?: string | null;
  /** Array of reaction types the current user has made */
  userReactions?: string[];
  compact?: boolean;
  /** Memorial name shown in animation overlays */
  memorialName?: string;
  /** Lifecycle mode: memorial shows candle/dove/balloon, celebration shows cheers/gift */
  mode?: "memorial" | "celebration";
  /** Called when gift reaction is tapped (celebration mode) */
  onGiftPress?: () => void;
}

export function ReactionBar({
  onReact,
  counts = {},
  userReaction,
  userReactions = [],
  compact = false,
  memorialName = "",
  mode = "memorial",
  onGiftPress,
}: ReactionBarProps) {
  // Support both legacy singular and new plural prop
  const activeReactions = userReactions.length > 0
    ? userReactions
    : userReaction ? [userReaction] : [];
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  const reactions = mode === "celebration" ? CELEBRATION_REACTIONS : MEMORIAL_REACTIONS;

  const triggerHaptic = useCallback((level: "light" | "medium" | "heavy") => {
    if (level === "heavy") heavyTap();
    else if (level === "medium") mediumTap();
    else lightTap();
  }, []);

  const handleReact = useCallback(
    (reaction: ReactionDef) => {
      // Gift reaction navigates instead of toggling
      if (reaction.type === "gift" && onGiftPress) {
        mediumTap();
        onGiftPress();
        return;
      }

      triggerHaptic(reaction.hapticLevel);
      onReact(reaction.type);

      // Trigger animation if applicable and memorial name is set
      if (reaction.animation && memorialName) {
        setActiveAnimation(reaction.animation);

        // Dove gets delayed success haptic for extra gravitas
        if (reaction.animation === "dove") {
          setTimeout(() => successHaptic(), 800);
        }
        // Cheers gets delayed success haptic for celebration punch
        if (reaction.animation === "cheers") {
          setTimeout(() => successHaptic(), 400);
        }
      }
    },
    [onReact, memorialName, onGiftPress, triggerHaptic]
  );

  const dismissAnimation = useCallback(() => {
    setActiveAnimation(null);
  }, []);

  // Shared animation overlays — rendered in a Modal so they appear above everything,
  // even when ReactionBar is nested deep inside a ScrollView.
  const animationOverlays = (
    <Modal visible={activeAnimation !== null} transparent animationType="none" statusBarTranslucent>
      <CandleAnimation
        visible={activeAnimation === "candle"}
        memorialName={memorialName}
        onDismiss={dismissAnimation}
      />
      <HeartAnimation
        visible={activeAnimation === "heart"}
        memorialName={memorialName}
        onDismiss={dismissAnimation}
      />
      <DoveAnimation
        visible={activeAnimation === "dove"}
        memorialName={memorialName}
        onDismiss={dismissAnimation}
      />
      <BalloonAnimation
        visible={activeAnimation === "balloon"}
        memorialName={memorialName}
        onDismiss={dismissAnimation}
        mode={mode}
      />
      <CheersAnimation
        visible={activeAnimation === "cheers"}
        memorialName={memorialName}
        onDismiss={dismissAnimation}
      />
      <FlowerAnimation
        visible={activeAnimation === "flower"}
        memorialName={memorialName}
        onDismiss={dismissAnimation}
      />
    </Modal>
  );

  if (compact) {
    return (
      <>
        <View className="flex-row items-center gap-1">
          {reactions.map((reaction) => {
            const count = counts[reaction.type] ?? 0;
            const isActive = activeReactions.includes(reaction.type);
            return (
              <Pressable
                key={reaction.type}
                className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${
                  isActive ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
                onPress={() => handleReact(reaction)}
              >
                {reaction.emoji ? (
                  <Text style={{ fontSize: 14, opacity: isActive ? 1 : 0.5 }}>{reaction.emoji}</Text>
                ) : (
                  <Ionicons
                    name={isActive ? reaction.icon : reaction.outlineIcon}
                    size={16}
                    color={isActive ? reaction.activeColor : reaction.inactiveColor}
                  />
                )}
                {count > 0 && (
                  <Text className={`text-[11px] font-sans-medium ${isActive ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                    {count}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
        {animationOverlays}
      </>
    );
  }

  return (
    <>
      <View className="flex-row items-center justify-around py-2">
        {reactions.map((reaction) => {
          const count = counts[reaction.type] ?? 0;
          const isActive = activeReactions.includes(reaction.type);
          return (
            <Pressable
              key={reaction.type}
              className={`items-center py-1.5 px-3 rounded-full ${isActive ? "bg-gray-50 dark:bg-gray-800" : ""}`}
              onPress={() => handleReact(reaction)}
            >
              {reaction.emoji ? (
                <Text style={{ fontSize: 20, opacity: isActive ? 1 : 0.5 }}>{reaction.emoji}</Text>
              ) : (
                <Ionicons
                  name={isActive ? reaction.icon : reaction.outlineIcon}
                  size={22}
                  color={isActive ? reaction.activeColor : reaction.inactiveColor}
                />
              )}
              <Text className={`text-[10px] font-sans-medium mt-0.5 ${isActive ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                {count > 0 ? `${count}` : reaction.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {animationOverlays}
    </>
  );
}
