import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface QuestCardProps {
  name: string;
  description: string;
  emoji: string;
  currentCount: number;
  requiredCount: number;
  rewardPoints: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
  onClaimReward?: () => void;
}

export function QuestCard({
  name,
  description,
  emoji,
  currentCount,
  requiredCount,
  rewardPoints,
  isCompleted,
  rewardClaimed,
  onClaimReward,
}: QuestCardProps) {
  const progressPct =
    requiredCount > 0
      ? Math.min((currentCount / requiredCount) * 100, 100)
      : 100;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-3">
      <View className="flex-row items-center">
        {/* Left: emoji circle */}
        <View
          className="h-12 w-12 rounded-full items-center justify-center mr-3"
          style={{
            backgroundColor: isCompleted
              ? "rgba(5, 150, 105, 0.1)"
              : "rgba(107, 114, 128, 0.08)",
          }}
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </View>

        {/* Center: name, description, progress */}
        <View className="flex-1 mr-3">
          <Text
            className="text-sm font-sans-bold text-gray-900 dark:text-white"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-0.5"
            numberOfLines={1}
          >
            {description}
          </Text>

          {/* Progress bar */}
          <View className="mt-2">
            <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: isCompleted ? "#059669" : "#7C3AED",
                }}
              />
            </View>
            <Text className="text-[10px] font-sans text-gray-400 dark:text-gray-500 mt-1">
              {currentCount} of {requiredCount}
            </Text>
          </View>
        </View>

        {/* Right: points badge or claim button */}
        <View className="items-end">
          {/* Points badge */}
          <View className="flex-row items-center gap-1 mb-2">
            <Ionicons name="star" size={12} color="#d97706" />
            <Text className="text-xs font-sans-bold text-amber-700 dark:text-amber-400">
              {rewardPoints} pts
            </Text>
          </View>

          {/* Status / Action */}
          {isCompleted && !rewardClaimed ? (
            <Pressable
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: "#D97706" }}
              onPress={() => onClaimReward?.()}
            >
              <Text className="text-[11px] font-sans-bold text-white">
                Claim
              </Text>
            </Pressable>
          ) : isCompleted && rewardClaimed ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
