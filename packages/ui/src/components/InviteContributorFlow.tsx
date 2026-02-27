import React, { useState } from "react";
import { View, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Share } from "react-native";
import { Text } from "../primitives/Text";

interface InviteContributorFlowProps {
  targetType: "memorial" | "living_tribute" | "family_tree";
  targetId: string;
  targetName: string;
  inviteUrl?: string;
  onInviteSent?: (email: string) => void;
  isLoading?: boolean;
}

export function InviteContributorFlow({
  targetType,
  targetId,
  targetName,
  inviteUrl,
  onInviteSent,
  isLoading,
}: InviteContributorFlowProps) {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"options" | "email">("options");

  const shareUrl = inviteUrl ?? `https://foreverr.app/invite?type=${targetType}&id=${targetId}`;

  const typeLabel =
    targetType === "memorial"
      ? "memorial"
      : targetType === "living_tribute"
      ? "tribute"
      : "family tree";

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `You're invited to contribute to ${targetName}'s ${typeLabel} on Foreverr! ${shareUrl}`,
      });
    } catch {}
  };

  const handleSendEmail = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    onInviteSent?.(trimmed);
    setEmail("");
    setMode("options");
    Alert.alert("Invite Sent", `An invitation has been sent to ${trimmed}`);
  };

  return (
    <View className="mx-4 mb-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
      <View className="flex-row items-center mb-3">
        <View className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
          <Ionicons name="person-add" size={20} color="#7C3AED" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
            Invite Contributors
          </Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">
            Invite people to contribute to {targetName}
          </Text>
        </View>
      </View>

      {mode === "options" ? (
        <View className="gap-2">
          {/* Share Link */}
          <Pressable
            className="flex-row items-center rounded-xl bg-brand-50 dark:bg-brand-900/20 px-4 py-3"
            onPress={handleShareLink}
          >
            <Ionicons name="link-outline" size={20} color="#4A2D7A" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">
                Share Invite Link
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-0.5">
                Send via messages, social media, or any app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </Pressable>

          {/* Email Invite */}
          <Pressable
            className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-900 px-4 py-3"
            onPress={() => setMode("email")}
          >
            <Ionicons name="mail-outline" size={20} color="#4A2D7A" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">
                Invite by Email
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-0.5">
                Send a personal invitation to a specific person
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </Pressable>
        </View>
      ) : (
        <View>
          <View className="flex-row items-center mb-3">
            <Pressable onPress={() => setMode("options")} className="p-1 mr-2">
              <Ionicons name="arrow-back" size={20} color="#4A2D7A" />
            </Pressable>
            <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">
              Send Email Invite
            </Text>
          </View>
          <TextInput
            className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-3"
            placeholder="Enter email address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            className={`rounded-full py-3 items-center ${
              email.trim() ? "bg-brand-700" : "bg-gray-200 dark:bg-gray-700"
            }`}
            onPress={handleSendEmail}
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                className={`text-sm font-sans-semibold ${
                  email.trim() ? "text-white" : "text-gray-400"
                }`}
              >
                Send Invitation
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
