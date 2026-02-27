import { View, TextInput, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useMemorials } from "@foreverr/core";
import { Text, ForeverrLogo } from "@foreverr/ui";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [searchTerm, setSearchTerm] = useState(params.q ?? "");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMemorials({
    search: searchTerm || undefined,
  });

  const memorials = data?.pages.flatMap((p) => p.data) ?? [];

  const handleSearch = () => {
    setSearchTerm(query.trim());
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="bg-brand-900 px-4 pb-3 pt-14">
        <Pressable onPress={() => router.push("/(tabs)")} className="items-center mb-3">
          <ForeverrLogo width={550} variant="full" />
        </Pressable>
        <View className="flex-row items-center rounded-full bg-white/15 px-4 py-2.5">
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            className="ml-2 flex-1 text-sm font-sans text-white"
            placeholder="Search memorials by name..."
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
          renderItem={({ item }: { item: any }) => (
            <Pressable
              className="flex-1 rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
              onPress={() => router.push(`/memorial/${item.id}`)}
            >
              <View className="h-28 bg-brand-900">
                {item.profile_photo_url ? (
                  <Image source={{ uri: item.profile_photo_url }} style={{ width: "100%", height: 112 }} contentFit="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="person" size={36} color="#e9d5ff" />
                  </View>
                )}
              </View>
              <View className="p-2.5">
                <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text className="text-[10px] font-sans text-gray-500">
                  {item.follower_count ?? 0} followers
                </Text>
              </View>
            </Pressable>
          )}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color="#4A2D7A" style={{ padding: 16 }} /> : null}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Ionicons name="search" size={48} color="#d1d5db" />
              <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
                {searchTerm
                  ? `No memorials found for "${searchTerm}"`
                  : "Search for memorials by name or browse public memorials."
                }
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
