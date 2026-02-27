import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyAppreciationLetters, useReceivedAppreciationLetters } from "@foreverr/core";
import { Text, AppreciationLetterCard } from "@foreverr/ui";

const TABS = ["Sent", "Received"] as const;

export default function AppreciationIndexScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Sent");

  const sent = useMyAppreciationLetters(user?.id);
  const received = useReceivedAppreciationLetters(user?.id);

  const currentData = activeTab === "Sent" ? (sent.data ?? []) : (received.data ?? []);
  const isLoading = activeTab === "Sent" ? sent.isLoading : received.isLoading;

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Tabs */}
      <View className="flex-row px-4 pt-2 pb-3 gap-2">
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            className={`flex-1 rounded-full py-2.5 items-center ${
              activeTab === tab ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-800"
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className={`text-xs font-sans-semibold ${
                activeTab === tab ? "text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#4A2D7A" />
        </View>
      ) : currentData.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-full bg-purple-50 dark:bg-purple-900/20 items-center justify-center mb-4">
            <Ionicons name="mail-outline" size={36} color="#8B5CF6" />
          </View>
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white text-center mb-2">
            {activeTab === "Sent" ? "No Letters Sent Yet" : "No Letters Received"}
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            {activeTab === "Sent"
              ? "Write a letter of appreciation to someone who's made a difference in your life."
              : "Letters sent to you will appear here."}
          </Text>
          {activeTab === "Sent" && (
            <Pressable
              className="rounded-full bg-brand-700 px-6 py-3"
              onPress={() => router.push("/appreciation/compose")}
            >
              <Text className="text-sm font-sans-semibold text-white">Write a Letter</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <AppreciationLetterCard
              subject={item.subject}
              recipientName={activeTab === "Sent" ? item.recipient_name : ((item.author as any)?.display_name ?? "Someone")}
              content={item.content}
              isDelivered={item.is_delivered}
              isRead={item.is_read}
              timestamp={item.created_at}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      {/* FAB */}
      <Pressable
        className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-brand-700 items-center justify-center shadow-lg"
        onPress={() => router.push("/appreciation/compose")}
      >
        <Ionicons name="create" size={24} color="white" />
      </Pressable>
    </View>
  );
}
