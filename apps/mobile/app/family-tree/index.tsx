import React from "react";
import { View, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Text, ScreenWrapper, ListSkeleton } from "@foreverr/ui";
import { useMyFamilyTrees } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

export default function FamilyTreeListScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: trees, isLoading } = useMyFamilyTrees(user?.id);

  if (isLoading) {
    return <ListSkeleton />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Family Trees" }} />

      <FlatList
        data={trees ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/family-tree/${item.id}`)}
            className="bg-white rounded-2xl mb-3 shadow-sm border border-gray-100 overflow-hidden"
          >
            {item.cover_image_url ? (
              <Image
                source={{ uri: item.cover_image_url }}
                className="w-full h-32"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-32 bg-gradient-to-r from-purple-100 to-indigo-100 items-center justify-center">
                <Text className="text-4xl">🌳</Text>
              </View>
            )}
            <View className="p-4">
              <Text className="text-lg font-semibold text-gray-900 mb-1">{item.name}</Text>
              {item.description && (
                <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <View className="flex-row items-center">
                <View className="bg-purple-100 rounded-full px-3 py-1 mr-2">
                  <Text className="text-xs text-purple-700 font-medium">
                    👥 {item.member_count} members
                  </Text>
                </View>
                {!item.is_public && (
                  <View className="bg-gray-100 rounded-full px-2 py-1">
                    <Text className="text-xs text-gray-500">🔒 Private</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">🌳</Text>
            <Text className="text-lg font-semibold text-gray-900 mb-2">No Family Trees Yet</Text>
            <Text className="text-sm text-gray-500 text-center px-8 mb-6">
              Create a family tree to connect memorials and preserve your family lineage.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/family-tree/create")}
              className="bg-purple-700 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Create Family Tree</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {(trees?.length ?? 0) > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/family-tree/create")}
          className="absolute bottom-6 right-6 w-14 h-14 bg-purple-700 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}
