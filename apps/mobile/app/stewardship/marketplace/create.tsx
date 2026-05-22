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
import { useCreateStewardshipListing } from "@foreverr/core";

const DURATION_OPTIONS = [
  { value: "30_days", label: "30 Days" },
  { value: "90_days", label: "90 Days" },
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
  { value: "ongoing", label: "Ongoing" },
];

const COMPENSATION_TYPES = [
  { value: "volunteer", label: "Volunteer", icon: "heart-outline", description: "No compensation" },
  { value: "stipend", label: "Stipend", icon: "cash-outline", description: "Monthly payment" },
  { value: "one_time", label: "One-Time", icon: "card-outline", description: "Single payment" },
  { value: "legacy_points", label: "Core Points", icon: "star-outline", description: "Points reward" },
];

export default function CreateListingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { mutate: createListing, isPending } = useCreateStewardshipListing();

  const [pageId, setPageId] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("ongoing");
  const [compensationType, setCompensationType] = useState("volunteer");
  const [compensationAmount, setCompensationAmount] = useState("");
  const [requirements, setRequirements] = useState("");

  const handleCreate = () => {
    if (!pageId.trim()) {
      Alert.alert("Required", "Please enter a page ID.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a listing title.");
      return;
    }

    createListing(
      {
        pageId: pageId.trim(),
        title: title.trim(),
        duration,
        compensationType,
        compensationAmount: compensationAmount ? parseInt(compensationAmount, 10) : 0,
        requirements: requirements.trim(),
      } as any,
      {
        onSuccess: () => {
          Alert.alert("Listing Created", "Your stewardship listing is now live.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.message ?? "Failed to create listing.");
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
        <Text style={styles.headerTitle}>Create Listing</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Listing Title</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                color: isDark ? "#f9fafb" : "#111827",
                borderColor: isDark ? "#374151" : "#d1d5db",
              },
            ]}
            placeholder="e.g., Seeking caretaker for family memorial"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Page ID */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Page</Text>
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

        {/* Duration */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Duration</Text>
          <View style={styles.chipRow}>
            {DURATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: duration === opt.value ? "#7C3AED" : isDark ? "#1f2937" : "#ffffff",
                    borderColor: duration === opt.value ? "#7C3AED" : isDark ? "#374151" : "#d1d5db",
                  },
                ]}
                onPress={() => setDuration(opt.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: duration === opt.value ? "#ffffff" : isDark ? "#d1d5db" : "#374151" },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Compensation Type */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Compensation</Text>
          {COMPENSATION_TYPES.map((comp) => (
            <TouchableOpacity
              key={comp.value}
              style={[
                styles.compCard,
                {
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  borderColor: compensationType === comp.value ? "#7C3AED" : isDark ? "#374151" : "#e5e7eb",
                  borderWidth: compensationType === comp.value ? 2 : 1,
                },
              ]}
              onPress={() => setCompensationType(comp.value)}
            >
              <Ionicons
                name={comp.icon as any}
                size={18}
                color={compensationType === comp.value ? "#7C3AED" : isDark ? "#9ca3af" : "#6b7280"}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.compLabel,
                    { color: compensationType === comp.value ? "#7C3AED" : isDark ? "#f9fafb" : "#111827" },
                  ]}
                >
                  {comp.label}
                </Text>
                <Text style={[styles.compDesc, { color: isDark ? "#6b7280" : "#9ca3af" }]}>{comp.description}</Text>
              </View>
              {compensationType === comp.value && (
                <Ionicons name="checkmark-circle" size={18} color="#7C3AED" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount (if paid) */}
        {(compensationType === "stipend" || compensationType === "one_time") && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>
              {compensationType === "stipend" ? "Monthly Amount (USD)" : "Payment Amount (USD)"}
            </Text>
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
              value={compensationAmount}
              onChangeText={setCompensationAmount}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Requirements */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Requirements</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                color: isDark ? "#f9fafb" : "#111827",
                borderColor: isDark ? "#374151" : "#d1d5db",
              },
            ]}
            placeholder="Describe what you expect from a steward (e.g., update frequency, content moderation, family involvement)"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={requirements}
            onChangeText={setRequirements}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={isPending}>
          {isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Create Listing</Text>
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
    minHeight: 100,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  compCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  compLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  compDesc: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  submitBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#ffffff" },
});
