import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const LEVEL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  leaf: "leaf",
  flower: "flower",
  tree: "leaf",
  forest: "leaf",
  mountain: "triangle",
  star: "star",
};

interface LegacyPointsBadgeProps {
  currentBalance: number;
  level: number;
  levelName: string;
  levelIcon: string;
  compact?: boolean;
  onPress?: () => void;
}

export function LegacyPointsBadge({
  currentBalance,
  level,
  levelName,
  levelIcon,
  compact = false,
  onPress,
}: LegacyPointsBadgeProps) {
  const iconName = LEVEL_ICONS[levelIcon] ?? "star";

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center bg-brand-50 dark:bg-brand-900/30 rounded-full px-3 py-1.5"
      >
        <Ionicons name={iconName} size={14} color="#7C3AED" />
        <Text className="text-xs font-sans-semibold text-brand-700 dark:text-brand-300 ml-1">
          {currentBalance.toLocaleString()}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm items-center"
    >
      {/* Level Badge Circle */}
      <View className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3 border-2 border-brand-200 dark:border-brand-700">
        <Ionicons name={iconName} size={36} color="#7C3AED" />
      </View>

      {/* Points */}
      <Text className="text-3xl font-sans-bold text-gray-900 dark:text-white">
        {currentBalance.toLocaleString()}
      </Text>
      <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 mt-0.5">
        Legacy Points
      </Text>

      {/* Level Pill */}
      <View className="flex-row items-center bg-brand-50 dark:bg-brand-900/30 rounded-full px-3 py-1 mt-2">
        <Ionicons name={iconName} size={12} color="#7C3AED" />
        <Text className="text-xs font-sans-semibold text-brand-700 dark:text-brand-300 ml-1">
          Level {level} - {levelName}
        </Text>
      </View>
    </Pressable>
  );
}
