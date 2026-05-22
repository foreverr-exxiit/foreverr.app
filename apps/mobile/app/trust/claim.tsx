import { View, ScrollView, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useSubmitClaim } from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

const RELATIONSHIPS = [
  { value: "spouse", label: "Spouse", icon: "heart" },
  { value: "parent", label: "Parent", icon: "people" },
  { value: "child", label: "Child", icon: "person" },
  { value: "sibling", label: "Sibling", icon: "people-circle" },
  { value: "grandchild", label: "Grandchild", icon: "happy" },
  { value: "grandparent", label: "Grandparent", icon: "home" },
  { value: "extended_family", label: "Extended Family", icon: "git-network" },
  { value: "executor", label: "Executor", icon: "document-text" },
  { value: "close_friend", label: "Close Friend", icon: "hand-left" },
] as const;

const EVIDENCE_TYPES = [
  { value: "obituary_link", label: "Obituary Link", icon: "link" },
  { value: "death_certificate", label: "Death Certificate", icon: "document" },
  { value: "family_photo", label: "Family Photo", icon: "image" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal" },
] as const;

export default function ClaimScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const params = useLocalSearchParams<{ memorialId?: string; memorialName?: string }>();
  const { user } = useAuth();
  const submitClaim = useSubmitClaim();

  const [relationship, setRelationship] = useState("");
  const [evidenceType, setEvidenceType] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isSignedIn = !!user?.id;

  const handleSubmit = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to submit a claim.");
      return;
    }
    if (!params.memorialId) {
      setError("No memorial selected. Please navigate to a memorial first.");
      return;
    }
    if (!relationship) {
      setError("Please select your relationship to the deceased.");
      return;
    }
    if (submitClaim.isPending) return;

    try {
      await submitClaim.mutateAsync({
        memorialId: params.memorialId,
        claimerId: user!.id,
        relationship,
        evidenceType: evidenceType || undefined,
        evidenceUrl: evidenceUrl || undefined,
        evidenceNote: evidenceNote || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit claim. Please try again.");
    }
  };

  // ─── Success state ──────────────────────────────────────────────
  if (success) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2">
            Claim Submitted!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            Your claim has been submitted for review. You'll be notified once a decision is made. This usually takes 1-3 business days.
          </Text>
          <View className="w-full gap-3">
            <Pressable
              onPress={goBack}
              className="bg-brand-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-base font-sans-bold text-white">Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ─── Main form ──────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Trust Claim
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Verify your relationship
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sign-in banner */}
        {!isSignedIn && (
          <Pressable
            onPress={() => router.push("/(auth)/login" as any)}
            className="mx-4 mt-4 flex-row items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3"
          >
            <Ionicons name="log-in-outline" size={20} color="#d97706" />
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-yellow-800 dark:text-yellow-300">
                Sign in to submit a claim
              </Text>
              <Text className="text-xs font-sans text-yellow-600 dark:text-yellow-400 mt-0.5">
                Tap here to sign in or create an account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#d97706" />
          </Pressable>
        )}

        {/* Hero */}
        <View className="items-center py-6">
          <View className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3">
            <Ionicons name="shield-checkmark" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Claim Memorial
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Verify your relationship to gain family management permissions.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Memorial Info */}
          {params.memorialName && (
            <View className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 border border-brand-100 dark:border-brand-800">
              <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">Claiming memorial for</Text>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-1">
                {params.memorialName}
              </Text>
            </View>
          )}

          {/* No memorial warning */}
          {!params.memorialId && (
            <View className="flex-row items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3">
              <Ionicons name="warning" size={18} color="#d97706" />
              <Text className="flex-1 text-sm font-sans text-yellow-700 dark:text-yellow-400">
                Please navigate to a memorial first, then access the claim option from the memorial page.
              </Text>
            </View>
          )}

          {/* Relationship Picker */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Your Relationship *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {RELATIONSHIPS.map((r) => (
                <Pressable
                  key={r.value}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    relationship === r.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => { setRelationship(r.value); setError(""); }}
                >
                  <Ionicons
                    name={r.icon as any}
                    size={14}
                    color={relationship === r.value ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      relationship === r.value ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Evidence Type */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Supporting Evidence (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EVIDENCE_TYPES.map((e) => (
                <Pressable
                  key={e.value}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    evidenceType === e.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setEvidenceType(evidenceType === e.value ? "" : e.value)}
                >
                  <Ionicons
                    name={e.icon as any}
                    size={14}
                    color={evidenceType === e.value ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      evidenceType === e.value ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {e.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Evidence URL */}
          {evidenceType && (
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Evidence URL or Reference
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="https://..."
                placeholderTextColor="#9ca3af"
                value={evidenceUrl}
                onChangeText={setEvidenceUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          )}

          {/* Notes */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Any additional information to support your claim..."
              placeholderTextColor="#9ca3af"
              value={evidenceNote}
              onChangeText={setEvidenceNote}
              multiline
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* Info box */}
          <View className="flex-row items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-800">
            <Ionicons name="information-circle" size={18} color="#3b82f6" style={{ marginTop: 1 }} />
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-1">
                What happens next?
              </Text>
              <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 leading-5">
                Your claim will be reviewed by the memorial creator and our trust team. Once approved, your trust level will be upgraded and you'll gain family management permissions.
              </Text>
            </View>
          </View>

          {/* Error Message (inline) */}
          {error.length > 0 && (
            <View className="flex-row items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="flex-1 text-sm font-sans text-red-700 dark:text-red-400">
                {error}
              </Text>
              <Pressable onPress={() => setError("")}>
                <Ionicons name="close" size={16} color="#ef4444" />
              </Pressable>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            className={`w-full rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              submitClaim.isPending
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {submitClaim.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Submit Claim
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
