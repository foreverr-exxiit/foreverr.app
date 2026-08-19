import { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  supabase,
  useWeddingMessages,
  useCreateWeddingMessage,
  useMyWeddingRsvp,
  useSubmitWeddingRsvp,
  type WeddingRsvpStatus,
} from "@foreverr/core";
import { Text } from "@foreverr/ui";

interface WeddingPage {
  id: string;
  created_by: string;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  venue_name: string | null;
  how_we_met: string | null;
  hashtag: string | null;
  cover_photo_url: string | null;
  status: string;
  created_at: string;
}

function computeCountdown(dateStr: string): { label: string; isPast: boolean } {
  const weddingDate = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diffMs = weddingDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    const formatted = weddingDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { label: `Married on ${formatted}`, isPast: true };
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 1) return { label: "1 day to go!", isPast: false };
  if (days < 30) return { label: `${days} days to go!`, isPast: false };
  const months = Math.floor(days / 30);
  const remainDays = days % 30;
  if (remainDays === 0) {
    return {
      label: `${months} month${months > 1 ? "s" : ""} to go!`,
      isPast: false,
    };
  }
  return {
    label: `${months} month${months > 1 ? "s" : ""} and ${remainDays} day${remainDays > 1 ? "s" : ""} to go!`,
    isPast: false,
  };
}

