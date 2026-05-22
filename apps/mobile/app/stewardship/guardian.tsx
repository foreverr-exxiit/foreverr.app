import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGuardianSubscription, useUpgradeGuardian } from "@foreverr/core";

const TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    priceCents: 0,
    features: [
      { label: "Manage up to 3 pages", included: true },
      { label: "Basic transfer tools", included: true },
      { label: "Transfer history", included: true },
      { label: "Successor designation", included: false },
      { label: "Page valuation", included: false },
      { label: "Dispute mediation", included: false },
      { label: "Analytics dashboard", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: "$4.99/mo",
    priceCents: 499,
    popular: true,
    features: [
      { label: "Manage up to 15 pages", included: true },
      { label: "Basic transfer tools", included: true },
      { label: "Transfer history", included: true },
      { label: "Successor designation", included: true },
      { label: "Page valuation", included: true },
      { label: "Dispute mediation", included: false },
      { label: "Analytics dashboard", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$14.99/mo",
    priceCents: 1499,
    features: [
      { label: "Unlimited pages", included: true },
      { label: "Advanced transfer tools", included: true },
      { label: "Full provenance chain", included: true },
      { label: "Successor designation", included: true },
      { label: "Page valuation & insights", included: true },
      { label: "Dispute mediation", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

export default function GuardianScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { data: subscription } = useGuardianSubscription();
  const { mutate: upgrade, isPending } = useUpgradeGuardian();

  const currentTier = (subscription as any)?.tier ?? "basic";
  const [selectedTier, setSelectedTier] = useState(currentTier);

  const handleUpgrade = (tierId: string) => {
    if (tierId === currentTier) return;
    Alert.alert(
      "Upgrade Plan",
      `Switch to the ${TIERS.find((t) => t.id === tierId)?.name} plan?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () =>
            upgrade(
              { tier: tierId } as any,
              {
                onSuccess: () => Alert.alert("Success", "Plan updated successfully!"),
                onError: (err: any) => Alert.alert("Error", err?.message ?? "Failed to update plan."),
              }
            ),
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
        <Text style={styles.headerTitle}>Guardian Plan</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
          Protect and manage your memorial pages with a Guardian plan
        </Text>

        {TIERS.map((tier) => {
          const isCurrentTier = tier.id === currentTier;
          const isSelected = tier.id === selectedTier;

          return (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                {
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  borderColor: isSelected ? "#7C3AED" : isDark ? "#374151" : "#e5e7eb",
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedTier(tier.id)}
              activeOpacity={0.7}
            >
              {tier.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}

              <View style={styles.tierHeader}>
                <Text style={[styles.tierName, { color: isDark ? "#f9fafb" : "#111827" }]}>{tier.name}</Text>
                <Text style={[styles.tierPrice, { color: "#7C3AED" }]}>{tier.price}</Text>
              </View>

              {tier.features.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons
                    name={feature.included ? "checkmark-circle" : "close-circle-outline"}
                    size={16}
                    color={feature.included ? "#10b981" : isDark ? "#4b5563" : "#d1d5db"}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      {
                        color: feature.included
                          ? isDark
                            ? "#d1d5db"
                            : "#374151"
                          : isDark
                          ? "#4b5563"
                          : "#d1d5db",
                      },
                    ]}
                  >
                    {feature.label}
                  </Text>
                </View>
              ))}

              {isCurrentTier ? (
                <View style={[styles.currentBadge, { backgroundColor: "#10b98120" }]}>
                  <Text style={[styles.currentText, { color: "#10b981" }]}>Current Plan</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.upgradeBtn, { backgroundColor: tier.priceCents === 0 ? "#6b7280" : "#7C3AED" }]}
                  onPress={() => handleUpgrade(tier.id)}
                  disabled={isPending}
                >
                  {isPending && selectedTier === tier.id ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.upgradeBtnText}>
                      {tier.priceCents === 0 ? "Downgrade" : "Upgrade"}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
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
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 20, textAlign: "center" },
  tierCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  popularText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#ffffff" },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tierName: { fontFamily: "Inter_700Bold", fontSize: 20 },
  tierPrice: { fontFamily: "Inter_700Bold", fontSize: 18 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  featureText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  currentBadge: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  currentText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  upgradeBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  upgradeBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#ffffff" },
});
