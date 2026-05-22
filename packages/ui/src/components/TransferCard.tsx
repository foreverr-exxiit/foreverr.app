import React from "react";
import { View, Text, TouchableOpacity, useColorScheme, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TransferCardProps {
  transferType: string;
  status: string;
  fromUser: { display_name: string; avatar_url: string | null };
  toUser: { display_name: string; avatar_url: string | null };
  pageTitle?: string;
  pageType?: string;
  priceCents?: number | null;
  createdAt: string;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: "#D97706", icon: "time-outline", label: "Pending" },
  negotiating: { color: "#2563EB", icon: "chatbubbles-outline", label: "Negotiating" },
  accepted: { color: "#059669", icon: "checkmark-circle-outline", label: "Accepted" },
  cooling_off: { color: "#7C3AED", icon: "hourglass-outline", label: "Cooling Off" },
  escrow_funded: { color: "#059669", icon: "lock-closed-outline", label: "Escrow Funded" },
  completed: { color: "#059669", icon: "checkmark-done-circle-outline", label: "Completed" },
  rejected: { color: "#DC2626", icon: "close-circle-outline", label: "Rejected" },
  cancelled: { color: "#6B7280", icon: "ban-outline", label: "Cancelled" },
  expired: { color: "#6B7280", icon: "timer-outline", label: "Expired" },
  disputed: { color: "#DC2626", icon: "warning-outline", label: "Disputed" },
  admin_review: { color: "#D97706", icon: "shield-outline", label: "Admin Review" },
};

const TYPE_LABELS: Record<string, string> = {
  voluntary: "Gift Transfer",
  request: "Transfer Request",
  claim_transfer: "Claim Transfer",
  stewardship: "Stewardship",
  purchase: "Purchase",
  inheritance: "Inheritance",
  reclamation: "Reclamation",
};

export function TransferCard({
  transferType,
  status,
  fromUser,
  toUser,
  pageTitle,
  pageType,
  priceCents,
  createdAt,
  onPress,
}: TransferCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const typeLabel = TYPE_LABELS[transferType] || transferType;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          borderColor: isDark ? "#374151" : "#e5e7eb",
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <Text style={[styles.typeLabel, { color: isDark ? "#e5e7eb" : "#111827" }]}>
            {typeLabel}
          </Text>
          {priceCents != null && priceCents > 0 && (
            <Text style={[styles.price, { color: "#059669" }]}>
              {formatPrice(priceCents)}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + "20" }]}>
          <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Page info */}
      {pageTitle && (
        <View style={styles.pageRow}>
          <Ionicons name="document-text-outline" size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text style={[styles.pageTitle, { color: isDark ? "#d1d5db" : "#4b5563" }]} numberOfLines={1}>
            {pageTitle}
          </Text>
          {pageType && (
            <Text style={[styles.pageType, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
              {pageType}
            </Text>
          )}
        </View>
      )}

      {/* Parties */}
      <View style={styles.partiesRow}>
        <View style={styles.party}>
          <Ionicons name="person-outline" size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text style={[styles.partyName, { color: isDark ? "#d1d5db" : "#374151" }]} numberOfLines={1}>
            {fromUser.display_name}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#7C3AED" />
        <View style={styles.party}>
          <Ionicons name="person-outline" size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text style={[styles.partyName, { color: isDark ? "#d1d5db" : "#374151" }]} numberOfLines={1}>
            {toUser.display_name}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={[styles.date, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
        {formatDate(createdAt)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  typeLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  pageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  pageTitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    flex: 1,
  },
  pageType: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textTransform: "capitalize",
  },
  partiesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  party: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  partyName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
});
