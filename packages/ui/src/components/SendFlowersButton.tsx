import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface SendFlowersButtonProps {
  targetType: "user" | "memorial" | "living_tribute";
  targetId: string;
  recipientName: string;
  variant?: "compact" | "full" | "fab";
  onPress: () => void;
}

export function SendFlowersButton({
  targetType,
  targetId,
  recipientName,
  variant = "full",
  onPress,
}: SendFlowersButtonProps) {
  if (variant === "fab") {
    return (
      <Pressable
        className="h-14 w-14 rounded-full bg-pink-500 items-center justify-center shadow-lg"
        style={{
          shadowColor: "#ec4899",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={onPress}
      >
        <Ionicons name="flower" size={26} color="#ffffff" />
      </Pressable>
    );
  }

  if (variant === "compact") {
    return (
      <Pressable
        className="flex-row items-center gap-1.5 bg-pink-500 rounded-full px-4 py-2"
        onPress={onPress}
      >
        <Ionicons name="flower" size={16} color="#ffffff" />
        <Text className="text-xs font-sans-bold text-white">Send Flowers</Text>
      </Pressable>
    );
  }

  // variant === "full"
  return (
    <Pressable
      className="flex-row items-center justify-center gap-2 bg-pink-500 rounded-2xl py-4 px-6"
      style={{
        shadowColor: "#ec4899",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
      onPress={onPress}
    >
      <Ionicons name="flower" size={22} color="#ffffff" />
      <Text className="text-base font-sans-bold text-white">
        Send Flowers to {recipientName}
      </Text>
    </Pressable>
  );
}
