import React, { useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  useFlowerWall,
  useGiftsReceived,
  useGiftLeaderboard,
  useSendGiftTransaction,
} from "@foreverr/core";
import {
  Text,
  FlowerWallDisplay,
  GiftTransactionCard,
  SendFlowersButton,
  GiveFlowersHero,
  GiftCatalogSheet,
} from "@foreverr/ui";

export default function FlowerWallScreen() {
  const router = useRouter();
  const { targetType, targetId } = useLocalSearchParams<{
    targetType: string;
    targetId: string;
  }>();
  const { user } = useAuth();
  const [catalogVisible, setCatalogVisible] = useState(false);

  const { data: flowerWall, isLoading: wallLoading } = useFlowerWall(targetType, targetId);
  const { data: giftsData, isLoading: giftsLoading } = useGiftsReceived(targetType, targetId);
  const { data: leaderboard, isLoading: leaderboardLoading } = useGiftLeaderboard(targetType, targetId);
  const sendGift = useSendGiftTransaction();

  const gifts = giftsData?.pages?.flatMap((p: any) => p.data) ?? [];
  const isLoading = wallLoading || giftsLoading || leaderboardLoading;

  const wall = flowerWall as any;

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white ml-2 flex-1">
            Flower Wall
          </Text>
          <Pressable
            onPress={() => setCatalogVisible(true)}
            className="bg-brand-700 rounded-full px-4 py-2 flex-row items-center"
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text className="text-xs font-sans-semibold text-white ml-1">Send Gift</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Flower Wall Display */}
        <FlowerWallDisplay
          totalFlowers={wall?.total_flowers ?? 0}
          totalCandles={wall?.total_candles ?? 0}
          totalGifts={wall?.total_gifts ?? 0}
          totalAmountCents={wall?.total_amount_cents ?? 0}
          onViewAll={() => {}}
        />

        {/* Give Flowers Hero + Button */}
        <View className="px-4 mt-6">
          <GiveFlowersHero
            recipientName="This Person"
            onSendFlowers={() => setCatalogVisible(true)}
          />
          <View className="mt-4">
            <SendFlowersButton
              targetType={(targetType as any) ?? "memorial"}
              targetId={targetId ?? ""}
              recipientName="This Person"
              onPress={() => setCatalogVisible(true)}
            />
          </View>
        </View>

        {/* Top Supporters */}
        {leaderboard && (leaderboard as any[]).length > 0 && (
          <View className="px-4 mt-8">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-4">
              Top Supporters
            </Text>
            {(leaderboard as any[]).map((supporter: any, index: number) => (
              <View
                key={supporter.sender_id ?? index}
                className="flex-row items-center py-3 border-b border-gray-50 dark:border-gray-800"
              >
                <View
                  className={`h-8 w-8 rounded-full items-center justify-center mr-3 ${
                    index === 0
                      ? "bg-amber-100"
                      : index === 1
                      ? "bg-gray-200"
                      : index === 2
                      ? "bg-orange-100"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Text
                    className={`text-xs font-sans-bold ${
                      index === 0
                        ? "text-amber-600"
                        : index === 1
                        ? "text-gray-500"
                        : index === 2
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </Text>
                </View>

                <View className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center overflow-hidden">
                  <Ionicons name="person" size={18} color="#4A2D7A" />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                    {supporter.display_name ?? "Anonymous"}
                  </Text>
                  <Text className="text-xs font-sans text-gray-500 mt-0.5">
                    {supporter.total_quantity ?? 0} gift{(supporter.total_quantity ?? 0) !== 1 ? "s" : ""} sent
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Gift History */}
        <View className="px-4 mt-8">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-4">
            Gift History
          </Text>
          {gifts.length > 0 ? (
            gifts.map((gift: any) => (
              <GiftTransactionCard
                key={gift.id}
                senderName={gift.sender?.display_name ?? "Anonymous"}
                senderAvatar={gift.sender?.avatar_url ?? null}
                giftName={gift.gift?.name ?? "Gift"}
                giftIcon={gift.gift?.icon ?? "gift"}
                message={gift.message}
                isAnonymous={gift.is_anonymous ?? false}
                amountCents={gift.amount_cents ?? 0}
                timestamp={gift.created_at}
              />
            ))
          ) : (
            <View className="items-center py-12 px-6">
              <View className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                <Ionicons name="flower-outline" size={32} color="#D1D5DB" />
              </View>
              <Text className="text-base font-sans-semibold text-gray-400 text-center">
                No gifts yet
              </Text>
              <Text className="text-sm font-sans text-gray-400 text-center mt-1">
                Be the first to send a gift and show your support.
              </Text>
              <Pressable
                onPress={() => setCatalogVisible(true)}
                className="mt-4 bg-brand-700 rounded-xl px-6 py-2.5"
              >
                <Text className="text-sm font-sans-semibold text-white">
                  Send the First Gift
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Gift Catalog Sheet */}
      <GiftCatalogSheet
        visible={catalogVisible}
        onClose={() => setCatalogVisible(false)}
        targetType={(targetType as any) ?? "memorial"}
        targetId={targetId ?? ""}
        recipientName="This Person"
        onGiftSent={(giftName) => {
          Alert.alert("Gift Sent!", `You sent a ${giftName}!`);
        }}
      />
    </View>
  );
}
