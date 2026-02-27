import React, { useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, FlatList, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useGiftCatalogItems } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const CATEGORIES = [
  { key: null, label: "All", icon: "grid-outline" as const },
  { key: "flowers", label: "Flowers", icon: "flower-outline" as const },
  { key: "candles", label: "Candles", icon: "flame-outline" as const },
  { key: "cards", label: "Cards", icon: "mail-outline" as const },
  { key: "stuffed_animals", label: "Stuffed Animals", icon: "heart-outline" as const },
  { key: "balloons", label: "Balloons", icon: "ellipse-outline" as const },
  { key: "custom", label: "Custom", icon: "star-outline" as const },
];

export default function GiftCatalogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: gifts,
    isLoading,
    isError,
    error,
    refetch,
  } = useGiftCatalogItems(selectedCategory ?? undefined);

  const handleGiftPress = (item: any) => {
    Alert.alert(
      item.name,
      `${item.description ?? "A beautiful gift to honor someone special."}\n\n${
        item.price_cents > 0 ? `$${(item.price_cents / 100).toFixed(2)}` : "Free"
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send This Gift",
          onPress: () => {
            // Navigate to a recipient picker or use the gift catalog sheet from the target's page
            Alert.alert(
              "Choose Recipient",
              "To send this gift, visit a memorial, tribute, or user profile and tap 'Give Flowers'."
            );
          },
        },
      ]
    );
  };

  const renderGiftItem = ({ item }: { item: any }) => (
    <Pressable
      className="flex-1 m-1.5 bg-white dark:bg-gray-800 rounded-2xl p-4 items-center border border-gray-100 dark:border-gray-700"
      onPress={() => handleGiftPress(item)}
    >
      <View className="h-16 w-16 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3">
        <Ionicons
          name={(item.icon ?? "gift") as any}
          size={28}
          color="#4A2D7A"
        />
      </View>
      <Text
        className="text-sm font-sans-semibold text-gray-900 dark:text-white text-center mb-1"
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <View className="bg-brand-50 dark:bg-brand-900/30 rounded-full px-3 py-1 mt-1">
        <Text className="text-xs font-sans-semibold text-brand-700 dark:text-brand-300">
          {item.price_cents > 0 ? `$${(item.price_cents / 100).toFixed(2)}` : "Free"}
        </Text>
      </View>
      {item.is_premium && (
        <View className="absolute top-2 right-2 bg-amber-100 dark:bg-amber-900/30 rounded-full px-2 py-0.5">
          <Text className="text-[8px] font-sans-bold text-amber-600">PREMIUM</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Give Them Their Flowers
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Choose a meaningful gift to honor someone special
            </Text>
          </View>
          <View className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
            <Ionicons name="gift" size={20} color="#4A2D7A" />
          </View>
        </View>

        {/* Category filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key ?? "all"}
              onPress={() => setSelectedCategory(cat.key)}
              className={`flex-row items-center rounded-full px-4 py-2 ${
                selectedCategory === cat.key
                  ? "bg-brand-700"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={selectedCategory === cat.key ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                className={`text-xs font-sans-medium ml-1.5 ${
                  selectedCategory === cat.key
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Gift grid */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A2D7A" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text className="text-sm font-sans text-gray-500 text-center mt-3">
            {(error as any)?.message ?? "Failed to load gifts"}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 bg-brand-700 rounded-xl px-6 py-2.5"
          >
            <Text className="text-sm font-sans-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={(gifts as any[]) ?? []}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          keyExtractor={(item: any) => item.id}
          renderItem={renderGiftItem}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-8">
              <View className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                <Ionicons name="gift-outline" size={32} color="#D1D5DB" />
              </View>
              <Text className="text-lg font-sans-bold text-gray-400 mt-2">
                No gifts available
              </Text>
              <Text className="text-sm font-sans text-gray-400 text-center mt-1">
                {selectedCategory
                  ? "Try selecting a different category"
                  : "Gift catalog is empty right now"}
              </Text>
              {selectedCategory && (
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl px-5 py-2.5"
                >
                  <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-300">
                    Clear Filter
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
