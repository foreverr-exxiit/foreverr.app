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
import { usePageValuation } from "@foreverr/core";

const VALUATION_COLORS: Record<string, string> = {
  tribute_value: "#7C3AED",
  engagement_value: "#3b82f6",
  age_value: "#10b981",
  media_value: "#f59e0b",
  inactivity_discount: "#ef4444",
};

const VALUATION_ICONS: Record<string, string> = {
  tribute_value: "heart-outline",
  engagement_value: "trending-up-outline",
  age_value: "time-outline",
  media_value: "images-outline",
  inactivity_discount: "remove-circle-outline",
};

const VALUATION_LABELS: Record<string, string> = {
  tribute_value: "Tribute Value",
  engagement_value: "Engagement Value",
  age_value: "Age Value",
  media_value: "Media & Content",
  inactivity_discount: "Inactivity Discount",
};

export default function ValuationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { data: valuation, isLoading } = usePageValuation();

  const breakdown = valuation?.breakdown ?? {
    tribute_value: 45,
    engagement_value: 30,
    age_value: 15,
    media_value: 20,
    inactivity_discount: -5,
  };

  const breakdownValues = Object.values(breakdown) as number[];
  const totalScore =
    valuation?.total_score ??
    breakdownValues.reduce((sum, v) => sum + v, 0);
  const maxComponent = Math.max(...breakdownValues.map((v) => Math.abs(v)));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#FFFFFF", borderBottomColor: isDark ? "#1f2937" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Page Valuation</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Total Score */}
          <View style={[styles.scoreCard, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <Text style={[styles.scoreLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Total Valuation Score</Text>
            <Text style={[styles.scoreValue, { color: "#7C3AED" }]}>{totalScore}</Text>
            <Text style={[styles.scoreSubtext, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
              Based on tributes, engagement, age, and content
            </Text>
          </View>

          {/* Breakdown */}
          <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Breakdown</Text>
            {Object.entries(breakdown).map(([key, value]) => {
              const absValue = Math.abs(value as number);
              const barWidth = maxComponent > 0 ? (absValue / maxComponent) * 100 : 0;
              const isNegative = (value as number) < 0;
              const color = VALUATION_COLORS[key] ?? "#7C3AED";

              return (
                <View key={key} style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <View style={styles.breakdownLabelRow}>
                      <Ionicons name={(VALUATION_ICONS[key] ?? "ellipse") as any} size={16} color={color} />
                      <Text style={[styles.breakdownLabel, { color: isDark ? "#d1d5db" : "#374151" }]}>
                        {VALUATION_LABELS[key] ?? key}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.breakdownValue,
                        { color: isNegative ? "#ef4444" : isDark ? "#f9fafb" : "#111827" },
                      ]}
                    >
                      {isNegative ? "-" : "+"}{absValue}
                    </Text>
                  </View>
                  <View style={[styles.barBg, { backgroundColor: isDark ? "#374151" : "#e5e7eb" }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${barWidth}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Valuation Tips */}
          <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Improve Your Score</Text>
            {[
              { tip: "Add more photos and videos to the gallery", icon: "camera-outline" },
              { tip: "Encourage tributes from family and friends", icon: "heart-outline" },
              { tip: "Keep the page active with regular updates", icon: "refresh-outline" },
              { tip: "Complete the biography and timeline sections", icon: "document-text-outline" },
            ].map((item, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name={item.icon as any} size={18} color="#7C3AED" />
                <Text style={[styles.tipText, { color: isDark ? "#d1d5db" : "#374151" }]}>{item.tip}</Text>
              </View>
            ))}
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
  scoreCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  scoreLabel: { fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 4 },
  scoreValue: { fontFamily: "Inter_700Bold", fontSize: 48 },
  scoreSubtext: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4, textAlign: "center" },
  card: { padding: 16, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 16 },
  breakdownItem: { marginBottom: 16 },
  breakdownHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  breakdownLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  breakdownLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  breakdownValue: { fontFamily: "Inter_700Bold", fontSize: 14 },
  barBg: { height: 8, borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
});
