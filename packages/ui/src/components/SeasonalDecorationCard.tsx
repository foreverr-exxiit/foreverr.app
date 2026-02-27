import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface SeasonalDecorationCardProps {
  name: string;
  description?: string | null;
  decorationType: string;
  previewImageUrl?: string | null;
  ribbonCost: number;
  availableFrom?: string | null;
  availableUntil?: string | null;
  isApplied?: boolean;
  onPress?: () => void;
}

const typeIcons: Record<string, string> = {
  wreath: "🎄",
  flower_arrangement: "💐",
  candle_set: "🕯️",
  banner: "🎌",
  frame: "🖼️",
  background: "🌅",
  border: "✨",
  animation: "🎆",
  seasonal_theme: "🍂",
  holiday_special: "🎃",
  memorial_day: "🏵️",
  religious: "✝️",
  cultural: "🪔",
};

export function SeasonalDecorationCard({
  name,
  description,
  decorationType,
  ribbonCost,
  availableFrom,
  availableUntil,
  isApplied,
  onPress,
}: SeasonalDecorationCardProps) {
  const icon = typeIcons[decorationType] || "🎨";
  const isLimited = availableFrom || availableUntil;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm border ${
        isApplied ? "border-green-300" : "border-gray-100 dark:border-gray-700"
      }`}
    >
      <View className="flex-row items-start">
        <View className="w-14 h-14 rounded-xl bg-purple-50 items-center justify-center mr-3">
          <Text className="text-3xl">{icon}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
              {name}
            </Text>
            {isApplied && (
              <View className="bg-green-100 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-xs text-green-700 font-medium">Applied</Text>
              </View>
            )}
          </View>
          {description && (
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2" numberOfLines={2}>
              {description}
            </Text>
          )}
          <View className="flex-row items-center">
            <View className="bg-purple-100 rounded-full px-2 py-0.5 mr-2">
              <Text className="text-xs text-purple-700 font-medium">
                🎀 {ribbonCost} ribbons
              </Text>
            </View>
            {isLimited && (
              <View className="bg-amber-100 rounded-full px-2 py-0.5">
                <Text className="text-xs text-amber-700 font-medium">Limited</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
