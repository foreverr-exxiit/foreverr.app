import React from "react";
import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VaultCategoryCardProps {
  title: string;
  icon: string;
  count: number;
  color: string;
  onPress: () => void;
}

export function VaultCategoryCard({
  title,
  icon,
  count,
  color,
  onPress,
}: VaultCategoryCardProps) {
  return (
    <Pressable
      className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 min-h-[100px]"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}
      onPress={onPress}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-1">
        {count} {count === 1 ? "item" : "items"}
      </Text>
    </Pressable>
  );
}
