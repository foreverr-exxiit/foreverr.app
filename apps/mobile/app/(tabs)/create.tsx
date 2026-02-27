import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRequireAuth } from "@foreverr/core";
import { Text, ForeverrLogo } from "@foreverr/ui";

const CREATE_OPTIONS = [
  {
    key: "memorial",
    icon: "flower" as const,
    color: "#4A2D7A",
    bg: "bg-brand-50 dark:bg-brand-900/20",
    title: "Create a Memorial",
    description: "Honor and celebrate a life. Share their story, photos, and memories.",
    route: "/memorial/create/basic-info",
    emoji: "🕊️",
  },
  {
    key: "living-tribute",
    icon: "gift" as const,
    color: "#059669",
    bg: "bg-green-50 dark:bg-green-900/20",
    title: "Living Tribute",
    description: "Honor someone who's alive — a birthday, retirement, or just because.",
    route: "/living-tribute/create",
    emoji: "🎉",
  },
  {
    key: "appreciation",
    icon: "mail" as const,
    color: "#8B5CF6",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    title: "Appreciation Letter",
    description: "Write a heartfelt letter to someone who's made a difference in your life.",
    route: "/appreciation/compose",
    emoji: "💌",
  },
  {
    key: "vault-item",
    icon: "lock-closed" as const,
    color: "#4f46e5",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    title: "Add to Vault",
    description: "Save a photo, video, or voice note to your memory vault.",
    route: "/memory-vault/create",
    emoji: "🔒",
  },
  {
    key: "scrapbook",
    icon: "book" as const,
    color: "#EC4899",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    title: "Create Scrapbook",
    description: "Design a beautiful scrapbook page with photos and text.",
    route: "/scrapbook/create",
    emoji: "📖",
  },
  {
    key: "give-flowers",
    icon: "flower" as const,
    color: "#e11d48",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    title: "Give Flowers",
    description: "Send a beautiful gift of flowers, candles, or keepsakes to a memorial.",
    route: "/gifts",
    emoji: "🌸",
  },
  {
    key: "request-celebrity",
    icon: "star" as const,
    color: "#d97706",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    title: "Request Celebrity Memorial",
    description: "Request that a notable person be added to Foreverr's memorial directory.",
    route: "/trust",
    emoji: "⭐",
  },
  {
    key: "import-content",
    icon: "cloud-upload" as const,
    color: "#64748b",
    bg: "bg-slate-50 dark:bg-slate-900/20",
    title: "Import Content",
    description: "Import photos, family trees, and memories from other platforms.",
    route: "/import",
    emoji: "📥",
  },
];

export default function CreateScreen() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14 items-center">
        <Pressable onPress={() => router.push("/(tabs)")} className="items-center">
          <ForeverrLogo width={550} variant="full" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16 }}>
        <View className="px-4 mb-4">
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">Create</Text>
          <Text className="text-sm font-sans text-gray-500 mt-1">
            What would you like to create today?
          </Text>
        </View>

        {CREATE_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
            onPress={() => requireAuth(() => router.push(option.route as any))}
          >
            <View className="flex-row items-center p-4">
              <View className={`h-14 w-14 rounded-2xl ${option.bg} items-center justify-center mr-4`}>
                <Text className="text-2xl">{option.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  {option.title}
                </Text>
                <Text className="text-xs font-sans text-gray-500 mt-0.5" numberOfLines={2}>
                  {option.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
