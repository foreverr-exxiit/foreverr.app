import { View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button } from "@foreverr/ui";

export default function CreateScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-gray-900">
      <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-brand-100">
        <Text className="text-4xl">🕊️</Text>
      </View>
      <Text variant="h2" className="mb-3 text-center">
        Create a Memorial
      </Text>
      <Text variant="body" className="mb-8 text-center text-gray-500">
        Honor and celebrate the life of someone special. Share their story,
        photos, and memories with loved ones.
      </Text>
      <Button
        title="Get Started"
        size="lg"
        fullWidth
        onPress={() => router.push("/memorial/create/basic-info")}
      />
    </View>
  );
}
