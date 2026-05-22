import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  useColorScheme,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TransferNegotiationSheetProps {
  visible: boolean;
  onClose: () => void;
  transferType: string;
  fromUserName: string;
  pageTitle?: string;
  currentPriceCents?: number | null;
  onAccept: () => void;
  onReject: (reason: string) => void;
  onCounter: (priceCents: number, message: string) => void;
}

export function TransferNegotiationSheet({
  visible,
  onClose,
  transferType,
  fromUserName,
  pageTitle,
  currentPriceCents,
  onAccept,
  onReject,
  onCounter,
}: TransferNegotiationSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [mode, setMode] = useState<"main" | "reject" | "counter">("main");
  const [rejectReason, setRejectReason] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  const handleReject = () => {
    onReject(rejectReason);
    setRejectReason("");
    setMode("main");
  };

  const handleCounter = () => {
    const cents = Math.round(parseFloat(counterPrice) * 100);
    if (isNaN(cents) || cents <= 0) return;
    onCounter(cents, counterMessage);
    setCounterPrice("");
    setCounterMessage("");
    setMode("main");
  };

  const resetAndClose = () => {
    setMode("main");
    setRejectReason("");
    setCounterPrice("");
    setCounterMessage("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={resetAndClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheet, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
              {/* Handle */}
              <View style={[styles.handle, { backgroundColor: isDark ? "#4b5563" : "#d1d5db" }]} />

              {/* Header */}
              <Text style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>
                Transfer Request
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
                {fromUserName} wants to {transferType === "purchase" ? "purchase" : "receive"}{" "}
                {pageTitle ? `"${pageTitle}"` : "this page"}
              </Text>

              {currentPriceCents != null && currentPriceCents > 0 && (
                <View style={[styles.priceRow, { backgroundColor: isDark ? "#374151" : "#f3f4f6" }]}>
                  <Text style={[styles.priceLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
                    Offered Price
                  </Text>
                  <Text style={[styles.priceValue, { color: "#059669" }]}>
                    ${(currentPriceCents / 100).toFixed(2)}
                  </Text>
                </View>
              )}

              <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                {mode === "main" && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={onAccept}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                      <Text style={styles.acceptText}>Accept Transfer</Text>
                    </TouchableOpacity>

                    {transferType === "purchase" && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.counterButton]}
                        onPress={() => setMode("counter")}
                      >
                        <Ionicons name="swap-horizontal" size={20} color="#7C3AED" />
                        <Text style={[styles.counterText, { color: "#7C3AED" }]}>Counter Offer</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => setMode("reject")}
                    >
                      <Ionicons name="close-circle" size={20} color="#DC2626" />
                      <Text style={[styles.rejectText, { color: "#DC2626" }]}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {mode === "reject" && (
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: isDark ? "#d1d5db" : "#374151" }]}>
                      Reason for declining (optional)
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: isDark ? "#374151" : "#f9fafb",
                          color: isDark ? "#f9fafb" : "#111827",
                          borderColor: isDark ? "#4b5563" : "#d1d5db",
                        },
                      ]}
                      placeholder="Add a reason..."
                      placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                      value={rejectReason}
                      onChangeText={setRejectReason}
                      multiline
                      numberOfLines={3}
                    />
                    <View style={styles.formActions}>
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => setMode("main")}>
                        <Text style={[styles.cancelText, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: "#DC2626" }]} onPress={handleReject}>
                        <Text style={styles.submitText}>Decline Transfer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {mode === "counter" && (
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: isDark ? "#d1d5db" : "#374151" }]}>
                      Your counter offer
                    </Text>
                    <View style={styles.priceInputRow}>
                      <Text style={[styles.currencySymbol, { color: isDark ? "#d1d5db" : "#374151" }]}>$</Text>
                      <TextInput
                        style={[
                          styles.priceInput,
                          {
                            backgroundColor: isDark ? "#374151" : "#f9fafb",
                            color: isDark ? "#f9fafb" : "#111827",
                            borderColor: isDark ? "#4b5563" : "#d1d5db",
                          },
                        ]}
                        placeholder="0.00"
                        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                        value={counterPrice}
                        onChangeText={setCounterPrice}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: isDark ? "#374151" : "#f9fafb",
                          color: isDark ? "#f9fafb" : "#111827",
                          borderColor: isDark ? "#4b5563" : "#d1d5db",
                          marginTop: 8,
                        },
                      ]}
                      placeholder="Add a message..."
                      placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                      value={counterMessage}
                      onChangeText={setCounterMessage}
                      multiline
                      numberOfLines={2}
                    />
                    <View style={styles.formActions}>
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => setMode("main")}>
                        <Text style={[styles.cancelText, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: "#7C3AED" }]}
                        onPress={handleCounter}
                      >
                        <Text style={styles.submitText}>Send Counter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  priceLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  priceValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  content: {
    maxHeight: 300,
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  acceptButton: {
    backgroundColor: "#059669",
  },
  counterButton: {
    backgroundColor: "#7C3AED20",
    borderWidth: 1,
    borderColor: "#7C3AED",
  },
  rejectButton: {
    backgroundColor: "#DC262620",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  acceptText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#ffffff",
  },
  counterText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  rejectText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  formSection: {
    gap: 8,
  },
  formLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencySymbol: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  submitText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#ffffff",
  },
});
