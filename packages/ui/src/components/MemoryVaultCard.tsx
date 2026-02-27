import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface MemoryVaultCardProps {
  title: string;
  itemType: string;
  description?: string | null;
  uploaderName?: string;
  createdAt: string;
  isPrivate?: boolean;
  onPress?: () => void;
}

const typeIcons: Record<string, string> = {
  document: "📄",
  recipe: "🍳",
  letter: "✉️",
  audio_playlist: "🎵",
  quote: "💬",
  photo_album: "📸",
  video: "🎬",
  other: "📦",
};

const typeLabels: Record<string, string> = {
  document: "Document",
  recipe: "Recipe",
  letter: "Letter",
  audio_playlist: "Playlist",
  quote: "Quote",
  photo_album: "Album",
  video: "Video",
  other: "Other",
};

export function MemoryVaultCard({
  title,
  itemType,
  description,
  uploaderName,
  createdAt,
  isPrivate,
  onPress,
}: MemoryVaultCardProps) {
  const icon = typeIcons[itemType] || "📦";
  const label = typeLabels[itemType] || "Item";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <View className="flex-row items-start">
        <View className="w-12 h-12 rounded-xl bg-purple-50 items-center justify-center mr-3">
          <Text className="text-2xl">{icon}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
              {title}
            </Text>
            {isPrivate && (
              <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-xs text-gray-500">🔒 Private</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mb-1">
            <View className="bg-purple-100 rounded-full px-2 py-0.5 mr-2">
              <Text className="text-xs text-purple-700 font-medium">{label}</Text>
            </View>
            {uploaderName && (
              <Text className="text-xs text-gray-500">by {uploaderName}</Text>
            )}
          </View>
          {description && (
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1" numberOfLines={2}>
              {description}
            </Text>
          )}
          <Text className="text-xs text-gray-400 mt-2">
            {new Date(createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
