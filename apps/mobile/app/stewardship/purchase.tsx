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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUpdateTransferStatus } from "@foreverr/core";

const PLATFORM_FEE_PERCENT = 15;

export default function PurchaseScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const params = useLocalSearchParams<{ transferId?: string; priceCents?: string }>();

  const { mutate: updateStatus, isPending } = useUpdateTransferStatus();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const transferId = params.transferId ?? "";
  const priceCents = parseInt(params.priceCents ?? "0", 10);
  const priceUsd = priceCents / 100;
  const platformFee = (priceCents * PLATFORM_FEE_PERCENT) / 10000;
  const sellerReceives = priceUsd - platformFee;

  const handleFundEscrow = () => {
    if (!termsAccepted) {
      Alert.alert("Terms Required", "Please accept the terms before proceeding.");
      return;
    }
    if (!transferId) {
      Alert.alert("Error", "No transfer ID provided.");
      return;
    }

    updateStatus(
      { transferId, status: "escrow_funded" } as any,
      {
        onSuccess: () => {
          Alert.alert("Escrow Funded", "Your payment has been placed in escrow. The transfer will proceed after the cooling-off period.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.message ?? "Failed to fund escrow.");
        },
      }
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
        <Text style={styles.headerTitle}>Purchase</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Payment Summary */}
        <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
          <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Payment Summary</Text>

          <View style={styles.lineItem}>
            <Text style={[styles.lineLabel, { color: isDark ? "#d1d5db" : "#374151" }]}>Page Price</Text>
            <Text style={[styles.lineValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
              ${priceUsd.toFixed(2)}
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={[styles.lineLabel, { color: isDark ? "#d1d5db" : "#374151" }]}>
              Platform Fee ({PLATFORM_FEE_PERCENT}%)
            </Text>
            <Text style={[styles.lineValue, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
              ${platformFee.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? "#374151" : "#e5e7eb" }]} />

          <View style={styles.lineItem}>
            <Text style={[styles.totalLabel, { color: isDark ? "#f9fafb" : "#111827" }]}>Total</Text>
            <Text style={[styles.totalValue, { color: "#7C3AED" }]}>${priceUsd.toFixed(2)}</Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={[styles.lineLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Seller Receives</Text>
            <Text style={[styles.lineValue, { color: "#10b981" }]}>${sellerReceives.toFixed(2)}</Text>
          </View>
        </View>

        {/* Escrow Info */}
        <View style={[styles.infoCard, { backgroundColor: "#3b82f610" }]}>
          <Ionicons name="lock-closed-outline" size={20} color="#3b82f6" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: "#3b82f6" }]}>Escrow Protection</Text>
            <Text style={[styles.infoText, { color: isDark ? "#93c5fd" : "#1d4ed8" }]}>
              Funds are held in escrow until the transfer is completed. A 72-hour cooling-off period applies after escrow is funded. You can cancel within this period for a full refund.
            </Text>
          </View>
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={[styles.termsRow, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}
          onPress={() => setTermsAccepted(!termsAccepted)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={termsAccepted ? "checkbox" : "square-outline"}
            size={22}
            color={termsAccepted ? "#7C3AED" : isDark ? "#6b7280" : "#9ca3af"}
          />
          <Text style={[styles.termsText, { color: isDark ? "#d1d5db" : "#374151" }]}>
            I agree to the stewardship transfer terms and understand the escrow process, including the 72-hour cooling-off period.
          </Text>
        </TouchableOpacity>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, { opacity: termsAccepted ? 1 : 0.5 }]}
          onPress={handleFundEscrow}
          disabled={!termsAccepted || isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#ffffff" />
              <Text style={styles.ctaBtnText}>Fund Escrow - ${priceUsd.toFixed(2)}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={isDark ? "#6b7280" : "#9ca3af"} />
          <Text style={[styles.securityText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
            Payments are secured and processed safely
          </Text>
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
  card: { padding: 16, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 16 },
  lineItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  lineLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  lineValue: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  divider: { height: 1, marginVertical: 8 },
  totalLabel: { fontFamily: "Inter_700Bold", fontSize: 16 },
  totalValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  infoTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 4 },
  infoText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  termsText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 18 },
  ctaBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#ffffff" },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  securityText: { fontFamily: "Inter_400Regular", fontSize: 11 },
});
