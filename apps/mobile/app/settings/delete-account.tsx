import { View, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Linking, Platform } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMySubscription } from "@foreverr/core";
import { Text } from "@foreverr/ui";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { profile, deleteAccount } = useAuth();
  const { data: subscription } = useMySubscription();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Only show the warning for billing statuses that imply real money is
  // still flowing. cancelled/expired subs don't need a re-warning.
  const hasActiveSubscription =
    !!subscription &&
    ["active", "trialing", "past_due"].includes(subscription.status) &&
    !subscription.cancel_at_period_end;

  const openStoreSubscriptions = useCallback(() => {
    const url =
      Platform.OS === "ios"
        ? "itms-apps://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Can't open store",
        Platform.OS === "ios"
          ? "Go to Settings → [Your Apple ID] → Subscriptions to cancel."
          : "Open Google Play → Profile → Payments & subscriptions → Subscriptions to cancel.",
      );
    });
  }, []);

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

      {/* Active subscription warning — Apple won't let us cancel IAP
          server-side; surface this clearly so the user knows to cancel
          in their store before deleting (or they keep getting billed). */}
      {hasActiveSubscription ? (
        <View className="px-4 mt-4">
          <View className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="card-outline" size={22} color="#D97706" />
              <Text className="ml-2 text-base font-sans-bold text-amber-800 dark:text-amber-200">
                Active subscription
              </Text>
            </View>
            <Text className="text-sm font-sans text-amber-800/90 dark:text-amber-100/80 leading-5 mb-3">
              You have an active subscription. Cancel it in {Platform.OS === "ios" ? "the App Store" : "Google Play"} first
              — deleting your account here won't stop the next billing
              cycle on your own store account.
            </Text>
            <Pressable
              className="flex-row items-center justify-center py-3 rounded-xl bg-amber-600"
              onPress={openStoreSubscriptions}
            >
              <Ionicons name="open-outline" size={18} color="#ffffff" />
              <Text className="ml-2 text-sm font-sans-bold text-white">
                {Platform.OS === "ios" ? "Manage Apple subscriptions" : "Manage Google subscriptions"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

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
