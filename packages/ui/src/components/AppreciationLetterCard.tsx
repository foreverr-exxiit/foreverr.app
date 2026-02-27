import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface AppreciationLetterCardProps {
  subject: string;
  recipientName: string;
  content: string;
  isDelivered: boolean;
  isRead: boolean;
  timestamp: string;
  onPress?: () => void;
}

export function AppreciationLetterCard({
  subject,
  recipientName,
  content,
  isDelivered,
  isRead,
  timestamp,
  onPress,
}: AppreciationLetterCardProps) {
  const date = new Date(timestamp);
  const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Pressable
      className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
      onPress={onPress}
    >
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-start mb-2">
          <View className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/20 items-center justify-center mr-3">
            <Ionicons name="mail" size={20} color="#8B5CF6" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white" numberOfLines={1}>
              {subject}
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              To <Text className="font-sans-semibold text-brand-700">{recipientName}</Text>
            </Text>
          </View>
          {/* Status indicator */}
          <View className="flex-row items-center">
            {isDelivered ? (
              isRead ? (
                <View className="flex-row items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1">
                  <Ionicons name="checkmark-done" size={12} color="#059669" />
                  <Text className="ml-1 text-[10px] font-sans-semibold text-green-700">Read</Text>
                </View>
              ) : (
                <View className="flex-row items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-1">
                  <Ionicons name="checkmark" size={12} color="#2563EB" />
                  <Text className="ml-1 text-[10px] font-sans-semibold text-blue-700">Delivered</Text>
                </View>
              )
            ) : (
              <View className="flex-row items-center rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-1">
                <Ionicons name="time-outline" size={12} color="#D97706" />
                <Text className="ml-1 text-[10px] font-sans-semibold text-amber-700">Pending</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content preview */}
        <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 leading-4" numberOfLines={2}>
          {content}
        </Text>

        {/* Timestamp */}
        <Text className="text-[10px] font-sans text-gray-400 mt-2">{dateLabel}</Text>
      </View>
    </Pressable>
  );
}
