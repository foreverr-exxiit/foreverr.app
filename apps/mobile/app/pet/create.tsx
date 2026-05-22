import { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, supabase } from "@foreverr/core";
import { Text, DatePickerField } from "@foreverr/ui";

const SPECIES = [
  { key: "dog", label: "Dog", emoji: "\uD83D\uDC15" },
  { key: "cat", label: "Cat", emoji: "\uD83D\uDC08" },
  { key: "bird", label: "Bird", emoji: "\uD83D\uDC26" },
  { key: "fish", label: "Fish", emoji: "\uD83D\uDC20" },
  { key: "horse", label: "Horse", emoji: "\uD83D\uDC34" },
  { key: "rabbit", label: "Rabbit", emoji: "\uD83D\uDC07" },
  { key: "hamster", label: "Hamster", emoji: "\uD83D\uDC39" },
  { key: "reptile", label: "Reptile", emoji: "\uD83E\uDD8E" },
  { key: "other", label: "Other", emoji: "\uD83D\uDC3E" },
] as const;

export default function CreatePetPageScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();

  // Form state
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("dog");
  const [breed, setBreed] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [adoptionDate, setAdoptionDate] = useState("");
  const [bio, setBio] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedSpeciesObj = SPECIES.find((s) => s.key === species) ?? SPECIES[0];

  const handleCreate = async () => {
    if (!user?.id) {
      Alert.alert("Sign In Required", "Please sign in to create a pet page.");
      return;
    }
    if (!petName.trim()) {
      Alert.alert("Missing Info", "Please enter your pet's name.");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await (supabase as any)
        .from("pet_pages")
        .insert({
          created_by: user.id,
          pet_name: petName.trim(),
          species,
          breed: breed.trim() || null,
          date_of_birth: dateOfBirth.trim() || null,
          adoption_date: adoptionDate.trim() || null,
          bio: bio.trim() || null,
          photo_url: null,
          status: "active",
        })
        .select("id")
        .single();

      if (error) throw error;

      router.replace(`/pet/${data.id}` as any);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not create pet page. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Create Pet Page
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Celebrate your furry (or scaly) friend
            </Text>
          </View>
          <View className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 items-center justify-center">
            <Text style={{ fontSize: 20 }}>{selectedSpeciesObj.emoji}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View className="items-center py-6">
            <View className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 items-center justify-center mb-3">
              <Text style={{ fontSize: 32 }}>{selectedSpeciesObj.emoji}</Text>
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
              Your Pet's Page
            </Text>
            <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
              Create a dedicated page to celebrate, share memories, and collect tributes for your beloved companion.
            </Text>
          </View>

          <View className="px-4 gap-5">
            {/* Pet Name */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Pet Name *
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="What's your pet's name?"
                placeholderTextColor="#9ca3af"
                value={petName}
                onChangeText={setPetName}
              />
            </View>

            {/* Species Selector */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Species *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {SPECIES.map((s) => (
                  <Pressable
                    key={s.key}
                    className={`items-center mr-3 rounded-xl px-4 py-3 border ${
                      species === s.key
                        ? "border-brand-700 bg-brand-50 dark:bg-brand-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    }`}
                    onPress={() => setSpecies(s.key)}
                  >
                    <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                    <Text
                      className={`text-xs font-sans-semibold mt-1 ${
                        species === s.key
                          ? "text-brand-700"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Breed */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Breed (optional)
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="e.g. Golden Retriever, Siamese"
                placeholderTextColor="#9ca3af"
                value={breed}
                onChangeText={setBreed}
              />
            </View>

            {/* Date of Birth */}
            <DatePickerField
              label="Date of Birth"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              placeholder="Select date of birth"
              optional
              maximumDate={new Date()}
              helpText="Approximate is fine!"
            />

            {/* Adoption Date */}
            <DatePickerField
              label="Adoption Date"
              value={adoptionDate}
              onChange={setAdoptionDate}
              placeholder="Select adoption date"
              optional
              maximumDate={new Date()}
            />

            {/* Bio */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                About Your Pet
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="Tell us about their personality, quirks, and what makes them special..."
                placeholderTextColor="#9ca3af"
                value={bio}
                onChangeText={setBio}
                multiline
                style={{ minHeight: 100, textAlignVertical: "top" }}
              />
            </View>

            {/* Photo Placeholder */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Pet Photo
              </Text>
              <Pressable className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 items-center justify-center py-10">
                <View className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mb-3">
                  <Ionicons name="camera-outline" size={28} color="#9ca3af" />
                </View>
                <Text className="text-sm font-sans-semibold text-gray-500 dark:text-gray-400">
                  Tap to add a photo
                </Text>
                <Text className="text-xs font-sans text-gray-400 mt-1">
                  Show off their best look
                </Text>
              </Pressable>
            </View>

            {/* Create Button */}
            <Pressable
              onPress={handleCreate}
              disabled={isCreating}
              className={`w-full rounded-full py-4 items-center flex-row justify-center gap-2 ${
                isCreating
                  ? "bg-brand-500"
                  : "bg-brand-700 active:bg-brand-800"
              }`}
              style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            >
              {isCreating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="paw" size={18} color="white" />
                  <Text className="text-base font-sans-bold text-white">
                    Create Page
                  </Text>
                </>
              )}
            </Pressable>

            {/* Info hint */}
            <View className="flex-row items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3">
              <Ionicons name="information-circle-outline" size={18} color="#d97706" />
              <Text className="flex-1 text-xs font-sans text-amber-600/80 dark:text-amber-400/80">
                You can always update your pet's page later with more photos, milestones, and memories.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
