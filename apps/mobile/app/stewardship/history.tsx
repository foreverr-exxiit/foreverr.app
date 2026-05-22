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
import { useTransferHistory } from "@foreverr/core";

const ACTION_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  created: { icon: "add-circle-outline", color: "#3b82f6", label: "Page Created" },
  transferred: { icon: "swap-horizontal-outline", color: "#7C3AED", label: "Ownership Transferred" },
  purchased: { icon: "card-outline", color: "#10b981", label: "Page Purchased" },
  inherited: { icon: "people-outline", color: "#f59e0b", label: "Inherited" },
  claimed: { icon: "flag-outline", color: "#6366f1", label: "Claimed" },
  disputed: { icon: "warning-outline", color: "#ef4444", label: "Dispute Filed" },
  resolved: { icon: "checkmark-circle-outline", color: "#10b981", label: "Dispute Resolved" },
};

export default function TransferHistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { data: history, isLoading } = useTransferHistory();

  const entries = (history as any[]) ?? [
    {
      id: "1",
      action: "created",
      date: "2023-06-15T10:00:00Z",
      from_name: null,
      to_name: "John Doe",
      notes: "Page originally created",
    },
    {
      id: "2",
      action: "transferred",
      date: "2024-01-20T14:30:00Z",
      from_name: "John Doe",
      to_name: "Jane Smith",
      notes: "Family transfer - sibling",
    },
    {
      id: "3",
      action: "purchased",
      date: "2024-08-10T09:15:00Z",
      from_name: "Jane Smith",
      to_name: "Robert Lee",
      notes: "Sold for $250",
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#FFFFFF", borderBottomColor: isDark ? "#1f2937" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provenance Chain</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
            Complete ownership history for this page
          </Text>

          {entries.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
              <Ionicons name="time-outline" size={40} color={isDark ? "#4b5563" : "#9ca3af"} />
              <Text style={[styles.emptyText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                No transfer history yet
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {entries.map((entry: any, index: number) => {
                const config = ACTION_CONFIG[entry.action] ?? {
                  icon: "ellipse-outline",
                  color: "#6b7280",
                  label: entry.action,
                };
                const isLast = index === entries.length - 1;

                return (
                  <View key={entry.id ?? index} style={styles.timelineItem}>
                    {/* Left: Dot + Line */}
                    <View style={styles.timelineLeft}>
                      <View style={[styles.dot, { backgroundColor: config.color }]}>
                        <Ionicons name={config.icon as any} size={14} color="#ffffff" />
                      </View>
                      {!isLast && (
                        <View style={[styles.line, { backgroundColor: isDark ? "#374151" : "#d1d5db" }]} />
                      )}
                    </View>

                    {/* Right: Content */}
                    <View style={[styles.timelineContent, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
                      <Text style={[styles.actionLabel, { color: config.color }]}>{config.label}</Text>
                      <Text style={[styles.dateText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>

                      {entry.from_name && (
                        <View style={styles.partyRow}>
                          <Text style={[styles.partyLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>From:</Text>
                          <Text style={[styles.partyName, { color: isDark ? "#f9fafb" : "#111827" }]}>
                            {entry.from_name}
                          </Text>
                        </View>
                      )}
                      {entry.to_name && (
                        <View style={styles.partyRow}>
                          <Text style={[styles.partyLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>To:</Text>
                          <Text style={[styles.partyName, { color: isDark ? "#f9fafb" : "#111827" }]}>
                            {entry.to_name}
                          </Text>
                        </View>
                      )}

                      {entry.notes && (
                        <Text style={[styles.notes, { color: isDark ? "#9ca3af" : "#6b7280" }]}>{entry.notes}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 20 },
  emptyState: {
    alignItems: "center",
    padding: 32,
    borderRadius: 12,
    gap: 8,
  },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  timeline: { paddingLeft: 4 },
  timelineItem: { flexDirection: "row", marginBottom: 0 },
  timelineLeft: { alignItems: "center", width: 32, marginRight: 12 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { width: 2, flex: 1, marginVertical: 4 },
  timelineContent: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 4 },
  dateText: { fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 8 },
  partyRow: { flexDirection: "row", gap: 6, marginBottom: 2 },
  partyLabel: { fontFamily: "Inter_400Regular", fontSize: 12, width: 36 },
  partyName: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
  notes: { fontFamily: "Inter_400Regular", fontSize: 12, fontStyle: "italic", marginTop: 6 },
});
