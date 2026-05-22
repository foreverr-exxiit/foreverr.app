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

export default function CreateWeddingPageScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user, profile } = useAuth();

  // Form state
  const [partner1Name, setPartner1Name] = useState(
    profile?.display_name ?? ""
  );
  const [partner2Name, setPartner2Name] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [howWeMet, setHowWeMet] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleHashtagChange = (text: string) => {
    // Strip leading # so we can auto-prefix it
    const cleaned = text.replace(/^#+/, "");
    setHashtag(cleaned);
  };

  const handleCreate = async () => {
    if (!user?.id) {
      Alert.alert("Sign In Required", "Please sign in to create a wedding page.");
      return;
    }
    if (!partner1Name.trim() || !partner2Name.trim()) {
      Alert.alert("Missing Info", "Please enter both partner names.");
      return;
    }
    if (!weddingDate.trim()) {
      Alert.alert("Missing Info", "Please enter the wedding date.");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await (supabase as any)
        .from("wedding_pages")
        .insert({
          created_by: user.id,
          partner1_name: partner1Name.trim(),
          partner2_name: partner2Name.trim(),
          wedding_date: weddingDate.trim(),
          venue_name: venueName.trim() || null,
          how_we_met: howWeMet.trim() || null,
          hashtag: hashtag.trim() || null,
          cover_photo_url: null,
          status: "active",
        })
        .select("id")
        .single();

      if (error) throw error;

      router.replace(`/wedding/${data.id}` as any);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not create wedding page. Please try again.");
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
              Create Wedding Page
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Celebrate your love story together
            </Text>
          </View>
          <View className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
            <Ionicons name="heart" size={20} color="#7C3AED" />
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
            <View className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3">
              <Ionicons name="rose" size={32} color="#7C3AED" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
              Your Wedding, Your Story
            </Text>
            <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
              Create a beautiful page to share your journey, collect RSVPs, messages, and gifts from loved ones.
            </Text>
          </View>

          <View className="px-4 gap-5">
            {/* Partner 1 Name */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Partner 1 Name *
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
                value={partner1Name}
                onChangeText={setPartner1Name}
              />
              <Text className="text-xs font-sans text-gray-400 mt-1 ml-1">
                Auto-filled from your profile
              </Text>
            </View>

            {/* Partner 2 Name */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Partner 2 Name *
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="Your partner's name"
                placeholderTextColor="#9ca3af"
                value={partner2Name}
                onChangeText={setPartner2Name}
              />
            </View>

            {/* Wedding Date */}
            <DatePickerField
              label="Wedding Date"
              value={weddingDate}
              onChange={setWeddingDate}
              placeholder="Select wedding date"
            />

            {/* Venue Name */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Venue Name
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="Where's the celebration?"
                placeholderTextColor="#9ca3af"
                value={venueName}
                onChangeText={setVenueName}
              />
            </View>

            {/* How We Met */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                How We Met
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="Tell your love story..."
                placeholderTextColor="#9ca3af"
                value={howWeMet}
                onChangeText={setHowWeMet}
                multiline
                style={{ minHeight: 100, textAlignVertical: "top" }}
              />
            </View>

            {/* Hashtag */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Wedding Hashtag
              </Text>
              <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <View className="bg-brand-50 dark:bg-brand-900/20 px-3 py-3.5 border-r border-gray-200 dark:border-gray-700">
                  <Text className="text-sm font-sans-bold text-brand-700">#</Text>
                </View>
                <TextInput
                  className="flex-1 px-3 py-3.5 text-sm font-sans text-gray-900 dark:text-white"
                  placeholder="ForeverYourNames"
                  placeholderTextColor="#9ca3af"
                  value={hashtag}
                  onChangeText={handleHashtagChange}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Cover Photo Placeholder */}
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Cover Photo
              </Text>
              <Pressable className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 items-center justify-center py-10">
                <View className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mb-3">
                  <Ionicons name="camera-outline" size={28} color="#9ca3af" />
                </View>
                <Text className="text-sm font-sans-semibold text-gray-500 dark:text-gray-400">
                  Tap to add cover photo
                </Text>
                <Text className="text-xs font-sans text-gray-400 mt-1">
                  Recommended: 1200 x 600px
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
                  <Ionicons name="heart" size={18} color="white" />
                  <Text className="text-base font-sans-bold text-white">
                    Create Page
                  </Text>
                </>
              )}
            </Pressable>

            {/* Info hint */}
            <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
              <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
              <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
                After creating, share your page with guests to collect RSVPs, messages, and celebrate together.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
