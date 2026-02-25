import { View, ScrollView, Linking, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemorial, useAuth } from "@foreverr/core";
import { Text, Button } from "@foreverr/ui";

export default function SupportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: memorial } = useMemorial(id);

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}>
      {/* Obituary section */}
      {memorial?.obituary ? (
        <View className="px-4 py-4 border-b border-gray-100">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">Obituary</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-5">
            {memorial.obituary}
          </Text>
        </View>
      ) : null}

      {/* Support options */}
      <View className="px-4 py-6">
        <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-4">Show Your Support</Text>

        <Pressable className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-3">
          <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
            <Ionicons name="flower" size={20} color="#4A2D7A" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Send Flowers</Text>
            <Text className="text-xs font-sans text-gray-500">Choose from our selection of sympathy arrangements</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <Pressable className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-3">
          <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
            <Ionicons name="gift" size={20} color="#4A2D7A" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Memorial Gift</Text>
            <Text className="text-xs font-sans text-gray-500">Send a gift to honor their memory</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <Pressable className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-3">
          <View className="h-10 w-10 rounded-full bg-red-50 items-center justify-center">
            <Ionicons name="heart" size={20} color="#ef4444" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Donate</Text>
            <Text className="text-xs font-sans text-gray-500">Contribute to a cause in their name</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <Pressable className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
          <View className="h-10 w-10 rounded-full bg-amber-50 items-center justify-center">
            <Ionicons name="flame" size={20} color="#d97706" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Light a Candle</Text>
            <Text className="text-xs font-sans text-gray-500">Light a virtual candle in remembrance</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
      </View>

      {/* AI Generate button for hosts */}
      {user && (
        <View className="px-4 py-4 border-b border-gray-100">
          <Pressable
            className="flex-row items-center rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4"
            onPress={() => router.push(`/memorial/${id}/ai-obituary`)}
          >
            <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
              <Ionicons name="sparkles" size={20} color="#4A2D7A" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-sans-semibold text-brand-700">
                {memorial?.obituary ? "Regenerate with AI" : "Generate Obituary with AI"}
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                Create a meaningful obituary using AI
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#4A2D7A" />
          </Pressable>
        </View>
      )}

      {/* If no obituary, show placeholder */}
      {!memorial?.obituary && !user && (
        <View className="items-center px-8 py-6">
          <Ionicons name="document-text-outline" size={36} color="#d1d5db" />
          <Text className="mt-2 text-sm font-sans text-gray-500 text-center">
            No obituary has been added yet.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
