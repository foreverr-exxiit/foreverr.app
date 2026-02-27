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

  // Format dates
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}>
      {/* Memorial Details Card */}
      {memorial && (memorial.date_of_birth || memorial.date_of_death || memorial.place_of_birth || memorial.place_of_death) && (
        <View className="mx-4 mt-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-4">
          <Text className="text-sm font-sans-bold text-brand-800 dark:text-brand-200 mb-3">Memorial Details</Text>
          <View className="gap-3">
            {memorial.date_of_birth && (
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                  <Ionicons name="star" size={16} color="#4A2D7A" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-sans text-gray-500">Born</Text>
                  <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">
                    {formatDate(memorial.date_of_birth)}{memorial.place_of_birth ? ` · ${memorial.place_of_birth}` : ""}
                  </Text>
                </View>
              </View>
            )}
            {memorial.date_of_death && (
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center">
                  <Ionicons name="flower" size={16} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-sans text-gray-500">Passed</Text>
                  <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">
                    {formatDate(memorial.date_of_death)}{memorial.place_of_death ? ` · ${memorial.place_of_death}` : ""}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Obituary section */}
      {memorial?.obituary ? (
        <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-2">Obituary</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-6">
            {memorial.obituary}
          </Text>
        </View>
      ) : null}

      {/* Personality Traits — extended memorial data (from static/enhanced memorials) */}
      {(() => {
        const m = memorial as any;
        const traits: string[] = m?.personality_traits ?? [];
        if (traits.length === 0) return null;
        return (
          <View className="px-4 pt-4 pb-2">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">Personality</Text>
            <View className="flex-row flex-wrap gap-2">
              {traits.map((trait: string, i: number) => (
                <View key={i} className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5">
                  <Text className="text-xs font-sans-medium text-brand-700">{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })()}

      {/* Accomplishments */}
      {(() => {
        const m = memorial as any;
        const items: string[] = m?.accomplishments ?? [];
        if (items.length === 0) return null;
        return (
          <View className="px-4 pt-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">Accomplishments</Text>
            {items.map((item: string, i: number) => (
              <View key={i} className="flex-row items-start gap-2.5 mb-2">
                <Ionicons name="checkmark-circle" size={16} color="#4A2D7A" style={{ marginTop: 2 }} />
                <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 flex-1 leading-5">{item}</Text>
              </View>
            ))}
          </View>
        );
      })()}

      {/* Hobbies / Interests */}
      {(() => {
        const m = memorial as any;
        const hobbies: string[] = m?.hobbies ?? [];
        if (hobbies.length === 0) return null;
        return (
          <View className="px-4 pt-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">Hobbies & Interests</Text>
            <View className="flex-row flex-wrap gap-2">
              {hobbies.map((hobby: string, i: number) => (
                <View key={i} className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5">
                  <Text className="text-xs font-sans-medium text-amber-700 dark:text-amber-300">{hobby}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })()}

      {/* Support options */}
      <View className="px-4 py-6">
        <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-4">Show Your Support</Text>

        <Pressable
          className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-3"
          onPress={() => router.push("/donate")}
        >
          <View className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/20 items-center justify-center">
            <Ionicons name="flower" size={20} color="#059669" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Send Flowers</Text>
            <Text className="text-xs font-sans text-gray-500">Choose from our selection of sympathy arrangements</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <Pressable
          className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-3"
          onPress={() => router.push("/donate")}
        >
          <View className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/20 items-center justify-center">
            <Ionicons name="gift" size={20} color="#4A2D7A" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Memorial Gift</Text>
            <Text className="text-xs font-sans text-gray-500">Send a gift to honor their memory</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <Pressable
          className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-3"
          onPress={() => router.push("/donate")}
        >
          <View className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center">
            <Ionicons name="heart" size={20} color="#ef4444" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Donate</Text>
            <Text className="text-xs font-sans text-gray-500">Contribute to a cause in their name</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <Pressable
          className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4"
          onPress={() => router.push("/donate")}
        >
          <View className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 items-center justify-center">
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
        <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
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
        <View className="items-center px-8 py-8">
          <View className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
            <Ionicons name="document-text-outline" size={28} color="#9ca3af" />
          </View>
          <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 text-center mb-1">
            No obituary yet
          </Text>
          <Text className="text-xs font-sans text-gray-500 text-center">
            The memorial host can add an obituary or generate one with AI.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
