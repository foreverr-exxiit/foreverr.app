import { View, TextInput, Pressable, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useMemorials } from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

type LifecycleFilter = "all" | "celebrate" | "preserve" | "support" | "remember" | "legacy";

const LIFECYCLE_FILTERS: { key: LifecycleFilter; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "all",       label: "All",       icon: "apps",     color: "#4A2D7A" },
  { key: "remember",  label: "Memorial",  icon: "flower",   color: "#8B5CF6" },
  { key: "celebrate", label: "Celebrate", icon: "sparkles", color: "#F59E0B" },
  { key: "preserve",  label: "Preserve",  icon: "book",     color: "#3B82F6" },
  { key: "support",   label: "Support",   icon: "heart",    color: "#EC4899" },
  { key: "legacy",    label: "The Core",    icon: "star",     color: "#F97316" },
];

const STAGE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  celebrate: { label: "Celebrating", color: "#D97706", bg: "bg-amber-50 dark:bg-amber-900/20" },
  preserve:  { label: "Preserving",  color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-900/20" },
  support:   { label: "Supporting",  color: "#DB2777", bg: "bg-pink-50 dark:bg-pink-900/20" },
  remember:  { label: "Memorial",    color: "#7C3AED", bg: "bg-purple-50 dark:bg-purple-900/20" },
  legacy:    { label: "The Core",      color: "#EA580C", bg: "bg-orange-50 dark:bg-orange-900/20" },
};

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [searchTerm, setSearchTerm] = useState(params.q ?? "");
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleFilter>("all");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMemorials({
    search: searchTerm || undefined,
  });

  const allMemorials = data?.pages.flatMap((p) => p.data) ?? [];

  // Client-side lifecycle filtering
  const memorials = lifecycleFilter === "all"
    ? allMemorials
    : allMemorials.filter((m: any) => (m.lifecycle_stage ?? "remember") === lifecycleFilter);

  const handleSearch = () => {
    setSearchTerm(query.trim());
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="bg-brand-900 px-4 pb-3 pt-14">
        <View className="items-center mb-3">
          <EternLogo width={960} variant="full" />
        </View>
        <View className="flex-row items-center rounded-full bg-white/15 px-4 py-2.5">
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            className="ml-2 flex-1 text-sm font-sans text-white"
            placeholder="Search people, memorials & celebrations..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); setSearchTerm(""); }}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Lifecycle filter chips */}
      <View className="border-b border-gray-100 dark:border-gray-800">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2.5"
          contentContainerStyle={{ gap: 8 }}
        >
          {LIFECYCLE_FILTERS.map((f) => {
            const isActive = lifecycleFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setLifecycleFilter(f.key)}
                className={`flex-row items-center rounded-full px-3 py-1.5 ${
                  isActive ? "" : "bg-gray-100 dark:bg-gray-800"
                }`}
                style={isActive ? { backgroundColor: `${f.color}15` } : undefined}
              >
                <Ionicons
                  name={f.icon as any}
                  size={13}
                  color={isActive ? f.color : "#9ca3af"}
                />
                <Text
                  className={`ml-1 text-xs font-sans-semibold ${isActive ? "" : "text-gray-500"}`}
                  style={isActive ? { color: f.color } : undefined}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A2D7A" />
        </View>
      ) : (
        <FlatList
          data={memorials}
          keyExtractor={(item: any) => item.id}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 12 }}
          renderItem={({ item }: { item: any }) => {
            const stage = (item as any).lifecycle_stage ?? "remember";
            const badge = STAGE_BADGE[stage];
            return (
              <Pressable
                className="flex-1 rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
                onPress={() => router.push(`/lifecycle/${item.id}`)}
              >
                <View className="h-28 bg-brand-900">
                  {item.profile_photo_url ? (
                    <Image source={{ uri: item.profile_photo_url }} style={{ width: "100%", height: 112 }} contentFit="cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons name="person" size={36} color="#e9d5ff" />
                    </View>
                  )}
                  {/* Lifecycle stage badge overlay */}
                  {badge && stage !== "remember" && (
                    <View
                      className="absolute top-2 left-2 rounded-full px-2 py-0.5"
                      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                    >
                      <Text className="text-[9px] font-sans-bold text-white">
                        {badge.label}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="p-2.5">
                  <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Text className="text-[10px] font-sans text-gray-500">
                      {item.follower_count ?? 0} followers
                    </Text>
                    {item.tribute_count > 0 && (
                      <Text className="text-[10px] font-sans text-gray-400 ml-1.5">
                        {"\u00B7"} {item.tribute_count} tributes
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color="#4A2D7A" style={{ padding: 16 }} /> : null}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Ionicons name="search" size={48} color="#d1d5db" />
              <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
                {searchTerm
                  ? `No results found for "${searchTerm}"${lifecycleFilter !== "all" ? ` in ${lifecycleFilter}` : ""}`
                  : "Search for people, memorials, celebrations & living tributes."
                }
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
