import React, { useEffect } from "react";
import { View, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface CelebrationOverlayProps {
  visible: boolean;
  type:
    | "level_up"
    | "streak_milestone"
    | "first_tribute"
    | "quest_complete"
    | "welcome_task";
  title: string;
  subtitle?: string;
  emoji?: string;
  bonusPoints?: number;
  onDismiss: () => void;
}

const TYPE_DEFAULTS: Record<
  CelebrationOverlayProps["type"],
  { emoji: string; color: string; bgClass: string }
> = {
  level_up: {
    emoji: "\u2B50",
    color: "#7C3AED",
    bgClass: "bg-brand-50 dark:bg-brand-900/20",
  },
  streak_milestone: {
    emoji: "\uD83D\uDD25",
    color: "#EA580C",
    bgClass: "bg-orange-50 dark:bg-orange-900/20",
  },
  first_tribute: {
    emoji: "\u270D\uFE0F",
    color: "#2563EB",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
  },
  quest_complete: {
    emoji: "\uD83C\uDFC6",
    color: "#D97706",
    bgClass: "bg-amber-50 dark:bg-amber-900/20",
  },
  welcome_task: {
    emoji: "\uD83C\uDF89",
    color: "#059669",
    bgClass: "bg-green-50 dark:bg-green-900/20",
  },
};

const CONFETTI_TOP = [
  "\uD83C\uDF89",
  "\u2728",
  "\uD83C\uDF8A",
  "\uD83D\uDC96",
  "\u2B50",
  "\uD83C\uDF89",
  "\u2728",
];
const CONFETTI_BOTTOM = [
  "\u2728",
  "\uD83C\uDF89",
  "\u2B50",
  "\uD83C\uDF8A",
  "\uD83D\uDC96",
  "\u2728",
  "\uD83C\uDF89",
];

export function CelebrationOverlay({
  visible,
  type,
  title,
  subtitle,
  emoji,
  bonusPoints,
  onDismiss,
}: CelebrationOverlayProps) {
  const config = TYPE_DEFAULTS[type];
  const displayEmoji = emoji ?? config.emoji;

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <View className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm overflow-hidden">
          {/* Decorated header section */}
          <View className={`${config.bgClass} items-center pt-6 pb-4 px-6`}>
            {/* Sparkle decorations */}
            <View className="absolute top-3 left-5">
              <Ionicons name="star" size={14} color={config.color} />
            </View>
            <View className="absolute top-5 right-7">
              <Ionicons name="star" size={10} color={config.color} />
            </View>
            <View className="absolute top-2 right-14">
              <Ionicons name="sparkles" size={12} color={config.color} />
            </View>
            <View className="absolute top-6 left-14">
              <Ionicons name="sparkles" size={10} color={config.color} />
            </View>

            {/* Confetti row top */}
            <View className="flex-row gap-2 mb-3">
              {CONFETTI_TOP.map((e, i) => (
                <Text key={i} style={{ fontSize: 16 + (i % 3) * 3 }}>
                  {e}
                </Text>
              ))}
            </View>

            {/* Large emoji */}
            <View
              className="h-24 w-24 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: `${config.color}12` }}
            >
              <Text style={{ fontSize: 48 }}>{displayEmoji}</Text>
            </View>

            {/* Title */}
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white text-center">
              {title}
            </Text>
          </View>

          {/* Content area */}
          <View className="px-6 pt-4 pb-6 items-center">
            {/* Subtitle */}
            {subtitle && (
              <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 text-center mb-4 leading-5">
                {subtitle}
              </Text>
            )}

            {/* Bonus points badge */}
            {bonusPoints != null && bonusPoints > 0 && (
              <View className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 rounded-full px-4 py-2 mb-4">
                <Ionicons name="star" size={16} color="#D97706" />
                <Text className="text-sm font-sans-bold text-amber-700 dark:text-amber-400 ml-1.5">
                  +{bonusPoints} points
                </Text>
              </View>
            )}

            {/* Confetti row bottom */}
            <View className="flex-row gap-2 mb-5">
              {CONFETTI_BOTTOM.map((e, i) => (
                <Text key={i} style={{ fontSize: 14 + (i % 3) * 3 }}>
                  {e}
                </Text>
              ))}
            </View>

            {/* Dismiss button */}
            <Pressable
              className="w-full rounded-xl py-3.5 items-center"
              style={{ backgroundColor: config.color }}
              onPress={onDismiss}
            >
              <Text className="text-base font-sans-bold text-white">
                Awesome!
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
