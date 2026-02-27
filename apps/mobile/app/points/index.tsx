import React from "react";
import { View, ScrollView, FlatList } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  ScreenWrapper,
  LegacyPointsBadge,
  LevelProgressCard,
  PointLeaderboardCard,
} from "@foreverr/ui";
import {
  useAuthStore,
  useMyPointBalance,
  usePointHistory,
  useLegacyLevels,
  usePointLeaderboard,
} from "@foreverr/core";

// ============================================================
// Point values for "How to Earn" section
// ============================================================
const EARN_ACTIONS = [
  { action: "Daily login", points: 5, icon: "calendar" as const },
  { action: "Create a memorial", points: 50, icon: "heart" as const },
  { action: "Write a tribute", points: 20, icon: "create" as const },
  { action: "Send a gift", points: 10, icon: "gift" as const },
  { action: "Send flowers", points: 10, icon: "flower" as const },
  { action: "Invite accepted", points: 25, icon: "person-add" as const },
  { action: "Share content", points: 5, icon: "share-social" as const },
  { action: "Respond to prompt", points: 15, icon: "chatbubble" as const },
  { action: "Complete streak day", points: 10, icon: "flame" as const },
  { action: "Create living tribute", points: 30, icon: "leaf" as const },
  { action: "Write appreciation", points: 15, icon: "mail" as const },
  { action: "Add a photo", points: 5, icon: "image" as const },
  { action: "Add a video", points: 10, icon: "videocam" as const },
  { action: "Complete profile", points: 25, icon: "person-circle" as const },
  { action: "First memorial", points: 100, icon: "star" as const },
  { action: "First tribute", points: 50, icon: "star" as const },
  { action: "Referral signup", points: 50, icon: "people" as const },
];

// ============================================================
// Format relative date
// ============================================================
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function LegacyPointsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: balance } = useMyPointBalance(user?.id);
  const { data: historyPages, fetchNextPage, hasNextPage } = usePointHistory(user?.id);
  const { data: levels } = useLegacyLevels();
  const { data: leaderboard } = usePointLeaderboard();

  const historyItems = historyPages?.pages.flat() ?? [];
  const leaderboardTop10 = (leaderboard ?? []).slice(0, 10);

  // Determine next level info
  const currentLevel = balance?.level ?? 1;
  const currentLevelData = levels?.find((l) => l.id === currentLevel);
  const nextLevelData = levels?.find((l) => l.id === currentLevel + 1);

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Legacy Points",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Points Badge (large) */}
        <View className="mx-4 mt-4">
          <LegacyPointsBadge
            currentBalance={balance?.current_balance ?? 0}
            level={balance?.level ?? 1}
            levelName={balance?.level_name ?? "Seedling"}
            levelIcon={currentLevelData?.icon ?? "leaf"}
          />
        </View>

        {/* Level Progress */}
        <View className="mx-4 mt-4">
          <LevelProgressCard
            currentLevel={currentLevel}
            levelName={balance?.level_name ?? "Seedling"}
            totalEarned={balance?.total_earned ?? 0}
            nextLevelAt={nextLevelData?.min_points ?? balance?.next_level_at ?? 100}
            nextLevelName={nextLevelData?.level_name ?? "Sprout"}
            perks={currentLevelData?.perks ?? ["Basic access"]}
          />
        </View>

        {/* How to Earn Points */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            How to Earn Points
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {EARN_ACTIONS.map((item, index) => (
              <View
                key={item.action}
                className={`flex-row items-center px-4 py-3 ${
                  index < EARN_ACTIONS.length - 1
                    ? "border-b border-gray-50 dark:border-gray-700"
                    : ""
                }`}
              >
                <View className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 items-center justify-center mr-3">
                  <Ionicons name={item.icon} size={16} color="#7C3AED" />
                </View>
                <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300">
                  {item.action}
                </Text>
                <Text className="text-sm font-sans-bold text-brand-600 dark:text-brand-400">
                  +{item.points}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Recent Activity
          </Text>
          {historyItems.length === 0 ? (
            <View className="items-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Ionicons name="time-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 mt-2">
                No points earned yet
              </Text>
              <Text className="text-xs font-sans text-gray-400 dark:text-gray-500 mt-1">
                Start engaging to earn Legacy Points!
              </Text>
            </View>
          ) : (
            <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {historyItems.slice(0, 10).map((entry, index) => (
                <View
                  key={entry.id}
                  className={`flex-row items-center px-4 py-3 ${
                    index < Math.min(historyItems.length, 10) - 1
                      ? "border-b border-gray-50 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <View className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 items-center justify-center mr-3">
                    <Ionicons name="star" size={14} color="#22C55E" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-sans text-gray-700 dark:text-gray-300" numberOfLines={1}>
                      {entry.description ?? entry.action_type.replace(/_/g, " ")}
                    </Text>
                    <Text className="text-xs font-sans text-gray-400 mt-0.5">
                      {timeAgo(entry.created_at)}
                    </Text>
                  </View>
                  <Text className="text-sm font-sans-bold text-green-600 dark:text-green-400">
                    +{entry.points}
                  </Text>
                </View>
              ))}

              {hasNextPage && (
                <View className="items-center py-3 border-t border-gray-50 dark:border-gray-700">
                  <Text
                    className="text-xs font-sans-semibold text-brand-600 dark:text-brand-400"
                    onPress={() => fetchNextPage()}
                  >
                    Load more
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Leaderboard */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="podium" size={20} color="#7C3AED" />
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white ml-2">
              Leaderboard
            </Text>
          </View>
          {leaderboardTop10.length === 0 ? (
            <View className="items-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Ionicons name="podium-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 mt-2">
                No leaderboard data yet
              </Text>
            </View>
          ) : (
            leaderboardTop10.map((entry, index) => (
              <PointLeaderboardCard
                key={entry.id}
                rank={index + 1}
                userName={entry.profiles?.display_name ?? "Anonymous"}
                userAvatar={entry.profiles?.avatar_url ?? null}
                totalPoints={entry.total_earned}
                levelName={entry.level_name}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
