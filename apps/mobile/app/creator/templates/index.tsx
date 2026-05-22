import { View, FlatList, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";
import {
  useTemplates,
  TEMPLATE_CATEGORIES,
  TIER_INFO,
} from "@foreverr/core";

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

const SORT_OPTIONS = [
  { key: "popular", label: "Popular" },
  { key: "newest", label: "Newest" },
  { key: "price_low", label: "Price ↑" },
  { key: "rating", label: "Top Rated" },
];

export default function TemplateMarketplaceScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState("popular");

  const { data, isLoading, fetchNextPage, hasNextPage } = useTemplates({
    category: selectedCategory,
    search: search.trim() || undefined,
    sortBy,
  });

  const templates = useMemo(() => data?.pages?.flatMap((p) => p.data) ?? [], [data]);

  const categoryEntries = Object.entries(TEMPLATE_CATEGORIES);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Templates</Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Beautiful memorial & celebration designs
            </Text>
          </View>
          <Pressable
            className="bg-brand-700 rounded-xl px-3 py-2 flex-row items-center gap-1.5"
            onPress={() => router.push("/creator/templates/create" as any)}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text className="text-xs font-sans-semibold text-white">Create</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2.5 mb-3">
          <Ionicons name="search-outline" size={16} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="Search templates..."
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

        {/* Sort */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2">
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                className={`px-3.5 py-1.5 rounded-full ${sortBy === opt.key ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"}`}
                onPress={() => setSortBy(opt.key)}
              >
                <Text className={`text-xs font-sans-semibold ${sortBy === opt.key ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white dark:bg-gray-800 px-4 py-2 border-t border-gray-50 dark:border-gray-700">
        <View className="flex-row gap-2">
          <Pressable
            className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${!selectedCategory ? "bg-brand-100 dark:bg-brand-900/30" : "bg-gray-50 dark:bg-gray-700"}`}
            onPress={() => setSelectedCategory(undefined)}
          >
            <Ionicons name="apps-outline" size={12} color={!selectedCategory ? "#4A2D7A" : "#9ca3af"} />
            <Text className={`text-[11px] font-sans-semibold ${!selectedCategory ? "text-brand-700" : "text-gray-500"}`}>All</Text>
          </Pressable>
          {categoryEntries.map(([key, val]) => (
            <Pressable
              key={key}
              className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${selectedCategory === key ? "bg-brand-100 dark:bg-brand-900/30" : "bg-gray-50 dark:bg-gray-700"}`}
              onPress={() => setSelectedCategory(selectedCategory === key ? undefined : key)}
            >
              <Ionicons name={val.icon as any} size={12} color={selectedCategory === key ? "#4A2D7A" : "#9ca3af"} />
              <Text className={`text-[11px] font-sans-semibold ${selectedCategory === key ? "text-brand-700" : "text-gray-500"}`}>{val.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Template Grid */}
      <FlatList
        data={templates}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12, flexGrow: 1 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }: { item: any }) => {
          const tierInfo = item.creator ? TIER_INFO[(item.creator.tier as keyof typeof TIER_INFO) ?? "rising"] : null;
          return (
            <Pressable
              className="flex-1 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mb-3"
              style={{ maxWidth: "50%" }}
              onPress={() => router.push(`/creator/templates/${item.id}` as any)}
            >
              {/* Preview */}
              <View className="h-32 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 items-center justify-center">
                {item.preview_images && item.preview_images[0] ? (
                  <View className="w-full h-full bg-brand-100 dark:bg-brand-900/30" />
                ) : (
                  <View className="items-center">
                    <Ionicons name={(TEMPLATE_CATEGORIES[item.category as keyof typeof TEMPLATE_CATEGORIES]?.icon ?? "document-outline") as any} size={28} color="#4A2D7A" />
                    <Text className="text-[9px] font-sans text-brand-600 mt-1 capitalize">
                      {(TEMPLATE_CATEGORIES[item.category as keyof typeof TEMPLATE_CATEGORIES]?.label ?? item.category)}
                    </Text>
                  </View>
                )}
                {/* Price badge */}
                <View className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 rounded-full px-2 py-0.5">
                  <Text className={`text-[10px] font-sans-bold ${item.price_cents === 0 ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                    {formatPrice(item.price_cents)}
                  </Text>
                </View>
              </View>

              {/* Info */}
              <View className="p-3">
                <Text className="text-xs font-sans-bold text-gray-900 dark:text-white" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.creator && (
                  <View className="flex-row items-center gap-1 mt-1.5">
                    <View className="h-4 w-4 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                      <Ionicons name="person" size={8} color="#4A2D7A" />
                    </View>
                    <Text className="text-[10px] font-sans text-gray-500" numberOfLines={1}>
                      {item.creator.display_name}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center justify-between mt-2">
                  {item.rating_avg > 0 && (
                    <View className="flex-row items-center gap-0.5">
                      <Ionicons name="star" size={10} color="#fbbf24" />
                      <Text className="text-[10px] font-sans-bold text-gray-700 dark:text-gray-300">
                        {item.rating_avg.toFixed(1)}
                      </Text>
                    </View>
                  )}
                  <Text className="text-[9px] font-sans text-gray-400">
                    {item.download_count ?? 0} uses
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20"><ActivityIndicator size="large" color="#4A2D7A" /></View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="color-palette-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No templates found</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1">
                Be the first to create a template!
              </Text>
              <Pressable
                className="mt-4 bg-brand-700 rounded-xl px-6 py-3"
                onPress={() => router.push("/creator/templates/create" as any)}
              >
                <Text className="text-sm font-sans-semibold text-white">Create Template</Text>
              </Pressable>
            </View>
          )
        }
      />
    </View>
  );
}
