import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface WarmGreetingHeaderProps {
  userName: string;
  greeting: string;
  subtitle: string;
  streakCount?: number;
  pointBalance?: number;
  onPointsPress?: () => void;
}

export function WarmGreetingHeader({
  userName,
  greeting,
  subtitle,
  streakCount,
  pointBalance,
  onPointsPress,
}: WarmGreetingHeaderProps) {
  return (
    <View className="mx-4 mt-4 rounded-2xl bg-brand-600 dark:bg-brand-800 p-5 shadow-lg overflow-hidden">
      {/* Decorative circles */}
      <View className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-brand-500/20" />
      <View className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-brand-400/15" />

      {/* Greeting */}
      <Text className="text-lg font-sans-bold text-white mb-1">
        {greeting}
      </Text>
      <Text className="text-sm font-sans text-brand-200 dark:text-brand-300 mb-4">
        {subtitle}
      </Text>

      {/* Bottom row: streak + points */}
      {(!!streakCount || !!pointBalance) && (
        <View className="flex-row items-center gap-3">
          {/* Streak badge */}
          {!!streakCount && streakCount > 0 && (
            <View className="flex-row items-center bg-white/15 rounded-full px-3 py-1.5">
              <Ionicons name="flame" size={14} color="#FCD34D" />
              <Text className="text-xs font-sans-semibold text-amber-200 ml-1">
                {streakCount} day streak
              </Text>
            </View>
          )}

          {/* Points badge */}
          {pointBalance !== undefined && pointBalance !== null && (
            <Pressable
              className="flex-row items-center bg-white/15 rounded-full px-3 py-1.5"
              onPress={onPointsPress}
            >
              <Ionicons name="star" size={14} color="#FCD34D" />
              <Text className="text-xs font-sans-semibold text-amber-200 ml-1">
                {pointBalance.toLocaleString()} pts
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
