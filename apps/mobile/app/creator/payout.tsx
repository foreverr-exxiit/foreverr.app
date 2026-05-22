import { View, ScrollView, Pressable, Alert, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyCreatorProfile, useCreatorPayouts, useRequestPayout } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Processing", color: "text-amber-700", bg: "bg-amber-100" },
  processing: { label: "Processing", color: "text-blue-700", bg: "bg-blue-100" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-100" },
  failed: { label: "Failed", color: "text-red-700", bg: "bg-red-100" },
};

export default function CreatorPayoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useMyCreatorProfile(user?.id);
  const { data: payouts, isLoading } = useCreatorPayouts(profile?.id);
  const requestPayout = useRequestPayout();

  const availableBalance = profile?.pending_balance_cents ?? 0;
  const canPayout = availableBalance >= 1000; // $10 minimum

  const handleRequestPayout = () => {
    if (!profile?.id) return;
    if (!canPayout) {
      const msg = "Minimum payout amount is $10.00. Keep earning!";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Minimum Not Met", msg);
      return;
    }
    if (!profile.stripe_onboarding_complete) {
      const msg = "You need to connect your bank account first. Stripe Connect setup will be available soon!";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Connect Bank", msg);
      return;
    }

    const confirmMsg = `Request payout of ${formatCents(availableBalance)} to your connected bank account?`;
    if (Platform.OS === "web") {
      if (window.confirm(confirmMsg)) {
        requestPayout.mutate({ creator_id: profile.id, amount_cents: availableBalance });
      }
    } else {
      Alert.alert("Confirm Payout", confirmMsg, [
        { text: "Cancel", style: "cancel" },
        { text: "Request Payout", onPress: () => requestPayout.mutate({ creator_id: profile.id, amount_cents: availableBalance }) },
      ]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Balance card */}
      <View className="bg-white dark:bg-gray-800 px-4 py-6">
        <Text className="text-sm font-sans text-gray-500 mb-1">Available Balance</Text>
        <Text className="text-3xl font-sans-bold text-gray-900 dark:text-white">
          {formatCents(availableBalance)}
        </Text>
        <Text className="text-xs font-sans text-gray-400 mt-1">
          Minimum payout: $10.00
        </Text>

        <Pressable
          className={`mt-5 rounded-xl py-4 items-center ${canPayout ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"}`}
          onPress={handleRequestPayout}
          disabled={!canPayout || requestPayout.isPending}
        >
          {requestPayout.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="cash-outline" size={18} color={canPayout ? "#ffffff" : "#9ca3af"} />
              <Text className={`text-base font-sans-bold ${canPayout ? "text-white" : "text-gray-400"}`}>
                Request Payout
              </Text>
            </View>
          )}
        </Pressable>

        {!profile?.stripe_onboarding_complete && (
          <View className="mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 flex-row items-start gap-2">
            <Ionicons name="warning-outline" size={16} color="#d97706" />
            <Text className="text-xs font-sans text-amber-700 dark:text-amber-400 flex-1">
              Stripe Connect setup required for payouts. This feature is coming soon — your earnings are safely tracked.
            </Text>
          </View>
        )}
      </View>

      {/* How payouts work */}
      <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">How Payouts Work</Text>
        {[
          { icon: "time-outline", text: "Earnings clear after a 7-day hold period" },
          { icon: "cash-outline", text: "Minimum payout amount is $10.00" },
          { icon: "card-outline", text: "Payouts go to your connected Stripe account" },
          { icon: "calendar-outline", text: "Processing takes 2-5 business days" },
        ].map((item, i) => (
          <View key={i} className="flex-row items-center gap-3 mb-2.5">
            <View className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-900/30 items-center justify-center">
              <Ionicons name={item.icon as any} size={14} color="#4A2D7A" />
            </View>
            <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 flex-1">{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Payout History */}
      <View className="mx-4 mt-4">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Payout History</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#4A2D7A" />
        ) : !payouts || payouts.length === 0 ? (
          <View className="items-center py-8 bg-white dark:bg-gray-800 rounded-2xl">
            <Ionicons name="wallet-outline" size={32} color="#d1d5db" />
            <Text className="text-xs font-sans text-gray-400 mt-2">No payouts yet</Text>
          </View>
        ) : (
          <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
            {payouts.map((payout: any) => {
              const status = STATUS_STYLES[payout.status] ?? STATUS_STYLES.pending;
              return (
                <View key={payout.id} className="flex-row items-center px-4 py-3.5 border-b border-gray-50 dark:border-gray-700">
                  <View className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/20 items-center justify-center mr-3">
                    <Ionicons name="arrow-up-outline" size={18} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                      {formatCents(payout.amount_cents)}
                    </Text>
                    <Text className="text-[10px] font-sans text-gray-400">
                      {formatDate(payout.requested_at)}
                    </Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full ${status.bg}`}>
                    <Text className={`text-[10px] font-sans-bold ${status.color}`}>{status.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
