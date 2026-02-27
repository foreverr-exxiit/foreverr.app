import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface CelebrityCardProps {
  celebrity: {
    id: string;
    full_name: string;
    occupation?: string | null;
    nationality?: string | null;
    date_of_birth?: string | null;
    date_of_death?: string | null;
    age_at_death?: number | null;
    biography_summary?: string | null;
    photo_url?: string | null;
  };
  onPress?: () => void;
  variant?: "compact" | "full";
}

function formatYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "?";
  return new Date(dateStr).getFullYear().toString();
}

export function CelebrityCard({ celebrity, onPress, variant = "compact" }: CelebrityCardProps) {
  if (variant === "compact") {
    return (
      <Pressable
        className="w-32 items-center mr-3"
        onPress={onPress}
      >
        <View className="h-20 w-20 rounded-full bg-brand-100 items-center justify-center overflow-hidden border-2 border-brand-200">
          <Ionicons name="person" size={28} color="#7C3AED" />
        </View>
        <Text className="mt-2 text-xs font-sans-semibold text-gray-900 dark:text-white text-center" numberOfLines={1}>
          {celebrity.full_name}
        </Text>
        <Text className="text-[10px] font-sans text-gray-500 text-center" numberOfLines={1}>
          {celebrity.occupation ?? ""}
        </Text>
        <Text className="text-[10px] font-sans text-gray-400 text-center">
          {formatYear(celebrity.date_of_birth)}–{formatYear(celebrity.date_of_death)}
        </Text>
      </Pressable>
    );
  }

  // Full variant - list style
  return (
    <Pressable
      className="flex-row items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2"
      onPress={onPress}
    >
      <View className="h-14 w-14 rounded-full bg-brand-100 items-center justify-center overflow-hidden border border-brand-200">
        <Ionicons name="person" size={24} color="#7C3AED" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{celebrity.full_name}</Text>
        <Text className="text-xs font-sans text-brand-700" numberOfLines={1}>
          {celebrity.occupation ?? ""}{celebrity.nationality ? ` · ${celebrity.nationality}` : ""}
        </Text>
        <Text className="text-[10px] font-sans text-gray-500 mt-0.5">
          {formatYear(celebrity.date_of_birth)}–{formatYear(celebrity.date_of_death)}
          {celebrity.age_at_death ? ` (age ${celebrity.age_at_death})` : ""}
        </Text>
        {celebrity.biography_summary && (
          <Text className="text-xs font-sans text-gray-500 mt-1" numberOfLines={2}>
            {celebrity.biography_summary}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
    </Pressable>
  );
}
