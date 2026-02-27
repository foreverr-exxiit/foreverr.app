import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
};

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  category: string;
  badgeTier?: string;
  progress?: number;
  nextThreshold?: number;
  isEarned: boolean;
  onPress?: () => void;
}

export function BadgeCard({
  name,
  description,
  icon,
  category,
  badgeTier,
  progress = 0,
  nextThreshold,
  isEarned,
  onPress,
}: BadgeCardProps) {
  const tierColor = TIER_COLORS[badgeTier ?? "bronze"] ?? "#C0C0C0";
  const progressPct = nextThreshold ? Math.min((progress / nextThreshold) * 100, 100) : 0;

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl p-4 mb-3 border ${
        isEarned
          ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
          : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"
      }`}
      style={{ opacity: isEarned ? 1 : 0.6 }}
    >
      <View className="flex-row items-center">
        {/* Badge Icon */}
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{
            borderWidth: isEarned ? 2.5 : 1,
            borderColor: isEarned ? tierColor : "#d1d5db",
            backgroundColor: isEarned ? `${tierColor}15` : "#f3f4f6",
          }}
        >
          <Ionicons
            name={icon as any}
            size={24}
            color={isEarned ? tierColor : "#9ca3af"}
          />
        </View>

        {/* Info */}
        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white flex-1">
              {name}
            </Text>
            {isEarned && badgeTier && (
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: `${tierColor}20` }}
              >
                <Text className="text-[10px] font-sans-medium capitalize" style={{ color: tierColor }}>
                  {badgeTier}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={2}>
            {description}
          </Text>
          <Text className="text-[10px] font-sans text-gray-400 capitalize mt-1">
            {category}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      {!isEarned && nextThreshold && nextThreshold > 0 && (
        <View className="mt-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-[10px] font-sans text-gray-400">Progress</Text>
            <Text className="text-[10px] font-sans text-gray-400">
              {progress}/{nextThreshold}
            </Text>
          </View>
          <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${progressPct}%` }}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
}
