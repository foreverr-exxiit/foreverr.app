import React, { useState, useCallback } from "react";
import { View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  useMyPointBalance,
  useAwardPoints,
} from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

// ── Point Packs ─────────────────────────────────────────────
const POINT_PACKS = [
  {
    id: "pack-50",
    points: 50,
    price: "$0.99",
    priceCents: 99,
    label: "Starter",
    icon: "\u2B50",
    popular: false,
    bestValue: false,
  },
  {
    id: "pack-200",
    points: 200,
    price: "$2.99",
    priceCents: 299,
    label: "Popular",
    icon: "\u{1F31F}",
    popular: true,
    bestValue: false,
  },
  {
    id: "pack-500",
    points: 500,
    price: "$5.99",
    priceCents: 599,
    label: "Value",
    icon: "\u{1F4AB}",
    popular: false,
    bestValue: false,
  },
  {
    id: "pack-1500",
    points: 1500,
    price: "$14.99",
    priceCents: 1499,
    label: "Best Value",
    icon: "\u{1F451}",
    popular: false,
    bestValue: true,
  },
];

// ── Ways to Earn ────────────────────────────────────────────
const EARN_METHODS = [
  { action: "Daily login", points: 5, icon: "calendar-outline" as const },
  { action: "Write a tribute", points: 20, icon: "create-outline" as const },
  { action: "Send a gift", points: 10, icon: "gift-outline" as const },
  { action: "Share content", points: 5, icon: "share-social-outline" as const },
  { action: "Invite a friend", points: 25, icon: "person-add-outline" as const },
  { action: "Create a memorial", points: 50, icon: "heart-outline" as const },
];

