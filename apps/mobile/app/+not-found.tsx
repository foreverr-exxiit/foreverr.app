import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-8">
      <View className="h-20 w-20 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-6">
        <Ionicons name="compass-outline" size={40} color="#4A2D7A" />
      </View>
      <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2 text-center">
        Page not found
      </Text>
      <Text className="text-sm font-sans text-gray-500 text-center mb-6">
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Pressable
        className="rounded-full bg-brand-700 px-6 py-2.5"
        onPress={() => router.replace("/")}
      >
        <Text className="text-sm font-sans-semibold text-white">Go Home</Text>
      </Pressable>
    </View>
  );
}
