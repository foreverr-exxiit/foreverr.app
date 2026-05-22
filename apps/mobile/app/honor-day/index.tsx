import { View, ScrollView, Pressable, TextInput, Modal, ActivityIndicator, Platform, Alert, FlatList } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useHostedMemorials, useFollowedMemorials, useAvailableHonorDays, useHonorDaySponsorships, useSponsorDay, HONOR_DAY_BADGES } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const AMOUNT_PRESETS = [
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$25", cents: 2500 },
  { label: "$50", cents: 5000 },
];

export default function HonorDayScreen() {
  const router = useRouter();
  const { memorialId: paramMemorialId, memorialName: paramMemorialName } = useLocalSearchParams<{ memorialId: string; memorialName?: string }>();
  const { user } = useAuth();

  // Memorial picker state — used when no memorialId is passed via params
  const [pickedMemorialId, setPickedMemorialId] = useState<string | null>(null);
  const [pickedMemorialName, setPickedMemorialName] = useState<string | null>(null);

  const memorialId = paramMemorialId || pickedMemorialId || undefined;
  const memorialName = paramMemorialName || pickedMemorialName || undefined;

  const { data: hostedMemorials, isLoading: hostLoading } = useHostedMemorials(user?.id);
  const { data: followedMemorials, isLoading: followLoading } = useFollowedMemorials(user?.id);
  const needsPicker = !paramMemorialId;

  const { data: availableDays, isLoading } = useAvailableHonorDays(memorialId);
  const { data: sponsorships } = useHonorDaySponsorships(memorialId);
  const sponsorDay = useSponsorDay();

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateLabel, setSelectedDateLabel] = useState("");
  const [amountCents, setAmountCents] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState("candle");

  const handleSelectDate = (date: string, label: string) => {
    setSelectedDate(date);
    setSelectedDateLabel(label);
    setShowModal(true);
  };

  const handleSponsor = async () => {
    if (!user?.id || !memorialId) return;
    const finalAmount = customAmount ? Math.round(parseFloat(customAmount) * 100) : amountCents;
    if (finalAmount < 100) {
      const msg = "Minimum sponsorship is $1.00";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Minimum Amount", msg);
      return;
    }

    try {
      await sponsorDay.mutateAsync({
        memorial_id: memorialId,
        sponsor_id: user.id,
        sponsored_date: selectedDate,
        amount_cents: finalAmount,
        message: message.trim() || undefined,
        sponsor_name: sponsorName.trim() || undefined,
        is_anonymous: isAnonymous,
        display_badge: selectedBadge,
      });
      setShowModal(false);
      const msg = `You've sponsored ${selectedDateLabel} in honor of ${memorialName ?? "their memory"}!`;
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Thank You! 🕯️", msg);
    } catch {
      const msg = "This date may already be sponsored. Please try another date.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          Honor a Day
        </Text>
        <Text className="text-xs font-sans text-gray-500 mt-1">
          Sponsor a day in memory of {memorialName ?? "your loved one"}. Your name and message will appear on their memorial page for the entire day.
        </Text>
      </View>

      {/* Memorial Picker — shown when no memorialId in params */}
      {needsPicker && !memorialId && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-1">
            Choose a Memorial
          </Text>
          <Text className="text-[11px] font-sans text-gray-400 mb-3">
            Select whose memorial you'd like to honor with a sponsored day.
          </Text>

          {hostLoading || followLoading ? (
            <ActivityIndicator size="small" color="#4A2D7A" />
          ) : (
            <>
              {/* Hosted Memorials */}
              {(hostedMemorials ?? []).length > 0 && (
                <View className="mb-3">
                  <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Your Memorials
                  </Text>
                  {(hostedMemorials ?? []).map((m: any) => (
                    <Pressable
                      key={m.id}
                      className="flex-row items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-3 mb-2"
                      onPress={() => {
                        setPickedMemorialId(m.id);
                        setPickedMemorialName(`${m.first_name} ${m.last_name}`.trim());
                      }}
                    >
                      <View className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                        <Ionicons name="heart" size={14} color="#4A2D7A" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                          {m.first_name} {m.last_name}
                        </Text>
                        {m.date_of_birth && (
                          <Text className="text-[10px] font-sans text-gray-400">
                            {new Date(m.date_of_birth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {m.date_of_death ? ` — ${new Date(m.date_of_death).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Followed Memorials */}
              {(followedMemorials ?? []).length > 0 && (
                <View>
                  <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Memorials You Follow
                  </Text>
                  {(followedMemorials ?? []).slice(0, 10).map((m: any) => (
                    <Pressable
                      key={m.id}
                      className="flex-row items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-3 mb-2"
                      onPress={() => {
                        setPickedMemorialId(m.id);
                        setPickedMemorialName(`${m.first_name} ${m.last_name}`.trim());
                      }}
                    >
                      <View className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
                        <Ionicons name="flower" size={14} color="#d97706" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                          {m.first_name} {m.last_name}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* No memorials fallback */}
              {(hostedMemorials ?? []).length === 0 && (followedMemorials ?? []).length === 0 && (
                <View className="items-center py-6">
                  <Ionicons name="flower-outline" size={32} color="#d1d5db" />
                  <Text className="text-sm font-sans text-gray-400 mt-2 text-center">
                    You don't have any memorials yet.{"\n"}Create or follow a memorial first.
                  </Text>
                  <Pressable
                    className="mt-3 bg-brand-700 rounded-xl px-4 py-2"
                    onPress={() => router.push("/(tabs)/create" as any)}
                  >
                    <Text className="text-xs font-sans-bold text-white">Create Memorial</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Selected Memorial Badge (when picker was used) */}
      {needsPicker && memorialId && (
        <Pressable
          className="bg-brand-50 dark:bg-brand-900/20 mx-4 mt-3 rounded-2xl p-4 flex-row items-center gap-3"
          onPress={() => {
            setPickedMemorialId(null);
            setPickedMemorialName(null);
          }}
        >
          <Ionicons name="heart" size={20} color="#4A2D7A" />
          <View className="flex-1">
            <Text className="text-sm font-sans-bold text-brand-700">
              Honoring {memorialName}
            </Text>
            <Text className="text-[10px] font-sans text-brand-500">Tap to change memorial</Text>
          </View>
          <Ionicons name="swap-horizontal" size={18} color="#4A2D7A" />
        </Pressable>
      )}

      {/* Sponsored Days */}
      {(sponsorships ?? []).length > 0 && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">
            Recent Sponsors
          </Text>
          {(sponsorships ?? []).slice(0, 5).map((s: any) => {
            const badge = HONOR_DAY_BADGES[s.display_badge] ?? HONOR_DAY_BADGES.candle;
            return (
              <View key={s.id} className="flex-row items-center gap-3 mb-2">
                <Text className="text-lg">{badge.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">
                    {s.is_anonymous ? "Anonymous" : (s.sponsor?.display_name ?? s.sponsor_name ?? "Someone")}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-400">
                    {new Date(s.sponsored_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </Text>
                </View>
                {s.message && (
                  <Text className="text-[10px] font-sans text-gray-500 flex-1" numberOfLines={1}>
                    "{s.message}"
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Calendar Grid */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-3">
          Choose a Date to Sponsor
        </Text>

        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#4A2D7A" />
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {(availableDays ?? []).map((day: any) => (
              <Pressable
                key={day.date}
                className={`rounded-xl p-3 w-[48%] ${
                  day.taken
                    ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
                onPress={() => !day.taken && handleSelectDate(day.date, day.label)}
                disabled={day.taken}
              >
                <Text className={`text-xs font-sans-bold ${day.taken ? "text-amber-600" : "text-gray-900 dark:text-white"}`}>
                  {day.label}
                </Text>
                {day.taken ? (
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="checkmark-circle" size={12} color="#d97706" />
                    <Text className="text-[10px] font-sans text-amber-600">Sponsored</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="add-circle-outline" size={12} color="#4A2D7A" />
                    <Text className="text-[10px] font-sans text-brand-700">Available</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sponsor Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl px-4 pt-6 pb-10 max-h-[85%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                  Sponsor {selectedDateLabel}
                </Text>
                <Pressable onPress={() => setShowModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#9ca3af" />
                </Pressable>
              </View>

              {/* Badge Selection */}
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">
                Choose Your Symbol
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {Object.entries(HONOR_DAY_BADGES).map(([key, badge]) => (
                  <Pressable
                    key={key}
                    className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                      selectedBadge === key ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-700"
                    }`}
                    onPress={() => setSelectedBadge(key)}
                  >
                    <Text className="text-sm">{badge.emoji}</Text>
                    <Text className={`text-[11px] font-sans-semibold ${
                      selectedBadge === key ? "text-white" : "text-gray-600 dark:text-gray-300"
                    }`}>
                      {badge.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Amount */}
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sponsorship Amount
              </Text>
              <View className="flex-row gap-2 mb-2">
                {AMOUNT_PRESETS.map((p) => (
                  <Pressable
                    key={p.cents}
                    className={`flex-1 py-3 rounded-xl items-center ${
                      amountCents === p.cents && !customAmount ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-700"
                    }`}
                    onPress={() => { setAmountCents(p.cents); setCustomAmount(""); }}
                  >
                    <Text className={`text-sm font-sans-bold ${
                      amountCents === p.cents && !customAmount ? "text-white" : "text-gray-900 dark:text-white"
                    }`}>
                      {p.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 mb-4">
                <Text className="text-sm font-sans text-gray-500 mr-1">$</Text>
                <TextInput
                  className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
                  placeholder="Custom amount"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  value={customAmount}
                  onChangeText={(t) => { setCustomAmount(t); }}
                />
              </View>

              {/* Sponsor Name */}
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Your Name (shown on memorial)
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-3"
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
                value={sponsorName}
                onChangeText={setSponsorName}
              />

              {/* Anonymous */}
              <Pressable
                className="flex-row items-center gap-2 mb-4"
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <Ionicons
                  name={isAnonymous ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={isAnonymous ? "#059669" : "#9ca3af"}
                />
                <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">
                  Keep my sponsorship anonymous
                </Text>
              </Pressable>

              {/* Message */}
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Dedication Message (optional)
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-6"
                placeholder="In loving memory..."
                placeholderTextColor="#9ca3af"
                value={message}
                onChangeText={setMessage}
                multiline
                style={{ minHeight: 60, textAlignVertical: "top" }}
              />

              {/* Submit */}
              <Pressable
                className={`rounded-xl py-4 items-center ${sponsorDay.isPending ? "bg-brand-400" : "bg-brand-700"}`}
                onPress={handleSponsor}
                disabled={sponsorDay.isPending}
              >
                {sponsorDay.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg">
                      {HONOR_DAY_BADGES[selectedBadge]?.emoji ?? "🕯️"}
                    </Text>
                    <Text className="text-base font-sans-bold text-white">
                      Sponsor Day — ${customAmount || (amountCents / 100).toFixed(2)}
                    </Text>
                  </View>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
