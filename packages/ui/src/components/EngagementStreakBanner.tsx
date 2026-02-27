import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface EngagementStreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  onShare?: () => void;
  onViewDetails?: () => void;
}

export function EngagementStreakBanner({
  currentStreak,
  longestStreak,
  totalDaysActive,
  onShare,
  onViewDetails,
}: EngagementStreakBannerProps) {
  if (currentStreak === 0) return null;

  return (
    <Pressable
      className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 overflow-hidden"
      onPress={onViewDetails}
    >
      <View className="flex-row items-center p-4">
        <View className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
          <Ionicons name="flame" size={26} color="#D97706" />
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="text-2xl font-sans-bold text-amber-700">{currentStreak}</Text>
            <Text className="ml-1 text-xs font-sans-semibold text-amber-600">day streak!</Text>
          </View>
          <View className="flex-row items-center gap-3 mt-0.5">
            <Text className="text-[10px] font-sans text-gray-500">Best: {longestStreak}d</Text>
            <Text className="text-[10px] font-sans text-gray-500">Total: {totalDaysActive}d</Text>
          </View>
        </View>
        {onShare && (
          <Pressable
            className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2"
            onPress={onShare}
          >
            <Ionicons name="share-outline" size={18} color="#D97706" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
