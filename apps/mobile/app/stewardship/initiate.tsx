import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useInitiateTransfer, useAuth } from "@foreverr/core";

const TRANSFER_TYPES = [
  { value: "gift", label: "Gift", icon: "gift-outline", description: "Transfer ownership for free" },
  { value: "purchase", label: "Purchase", icon: "card-outline", description: "Sell to another steward" },
  { value: "inheritance", label: "Inheritance", icon: "people-outline", description: "Designate for future transfer" },
  { value: "stewardship", label: "Stewardship", icon: "shield-outline", description: "Temporary caretaker role" },
];

export default function InitiateTransferScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: initiateTransfer, isPending } = useInitiateTransfer();

  const [selectedType, setSelectedType] = useState<string>("gift");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [pageId, setPageId] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [relationship, setRelationship] = useState("");
  const [terms, setTerms] = useState("");

  const handleSubmit = () => {
    if (!pageId.trim()) {
      Alert.alert("Required", "Please enter a page ID to transfer.");
      return;
    }
    if (!recipientEmail.trim()) {
      Alert.alert("Required", "Please enter a recipient email or user ID.");
      return;
    }

    initiateTransfer(
      {
        pageId: pageId.trim(),
        transferType: selectedType,
        recipientEmail: recipientEmail.trim(),
        priceCents: selectedType === "purchase" ? parseInt(priceCents || "0", 10) : 0,
        relationship: relationship.trim(),
        terms: terms.trim(),
      } as any,
      {
        onSuccess: () => {
          Alert.alert("Success", "Transfer initiated successfully.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.message ?? "Failed to initiate transfer.");
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
        <Text style={styles.headerTitle}>Initiate Transfer</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Transfer Type */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Transfer Type</Text>
          <View style={styles.typeGrid}>
            {TRANSFER_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    borderColor: selectedType === type.value ? "#7C3AED" : isDark ? "#374151" : "#e5e7eb",
                    borderWidth: selectedType === type.value ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedType(type.value)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={22}
                  color={selectedType === type.value ? "#7C3AED" : isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    { color: selectedType === type.value ? "#7C3AED" : isDark ? "#f9fafb" : "#111827" },
                  ]}
                >
                  {type.label}
                </Text>
                <Text style={[styles.typeDesc, { color: isDark ? "#6b7280" : "#9ca3af" }]}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Page ID */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Page to Transfer</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                color: isDark ? "#f9fafb" : "#111827",
                borderColor: isDark ? "#374151" : "#d1d5db",
              },
            ]}
            placeholder="Enter memorial page ID"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={pageId}
            onChangeText={setPageId}
          />
        </View>

        {/* Recipient */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Recipient</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                color: isDark ? "#f9fafb" : "#111827",
                borderColor: isDark ? "#374151" : "#d1d5db",
              },
            ]}
            placeholder="Email or user ID of new steward"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={recipientEmail}
            onChangeText={setRecipientEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Price (purchase only) */}
        {selectedType === "purchase" && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Price (USD)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  color: isDark ? "#f9fafb" : "#111827",
                  borderColor: isDark ? "#374151" : "#d1d5db",
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={priceCents}
              onChangeText={setPriceCents}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Relationship */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Relationship to Person</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                color: isDark ? "#f9fafb" : "#111827",
                borderColor: isDark ? "#374151" : "#d1d5db",
              },
            ]}
            placeholder="Describe your relationship (e.g., sibling, family friend, genealogist)"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={relationship}
            onChangeText={setRelationship}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Terms */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Transfer Terms (Optional)</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                color: isDark ? "#f9fafb" : "#111827",
                borderColor: isDark ? "#374151" : "#d1d5db",
              },
            ]}
            placeholder="Any conditions or terms for this transfer..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={terms}
            onChangeText={setTerms}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isPending}>
          {isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Initiate Transfer</Text>
          )}
        </TouchableOpacity>
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
  fieldGroup: { marginBottom: 20 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 8 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeCard: {
    width: "48%",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
  },
  typeLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  typeDesc: { fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 80,
  },
  submitBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#ffffff" },
});
