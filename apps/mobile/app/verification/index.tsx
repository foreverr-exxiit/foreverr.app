import { View, ScrollView, Pressable, ActivityIndicator, Alert, Platform, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyCreatorProfile, useUpsertCreatorProfile, TIER_INFO } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const VERIFICATION_STEPS = [
  {
    key: "profile",
    title: "Complete Profile",
    description: "Fill in your display name, bio, tagline, and specialties",
    icon: "person-outline",
    check: (cp: any) => !!(cp?.display_name && cp?.bio && cp?.tagline),
  },
  {
    key: "services",
    title: "List a Service",
    description: "Create at least one active service listing",
    icon: "briefcase-outline",
    check: (cp: any) => (cp?.service_count ?? 0) > 0,
  },
  {
    key: "orders",
    title: "Complete Orders",
    description: "Successfully complete at least 3 orders",
    icon: "checkmark-done-outline",
    check: (cp: any) => (cp?.lifetime_orders ?? 0) >= 3,
  },
  {
    key: "rating",
    title: "Maintain Rating",
    description: "Keep a rating of 4.0 or above",
    icon: "star-outline",
    check: (cp: any) => (cp?.rating_avg ?? 0) >= 4.0 || (cp?.rating_count ?? 0) === 0,
  },
  {
    key: "identity",
    title: "Verify Identity",
    description: "Submit your real name and a short verification statement",
    icon: "shield-checkmark-outline",
    check: (_cp: any) => false, // Manual step
  },
];

