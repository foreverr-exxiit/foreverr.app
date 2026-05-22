import React, { useState, useCallback, useRef } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  useMemorial,
  useFlowerWall,
  useGiftsReceived,
  useGiftLeaderboard,
  useGiftCatalogItems,
  useSendGiftTransaction,
  useRecordGiftToWall,
  useMyPointBalance,
  useRedeemPoints,
  useAwardPoints,
  getGiftEmoji,
  BUILT_IN_GIFTS,
} from "@foreverr/core";
import {
  Text,
  FlowerWallDisplay,
  GiftTransactionCard,
  GiftCatalogSheet,
} from "@foreverr/ui";

export default function FlowerWallScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/gifts" as any);
  }, [router]);
  const { targetType, targetId } = useLocalSearchParams<{
    targetType: string;
    targetId: string;
  }>();
  const { user } = useAuth();
  const [catalogVisible, setCatalogVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const giftHistoryY = useRef(0);

  // Fetch memorial data for name & lifecycle stage
  const { data: memorial } = useMemorial(
    targetType === "memorial" ? targetId : undefined
  );
  const mem = memorial as any;
  const recipientName = mem
    ? `${mem.first_name ?? ""} ${mem.last_name ?? ""}`.trim() || "Memorial"
    : "Memorial";
  const lifecycleStage = mem?.lifecycle_stage ?? "memorial";
  const isCelebration = ["birth", "pre_birth", "living", "celebration"].includes(lifecycleStage);

  // Data hooks
  const { data: flowerWall, isLoading: wallLoading } = useFlowerWall(targetType, targetId);
  const { data: giftsData, isLoading: giftsLoading, fetchNextPage, hasNextPage } = useGiftsReceived(targetType, targetId);
  const { data: leaderboard, isLoading: leaderboardLoading } = useGiftLeaderboard(targetType, targetId);
  const { data: catalogItems, isLoading: catalogLoading } = useGiftCatalogItems();
  const sendGiftMutation = useSendGiftTransaction();
  const recordGiftToWallMutation = useRecordGiftToWall();

  // Points economy hooks
  const { data: pointBalance } = useMyPointBalance(user?.id);
  const currentPoints = (pointBalance as any)?.current_balance ?? 0;
  const redeemPointsMutation = useRedeemPoints();
  const awardPointsMutation = useAwardPoints();

  const gifts = giftsData?.pages?.flatMap((p: any) => p.data) ?? [];
  const recentGiftsForDisplay = gifts.slice(0, 5).map((g: any) => ({
    senderName: g.sender?.display_name ?? "Anonymous",
    giftName: g.gift?.name ?? "Gift",
    giftIcon: getGiftEmoji(g.gift?.icon),
    isAnonymous: g.is_anonymous ?? false,
  }));

  const isLoading = wallLoading || giftsLoading || leaderboardLoading;
  const wall = flowerWall as any;

  const handleSendGift = async (params: {
    giftId: string;
    giftName: string;
    message: string;
    isAnonymous: boolean;
    priceCents: number;
    pointCost: number;
    quantity: number;
  }) => {
    if (!user?.id) {
      throw new Error("Please sign in to send gifts.");
    }

    // Step 1: If gift costs points, try to redeem them
    if (params.pointCost > 0) {
      try {
        await redeemPointsMutation.mutateAsync({
          user_id: user.id,
          points_spent: params.pointCost,
          redemption_type: "gift_purchase",
          reference_id: params.giftId,
        });
      } catch {
        // Points table may not exist yet — continue gracefully
      }
    }

    // Step 2: Send the gift transaction
    // Built-in gifts (IDs starting with "builtin-") don't exist in DB,
    // so we skip the DB insert and treat it as a successful demo send.
    const isBuiltIn = params.giftId.startsWith("builtin-");
    if (!isBuiltIn) {
      try {
        await sendGiftMutation.mutateAsync({
          senderId: user.id,
          recipientType: (targetType as any) ?? "memorial",
          recipientId: targetId ?? "",
          giftId: params.giftId,
          quantity: params.quantity,
          message: params.message || undefined,
          isAnonymous: params.isAnonymous,
          amountCents: params.priceCents,
        });
      } catch (err: any) {
        // If the gift_transactions table doesn't exist, continue gracefully
        const msg = err?.message ?? "";
        if (msg.includes("relation") && msg.includes("does not exist")) {
          // Table not deployed yet — allow demo send
        } else {
          throw new Error("Could not record your gift. Please try again.");
        }
      }
    }
    // Step 2b: For built-in gifts, record to flower wall directly via RPC
    // (DB gifts are handled automatically by the gift_transactions trigger)
    if (isBuiltIn) {
      const builtInGift = BUILT_IN_GIFTS.find((g) => g.id === params.giftId);
      const category = builtInGift?.category ?? "cards";
      try {
        await recordGiftToWallMutation.mutateAsync({
          targetType: (targetType as string) ?? "memorial",
          targetId: targetId ?? "",
          category,
          quantity: params.quantity,
          amountCents: params.priceCents,
        });
      } catch {
        // Non-critical — RPC may not be deployed yet
      }
    }

    // Step 3: Award engagement points (fire-and-forget, don't block success)
    try {
      awardPointsMutation.mutate({
        user_id: user.id,
        points: 10,
        action_type: "send_gift",
        reference_id: params.giftId,
        description: `Sent ${params.giftName}`,
      });
    } catch {
      // Points award is non-critical — don't fail the gift send
    }

    // Success! The GiftCatalogSheet handles the confirmation UI.
  };

  const scrollToGiftHistory = useCallback(() => {
    scrollRef.current?.scrollTo({ y: giftHistoryY.current, animated: true });
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4A2D7A" />
        <Text className="text-sm font-sans text-gray-400 mt-3">Loading gift wall...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              {isCelebration ? "Celebration Wall" : "Gift Wall"}
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5" numberOfLines={1}>
              {isCelebration
                ? `Celebrate ${recipientName} with gifts & love`
                : `Send flowers, candles & gifts for ${recipientName}`}
            </Text>
          </View>
          {/* Points balance pill */}
          {user && (
            <Pressable
              onPress={() => router.push("/points/buy" as any)}
              className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 rounded-full px-3 py-1.5 mr-2"
            >
              <Ionicons name="star" size={14} color="#d97706" />
              <Text className="text-xs font-sans-bold text-amber-600 ml-1">
                {currentPoints}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setCatalogVisible(true)}
            className="bg-brand-700 rounded-full px-4 py-2.5 flex-row items-center gap-1.5"
            style={{
              shadowColor: "#4A2D7A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="gift" size={16} color="#FFFFFF" />
            <Text className="text-xs font-sans-bold text-white">Send Gift</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gift Wall Stats */}
        <View className="px-4 mt-4">
          <FlowerWallDisplay
            totalFlowers={wall?.total_flowers ?? 0}
            totalCandles={wall?.total_candles ?? 0}
            totalGifts={wall?.total_gifts ?? 0}
            totalAmountCents={wall?.total_amount_cents ?? 0}
            recentGifts={recentGiftsForDisplay}
            onViewAll={scrollToGiftHistory}
          />
        </View>

        {/* Quick Send — compact row of popular gift types */}
        <View className="px-4 mt-5">
          <Text className="text-xs font-sans-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 px-1">
            Quick Send
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(isCelebration
              ? [
                  { emoji: "\uD83C\uDF88", label: "Balloon", color: "#e8f5e9" },
                  { emoji: "\uD83C\uDF89", label: "Party", color: "#fff8e1" },
                  { emoji: "\uD83C\uDF82", label: "Cake", color: "#fce4ec" },
                  { emoji: "\uD83C\uDF81", label: "Gift", color: "#ede7f6" },
                  { emoji: "\uD83C\uDF3B", label: "Sunflower", color: "#fff8e1" },
                  { emoji: "\u2B50", label: "Star", color: "#fff8e1" },
                ]
              : [
                  { emoji: "\uD83C\uDF39", label: "Rose", color: "#fce4ec" },
                  { emoji: "\uD83D\uDD6F\uFE0F", label: "Candle", color: "#fff8e1" },
                  { emoji: "\uD83D\uDD4A\uFE0F", label: "Dove", color: "#e8f5e9" },
                  { emoji: "\uD83C\uDF38", label: "Blossom", color: "#fce4ec" },
                  { emoji: "\uD83C\uDF3B", label: "Sunflower", color: "#fff8e1" },
                  { emoji: "\uD83C\uDF81", label: "Gift", color: "#ede7f6" },
                ]
            ).map((item) => (
              <Pressable
                key={item.label}
                className="items-center mr-3"
                onPress={() => setCatalogVisible(true)}
              >
                <View
                  className="h-14 w-14 rounded-2xl items-center justify-center mb-1"
                  style={{ backgroundColor: item.color }}
                >
                  <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                </View>
                <Text className="text-[10px] font-sans-medium text-gray-500">{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Top Supporters */}
        {leaderboard && (leaderboard as any[]).length > 0 && (
          <View className="px-4 mt-8">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="trophy" size={20} color="#d97706" />
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                Top Supporters
              </Text>
            </View>
            <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {(leaderboard as any[]).map((supporter: any, index: number) => (
                <View
                  key={supporter.sender_id ?? index}
                  className={`flex-row items-center py-3.5 px-4 ${
                    index < (leaderboard as any[]).length - 1
                      ? "border-b border-gray-50 dark:border-gray-700/50"
                      : ""
                  }`}
                >
                  {/* Rank */}
                  <View
                    className={`h-8 w-8 rounded-full items-center justify-center mr-3 ${
                      index === 0
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : index === 1
                        ? "bg-gray-200 dark:bg-gray-700"
                        : index === 2
                        ? "bg-orange-100 dark:bg-orange-900/30"
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

                  {/* Avatar */}
                  <View className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center overflow-hidden">
                    <Ionicons name="person" size={18} color="#4A2D7A" />
                  </View>

                  {/* Name + Stats */}
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                      {supporter.sender?.display_name ?? supporter.sender?.username ?? "Anonymous"}
                    </Text>
                    <Text className="text-xs font-sans text-gray-500 mt-0.5">
                      {supporter.total_quantity ?? 0} gift
                      {(supporter.total_quantity ?? 0) !== 1 ? "s" : ""} sent
                    </Text>
                  </View>

                  {/* Count badge */}
                  <View className="bg-brand-50 dark:bg-brand-900/20 rounded-full px-2.5 py-1">
                    <Text className="text-xs font-sans-bold text-brand-700">
                      {supporter.total_quantity ?? 0}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Gift History */}
        <View
          className="px-4 mt-8"
          onLayout={(e) => { giftHistoryY.current = e.nativeEvent.layout.y; }}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="time-outline" size={20} color="#6b7280" />
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              Gift History
            </Text>
            {gifts.length > 0 && (
              <View className="bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 ml-auto">
                <Text className="text-xs font-sans-semibold text-gray-500">
                  {gifts.length}
                </Text>
              </View>
            )}
          </View>

          {gifts.length > 0 ? (
            <>
              {gifts.map((gift: any) => (
                <GiftTransactionCard
                  key={gift.id}
                  senderName={gift.sender?.display_name ?? gift.sender?.username ?? "Anonymous"}
                  senderAvatar={gift.sender?.avatar_url ?? null}
                  giftName={gift.gift?.name ?? "Gift"}
                  giftIcon={getGiftEmoji(gift.gift?.icon)}
                  message={gift.message}
                  isAnonymous={gift.is_anonymous ?? false}
                  amountCents={gift.amount_cents ?? 0}
                  timestamp={gift.created_at}
                  onReact={() => {
                    // Future: wire up useReactToGift
                  }}
                />
              ))}
              {hasNextPage && (
                <Pressable
                  onPress={() => fetchNextPage()}
                  className="items-center py-3 mt-2"
                >
                  <Text className="text-sm font-sans-semibold text-brand-700">
                    Load More
                  </Text>
                </Pressable>
              )}
            </>
          ) : (
            <View className="items-center py-12 px-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <View className="h-16 w-16 rounded-full bg-purple-50 dark:bg-purple-900/20 items-center justify-center mb-4">
                <Ionicons name="gift-outline" size={32} color="#7C3AED" />
              </View>
              <Text className="text-base font-sans-semibold text-gray-600 dark:text-gray-300 text-center">
                No gifts yet
              </Text>
              <Text className="text-sm font-sans text-gray-400 text-center mt-1">
                {isCelebration
                  ? `Be the first to celebrate ${recipientName}!`
                  : `Be the first to send a gift and show your support for ${recipientName}.`}
              </Text>
              <Pressable
                onPress={() => setCatalogVisible(true)}
                className="mt-4 bg-brand-700 rounded-full px-6 py-3 flex-row items-center gap-2"
              >
                <Ionicons name="gift" size={16} color="#FFFFFF" />
                <Text className="text-sm font-sans-bold text-white">
                  Send the First Gift
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Send Gift FAB */}
      <View className="absolute bottom-6 right-6">
        <Pressable
          className="h-14 w-14 rounded-full bg-brand-700 items-center justify-center shadow-lg"
          style={{
            shadowColor: "#4A2D7A",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={() => setCatalogVisible(true)}
        >
          <Ionicons name="gift" size={26} color="#ffffff" />
        </Pressable>
      </View>

      {/* Gift Catalog Sheet */}
      <GiftCatalogSheet
        visible={catalogVisible}
        onClose={() => setCatalogVisible(false)}
        targetType={(targetType as any) ?? "memorial"}
        targetId={targetId ?? ""}
        recipientName={recipientName}
        catalogItems={(catalogItems as any[]) ?? []}
        catalogLoading={catalogLoading}
        onSendGift={handleSendGift}
        isSending={sendGiftMutation.isPending || redeemPointsMutation.isPending}
        userPointBalance={currentPoints}
        onBuyPoints={() => router.push("/points/buy" as any)}
      />
    </View>
  );
}
