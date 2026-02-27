import React from "react";
import { View, FlatList } from "react-native";
import { Stack } from "expo-router";
import { Text, ScreenWrapper, StreakCard } from "@foreverr/ui";
import { useMyMemoryStreaks } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

export default function StreaksScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: streaks } = useMyMemoryStreaks(user?.id);

  // Aggregate stats
  const totalStreakDays = streaks?.reduce((sum, s) => sum + s.current_streak, 0) ?? 0;
  const bestStreak = streaks?.reduce((max, s) => Math.max(max, s.longest_streak), 0) ?? 0;
  const totalVisits = streaks?.reduce((sum, s) => sum + s.total_visits, 0) ?? 0;
  const totalCandles = streaks?.reduce((sum, s) => sum + s.total_candles_lit, 0) ?? 0;

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Memory Streaks" }} />

      {/* Summary Header */}
      <View className="mx-4 mt-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl overflow-hidden mb-4">
        <View className="bg-orange-500 p-5">
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-3">🔥</Text>
            <View>
              <Text className="text-white text-lg font-bold">Your Devotion</Text>
              <Text className="text-orange-100 text-xs">
                Keep visiting to maintain your streaks
              </Text>
            </View>
          </View>
          <View className="flex-row">
            <View className="flex-1 items-center bg-white/15 rounded-xl py-3 mr-2">
              <Text className="text-white text-xl font-bold">{totalStreakDays}</Text>
              <Text className="text-orange-100 text-xs">Active Days</Text>
            </View>
            <View className="flex-1 items-center bg-white/15 rounded-xl py-3 mr-2">
              <Text className="text-white text-xl font-bold">{bestStreak}</Text>
              <Text className="text-orange-100 text-xs">Best Streak</Text>
            </View>
            <View className="flex-1 items-center bg-white/15 rounded-xl py-3 mr-2">
              <Text className="text-white text-xl font-bold">{totalVisits}</Text>
              <Text className="text-orange-100 text-xs">Visits</Text>
            </View>
            <View className="flex-1 items-center bg-white/15 rounded-xl py-3">
              <Text className="text-white text-xl font-bold">{totalCandles}</Text>
              <Text className="text-orange-100 text-xs">🕯️ Lit</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Streaks List */}
      <FlatList
        data={streaks ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4"
        renderItem={({ item }) => {
          const memorial = (item as any).memorial;
          return (
            <StreakCard
              memorialName={
                memorial
                  ? `${memorial.first_name} ${memorial.last_name}`
                  : "Memorial"
              }
              memorialPhotoUrl={memorial?.profile_photo_url}
              currentStreak={item.current_streak}
              longestStreak={item.longest_streak}
              totalVisits={item.total_visits}
              totalCandlesLit={item.total_candles_lit}
              totalMemoriesShared={item.total_memories_shared}
              lastActivityDate={item.last_activity_date ?? ""}
            />
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">🕯️</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No Streaks Yet
            </Text>
            <Text className="text-sm text-gray-500 text-center px-8">
              Visit memorials, light candles, and share memories to build your
              devotion streaks. Come back every day to keep them going!
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
