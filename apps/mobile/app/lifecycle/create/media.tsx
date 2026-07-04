import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, supabase, useWizardStore, analytics, captureException, useAutoSetupReminders } from "@foreverr/core";
import type { Memorial } from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

const PRIVACY_OPTIONS = [
  { value: "public" as const, label: "Public", description: "Anyone can find and view this memorial", icon: "earth" },
  { value: "private" as const, label: "Private", description: "Only you and co-hosts can view", icon: "lock-closed" },
  { value: "invited" as const, label: "Invite Only", description: "Only people you invite can view", icon: "mail" },
];

export default function MediaScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/lifecycle/create/details" as any);
  }, [router]);
  const { user } = useAuth();
  const { data, updateData, reset } = useWizardStore();
  const autoSetupReminders = useAutoSetupReminders();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resultId, setResultId] = useState("");
  const [resultName, setResultName] = useState("");

  const isSignedIn = !!user?.id;

  const pickImage = async (type: "profile" | "cover") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === "profile") {
        updateData({ profilePhotoUri: uri });
      } else {
        updateData({ coverPhotoUri: uri });
      }
    }
  };

  const handleCreate = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to create a memorial.");
      return;
    }
    if (!data.firstName?.trim()) {
      setError("Missing first name. Please go back and fill in the required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the memorial
      const { data: memorialRow, error: dbError } = await supabase
        .from("memorials")
        .insert({
          created_by: user!.id,
          first_name: data.firstName,
          last_name: data.lastName,
          middle_name: data.middleName || null,
          nickname: data.nickname || null,
          date_of_birth: data.dateOfBirth || null,
          date_of_death: data.dateOfDeath || null,
          obituary: null,
          biography: null,
          privacy: data.privacy,
          status: "active",
          slug: "",
        })
        .select()
        .single();

      if (dbError) throw dbError;
      const memorial = memorialRow as unknown as Memorial;

      // Create the host record
      await supabase.from("memorial_hosts").insert({
        memorial_id: memorial.id,
        user_id: user!.id,
        role: "owner",
        relationship: data.relationship as any || "friend",
        relationship_detail: data.relationshipDetail || null,
      });

      // Auto-follow the memorial
      await supabase.from("followers").insert({
        memorial_id: memorial.id,
        user_id: user!.id,
      });

      analytics.track("memorial_created", {
        memorial_id: memorial.id,
        privacy: data.privacy,
        has_profile_photo: !!data.profilePhotoUri,
        has_cover_photo: !!data.coverPhotoUri,
        has_date_of_birth: !!data.dateOfBirth,
        has_date_of_death: !!data.dateOfDeath,
        relationship: data.relationship || "unknown",
      });

      // Auto-create birthday / anniversary reminders from the dates the
      // user just entered. Non-blocking: a reminder failure must never
      // break memorial creation — the memorial already exists.
      if (data.dateOfBirth || data.dateOfDeath) {
        autoSetupReminders
          .mutateAsync({
            user_id: user!.id,
            memorial_id: memorial.id,
            memorial_name: `${data.firstName} ${data.lastName || ""}`.trim(),
            date_of_birth: data.dateOfBirth || undefined,
            date_of_death: data.dateOfDeath || undefined,
          })
          .catch((remErr) =>
            captureException(remErr, {
              where: "lifecycle.create.media.autoSetupReminders",
              memorial_id: memorial.id,
            }),
          );
      }

      setResultId(memorial.id);
      setResultName(`${data.firstName} ${data.lastName || ""}`.trim());
      reset();
      setSuccess(true);
    } catch (err: any) {
      captureException(err, {
        where: "lifecycle.create.media.handleCreate",
        privacy: data.privacy,
      });
      setError(err?.message || "Failed to create memorial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success state ──────────────────────────────────────────────
  if (success) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2">
            Memorial Created!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            The memorial for {resultName} has been created. You can now add tributes, photos, and invite others to contribute.
          </Text>
          <View className="w-full gap-3">
            <Pressable
              onPress={() => router.replace(`/lifecycle/${resultId}` as any)}
              className="bg-brand-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-base font-sans-bold text-white">View Memorial</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/(tabs)" as any)}
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl py-4 items-center"
            >
              <Text className="text-base font-sans-bold text-gray-600 dark:text-gray-400">Go Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ─── Main form ──────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Photos & Privacy
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Step 3 of 3 — Final touches
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sign-in banner */}
        {!isSignedIn && (
          <Pressable
            onPress={() => router.push("/(auth)/login" as any)}
            className="mx-4 mt-4 flex-row items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3"
          >
            <Ionicons name="log-in-outline" size={20} color="#d97706" />
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-yellow-800 dark:text-yellow-300">
                Sign in to create a memorial
              </Text>
              <Text className="text-xs font-sans text-yellow-600 dark:text-yellow-400 mt-0.5">
                Tap here to sign in or create an account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#d97706" />
          </Pressable>
        )}

        {/* Progress bar */}
        <View className="px-4 pt-4">
          <View className="flex-row gap-2 mb-6">
            <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
            <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
            <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
          </View>
        </View>

        <View className="px-4 gap-5">
          {/* Profile Photo */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Profile Photo
            </Text>
            <Pressable
              onPress={() => pickImage("profile")}
              className="h-32 w-32 items-center justify-center self-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              {data.profilePhotoUri ? (
                <Image source={{ uri: data.profilePhotoUri }} style={{ width: 128, height: 128 }} contentFit="cover" />
              ) : (
                <View className="items-center">
                  <Ionicons name="camera" size={32} color="#9ca3af" />
                  <Text className="text-xs font-sans text-gray-400 mt-1">Add Photo</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Cover Photo */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Cover Photo (optional)
            </Text>
            <Pressable
              onPress={() => pickImage("cover")}
              className="h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              {data.coverPhotoUri ? (
                <Image source={{ uri: data.coverPhotoUri }} style={{ width: "100%", height: 160 }} contentFit="cover" />
              ) : (
                <View className="items-center">
                  <Ionicons name="image" size={32} color="#9ca3af" />
                  <Text className="text-xs font-sans text-gray-400 mt-1">Add Cover Photo</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Privacy */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Privacy Setting
            </Text>
            <View className="gap-2">
              {PRIVACY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  className={`flex-row items-center rounded-xl border p-4 ${
                    data.privacy === opt.value
                      ? "border-brand-700 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                  onPress={() => updateData({ privacy: opt.value })}
                >
                  <View className={`mr-3 h-5 w-5 items-center justify-center rounded-full border-2 ${
                    data.privacy === opt.value ? "border-brand-700" : "border-gray-300 dark:border-gray-600"
                  }`}>
                    {data.privacy === opt.value && (
                      <View className="h-2.5 w-2.5 rounded-full bg-brand-700" />
                    )}
                  </View>
                  <Ionicons
                    name={opt.icon as any}
                    size={16}
                    color={data.privacy === opt.value ? "#4A2D7A" : "#6b7280"}
                    style={{ marginRight: 8 }}
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{opt.label}</Text>
                    <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">{opt.description}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Error Message (inline) */}
          {error.length > 0 && (
            <View className="flex-row items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="flex-1 text-sm font-sans text-red-700 dark:text-red-400">
                {error}
              </Text>
              <Pressable onPress={() => setError("")}>
                <Ionicons name="close" size={16} color="#ef4444" />
              </Pressable>
            </View>
          )}

          {/* Create button */}
          <Pressable
            onPress={handleCreate}
            className={`w-full rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              isSubmitting
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="heart-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Create Memorial
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              After creating, you can add tributes, upload photos, invite family members, and build a beautiful memorial page.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
