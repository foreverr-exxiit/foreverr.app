import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface CategoryChipProps {
  name: string;
  iconName?: string | null;
  isSelected?: boolean;
  onPress?: () => void;
}

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  archive: "archive",
  flower: "sun",
  monument: "square",
  shirt: "shopping-bag",
  heart: "heart",
  "book-open": "book-open",
  sparkles: "star",
  building: "home",
  utensils: "coffee",
  "more-horizontal": "more-horizontal",
};

export function CategoryChip({ name, iconName, isSelected, onPress }: CategoryChipProps) {
  const featherIcon = iconName ? ICON_MAP[iconName] ?? "tag" : "tag";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
        isSelected
          ? "bg-purple-600 border-purple-600"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
      }`}
    >
      <Feather
        name={featherIcon}
        size={14}
        color={isSelected ? "#FFFFFF" : "#6B7280"}
      />
      <Text
        className={`text-sm font-medium ${
          isSelected ? "text-white" : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
