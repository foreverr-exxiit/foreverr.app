import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const REACTIONS = [
  { type: "heart" as const, icon: "heart" as const, activeColor: "#ef4444", label: "Love" },
  { type: "candle" as const, icon: "flame" as const, activeColor: "#d97706", label: "Candle" },
  { type: "flower" as const, icon: "flower" as const, activeColor: "#ec4899", label: "Flower" },
  { type: "prayer" as const, icon: "hand-left" as const, activeColor: "#3b82f6", label: "Prayer" },
  { type: "dove" as const, icon: "leaf" as const, activeColor: "#10b981", label: "Peace" },
] as const;

interface ReactionBarProps {
  onReact: (type: "heart" | "candle" | "flower" | "prayer" | "dove") => void;
  counts?: Record<string, number>;
  userReaction?: string | null;
  compact?: boolean;
}

export function ReactionBar({ onReact, counts = {}, userReaction, compact = false }: ReactionBarProps) {
  if (compact) {
    return (
      <View className="flex-row items-center gap-3">
        {REACTIONS.map((reaction) => {
          const count = counts[reaction.type] ?? 0;
          const isActive = userReaction === reaction.type;
          return (
            <Pressable
              key={reaction.type}
              className="flex-row items-center gap-1"
              onPress={() => onReact(reaction.type)}
            >
              <Ionicons
                name={isActive ? reaction.icon : (`${reaction.icon}-outline` as any)}
                size={16}
                color={isActive ? reaction.activeColor : "#9ca3af"}
              />
              {count > 0 && (
                <Text className={`text-xs font-sans ${isActive ? "text-gray-700" : "text-gray-400"}`}>{count}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-around py-2 border-t border-gray-100">
      {REACTIONS.map((reaction) => {
        const count = counts[reaction.type] ?? 0;
        const isActive = userReaction === reaction.type;
        return (
          <Pressable
            key={reaction.type}
            className="items-center py-1.5 px-3"
            onPress={() => onReact(reaction.type)}
          >
            <Ionicons
              name={isActive ? reaction.icon : (`${reaction.icon}-outline` as any)}
              size={22}
              color={isActive ? reaction.activeColor : "#9ca3af"}
            />
            <Text className={`text-[10px] font-sans mt-0.5 ${isActive ? "text-gray-700" : "text-gray-400"}`}>
              {count > 0 ? `${count}` : reaction.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