export default function WeddingPageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user, profile } = useAuth();

  const [wedding, setWedding] = useState<WeddingPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Message wall + RSVP (backends: wedding_messages / wedding_rsvps, 00036)
  const { data: messages = [] } = useWeddingMessages(id);
  const createMessage = useCreateWeddingMessage();
  const { data: myRsvp } = useMyWeddingRsvp(id, user?.id);
  const submitRsvp = useSubmitWeddingRsvp();

  const [composeOpen, setComposeOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageAnon, setMessageAnon] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpPartySize, setRsvpPartySize] = useState("1");
  const [rsvpNote, setRsvpNote] = useState("");

  const displayName =
    (profile as any)?.display_name || (user as any)?.email?.split("@")[0] || "Guest";

  const handlePostMessage = useCallback(async () => {
    if (!id || !user?.id || !messageText.trim()) return;
    try {
      await createMessage.mutateAsync({
        weddingId: id,
        authorId: user.id,
        authorName: displayName,
        content: messageText.trim(),
        isAnonymous: messageAnon,
      });
      setMessageText("");
      setMessageAnon(false);
      setComposeOpen(false);
    } catch (e: any) {
      Alert.alert("Couldn't post", e?.message ?? "Please try again.");
    }
  }, [id, user?.id, messageText, messageAnon, displayName, createMessage]);

  const handleRsvp = useCallback(
    async (status: WeddingRsvpStatus) => {
      if (!id || !user?.id) {
        Alert.alert("Sign in", "Please sign in to RSVP.");
        return;
      }
      try {
        await submitRsvp.mutateAsync({
          weddingId: id,
          userId: user.id,
          guestName: displayName,
          status,
          partySize: Math.max(1, parseInt(rsvpPartySize, 10) || 1),
          message: rsvpNote.trim() || undefined,
          existingId: myRsvp?.id,
        });
        setRsvpOpen(false);
        setRsvpNote("");
      } catch (e: any) {
        Alert.alert("Couldn't RSVP", e?.message ?? "Please try again.");
      }
    },
    [id, user?.id, displayName, rsvpPartySize, rsvpNote, myRsvp?.id, submitRsvp],
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("wedding_pages")
          .select("*")
          .eq("id", id)
          .single();

        if (!cancelled) {
          if (error) throw error;
          setWedding(data as WeddingPage);
        }
      } catch (err: any) {
        if (!cancelled) {
          Alert.alert("Error", err?.message ?? "Could not load wedding page.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const countdown = useMemo(() => {
    if (!wedding?.wedding_date) return null;
    return computeCountdown(wedding.wedding_date);
  }, [wedding?.wedding_date]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#4A2D7A" />
        <Text className="text-sm font-sans text-gray-400 mt-3">
          Loading wedding page...
        </Text>
      </View>
    );
  }

  if (!wedding) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="heart-dislike-outline" size={48} color="#9ca3af" />
        <Text className="text-lg font-sans-bold text-gray-700 dark:text-gray-300 mt-4 text-center">
          Wedding page not found
        </Text>
        <Pressable onPress={goBack} className="mt-6 bg-brand-700 rounded-full px-6 py-3">
          <Text className="text-sm font-sans-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const weddingDateFormatted = new Date(
    wedding.wedding_date + "T00:00:00"
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back button overlay */}
      <View className="absolute top-14 left-4 z-10">
        <Pressable
          onPress={goBack}
          className="h-10 w-10 rounded-full bg-white/80 dark:bg-gray-800/80 items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#4A2D7A" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Photo / Gradient Placeholder (stacked View layers, no expo-linear-gradient) */}
        <View className="h-64 overflow-hidden" style={{ backgroundColor: "#2D1558" }}>
          {/* Layered gradient effect */}
          <View
            className="absolute inset-0"
            style={{ backgroundColor: "#4A2D7A", opacity: 0.7 }}
          />
          <View
            className="absolute bottom-0 left-0 right-0"
            style={{ height: "50%", backgroundColor: "#7C3AED", opacity: 0.4 }}
          />
          <View className="flex-1 items-center justify-center">
            <Ionicons name="heart" size={56} color="rgba(255,255,255,0.4)" />
            {!wedding.cover_photo_url && (
              <Text
                className="text-xs font-sans mt-2"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Add a cover photo
              </Text>
            )}
          </View>
        </View>

        {/* Names */}
        <View className="items-center -mt-6 px-4">
          <View className="bg-white dark:bg-gray-800 rounded-2xl px-8 py-5 items-center shadow-lg" style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white text-center">
              {wedding.partner1_name} & {wedding.partner2_name}
            </Text>

            {/* Date + Countdown */}
            <View className="flex-row items-center mt-2 gap-1.5">
              <Ionicons name="calendar-outline" size={14} color="#7C3AED" />
              <Text className="text-sm font-sans text-gray-600 dark:text-gray-400">
                {weddingDateFormatted}
              </Text>
            </View>

            {countdown && (
              <View
                className={`mt-2.5 rounded-full px-4 py-1.5 ${
                  countdown.isPast
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-brand-50 dark:bg-brand-900/20"
                }`}
              >
                <Text
                  className={`text-xs font-sans-bold ${
                    countdown.isPast
                      ? "text-green-600 dark:text-green-400"
                      : "text-brand-700 dark:text-brand-400"
                  }`}
                >
                  {countdown.isPast ? "\u2764\uFE0F " : "\uD83D\uDCC5 "}
                  {countdown.label}
                </Text>
              </View>
            )}

            {/* Hashtag badge */}
            {wedding.hashtag && (
              <View className="mt-3 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1.5">
                <Text className="text-sm font-sans-semibold text-brand-700 dark:text-brand-400">
                  #{wedding.hashtag}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Venue */}
        {wedding.venue_name && (
          <View className="mx-4 mt-5 flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-100 dark:border-gray-700">
            <View className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mr-3">
              <Ionicons name="location" size={20} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans text-gray-400 dark:text-gray-500">
                Venue
              </Text>
              <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
                {wedding.venue_name}
              </Text>
            </View>
            <Ionicons name="navigate-outline" size={18} color="#9ca3af" />
          </View>
        )}

        {/* How We Met */}
        {wedding.how_we_met && (
          <View className="mx-4 mt-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="heart-circle-outline" size={20} color="#7C3AED" />
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                How We Met
              </Text>
            </View>
            <View className="bg-white dark:bg-gray-800 rounded-xl px-4 py-4 border border-gray-100 dark:border-gray-700">
              <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-6">
                {wedding.how_we_met}
              </Text>
            </View>
          </View>
        )}

        {/* Stats Row */}
        <View className="mx-4 mt-6 flex-row bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {[
            { label: "RSVPs", value: "0", icon: "people" as const },
            { label: "Messages", value: "0", icon: "chatbubbles" as const },
            { label: "Photos", value: "0", icon: "images" as const },
          ].map((stat, i) => (
            <View
              key={stat.label}
              className={`flex-1 items-center py-4 ${
                i < 2 ? "border-r border-gray-100 dark:border-gray-700" : ""
              }`}
            >
              <Ionicons name={stat.icon} size={18} color="#7C3AED" />
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
            {[
              {
                label: "RSVP",
                icon: "checkmark-circle" as const,
                color: "#22c55e",
                bg: "bg-green-50 dark:bg-green-900/20",
              },
              {
                label: "Send Gift",
                icon: "gift" as const,
                color: "#7C3AED",
                bg: "bg-brand-50 dark:bg-brand-900/20",
              },
              {
                label: "Message",
                icon: "chatbubble" as const,
                color: "#3b82f6",
                bg: "bg-blue-50 dark:bg-blue-900/20",
              },
            ].map((action) => (
              <Pressable
                key={action.label}
                className={`flex-1 ${action.bg} rounded-xl py-4 items-center`}
                onPress={() => {
                  if (action.label === "Send Gift") {
                    const registry = (wedding as any)?.registry_url as string | undefined;
                    if (registry) {
                      Linking.openURL(
                        registry.startsWith("http") ? registry : `https://${registry}`,
                      ).catch(() =>
                        Alert.alert("Registry", "Couldn't open the registry link."),
                      );
                    } else {
                      Alert.alert(
                        "No registry yet",
                        "The couple hasn't added a gift registry. Leave them a message instead!",
                      );
                    }
                  } else if (action.label === "RSVP") {
                    if (!user?.id) {
                      Alert.alert("Sign in", "Please sign in to RSVP.");
                    } else {
                      setRsvpPartySize(String(myRsvp?.party_size ?? 1));
                      setRsvpNote(myRsvp?.message ?? "");
                      setRsvpOpen(true);
                    }
                  } else {
                    if (!user?.id) {
                      Alert.alert("Sign in", "Please sign in to leave a message.");
                    } else {
                      setComposeOpen(true);
                    }
                  }
                }}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
                <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mt-1.5">
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Messages / guestbook */}
        <View className="mx-4 mt-6 mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="chatbubbles-outline" size={20} color="#6b7280" />
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                Messages
              </Text>
              {messages.length > 0 && (
                <Text className="text-sm font-sans text-gray-400">
                  {messages.length}
                </Text>
              )}
            </View>
            <Pressable
              className="bg-brand-700 rounded-full px-4 py-2 flex-row items-center gap-1.5"
              onPress={() => {
                if (!user?.id) Alert.alert("Sign in", "Please sign in to leave a message.");
                else setComposeOpen(true);
              }}
            >
              <Ionicons name="create-outline" size={14} color="#FFFFFF" />
              <Text className="text-xs font-sans-bold text-white">Write</Text>
            </Pressable>
          </View>

          {messages.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 items-center py-12 px-6">
              <View className="h-16 w-16 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-4">
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#7C3AED" />
              </View>
              <Text className="text-base font-sans-semibold text-gray-600 dark:text-gray-300 text-center">
                Be the first to leave a message
              </Text>
              <Text className="text-sm font-sans text-gray-400 text-center mt-1">
                Share your well wishes with the happy couple.
              </Text>
            </View>
          ) : (
            <View className="gap-2.5">
              {messages.map((m) => (
                <View
                  key={m.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4"
                >
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <View className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                      <Ionicons name="person" size={14} color="#7C3AED" />
                    </View>
                    <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                      {m.is_anonymous
                        ? "Anonymous"
                        : m.author?.display_name || m.author_name || "Guest"}
                    </Text>
                  </View>
                  <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-5">
                    {m.content}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Compose message modal */}
      <Modal visible={composeOpen} transparent animationType="slide" onRequestClose={() => setComposeOpen(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setComposeOpen(false)}>
          <Pressable
            className="bg-white dark:bg-gray-900 rounded-t-3xl p-5"
            onPress={() => {}}
          >
            <View className="items-center mb-3">
              <View className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
              Leave a message
            </Text>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Share your well wishes for the couple…"
              placeholderTextColor="#9ca3af"
              multiline
              className="min-h-[96px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white"
              style={{ textAlignVertical: "top" }}
            />
            <View className="flex-row items-center justify-between mt-3">
              <View className="flex-row items-center gap-2">
                <Switch value={messageAnon} onValueChange={setMessageAnon} trackColor={{ true: "#7C3AED" }} />
                <Text className="text-sm font-sans text-gray-600 dark:text-gray-400">Post anonymously</Text>
              </View>
            </View>
            <Pressable
              disabled={!messageText.trim() || createMessage.isPending}
              onPress={handlePostMessage}
              className={`mt-4 rounded-xl py-3.5 items-center ${messageText.trim() && !createMessage.isPending ? "bg-brand-700" : "bg-gray-200 dark:bg-gray-800"}`}
            >
              {createMessage.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className={`text-sm font-sans-bold ${messageText.trim() ? "text-white" : "text-gray-400"}`}>
                  Post message
                </Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* RSVP modal */}
      <Modal visible={rsvpOpen} transparent animationType="slide" onRequestClose={() => setRsvpOpen(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setRsvpOpen(false)}>
          <Pressable className="bg-white dark:bg-gray-900 rounded-t-3xl p-5" onPress={() => {}}>
            <View className="items-center mb-3">
              <View className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-1">RSVP</Text>
            {myRsvp && (
              <Text className="text-xs font-sans text-brand-600 dark:text-brand-400 mb-3">
                You're currently: {myRsvp.status.replace("_", " ")}
              </Text>
            )}
            <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-1.5 mt-2">
              Party size
            </Text>
            <TextInput
              value={rsvpPartySize}
              onChangeText={setRsvpPartySize}
              keyboardType="number-pad"
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white w-24"
            />
            <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-1.5 mt-4">
              Note (optional)
            </Text>
            <TextInput
              value={rsvpNote}
              onChangeText={setRsvpNote}
              placeholder="Dietary needs, a message…"
              placeholderTextColor="#9ca3af"
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white"
            />
            <View className="flex-row gap-2 mt-4">
              {([
                { s: "attending", label: "Attending", color: "#22c55e" },
                { s: "maybe", label: "Maybe", color: "#f59e0b" },
                { s: "not_attending", label: "Can't make it", color: "#ef4444" },
              ] as const).map((opt) => (
                <Pressable
                  key={opt.s}
                  disabled={submitRsvp.isPending}
                  onPress={() => handleRsvp(opt.s)}
                  className="flex-1 rounded-xl py-3 items-center border"
                  style={{ borderColor: opt.color, backgroundColor: `${opt.color}14` }}
                >
                  <Text className="text-xs font-sans-bold" style={{ color: opt.color }}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
