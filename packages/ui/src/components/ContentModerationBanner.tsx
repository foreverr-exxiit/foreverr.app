import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ContentModerationBannerProps {
  flagged: boolean;
  action: "flag" | "block";
  message?: string;
}

export function ContentModerationBanner({
  flagged,
  action,
  message,
}: ContentModerationBannerProps) {
  if (!flagged) return null;

  const isBlock = action === "block";

  return (
    <View
      className={`flex-row items-center rounded-xl p-3 ${
        isBlock ? "bg-red-50" : "bg-amber-50"
      }`}
    >
      <Ionicons
        name={isBlock ? "shield" : "warning"}
        size={20}
        color={isBlock ? "#ef4444" : "#d97706"}
      />
      <View className="ml-2.5 flex-1">
        <Text
          className={`text-sm font-sans-semibold ${
            isBlock ? "text-red-700" : "text-amber-700"
          }`}
        >
          {isBlock ? "Content Blocked" : "Content Flagged"}
        </Text>
        <Text
          className={`text-xs font-sans mt-0.5 ${
            isBlock ? "text-red-600" : "text-amber-600"
          }`}
        >
          {message ||
            (isBlock
              ? "This content violates our community guidelines and cannot be posted."
              : "This content has been flagged for review. It may be moderated.")}
        </Text>
      </View>
    </View>
  );
}
