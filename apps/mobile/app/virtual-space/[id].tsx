import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Text, ScreenWrapper } from "@foreverr/ui";
import { useVirtualSpace, useVirtualSpaceItems, usePlaceSpaceItem } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

const PLACEABLE_ITEMS = [
  { type: "candle", icon: "🕯️", label: "Candle", cost: 0 },
  { type: "flower", icon: "🌹", label: "Flower", cost: 5 },
  { type: "wreath", icon: "🌿", label: "Wreath", cost: 10 },
  { type: "dove", icon: "🕊️", label: "Dove", cost: 15 },
  { type: "butterfly", icon: "🦋", label: "Butterfly", cost: 10 },
  { type: "teddy_bear", icon: "🧸", label: "Teddy Bear", cost: 20 },
  { type: "plant", icon: "🌱", label: "Plant", cost: 5 },
  { type: "cross", icon: "✝️", label: "Cross", cost: 0 },
  { type: "star_of_david", icon: "✡️", label: "Star", cost: 0 },
  { type: "text_plaque", icon: "📝", label: "Plaque", cost: 10 },
];

export default function VirtualSpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: space } = useVirtualSpace(id);
  const { data: items } = useVirtualSpaceItems(id);
  const placeItem = usePlaceSpaceItem();

  const [showPalette, setShowPalette] = useState(false);

  const handlePlaceItem = async (itemType: string, cost: number) => {
    if (!user?.id || !id) return;
    await placeItem.mutateAsync({
      spaceId: id,
      placedBy: user.id,
      itemType,
      ribbonCost: cost,
      // Random position in space
      positionX: Math.random() * 10 - 5,
      positionY: 0,
      positionZ: Math.random() * 10 - 5,
    });
    setShowPalette(false);
  };

  const spaceIcons: Record<string, string> = {
    memorial_room: "🏛️",
    garden: "🌸",
    chapel: "⛪",
    gravesite: "🪦",
    beach: "🏖️",
    forest: "🌲",
    custom: "✨",
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: space?.name ?? "Virtual Space" }} />

      <ScrollView className="flex-1">
        {/* 3D Space Placeholder */}
        <View className="bg-gray-900 h-72 items-center justify-center">
          <Text className="text-6xl mb-4">{spaceIcons[space?.space_type ?? ""] ?? "✨"}</Text>
          <Text className="text-white text-lg font-bold">{space?.name}</Text>
          <Text className="text-gray-400 text-sm mt-1">
            3D View · {items?.length ?? 0} items placed
          </Text>
          <View className="bg-white/10 rounded-xl px-4 py-2 mt-4">
            <Text className="text-gray-300 text-xs text-center">
              Interactive 3D rendering will appear here{"\n"}
              (Three.js / React Native AR integration)
            </Text>
          </View>
        </View>

        {/* Space Info */}
        <View className="px-4 py-4">
          {space?.description && (
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">{space.description}</Text>
          )}
          <View className="flex-row items-center mb-4">
            <View className="bg-purple-100 rounded-full px-3 py-1 mr-2">
              <Text className="text-xs text-purple-700">👥 {space?.visitor_count ?? 0} visitors</Text>
            </View>
            <View className="bg-purple-100 rounded-full px-3 py-1">
              <Text className="text-xs text-purple-700">🕯️ {space?.item_count ?? 0} items</Text>
            </View>
          </View>
        </View>

        {/* Placed Items Grid */}
        <View className="px-4 pb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">Placed Items</Text>
          {(items?.length ?? 0) > 0 ? (
            <View className="flex-row flex-wrap">
              {items?.map((item) => (
                <View
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 mr-2 mb-2 border border-gray-100 dark:border-gray-700 items-center"
                  style={{ width: 80 }}
                >
                  <Text className="text-2xl mb-1">
                    {PLACEABLE_ITEMS.find((p) => p.type === item.item_type)?.icon ?? "✨"}
                  </Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1}>
                    {(item as any).placer?.display_name ?? "Someone"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-400">No items placed yet. Be the first!</Text>
          )}
        </View>
      </ScrollView>

      {/* Item Palette */}
      {showPalette && (
        <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 px-4 py-4">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Place an Item</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={PLACEABLE_ITEMS}
            keyExtractor={(item) => item.type}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handlePlaceItem(item.type, item.cost)}
                className="items-center mr-4"
                disabled={placeItem.isPending}
              >
                <View className="w-14 h-14 rounded-xl bg-purple-50 items-center justify-center mb-1">
                  <Text className="text-2xl">{item.icon}</Text>
                </View>
                <Text className="text-xs text-gray-700 dark:text-gray-300">{item.label}</Text>
                <Text className="text-xs text-purple-600 font-medium">
                  {item.cost === 0 ? "Free" : `${item.cost} 🎀`}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* FAB - Place Item */}
      <TouchableOpacity
        onPress={() => setShowPalette(!showPalette)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-purple-700 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white text-xl">{showPalette ? "✕" : "🕯️"}</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
