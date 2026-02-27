import { View, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  useCanFundraise,
  useCreateFundraiser,
  useMyFundraisers,
  useFundraiserDetails,
  useMemorial,
} from "@foreverr/core";
import { Text, FundraiserCard, ListSkeleton, TrustLevelBadge } from "@foreverr/ui";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function FundraiserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: memorial } = useMemorial(id);
  const { data: canFundraise, isLoading: loadingTrust } = useCanFundraise(user?.id);
  const { data: myFundraisers, isLoading: loadingFundraisers } = useMyFundraisers(user?.id);
  const createFundraiser = useCreateFundraiser();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalDollars, setGoalDollars] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryRelation, setBeneficiaryRelation] = useState("");

  const existingForMemorial = (myFundraisers ?? []).filter((f: any) => f.memorial_id === id);
  const isLoading = loadingTrust || loadingFundraisers;

  const canSubmit =
    title.trim().length > 0 &&
    goalDollars.length > 0 &&
    parseFloat(goalDollars) > 0 &&
    !createFundraiser.isPending;

  const handleCreate = async () => {
    if (!canSubmit || !user?.id || !id) return;

    const goalCents = Math.round(parseFloat(goalDollars) * 100);

    try {
      await createFundraiser.mutateAsync({
        memorialId: id,
        creatorId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        goalCents,
        beneficiaryName: beneficiaryName.trim() || undefined,
        beneficiaryRelation: beneficiaryRelation.trim() || undefined,
      });

      Alert.alert("Fundraiser Created", "Your fundraiser has been created successfully.");
      setShowForm(false);
      setTitle("");
      setDescription("");
      setGoalDollars("");
      setBeneficiaryName("");
      setBeneficiaryRelation("");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to create fundraiser.");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-6">
        <ListSkeleton rows={3} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Memorial Context */}
      {memorial && (
        <View className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 mb-4">
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">Fundraising for</Text>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-1">
            {(memorial as any).first_name} {(memorial as any).last_name}
          </Text>
        </View>
      )}

      {/* Trust Gate */}
      {!canFundraise && (
        <View className="rounded-2xl border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="lock-closed" size={20} color="#d97706" />
            <Text className="text-sm font-sans-semibold text-yellow-700 dark:text-yellow-300 ml-2">
              Verification Required
            </Text>
          </View>
          <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 leading-5">
            You need to be at least Trust Level 2 (Verified) to create a fundraiser. Verify your email and phone to get started.
          </Text>
          <Pressable
            className="mt-3 bg-brand-700 rounded-full py-2.5 items-center"
            onPress={() => router.push("/trust")}
          >
            <Text className="text-sm font-sans-semibold text-white">View Trust Levels</Text>
          </Pressable>
        </View>
      )}

      {/* Existing Fundraisers for This Memorial */}
      {existingForMemorial.length > 0 && (
        <>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Active Fundraisers
          </Text>
          {existingForMemorial.map((f: any) => (
            <FundraiserCard
              key={f.id}
              title={f.title}
              goalCents={f.goal_cents}
              raisedCents={f.raised_cents}
              donorCount={f.donor_count}
              isVerified={f.is_verified}
              trustLevel={f.trust_level}
              onDonate={() =>
                Alert.alert("Donate", "Payment integration coming soon.")
              }
            />
          ))}
        </>
      )}

      {/* Create New Fundraiser */}
      {canFundraise && !showForm && (
        <Pressable
          className="rounded-2xl border-2 border-dashed border-brand-300 dark:border-brand-600 p-6 items-center mt-4"
          onPress={() => setShowForm(true)}
        >
          <View className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mb-3">
            <Ionicons name="add" size={24} color="#4A2D7A" />
          </View>
          <Text className="text-sm font-sans-semibold text-brand-700 dark:text-brand-300">
            Create New Fundraiser
          </Text>
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-1 text-center">
            Raise funds for funeral costs, family support, or memorial upkeep
          </Text>
        </Pressable>
      )}

      {/* Create Form */}
      {canFundraise && showForm && (
        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              New Fundraiser
            </Text>
            <Pressable onPress={() => setShowForm(false)} className="p-1">
              <Ionicons name="close" size={22} color="#6b7280" />
            </Pressable>
          </View>

          {/* Title */}
          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white bg-white dark:bg-gray-800 mb-4"
            placeholder="e.g., Help with funeral expenses"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-sans text-gray-900 dark:text-white bg-white dark:bg-gray-800 min-h-[80px] mb-4"
            placeholder="Describe the purpose of this fundraiser..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          {/* Goal */}
          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Goal Amount (USD) *
          </Text>
          <View className="flex-row items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 mb-4">
            <Text className="text-sm font-sans-semibold text-gray-400 pl-4">$</Text>
            <TextInput
              className="flex-1 px-2 py-3 text-sm font-sans text-gray-900 dark:text-white"
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              value={goalDollars}
              onChangeText={setGoalDollars}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Beneficiary */}
          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Beneficiary Name (optional)
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white bg-white dark:bg-gray-800 mb-4"
            placeholder="Who will receive the funds?"
            placeholderTextColor="#9ca3af"
            value={beneficiaryName}
            onChangeText={setBeneficiaryName}
          />

          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Beneficiary Relationship (optional)
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white bg-white dark:bg-gray-800 mb-4"
            placeholder="e.g., Spouse, Family"
            placeholderTextColor="#9ca3af"
            value={beneficiaryRelation}
            onChangeText={setBeneficiaryRelation}
          />

          {/* Info */}
          <View className="flex-row bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-6">
            <Ionicons name="information-circle-outline" size={16} color="#9ca3af" style={{ marginTop: 1 }} />
            <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 ml-2 flex-1 leading-4">
              A 5% platform fee applies to all donations. Funds are released after verification.
            </Text>
          </View>

          {/* Submit */}
          <Pressable
            className={`rounded-full py-4 items-center ${
              canSubmit ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
            }`}
            onPress={handleCreate}
            disabled={!canSubmit}
          >
            {createFundraiser.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="heart" size={18} color="white" />
                <Text className="text-base font-sans-semibold text-white ml-2">Create Fundraiser</Text>
              </View>
            )}
          </Pressable>
        </View>
      )}

      {/* Empty State */}
      {existingForMemorial.length === 0 && !showForm && !canFundraise && (
        <View className="items-center py-12 mt-4">
          <Ionicons name="heart-circle-outline" size={48} color="#d1d5db" />
          <Text className="text-sm font-sans text-gray-400 mt-3 text-center">
            No fundraisers for this memorial yet.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
