import React from "react";
import { View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Text, ScreenWrapper, ActivityFeedItem } from "@foreverr/ui";
import {
  useActivityFeed,
  useAuthStore,
  useSocialStore,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

const FEED_FILTERS = [
  { key: "all", label: "All", icon: "albums" },
  { key: "tributes", label: "Tributes", icon: "heart" },
  { key: "candles", label: "Candles", icon: "flame" },
  { key: "follows", label: "Follows", icon: "person-add" },
  { key: "badges", label: "Badges", icon: "ribbon" },
  { key: "events", label: "Events", icon: "calendar" },
  { key: "donations", label: "Donations", icon: "gift" },
] as const;

const FILTER_ACTIVITY_MAP: Record<string, string[]> = {
  all: [],
  tributes: ["tribute_posted", "comment_posted"],
  candles: ["candle_lit", "reaction_given"],
  follows: ["memorial_followed", "user_followed"],
  badges: ["badge_earned", "streak_achieved"],
  events: ["event_created"],
  donations: ["donation_made"],
};

export default function ActivityFeedScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const feedFilter = useSocialStore((s) => s.feedFilter);
  const setFeedFilter = useSocialStore((s) => s.setFeedFilter);
  const feed = useActivityFeed(user?.id);

  const allActivities = feed.data?.pages?.flatMap((p) => p.data) ?? [];

  // Apply filter
  const filteredTypes = FILTER_ACTIVITY_MAP[feedFilter] ?? [];
  const activities =
    feedFilter === "all"
      ? allActivities
      : allActivities.filter((a) => filteredTypes.includes(a.activity_type));

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Activity",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      {/* Filter Chips */}
      <View className="pt-3 pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FEED_FILTERS.map((f) => {
            const isActive = feedFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFeedFilter(f.key as any)}
                className={`flex-row items-center px-3.5 py-2 rounded-full border ${
                  isActive
                    ? "bg-brand-700 border-brand-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <Ionicons
                  name={f.icon as any}
                  size={14}
                  color={isActive ? "#fff" : "#6B7280"}
                />
                <Text
                  className={`text-xs font-sans-medium ml-1.5 ${
                    isActive ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Activity List */}
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-2"
        onEndReached={() => feed.hasNextPage && feed.fetchNextPage()}
        renderItem={({ item }) => (
          <ActivityFeedItem
            activityType={item.activity_type}
            userName={item.user?.display_name ?? "Someone"}
            userAvatarUrl={item.user?.avatar_url}
            createdAt={item.created_at}
            metadata={item.metadata as Record<string, unknown>}
            onUserPress={() => {
              if (item.user?.id) router.push(`/user/${item.user.id}`);
            }}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="pulse-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 font-sans mt-3 mb-1">No activity yet</Text>
            <Text className="text-xs text-gray-400 font-sans text-center px-8">
              {feedFilter === "all"
                ? "Follow other users to see their activity here."
                : "No activity found for this filter."}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
