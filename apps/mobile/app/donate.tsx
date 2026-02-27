import { View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@foreverr/core";
import { Text, Button, ForeverrLogo } from "@foreverr/ui";

const DONATION_OPTIONS = [
  {
    icon: "heart" as const,
    iconColor: "#ef4444",
    iconBg: "bg-red-50",
    title: "Donate to a Memorial",
    description: "Contribute to a fundraising campaign in someone's name.",
    route: "/(tabs)/search",
  },
  {
    icon: "gift" as const,
    iconColor: "#4A2D7A",
    iconBg: "bg-brand-100",
    title: "Send a Memorial Gift",
    description: "Choose from curated gifts to honor a loved one's memory.",
    route: "/(tabs)/search",
  },
  {
    icon: "ribbon" as const,
    iconColor: "#d97706",
    iconBg: "bg-amber-50",
    title: "Spirit Ribbons",
    description: "Purchase spirit ribbons to send gifts and support the community.",
    route: "/(tabs)/search",
  },
  {
    icon: "flower" as const,
    iconColor: "#059669",
    iconBg: "bg-green-50",
    title: "Send Flowers",
    description: "Send a beautiful virtual flower arrangement to a memorial.",
    route: "/(tabs)/search",
  },
];

export default function DonateScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14 items-center">
        <Pressable onPress={() => router.push("/(tabs)")}>
          <ForeverrLogo width={550} variant="full" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View className="items-center px-6 pt-8 pb-6">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <Ionicons name="heart" size={36} color="#ef4444" />
          </View>
          <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white text-center mb-2">
            Make a Difference
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center px-4">
            Honor the memory of loved ones through donations, gifts, and acts of kindness. Every contribution helps keep their legacy alive.
          </Text>
        </View>

        {/* Donation Options */}
        <View className="px-4">
          {DONATION_OPTIONS.map((option, index) => (
            <Pressable
              key={index}
              className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-3"
              onPress={() => {
                if (!isAuthenticated) {
                  router.push("/(auth)/login");
                } else {
                  router.push(option.route as any);
                }
              }}
            >
              <View className={`h-12 w-12 rounded-full ${option.iconBg} items-center justify-center`}>
                <Ionicons name={option.icon} size={24} color={option.iconColor} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
                  {option.title}
                </Text>
                <Text className="text-xs font-sans text-gray-500 mt-0.5">
                  {option.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </Pressable>
          ))}
        </View>

        {/* Stats */}
        <View className="mx-4 mt-6 rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-6">
          <Text className="text-base font-sans-bold text-brand-800 dark:text-brand-200 mb-4 text-center">
            Community Impact
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-sans-bold text-brand-700">1.2K</Text>
              <Text className="text-xs font-sans text-gray-500 mt-1">Donations</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-sans-bold text-brand-700">850</Text>
              <Text className="text-xs font-sans text-gray-500 mt-1">Gifts Sent</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-sans-bold text-brand-700">3.4K</Text>
              <Text className="text-xs font-sans text-gray-500 mt-1">Candles Lit</Text>
            </View>
          </View>
        </View>

        {/* Browse memorials CTA */}
        <View className="px-6 mt-6">
          <Button
            title="Browse Memorials"
            size="lg"
            fullWidth
            onPress={() => router.push("/(tabs)/search")}
          />
          <Pressable
            className="mt-3 items-center py-3"
            onPress={() => router.back()}
          >
            <Text className="text-sm font-sans-medium text-gray-500">Go Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
