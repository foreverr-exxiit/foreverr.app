import { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, supabase } from "@foreverr/core";
import { Text } from "@foreverr/ui";

interface PetPage {
  id: string;
  created_by: string;
  pet_name: string;
  species: string;
  breed: string | null;
  date_of_birth: string | null;
  adoption_date: string | null;
  bio: string | null;
  photo_url: string | null;
  status: string; // "active" | "memorial"
  date_of_passing: string | null;
  personality_traits: string[] | null;
  favorite_things: string[] | null;
  created_at: string;
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: "\uD83D\uDC15",
  cat: "\uD83D\uDC08",
  bird: "\uD83D\uDC26",
  fish: "\uD83D\uDC20",
  horse: "\uD83D\uDC34",
  rabbit: "\uD83D\uDC07",
  hamster: "\uD83D\uDC39",
  reptile: "\uD83E\uDD8E",
  other: "\uD83D\uDC3E",
};

function computeAge(dateOfBirthStr: string): string {
  const dob = new Date(dateOfBirthStr + "T00:00:00");
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 1) {
    if (months === 0) return "Less than a month old";
    return `${months} month${months > 1 ? "s" : ""} old`;
  }
  if (years === 1 && months === 0) return "1 year old";
  if (years === 1) return `1 year, ${months} month${months > 1 ? "s" : ""} old`;
  if (months === 0) return `${years} years old`;
  return `${years} years, ${months} month${months > 1 ? "s" : ""} old`;
}

const TRAIT_COLORS = [
  "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400",
  "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
  "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400",
  "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
  "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
];

