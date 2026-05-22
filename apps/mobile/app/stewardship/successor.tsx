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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSetSuccessor } from "@foreverr/core";

const TRIGGER_TYPES = [
  { value: "manual", label: "Manual", description: "Transfer only when you initiate it", icon: "hand-left-outline" },
  { value: "inactivity_90d", label: "90-Day Inactivity", description: "Auto-transfer after 90 days of no activity", icon: "hourglass-outline" },
  { value: "inactivity_180d", label: "180-Day Inactivity", description: "Auto-transfer after 180 days of no activity", icon: "time-outline" },
  { value: "date_triggered", label: "Specific Date", description: "Transfer on a chosen future date", icon: "calendar-outline" },
];

export default function SuccessorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { mutate: setSuccessor, isPending } = useSetSuccessor();

  const [pageId, setPageId] = useState("");
  const [successorEmail, setSuccessorEmail] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [triggerDate, setTriggerDate] = useState("");

  const handleSave = () => {
    if (!pageId.trim()) {
      Alert.alert("Required", "Please enter a page ID.");
      return;
    }
    if (!successorEmail.trim()) {
      Alert.alert("Required", "Please enter the successor's email or user ID.");
      return;
    }
    if (triggerType === "date_triggered" && !triggerDate.trim()) {
      Alert.alert("Required", "Please enter a trigger date.");
      return;
    }

    setSuccessor(
      {
        pageId: pageId.trim(),
        successorEmail: successorEmail.trim(),
        triggerType,
        triggerDate: triggerType === "date_triggered" ? triggerDate.trim() : null,
      } as any,
      {
        onSuccess: () => {
          Alert.alert("Successor Designated", "Your successor has been saved.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.message ?? "Failed to designate successor.");
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
        <Text style={styles.headerTitle}>Designate Successor</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: "#7C3AED10" }]}>
          <Ionicons name="information-circle-outline" size={20} color="#7C3AED" />
          <Text style={[styles.infoText, { color: "#4A2D7A" }]}>
            A successor is the person who will take over stewardship of your page if the trigger conditions are met.
          </Text>
        </View>

        {/* Page */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Select Page</Text>
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

        {/* Successor */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Successor</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                color: isDark ? "#f9fafb" : "#111827",
                borderColor: isDark ? "#374151" : "#d1d5db",
              },
            ]}
            placeholder="Email or user ID of successor"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={successorEmail}
            onChangeText={setSuccessorEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Trigger Type */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Transfer Trigger</Text>
          {TRIGGER_TYPES.map((trigger) => (
            <TouchableOpacity
              key={trigger.value}
              style={[
                styles.triggerCard,
                {
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  borderColor: triggerType === trigger.value ? "#7C3AED" : isDark ? "#374151" : "#e5e7eb",
                  borderWidth: triggerType === trigger.value ? 2 : 1,
                },
              ]}
              onPress={() => setTriggerType(trigger.value)}
            >
              <View style={styles.triggerRow}>
                <Ionicons
                  name={trigger.icon as any}
                  size={20}
                  color={triggerType === trigger.value ? "#7C3AED" : isDark ? "#9ca3af" : "#6b7280"}
                />
                <View style={styles.triggerInfo}>
                  <Text
                    style={[
                      styles.triggerLabel,
                      { color: triggerType === trigger.value ? "#7C3AED" : isDark ? "#f9fafb" : "#111827" },
                    ]}
                  >
                    {trigger.label}
                  </Text>
                  <Text style={[styles.triggerDesc, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                    {trigger.description}
                  </Text>
                </View>
                {triggerType === trigger.value && (
                  <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Picker (if date_triggered) */}
        {triggerType === "date_triggered" && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}>Trigger Date</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  color: isDark ? "#f9fafb" : "#111827",
                  borderColor: isDark ? "#374151" : "#d1d5db",
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={triggerDate}
              onChangeText={setTriggerDate}
            />
          </View>
        )}

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isPending}>
          {isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Successor</Text>
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
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 18 },
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
  triggerCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  triggerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  triggerInfo: { flex: 1 },
  triggerLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  triggerDesc: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  saveBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#ffffff" },
});
