import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface RsvpButtonProps {
  currentStatus: string | null;
  onRsvp: (status: "going" | "maybe" | "not_going") => void;
  disabled?: boolean;
}

const OPTIONS = [
  { key: "going" as const, label: "Going", icon: "checkmark-circle" as const, color: "#16a34a" },
  { key: "maybe" as const, label: "Maybe", icon: "help-circle" as const, color: "#d97706" },
  { key: "not_going" as const, label: "Can't Go", icon: "close-circle" as const, color: "#9ca3af" },
];

export function RsvpButton({ currentStatus, onRsvp, disabled }: RsvpButtonProps) {
  return (
    <View className="flex-row gap-2">
      {OPTIONS.map((opt) => {
        const isActive = currentStatus === opt.key;
        return (
          <Pressable
            key={opt.key}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2.5 border ${
              isActive ? "border-brand-700 bg-brand-50" : "border-gray-200 bg-white"
            }`}
            onPress={() => onRsvp(opt.key)}
            disabled={disabled}
          >
            <Ionicons name={opt.icon} size={16} color={isActive ? "#4A2D7A" : opt.color} />
            <Text className={`text-xs font-sans-semibold ${isActive ? "text-brand-700" : "text-gray-600"}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
