import { useState, useCallback } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";
import { CandleAnimation } from "./CandleAnimation";
import { heavyTap, lightTap } from "@foreverr/core";

const REACTIONS = [
  { type: "heart" as const, icon: "heart" as const, activeColor: "#ef4444", inactiveColor: "#6b7280", label: "Love" },
  { type: "candle" as const, icon: "flame" as const, activeColor: "#d97706", inactiveColor: "#6b7280", label: "Candle" },
  { type: "flower" as const, icon: "flower" as const, activeColor: "#ec4899", inactiveColor: "#6b7280", label: "Flower" },
  { type: "prayer" as const, icon: "hand-left" as const, activeColor: "#3b82f6", inactiveColor: "#6b7280", label: "Prayer" },
  { type: "dove" as const, icon: "leaf" as const, activeColor: "#10b981", inactiveColor: "#6b7280", label: "Peace" },
] as const;

interface ReactionBarProps {
  onReact: (type: "heart" | "candle" | "flower" | "prayer" | "dove") => void;
  counts?: Record<string, number>;
  userReaction?: string | null;
  compact?: boolean;
  /** Memorial name shown in the candle animation overlay */
  memorialName?: string;
}

export function ReactionBar({ onReact, counts = {}, userReaction, compact = false, memorialName = "" }: ReactionBarProps) {
  const [showCandleAnimation, setShowCandleAnimation] = useState(false);

  const handleReact = useCallback(
    (type: "heart" | "candle" | "flower" | "prayer" | "dove") => {
      // Candle gets heavy haptic, others get light tap
      if (type === "candle") {
        heavyTap();
      } else {
        lightTap();
      }
      onReact(type);
      if (type === "candle" && memorialName) {
        setShowCandleAnimation(true);
      }
    },
    [onReact, memorialName]
  );
  if (compact) {
    return (
      <View className="flex-row items-center gap-4 pt-1">
        {REACTIONS.map((reaction) => {
          const count = counts[reaction.type] ?? 0;
          const isActive = userReaction === reaction.type;
          return (
            <Pressable
              key={reaction.type}
              className="flex-row items-center gap-1.5"
              onPress={() => handleReact(reaction.type)}
            >
              <Ionicons
                name={isActive ? reaction.icon : (`${reaction.icon}-outline` as any)}
                size={20}
                color={isActive ? reaction.activeColor : reaction.inactiveColor}
              />
              {count > 0 && (
                <Text className={`text-xs font-sans-medium ${isActive ? "text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`}>{count}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <>
      <View className="flex-row items-center justify-around py-3 border-t border-gray-100 dark:border-gray-800">
        {REACTIONS.map((reaction) => {
          const count = counts[reaction.type] ?? 0;
          const isActive = userReaction === reaction.type;
          return (
            <Pressable
              key={reaction.type}
              className="items-center py-1.5 px-3"
              onPress={() => handleReact(reaction.type)}
            >
              <Ionicons
                name={isActive ? reaction.icon : (`${reaction.icon}-outline` as any)}
                size={26}
                color={isActive ? reaction.activeColor : reaction.inactiveColor}
              />
              <Text className={`text-xs font-sans-medium mt-1 ${isActive ? "text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`}>
                {count > 0 ? `${count}` : reaction.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <CandleAnimation
        visible={showCandleAnimation}
        memorialName={memorialName}
        onDismiss={() => setShowCandleAnimation(false)}
      />
    </>
  );
}
