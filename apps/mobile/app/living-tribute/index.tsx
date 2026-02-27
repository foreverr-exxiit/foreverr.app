import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useLivingTributes, useMyLivingTributes, useHonoredTributes } from "@foreverr/core";
import { Text, LivingTributeCard } from "@foreverr/ui";

const TABS = ["Discover", "My Tributes", "Honoring Me"] as const;

export default function LivingTributeIndexScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Discover");

  const discover = useLivingTributes();
  const myTributes = useMyLivingTributes(user?.id);
  const honored = useHonoredTributes(user?.id);

  const discoverData = discover.data?.pages.flatMap((p) => p.data) ?? [];
  const myData = myTributes.data ?? [];
  const honoredData = honored.data ?? [];

  const currentData =
    activeTab === "Discover" ? discoverData :
    activeTab === "My Tributes" ? myData :
    honoredData;

  const isLoading =
    activeTab === "Discover" ? discover.isLoading :
    activeTab === "My Tributes" ? myTributes.isLoading :
    honored.isLoading;

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Tabs */}
      <View className="flex-row px-4 pt-2 pb-3 gap-2">
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            className={`rounded-full px-4 py-2 ${
              activeTab === tab
                ? "bg-brand-700"
                : "bg-gray-100 dark:bg-gray-800"
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
          <View className="h-20 w-20 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-4">
            <Ionicons name="gift-outline" size={36} color="#7C3AED" />
          </View>
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white text-center mb-2">
            {activeTab === "My Tributes"
              ? "Create Your First Living Tribute"
              : activeTab === "Honoring Me"
              ? "No Tributes Yet"
              : "No Living Tributes Yet"}
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            {activeTab === "My Tributes"
              ? "Honor someone special while they're still here. Create a tribute page for a birthday, retirement, or just because."
              : activeTab === "Honoring Me"
              ? "When someone creates a tribute in your honor, it will appear here."
              : "Be the first to honor someone special with a living tribute."}
          </Text>
          {activeTab !== "Honoring Me" && (
            <Pressable
              className="rounded-full bg-brand-700 px-6 py-3"
              onPress={() => router.push("/living-tribute/create")}
            >
              <Text className="text-sm font-sans-semibold text-white">Create a Living Tribute</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <LivingTributeCard
              title={item.title}
              honoreeName={item.honoree_name}
              honoreePhotoUrl={item.honoree_photo_url}
              occasion={item.occasion}
              contributorCount={item.contributor_count ?? 0}
              messageCount={item.message_count ?? 0}
              onPress={() => router.push(`/living-tribute/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
          onEndReached={() => {
            if (activeTab === "Discover" && discover.hasNextPage) {
              discover.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* FAB */}
      <Pressable
        className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-brand-700 items-center justify-center shadow-lg"
        onPress={() => router.push("/living-tribute/create")}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}
