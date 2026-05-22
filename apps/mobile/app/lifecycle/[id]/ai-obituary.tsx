import { View, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useMemo, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemorial, useGenerateObituary, useAuth, supabase } from "@foreverr/core";
import type { Memorial } from "@foreverr/core";
import { Text, Button, AIStyleSelector, AIOutputPreview, getLifecycleConfig } from "@foreverr/ui";
import type { AIStyleOption } from "@foreverr/ui";

const OBITUARY_STYLES: AIStyleOption[] = [
  {
    key: "formal",
    label: "Formal",
    description: "Traditional, dignified obituary style",
    icon: "document-text",
  },
  {
    key: "warm",
    label: "Warm & Personal",
    description: "Heartfelt celebration of their life",
    icon: "heart",
  },
  {
    key: "celebratory",
    label: "Celebratory",
    description: "Uplifting focus on joy and legacy",
    icon: "sunny",
  },
];

export default function AIObituaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();
  const { data: memorial } = useMemorial(id);
  const generateObituary = useGenerateObituary();

  // ── Lifecycle config ─────────────────────────────────────────────
  const config = useMemo(
    () => getLifecycleConfig((memorial as any)?.lifecycle_stage),
    [(memorial as any)?.lifecycle_stage],
  );

  const [selectedStyle, setSelectedStyle] = useState("warm");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [generatedText, setGeneratedText] = useState<string | null>(
    memorial?.obituary || null
  );

  // If AI obituary is not available for this lifecycle type, show fallback
  if (!config.showAiObituary) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-8">
        <Ionicons name="sparkles-outline" size={48} color="#d1d5db" />
        <Text className="mt-4 text-lg font-sans-bold text-gray-900 dark:text-white text-center">
          AI Obituary
        </Text>
        <Text className="mt-2 text-sm font-sans text-center text-gray-500">
          This feature is available for memorial profiles. Use the Biography tab to manage content for this page.
        </Text>
        <Pressable
          className="mt-6 rounded-full bg-brand-700 px-6 py-2.5"
          onPress={goBack}
        >
          <Text className="text-sm font-sans-semibold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleGenerate = async () => {
    if (!id) return;
    try {
      const result = await generateObituary.mutateAsync({
        memorialId: id,
        style: selectedStyle as "formal" | "warm" | "celebratory",
      });
      setGeneratedText(result.text);
      setEditedText(result.text);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleEdit = () => {
    setEditedText(generatedText || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    await supabase
      .from("memorials")
      .update({ obituary: editedText })
      .eq("id", id);
    setGeneratedText(editedText);
    setIsEditing(false);
  };

  const handleAccept = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-14">
          {/* Header */}
          <Pressable onPress={goBack}>
            <Text className="text-base font-sans-medium text-brand-700 mb-4">
              ← Back
            </Text>
          </Pressable>

          <View className="flex-row items-center mb-1">
            <Ionicons name="sparkles" size={20} color="#4A2D7A" />
            <Text variant="h2" className="ml-2">
              AI Obituary
            </Text>
          </View>
          <Text variant="body" className="mb-6 text-gray-500">
            Generate a respectful obituary for{" "}
            {memorial?.first_name} {memorial?.last_name}
          </Text>

          {/* Editing mode */}
          {isEditing ? (
            <View>
              <Text className="text-sm font-sans-semibold text-gray-700 mb-2">
                Edit Obituary
              </Text>
              <TextInput
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 min-h-[200px]"
                multiline
                value={editedText}
                onChangeText={setEditedText}
                textAlignVertical="top"
              />
              <View className="flex-row gap-3 mt-4">
                <Pressable
                  className="flex-1 h-12 items-center justify-center rounded-full bg-gray-100"
                  onPress={() => setIsEditing(false)}
                >
                  <Text className="text-sm font-sans-semibold text-gray-600">Cancel</Text>
                </Pressable>
                <Pressable
                  className="flex-1 h-12 items-center justify-center rounded-full bg-brand-700"
                  onPress={handleSaveEdit}
                >
                  <Text className="text-sm font-sans-semibold text-white">Save Changes</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {/* Style selector */}
              {!generatedText && (
                <>
                  <Text className="text-sm font-sans-semibold text-gray-700 mb-3">
                    Choose a Style
                  </Text>
                  <AIStyleSelector
                    options={OBITUARY_STYLES}
                    selected={selectedStyle}
                    onSelect={setSelectedStyle}
                  />

                  <Button
                    title="Generate Obituary"
                    size="lg"
                    fullWidth
                    className="mt-6"
                    loading={generateObituary.isPending}
                    onPress={handleGenerate}
                  />
                </>
              )}

              {/* Output preview */}
              <AIOutputPreview
                text={generatedText}
                isGenerating={generateObituary.isPending}
                error={generateObituary.error?.message}
                label="Obituary"
                onEdit={handleEdit}
                onRegenerate={handleGenerate}
                onAccept={handleAccept}
              />
            </>
          )}

          {/* Show existing obituary notice */}
          {memorial?.obituary && !generatedText && !generateObituary.isPending && (
            <View className="mt-4 rounded-xl bg-amber-50 p-4">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={18} color="#d97706" />
                <Text className="ml-2 text-sm font-sans-semibold text-amber-700">
                  Existing obituary will be replaced
                </Text>
              </View>
              <Text className="mt-1 text-xs font-sans text-amber-600">
                Generating a new obituary will replace the current one. You can always edit it afterwards.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
