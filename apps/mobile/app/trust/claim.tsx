import { View, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useSubmitClaim } from "@foreverr/core";
import { Text } from "@foreverr/ui";

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
  const params = useLocalSearchParams<{ memorialId?: string; memorialName?: string }>();
  const { user } = useAuth();
  const submitClaim = useSubmitClaim();

  const [relationship, setRelationship] = useState("");
  const [evidenceType, setEvidenceType] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");

  const canSubmit = relationship.length > 0 && !!params.memorialId && !submitClaim.isPending;

  const handleSubmit = async () => {
    if (!canSubmit || !user?.id || !params.memorialId) return;

    try {
      await submitClaim.mutateAsync({
        memorialId: params.memorialId,
        claimerId: user.id,
        relationship,
        evidenceType: evidenceType || undefined,
        evidenceUrl: evidenceUrl || undefined,
        evidenceNote: evidenceNote || undefined,
      });

      Alert.alert(
        "Claim Submitted",
        "Your claim has been submitted for review. You'll be notified once a decision is made.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to submit claim. Please try again.");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Memorial Info */}
      {params.memorialName && (
        <View className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 mb-6">
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">Claiming memorial for</Text>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-1">
            {params.memorialName}
          </Text>
        </View>
      )}

      {/* No memorial selected */}
      {!params.memorialId && (
        <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6 flex-row">
          <Ionicons name="warning" size={20} color="#d97706" style={{ marginTop: 1 }} />
          <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 ml-2 flex-1">
            Please navigate to a memorial first, then access the claim option from the memorial page.
          </Text>
        </View>
      )}

      {/* Relationship Picker */}
      <Text className="text-base font-sans-semibold text-gray-900 dark:text-white mb-3">
        Your Relationship to the Deceased *
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {RELATIONSHIPS.map((r) => (
          <Pressable
            key={r.value}
            className={`flex-row items-center rounded-xl px-4 py-3 border ${
              relationship === r.value
                ? "bg-brand-700 border-brand-700"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
            onPress={() => setRelationship(r.value)}
          >
            <Ionicons
              name={r.icon as any}
              size={16}
              color={relationship === r.value ? "#fff" : "#6b7280"}
            />
            <Text
              className={`text-sm font-sans-medium ml-2 ${
                relationship === r.value ? "text-white" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {r.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Evidence Type */}
      <Text className="text-base font-sans-semibold text-gray-900 dark:text-white mb-3">
        Supporting Evidence (optional)
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {EVIDENCE_TYPES.map((e) => (
          <Pressable
            key={e.value}
            className={`flex-row items-center rounded-xl px-4 py-3 border ${
              evidenceType === e.value
                ? "bg-brand-700 border-brand-700"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
            onPress={() => setEvidenceType(evidenceType === e.value ? "" : e.value)}
          >
            <Ionicons
              name={e.icon as any}
              size={16}
              color={evidenceType === e.value ? "#fff" : "#6b7280"}
            />
            <Text
              className={`text-sm font-sans-medium ml-2 ${
                evidenceType === e.value ? "text-white" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {e.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Evidence URL (show if type selected) */}
      {evidenceType && (
        <View className="mb-4">
          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Evidence URL or Reference
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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
      <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
        Additional Notes
      </Text>
      <TextInput
        className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-sans text-gray-900 dark:text-white bg-white dark:bg-gray-800 min-h-[100px]"
        placeholder="Any additional information to support your claim..."
        placeholderTextColor="#9ca3af"
        value={evidenceNote}
        onChangeText={setEvidenceNote}
        multiline
        textAlignVertical="top"
      />

      {/* Info box */}
      <View className="flex-row bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mt-6 mb-6">
        <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 1 }} />
        <View className="ml-2 flex-1">
          <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-1">
            What happens next?
          </Text>
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 leading-5">
            Your claim will be reviewed by the memorial creator and our trust team. Once approved, your trust level will be upgraded and you'll gain family management permissions.
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <Pressable
        className={`rounded-full py-4 items-center ${
          canSubmit ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
        }`}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {submitClaim.isPending ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark" size={18} color="white" />
            <Text className="text-base font-sans-semibold text-white ml-2">Submit Claim</Text>
          </View>
        )}
      </Pressable>
    </ScrollView>
  );
}
