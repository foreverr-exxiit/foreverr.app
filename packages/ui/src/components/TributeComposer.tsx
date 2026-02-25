import { View, TextInput, Pressable, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";
import { Button } from "../primitives/Button";

const RIBBON_TYPES = [
  { key: "silver", label: "Silver", color: "#9ca3af", cost: 1 },
  { key: "gold", label: "Gold", color: "#d97706", cost: 5 },
  { key: "purple", label: "Purple", color: "#7c3aed", cost: 10 },
  { key: "crystal", label: "Crystal", color: "#06b6d4", cost: 25 },
  { key: "eternal", label: "Eternal", color: "#ef4444", cost: 50 },
] as const;

const TRIBUTE_TYPES = [
  { key: "text", label: "Text", icon: "chatbubble-outline" as const },
  { key: "memory", label: "Memory", icon: "heart-outline" as const },
  { key: "poem", label: "Poem", icon: "book-outline" as const },
  { key: "quote", label: "Quote", icon: "text-outline" as const },
] as const;

interface TributeComposerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: string;
    content: string;
    ribbonType: string;
    ribbonCount: number;
  }) => Promise<void>;
  onAISuggest?: () => Promise<string | null>;
  userAvatarUrl?: string | null;
  ribbonBalance?: number;
}

export function TributeComposer({ visible, onClose, onSubmit, onAISuggest, userAvatarUrl, ribbonBalance = 0 }: TributeComposerProps) {
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState("text");
  const [selectedRibbon, setSelectedRibbon] = useState("silver");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);

  const ribbonCost = RIBBON_TYPES.find((r) => r.key === selectedRibbon)?.cost ?? 1;
  const canAfford = ribbonBalance >= ribbonCost;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!canAfford) {
      Alert.alert("Not enough ribbons", `You need ${ribbonCost} ribbons for a ${selectedRibbon} ribbon. You have ${ribbonBalance}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type: selectedType,
        content: content.trim(),
        ribbonType: selectedRibbon,
        ribbonCount: ribbonCost,
      });
      setContent("");
      setSelectedType("text");
      setSelectedRibbon("silver");
      onClose();
    } catch {
      Alert.alert("Error", "Failed to post tribute. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <Pressable onPress={onClose}>
            <Text className="text-base font-sans-medium text-gray-500">Cancel</Text>
          </Pressable>
          <Text className="text-base font-sans-bold text-gray-900">New Tribute</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="ribbon" size={16} color="#4A2D7A" />
            <Text className="text-sm font-sans-semibold text-brand-700">{ribbonBalance}</Text>
          </View>
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {/* Tribute Type Selection */}
          <View className="px-4 pt-4">
            <Text className="text-sm font-sans-semibold text-gray-700 mb-2">Type</Text>
            <View className="flex-row gap-2 mb-4">
              {TRIBUTE_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2 border ${
                    selectedType === type.key
                      ? "border-brand-700 bg-brand-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => setSelectedType(type.key)}
                >
                  <Ionicons
                    name={type.icon}
                    size={14}
                    color={selectedType === type.key ? "#4A2D7A" : "#9ca3af"}
                  />
                  <Text className={`text-xs font-sans-medium ${selectedType === type.key ? "text-brand-700" : "text-gray-500"}`}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* AI Suggest */}
          {onAISuggest && (
            <View className="px-4 mb-2">
              <Pressable
                className="flex-row items-center justify-center gap-2 rounded-full bg-brand-50 py-2.5 px-4"
                onPress={async () => {
                  setIsAISuggesting(true);
                  try {
                    const suggestion = await onAISuggest();
                    if (suggestion) setContent(suggestion);
                  } catch {
                    // silently fail
                  } finally {
                    setIsAISuggesting(false);
                  }
                }}
                disabled={isAISuggesting}
              >
                <Ionicons name="sparkles" size={14} color="#4A2D7A" />
                <Text className="text-xs font-sans-semibold text-brand-700">
                  {isAISuggesting ? "Generating..." : "AI Suggest"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Content */}
          <View className="px-4">
            <View className="flex-row items-start">
              <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center overflow-hidden mr-3 mt-1">
                {userAvatarUrl ? (
                  <Image source={{ uri: userAvatarUrl }} style={{ width: 40, height: 40 }} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={18} color="#4A2D7A" />
                )}
              </View>
              <TextInput
                className="flex-1 text-base font-sans text-gray-900 min-h-[120px]"
                placeholder={
                  selectedType === "memory"
                    ? "Share a cherished memory..."
                    : selectedType === "poem"
                    ? "Write a poem in their honor..."
                    : selectedType === "quote"
                    ? "Share a meaningful quote..."
                    : "Share your thoughts and memories..."
                }
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                autoFocus
              />
            </View>
          </View>

          {/* Ribbon Selection */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-sm font-sans-semibold text-gray-700 mb-2">Select Ribbon</Text>
            <Text className="text-xs font-sans text-gray-400 mb-3">
              Every tribute requires a ribbon. Higher ribbons show more honor.
            </Text>
            <View className="flex-row gap-2">
              {RIBBON_TYPES.map((ribbon) => (
                <Pressable
                  key={ribbon.key}
                  className={`flex-1 items-center rounded-xl py-3 border ${
                    selectedRibbon === ribbon.key
                      ? "border-brand-700 bg-brand-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => setSelectedRibbon(ribbon.key)}
                >
                  <Ionicons name="ribbon" size={24} color={ribbon.color} />
                  <Text className="text-[10px] font-sans-semibold text-gray-700 mt-1">{ribbon.label}</Text>
                  <Text className="text-[10px] font-sans text-gray-400">{ribbon.cost}</Text>
                </Pressable>
              ))}
            </View>
            {!canAfford && (
              <Text className="text-xs font-sans text-red-500 mt-2">
                Not enough ribbons. You need {ribbonCost} but have {ribbonBalance}.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Submit */}
        <View className="px-4 py-4 border-t border-gray-100">
          <Button
            title={`Post Tribute (${ribbonCost} ribbon${ribbonCost > 1 ? "s" : ""})`}
            size="lg"
            fullWidth
            loading={isSubmitting}
            disabled={!content.trim() || !canAfford}
            onPress={handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