export default function BuyPointsScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();
  const { data: pointBalance } = useMyPointBalance(user?.id);
  const currentPoints = (pointBalance as any)?.current_balance ?? 0;
  const awardPointsMutation = useAwardPoints();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = async (pack: (typeof POINT_PACKS)[0]) => {
    if (!user?.id) {
      Alert.alert("Sign In Required", "Please sign in to purchase points.");
      return;
    }

    setPurchasingId(pack.id);

    try {
      // In production, this would use RevenueCat for real payment
      // For now, simulate purchase + award points
      Alert.alert(
        "Purchase Points",
        `Buy ${pack.points} points for ${pack.price}?\n\nIn production, this opens the native payment sheet via RevenueCat.`,
        [
          { text: "Cancel", style: "cancel", onPress: () => setPurchasingId(null) },
          {
            text: "Buy",
            onPress: async () => {
              try {
                await awardPointsMutation.mutateAsync({
                  user_id: user.id,
                  points: pack.points,
                  action_type: "points_purchase",
                  reference_id: pack.id,
                  description: `Purchased ${pack.points} points pack`,
                });

                Alert.alert(
                  "Purchase Successful! \u{1F389}",
                  `You received ${pack.points} points!\n\nYour new balance: ${currentPoints + pack.points} points.`
                );
              } catch (err: any) {
                Alert.alert("Purchase Failed", err?.message ?? "Please try again.");
              } finally {
                setPurchasingId(null);
              }
            },
          },
        ]
      );
    } catch {
      setPurchasingId(null);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-5 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Get Points
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Use points to send premium gifts
            </Text>
          </View>
        </View>

        {/* Current Balance Card */}
        <View className="bg-gradient-to-r bg-brand-700 rounded-2xl px-5 py-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-sans text-white/70">Your Balance</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Ionicons name="star" size={22} color="#fbbf24" />
              <Text className="text-3xl font-sans-bold text-white">
                {currentPoints.toLocaleString()}
              </Text>
            </View>
            <Text className="text-xs font-sans text-white/60 mt-1">Core Points</Text>
          </View>
          <Pressable
            onPress={() => router.push("/points" as any)}
            className="bg-white/20 rounded-full px-4 py-2"
          >
            <Text className="text-xs font-sans-semibold text-white">View History</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Point Packs */}
        <View className="px-4 mt-5">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Point Packs
          </Text>

          {POINT_PACKS.map((pack) => {
            const isPurchasing = purchasingId === pack.id;
            const perPoint = (pack.priceCents / pack.points).toFixed(1);

            return (
              <Pressable
                key={pack.id}
                onPress={() => handlePurchase(pack)}
                disabled={isPurchasing}
                className={`flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 mb-3 border-2 ${
                  pack.popular
                    ? "border-brand-500 dark:border-brand-400"
                    : pack.bestValue
                    ? "border-amber-400 dark:border-amber-500"
                    : "border-gray-100 dark:border-gray-700"
                }`}
                style={{
                  shadowColor: pack.popular ? "#7C3AED" : "#000",
                  shadowOffset: { width: 0, height: pack.popular ? 2 : 1 },
                  shadowOpacity: pack.popular ? 0.15 : 0.05,
                  shadowRadius: pack.popular ? 8 : 3,
                  elevation: pack.popular ? 4 : 2,
                }}
              >
                {/* Icon */}
                <View
                  className={`h-12 w-12 rounded-xl items-center justify-center mr-3 ${
                    pack.popular
                      ? "bg-brand-50 dark:bg-brand-900/20"
                      : pack.bestValue
                      ? "bg-amber-50 dark:bg-amber-900/20"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <Text style={{ fontSize: 24 }}>{pack.icon}</Text>
                </View>

                {/* Details */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                      {pack.points.toLocaleString()} Points
                    </Text>
                    {pack.popular && (
                      <View className="bg-brand-100 dark:bg-brand-900/30 rounded-full px-2 py-0.5">
                        <Text className="text-[10px] font-sans-bold text-brand-700 dark:text-brand-400">
                          POPULAR
                        </Text>
                      </View>
                    )}
                    {pack.bestValue && (
                      <View className="bg-amber-100 dark:bg-amber-900/30 rounded-full px-2 py-0.5">
                        <Text className="text-[10px] font-sans-bold text-amber-700 dark:text-amber-400">
                          BEST VALUE
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-0.5">
                    {perPoint}{"\u00A2"} per point
                  </Text>
                </View>

                {/* Price */}
                <View className="items-end">
                  {isPurchasing ? (
                    <ActivityIndicator size="small" color="#4A2D7A" />
                  ) : (
                    <View
                      className={`rounded-full px-4 py-2 ${
                        pack.popular
                          ? "bg-brand-700"
                          : pack.bestValue
                          ? "bg-amber-500"
                          : "bg-gray-900 dark:bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-sm font-sans-bold ${
                          pack.popular || pack.bestValue
                            ? "text-white"
                            : "text-white dark:text-gray-900"
                        }`}
                      >
                        {pack.price}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Or Earn Points for Free */}
        <View className="px-4 mt-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="sparkles" size={20} color="#7C3AED" />
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              Or Earn Points Free
            </Text>
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {EARN_METHODS.map((method, index) => (
              <View
                key={method.action}
                className={`flex-row items-center px-4 py-3.5 ${
                  index < EARN_METHODS.length - 1
                    ? "border-b border-gray-50 dark:border-gray-700/50"
                    : ""
                }`}
              >
                <View className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/20 items-center justify-center mr-3">
                  <Ionicons name={method.icon} size={16} color="#22c55e" />
                </View>
                <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300">
                  {method.action}
                </Text>
                <View className="bg-green-50 dark:bg-green-900/20 rounded-full px-2.5 py-1">
                  <Text className="text-xs font-sans-bold text-green-600 dark:text-green-400">
                    +{method.points}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* View Full Points Dashboard */}
        <View className="px-4 mt-5">
          <Pressable
            onPress={() => router.push("/points" as any)}
            className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl px-5 py-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="bar-chart-outline" size={20} color="#7C3AED" />
              <View>
                <Text className="text-sm font-sans-semibold text-brand-700 dark:text-brand-300">
                  View Points Dashboard
                </Text>
                <Text className="text-xs font-sans text-brand-600/70 dark:text-brand-400/70 mt-0.5">
                  See your history, levels & leaderboard
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
