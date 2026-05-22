import { View, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  usePremium,
  useBillingHistory,
  useCancelSubscription,
  useRestoreSubscription,
  useRevenueCat,
} from "@foreverr/core";
import { Text, EternLogo, PaywallModal } from "@foreverr/ui";
import { useState, useCallback } from "react";

// ── Plan tier config ────────────────────────────────────────

const TIER_CONFIG: Record<number, { name: string; icon: string; color: string; bgColor: string }> = {
  0: { name: "Free", icon: "heart", color: "#6B7280", bgColor: "#F3F4F6" },
  1: { name: "Premium", icon: "diamond", color: "#7C3AED", bgColor: "#F5F3FF" },
  2: { name: "Elite", icon: "star", color: "#D97706", bgColor: "#FFFBEB" },
};

export default function BillingScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/profile" as any);
  }, [router]);
  const { isAuthenticated } = useAuth();
  const {
    tier,
    isPremium,
    isElite,
    isFree,
    currentPlan,
    subscription,
    isActive,
    isTrialing,
    isCancelling,
    renewsAt,
    plans,
  } = usePremium();
  const { data: billingHistory } = useBillingHistory();
  const cancelSubscription = useCancelSubscription();
  const restoreSubscription = useRestoreSubscription();
  const { purchase, restore, isPurchasing, isRestoring } = useRevenueCat();

  const [showPaywall, setShowPaywall] = useState(false);

  const tierConfig = TIER_CONFIG[tier] ?? TIER_CONFIG[0];

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const handleSelectPlan = async (planSlug: string, billingPeriod: "monthly" | "annual") => {
    const plan = plans.find((p) => p.slug === planSlug);
    if (!plan) return;

    const result = await purchase(plan, billingPeriod);
    if (result.success) {
      setShowPaywall(false);
      Alert.alert("Welcome!", `You're now a ${plan.name} member! 🎉`);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Subscription",
      "Your subscription will remain active until the end of the current billing period. Are you sure?",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelSubscription.mutateAsync();
              Alert.alert("Subscription Cancelled", "Your subscription will end at the current period end.");
            } catch {
              Alert.alert("Error", "Failed to cancel subscription. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleRestore = async () => {
    try {
      await restoreSubscription.mutateAsync();
      Alert.alert("Restored", "Your subscription has been restored.");
    } catch {
      // Fallback to RevenueCat restore
      await restore();
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={goBack} className="h-10 w-10 items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View className="items-center">
            <EternLogo width={960} variant="full" />
          </View>
          <View className="w-10" />
        </View>
        <Text className="text-white text-center text-lg font-sans-bold">Subscription & Billing</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ── Current Plan Card ── */}
        <View className="mx-4 mt-5 rounded-2xl border-2 overflow-hidden" style={{ borderColor: tierConfig.color }}>
          <View className="p-5" style={{ backgroundColor: tierConfig.bgColor }}>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View
                  className="h-10 w-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${tierConfig.color}20` }}
                >
                  <Ionicons name={tierConfig.icon as any} size={20} color={tierConfig.color} />
                </View>
                <View>
                  <Text className="text-base font-sans-bold text-gray-900">{tierConfig.name}</Text>
                  {isTrialing && (
                    <Text className="text-xs font-sans text-green-600">Free Trial Active</Text>
                  )}
                  {isCancelling && (
                    <Text className="text-xs font-sans text-orange-600">Cancelling at period end</Text>
                  )}
                </View>
              </View>
              {!isFree && (
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${tierConfig.color}20` }}>
                  <Text className="text-xs font-sans-bold" style={{ color: tierConfig.color }}>
                    Active
                  </Text>
                </View>
              )}
            </View>

            {/* Plan Details */}
            {currentPlan && !isFree && (
              <View className="bg-white/70 dark:bg-gray-800/30 rounded-xl p-3 mb-3">
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-xs font-sans text-gray-500">Billing</Text>
                  <Text className="text-xs font-sans-semibold text-gray-700">
                    {subscription?.billing_period === "annual" ? "Annual" : "Monthly"}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-xs font-sans text-gray-500">Price</Text>
                  <Text className="text-xs font-sans-semibold text-gray-700">
                    {subscription?.billing_period === "annual"
                      ? formatAmount(currentPlan.annual_price_cents)
                      : formatAmount(currentPlan.price_cents)}
                    /{subscription?.billing_period === "annual" ? "year" : "month"}
                  </Text>
                </View>
                {renewsAt && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-sans text-gray-500">
                      {isCancelling ? "Expires" : "Renews"}
                    </Text>
                    <Text className="text-xs font-sans-semibold text-gray-700">
                      {formatDate(renewsAt)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons */}
            {isFree ? (
              <Pressable
                className="rounded-xl bg-brand-700 py-3.5 items-center"
                onPress={handleUpgrade}
              >
                <View className="flex-row items-center">
                  <Ionicons name="diamond" size={18} color="white" />
                  <Text className="ml-2 text-sm font-sans-bold text-white">Upgrade to Premium</Text>
                </View>
              </Pressable>
            ) : isPremium && !isElite ? (
              <View className="flex-row gap-3">
                <Pressable
                  className="flex-1 rounded-xl py-3 items-center"
                  style={{ backgroundColor: `${TIER_CONFIG[2].color}20` }}
                  onPress={handleUpgrade}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color={TIER_CONFIG[2].color} />
                    <Text className="ml-1.5 text-xs font-sans-bold" style={{ color: TIER_CONFIG[2].color }}>
                      Upgrade to Elite
                    </Text>
                  </View>
                </Pressable>
                {!isCancelling && (
                  <Pressable
                    className="rounded-xl px-4 py-3 items-center bg-gray-100"
                    onPress={handleCancel}
                  >
                    <Text className="text-xs font-sans-medium text-gray-500">Cancel</Text>
                  </Pressable>
                )}
              </View>
            ) : !isFree && !isCancelling ? (
              <Pressable
                className="rounded-xl bg-gray-100 py-3 items-center"
                onPress={handleCancel}
              >
                <Text className="text-xs font-sans-medium text-gray-500">Cancel Subscription</Text>
              </Pressable>
            ) : null}

            {isCancelling && (
              <Pressable
                className="rounded-xl bg-brand-700 py-3.5 items-center mt-2"
                onPress={handleRestore}
              >
                <Text className="text-sm font-sans-bold text-white">Restore Subscription</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Premium Perks Summary ── */}
        {!isFree && (
          <View className="mx-4 mt-5">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">Your Perks</Text>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              {[
                { icon: "diamond", label: `${isPremium ? "Premium" : "Elite"} card templates`, color: "#7C3AED" },
                { icon: "sparkles", label: "AI voice, photo & video", color: "#2563EB" },
                { icon: "gift", label: `${isElite ? "Physical & digital" : "Premium digital"} gifts`, color: "#EC4899" },
                { icon: "infinite", label: "Unlimited vault & tributes", color: "#059669" },
                { icon: "flash", label: `${isElite ? "2x" : "1.5x"} Core Points`, color: "#D97706" },
                ...(isElite ? [{ icon: "people", label: "Family plan (5 members)", color: "#4F46E5" }] : []),
              ].map((perk, i) => (
                <View key={i} className="flex-row items-center mb-2.5 last:mb-0">
                  <Ionicons name={perk.icon as any} size={16} color={perk.color} />
                  <Text className="ml-2.5 text-xs font-sans text-gray-700 dark:text-gray-300">
                    {perk.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Quick Actions ── */}
        <View className="mx-4 mt-5">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">Quick Actions</Text>

          <Pressable
            className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-2"
            onPress={() => restore()}
          >
            <Ionicons name="refresh" size={20} color="#4A2D7A" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                Restore Purchases
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                Recover previous subscriptions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          <Pressable
            className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-2"
            onPress={handleUpgrade}
          >
            <Ionicons name="pricetags" size={20} color="#4A2D7A" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                Compare Plans
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                See what each plan offers
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          {isAuthenticated && (
            <Pressable
              className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
              onPress={() => router.push("/invite" as any)}
            >
              <Ionicons name="person-add" size={20} color="#4A2D7A" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                  Invite & Earn
                </Text>
                <Text className="text-xs font-sans text-gray-500">
                  Earn free months by inviting friends
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* ── Billing History ── */}
        <View className="mx-4 mt-5">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">Billing History</Text>

          {(!billingHistory || billingHistory.length === 0) ? (
            <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 items-center">
              <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
              <Text className="text-sm font-sans text-gray-500 mt-2">No billing history yet</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1 text-center">
                Your payment receipts will appear here
              </Text>
            </View>
          ) : (
            <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
              {billingHistory.map((entry, i) => (
                <View
                  key={entry.id}
                  className={`flex-row items-center p-4 ${
                    i < billingHistory.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""
                  }`}
                >
                  <View
                    className={`h-8 w-8 rounded-full items-center justify-center mr-3 ${
                      entry.status === "completed"
                        ? "bg-green-100"
                        : entry.status === "refunded"
                        ? "bg-orange-100"
                        : "bg-red-100"
                    }`}
                  >
                    <Ionicons
                      name={
                        entry.status === "completed"
                          ? "checkmark"
                          : entry.status === "refunded"
                          ? "return-down-back"
                          : "close"
                      }
                      size={14}
                      color={
                        entry.status === "completed"
                          ? "#059669"
                          : entry.status === "refunded"
                          ? "#D97706"
                          : "#DC2626"
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">
                      {entry.description ?? "Subscription payment"}
                    </Text>
                    <Text className="text-[10px] font-sans text-gray-400">
                      {formatDate(entry.created_at)}
                    </Text>
                  </View>
                  <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                    {formatAmount(entry.amount_cents)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Help ── */}
        <View className="mx-4 mt-5 bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="help-circle" size={20} color="#4A2D7A" />
            <Text className="ml-2 text-sm font-sans-bold text-gray-900 dark:text-white">
              Need Help?
            </Text>
          </View>
          <Text className="text-xs font-sans text-gray-500">
            Having billing issues? Contact support@eterrn.app and we'll help you out within 24 hours.
          </Text>
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSelectPlan={handleSelectPlan}
        onRestorePurchase={() => restore()}
        currentTier={tier}
        isLoading={isPurchasing}
      />
    </View>
  );
}
