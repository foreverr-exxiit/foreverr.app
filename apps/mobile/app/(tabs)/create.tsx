import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRequireAuth } from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

interface CreateOption {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  title: string;
  description: string;
  route: string;
  emoji: string;
}

const LIFECYCLE_SECTIONS: { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; color: string; options: CreateOption[] }[] = [
  {
    title: "Celebrate & Honor the Living",
    subtitle: "Birthdays, turning points, achievements",
    icon: "sparkles",
    color: "#F59E0B",
    options: [
      {
        key: "living-tribute",
        icon: "gift",
        color: "#059669",
        bg: "bg-green-50 dark:bg-green-900/20",
        title: "Living Tribute",
        description: "Honor someone who's alive \u2014 a birthday, retirement, or just because.",
        route: "/living-tribute/create",
        emoji: "\uD83C\uDF89",
      },
      {
        key: "announce",
        icon: "megaphone",
        color: "#2563EB",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        title: "Announce & Share",
        description: "Create beautiful cards for birthdays, events, milestones & share everywhere.",
        route: "/announce",
        emoji: "\uD83D\uDCE3",
      },
      {
        key: "appreciation",
        icon: "mail",
        color: "#8B5CF6",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        title: "Appreciation Letter",
        description: "Write a heartfelt letter to someone who's made a difference in your life.",
        route: "/appreciation/compose",
        emoji: "\uD83D\uDC8C",
      },
      {
        key: "wedding",
        icon: "heart-circle",
        color: "#F59E0B",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        title: "Wedding Page",
        description: "Create a beautiful page for your special day \u2014 RSVP, guest book & more.",
        route: "/wedding/create",
        emoji: "\uD83D\uDC92",
      },
      {
        key: "pet-page",
        icon: "paw",
        color: "#EC4899",
        bg: "bg-pink-50 dark:bg-pink-900/20",
        title: "Pet Page",
        description: "Celebrate your furry friend or honor a beloved pet who has crossed the rainbow bridge.",
        route: "/pet/create",
        emoji: "\uD83D\uDC3E",
      },
    ],
  },
  {
    title: "Preserve & Remember",
    subtitle: "Capture stories, create memorials",
    icon: "flower",
    color: "#8B5CF6",
    options: [
      {
        key: "memorial",
        icon: "flower",
        color: "#4A2D7A",
        bg: "bg-brand-50 dark:bg-brand-900/20",
        title: "Create a Memorial",
        description: "Create a lasting tribute for someone who has passed. Share their story forever.",
        route: "/lifecycle/create/basic-info",
        emoji: "\uD83D\uDD4A\uFE0F",
      },
      {
        key: "vault-item",
        icon: "lock-closed",
        color: "#4f46e5",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        title: "Add to Core",
        description: "Save a photo, video, or voice note to The Core.",
        route: "/memory-vault/create",
        emoji: "\uD83D\uDD12",
      },
      {
        key: "scrapbook",
        icon: "book",
        color: "#EC4899",
        bg: "bg-pink-50 dark:bg-pink-900/20",
        title: "Create Scrapbook",
        description: "Design a beautiful scrapbook page with photos and text.",
        route: "/scrapbook/create",
        emoji: "\uD83D\uDCD6",
      },
    ],
  },
  {
    title: "Support & Connect",
    subtitle: "Send gifts, flowers & love",
    icon: "heart",
    color: "#EC4899",
    options: [
      {
        key: "give-flowers",
        icon: "flower",
        color: "#e11d48",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        title: "Give Flowers & Gifts",
        description: "Send flowers, candles, or keepsakes to someone you love \u2014 living or remembered.",
        route: "/gifts",
        emoji: "\uD83C\uDF38",
      },
      {
        key: "request-celebrity",
        icon: "star",
        color: "#d97706",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        title: "Request Celebrity Memorial",
        description: "Request that a notable person be added to ǝterrn's memorial directory.",
        route: "/trust",
        emoji: "\u2B50",
      },
      {
        key: "import-content",
        icon: "cloud-upload",
        color: "#64748b",
        bg: "bg-slate-50 dark:bg-slate-900/20",
        title: "Import Content",
        description: "Import photos, family trees, and memories from other platforms.",
        route: "/import",
        emoji: "\uD83D\uDCE5",
      },
    ],
  },
];

export default function CreateScreen() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14 items-center">
        <View className="items-center">
          <EternLogo width={960} variant="full" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}>
        <View className="px-4 mb-4">
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">Create</Text>
          <Text className="text-sm font-sans text-gray-500 mt-1">
            Every stage of life deserves to be honored
          </Text>
        </View>

        {LIFECYCLE_SECTIONS.map((section) => (
          <View key={section.title} className="mb-5">
            {/* Section header */}
            <View className="flex-row items-center px-4 mb-2.5">
              <View
                className="h-7 w-7 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: `${section.color}15` }}
              >
                <Ionicons name={section.icon} size={14} color={section.color} />
              </View>
              <View>
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  {section.title}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400">
                  {section.subtitle}
                </Text>
              </View>
            </View>

            {/* Options */}
            {section.options.map((option) => (
              <Pressable
                key={option.key}
                className="mx-4 mb-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
                onPress={() => requireAuth(() => router.push(option.route as any))}
              >
                <View className="flex-row items-center p-3.5">
                  <View className={`h-12 w-12 rounded-2xl ${option.bg} items-center justify-center mr-3`}>
                    <Text className="text-xl">{option.emoji}</Text>
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
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
