import { View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyTrustLevel } from "@foreverr/core";
import { Text, TrustLevelBadge, ListSkeleton } from "@foreverr/ui";

const TRUST_PERKS = [
  { level: 1, label: "Create Memorials", icon: "add-circle-outline" as const },
  { level: 2, label: "Create Fundraisers", icon: "cash-outline" as const },
  { level: 2, label: "Verified Badge", icon: "checkmark-circle-outline" as const },
  { level: 3, label: "Claim Memorials", icon: "flag-outline" as const },
  { level: 3, label: "Moderate Content", icon: "shield-outline" as const },
  { level: 4, label: "Unlimited Fundraising", icon: "infinite-outline" as const },
  { level: 4, label: "Legal Executor Perks", icon: "document-text-outline" as const },
];

const UPGRADE_STEPS = [
  {
    from: 1,
    to: 2,
    title: "Get Verified",
    description: "Verify your email and phone number to unlock fundraising and the verified badge.",
    icon: "mail-outline" as const,
  },
  {
    from: 2,
    to: 3,
    title: "Family Verification",
    description: "Submit a memorial claim with evidence to prove your family connection.",
    icon: "people-outline" as const,
  },
  {
    from: 3,
    to: 4,
    title: "Executor Status",
    description: "Provide legal documentation to gain full executor privileges.",
    icon: "document-attach-outline" as const,
  },
];

export default function TrustIndexScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: trustInfo, isLoading } = useMyTrustLevel(user?.id);

  const currentLevel = trustInfo?.trust_level ?? 1;

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-6">
        <ListSkeleton rows={5} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      {/* Current Level Badge */}
      <TrustLevelBadge
        level={currentLevel}
        levelName={trustInfo?.name ?? "Community"}
        isVerified={trustInfo?.verification_required ?? false}
      />

      {/* Level description */}
      <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 mt-3 mb-6">
        {trustInfo?.description ?? "Default community member"}
      </Text>

      {/* Your Perks */}
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">Your Perks</Text>
      <View className="mb-6">
        {TRUST_PERKS.map((perk, i) => {
          const unlocked = currentLevel >= perk.level;
          return (
            <View
              key={i}
              className={`flex-row items-center py-3 ${
                i < TRUST_PERKS.length - 1 ? "border-b border-gray-50 dark:border-gray-800" : ""
              }`}
            >
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  unlocked ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Ionicons
                  name={perk.icon}
                  size={18}
                  color={unlocked ? "#16a34a" : "#9ca3af"}
                />
              </View>
              <Text
                className={`text-sm font-sans-medium ml-3 flex-1 ${
                  unlocked ? "text-gray-900 dark:text-white" : "text-gray-400"
                }`}
              >
                {perk.label}
              </Text>
              {unlocked ? (
                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              ) : (
                <Text className="text-[10px] font-sans text-gray-400">Level {perk.level}+</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Upgrade Path */}
      {currentLevel < 4 && (
        <>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Upgrade Your Level
          </Text>
          {UPGRADE_STEPS.filter((s) => s.from >= currentLevel).map((step, i) => (
            <Pressable
              key={i}
              className={`rounded-2xl p-4 mb-3 border ${
                step.from === currentLevel
                  ? "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-700"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"
              }`}
              onPress={() => {
                if (step.from === currentLevel && step.to === 3) {
                  router.push("/trust/claim");
                }
              }}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    step.from === currentLevel
                      ? "bg-brand-100 dark:bg-brand-800/30"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <Ionicons
                    name={step.icon}
                    size={20}
                    color={step.from === currentLevel ? "#4A2D7A" : "#9ca3af"}
                  />
                </View>
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center">
                    <Text
                      className={`text-sm font-sans-semibold ${
                        step.from === currentLevel
                          ? "text-brand-700 dark:text-brand-300"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </Text>
                    <Text className="text-[10px] font-sans text-gray-400 ml-2">
                      Level {step.from} → {step.to}
                    </Text>
                  </View>
                  <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-1 leading-4">
                    {step.description}
                  </Text>
                </View>
                {step.from === currentLevel && (
                  <Ionicons name="chevron-forward" size={18} color="#4A2D7A" />
                )}
              </View>
            </Pressable>
          ))}
        </>
      )}

      {/* Already max level */}
      {currentLevel >= 4 && (
        <View className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-4 items-center">
          <Ionicons name="trophy" size={32} color="#16a34a" />
          <Text className="text-base font-sans-bold text-green-700 mt-2">Maximum Trust Level</Text>
          <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 mt-1 text-center">
            You have the highest trust level and full platform access.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
