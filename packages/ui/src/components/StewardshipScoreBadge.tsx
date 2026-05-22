import React from "react";
import { View, Text, useColorScheme, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StewardshipScoreBadgeProps {
  score: number;
  tier: string;
  compact?: boolean;
}

const TIER_CONFIG: Record<string, { color: string; icon: string; label: string; minScore: number; nextScore: number }> = {
  newcomer: { color: "#6B7280", icon: "person-outline", label: "Newcomer", minScore: 0, nextScore: 100 },
  reliable: { color: "#2563EB", icon: "person-circle-outline", label: "Reliable", minScore: 100, nextScore: 500 },
  dedicated: { color: "#7C3AED", icon: "shield-checkmark-outline", label: "Dedicated", minScore: 500, nextScore: 2000 },
  exemplary: { color: "#D97706", icon: "star-outline", label: "Exemplary", minScore: 2000, nextScore: 5000 },
  legendary: { color: "#EC4899", icon: "trophy-outline", label: "Legendary", minScore: 5000, nextScore: 10000 },
};

export function StewardshipScoreBadge({ score, tier, compact = false }: StewardshipScoreBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const config = TIER_CONFIG[tier] || TIER_CONFIG.newcomer;

  const progress = Math.min(
    1,
    (score - config.minScore) / (config.nextScore - config.minScore)
  );

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: config.color + "20" }]}>
        <Ionicons name={config.icon as any} size={12} color={config.color} />
        <Text style={[styles.compactText, { color: config.color }]}>{score}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: isDark ? "#1f2937" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}>
      <View style={styles.topRow}>
        <View style={[styles.tierIcon, { backgroundColor: config.color + "20" }]}>
          <Ionicons name={config.icon as any} size={20} color={config.color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.tierLabel, { color: config.color }]}>{config.label}</Text>
          <Text style={[styles.scoreText, { color: isDark ? "#d1d5db" : "#374151" }]}>
            {score.toLocaleString()} pts
          </Text>
        </View>
      </View>
      {tier !== "legendary" && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBg, { backgroundColor: isDark ? "#374151" : "#e5e7eb" }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: config.color }]} />
          </View>
          <Text style={[styles.nextTierText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
            {config.nextScore - score} pts to next tier
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tierIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  tierLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  scoreText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  nextTierText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 4,
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
