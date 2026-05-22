import { View, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Platform, Alert, Share } from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useRequireAuth, useHonorFundraiser, useHonorDonations, supabase } from "@foreverr/core";
import { Text } from "@foreverr/ui";
import { useQueryClient } from "@tanstack/react-query";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function HonorFundraiserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: fundraiser, isLoading } = useHonorFundraiser(id);
  const { requireAuth } = useRequireAuth();
  const { data: donations } = useHonorDonations(id);
  const qc = useQueryClient();

  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donateMessage, setDonateMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);

  const handleDonate = async () => {
    const amountCents = Math.round(parseFloat(donateAmount || "0") * 100);
    if (amountCents < 100) {
      const msg = "Minimum donation is $1.00";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Minimum", msg);
      return;
    }
    setIsDonating(true);
    try {
      await (supabase as any).from("honor_donations").insert({
        fundraiser_id: id,
        donor_id: user?.id ?? null,
        donor_name: isAnonymous ? "Anonymous" : (donorName.trim() || "Kind Soul"),
        amount_cents: amountCents,
        message: donateMessage.trim() || null,
        is_anonymous: isAnonymous,
        payment_status: "completed",
      });
      // Update fundraiser totals
      await (supabase as any).from("honor_fundraisers").update({
        raised_cents: (fundraiser?.raised_cents ?? 0) + amountCents,
        donor_count: (fundraiser?.donor_count ?? 0) + 1,
      }).eq("id", id);

      qc.invalidateQueries({ queryKey: ["honor-fundraiser", id] });
      qc.invalidateQueries({ queryKey: ["honor-donations", id] });

      const msg = `Thank you for donating ${formatCents(amountCents)}!`;
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Thank You! 💚", msg);
      setShowDonateModal(false);
      setDonateAmount("");
      setDonorName("");
      setDonateMessage("");
    } catch {
      const msg = "Donation failed. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    } finally {
      setIsDonating(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Support "${fundraiser?.title}" — a fundraiser in honor of ${fundraiser?.honoree_name}. Donate now on ǝterrn!`,
        url: `https://eterrn.app/honor-fundraiser/${id}`,
      });
    } catch {}
  };

  const progressPct = useMemo(() => {
    if (!fundraiser?.goal_cents || fundraiser.goal_cents === 0) return 0;
    return Math.min((fundraiser.raised_cents / fundraiser.goal_cents) * 100, 100);
  }, [fundraiser]);

  const isOwner = user?.id === fundraiser?.organizer_id;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!fundraiser) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-8">
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-4">Fundraiser Not Found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Hero */}
      <View className="h-48 bg-gradient-to-b from-brand-700 to-brand-900 items-center justify-center px-6">
        <Text className="text-4xl mb-2">🎗️</Text>
        <Text className="text-lg font-sans-bold text-white text-center" numberOfLines={2}>
          {fundraiser.title}
        </Text>
        <Text className="text-sm font-sans text-brand-200 mt-1">
          In honor of {fundraiser.honoree_name}
        </Text>
      </View>

      {/* Progress Card */}
      <View className="mx-4 -mt-6 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
        <View className="flex-row items-end justify-between mb-2">
          <View>
            <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white">
              {formatCents(fundraiser.raised_cents)}
            </Text>
            <Text className="text-xs font-sans text-gray-500">
              raised of {formatCents(fundraiser.goal_cents)} goal
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-lg font-sans-bold text-brand-700">{fundraiser.donor_count}</Text>
            <Text className="text-xs font-sans text-gray-500">donors</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
          <View
            className="h-full rounded-full bg-green-500"
            style={{ width: `${progressPct}%` }}
          />
        </View>
        <Text className="text-[10px] font-sans text-gray-400 mt-1">{progressPct.toFixed(0)}% funded</Text>

        {/* Donate button */}
        <Pressable
          className="mt-4 bg-green-600 rounded-xl py-3.5 items-center"
          onPress={() => requireAuth(() => setShowDonateModal(true))}
        >
          <Text className="text-base font-sans-bold text-white">Donate Now</Text>
        </Pressable>

        {/* Share */}
        <Pressable
          className="mt-2 border border-gray-200 dark:border-gray-600 rounded-xl py-3 items-center flex-row justify-center gap-2"
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={16} color="#4A2D7A" />
          <Text className="text-sm font-sans-semibold text-brand-700">Share Fundraiser</Text>
        </Pressable>
      </View>

      {/* Organizer */}
      <Pressable
        className="mx-4 mt-4 flex-row items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3"
        onPress={() => router.push(`/user/${fundraiser.organizer_id}` as any)}
      >
        <View className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
          <Ionicons name="person" size={18} color="#4A2D7A" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-xs font-sans text-gray-500">Organized by</Text>
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
            {fundraiser.organizer?.display_name ?? "Organizer"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </Pressable>

      {/* Beneficiary info */}
      <View className="mx-4 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <View className="flex-row items-center gap-2 mb-1">
          <Ionicons name="heart-circle-outline" size={16} color="#2563eb" />
          <Text className="text-xs font-sans-semibold text-blue-800 dark:text-blue-300">Beneficiary</Text>
        </View>
        <Text className="text-sm font-sans-semibold text-blue-900 dark:text-blue-200">
          {fundraiser.beneficiary_name}
        </Text>
        <Text className="text-xs font-sans text-blue-700 dark:text-blue-400 capitalize mt-0.5">
          {fundraiser.beneficiary_type.replace(/_/g, " ")}
        </Text>
        {fundraiser.organizer_fee_pct > 0 && (
          <Text className="text-[10px] font-sans text-blue-600 dark:text-blue-500 mt-2">
            Transparency: {fundraiser.organizer_fee_pct}% organizer fee · 5% platform fee · {100 - fundraiser.organizer_fee_pct - 5}% goes to beneficiary
          </Text>
        )}
      </View>

      {/* Description */}
      {fundraiser.description && (
        <View className="mx-4 mt-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">About</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-6">
            {fundraiser.description}
          </Text>
        </View>
      )}

      {/* Story */}
      {fundraiser.story && (
        <View className="mx-4 mt-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">The Story</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-6">
            {fundraiser.story}
          </Text>
        </View>
      )}

      {/* Recent Donors */}
      <View className="mx-4 mt-6">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
          Recent Donors ({donations?.length ?? 0})
        </Text>
        {(!donations || donations.length === 0) ? (
          <View className="items-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <Ionicons name="people-outline" size={28} color="#d1d5db" />
            <Text className="text-xs font-sans text-gray-400 mt-2">Be the first to donate!</Text>
          </View>
        ) : (
          donations.slice(0, 10).map((donation: any) => (
            <View key={donation.id} className="flex-row items-center py-2.5 border-b border-gray-50 dark:border-gray-800">
              <View className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                <Ionicons name={donation.is_anonymous ? "eye-off-outline" : "person"} size={14} color="#059669" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">
                  {donation.is_anonymous ? "Anonymous" : donation.donor_name}
                </Text>
                {donation.message && (
                  <Text className="text-[10px] font-sans text-gray-500 mt-0.5" numberOfLines={1}>
                    "{donation.message}"
                  </Text>
                )}
              </View>
              <View className="items-end">
                <Text className="text-xs font-sans-bold text-green-700 dark:text-green-400">
                  {formatCents(donation.amount_cents)}
                </Text>
                <Text className="text-[9px] font-sans text-gray-400">{timeAgo(donation.created_at)}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Owner stats */}
      {isOwner && fundraiser.organizer_earned_cents > 0 && (
        <View className="mx-4 mt-6 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <Text className="text-sm font-sans-semibold text-green-800 dark:text-green-300 mb-1">
            Your Earnings
          </Text>
          <Text className="text-xl font-sans-bold text-green-700 dark:text-green-400">
            {formatCents(fundraiser.organizer_earned_cents)}
          </Text>
          <Text className="text-[10px] font-sans text-green-600 mt-1">
            {fundraiser.organizer_fee_pct}% of {formatCents(fundraiser.raised_cents)} raised
          </Text>
        </View>
      )}

      {/* Donate Modal */}
      <Modal visible={showDonateModal} transparent animationType="slide" onRequestClose={() => setShowDonateModal(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowDonateModal(false)}>
          <Pressable className="bg-white dark:bg-gray-900 rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
            {/* Handle */}
            <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-4" />

            {/* Header */}
            <View className="items-center mb-5">
              <Text className="text-4xl mb-2">💚</Text>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                Donate to {fundraiser.honoree_name}
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-1">
                {fundraiser.title}
              </Text>
            </View>

            {/* Amount presets */}
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Choose Amount</Text>
            <View className="flex-row gap-2 mb-3">
              {[500, 1000, 2500, 5000].map((cents) => {
                const selected = donateAmount === (cents / 100).toString();
                return (
                  <Pressable
                    key={cents}
                    className={`flex-1 py-3 rounded-xl items-center ${selected ? "bg-green-600" : "bg-gray-100 dark:bg-gray-800"}`}
                    onPress={() => setDonateAmount((cents / 100).toString())}
                  >
                    <Text className={`text-sm font-sans-bold ${selected ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      ${cents / 100}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom amount */}
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4">
              <Text className="text-sm font-sans text-gray-500 mr-1">$</Text>
              <TextInput
                className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
                placeholder="Custom amount"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={donateAmount}
                onChangeText={setDonateAmount}
              />
            </View>

            {/* Donor name */}
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Your Name</Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-3"
              placeholder="Your name (shown on donation)"
              placeholderTextColor="#9ca3af"
              value={donorName}
              onChangeText={setDonorName}
              editable={!isAnonymous}
            />

            {/* Anonymous toggle */}
            <Pressable
              className="flex-row items-center gap-2 mb-3"
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <Ionicons
                name={isAnonymous ? "checkbox" : "square-outline"}
                size={20}
                color={isAnonymous ? "#059669" : "#9ca3af"}
              />
              <Text className="text-xs font-sans text-gray-600 dark:text-gray-400">Donate anonymously</Text>
            </Pressable>

            {/* Message */}
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Message (optional)</Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-5"
              placeholder="Your words of support..."
              placeholderTextColor="#9ca3af"
              value={donateMessage}
              onChangeText={setDonateMessage}
              multiline
              numberOfLines={2}
              style={{ minHeight: 50, textAlignVertical: "top" }}
            />

            {/* Donate button */}
            <Pressable
              className={`rounded-xl py-4 items-center ${parseFloat(donateAmount || "0") >= 1 ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"}`}
              onPress={handleDonate}
              disabled={isDonating || parseFloat(donateAmount || "0") < 1}
            >
              {isDonating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="heart" size={18} color={parseFloat(donateAmount || "0") >= 1 ? "#ffffff" : "#9ca3af"} />
                  <Text className={`text-base font-sans-bold ${parseFloat(donateAmount || "0") >= 1 ? "text-white" : "text-gray-400"}`}>
                    Donate {parseFloat(donateAmount || "0") >= 1 ? `$${parseFloat(donateAmount).toFixed(2)}` : ""}
                  </Text>
                </View>
              )}
            </Pressable>

            <Text className="text-[10px] font-sans text-gray-400 text-center mt-2">
              {fundraiser.organizer_fee_pct > 0
                ? `${100 - fundraiser.organizer_fee_pct - 5}% to beneficiary · ${fundraiser.organizer_fee_pct}% organizer · 5% platform`
                : "95% goes to the beneficiary · 5% platform fee"}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
