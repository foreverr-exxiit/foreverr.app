import React, { useState, useCallback } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useGiftCatalogItems, getGiftEmoji, useMyPointBalance } from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

const CATEGORIES = [
  { key: null,           label: "All",        emoji: "\u2728" },
  { key: "celebrations", label: "Celebrate",  emoji: "\u{1F389}" },
  { key: "baby",         label: "Baby",       emoji: "\u{1F476}" },
  { key: "milestones",   label: "Turning Points", emoji: "\u{1F393}" },
  { key: "flowers",      label: "Flowers",    emoji: "\u{1F339}" },
  { key: "cards",        label: "Cards",      emoji: "\u{1F48C}" },
  { key: "candles",      label: "Candles",    emoji: "\u{1F56F}\uFE0F" },
  { key: "sympathy",     label: "Sympathy",   emoji: "\u{1F54A}\uFE0F" },
  { key: "legacy",       label: "The Core",     emoji: "\u{1F331}" },
];

export default function GiftCatalogScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: gifts,
    isLoading,
    isError,
    error,
    refetch,
  } = useGiftCatalogItems(selectedCategory ?? undefined);

  const { data: pointBalance } = useMyPointBalance(user?.id);
  const currentPoints = (pointBalance as any)?.current_balance ?? 0;

  const handleGiftPress = (item: any) => {
    router.push({
      pathname: "/gifts/[targetType]/[targetId]",
      params: { targetType: "memorial", targetId: "browse" },
    } as any);
  };

  const renderGiftItem = ({ item }: { item: any }) => {
    const emoji = getGiftEmoji(item.icon);
    const pts = item.point_cost ?? 0;
    const isFree = pts === 0;
    const canAfford = currentPoints >= pts;

    return (
      <Pressable
        className={`flex-1 m-1.5 rounded-2xl p-4 items-center border shadow-sm ${
          item.is_premium
            ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50"
            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
        onPress={() => handleGiftPress(item)}
      >
        {/* Large Emoji Icon */}
        <View className="h-16 w-16 rounded-2xl bg-gray-50 dark:bg-gray-700 items-center justify-center mb-3">
          <Text style={{ fontSize: 32 }}>{emoji}</Text>
        </View>

        {/* Gift Name */}
        <Text
          className="text-sm font-sans-semibold text-gray-900 dark:text-white text-center mb-1"
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Description */}
        {item.description && (
          <Text
            className="text-[10px] font-sans text-gray-400 dark:text-gray-500 text-center mb-2"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        {/* Point Cost Badge */}
        <View
          className={`flex-row items-center gap-1 rounded-full px-3 py-1 mt-auto ${
            isFree
              ? "bg-green-50 dark:bg-green-900/20"
              : canAfford
              ? "bg-amber-50 dark:bg-amber-900/20"
              : "bg-red-50 dark:bg-red-900/20"
          }`}
        >
          {!isFree && (
            <Ionicons name="star" size={11} color={canAfford ? "#d97706" : "#ef4444"} />
          )}
          <Text
            className={`text-xs font-sans-semibold ${
              isFree
                ? "text-green-600 dark:text-green-400"
                : canAfford
                ? "text-amber-700 dark:text-amber-400"
                : "text-red-500"
            }`}
          >
            {isFree ? "Free" : `${pts} pts`}
          </Text>
        </View>

        {/* Premium Badge */}
        {item.is_premium && (
          <View className="absolute top-2 right-2 bg-amber-100 dark:bg-amber-900/30 rounded-full px-2 py-0.5">
            <Text className="text-[8px] font-sans-bold text-amber-600">{"\u2728"} PREMIUM</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Gift Shop
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Celebrate life's moments — from birth to legacy
            </Text>
          </View>
          {/* Points Balance */}
          <Pressable
            onPress={() => router.push("/points/buy" as any)}
            className="flex-row items-center gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-full px-3 py-2"
          >
            <Ionicons name="star" size={14} color="#d97706" />
            <Text className="text-xs font-sans-bold text-amber-700 dark:text-amber-400">
              {currentPoints}
            </Text>
          </Pressable>
        </View>

        {/* Category filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <Pressable
                key={cat.key ?? "all"}
                onPress={() => setSelectedCategory(cat.key)}
                className={`flex-row items-center rounded-full px-4 py-2.5 ${
                  isActive ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                <Text
                  className={`text-xs font-sans-semibold ml-1.5 ${
                    isActive ? "text-white" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* How it works banner */}
      <View className="mx-4 mt-3 mb-1 bg-brand-50 dark:bg-brand-900/20 rounded-2xl px-4 py-3 flex-row items-center gap-3">
        <Ionicons name="star" size={20} color="#d97706" />
        <View className="flex-1">
          <Text className="text-xs font-sans-semibold text-brand-700 dark:text-brand-300">
            Earn & spend points
          </Text>
          <Text className="text-[11px] font-sans text-brand-600/70 dark:text-brand-400/70 mt-0.5">
            Free gifts cost nothing. Premium gifts use points earned through activity or purchased.
          </Text>
        </View>
        <Pressable onPress={() => router.push("/points/buy" as any)}>
          <Text className="text-xs font-sans-bold text-brand-700">Buy</Text>
        </Pressable>
      </View>

      {/* Gift grid */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A2D7A" />
          <Text className="text-sm font-sans text-gray-400 mt-3">Loading gifts...</Text>
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
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          keyExtractor={(item: any) => item.id}
          renderItem={renderGiftItem}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-8">
              <Text style={{ fontSize: 48 }}>{"\u{1F381}"}</Text>
              <Text className="text-lg font-sans-bold text-gray-400 mt-4">
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
                  className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-2.5"
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
