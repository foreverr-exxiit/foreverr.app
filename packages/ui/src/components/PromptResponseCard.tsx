import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface PromptResponseCardProps {
  authorName: string;
  content: string;
  promptText?: string;
  taggedMemorialName?: string;
  reactionCount: number;
  timestamp: string;
  onReact?: () => void;
  onShare?: () => void;
}

export function PromptResponseCard({
  authorName,
  content,
  promptText,
  taggedMemorialName,
  reactionCount,
  timestamp,
  onReact,
  onShare,
}: PromptResponseCardProps) {
  const date = new Date(timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <View className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
      {/* Prompt context */}
      {promptText && (
        <View className="flex-row items-center mb-2 pb-2 border-b border-gray-50 dark:border-gray-700">
          <Ionicons name="sparkles" size={12} color="#F59E0B" />
          <Text className="ml-1.5 text-[10px] font-sans text-gray-400" numberOfLines={1}>
            {promptText}
          </Text>
        </View>
      )}

      {/* Author */}
      <View className="flex-row items-center mb-2">
        <View className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
          <Text className="text-[10px] font-sans-bold text-brand-700">
            {authorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="ml-2 text-xs font-sans-semibold text-gray-900 dark:text-white">
          {authorName}
        </Text>
        <Text className="ml-2 text-[10px] font-sans text-gray-400">{timeAgo}</Text>
      </View>

      {/* Content */}
      <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-5">
        {content}
      </Text>

      {/* Tagged memorial */}
      {taggedMemorialName && (
        <View className="flex-row items-center mt-2 rounded-full bg-brand-50 dark:bg-brand-900/20 px-3 py-1 self-start">
          <Ionicons name="flower" size={12} color="#4A2D7A" />
          <Text className="ml-1 text-[10px] font-sans-semibold text-brand-700">{taggedMemorialName}</Text>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center mt-3 pt-2 border-t border-gray-50 dark:border-gray-700 gap-4">
        <Pressable className="flex-row items-center" onPress={onReact}>
          <Ionicons name="heart-outline" size={16} color="#9ca3af" />
          <Text className="ml-1 text-xs font-sans text-gray-400">{reactionCount}</Text>
        </Pressable>
        {onShare && (
          <Pressable className="flex-row items-center" onPress={onShare}>
            <Ionicons name="share-outline" size={16} color="#9ca3af" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
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
