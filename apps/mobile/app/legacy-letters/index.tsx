import React, { useState } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Text, ScreenWrapper, LegacyLetterCard, ListSkeleton } from "@foreverr/ui";
import { useMyLegacyLetters, useReceivedLetters } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

type LetterTab = "sent" | "received";

export default function LegacyLettersScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<LetterTab>("sent");

  const sentLetters = useMyLegacyLetters(activeTab === "sent" ? user?.id : undefined);
  const receivedLetters = useReceivedLetters(activeTab === "received" ? user?.id : undefined);

  const data = activeTab === "sent" ? sentLetters.data : receivedLetters.data;
  const isLoading = activeTab === "sent" ? sentLetters.isLoading : receivedLetters.isLoading;

  if (isLoading) {
    return <ListSkeleton />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Legacy Letters" }} />

      {/* Tab Bar */}
      <View className="flex-row px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        {(["sent", "received"] as LetterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl mx-1 items-center ${
              activeTab === tab ? "bg-purple-700" : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab ? "text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {tab === "sent" ? "✉️ My Letters" : "💌 Received"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Letter List */}
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-3"
        renderItem={({ item }) => (
          <LegacyLetterCard
            subject={item.subject}
            recipientName={item.recipient_name}
            deliveryDate={item.delivery_date}
            deliveryType={item.delivery_type}
            isDelivered={item.is_delivered}
            isRead={item.is_read}
            authorName={(item as any).author?.display_name}
            mode={activeTab}
            onPress={() => router.push(`/legacy-letters/${item.id}?mode=${activeTab}`)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">
              {activeTab === "sent" ? "✉️" : "💌"}
            </Text>
            <Text className="text-gray-500 text-center mb-1">
              {activeTab === "sent"
                ? "No letters written yet"
                : "No letters received yet"}
            </Text>
            {activeTab === "sent" && (
              <Text className="text-xs text-gray-400 text-center px-8">
                Write a letter to be delivered to a loved one on a future date.
              </Text>
            )}
          </View>
        }
      />

      {/* FAB - Compose */}
      <TouchableOpacity
        onPress={() => router.push("/legacy-letters/compose")}
        className="absolute bottom-6 right-6 w-14 h-14 bg-purple-700 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white text-2xl">✏️</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
