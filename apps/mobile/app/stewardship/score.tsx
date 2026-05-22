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
import { useMyStewardshipScore, useStewardshipLeaderboard } from "@foreverr/core";

const TIER_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  newcomer: { color: "#6b7280", icon: "person-outline", label: "Newcomer" },
  bronze: { color: "#b45309", icon: "shield-outline", label: "Bronze Steward" },
  silver: { color: "#6b7280", icon: "shield-half-outline", label: "Silver Steward" },
  gold: { color: "#eab308", icon: "shield-checkmark-outline", label: "Gold Steward" },
  platinum: { color: "#7C3AED", icon: "diamond-outline", label: "Platinum Steward" },
  legend: { color: "#4A2D7A", icon: "trophy-outline", label: "Legendary Steward" },
};

const SCORE_METRICS = [
  { key: "pages_managed", label: "Pages Managed", icon: "documents-outline", maxScore: 20 },
  { key: "smooth_transfers", label: "Smooth Transfers", icon: "checkmark-done-outline", maxScore: 30 },
  { key: "disputed_transfers", label: "Disputed Transfers", icon: "warning-outline", maxScore: -20, isNegative: true },
  { key: "page_growth_score", label: "Page Growth", icon: "trending-up-outline", maxScore: 30 },
  { key: "avg_response_hours", label: "Avg Response Time", icon: "speedometer-outline", maxScore: 20, isTime: true },
];

export default function StewardshipScoreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { data: score, isLoading } = useMyStewardshipScore();
  const { data: leaderboard, isLoading: loadingLeaderboard } = useStewardshipLeaderboard();

  const tier = score?.tier ?? "newcomer";
  const tierConfig = TIER_CONFIG[tier] ?? TIER_CONFIG.newcomer;
  const totalScore = score?.total_score ?? 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#FFFFFF", borderBottomColor: isDark ? "#1f2937" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stewardship Score</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Score Hero */}
          <View style={[styles.heroCard, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <View style={[styles.tierBadge, { backgroundColor: tierConfig.color + "20" }]}>
              <Ionicons name={tierConfig.icon as any} size={32} color={tierConfig.color} />
            </View>
            <Text style={[styles.tierLabel, { color: tierConfig.color }]}>{tierConfig.label}</Text>
            <Text style={[styles.scoreHero, { color: isDark ? "#f9fafb" : "#111827" }]}>{totalScore}</Text>
            <Text style={[styles.scoreSubtext, { color: isDark ? "#6b7280" : "#9ca3af" }]}>Total Score</Text>
          </View>

          {/* Score Breakdown */}
          <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Score Breakdown</Text>
            {SCORE_METRICS.map((metric) => {
              const value = (score as any)?.[metric.key] ?? 0;
              const displayValue = metric.isTime ? `${value}h` : value;
              const progress = metric.isNegative
                ? Math.max(0, 1 - Math.abs(value) / Math.abs(metric.maxScore))
                : metric.isTime
                ? Math.max(0, 1 - value / 48)
                : Math.min(1, value / metric.maxScore);

              return (
                <View key={metric.key} style={styles.metricRow}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricLabelRow}>
                      <Ionicons name={metric.icon as any} size={16} color="#7C3AED" />
                      <Text style={[styles.metricLabel, { color: isDark ? "#d1d5db" : "#374151" }]}>
                        {metric.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: metric.isNegative && value > 0 ? "#ef4444" : isDark ? "#f9fafb" : "#111827" },
                      ]}
                    >
                      {displayValue}
                    </Text>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: isDark ? "#374151" : "#e5e7eb" }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, progress * 100)}%`,
                          backgroundColor: metric.isNegative ? "#ef4444" : "#7C3AED",
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Leaderboard */}
          <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Leaderboard</Text>
            {loadingLeaderboard ? (
              <ActivityIndicator color="#7C3AED" style={{ marginVertical: 16 }} />
            ) : !leaderboard || (leaderboard as any[]).length === 0 ? (
              <Text style={[styles.emptyText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                No leaderboard data yet
              </Text>
            ) : (
              (leaderboard as any[]).slice(0, 10).map((entry: any, index: number) => {
                const entryTier = TIER_CONFIG[entry.tier] ?? TIER_CONFIG.newcomer;
                return (
                  <View
                    key={entry.user_id ?? index}
                    style={[styles.leaderRow, { borderBottomColor: isDark ? "#374151" : "#f3f4f6" }]}
                  >
                    <Text
                      style={[
                        styles.rank,
                        {
                          color: index < 3 ? "#eab308" : isDark ? "#6b7280" : "#9ca3af",
                          fontFamily: index < 3 ? "Inter_700Bold" : "Inter_500Medium",
                        },
                      ]}
                    >
                      #{index + 1}
                    </Text>
                    <View style={styles.leaderInfo}>
                      <Text style={[styles.leaderName, { color: isDark ? "#f9fafb" : "#111827" }]}>
                        {entry.display_name ?? `User ${entry.user_id?.substring(0, 6)}`}
                      </Text>
                      <Text style={[styles.leaderTier, { color: entryTier.color }]}>{entryTier.label}</Text>
                    </View>
                    <Text style={[styles.leaderScore, { color: "#7C3AED" }]}>{entry.total_score ?? 0}</Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
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
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#111827" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  heroCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 16,
    marginBottom: 16,
  },
  tierBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tierLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 4 },
  scoreHero: { fontFamily: "Inter_700Bold", fontSize: 48 },
  scoreSubtext: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 16 },
  metricRow: { marginBottom: 16 },
  metricHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  metricLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metricLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  metricValue: { fontFamily: "Inter_700Bold", fontSize: 14 },
  progressBg: { height: 6, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", paddingVertical: 16 },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  rank: { width: 28, fontSize: 14, textAlign: "center" },
  leaderInfo: { flex: 1 },
  leaderName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  leaderTier: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  leaderScore: { fontFamily: "Inter_700Bold", fontSize: 15 },
});
