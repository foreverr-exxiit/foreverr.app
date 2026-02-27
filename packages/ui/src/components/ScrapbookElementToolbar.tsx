import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ScrapbookElementToolbarProps {
  onAddPhoto: () => void;
  onAddText: () => void;
  onAddSticker: () => void;
  onAddShape?: () => void;
  onDelete?: () => void;
  hasSelection?: boolean;
}

const TOOLS = [
  { key: "photo", icon: "image" as const, label: "Photo", color: "#7C3AED" },
  { key: "text", icon: "text" as const, label: "Text", color: "#2563EB" },
  { key: "sticker", icon: "happy" as const, label: "Sticker", color: "#D97706" },
  { key: "shape", icon: "shapes" as const, label: "Shape", color: "#059669" },
];

export function ScrapbookElementToolbar({
  onAddPhoto,
  onAddText,
  onAddSticker,
  onAddShape,
  onDelete,
  hasSelection,
}: ScrapbookElementToolbarProps) {
  const handlePress = (key: string) => {
    switch (key) {
      case "photo":
        onAddPhoto();
        break;
      case "text":
        onAddText();
        break;
      case "sticker":
        onAddSticker();
        break;
      case "shape":
        onAddShape?.();
        break;
    }
  };

  return (
    <View className="flex-row items-center justify-center bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-3 px-4 gap-2">
      {TOOLS.map((tool) => (
        <Pressable
          key={tool.key}
          className="items-center px-3 py-2 rounded-xl"
          style={{ backgroundColor: `${tool.color}10` }}
          onPress={() => handlePress(tool.key)}
        >
          <Ionicons name={tool.icon} size={22} color={tool.color} />
          <Text className="text-[10px] font-sans-medium mt-1" style={{ color: tool.color }}>
            {tool.label}
          </Text>
        </Pressable>
      ))}

      {hasSelection && onDelete && (
        <Pressable
          className="items-center px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20"
          onPress={onDelete}
        >
          <Ionicons name="trash" size={22} color="#EF4444" />
          <Text className="text-[10px] font-sans-medium text-red-500 mt-1">Delete</Text>
        </Pressable>
      )}
    </View>
  );
}
