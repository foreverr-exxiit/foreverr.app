import React from "react";
import { View, Text, useColorScheme, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ValuationBadgeProps {
  valueTier: string;
  totalValueCents?: number;
  compact?: boolean;
}

const TIER_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  basic: { color: "#6B7280", icon: "leaf-outline", label: "Basic" },
  bronze: { color: "#B45309", icon: "shield-outline", label: "Bronze" },
  silver: { color: "#64748B", icon: "shield-half-outline", label: "Silver" },
  gold: { color: "#D97706", icon: "shield-checkmark-outline", label: "Gold" },
  platinum: { color: "#7C3AED", icon: "diamond-outline", label: "Platinum" },
  priceless: { color: "#EC4899", icon: "heart-circle-outline", label: "Priceless" },
};

export function ValuationBadge({ valueTier, totalValueCents, compact = false }: ValuationBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const config = TIER_CONFIG[valueTier] || TIER_CONFIG.basic;

  const formatValue = (cents: number) => {
    if (cents >= 100000) return `$${(cents / 100).toFixed(0)}`;
    if (cents >= 10000) return `$${(cents / 100).toFixed(0)}`;
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: config.color + "20" }]}>
        <Ionicons name={config.icon as any} size={12} color={config.color} />
        <Text style={[styles.compactText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: isDark ? "#1f2937" : "#ffffff", borderColor: config.color + "40" }]}>
      <View style={[styles.tierIcon, { backgroundColor: config.color + "20" }]}>
        <Ionicons name={config.icon as any} size={20} color={config.color} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.tierLabel, { color: config.color }]}>{config.label}</Text>
        {totalValueCents != null && totalValueCents > 0 && (
          <Text style={[styles.value, { color: isDark ? "#d1d5db" : "#374151" }]}>
            Est. {formatValue(totalValueCents)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  tierLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  value: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  compactText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
});
