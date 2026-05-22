import { View, TextInput, Pressable, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";
import { Button } from "../primitives/Button";

const RIBBON_TYPES = [
  { key: "silver", label: "Silver", color: "#9ca3af", bgColor: "#f3f4f6", cost: 1, emoji: "🤍" },
  { key: "gold", label: "Gold", color: "#d97706", bgColor: "#fffbeb", cost: 5, emoji: "💛" },
  { key: "purple", label: "Purple", color: "#7c3aed", bgColor: "#f5f3ff", cost: 10, emoji: "💜" },
  { key: "crystal", label: "Crystal", color: "#06b6d4", bgColor: "#ecfeff", cost: 25, emoji: "💎" },
  { key: "eternal", label: "Eternal", color: "#ef4444", bgColor: "#fef2f2", cost: 50, emoji: "❤️‍🔥" },
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
  /** Render prop for external AI buttons (replaces built-in AI Suggest when provided) */
  renderAIButtons?: (props: { currentText: string; onResult: (text: string) => void }) => React.ReactNode;
  userAvatarUrl?: string | null;
  ribbonBalance?: number;
}

export function TributeComposer({ visible, onClose, onSubmit, onAISuggest, renderAIButtons, userAvatarUrl, ribbonBalance = 0 }: TributeComposerProps) {
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
      <KeyboardAvoidingView className="flex-1 bg-gray-50 dark:bg-gray-900" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <Pressable onPress={onClose} className="h-8 w-8 rounded-full bg-gray-200/60 dark:bg-gray-700 items-center justify-center">
            <Ionicons name="close" size={18} color="#6b7280" />
          </Pressable>
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white">New Tribute</Text>
          <View className="flex-row items-center gap-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1.5">
            <Ionicons name="ribbon" size={13} color="#7C3AED" />
            <Text className="text-xs font-sans-bold text-brand-700 dark:text-brand-400">{ribbonBalance}</Text>
          </View>
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Tribute Type Selection */}
          <View className="px-5 pt-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {TRIBUTE_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
                    selectedType === type.key
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  }`}
                  onPress={() => setSelectedType(type.key)}
                >
                  <Ionicons
                    name={type.icon}
                    size={13}
                    color={selectedType === type.key ? "#ffffff" : "#9ca3af"}
                  />
                  <Text className={`text-xs font-sans-medium ${selectedType === type.key ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Content area */}
          <View className="mx-5 mt-4 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-start px-4 pt-4 pb-3">
              <View className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center overflow-hidden mr-3">
                {userAvatarUrl ? (
                  <Image source={{ uri: userAvatarUrl }} style={{ width: 36, height: 36 }} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={16} color="#4A2D7A" />
                )}
              </View>
              <TextInput
                className="flex-1 text-sm font-sans text-gray-900 dark:text-white min-h-[100px]"
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

            {/* AI Writing Assistance — inside the compose card */}
            <View className="px-4 pb-3">
              {renderAIButtons ? (
                renderAIButtons({ currentText: content, onResult: setContent })
              ) : onAISuggest ? (
                <Pressable
                  className="flex-row items-center self-start gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 py-1.5 px-3"
                  onPress={async () => {
                    setIsAISuggesting(true);
                    try {
                      const suggestion = await onAISuggest();
                      if (suggestion) setContent(suggestion);
                    } catch (err: any) {
                      Alert.alert("AI Suggest Failed", err?.message || "Could not generate suggestion. Please try again.");
                    } finally {
                      setIsAISuggesting(false);
                    }
                  }}
                  disabled={isAISuggesting}
                >
                  <Ionicons name="sparkles" size={12} color="#4A2D7A" />
                  <Text className="text-[11px] font-sans-semibold text-brand-700 dark:text-brand-400">
                    {isAISuggesting ? "Generating..." : "AI Suggest"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Ribbon Selection */}
          <View className="px-5 pt-4 pb-2">
            <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Attach Ribbon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {RIBBON_TYPES.map((ribbon) => (
                <Pressable
                  key={ribbon.key}
                  className={`items-center rounded-2xl py-2 px-3 border ${
                    selectedRibbon === ribbon.key
                      ? "border-brand-700"
                      : "border-gray-100 dark:border-gray-700"
                  }`}
                  style={[
                    selectedRibbon === ribbon.key ? { backgroundColor: ribbon.bgColor } : { backgroundColor: "white" },
                    { minWidth: 64 },
                  ]}
                  onPress={() => setSelectedRibbon(ribbon.key)}
                >
                  <Text className="text-base">{ribbon.emoji}</Text>
                  <Text className="text-[10px] font-sans-bold text-gray-700 dark:text-gray-200 mt-0.5">{ribbon.label}</Text>
                  <Text className="text-[9px] font-sans-semibold mt-0.5" style={{ color: ribbon.color }}>
                    {ribbon.cost} pt{ribbon.cost > 1 ? "s" : ""}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {!canAfford && (
              <View className="flex-row items-center mt-3 bg-red-50 dark:bg-red-900/20 rounded-full px-3 py-2">
                <Ionicons name="alert-circle" size={14} color="#ef4444" />
                <Text className="text-[11px] font-sans-medium text-red-600 dark:text-red-400 ml-2">
                  Need {ribbonCost} ribbons — you have {ribbonBalance}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Submit */}
        <View className="px-5 py-3">
          <Pressable
            className={`rounded-full py-3.5 items-center ${
              !content.trim() || !canAfford || isSubmitting ? "bg-gray-300 dark:bg-gray-600" : "bg-brand-700"
            }`}
            onPress={handleSubmit}
            disabled={!content.trim() || !canAfford || isSubmitting}
          >
            <Text className="text-sm font-sans-bold text-white">
              {isSubmitting ? "Posting..." : `Post Tribute · ${ribbonCost} ribbon${ribbonCost > 1 ? "s" : ""}`}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
