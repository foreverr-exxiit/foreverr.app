import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface PointsEarnedToastProps {
  points: number;
  actionDescription: string;
  onDismiss: () => void;
}

export function PointsEarnedToast({
  points,
  actionDescription,
  onDismiss,
}: PointsEarnedToastProps) {
  return (
    <View className="mx-4 bg-green-50 dark:bg-green-900/30 rounded-2xl p-4 flex-row items-center border border-green-200 dark:border-green-800 shadow-lg">
      {/* Star Icon */}
      <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 items-center justify-center mr-3">
        <Ionicons name="star" size={20} color="#22C55E" />
      </View>

      {/* Content */}
      <View className="flex-1 mr-2">
        <Text className="text-sm font-sans-bold text-green-700 dark:text-green-300">
          +{points} points
        </Text>
        <Text className="text-xs font-sans text-green-600 dark:text-green-400 mt-0.5" numberOfLines={1}>
          {actionDescription}
        </Text>
      </View>

      {/* Dismiss */}
      <Pressable
        onPress={onDismiss}
        hitSlop={12}
        className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 items-center justify-center"
      >
        <Ionicons name="close" size={14} color="#16A34A" />
      </Pressable>
    </View>
  );
}
