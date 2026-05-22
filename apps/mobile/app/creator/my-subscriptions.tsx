import { View, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMySubscriptions, SUBSCRIPTION_TIERS } from "@foreverr/core";
import { Text, ListSkeleton } from "@foreverr/ui";

export default function MySubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: subscriptions, isLoading } = useMySubscriptions(user?.id);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          My Subscriptions
        </Text>
        <Text className="text-xs font-sans text-gray-500 mt-1">
          Channels and creators you're subscribed to
        </Text>
      </View>

      {isLoading ? (
        <View className="p-4">
          <ListSkeleton rows={4} />
        </View>
      ) : (
        <FlatList
          data={subscriptions ?? []}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          renderItem={({ item }: { item: any }) => {
            const tierInfo = SUBSCRIPTION_TIERS[item.tier as keyof typeof SUBSCRIPTION_TIERS];
            const renewDate = item.current_period_end
              ? new Date(item.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : null;

            return (
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center gap-3">
                  {/* Tier Icon */}
                  <View className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
                    <Ionicons name={(tierInfo?.icon ?? "star-outline") as any} size={24} color="#4A2D7A" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                      {tierInfo?.label ?? item.tier} Plan
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <View className="bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-0.5">
                        <Text className="text-[10px] font-sans-semibold text-green-700">Active</Text>
                      </View>
                      <Text className="text-[11px] font-sans text-gray-400">
                        ${((tierInfo?.price ?? 0) / 100).toFixed(2)}/mo
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Description */}
                {tierInfo?.description && (
                  <View className="mt-3 flex-row items-start gap-1.5 ml-15">
                    <Ionicons name="checkmark" size={12} color="#059669" />
                    <Text className="text-[11px] font-sans text-gray-500">{tierInfo.description}</Text>
                  </View>
                )}

                {/* Renewal Info */}
                {renewDate && (
                  <View className="flex-row items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Ionicons name="refresh-outline" size={12} color="#9ca3af" />
                    <Text className="text-[10px] font-sans text-gray-400">
                      Renews on {renewDate}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="star-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No subscriptions yet</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1 text-center px-8">
                Subscribe to creators to get exclusive content and updates
              </Text>
              <Pressable
                className="mt-4 bg-brand-700 rounded-xl px-4 py-2"
                onPress={() => router.push("/(tabs)/explore" as any)}
              >
                <Text className="text-xs font-sans-bold text-white">Discover Creators</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}
