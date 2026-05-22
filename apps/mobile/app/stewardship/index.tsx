import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyTransfers, useMyStewardshipScore, usePendingTransfers } from "@foreverr/core";
import { TransferCard, StewardshipScoreBadge } from "@foreverr/ui";

export default function StewardshipDashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { user } = useAuth();

  const { data: myTransfers, isLoading: loadingTransfers } = useMyTransfers();
  const { data: stewardshipScore } = useMyStewardshipScore();
  const { data: pendingTransfers } = usePendingTransfers();

  const pendingCount = pendingTransfers?.length ?? 0;
  const activeTransfers = myTransfers?.filter(
    (t: any) => !["completed", "rejected", "cancelled", "expired"].includes(t.status)
  ) ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#FFFFFF", borderBottomColor: isDark ? "#1f2937" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stewardship</Text>
        <TouchableOpacity onPress={() => router.push("/stewardship/initiate" as any)}>
          <Ionicons name="add-circle-outline" size={24} color="#4A2D7A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stewardship Score */}
        {stewardshipScore && (
          <View style={styles.section}>
            <TouchableOpacity onPress={() => router.push("/stewardship/score" as any)}>
              <StewardshipScoreBadge
                score={stewardshipScore.total_score ?? 0}
                tier={stewardshipScore.tier ?? "newcomer"}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Pending Transfers Alert */}
        {pendingCount > 0 && (
          <TouchableOpacity
            style={[styles.alertBanner, { backgroundColor: "#7C3AED20" }]}
            onPress={() => router.push("/stewardship/initiate" as any)}
          >
            <Ionicons name="notifications-outline" size={20} color="#7C3AED" />
            <Text style={[styles.alertText, { color: "#7C3AED" }]}>
              {pendingCount} pending transfer{pendingCount > 1 ? "s" : ""} need your attention
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {[
              { icon: "swap-horizontal", label: "Initiate Transfer", route: "/stewardship/initiate" },
              { icon: "analytics-outline", label: "Page Valuation", route: "/stewardship/valuation" },
              { icon: "people-outline", label: "Designate Successor", route: "/stewardship/successor" },
              { icon: "time-outline", label: "Transfer History", route: "/stewardship/history" },
              { icon: "shield-checkmark-outline", label: "Guardian Plan", route: "/stewardship/guardian" },
              { icon: "storefront-outline", label: "Marketplace", route: "/stewardship/marketplace" },
            ].map((action) => (
              <TouchableOpacity
                key={action.route}
                style={[styles.quickAction, { backgroundColor: isDark ? "#1f2937" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "#4A2D7A20" }]}>
                  <Ionicons name={action.icon as any} size={20} color="#4A2D7A" />
                </View>
                <Text style={[styles.quickActionLabel, { color: isDark ? "#d1d5db" : "#374151" }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Transfers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>
            Active Transfers ({activeTransfers.length})
          </Text>
          {loadingTransfers ? (
            <ActivityIndicator color="#7C3AED" style={{ marginTop: 20 }} />
          ) : activeTransfers.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
              <Ionicons name="swap-horizontal-outline" size={40} color={isDark ? "#4b5563" : "#9ca3af"} />
              <Text style={[styles.emptyText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                No active transfers
              </Text>
            </View>
          ) : (
            activeTransfers.map((transfer: any) => (
              <TransferCard
                key={transfer.id}
                transferType={transfer.transfer_type}
                status={transfer.status}
                fromUser={{ display_name: transfer.from_user_id?.substring(0, 8) ?? "Unknown", avatar_url: null }}
                toUser={{ display_name: transfer.to_user_id?.substring(0, 8) ?? "Unknown", avatar_url: null }}
                priceCents={transfer.price_cents}
                createdAt={transfer.created_at}
                onPress={() => router.push(`/stewardship/transfer/${transfer.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#111827",
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 12,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  alertText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickAction: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    borderRadius: 12,
    gap: 8,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
});
