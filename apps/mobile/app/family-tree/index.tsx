import React, { useCallback } from "react";
import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, EternLogo } from "@foreverr/ui";
import { useAuth, useMyFamilyTrees } from "@foreverr/core";

export default function FamilyTreeListScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();
  const { data: trees, isLoading } = useMyFamilyTrees(user?.id);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Family Trees
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Connect generations through visual lineage
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A2D7A" />
          <Text className="text-sm font-sans text-gray-400 mt-3">Loading your trees...</Text>
        </View>
      ) : (
        <FlatList
          data={trees ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/family-tree/${item.id}` as any)}
              className="bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700 overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              {/* Cover / Placeholder */}
              <View className="w-full h-28 bg-green-50 dark:bg-green-900/10 items-center justify-center">
                <Text style={{ fontSize: 40 }}>{"\u{1F333}"}</Text>
              </View>

              <View className="p-4">
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-1">
                  {item.name}
                </Text>
                {item.description && (
                  <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 mb-3" numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View className="flex-row items-center gap-2">
                  <View className="bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1">
                    <Text className="text-xs font-sans-bold text-brand-700 dark:text-brand-400">
                      {"\u{1F465}"} {(item as any).member_count ?? 0} members
                    </Text>
                  </View>
                  {!item.is_public && (
                    <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-2.5 py-1">
                      <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
                        {"\u{1F512}"} Private
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 px-8">
              <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
                <Text style={{ fontSize: 40 }}>{"\u{1F333}"}</Text>
              </View>
              <Text className="text-lg font-sans-bold text-gray-400 mb-2">
                No Family Trees Yet
              </Text>
              <Text className="text-sm font-sans text-gray-400 text-center mb-6">
                Create a family tree to connect memorials and living family members into a visual lineage.
              </Text>
              <Pressable
                onPress={() => router.push("/family-tree/create" as any)}
                className="bg-brand-700 rounded-2xl px-6 py-3.5"
              >
                <Text className="text-base font-sans-bold text-white">
                  Create Family Tree
                </Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* FAB - Create Tree */}
      {(trees?.length ?? 0) > 0 && (
        <Pressable
          onPress={() => router.push("/family-tree/create" as any)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-brand-700 rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: "#4A2D7A",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}
    </View>
  );
}
