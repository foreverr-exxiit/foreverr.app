import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const MOCK_METRICS = [
  { label: "Total Views", value: "2,847", change: "+12%", icon: "eye-outline", up: true },
  { label: "Unique Visitors", value: "1,234", change: "+8%", icon: "people-outline", up: true },
  { label: "Tributes", value: "156", change: "+5", icon: "heart-outline", up: true },
  { label: "Shares", value: "89", change: "+23%", icon: "share-outline", up: true },
  { label: "Avg. Time on Page", value: "3m 42s", change: "-8%", icon: "time-outline", up: false },
  { label: "Bounce Rate", value: "24%", change: "-2%", icon: "exit-outline", up: true },
];

const MOCK_CHART_DATA = [
  { label: "Mon", value: 65 },
  { label: "Tue", value: 82 },
  { label: "Wed", value: 45 },
  { label: "Thu", value: 93 },
  { label: "Fri", value: 71 },
  { label: "Sat", value: 120 },
  { label: "Sun", value: 98 },
];

const MOCK_TRAFFIC_SOURCES = [
  { source: "Direct", percent: 42, color: "#7C3AED" },
  { source: "Search", percent: 28, color: "#3b82f6" },
  { source: "Social", percent: 18, color: "#10b981" },
  { source: "Referral", percent: 12, color: "#f59e0b" },
];

export default function PageAnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const maxChartValue = Math.max(...MOCK_CHART_DATA.map((d) => d.value));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#FFFFFF", borderBottomColor: isDark ? "#1f2937" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Page Analytics</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Guardian Pro Badge */}
        <View style={[styles.proBanner, { backgroundColor: "#4A2D7A" }]}>
          <Ionicons name="diamond-outline" size={18} color="#ffffff" />
          <Text style={styles.proBannerText}>Guardian Pro analytics for page {id?.substring(0, 8) ?? "..."}</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {MOCK_METRICS.map((metric, i) => (
            <View
              key={i}
              style={[styles.metricCard, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}
            >
              <View style={styles.metricHeader}>
                <Ionicons name={metric.icon as any} size={16} color="#7C3AED" />
                <Text
                  style={[
                    styles.metricChange,
                    { color: metric.up ? "#10b981" : "#ef4444" },
                  ]}
                >
                  {metric.change}
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
                {metric.value}
              </Text>
              <Text style={[styles.metricLabel, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                {metric.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Weekly Visitors Chart */}
        <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
          <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>
            Weekly Visitors
          </Text>
          <View style={styles.chart}>
            {MOCK_CHART_DATA.map((day, i) => {
              const barHeight = maxChartValue > 0 ? (day.value / maxChartValue) * 120 : 0;
              return (
                <View key={i} style={styles.chartCol}>
                  <Text style={[styles.chartValue, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
                    {day.value}
                  </Text>
                  <View style={[styles.chartBarBg, { backgroundColor: isDark ? "#374151" : "#e5e7eb" }]}>
                    <View
                      style={[
                        styles.chartBarFill,
                        { height: barHeight, backgroundColor: "#7C3AED" },
                      ]}
                    />
                  </View>
                  <Text style={[styles.chartLabel, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Traffic Sources */}
        <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
          <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>
            Traffic Sources
          </Text>
          {MOCK_TRAFFIC_SOURCES.map((source, i) => (
            <View key={i} style={styles.sourceRow}>
              <View style={styles.sourceInfo}>
                <View style={[styles.sourceDot, { backgroundColor: source.color }]} />
                <Text style={[styles.sourceLabel, { color: isDark ? "#d1d5db" : "#374151" }]}>
                  {source.source}
                </Text>
              </View>
              <View style={styles.sourceBarWrap}>
                <View style={[styles.sourceBarBg, { backgroundColor: isDark ? "#374151" : "#e5e7eb" }]}>
                  <View
                    style={[styles.sourceBarFill, { width: `${source.percent}%`, backgroundColor: source.color }]}
                  />
                </View>
                <Text style={[styles.sourcePercent, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
                  {source.percent}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Engagement Trends */}
        <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
          <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>
            Engagement Trends
          </Text>
          {[
            { label: "Most active day", value: "Saturday", icon: "calendar-outline" },
            { label: "Peak hour", value: "7:00 PM - 9:00 PM", icon: "time-outline" },
            { label: "Top referrer", value: "Facebook", icon: "globe-outline" },
            { label: "Return visitors", value: "34%", icon: "refresh-outline" },
          ].map((trend, i) => (
            <View key={i} style={[styles.trendRow, { borderBottomColor: isDark ? "#374151" : "#f3f4f6" }]}>
              <Ionicons name={trend.icon as any} size={16} color="#7C3AED" />
              <Text style={[styles.trendLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>{trend.label}</Text>
              <Text style={[styles.trendValue, { color: isDark ? "#f9fafb" : "#111827" }]}>{trend.value}</Text>
            </View>
          ))}
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
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#111827" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  proBannerText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#ffffff" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  metricCard: { width: "48%", padding: 14, borderRadius: 12 },
  metricHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  metricChange: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  metricValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  metricLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 16 },
  chart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  chartCol: { alignItems: "center", flex: 1 },
  chartValue: { fontFamily: "Inter_400Regular", fontSize: 10, marginBottom: 4 },
  chartBarBg: { width: 20, height: 120, borderRadius: 10, justifyContent: "flex-end", overflow: "hidden" },
  chartBarFill: { width: 20, borderRadius: 10 },
  chartLabel: { fontFamily: "Inter_500Medium", fontSize: 10, marginTop: 6 },
  sourceRow: { marginBottom: 14 },
  sourceInfo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  sourceDot: { width: 8, height: 8, borderRadius: 4 },
  sourceLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  sourceBarWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  sourceBarBg: { flex: 1, height: 6, borderRadius: 3 },
  sourceBarFill: { height: 6, borderRadius: 3 },
  sourcePercent: { fontFamily: "Inter_600SemiBold", fontSize: 12, width: 36, textAlign: "right" },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  trendLabel: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  trendValue: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
