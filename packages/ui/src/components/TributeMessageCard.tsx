import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface TributeMessageCardProps {
  content: string | null;
  mediaUrl?: string | null;
  authorName: string;
  authorAvatarUrl?: string | null;
  isAnonymous: boolean;
  reactionCount: number;
  timestamp: string;
  onReact?: () => void;
}

export function TributeMessageCard({
  content,
  authorName,
  isAnonymous,
  reactionCount,
  timestamp,
  onReact,
}: TributeMessageCardProps) {
  const displayName = isAnonymous ? "Anonymous" : authorName;
  const timeAgo = getTimeAgo(timestamp);

  return (
    <View className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
      {/* Author */}
      <View className="flex-row items-center mb-2">
        <View className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
          {isAnonymous ? (
            <Ionicons name="person-outline" size={16} color="#7C3AED" />
          ) : (
            <Text className="text-xs font-sans-bold text-brand-700">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View className="ml-2 flex-1">
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">
            {displayName}
          </Text>
          <Text className="text-[10px] font-sans text-gray-400">{timeAgo}</Text>
        </View>
      </View>

      {/* Content */}
      {content && (
        <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-5">
          {content}
        </Text>
      )}

      {/* Actions */}
      <View className="flex-row items-center mt-3 pt-2 border-t border-gray-50 dark:border-gray-700">
        <Pressable className="flex-row items-center" onPress={onReact}>
          <Ionicons name="heart-outline" size={16} color="#9ca3af" />
          <Text className="ml-1 text-xs font-sans text-gray-400">{reactionCount}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
