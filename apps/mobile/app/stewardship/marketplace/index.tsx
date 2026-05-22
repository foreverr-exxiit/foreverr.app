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
import { useStewardshipListings } from "@foreverr/core";

export default function StewardshipMarketplace() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { data: listings, isLoading } = useStewardshipListings();
  const items = (listings as unknown as any[]) ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#FFFFFF", borderBottomColor: isDark ? "#1f2937" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stewardship Market</Text>
        <TouchableOpacity onPress={() => router.push("/stewardship/marketplace/create" as any)}>
          <Ionicons name="add-circle-outline" size={24} color="#4A2D7A" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 60 }} />
      ) : items.length === 0 ? (
        <View style={styles.comingSoon}>
          <View style={[styles.comingSoonIcon, { backgroundColor: "#7C3AED10" }]}>
            <Ionicons name="storefront-outline" size={48} color="#7C3AED" />
          </View>
          <Text style={[styles.comingSoonTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>
            Stewardship Marketplace
          </Text>
          <Text style={[styles.comingSoonText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
            Find trusted stewards for memorial pages, or offer your services as a caretaker. This feature is coming soon.
          </Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push("/stewardship/marketplace/create" as any)}
          >
            <Ionicons name="add-outline" size={18} color="#ffffff" />
            <Text style={styles.createBtnText}>Create a Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {items.map((item: any, index: number) => (
            <TouchableOpacity
              key={item.id ?? index}
              style={[styles.listingCard, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}
              onPress={() => router.push(`/stewardship/marketplace/${item.id}` as any)}
            >
              <View style={styles.listingHeader}>
                <View style={[styles.listingIcon, { backgroundColor: "#4A2D7A20" }]}>
                  <Ionicons name="shield-outline" size={20} color="#4A2D7A" />
                </View>
                <View style={styles.listingInfo}>
                  <Text style={[styles.listingTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>
                    {item.title ?? "Stewardship Opportunity"}
                  </Text>
                  <Text style={[styles.listingSubtitle, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                    {item.duration ?? "Ongoing"} | {item.compensation_type ?? "Volunteer"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? "#6b7280" : "#9ca3af"} />
              </View>

              {item.requirements && (
                <Text
                  style={[styles.listingDesc, { color: isDark ? "#9ca3af" : "#6b7280" }]}
                  numberOfLines={2}
                >
                  {item.requirements}
                </Text>
              )}

              <View style={styles.listingMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={isDark ? "#6b7280" : "#9ca3af"} />
                  <Text style={[styles.metaText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently"}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color={isDark ? "#6b7280" : "#9ca3af"} />
                  <Text style={[styles.metaText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                    {item.applicants_count ?? 0} applicants
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  comingSoon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  comingSoonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  comingSoonTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  comingSoonText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  createBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#ffffff" },
  listingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  listingHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  listingIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  listingInfo: { flex: 1 },
  listingTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  listingSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  listingDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18, marginBottom: 8 },
  listingMeta: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 11 },
});
