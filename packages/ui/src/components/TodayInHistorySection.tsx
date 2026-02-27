import { View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";
import { CelebrityCard } from "./CelebrityCard";

interface TodayInHistorySectionProps {
  celebrities: Array<{
    id: string;
    full_name: string;
    occupation?: string | null;
    nationality?: string | null;
    date_of_birth?: string | null;
    date_of_death?: string | null;
    age_at_death?: number | null;
    biography_summary?: string | null;
    photo_url?: string | null;
  }>;
  onCelebrityPress?: (id: string) => void;
}

export function TodayInHistorySection({ celebrities, onCelebrityPress }: TodayInHistorySectionProps) {
  if (!celebrities || celebrities.length === 0) return null;

  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dateLabel = `${monthNames[today.getMonth()]} ${today.getDate()}`;

  return (
    <View className="mt-4">
      <View className="flex-row items-center px-4 mb-3">
        <Ionicons name="time-outline" size={18} color="#7C3AED" />
        <Text className="ml-1.5 text-base font-sans-bold text-gray-900 dark:text-white">
          On This Day
        </Text>
        <Text className="ml-2 text-xs font-sans text-gray-500">
          {dateLabel}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {celebrities.map((celeb) => (
          <CelebrityCard
            key={celeb.id}
            celebrity={celeb}
            variant="compact"
            onPress={() => onCelebrityPress?.(celeb.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
