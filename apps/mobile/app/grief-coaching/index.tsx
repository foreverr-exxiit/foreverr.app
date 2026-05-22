import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useServiceListings, TIER_INFO } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const COACHING_TYPES = [
  { key: "all", label: "All", icon: "grid-outline" },
  { key: "individual", label: "1-on-1", icon: "person-outline" },
  { key: "group", label: "Group", icon: "people-outline" },
  { key: "family", label: "Family", icon: "home-outline" },
  { key: "children", label: "Children", icon: "heart-outline" },
];

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function GriefCoachingScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("all");

  // Fetch grief_support services
  const { data, isLoading, fetchNextPage, hasNextPage } = useServiceListings({
    category: "grief_support",
    search: selectedType !== "all" ? selectedType : undefined,
  });

  const listings = data?.pages?.flatMap((p: any) => p) ?? [];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          Grief & Bereavement Support
        </Text>
        <Text className="text-xs font-sans text-gray-500 mt-1">
          Connect with compassionate coaches who understand loss
        </Text>
      </View>

      {/* Helpline Banner */}
      <View className="mx-4 mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 flex-row items-center gap-3">
        <View className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
          <Ionicons name="call-outline" size={20} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-sans-semibold text-blue-800 dark:text-blue-300">
            Need immediate support?
          </Text>
          <Text className="text-[11px] font-sans text-blue-600 dark:text-blue-400">
            988 Suicide & Crisis Lifeline — Call or text 988
          </Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View className="px-4 mt-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={COACHING_TYPES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full ${
                selectedType === item.key
                  ? "bg-brand-700"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}
              onPress={() => setSelectedType(item.key)}
            >
              <Ionicons
                name={item.icon as any}
                size={14}
                color={selectedType === item.key ? "#fff" : "#6b7280"}
              />
              <Text
                className={`text-xs font-sans-semibold ${
                  selectedType === item.key ? "text-white" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Coaches List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A2D7A" />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          renderItem={({ item }: { item: any }) => {
            const tierInfo = TIER_INFO[(item.creator?.tier as keyof typeof TIER_INFO) ?? "rising"];
            return (
              <Pressable
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
                onPress={() => router.push(`/grief-coaching/${item.id}` as any)}
              >
                <View className="flex-row items-start gap-3">
                  {/* Coach Avatar */}
                  <View className="h-14 w-14 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
                    <Ionicons name="heart" size={24} color="#4A2D7A" />
                  </View>

                  <View className="flex-1">
                    {/* Name + Verified */}
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-sm font-sans-bold text-gray-900 dark:text-white" numberOfLines={1}>
                        {item.creator?.display_name ?? "Grief Coach"}
                      </Text>
                      {item.creator?.is_verified && (
                        <Ionicons name="checkmark-circle" size={14} color="#4A2D7A" />
                      )}
                    </View>

                    {/* Title */}
                    <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 mt-0.5" numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Meta Row */}
                    <View className="flex-row items-center gap-3 mt-2">
                      {/* Rating */}
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={11} color="#f59e0b" />
                        <Text className="text-[11px] font-sans-semibold text-gray-700 dark:text-gray-300">
                          {item.creator?.rating_avg?.toFixed(1) ?? "New"}
                        </Text>
                      </View>
                      {/* Orders */}
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="chatbubble-outline" size={11} color="#9ca3af" />
                        <Text className="text-[11px] font-sans text-gray-500">
                          {item.order_count ?? 0} sessions
                        </Text>
                      </View>
                      {/* Tier */}
                      <View className="flex-row items-center gap-1">
                        <Text className="text-[10px]">{tierInfo.icon}</Text>
                        <Text className="text-[10px] font-sans-semibold" style={{ color: tierInfo.color }}>
                          {tierInfo.name.split(" ")[0]}
                        </Text>
                      </View>
                    </View>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <View className="flex-row flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map((tag: string) => (
                          <View key={tag} className="bg-blue-50 dark:bg-blue-900/20 rounded-full px-2 py-0.5">
                            <Text className="text-[10px] font-sans text-blue-700">{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Price */}
                  <View className="items-end">
                    <Text className="text-base font-sans-bold text-brand-700">
                      {formatCents(item.price_cents)}
                    </Text>
                    <Text className="text-[10px] font-sans text-gray-400">per session</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="heart-outline" size={48} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No grief coaches available yet</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1 text-center px-8">
                Compassionate coaches will be joining soon. Check back later.
              </Text>
              <Pressable
                className="mt-4 bg-brand-700 rounded-xl px-5 py-2.5"
                onPress={() => router.push("/services" as any)}
              >
                <Text className="text-xs font-sans-bold text-white">Browse All Services</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}
