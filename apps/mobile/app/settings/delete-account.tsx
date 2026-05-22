import { View, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@foreverr/core";
import { Text } from "@foreverr/ui";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { profile, deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const expectedConfirmation = "DELETE";
  const canDelete =
    confirmText.trim().toUpperCase() === expectedConfirmation && !isDeleting;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/settings" as any);
  }, [router]);

  const onConfirmDelete = useCallback(() => {
    Alert.alert(
      "Delete account?",
      "This will permanently anonymize your profile and sign you out. Memorial content you created for others will remain so other contributors can keep accessing it. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            const { error } = await deleteAccount();
            setIsDeleting(false);
            if (error) {
              Alert.alert(
                "Couldn't delete account",
                error.message ?? "Please try again or contact support.",
              );
              return;
            }
            router.replace("/(auth)/login" as any);
          },
        },
      ],
    );
  }, [deleteAccount, router]);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-lg font-sans-bold text-white">Delete Account</Text>
        </View>
      </View>

      {/* Warning hero */}
      <View className="px-4 pt-6">
        <View className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning-outline" size={22} color="#EF4444" />
            <Text className="ml-2 text-base font-sans-bold text-red-700 dark:text-red-300">
              This action is permanent
            </Text>
          </View>
          <Text className="text-sm font-sans text-red-700/90 dark:text-red-200/80 leading-5">
            Your profile name, photo, and bio will be removed. You'll be signed
            out immediately and won't be able to sign back in.
          </Text>
        </View>
      </View>

      {/* What gets removed / what stays */}
      <View className="px-4 mt-5">
        <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider mb-2">
          What happens
        </Text>

        <View className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
          <Row icon="close-circle" color="#EF4444" label="Removed">
            Your username, display name, avatar, bio, and notification settings.
          </Row>
          <View className="h-px bg-gray-200 dark:bg-gray-700 my-3" />
          <Row icon="checkmark-circle" color="#059669" label="Preserved">
            Memorial pages, tributes, and family-tree contributions you made for
            other people — so co-contributors don't lose grief work.
          </Row>
          <View className="h-px bg-gray-200 dark:bg-gray-700 my-3" />
          <Row icon="information-circle" color="#2563EB" label="Transfer first?">
            If you're the steward of a memorial page and want it to stay
            actively maintained, transfer stewardship before deleting.
          </Row>
        </View>

        <Pressable
          className="mt-3 flex-row items-center justify-center py-3 rounded-xl bg-brand-900"
          onPress={() => router.push("/stewardship" as any)}
        >
          <Ionicons name="swap-horizontal-outline" size={18} color="#ffffff" />
          <Text className="ml-2 text-sm font-sans-bold text-white">
            Open Stewardship
          </Text>
        </Pressable>
      </View>

      {/* Confirmation input */}
      <View className="px-4 mt-6">
        <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider mb-2">
          Confirm
        </Text>
        <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 mb-3">
          Type{" "}
          <Text className="font-sans-bold text-gray-900 dark:text-white">
            {expectedConfirmation}
          </Text>{" "}
          to enable the delete button.
        </Text>
        <TextInput
          value={confirmText}
          onChangeText={setConfirmText}
          placeholder={expectedConfirmation}
          placeholderTextColor="#9ca3af"
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isDeleting}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white"
        />

        {profile?.username ? (
          <Text className="mt-2 text-xs font-sans text-gray-400">
            Signed in as @{profile.username}
          </Text>
        ) : null}
      </View>

      {/* Delete button */}
      <View className="px-4 mt-6 pb-12">
        <Pressable
          disabled={!canDelete}
          onPress={onConfirmDelete}
          className={`flex-row items-center justify-center py-3.5 rounded-xl ${
            canDelete ? "bg-red-600" : "bg-gray-200 dark:bg-gray-800"
          }`}
        >
          {isDeleting ? (
            <ActivityIndicator color={canDelete ? "#ffffff" : "#9ca3af"} />
          ) : (
            <>
              <Ionicons
                name="trash-outline"
                size={18}
                color={canDelete ? "#ffffff" : "#9ca3af"}
              />
              <Text
                className={`ml-2 text-sm font-sans-bold ${
                  canDelete ? "text-white" : "text-gray-400"
                }`}
              >
                Permanently delete my account
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          className="mt-3 flex-row items-center justify-center py-3 rounded-xl"
          onPress={goBack}
          disabled={isDeleting}
        >
          <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-400">
            Cancel
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Row({
  icon,
  color,
  label,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row">
      <View className="mr-3 mt-0.5">
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text
          className="text-xs font-sans-bold uppercase tracking-wider mb-0.5"
          style={{ color }}
        >
          {label}
        </Text>
        <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-5">
          {children}
        </Text>
      </View>
    </View>
  );
}
