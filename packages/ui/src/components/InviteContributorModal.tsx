import React, { useState } from "react";
import { View, Pressable, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface InviteContributorModalProps {
  visible: boolean;
  onClose: () => void;
  tributeTitle: string;
  onInviteSent: (email: string) => void;
}

export function InviteContributorModal({
  visible,
  onClose,
  tributeTitle,
  onInviteSent,
}: InviteContributorModalProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      onInviteSent(email.trim());
      setEmail("");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View className="flex-1" />
        <Pressable
          className="bg-white dark:bg-gray-900 rounded-t-3xl px-5 pb-8 pt-4"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View className="items-center mb-4">
            <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Header */}
          <View className="items-center mb-6">
            <View className="h-14 w-14 rounded-full bg-brand-50 dark:bg-brand-900/30 items-center justify-center mb-3">
              <Ionicons name="person-add" size={28} color="#7C3AED" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
              Invite a Contributor
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-1 text-center">
              Invite someone to contribute to "{tributeTitle}"
            </Text>
          </View>

          {/* Email input */}
          <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
            Email address
          </Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
            placeholder="friend@example.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Actions */}
          <View className="flex-row gap-3 mt-6">
            <Pressable
              className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 py-3.5 items-center"
              onPress={onClose}
            >
              <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300">Cancel</Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-xl py-3.5 items-center ${email.trim() ? "bg-brand-700" : "bg-brand-300"}`}
              onPress={handleSend}
              disabled={!email.trim() || sending}
            >
              <Text className="text-sm font-sans-semibold text-white">
                {sending ? "Sending..." : "Send Invite"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
