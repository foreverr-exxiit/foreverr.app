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
    lifecycle_type?: string | null;
  };
  onPress?: () => void;
  variant?: "compact" | "full";
}

const LIFECYCLE_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  memorial: { name: "flower", color: "#4A2D7A", bg: "bg-brand-100" },
  wedding: { name: "heart", color: "#EC4899", bg: "bg-pink-100" },
  birth: { name: "happy", color: "#EC4899", bg: "bg-pink-100" },
  birthday: { name: "gift", color: "#7C3AED", bg: "bg-purple-100" },
  retirement: { name: "sunny", color: "#059669", bg: "bg-green-100" },
  graduation: { name: "school", color: "#2563EB", bg: "bg-blue-100" },
  legacy: { name: "star", color: "#F97316", bg: "bg-orange-100" },
};

function formatYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "?";
  return new Date(dateStr).getFullYear().toString();
}

function formatDateLine(celeb: CelebrityCardProps["celebrity"], compact = false): string {
  const type = celeb.lifecycle_type ?? "memorial";
  if (type === "memorial" || type === "legacy") {
    const years = `${formatYear(celeb.date_of_birth)}\u2013${formatYear(celeb.date_of_death)}`;
    // In compact mode, show age on same line with shorter format
    if (celeb.age_at_death) {
      return compact ? `${years}, ${celeb.age_at_death}` : `${years} (age ${celeb.age_at_death})`;
    }
    return years;
  }
  if (type === "wedding") return celeb.date_of_birth ? `Married ${formatYear(celeb.date_of_birth)}` : "";
  if (type === "birth") return celeb.date_of_birth ? `Born ${formatYear(celeb.date_of_birth)}` : "";
  if (type === "birthday") return celeb.date_of_birth ? `Born ${formatYear(celeb.date_of_birth)}` : "";
  if (type === "retirement") return compact ? "Retired" : "Celebrating retirement";
  if (type === "graduation") return celeb.date_of_birth ? `Class of ${formatYear(celeb.date_of_birth)}` : "";
  return celeb.date_of_birth ? formatYear(celeb.date_of_birth) : "";
}

function lifecycleLabel(type: string | null | undefined): string | null {
  if (!type || type === "memorial") return null;
  const labels: Record<string, string> = {
    wedding: "\uD83D\uDC92 Wedding",
    birth: "\uD83D\uDC76 New Baby",
    birthday: "\uD83C\uDF82 Birthday",
    retirement: "\uD83C\uDF05 Retirement",
    graduation: "\uD83C\uDF93 Graduation",
    legacy: "\u2B50 Legacy",
  };
  return labels[type] ?? null;
}

export function CelebrityCard({ celebrity, onPress, variant = "compact" }: CelebrityCardProps) {
  const type = (celebrity as any).lifecycle_type ?? "memorial";
  const iconInfo = LIFECYCLE_ICONS[type] ?? LIFECYCLE_ICONS.memorial;
  const label = lifecycleLabel(type);

  if (variant === "compact") {
    return (
      <Pressable
        className="w-32 items-center mr-3"
        onPress={onPress}
      >
        <View className={`h-20 w-20 rounded-full ${iconInfo.bg} items-center justify-center overflow-hidden border-2 border-brand-200`}>
          <Ionicons name={iconInfo.name} size={28} color={iconInfo.color} />
        </View>
        <Text className="mt-2 text-xs font-sans-semibold text-gray-900 dark:text-white text-center" numberOfLines={1}>
          {celebrity.full_name}
        </Text>
        <Text className="text-[10px] font-sans text-gray-500 text-center" numberOfLines={1}>
          {celebrity.occupation ?? ""}
        </Text>
        {label ? (
          <Text className="text-[10px] font-sans-semibold text-center" numberOfLines={1} style={{ color: iconInfo.color }}>
            {label}
          </Text>
        ) : (
          <Text className="text-[10px] font-sans text-gray-400 text-center" numberOfLines={1}>
            {formatDateLine(celebrity, true)}
          </Text>
        )}
      </Pressable>
    );
  }

  // Full variant - list style
  return (
    <Pressable
      className="flex-row items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2"
      onPress={onPress}
    >
      <View className={`h-14 w-14 rounded-full ${iconInfo.bg} items-center justify-center overflow-hidden border border-brand-200`}>
        <Ionicons name={iconInfo.name} size={24} color={iconInfo.color} />
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white flex-shrink" numberOfLines={1}>{celebrity.full_name}</Text>
          {label && (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: iconInfo.color + "15" }}>
              <Text className="text-[9px] font-sans-semibold" style={{ color: iconInfo.color }}>{label}</Text>
            </View>
          )}
        </View>
        <Text className="text-xs font-sans text-brand-700 dark:text-brand-300" numberOfLines={1}>
          {celebrity.occupation ?? ""}{celebrity.nationality ? ` \u00B7 ${celebrity.nationality}` : ""}
        </Text>
        <Text className="text-[10px] font-sans text-gray-500 mt-0.5">
          {formatDateLine(celebrity)}
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
