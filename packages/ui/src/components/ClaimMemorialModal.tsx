import React, { useState } from "react";
import { View, Modal, Pressable, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const RELATIONSHIPS = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "grandchild", label: "Grandchild" },
  { value: "grandparent", label: "Grandparent" },
  { value: "extended_family", label: "Extended Family" },
  { value: "executor", label: "Executor" },
  { value: "close_friend", label: "Close Friend" },
] as const;

const EVIDENCE_TYPES = [
  { value: "obituary_link", label: "Obituary Link" },
  { value: "death_certificate", label: "Death Certificate" },
  { value: "family_photo", label: "Family Photo" },
  { value: "other", label: "Other" },
] as const;

interface ClaimMemorialModalProps {
  visible: boolean;
  onClose: () => void;
  memorialId: string;
  memorialName: string;
  onSubmitted: () => void;
}

export function ClaimMemorialModal({
  visible,
  onClose,
  memorialId,
  memorialName,
  onSubmitted,
}: ClaimMemorialModalProps) {
  const [relationship, setRelationship] = useState("");
  const [evidenceType, setEvidenceType] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = relationship.length > 0 && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    // Parent component handles actual submission via onSubmitted
    onSubmitted();
    setIsSubmitting(false);
    setRelationship("");
    setEvidenceType("");
    setEvidenceNote("");
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <Pressable onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">Claim Memorial</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView className="flex-1 px-4 py-5" keyboardShouldPersistTaps="handled">
          {/* Memorial Info */}
          <View className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 mb-6">
            <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">Claiming memorial for</Text>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-1">{memorialName}</Text>
          </View>

          {/* Relationship Picker */}
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
            Your Relationship *
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {RELATIONSHIPS.map((r) => (
              <Pressable
                key={r.value}
                className={`rounded-full px-4 py-2 border ${
                  relationship === r.value
                    ? "bg-brand-700 border-brand-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
                onPress={() => setRelationship(r.value)}
              >
                <Text
                  className={`text-sm font-sans-medium ${
                    relationship === r.value ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Evidence Type */}
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
            Evidence Type (optional)
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {EVIDENCE_TYPES.map((e) => (
              <Pressable
                key={e.value}
                className={`rounded-full px-4 py-2 border ${
                  evidenceType === e.value
                    ? "bg-brand-700 border-brand-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
                onPress={() => setEvidenceType(evidenceType === e.value ? "" : e.value)}
              >
                <Text
                  className={`text-sm font-sans-medium ${
                    evidenceType === e.value ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {e.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Notes */}
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
            Additional Notes
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-sans text-gray-900 dark:text-white bg-white dark:bg-gray-800 min-h-[100px]"
            placeholder="Provide any additional information to support your claim..."
            placeholderTextColor="#9ca3af"
            value={evidenceNote}
            onChangeText={setEvidenceNote}
            multiline
            textAlignVertical="top"
          />

          {/* Info box */}
          <View className="flex-row bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mt-6">
            <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 1 }} />
            <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 ml-2 flex-1 leading-5">
              Claims are reviewed by the memorial creator and our trust team. You'll be notified once a decision is made.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="px-4 pb-8 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Pressable
            className={`rounded-full py-4 items-center ${
              canSubmit ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
            }`}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-base font-sans-semibold text-white">Submit Claim</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
