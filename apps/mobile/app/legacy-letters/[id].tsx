import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Text, ScreenWrapper } from "@foreverr/ui";
import { useMyLegacyLetters, useReceivedLetters, useMarkLetterRead } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

export default function LetterDetailScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const user = useAuthStore((s) => s.user);
  const markRead = useMarkLetterRead();

  const isReceived = mode === "received";
  const sentLetters = useMyLegacyLetters(!isReceived ? user?.id : undefined);
  const receivedLetters = useReceivedLetters(isReceived ? user?.id : undefined);

  const letters = isReceived ? receivedLetters.data : sentLetters.data;
  const letter = letters?.find((l) => l.id === id);

  // Auto-mark as read when viewing a received letter
  useEffect(() => {
    if (isReceived && letter && !letter.is_read) {
      markRead.mutate(letter.id);
    }
  }, [letter?.id, letter?.is_read, isReceived]);

  if (!letter) {
    return (
      <ScreenWrapper>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Loading letter...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const deliveryDateObj = new Date(letter.delivery_date);
  const daysUntilDelivery = Math.ceil(
    (deliveryDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: letter.subject }} />
      <ScrollView className="flex-1 px-4 py-6">
        {/* Letter Header */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-3xl bg-purple-50 items-center justify-center mb-3">
            <Text className="text-4xl">{letter.is_delivered ? "💌" : "✉️"}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
            {letter.subject}
          </Text>
          <View className="flex-row items-center mt-2">
            {letter.is_delivered ? (
              <View className="bg-green-100 rounded-full px-3 py-1">
                <Text className="text-xs text-green-700 font-medium">
                  {letter.is_read ? "✓ Read" : "Delivered"}
                </Text>
              </View>
            ) : (
              <View className="bg-amber-100 rounded-full px-3 py-1">
                <Text className="text-xs text-amber-700 font-medium">
                  {daysUntilDelivery > 0
                    ? `⏳ ${daysUntilDelivery} days until delivery`
                    : "Pending delivery"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Letter Details */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-100 dark:border-gray-700">
          <View className="flex-row justify-between py-2 border-b border-gray-50">
            <Text className="text-sm text-gray-500">
              {isReceived ? "From" : "To"}
            </Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {isReceived
                ? (letter as any).author?.display_name ?? "Unknown"
                : letter.recipient_name}
            </Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-gray-50">
            <Text className="text-sm text-gray-500">Delivery Method</Text>
            <Text className="text-sm text-gray-900 dark:text-white capitalize">
              {letter.delivery_type.replace("_", " ")}
            </Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-gray-50">
            <Text className="text-sm text-gray-500">Delivery Date</Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {deliveryDateObj.toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-gray-500">Created</Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {new Date(letter.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Letter Content */}
        {letter.is_delivered || !isReceived ? (
          <View className="bg-amber-50 rounded-2xl p-5 mb-4 border border-amber-100">
            <View className="flex-row items-center mb-3">
              <Text className="text-sm font-medium text-amber-800">
                {isReceived ? "💌 Message for you" : "✉️ Your message"}
              </Text>
            </View>
            <Text className="text-base text-gray-900 dark:text-white leading-7" style={{ fontFamily: "serif" }}>
              {letter.content}
            </Text>
          </View>
        ) : (
          <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-200 dark:border-gray-600 items-center">
            <Text className="text-4xl mb-3">🔐</Text>
            <Text className="text-sm text-gray-500 text-center">
              This letter will be revealed when it's delivered on{" "}
              {deliveryDateObj.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
