import React from "react";
import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VaultFolderCardProps {
  name: string;
  icon?: string;
  color?: string;
  itemCount: number;
  onPress: () => void;
}

export function VaultFolderCard({
  name,
  icon = "folder",
  color = "#7C3AED",
  itemCount,
  onPress,
}: VaultFolderCardProps) {
  return (
    <Pressable
      className="flex-row items-center rounded-xl bg-white dark:bg-gray-800 px-4 py-3 mb-2 border border-gray-100 dark:border-gray-700"
      onPress={onPress}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
        <Text className="text-xs font-sans-medium text-gray-600 dark:text-gray-300">
          {itemCount}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9ca3af" className="ml-2" />
    </Pressable>
  );
}
