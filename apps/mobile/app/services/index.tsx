import { View, FlatList, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";
import {
  useServiceListings,
  useFeaturedCreators,
  SERVICE_CATEGORIES,
  TIER_INFO,
} from "@foreverr/core";

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}

const CATEGORY_LIST = Object.entries(SERVICE_CATEGORIES).map(([key, val]) => ({ key, ...val }));

export default function ServiceMarketplaceScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "price_low" | "rating">("popular");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useServiceListings({
    category: activeCategory,
    search: search || undefined,
    sortBy,
  });
  const { data: featuredCreators } = useFeaturedCreators();

  const listings = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search bar */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2.5">
          <Ionicons name="search" size={16} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="Search services..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        {/* Sort pills */}
        <View className="flex-row gap-2 mt-2.5">
          {([
            { key: "popular", label: "Popular" },
            { key: "newest", label: "Newest" },
            { key: "price_low", label: "Price: Low" },
            { key: "rating", label: "Top Rated" },
          ] as const).map((s) => (
            <Pressable
              key={s.key}
              className={`px-3 py-1.5 rounded-full ${sortBy === s.key ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"}`}
              onPress={() => setSortBy(s.key)}
            >
              <Text className={`text-[11px] font-sans-semibold ${sortBy === s.key ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item: any) => item.id}
        ListHeaderComponent={
          <>
            {/* Category row */}
            <View className="px-4 py-3">
              <FlatList
                data={[{ key: undefined, label: "All", icon: "apps-outline" }, ...CATEGORY_LIST]}
                keyExtractor={(item: any) => item.key ?? "all"}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }: { item: any }) => (
                  <Pressable
                    className={`mr-2 items-center px-3 py-2 rounded-xl ${
                      activeCategory === item.key ? "bg-brand-700" : "bg-white dark:bg-gray-800"
                    }`}
                    onPress={() => setActiveCategory(item.key)}
                  >
                    <Ionicons
                      name={(item.icon ?? "apps-outline") as any}
                      size={18}
                      color={activeCategory === item.key ? "#ffffff" : "#4A2D7A"}
                    />
                    <Text
                      className={`text-[10px] font-sans-semibold mt-1 ${
                        activeCategory === item.key ? "text-white" : "text-gray-600 dark:text-gray-300"
                      }`}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            {/* Featured Creators */}
            {!activeCategory && !search && featuredCreators && featuredCreators.length > 0 && (
              <View className="px-4 mb-3">
                <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">Featured Creators</Text>
                <FlatList
                  data={featuredCreators.slice(0, 8)}
                  keyExtractor={(item: any) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }: { item: any }) => {
                    const tier = TIER_INFO[(item.tier as keyof typeof TIER_INFO) ?? "rising"];
                    return (
                      <Pressable
                        className="mr-3 items-center w-20"
                        onPress={() => router.push(`/user/${item.user_id}` as any)}
                      >
                        <View className="h-14 w-14 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center border-2" style={{ borderColor: tier.color }}>
                          <Ionicons name="person" size={24} color="#4A2D7A" />
                        </View>
                        <Text className="text-[10px] font-sans-semibold text-gray-900 dark:text-white mt-1 text-center" numberOfLines={1}>
                          {item.profiles?.display_name ?? item.display_name}
                        </Text>
                        <Text className="text-[8px]">{tier.icon} {item.tier}</Text>
                      </Pressable>
                    );
                  }}
                />
              </View>
            )}

            {/* Results count */}
            <View className="px-4 mb-2">
              <Text className="text-xs font-sans text-gray-400">
                {listings.length} service{listings.length !== 1 ? "s" : ""} found
              </Text>
            </View>
          </>
        }
        renderItem={({ item }: { item: any }) => {
          const catInfo = SERVICE_CATEGORIES[item.category as keyof typeof SERVICE_CATEGORIES];
          const creatorTier = TIER_INFO[(item.creator?.tier as keyof typeof TIER_INFO) ?? "rising"];
          return (
            <Pressable
              className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden"
              onPress={() => router.push(`/services/${item.id}` as any)}
            >
              {/* Cover */}
              <View className="h-32 bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
                <Ionicons name={(catInfo?.icon ?? "briefcase-outline") as any} size={36} color="#4A2D7A" />
                <Text className="text-xs font-sans-semibold text-brand-600 mt-1">{catInfo?.label ?? item.category}</Text>
              </View>

              <View className="p-3.5">
                {/* Title & Price */}
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View className="bg-green-50 dark:bg-green-900/20 rounded-lg px-2.5 py-1">
                    <Text className="text-sm font-sans-bold text-green-700 dark:text-green-400">
                      {formatPrice(item.price_cents)}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mb-3" numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Creator info */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="h-6 w-6 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                      <Ionicons name="person" size={12} color="#4A2D7A" />
                    </View>
                    <Text className="text-[11px] font-sans-semibold text-gray-600 dark:text-gray-300">
                      {item.creator?.display_name ?? "Creator"}
                    </Text>
                    <Text className="text-[10px]">{creatorTier.icon}</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    {item.rating_avg > 0 && (
                      <View className="flex-row items-center gap-0.5">
                        <Ionicons name="star" size={10} color="#fbbf24" />
                        <Text className="text-[10px] font-sans-semibold text-gray-600 dark:text-gray-300">
                          {item.rating_avg.toFixed(1)}
                        </Text>
                      </View>
                    )}
                    <View className="flex-row items-center gap-0.5">
                      <Ionicons name="cart-outline" size={10} color="#9ca3af" />
                      <Text className="text-[10px] font-sans text-gray-400">{item.order_count}</Text>
                    </View>
                    <View className="flex-row items-center gap-0.5">
                      <Ionicons name="time-outline" size={10} color="#9ca3af" />
                      <Text className="text-[10px] font-sans text-gray-400">{item.delivery_days}d</Text>
                    </View>
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
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#4A2D7A" />
            </View>
          ) : (
            <View className="items-center py-20 px-8">
              <Ionicons name="search-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans-semibold text-gray-400 mt-3 text-center">No services found</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1 text-center">
                Try adjusting your search or category filter
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      />
    </View>
  );
}
