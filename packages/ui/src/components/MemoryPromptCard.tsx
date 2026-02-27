import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface MemoryPromptCardProps {
  promptText: string;
  promptType: string;
  responseCount: number;
  triggerDate?: string | null;
  createdAt: string;
  onPress?: () => void;
}

const typeIcons: Record<string, string> = {
  memory: "💭",
  story: "📖",
  photo: "📷",
  recipe: "🍳",
  song: "🎵",
  lesson: "🎓",
};

const typeLabels: Record<string, string> = {
  memory: "Memory",
  story: "Story",
  photo: "Photo",
  recipe: "Recipe",
  song: "Song",
  lesson: "Lesson",
};

export function MemoryPromptCard({
  promptText,
  promptType,
  responseCount,
  triggerDate,
  createdAt,
  onPress,
}: MemoryPromptCardProps) {
  const icon = typeIcons[promptType] || "💭";
  const label = typeLabels[promptType] || "Prompt";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <View className="flex-row items-start">
        <View className="w-12 h-12 rounded-xl bg-indigo-50 items-center justify-center mr-3">
          <Text className="text-2xl">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900 dark:text-white mb-1.5" numberOfLines={2}>
            {promptText}
          </Text>
          <View className="flex-row items-center flex-wrap">
            <View className="bg-indigo-100 rounded-full px-2 py-0.5 mr-2">
              <Text className="text-xs text-indigo-700 font-medium">{label}</Text>
            </View>
            <Text className="text-xs text-gray-500">
              {responseCount} {responseCount === 1 ? "response" : "responses"}
            </Text>
          </View>
          {triggerDate && (
            <Text className="text-xs text-gray-400 mt-1.5">
              Scheduled: {new Date(triggerDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
