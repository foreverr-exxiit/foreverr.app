import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface ScrapbookPageCardProps {
  title: string;
  pageNumber?: number;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  isPublished: boolean;
  createdAt: string;
  onPress?: () => void;
}

export function ScrapbookPageCard({
  title,
  pageNumber,
  backgroundColor,
  isPublished,
  createdAt,
  onPress,
}: ScrapbookPageCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-gray-800 rounded-2xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Page Preview */}
      <View
        className="h-32 items-center justify-center"
        style={{ backgroundColor: backgroundColor || "#F3E8FF" }}
      >
        <Text className="text-4xl">📔</Text>
        {pageNumber !== undefined && (
          <View className="absolute top-2 right-2 bg-white/80 rounded-full px-2 py-0.5">
            <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Page {pageNumber}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-3">
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
          {title}
        </Text>
        <View className="flex-row items-center">
          <View
            className={`rounded-full px-2 py-0.5 mr-2 ${
              isPublished ? "bg-green-100" : "bg-amber-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isPublished ? "text-green-700" : "text-amber-700"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </Text>
          </View>
          <Text className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
