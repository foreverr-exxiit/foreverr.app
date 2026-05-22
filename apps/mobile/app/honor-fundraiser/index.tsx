import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useHonorFundraisers } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatCents(cents: number): string {
  if (cents >= 100000) return `$${(cents / 100000).toFixed(0)}k`;
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function HonorFundraiserListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHonorFundraisers({ status: "active" });

  const fundraisers = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Honor Fundraisers</Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">Raise money in someone's honor</Text>
        </View>
        <Pressable
          className="bg-brand-700 rounded-xl px-4 py-2.5 flex-row items-center gap-1.5"
          onPress={() => router.push("/honor-fundraiser/create" as any)}
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text className="text-xs font-sans-semibold text-white">Create</Text>
        </Pressable>
      </View>

      <FlatList
        data={fundraisers}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        renderItem={({ item }: { item: any }) => {
          const progress = item.goal_cents > 0 ? Math.min((item.raised_cents / item.goal_cents) * 100, 100) : 0;
          return (
            <Pressable
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mb-4"
              onPress={() => router.push(`/honor-fundraiser/${item.id}` as any)}
            >
              {/* Cover */}
              <View className="h-32 bg-gradient-to-r from-brand-700 to-brand-900 items-center justify-center px-4">
                <Text className="text-3xl mb-1">🎗️</Text>
                <Text className="text-sm font-sans-bold text-white text-center" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text className="text-xs font-sans text-brand-200 mt-0.5">
                  Honoring {item.honoree_name}
                </Text>
              </View>

              <View className="p-4">
                {/* Progress bar */}
                <View className="flex-row items-end justify-between mb-1.5">
                  <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                    {formatCents(item.raised_cents)}
                  </Text>
                  <Text className="text-xs font-sans text-gray-400">
                    of {formatCents(item.goal_cents)}
                  </Text>
                </View>
                <View className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View className="h-full rounded-full bg-green-500" style={{ width: `${progress}%` }} />
                </View>

                {/* Stats row */}
                <View className="flex-row items-center justify-between mt-3">
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="people-outline" size={12} color="#9ca3af" />
                      <Text className="text-xs font-sans text-gray-500">{item.donor_count} donors</Text>
                    </View>
                    <Text className="text-xs font-sans text-gray-400">{progress.toFixed(0)}% funded</Text>
                  </View>
                  <Text className="text-[10px] font-sans text-gray-400">{timeAgo(item.created_at)}</Text>
                </View>

                {/* Organizer */}
                <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                  <View className="h-6 w-6 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                    <Ionicons name="person" size={10} color="#4A2D7A" />
                  </View>
                  <Text className="text-[11px] font-sans text-gray-500 flex-1">
                    by {item.organizer?.display_name ?? "Organizer"}
                  </Text>
                  <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
                    <Text className="text-[10px] font-sans text-gray-500 capitalize">
                      {item.beneficiary_type.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color="#4A2D7A" style={{ padding: 16 }} /> : null}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20"><ActivityIndicator size="large" color="#4A2D7A" /></View>
          ) : (
            <View className="items-center py-20 px-8">
              <Text className="text-4xl mb-3">🎗️</Text>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-2">No Fundraisers Yet</Text>
              <Text className="text-sm font-sans text-gray-500 text-center mb-4">
                Be the first to create an honor fundraiser and raise money for someone you love.
              </Text>
              <Pressable
                className="bg-brand-700 rounded-xl px-6 py-3"
                onPress={() => router.push("/honor-fundraiser/create" as any)}
              >
                <Text className="text-sm font-sans-semibold text-white">Start a Fundraiser</Text>
              </Pressable>
            </View>
          )
        }
      />
    </View>
  );
}