export default function VerificationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: creatorProfile, isLoading } = useMyCreatorProfile(user?.id);
  const updateProfile = useUpsertCreatorProfile();
  const [verificationStatement, setVerificationStatement] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const tierInfo = TIER_INFO[(creatorProfile?.tier as keyof typeof TIER_INFO) ?? "rising"];
  const isVerified = creatorProfile?.is_verified;
  const appStatus = creatorProfile?.application_status;
  const isPending = appStatus === "pending";

  const completedSteps = VERIFICATION_STEPS.filter((s) => s.check(creatorProfile));
  const progress = completedSteps.length / VERIFICATION_STEPS.length;
  const canSubmit = completedSteps.length >= 4 && verificationStatement.length >= 20;

  const handleSubmitVerification = async () => {
    if (!user?.id || !creatorProfile) return;
    try {
      await updateProfile.mutateAsync({
        user_id: user.id,
        display_name: creatorProfile.display_name,
        bio: creatorProfile.bio,
        tagline: creatorProfile.tagline,
        specialties: creatorProfile.specialties as string[],
        avatar_url: creatorProfile.avatar_url,
        application_status: "pending",
      });
      setSubmitted(true);
      const msg = "Your verification request has been submitted. We'll review it within 2–3 business days.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Submitted! 🎉", msg);
    } catch {
      const msg = "Could not submit verification request. Please try again.";
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

  if (!creatorProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
        <Ionicons name="shield-outline" size={48} color="#d1d5db" />
        <Text className="text-sm font-sans text-gray-400 mt-3 text-center">
          You need a creator profile to apply for verification
        </Text>
        <Pressable className="mt-4 bg-brand-700 rounded-xl px-6 py-3" onPress={() => router.push("/creator" as any)}>
          <Text className="text-sm font-sans-bold text-white">Go to Creator Hub</Text>
        </Pressable>
      </View>
    );
  }

  // Already verified
  if (isVerified) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center px-6 py-12">
          <View className="h-24 w-24 rounded-full bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={56} color="#059669" />
          </View>
          <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white mb-2">You're Verified!</Text>
          <Text className="text-sm font-sans text-gray-500 text-center">
            Your creator profile has been verified. The verified badge appears on your profile and services.
          </Text>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mt-6 w-full">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Verified Benefits</Text>
            {[
              "Verified badge on your profile",
              "Priority in search results",
              "Higher trust from potential clients",
              "Access to premium features",
              "Featured creator eligibility",
            ].map((benefit) => (
              <View key={benefit} className="flex-row items-center gap-2 mb-2">
                <Ionicons name="checkmark" size={14} color="#059669" />
                <Text className="text-xs font-sans text-gray-600 dark:text-gray-400">{benefit}</Text>
              </View>
            ))}
          </View>

          <Pressable
            className="mt-4 bg-brand-700 rounded-xl px-6 py-3"
            onPress={() => router.push("/creator" as any)}
          >
            <Text className="text-sm font-sans-bold text-white">Back to Creator Hub</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="shield-checkmark-outline" size={24} color="#4A2D7A" />
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Creator Verification</Text>
        </View>
        <Text className="text-xs font-sans text-gray-500 mt-1">
          Get verified to build trust and unlock premium features
        </Text>
      </View>

      {/* Pending Status */}
      {(isPending || submitted) && (
        <View className="mx-4 mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-full bg-amber-100 items-center justify-center">
            <Ionicons name="hourglass-outline" size={20} color="#d97706" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-sans-semibold text-amber-800 dark:text-amber-300">Under Review</Text>
            <Text className="text-[11px] font-sans text-amber-600 dark:text-amber-400">
              Your verification request is being reviewed. This usually takes 2–3 business days.
            </Text>
          </View>
        </View>
      )}

      {/* Progress */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Progress</Text>
          <Text className="text-xs font-sans-semibold text-brand-700">
            {completedSteps.length}/{VERIFICATION_STEPS.length} complete
          </Text>
        </View>
        <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <View className="h-full bg-brand-700 rounded-full" style={{ width: `${progress * 100}%` }} />
        </View>
      </View>

      {/* Steps Checklist */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl overflow-hidden">
        {VERIFICATION_STEPS.map((step, i) => {
          const isComplete = step.check(creatorProfile);
          return (
            <View
              key={step.key}
              className={`flex-row items-start px-4 py-4 ${i > 0 ? "border-t border-gray-50 dark:border-gray-700" : ""}`}
            >
              <View className={`h-7 w-7 rounded-full items-center justify-center mr-3 ${
                isComplete ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-700"
              }`}>
                <Ionicons
                  name={isComplete ? "checkmark" : (step.icon as any)}
                  size={14}
                  color={isComplete ? "#059669" : "#9ca3af"}
                />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-sans-semibold ${
                  isComplete ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"
                }`}>
                  {step.title}
                </Text>
                <Text className="text-[11px] font-sans text-gray-500 mt-0.5">{step.description}</Text>
              </View>
              {isComplete && (
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
              )}
            </View>
          );
        })}
      </View>

      {/* Verification Statement */}
      {!isPending && !submitted && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">Verification Statement</Text>
          <Text className="text-[11px] font-sans text-gray-500 mb-3">
            Tell us why you should be verified and how you serve the ǝterrn community.
          </Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-sm font-sans text-gray-900 dark:text-white min-h-[100px]"
            placeholder="I am a certified grief counselor with 5+ years of experience helping families..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            value={verificationStatement}
            onChangeText={setVerificationStatement}
            maxLength={500}
          />
          <Text className="text-[10px] font-sans text-gray-400 mt-1 text-right">
            {verificationStatement.length}/500
          </Text>
        </View>
      )}

      {/* Submit Button */}
      {!isPending && !submitted && (
        <View className="mx-4 mt-3">
          <Pressable
            className={`rounded-xl py-4 items-center ${canSubmit ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"}`}
            onPress={handleSubmitVerification}
            disabled={!canSubmit || updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="shield-checkmark" size={18} color="#fff" />
                <Text className="text-sm font-sans-bold text-white">Submit Verification Request</Text>
              </View>
            )}
          </Pressable>
          {!canSubmit && (
            <Text className="text-[10px] font-sans text-gray-400 mt-2 text-center">
              Complete at least 4 steps and write a verification statement (min 20 chars) to submit
            </Text>
          )}
        </View>
      )}

      {/* Current Tier Info */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4 mb-4">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">Your Current Tier</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-xl">{tierInfo.icon}</Text>
          <View>
            <Text className="text-sm font-sans-semibold" style={{ color: tierInfo.color }}>{tierInfo.name}</Text>
            <Text className="text-[10px] font-sans text-gray-400">{creatorProfile.tier_points} points</Text>
          </View>
        </View>
        <Text className="text-[10px] font-sans text-gray-400 mt-2">
          Verification is available at all tiers. Higher tiers get faster review.
        </Text>
      </View>
    </ScrollView>
  );
}