export default function PetPageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();

  const [pet, setPet] = useState<PetPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("pet_pages")
          .select("*")
          .eq("id", id)
          .single();

        if (!cancelled) {
          if (error) throw error;
          setPet(data as PetPage);
        }
      } catch (err: any) {
        if (!cancelled) {
          Alert.alert("Error", err?.message ?? "Could not load pet page.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isMemorial = pet?.status === "memorial";
  const speciesEmoji = SPECIES_EMOJI[pet?.species ?? "other"] ?? "\uD83D\uDC3E";

  const ageDisplay = useMemo(() => {
    if (!pet?.date_of_birth) return null;
    return computeAge(pet.date_of_birth);
  }, [pet?.date_of_birth]);

  // Theme colors based on lifecycle status
  const themeAccent = isMemorial ? "#7C3AED" : "#d97706"; // purple for memorial, amber for active
  const themeBg = isMemorial
    ? "bg-purple-50 dark:bg-purple-900/20"
    : "bg-amber-50 dark:bg-amber-900/20";
  const themeText = isMemorial
    ? "text-purple-700 dark:text-purple-400"
    : "text-amber-700 dark:text-amber-400";

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#4A2D7A" />
        <Text className="text-sm font-sans text-gray-400 mt-3">
          Loading pet page...
        </Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ fontSize: 48 }}>{"\uD83D\uDC3E"}</Text>
        <Text className="text-lg font-sans-bold text-gray-700 dark:text-gray-300 mt-4 text-center">
          Pet page not found
        </Text>
        <Pressable onPress={goBack} className="mt-6 bg-brand-700 rounded-full px-6 py-3">
          <Text className="text-sm font-sans-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        className={`px-4 pt-14 pb-4 border-b ${
          isMemorial
            ? "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30"
            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
        }`}
      >
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color={themeAccent} />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              {pet.pet_name}
            </Text>
            {isMemorial && (
              <Text className="text-xs font-sans text-purple-500 dark:text-purple-400 mt-0.5">
                In loving memory
              </Text>
            )}
          </View>
          {isMemorial && (
            <View className="bg-purple-100 dark:bg-purple-900/30 rounded-full px-3 py-1.5">
              <Text className="text-xs font-sans-bold text-purple-700 dark:text-purple-400">
                In Memory
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo Area */}
        <View className="items-center pt-6 pb-4">
          <View
            className={`h-28 w-28 rounded-3xl items-center justify-center ${
              isMemorial
                ? "bg-purple-100 dark:bg-purple-900/30"
                : "bg-amber-100 dark:bg-amber-900/30"
            }`}
            style={{
              shadowColor: themeAccent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {pet.photo_url ? (
              // If photo exists, we'd use Image from expo-image here
              <Text style={{ fontSize: 56 }}>{speciesEmoji}</Text>
            ) : (
              <Text style={{ fontSize: 56 }}>{speciesEmoji}</Text>
            )}
          </View>

          {/* Pet Name + Species */}
          <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white mt-4 text-center">
            {pet.pet_name} {speciesEmoji}
          </Text>

          {/* Breed Badge */}
          {pet.breed && (
            <View className={`mt-2 rounded-full px-4 py-1.5 ${themeBg}`}>
              <Text className={`text-xs font-sans-semibold ${themeText}`}>
                {pet.breed}
              </Text>
            </View>
          )}

          {/* Age Display */}
          {ageDisplay && (
            <View className="flex-row items-center mt-2 gap-1.5">
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text className="text-sm font-sans text-gray-600 dark:text-gray-400">
                {ageDisplay}
              </Text>
            </View>
          )}

          {/* Memorial Date */}
          {isMemorial && pet.date_of_passing && (
            <View className="mt-2 flex-row items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full px-4 py-1.5">
              <Ionicons name="heart" size={12} color="#7C3AED" />
              <Text className="text-xs font-sans-semibold text-purple-600 dark:text-purple-400">
                Passed on{" "}
                {new Date(pet.date_of_passing + "T00:00:00").toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </Text>
            </View>
          )}

          {/* Adoption Date */}
          {pet.adoption_date && (
            <View className="flex-row items-center mt-1.5 gap-1.5">
              <Ionicons name="home-outline" size={13} color="#6b7280" />
              <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
                Adopted{" "}
                {new Date(pet.adoption_date + "T00:00:00").toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Bio Section */}
        {pet.bio && (
          <View className="mx-4 mt-2">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons
                name={isMemorial ? "heart-circle-outline" : "paw"}
                size={20}
                color={themeAccent}
              />
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                {isMemorial ? "Remembering" : "About"} {pet.pet_name}
              </Text>
            </View>
            <View className="bg-white dark:bg-gray-800 rounded-xl px-4 py-4 border border-gray-100 dark:border-gray-700">
              <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-6">
                {pet.bio}
              </Text>
            </View>
          </View>
        )}

        {/* Personality Traits */}
        {pet.personality_traits && pet.personality_traits.length > 0 && (
          <View className="mx-4 mt-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="sparkles" size={18} color={themeAccent} />
              <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                Personality
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {pet.personality_traits.map((trait, i) => {
                const colorSet = TRAIT_COLORS[i % TRAIT_COLORS.length];
                const bgClass = colorSet.split(" ").slice(0, 2).join(" ");
                const textClass = colorSet.split(" ").slice(2).join(" ");
                return (
                  <View key={trait} className={`rounded-full px-3.5 py-1.5 ${bgClass}`}>
                    <Text className={`text-xs font-sans-semibold ${textClass}`}>
                      {trait}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Favorite Things */}
        {pet.favorite_things && pet.favorite_things.length > 0 && (
          <View className="mx-4 mt-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="star" size={18} color={themeAccent} />
              <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                Favorite Things
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {pet.favorite_things.map((thing) => (
                <View
                  key={thing}
                  className="rounded-full px-3.5 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300">
                    {thing}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats Row */}
        <View
          className={`mx-4 mt-6 flex-row rounded-xl border overflow-hidden ${
            isMemorial
              ? "bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
          }`}
        >
          {[
            { label: "Turning Points", value: "0", icon: "flag" as const },
            { label: "Tributes", value: "0", icon: "heart" as const },
            { label: "Photos", value: "0", icon: "images" as const },
          ].map((stat, i) => (
            <View
              key={stat.label}
              className={`flex-1 items-center py-4 ${
                i < 2
                  ? isMemorial
                    ? "border-r border-purple-100 dark:border-purple-900/30"
                    : "border-r border-gray-100 dark:border-gray-700"
                  : ""
              }`}
            >
              <Ionicons name={stat.icon} size={18} color={themeAccent} />
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mt-5">
          <Text className="text-xs font-sans-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              className={`flex-1 rounded-xl py-4 items-center ${
                isMemorial
                  ? "bg-purple-50 dark:bg-purple-900/20"
                  : "bg-brand-50 dark:bg-brand-900/20"
              }`}
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Gift sending for pet pages will be available soon!"
                )
              }
            >
              <Ionicons name="gift" size={24} color={themeAccent} />
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mt-1.5">
                Send Gift
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 rounded-xl py-4 items-center ${
                isMemorial
                  ? "bg-purple-50 dark:bg-purple-900/20"
                  : "bg-amber-50 dark:bg-amber-900/20"
              }`}
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Tribute writing for pet pages will be available soon!"
                )
              }
            >
              <Ionicons
                name={isMemorial ? "flower" : "create"}
                size={24}
                color={themeAccent}
              />
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mt-1.5">
                {isMemorial ? "Leave Tribute" : "Write Tribute"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Tributes Empty State */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons
              name={isMemorial ? "flower-outline" : "chatbubbles-outline"}
              size={20}
              color="#6b7280"
            />
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {isMemorial ? "Tributes" : "Messages"}
            </Text>
          </View>
          <View
            className={`rounded-xl border items-center py-12 px-6 ${
              isMemorial
                ? "bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30"
                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
            }`}
          >
            <View
              className={`h-16 w-16 rounded-full items-center justify-center mb-4 ${
                isMemorial
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
              }`}
            >
              <Ionicons
                name={isMemorial ? "flower" : "paw"}
                size={32}
                color={themeAccent}
              />
            </View>
            <Text className="text-base font-sans-semibold text-gray-600 dark:text-gray-300 text-center">
              No tributes yet
            </Text>
            <Text className="text-sm font-sans text-gray-400 text-center mt-1">
              {isMemorial
                ? `Share a memory or tribute to ${pet.pet_name}.`
                : `Be the first to celebrate ${pet.pet_name}!`}
            </Text>
            <Pressable
              className="mt-4 bg-brand-700 rounded-full px-6 py-3 flex-row items-center gap-2"
              onPress={() =>
                Alert.alert("Coming Soon", "Tributes coming soon!")
              }
            >
              <Ionicons
                name={isMemorial ? "flower" : "create-outline"}
                size={16}
                color="#FFFFFF"
              />
              <Text className="text-sm font-sans-bold text-white">
                {isMemorial ? "Leave a Tribute" : "Write Something"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
