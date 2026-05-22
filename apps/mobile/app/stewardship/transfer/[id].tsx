import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useTransferDetail,
  useTransferMessages,
  useSendTransferMessage,
  useRespondToTransfer,
} from "@foreverr/core";

const STATUS_STEPS = ["pending", "accepted", "escrow_funded", "cooling_off", "completed"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  escrow_funded: "Escrow Funded",
  cooling_off: "Cooling Off",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
  disputed: "Disputed",
};

export default function TransferDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messageText, setMessageText] = useState("");

  const { data: transfer, isLoading } = useTransferDetail(id);
  const { data: messages } = useTransferMessages(id);
  const { mutate: sendMessage, isPending: sending } = useSendTransferMessage();
  const { mutate: respondToTransfer, isPending: responding } = useRespondToTransfer();

  const currentStepIndex = STATUS_STEPS.indexOf(transfer?.status ?? "pending");
  const isTerminal = ["completed", "rejected", "cancelled", "expired"].includes(transfer?.status ?? "");
  const isPending = transfer?.status === "pending";

  const handleSend = () => {
    if (!messageText.trim() || !id) return;
    sendMessage({ transferId: id, message: messageText.trim() } as any);
    setMessageText("");
  };

  const handleAccept = () => {
    if (!id) return;
    respondToTransfer({ transferId: id, action: "accept" } as any);
  };

  const handleReject = () => {
    if (!id) return;
    respondToTransfer({ transferId: id, action: "reject" } as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#FFFFFF", borderBottomColor: isDark ? "#1f2937" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Status Timeline */}
          <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Status</Text>
            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= currentStepIndex && !isTerminal;
                const isCurrent = i === currentStepIndex;
                return (
                  <View key={step} style={styles.timelineStep}>
                    <View style={styles.timelineDotRow}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: isActive ? "#7C3AED" : isDark ? "#374151" : "#d1d5db",
                            borderWidth: isCurrent ? 3 : 0,
                            borderColor: "#4A2D7A",
                          },
                        ]}
                      />
                      {i < STATUS_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: isActive ? "#7C3AED" : isDark ? "#374151" : "#d1d5db" },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        { color: isActive ? (isDark ? "#f9fafb" : "#111827") : isDark ? "#6b7280" : "#9ca3af" },
                      ]}
                    >
                      {STATUS_LABELS[step]}
                    </Text>
                  </View>
                );
              })}
            </View>
            {isTerminal && (
              <View style={[styles.statusBadge, { backgroundColor: transfer?.status === "completed" ? "#10b98120" : "#ef444420" }]}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: transfer?.status === "completed" ? "#10b981" : "#ef4444" }}>
                  {STATUS_LABELS[transfer?.status ?? ""] ?? transfer?.status}
                </Text>
              </View>
            )}
          </View>

          {/* Transfer Info */}
          <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Transfer Info</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Type</Text>
              <Text style={[styles.infoValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
                {transfer?.transfer_type ?? "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Price</Text>
              <Text style={[styles.infoValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
                {transfer?.price_cents ? `$${(transfer.price_cents / 100).toFixed(2)}` : "Free"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>Created</Text>
              <Text style={[styles.infoValue, { color: isDark ? "#f9fafb" : "#111827" }]}>
                {transfer?.created_at ? new Date(transfer.created_at).toLocaleDateString() : "N/A"}
              </Text>
            </View>
          </View>

          {/* Messages */}
          <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#ffffff" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Negotiation</Text>
            {(!messages || (messages as unknown as any[]).length === 0) ? (
              <Text style={[styles.emptyText, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                No messages yet. Start the conversation.
              </Text>
            ) : (
              (messages as unknown as any[]).map((msg: any, i: number) => (
                <View key={msg.id ?? i} style={[styles.messageBubble, { backgroundColor: isDark ? "#374151" : "#f3f4f6" }]}>
                  <Text style={[styles.messageText, { color: isDark ? "#f9fafb" : "#111827" }]}>
                    {msg.message}
                  </Text>
                  <Text style={[styles.messageTime, { color: isDark ? "#6b7280" : "#9ca3af" }]}>
                    {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
                  </Text>
                </View>
              ))
            )}

            {!isTerminal && (
              <View style={styles.messageInputRow}>
                <TextInput
                  style={[
                    styles.messageInput,
                    {
                      backgroundColor: isDark ? "#374151" : "#f3f4f6",
                      color: isDark ? "#f9fafb" : "#111827",
                      borderColor: isDark ? "#4b5563" : "#d1d5db",
                    },
                  ]}
                  placeholder="Type a message..."
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  value={messageText}
                  onChangeText={setMessageText}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, { opacity: messageText.trim() ? 1 : 0.5 }]}
                  onPress={handleSend}
                  disabled={!messageText.trim() || sending}
                >
                  <Ionicons name="send" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        {isPending && (
          <View style={[styles.actionBar, { backgroundColor: isDark ? "#1f2937" : "#ffffff", borderTopColor: isDark ? "#374151" : "#e5e7eb" }]}>
            <TouchableOpacity
              style={[styles.rejectBtn, { borderColor: "#ef4444" }]}
              onPress={handleReject}
              disabled={responding}
            >
              <Text style={[styles.rejectBtnText, { color: "#ef4444" }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              disabled={responding}
            >
              {responding ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.acceptBtnText}>Accept Transfer</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
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
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 12 },
  timeline: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  timelineStep: { alignItems: "center", flex: 1 },
  timelineDotRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  timelineDot: { width: 14, height: 14, borderRadius: 7 },
  timelineLine: { flex: 1, height: 2 },
  timelineLabel: { fontFamily: "Inter_400Regular", fontSize: 9, marginTop: 4, textAlign: "center" },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  infoLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  infoValue: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", paddingVertical: 16 },
  messageBubble: { padding: 10, borderRadius: 10, marginBottom: 8 },
  messageText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  messageTime: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 4, textAlign: "right" },
  messageInputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  messageInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontFamily: "Inter_400Regular", fontSize: 14 },
  sendBtn: { backgroundColor: "#7C3AED", width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  actionBar: { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: 1 },
  rejectBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  rejectBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  acceptBtn: { flex: 2, backgroundColor: "#7C3AED", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  acceptBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#ffffff" },
});
