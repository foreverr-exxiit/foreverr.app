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
    <View
      className="mx-4 mt-4 rounded-2xl p-5 shadow-lg overflow-hidden"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Decorative circles — pushed further into corners, lower opacity */}
      <View
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
        style={{ backgroundColor: "rgba(124, 58, 237, 0.12)" }}
      />
      <View
        className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full"
        style={{ backgroundColor: "rgba(124, 58, 237, 0.08)" }}
      />

      {/* Greeting — dark text on light background */}
      <Text className="text-lg font-sans-bold text-gray-900 mb-1" style={{ zIndex: 1 }}>
        {greeting}
      </Text>
      {/* Subtitle — gray for legibility on white */}
      <Text className="text-sm font-sans text-gray-600 mb-4" style={{ zIndex: 1 }}>
        {subtitle}
      </Text>

      {/* Bottom row: streak + points */}
      {(!!streakCount || !!pointBalance) && (
        <View className="flex-row items-center gap-3" style={{ zIndex: 1 }}>
          {/* Streak badge */}
          {!!streakCount && streakCount > 0 && (
            <View
              className="flex-row items-center rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(74,45,122,0.1)" }}
            >
              <Ionicons name="flame" size={14} color="#F59E0B" />
              <Text className="text-xs font-sans-semibold text-brand-700 ml-1">
                {streakCount} day streak
              </Text>
            </View>
          )}

          {/* Points badge */}
          {pointBalance !== undefined && pointBalance !== null && (
            <Pressable
              className="flex-row items-center rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(74,45,122,0.1)" }}
              onPress={onPointsPress}
            >
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="text-xs font-sans-semibold text-brand-700 ml-1">
                {pointBalance.toLocaleString()} pts
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
