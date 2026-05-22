import { View, FlatList, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useContentLicenses, CONTENT_TYPES, LICENSE_TYPES } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "popular", label: "Popular" },
  { key: "price_low", label: "Price ↑" },
  { key: "price_high", label: "Price ↓" },
];

export default function LicensingMarketplaceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { data, isLoading, fetchNextPage, hasNextPage } = useContentLicenses({
    contentType: contentType || undefined,
    search: search || undefined,
    sortBy,
  });
  const licenses = data?.pages?.flatMap((p) => p.data) ?? [];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Content Licensing</Text>
            <Text className="text-xs font-sans text-gray-500">License reusable memorial & celebration content</Text>
          </View>
          <Pressable
            className="bg-brand-700 rounded-xl px-3 py-2 flex-row items-center gap-1"
            onPress={() => router.push("/licensing/create" as any)}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text className="text-xs font-sans-bold text-white">List Content</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search" size={16} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="Search content..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Content Type Filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ key: "", label: "All", icon: "apps-outline" }, ...Object.entries(CONTENT_TYPES).map(([k, v]) => ({ key: k, ...v }))]}
          keyExtractor={(i) => i.key}
          renderItem={({ item }) => (
            <Pressable
              className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full mr-2 ${
                contentType === item.key ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"
              }`}
              onPress={() => setContentType(item.key)}
            >
              <Ionicons name={(item.icon ?? "apps-outline") as any} size={12} color={contentType === item.key ? "#fff" : "#6b7280"} />
              <Text className={`text-[11px] font-sans-semibold ${contentType === item.key ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />

        {/* Sort */}
        <View className="flex-row gap-2 mt-2">
          {SORT_OPTIONS.map((s) => (
            <Pressable
              key={s.key}
              className={`px-2.5 py-1 rounded-full ${sortBy === s.key ? "bg-brand-100 dark:bg-brand-900/30" : ""}`}
              onPress={() => setSortBy(s.key)}
            >
              <Text className={`text-[10px] font-sans-semibold ${sortBy === s.key ? "text-brand-700" : "text-gray-400"}`}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Listings */}
      <FlatList
        data={licenses}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }: { item: any }) => {
          const typeInfo = CONTENT_TYPES[item.content_type as keyof typeof CONTENT_TYPES];
          const licenseInfo = LICENSE_TYPES[item.license_type as keyof typeof LICENSE_TYPES];
          return (
            <Pressable
              className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 mb-3"
              onPress={() => router.push(`/licensing/${item.id}` as any)}
            >
              {/* Icon */}
              <View className="h-20 bg-brand-50 dark:bg-brand-900/20 rounded-xl items-center justify-center mb-2">
                <Ionicons name={(typeInfo?.icon ?? "document-outline") as any} size={28} color="#4A2D7A" />
              </View>
              <Text className="text-xs font-sans-bold text-gray-900 dark:text-white" numberOfLines={2}>
                {item.title}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Text className="text-[10px] font-sans text-gray-400">{typeInfo?.label ?? item.content_type}</Text>
                <Text className="text-[10px] text-gray-300">•</Text>
                <Text className="text-[10px] font-sans text-gray-400">{licenseInfo?.label ?? item.license_type}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-sm font-sans-bold text-brand-700">
                  {item.price_cents === 0 ? "Free" : `$${(item.price_cents / 100).toFixed(2)}`}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400">{item.download_count} downloads</Text>
              </View>
              {item.creator && (
                <Text className="text-[10px] font-sans text-gray-400 mt-1" numberOfLines={1}>
                  by {item.creator.display_name}
                </Text>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20"><ActivityIndicator size="large" color="#4A2D7A" /></View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="document-text-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No content available yet</Text>
              <Pressable
                className="mt-4 bg-brand-700 rounded-xl px-4 py-2"
                onPress={() => router.push("/licensing/create" as any)}
              >
                <Text className="text-xs font-sans-bold text-white">List Your Content</Text>
              </Pressable>
            </View>
          )
        }
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
}
