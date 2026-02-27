import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface StreakCardProps {
  memorialName: string;
  memorialPhotoUrl?: string | null;
  currentStreak: number;
  longestStreak: number;
  totalVisits: number;
  totalCandlesLit: number;
  totalMemoriesShared: number;
  lastActivityDate: string;
  onPress?: () => void;
}

export function StreakCard({
  memorialName,
  currentStreak,
  longestStreak,
  totalVisits,
  totalCandlesLit,
  totalMemoriesShared,
  lastActivityDate,
  onPress,
}: StreakCardProps) {
  const isActive = currentStreak > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View
          className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
            isActive ? "bg-orange-50" : "bg-gray-50 dark:bg-gray-900"
          }`}
        >
          <Text className="text-2xl">{isActive ? "🔥" : "💤"}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
            {memorialName}
          </Text>
          <Text className="text-xs text-gray-500">
            Last activity: {new Date(lastActivityDate).toLocaleDateString()}
          </Text>
        </View>
        <View className="items-center">
          <Text
            className={`text-2xl font-bold ${
              isActive ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {currentStreak}
          </Text>
          <Text className="text-xs text-gray-400">day streak</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">{longestStreak}</Text>
          <Text className="text-xs text-gray-500">Best</Text>
        </View>
        <View className="w-px bg-gray-200" />
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">{totalVisits}</Text>
          <Text className="text-xs text-gray-500">Visits</Text>
        </View>
        <View className="w-px bg-gray-200" />
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">{totalCandlesLit}</Text>
          <Text className="text-xs text-gray-500">🕯️</Text>
        </View>
        <View className="w-px bg-gray-200" />
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">{totalMemoriesShared}</Text>
          <Text className="text-xs text-gray-500">💭</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
