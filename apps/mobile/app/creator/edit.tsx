import { View, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyCreatorProfile, useUpsertCreatorProfile, SERVICE_CATEGORIES, ServiceCategory } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const SPECIALTY_OPTIONS = Object.entries(SERVICE_CATEGORIES).map(([key, val]) => ({ key: key as ServiceCategory, ...val }));

export default function EditCreatorProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyCreatorProfile(user?.id);
  const upsertProfile = useUpsertCreatorProfile();

  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isAccepting, setIsAccepting] = useState(true);

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTagline(profile.tagline || "");
      setBio(profile.bio || "");
      setSpecialties(profile.specialties || []);
      setIsAccepting(profile.is_accepting_orders ?? true);
    }
  }, [profile]);

  const toggleSpecialty = (key: string) => {
    setSpecialties((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!displayName.trim()) {
      const msg = "Please enter a display name.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Required", msg);
      return;
    }
    try {
      await upsertProfile.mutateAsync({
        user_id: user.id,
        display_name: displayName.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        specialties,
      });
      const msg = "Your creator profile has been updated!";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Saved!", msg);
      router.back();
    } catch {
      const msg = "Failed to save. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-4 py-5">
        <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-1">Edit Creator Profile</Text>
        <Text className="text-xs font-sans text-gray-500 mb-6">This is how buyers see you</Text>

        {/* Display Name */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Display Name *</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="Your creator name"
          placeholderTextColor="#9ca3af"
          value={displayName}
          onChangeText={setDisplayName}
        />

        {/* Tagline */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tagline</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder='e.g., "Compassionate tribute writer & memorial designer"'
          placeholderTextColor="#9ca3af"
          value={tagline}
          onChangeText={setTagline}
        />

        {/* Bio */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bio</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="Tell potential buyers about yourself, your experience, and what makes you unique..."
          placeholderTextColor="#9ca3af"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={5}
          style={{ minHeight: 120, textAlignVertical: "top" }}
        />

        {/* Specialties */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Specialties</Text>
        <Text className="text-[10px] font-sans text-gray-400 mb-2">Select the services you're best at</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {SPECIALTY_OPTIONS.map((opt) => {
            const selected = specialties.includes(opt.key);
            return (
              <Pressable
                key={opt.key}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                  selected ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-800"
                }`}
                onPress={() => toggleSpecialty(opt.key)}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={14}
                  color={selected ? "#ffffff" : "#4A2D7A"}
                />
                <Text
                  className={`text-[11px] font-sans-semibold ${
                    selected ? "text-white" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Accepting Orders Toggle */}
        <Pressable
          className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6"
          onPress={() => setIsAccepting(!isAccepting)}
        >
          <Ionicons
            name={isAccepting ? "checkmark-circle" : "close-circle"}
            size={22}
            color={isAccepting ? "#059669" : "#ef4444"}
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
              {isAccepting ? "Accepting Orders" : "Not Accepting Orders"}
            </Text>
            <Text className="text-xs font-sans text-gray-500">
              {isAccepting ? "Buyers can place new orders" : "Your services are paused"}
            </Text>
          </View>
        </Pressable>

        {/* Save */}
        <Pressable
          className={`rounded-xl py-4 items-center ${upsertProfile.isPending ? "bg-brand-400" : "bg-brand-700"}`}
          onPress={handleSave}
          disabled={upsertProfile.isPending}
        >
          {upsertProfile.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-base font-sans-bold text-white">Save Changes</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
