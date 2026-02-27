import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface TimeCapsuleCardProps {
  title: string;
  description?: string | null;
  unlockDate: string;
  isUnlocked: boolean;
  creatorName?: string;
  viewCount?: number;
  onPress?: () => void;
}

export function TimeCapsuleCard({
  title,
  description,
  unlockDate,
  isUnlocked,
  creatorName,
  viewCount,
  onPress,
}: TimeCapsuleCardProps) {
  const unlockDateObj = new Date(unlockDate);
  const now = new Date();
  const daysUntilUnlock = Math.ceil((unlockDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`rounded-2xl p-4 mb-3 shadow-sm border ${
        isUnlocked
          ? "bg-white dark:bg-gray-800 border-green-200"
          : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
      }`}
    >
      <View className="flex-row items-start">
        <View className={`w-14 h-14 rounded-xl items-center justify-center mr-3 ${
          isUnlocked ? "bg-green-100" : "bg-purple-100"
        }`}>
          <Text className="text-3xl">{isUnlocked ? "🔓" : "🔒"}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
            {title}
          </Text>
          {description && (
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2" numberOfLines={2}>
              {description}
            </Text>
          )}
          <View className="flex-row items-center">
            {isUnlocked ? (
              <View className="bg-green-100 rounded-full px-3 py-1">
                <Text className="text-xs text-green-700 font-medium">✨ Unlocked</Text>
              </View>
            ) : (
              <View className="bg-purple-100 rounded-full px-3 py-1">
                <Text className="text-xs text-purple-700 font-medium">
                  {daysUntilUnlock > 0 ? `⏳ ${daysUntilUnlock} days` : "Ready to unlock!"}
                </Text>
              </View>
            )}
            {creatorName && (
              <Text className="text-xs text-gray-500 ml-2">by {creatorName}</Text>
            )}
            {isUnlocked && viewCount !== undefined && (
              <Text className="text-xs text-gray-400 ml-auto">{viewCount} views</Text>
            )}
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            {isUnlocked ? "Unlocked" : "Unlocks"}: {unlockDateObj.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
