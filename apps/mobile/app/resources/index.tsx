import { ScrollView, View, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";

type ResourceLink = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
};

export default function ResourcesScreen() {
  const router = useRouter();

  const crisisLines: ResourceLink[] = [
    {
      title: "988 Suicide & Crisis Lifeline",
      subtitle: "Call or text 988 — 24/7, free, confidential",
      icon: "call",
      color: "#2563eb",
      onPress: () => Linking.openURL("tel:988"),
    },
    {
      title: "Crisis Text Line",
      subtitle: "Text HOME to 741741 — free 24/7 support",
      icon: "chatbubble",
      color: "#7c3aed",
      onPress: () => Linking.openURL("sms:741741&body=HOME"),
    },
    {
      title: "GriefShare",
      subtitle: "Find a local grief support group",
      icon: "people",
      color: "#059669",
      onPress: () => Linking.openURL("https://www.griefshare.org/findagroup"),
    },
  ];

  const inAppResources: ResourceLink[] = [
    {
      title: "Grief Coaching",
      subtitle: "1-on-1 sessions with certified counselors",
      icon: "heart",
      color: "#dc2626",
      onPress: () => router.push("/grief-coaching"),
    },
    {
      title: "Daily Prompts",
      subtitle: "Gentle reflections to process memories",
      icon: "sunny",
      color: "#f59e0b",
      onPress: () => router.push("/daily-prompt"),
    },
    {
      title: "Memory Prompts",
      subtitle: "Guided questions to capture moments",
      icon: "bulb",
      color: "#0891b2",
      onPress: () => router.push("/memory-prompts"),
    },
    {
      title: "Legacy Letters",
      subtitle: "Write letters to loved ones",
      icon: "mail",
      color: "#7c3aed",
      onPress: () => router.push("/legacy-letters"),
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white">
          Resources
        </Text>
        <Text className="text-sm font-sans text-gray-500 mt-1">
          Support, tools, and help when you need it
        </Text>
      </View>

      <View className="px-4 mt-5">
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wide mb-3">
          Crisis Support
        </Text>
        <View className="gap-2">
          {crisisLines.map((r) => (
            <ResourceCard key={r.title} resource={r} />
          ))}
        </View>
      </View>

      <View className="px-4 mt-6 mb-8">
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wide mb-3">
          In ǝterrn
        </Text>
        <View className="gap-2">
          {inAppResources.map((r) => (
            <ResourceCard key={r.title} resource={r} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function ResourceCard({ resource }: { resource: ResourceLink }) {
  return (
    <Pressable
      onPress={resource.onPress}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex-row items-center gap-3 active:opacity-70"
    >
      <View
        className="h-11 w-11 rounded-full items-center justify-center"
        style={{ backgroundColor: `${resource.color}15` }}
      >
        <Ionicons name={resource.icon} size={20} color={resource.color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
          {resource.title}
        </Text>
        <Text className="text-xs font-sans text-gray-500 mt-0.5">
          {resource.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}
