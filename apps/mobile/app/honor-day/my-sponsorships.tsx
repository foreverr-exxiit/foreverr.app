import { View, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyHonorDays, HONOR_DAY_BADGES } from "@foreverr/core";
import { Text, ListSkeleton } from "@foreverr/ui";

export default function MySponsorshipsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: sponsorships, isLoading } = useMyHonorDays(user?.id);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          My Sponsored Days
        </Text>
        <Text className="text-xs font-sans text-gray-500 mt-1">
          Days you've sponsored in honor of loved ones
        </Text>
      </View>

      {/* Stats */}
      {(sponsorships ?? []).length > 0 && (
        <View className="flex-row gap-3 px-4 mt-3">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 items-center">
            <Text className="text-xl font-sans-bold text-brand-700">
              {(sponsorships ?? []).length}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Days Sponsored</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 items-center">
            <Text className="text-xl font-sans-bold text-amber-600">
              ${(
                (sponsorships ?? []).reduce((sum: number, s: any) => sum + (s.amount_cents ?? 0), 0) / 100
              ).toFixed(0)}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Total Contributed</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <View className="p-4">
          <ListSkeleton rows={4} />
        </View>
      ) : (
        <FlatList
          data={sponsorships ?? []}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          renderItem={({ item }: { item: any }) => {
            const badge = HONOR_DAY_BADGES[item.display_badge] ?? HONOR_DAY_BADGES.candle;
            const memorial = item.memorial;
            const memorialName = memorial
              ? `${memorial.first_name ?? ""} ${memorial.last_name ?? ""}`.trim()
              : "Unknown";
            const isPast = new Date(item.sponsored_date) < new Date();
            const dateStr = new Date(item.sponsored_date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Pressable
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
                onPress={() => memorial?.id && router.push(`/lifecycle/${memorial.id}` as any)}
              >
                <View className="flex-row items-start gap-3">
                  {/* Badge */}
                  <View className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 items-center justify-center">
                    <Text className="text-2xl">{badge.emoji}</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                      {dateStr}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <Ionicons name="heart" size={12} color="#ec4899" />
                      <Text className="text-[11px] font-sans text-gray-500">
                        In honor of {memorialName}
                      </Text>
                    </View>

                    {item.message && (
                      <Text className="text-xs font-sans text-gray-400 mt-1.5 italic" numberOfLines={2}>
                        "{item.message}"
                      </Text>
                    )}

                    <View className="flex-row items-center gap-2 mt-2">
                      <View className={`rounded-full px-2 py-0.5 ${isPast ? "bg-gray-100 dark:bg-gray-700" : "bg-green-100 dark:bg-green-900/30"}`}>
                        <Text className={`text-[10px] font-sans-semibold ${isPast ? "text-gray-500" : "text-green-700"}`}>
                          {isPast ? "Completed" : "Upcoming"}
                        </Text>
                      </View>
                      <Text className="text-[10px] font-sans-semibold text-brand-700">
                        ${(item.amount_cents / 100).toFixed(2)}
                      </Text>
                      <Text className="text-[10px] font-sans text-gray-400">
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="sunny-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No sponsored days yet</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1 text-center px-8">
                Sponsor a day on a memorial to honor a loved one
              </Text>
              <Pressable
                className="mt-4 bg-brand-700 rounded-xl px-4 py-2"
                onPress={() => router.push("/honor-day" as any)}
              >
                <Text className="text-xs font-sans-bold text-white">Honor a Day</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}
