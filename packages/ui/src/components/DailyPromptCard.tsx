import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface DailyPromptCardProps {
  promptText: string;
  category: string;
  icon: string;
  hasResponded?: boolean;
  onRespond: () => void;
  onSkip?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  gratitude: "#F59E0B",
  remembrance: "#8B5CF6",
  appreciation: "#059669",
  reflection: "#2563EB",
  connection: "#EC4899",
  milestone: "#D97706",
};

export function DailyPromptCard({
  promptText,
  category,
  icon,
  hasResponded,
  onRespond,
  onSkip,
}: DailyPromptCardProps) {
  const color = CATEGORY_COLORS[category] ?? "#7C3AED";

  return (
    <View className="mx-4 mt-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <View
          className="h-8 w-8 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <View className="ml-2 flex-1">
          <Text className="text-[10px] font-sans-semibold uppercase tracking-wider" style={{ color }}>
            Daily Prompt · {category}
          </Text>
        </View>
        {hasResponded && (
          <View className="rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5">
            <Text className="text-[10px] font-sans-semibold text-green-700">Done</Text>
          </View>
        )}
      </View>

      {/* Prompt text */}
      <View className="px-4 py-3">
        <Text className="text-base font-sans-semibold text-gray-900 dark:text-white leading-6">
          {promptText}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row px-4 pb-4 gap-2">
        <Pressable
          className="flex-1 rounded-full py-2.5 items-center"
          style={{ backgroundColor: hasResponded ? "#e5e7eb" : color }}
          onPress={onRespond}
        >
          <Text className={`text-sm font-sans-semibold ${hasResponded ? "text-gray-600" : "text-white"}`}>
            {hasResponded ? "View Response" : "Respond"}
          </Text>
        </Pressable>
        {!hasResponded && onSkip && (
          <Pressable
            className="rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-2.5 items-center"
            onPress={onSkip}
          >
            <Text className="text-sm font-sans-medium text-gray-500">Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
