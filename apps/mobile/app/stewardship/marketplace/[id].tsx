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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStewardshipListings } from "@foreverr/core";

export default function ListingDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: listings, isLoading } = useStewardshipListings();
  const listing = (listings as unknown as any[])?.find((l: any) => l.id === id) ?? null;

  const handleApply = () => {
    Alert.alert(
      "Apply for Stewardship",
      "Are you sure you want to apply for this stewardship role?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply",
          onPress: () => {
            Alert.alert("Application Submitted", "The page owner will review your application.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#FFFFFF", borderBottomColor: isDark ? "#1f2937" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listing Details</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 60 }} />
      ) : !listing ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={40} color={isDark ? "#4b5563" : "#9ca3af"} />
          <Text style={[styles.emptyText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
            Listing not found
          </Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Title Card */}
            <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
              <View style={[styles.iconWrap, { backgroundColor: "#4A2D7A20" }]}>
                <Ionicons name="shield-outline" size={28} color="#4A2D7A" />
              </View>
              <Text style={[styles.listingTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>
                {listing.title ?? "Stewardship Opportunity"}
              </Text>
              <Text style={[styles.listingSubtext, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                Posted {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : "recently"}
              </Text>
            </View>

            {/* Details */}
            <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
              <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Details</Text>

              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={18} color="#7C3AED" />
                <View style={styles.detailInfo}>
                  <Text style={[styles.detailLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Duration</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
                    {listing.duration ?? "Ongoing"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={18} color="#7C3AED" />
                <View style={styles.detailInfo}>
                  <Text style={[styles.detailLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Compensation</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
                    {listing.compensation_type ?? "Volunteer"}
                    {listing.compensation_amount ? ` - $${(listing.compensation_amount / 100).toFixed(2)}` : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={18} color="#7C3AED" />
                <View style={styles.detailInfo}>
                  <Text style={[styles.detailLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Applicants</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
                    {listing.applicants_count ?? 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* Requirements */}
            <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
              <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Requirements</Text>
              <Text style={[styles.requirementsText, { color: isDark ? "#d1d5db" : "#374151" }]}>
                {listing.requirements ?? "No specific requirements listed. The page owner is looking for a caring and responsible steward to maintain this memorial page."}
              </Text>
            </View>

            {/* Page Info */}
            <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
              <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Page Information</Text>
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={18} color="#7C3AED" />
                <View style={styles.detailInfo}>
                  <Text style={[styles.detailLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Page ID</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
                    {listing.page_id ?? "N/A"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewPageBtn}
                onPress={() => {
                  if (listing.page_id) {
                    router.push(`/stewardship/analytics/${listing.page_id}` as any);
                  }
                }}
              >
                <Text style={styles.viewPageText}>View Page Analytics</Text>
                <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={[styles.bottomBar, { backgroundColor: isDark ? "#1f2937" : "#ffffff", borderTopColor: isDark ? "#374151" : "#e5e7eb" }]}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply for Stewardship</Text>
            </TouchableOpacity>
          </View>
        </>
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
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16, alignItems: "center" },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  listingTitle: { fontFamily: "Inter_700Bold", fontSize: 18, textAlign: "center" },
  listingSubtext: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 12, alignSelf: "flex-start" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, width: "100%" },
  detailInfo: { flex: 1 },
  detailLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  detailValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginTop: 1 },
  requirementsText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, alignSelf: "flex-start" },
  viewPageBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  viewPageText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#7C3AED" },
  bottomBar: { padding: 16, borderTopWidth: 1 },
  applyBtn: { backgroundColor: "#7C3AED", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  applyBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#ffffff" },
});
