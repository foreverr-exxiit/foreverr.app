import React, { useState } from "react";
import { View, Pressable, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

type ContextType = "tribute" | "appreciation_letter" | "legacy_letter" | "living_tribute" | "wall_message";
type Tone = "warm" | "formal" | "celebratory" | "poetic";

interface AIRewriteButtonProps {
  /** Current text in the editor */
  currentText: string;
  /** Callback with the AI result text */
  onResult: (text: string) => void;
  /** Type of content being written */
  contextType: ContextType;
  /** Optional guidance / context */
  hint?: string;
  /** Writing tone — defaults to "warm" */
  tone?: Tone;
  /** Memorial ID for context (if applicable) */
  memorialId?: string;
  /** Recipient name for letters */
  recipientName?: string;
  /** The AI rewrite mutation (from useAIRewrite) */
  onAISuggest: (params: {
    content?: string;
    contextType: ContextType;
    tone?: Tone;
    mode: "suggest" | "rewrite";
    hint?: string;
    memorialId?: string;
    recipientName?: string;
  }) => Promise<{ text: string }>;
  /** Compact mode for inline inputs like wall messages */
  compact?: boolean;
}

export function AIRewriteButton({
  currentText,
  onResult,
  contextType,
  hint,
  tone = "warm",
  memorialId,
  recipientName,
  onAISuggest,
  compact = false,
}: AIRewriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"suggest" | "rewrite" | null>(null);

  const hasExistingText = currentText.trim().length > 10;

  const handlePress = async (mode: "suggest" | "rewrite") => {
    setIsLoading(true);
    setActiveMode(mode);
    try {
      const result = await onAISuggest({
        content: mode === "rewrite" ? currentText : currentText || undefined,
        contextType,
        tone,
        mode,
        hint,
        memorialId,
        recipientName,
      });
      if (result?.text) {
        onResult(result.text);
      }
    } catch (err: any) {
      const msg = err?.message || "";
      const isNotDeployed = msg.includes("not found") || msg.includes("FunctionNotFound") || msg.includes("404");
      Alert.alert(
        "AI Writing Unavailable",
        isNotDeployed
          ? "The AI writing service hasn't been set up yet. You can still write your message manually."
          : msg || "Could not generate text. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
      setActiveMode(null);
    }
  };

  // ── Compact mode: single sparkle icon for wall messages ──────────
  if (compact) {
    return (
      <Pressable
        className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center"
        onPress={() => handlePress(hasExistingText ? "rewrite" : "suggest")}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#4A2D7A" />
        ) : (
          <Ionicons name="sparkles" size={14} color="#4A2D7A" />
        )}
      </Pressable>
    );
  }

  // ── Full mode: suggest + rewrite buttons ─────────────────────────
  return (
    <View className="flex-row gap-1.5 mb-2">
      {/* AI Suggest — always visible */}
      <Pressable
        className="flex-row items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 py-1.5 px-3"
        onPress={() => handlePress("suggest")}
        disabled={isLoading}
      >
        {isLoading && activeMode === "suggest" ? (
          <ActivityIndicator size="small" color="#4A2D7A" />
        ) : (
          <Ionicons name="sparkles" size={12} color="#4A2D7A" />
        )}
        <Text className="text-[11px] font-sans-semibold text-brand-700 dark:text-brand-400">
          {isLoading && activeMode === "suggest" ? "Generating..." : "AI Suggest"}
        </Text>
      </Pressable>

      {/* AI Rewrite — visible only when user has typed enough */}
      {hasExistingText && (
        <Pressable
          className="flex-row items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 py-1.5 px-3"
          onPress={() => handlePress("rewrite")}
          disabled={isLoading}
        >
          {isLoading && activeMode === "rewrite" ? (
            <ActivityIndicator size="small" color="#7C3AED" />
          ) : (
            <Ionicons name="create-outline" size={12} color="#7C3AED" />
          )}
          <Text className="text-[11px] font-sans-semibold text-purple-700 dark:text-purple-400">
            {isLoading && activeMode === "rewrite" ? "Rewriting..." : "AI Rewrite"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
