import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Text, ScreenWrapper, VirtualSpaceCard, ListSkeleton } from "@foreverr/ui";
import { useVirtualSpaces } from "@foreverr/core";

export default function VirtualSpaceListScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { data: spaces, isLoading } = useVirtualSpaces(memorialId);

  if (isLoading) {
    return <ListSkeleton />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Virtual Spaces" }} />

      <FlatList
        data={spaces ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4"
        renderItem={({ item }) => (
          <VirtualSpaceCard
            name={item.name}
            description={item.description}
            spaceType={item.space_type}
            visitorCount={item.visitor_count}
            itemCount={item.item_count}
            creatorName={(item as any).creator?.display_name}
            isPublic={item.is_public}
            onPress={() => router.push(`/virtual-space/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">🏛️</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Virtual Spaces Yet
            </Text>
            <Text className="text-sm text-gray-500 text-center px-8 mb-6">
              Create an immersive virtual memorial space where visitors can place candles,
              flowers, and personal tributes in 3D.
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/virtual-space/create?memorialId=${memorialId}`)}
              className="bg-purple-700 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Create Space</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {(spaces?.length ?? 0) > 0 && (
        <TouchableOpacity
          onPress={() => router.push(`/virtual-space/create?memorialId=${memorialId}`)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-purple-700 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}
