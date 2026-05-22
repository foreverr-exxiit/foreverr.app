import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";
import { useFeaturedCreators, TIER_INFO } from "@foreverr/core";

export default function CreatorLeaderboardScreen() {
  const router = useRouter();
  const { data: creators, isLoading } = useFeaturedCreators();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Top Creators</Text>
        <Text className="text-xs font-sans text-gray-500 mt-1">
          Discover the best creators on ǝterrn
        </Text>
      </View>

      <FlatList
        data={creators ?? []}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        renderItem={({ item, index }: { item: any; index: number }) => {
          const tierInfo = TIER_INFO[(item.tier as keyof typeof TIER_INFO) ?? "rising"];
          const isTop3 = index < 3;
          const rankIcons = ["🥇", "🥈", "🥉"];

          return (
            <Pressable
              className={`bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 ${isTop3 ? "border-2" : ""}`}
              style={isTop3 ? { borderColor: tierInfo.color + "40" } : undefined}
              onPress={() => router.push(`/user/${item.user_id}` as any)}
            >
              <View className="flex-row items-center">
                {/* Rank */}
                <View className="w-8 items-center mr-3">
                  {isTop3 ? (
                    <Text className="text-xl">{rankIcons[index]}</Text>
                  ) : (
                    <Text className="text-sm font-sans-bold text-gray-400">#{index + 1}</Text>
                  )}
                </View>

                {/* Avatar */}
                <View className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center border-2 mr-3" style={{ borderColor: tierInfo.color }}>
                  <Ionicons name="person" size={22} color="#4A2D7A" />
                </View>

                {/* Info */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white" numberOfLines={1}>
                      {item.profiles?.display_name ?? item.display_name}
                    </Text>
                    {item.is_verified && (
                      <Ionicons name="checkmark-circle" size={14} color="#4A2D7A" />
                    )}
                  </View>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Text className="text-xs">{tierInfo.icon}</Text>
                    <Text className="text-[11px] font-sans" style={{ color: tierInfo.color }}>{tierInfo.name}</Text>
                  </View>
                  {item.tagline && (
                    <Text className="text-[10px] font-sans text-gray-400 mt-0.5" numberOfLines={1}>{item.tagline}</Text>
                  )}
                </View>

                {/* Stats */}
                <View className="items-end">
                  {item.rating_avg > 0 && (
                    <View className="flex-row items-center gap-0.5">
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text className="text-xs font-sans-bold text-gray-900 dark:text-white">
                        {item.rating_avg.toFixed(1)}
                      </Text>
                    </View>
                  )}
                  <Text className="text-[10px] font-sans text-gray-400 mt-0.5">
                    {item.lifetime_orders} orders
                  </Text>
                </View>
              </View>

              {/* Specialties */}
              {item.specialties && item.specialties.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mt-3 ml-11">
                  {item.specialties.slice(0, 3).map((spec: string) => (
                    <View key={spec} className="bg-brand-50 dark:bg-brand-900/20 rounded-full px-2 py-0.5">
                      <Text className="text-[9px] font-sans text-brand-700 capitalize">{spec.replace(/_/g, " ")}</Text>
                    </View>
                  ))}
                  {item.specialties.length > 3 && (
                    <Text className="text-[9px] font-sans text-gray-400">+{item.specialties.length - 3} more</Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="people-outline" size={40} color="#d1d5db" />
            <Text className="text-sm font-sans text-gray-400 mt-3">No creators yet</Text>
            <Text className="text-xs font-sans text-gray-400 mt-1">Be the first to join the Creator Program!</Text>
            <Pressable
              className="mt-4 bg-brand-700 rounded-xl px-6 py-3"
              onPress={() => router.push("/creator" as any)}
            >
              <Text className="text-sm font-sans-semibold text-white">Become a Creator</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}
