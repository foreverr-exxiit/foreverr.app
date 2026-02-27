import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface VirtualSpaceCardProps {
  name: string;
  description?: string | null;
  spaceType: string;
  visitorCount: number;
  itemCount: number;
  creatorName?: string;
  isPublic?: boolean;
  onPress?: () => void;
}

const spaceIcons: Record<string, string> = {
  memorial_room: "🏛️",
  garden: "🌸",
  chapel: "⛪",
  gravesite: "🪦",
  beach: "🏖️",
  forest: "🌲",
  custom: "✨",
};

const spaceLabels: Record<string, string> = {
  memorial_room: "Memorial Room",
  garden: "Garden",
  chapel: "Chapel",
  gravesite: "Gravesite",
  beach: "Beach",
  forest: "Forest",
  custom: "Custom Space",
};

export function VirtualSpaceCard({
  name,
  description,
  spaceType,
  visitorCount,
  itemCount,
  creatorName,
  isPublic = true,
  onPress,
}: VirtualSpaceCardProps) {
  const icon = spaceIcons[spaceType] || "✨";
  const label = spaceLabels[spaceType] || "Space";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl overflow-hidden mb-3 shadow-sm border border-purple-100"
    >
      {/* Header gradient */}
      <View className="bg-purple-900/80 px-4 py-6 items-center">
        <Text className="text-4xl mb-2">{icon}</Text>
        <Text className="text-lg font-bold text-white text-center" numberOfLines={1}>
          {name}
        </Text>
        <View className="bg-white/20 rounded-full px-3 py-1 mt-2">
          <Text className="text-xs text-white font-medium">{label}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {description && (
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3" numberOfLines={2}>
            {description}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-4">
              <Text className="text-xs text-gray-500">👥 {visitorCount} visitors</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">🕯️ {itemCount} items</Text>
            </View>
          </View>
          {!isPublic && (
            <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
              <Text className="text-xs text-gray-500">🔒</Text>
            </View>
          )}
        </View>

        {creatorName && (
          <Text className="text-xs text-gray-400 mt-2">Created by {creatorName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
