import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

// ── Emoji map (mirrored from core for UI-only usage) ───────────────
const GIFT_EMOJI: Record<string, string> = {
  // Flowers
  rose: "\u{1F339}", flower: "\u{1F338}", sunflower: "\u{1F33B}", tulip: "\u{1F337}",
  lily: "\u{1F33C}", orchid: "\u{1F490}", bouquet: "\u{1F490}", blossom: "\u{1F33A}",
  // Candles & Light
  flame: "\u{1F56F}\uFE0F", candle: "\u{1F56F}\uFE0F", fire: "\u{1F525}",
  // Cards & Messages
  mail: "\u{1F48C}", card: "\u{1F48C}", heart: "\u2764\uFE0F", envelope: "\u{1F48C}",
  // Celebrations
  balloon: "\u{1F388}", gift: "\u{1F381}", star: "\u2B50", confetti: "\u{1F389}",
  sparkles: "\u2728", trophy: "\u{1F3C6}", medal: "\u{1F3C5}", crown: "\u{1F451}",
  cake: "\u{1F382}", champagne: "\u{1F37E}", clap: "\u{1F44F}", party: "\u{1F973}",
  // Memorial & Sympathy
  dove: "\u{1F54A}\uFE0F", butterfly: "\u{1F98B}", angel: "\u{1F47C}", pray: "\u{1F64F}",
  rainbow: "\u{1F308}", ribbon: "\u{1F380}",
  // Baby & Birth
  baby: "\u{1F476}", baby_bottle: "\u{1F37C}", footprints: "\u{1F463}",
  cradle: "\u{1F6CF}\uFE0F", pacifier: "\u{1F37C}",
  // Life & Turning Points
  graduation: "\u{1F393}", ring: "\u{1F48D}", house: "\u{1F3E0}", briefcase: "\u{1F4BC}",
  airplane: "\u2708\uFE0F", car: "\u{1F697}", diploma: "\u{1F4DC}", key: "\u{1F511}",
  // Objects & More
  book: "\u{1F4D6}", frame: "\u{1F5BC}\uFE0F", bear: "\u{1F9F8}", gem: "\u{1F48E}",
  seedling: "\u{1F331}", tree: "\u{1F333}",
  // Faith & Spiritual
  cross: "\u271D\uFE0F", peace: "\u262E\uFE0F", hands_together: "\u{1F64F}",
};

function emojiFor(icon: string | null | undefined): string {
  return icon ? GIFT_EMOJI[icon] ?? "\u{1F381}" : "\u{1F381}";
}

// ── Types ──────────────────────────────────────────────────────────
type GiftCategory = "flowers" | "baby" | "milestones" | "celebrations" | "candles" | "cards" | "sympathy" | "legacy";
type SendPhase = "compose" | "sending" | "success" | "error";

interface CatalogGift {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  price_cents: number;
  is_premium: boolean;
  point_cost?: number;
}

const CATEGORIES: { key: GiftCategory; label: string; emoji: string }[] = [
  { key: "celebrations", label: "Celebrate", emoji: "\u{1F389}" },
  { key: "baby",         label: "Baby",      emoji: "\u{1F476}" },
  { key: "milestones",   label: "Turning Points", emoji: "\u{1F393}" },
  { key: "flowers",      label: "Flowers",   emoji: "\u{1F339}" },
  { key: "cards",        label: "Cards",     emoji: "\u{1F48C}" },
  { key: "candles",      label: "Candles",   emoji: "\u{1F56F}\uFE0F" },
  { key: "sympathy",     label: "Sympathy",  emoji: "\u{1F54A}\uFE0F" },
  { key: "legacy",       label: "The Core",    emoji: "\u{1F331}" },
];

// Celebration emojis for the success confetti row
const CONFETTI = ["\u{1F389}", "\u2728", "\u{1F38A}", "\u{1F496}", "\u2B50", "\u{1F389}", "\u2728"];

// ── Props ──────────────────────────────────────────────────────────
interface GiftCatalogSheetProps {
  visible: boolean;
  onClose: () => void;
  targetType: "user" | "memorial" | "living_tribute";
  targetId: string;
  recipientName: string;
  /** DB-driven catalog items passed from the parent */
  catalogItems?: CatalogGift[];
  catalogLoading?: boolean;
  /** Called when the user confirms sending. Can return a Promise for async handling. */
  onSendGift?: (params: {
    giftId: string;
    giftName: string;
    message: string;
    isAnonymous: boolean;
    priceCents: number;
    pointCost: number;
    quantity: number;
  }) => void | Promise<void>;
  /** Legacy callback (simple) */
  onGiftSent?: (giftName: string) => void;
  /** Whether a send is in-flight (fallback if parent doesn't use async) */
  isSending?: boolean;
  /** User's current Core Points balance */
  userPointBalance?: number;
  /** Navigate to Buy Points screen */
  onBuyPoints?: () => void;
}

export function GiftCatalogSheet({
  visible,
  onClose,
  targetType,
  targetId,
  recipientName,
  catalogItems = [],
  catalogLoading = false,
  onSendGift,
  onGiftSent,
  isSending = false,
  userPointBalance = 0,
  onBuyPoints,
}: GiftCatalogSheetProps) {
  const [activeCategory, setActiveCategory] = useState<GiftCategory>("celebrations");
  const [selectedGift, setSelectedGift] = useState<CatalogGift | null>(null);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sendPhase, setSendPhase] = useState<SendPhase>("compose");
  const [sentGiftName, setSentGiftName] = useState("");
  const [sentGiftIcon, setSentGiftIcon] = useState("");
  const [sentQuantity, setSentQuantity] = useState(1);
  const [sentPointCost, setSentPointCost] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const filteredGifts = catalogItems.filter((g) => g.category === activeCategory);

  const selectedPointCost = selectedGift ? (selectedGift.point_cost ?? 0) * quantity : 0;
  const hasEnoughPoints = userPointBalance >= selectedPointCost;

  // Auto-scroll to send section when a gift is selected
  useEffect(() => {
    if (selectedGift && sendPhase === "compose") {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [selectedGift, sendPhase]);

  // Auto-close after success
  useEffect(() => {
    if (sendPhase === "success") {
      const timer = setTimeout(() => {
        resetAndClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendPhase]);

  const resetState = useCallback(() => {
    setSelectedGift(null);
    setMessage("");
    setIsAnonymous(false);
    setQuantity(1);
    setSendPhase("compose");
    setSentGiftName("");
    setSentGiftIcon("");
    setSentQuantity(1);
    setSentPointCost(0);
    setErrorMessage("");
  }, []);

  const resetAndClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleSend = useCallback(async () => {
    if (!selectedGift) return;

    // Capture gift info for the success screen before resetting
    const giftName = selectedGift.name;
    const giftIcon = selectedGift.icon;
    const qty = quantity;
    const ptCost = (selectedGift.point_cost ?? 0) * quantity;

    setSentGiftName(giftName);
    setSentGiftIcon(giftIcon);
    setSentQuantity(qty);
    setSentPointCost(ptCost);
    setSendPhase("sending");

    try {
      if (onSendGift) {
        // Await the promise if the callback returns one
        await onSendGift({
          giftId: selectedGift.id,
          giftName: giftName,
          message,
          isAnonymous,
          priceCents: selectedGift.price_cents * quantity,
          pointCost: ptCost,
          quantity: qty,
        });
      } else {
        onGiftSent?.(giftName);
      }

      // Show success screen
      setSendPhase("success");
      setSelectedGift(null);
      setMessage("");
      setIsAnonymous(false);
      setQuantity(1);
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong. Please try again.");
      setSendPhase("error");
    }
  }, [selectedGift, message, isAnonymous, quantity, onSendGift, onGiftSent]);

  const handleClose = useCallback(() => {
    resetAndClose();
  }, [resetAndClose]);

  /** Render price/cost label for a gift */
  function costLabel(gift: CatalogGift): string {
    const pts = gift.point_cost ?? 0;
    if (pts === 0) return "Free";
    return `${pts} pts`;
  }

  // Build rows of 4 for the gift grid
  const giftRows: CatalogGift[][] = [];
  for (let i = 0; i < filteredGifts.length; i += 4) {
    giftRows.push(filteredGifts.slice(i, i + 4));
  }

  // ═══ SUCCESS SCREEN ═══
  if (sendPhase === "success") {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <Pressable className="flex-1 bg-black/40" onPress={resetAndClose} />
        <View className="bg-white dark:bg-gray-900 rounded-t-[32px] pb-10">
          {/* Handle bar */}
          <View className="items-center pt-3 pb-1.5">
            <View className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          <View className="items-center px-6 pt-6 pb-4">
            {/* Confetti row */}
            <View className="flex-row gap-2 mb-4">
              {CONFETTI.map((e, i) => (
                <Text key={i} style={{ fontSize: 20 + (i % 3) * 4 }}>{e}</Text>
              ))}
            </View>

            {/* Large gift emoji */}
            <View
              className="h-24 w-24 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(124, 58, 237, 0.08)" }}
            >
              <Text style={{ fontSize: 48 }}>{emojiFor(sentGiftIcon)}</Text>
            </View>

            {/* Success message */}
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white text-center mb-1.5">
              Gift Sent!
            </Text>
            <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 text-center leading-5">
              You sent {sentQuantity > 1 ? `${sentQuantity}x ` : ""}{sentGiftName} to {recipientName}
            </Text>

            {/* Points info */}
            {sentPointCost > 0 && (
              <View className="flex-row items-center gap-1.5 mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-full px-3.5 py-1.5">
                <Ionicons name="star" size={14} color="#d97706" />
                <Text className="text-xs font-sans-semibold text-amber-700 dark:text-amber-400">
                  {sentPointCost} points used
                </Text>
              </View>
            )}

            {/* Points earned badge */}
            <View className="flex-row items-center gap-1.5 mt-2 bg-green-50 dark:bg-green-900/20 rounded-full px-3.5 py-1.5">
              <Ionicons name="add-circle" size={14} color="#059669" />
              <Text className="text-xs font-sans-semibold text-green-700 dark:text-green-400">
                +10 points earned
              </Text>
            </View>

            {/* Confetti row */}
            <View className="flex-row gap-2 mt-5">
              {CONFETTI.slice().reverse().map((e, i) => (
                <Text key={i} style={{ fontSize: 18 + (i % 3) * 3 }}>{e}</Text>
              ))}
            </View>

            {/* Close button */}
            <Pressable
              className="mt-6 bg-brand-700 rounded-full px-8 py-3 flex-row items-center gap-2"
              onPress={resetAndClose}
              style={{
                shadowColor: "#4A2D7A",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
              <Text className="text-sm font-sans-bold text-white">Done</Text>
            </Pressable>

            <Text className="text-[10px] font-sans text-gray-400 mt-3">
              Auto-closing in a moment...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // ═══ ERROR SCREEN ═══
  if (sendPhase === "error") {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <Pressable className="flex-1 bg-black/40" onPress={handleClose} />
        <View className="bg-white dark:bg-gray-900 rounded-t-[32px] pb-10">
          <View className="items-center pt-3 pb-1.5">
            <View className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>
          <View className="items-center px-6 pt-6 pb-4">
            <View
              className="h-20 w-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.08)" }}
            >
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center mb-2">
              Could Not Send Gift
            </Text>
            <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 text-center leading-5 mb-6">
              {errorMessage}
            </Text>
            {/* Stacked buttons to prevent text overlap */}
            <View className="w-full" style={{ gap: 10 }}>
              <Pressable
                className="w-full rounded-full bg-brand-700 py-3.5 items-center"
                onPress={() => {
                  setSendPhase("compose");
                  setErrorMessage("");
                }}
                style={{
                  shadowColor: "#4A2D7A",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text className="text-sm font-sans-bold text-white">Try Again</Text>
              </Pressable>
              <Pressable
                className="w-full rounded-full bg-gray-100 dark:bg-gray-800 py-3 items-center"
                onPress={handleClose}
              >
                <Text className="text-sm font-sans-semibold text-gray-500 dark:text-gray-400">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ═══ SENDING OVERLAY (shown when mutation is in-flight) ═══
  if (sendPhase === "sending") {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <Pressable className="flex-1 bg-black/40" />
        <View className="bg-white dark:bg-gray-900 rounded-t-[32px] pb-10">
          <View className="items-center pt-3 pb-1.5">
            <View className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>
          <View className="items-center px-6 pt-10 pb-6">
            <View
              className="h-20 w-20 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(124, 58, 237, 0.08)" }}
            >
              <Text style={{ fontSize: 40 }}>{emojiFor(sentGiftIcon)}</Text>
            </View>
            <ActivityIndicator size="large" color="#4A2D7A" />
            <Text className="text-base font-sans-semibold text-gray-700 dark:text-gray-200 mt-4">
              Sending {sentGiftName}...
            </Text>
            <Text className="text-xs font-sans text-gray-400 mt-1">
              to {recipientName}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // ═══ COMPOSE SCREEN (default) ═══
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable className="flex-1 bg-black/40" onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ maxHeight: "85%" }}
      >
        <View className="bg-white dark:bg-gray-900 rounded-t-[32px]">
          {/* Handle bar */}
          <View className="items-center pt-3 pb-1.5">
            <View className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Header + Points Balance */}
          <View className="flex-row items-center justify-between px-5 pb-3">
            <View className="flex-1">
              <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                Send a Gift
              </Text>
              <Text className="text-[11px] font-sans text-gray-400 dark:text-gray-500">
                to {recipientName}
              </Text>
            </View>
            <Pressable
              onPress={onBuyPoints}
              className="flex-row items-center gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2.5 py-1 mr-2"
            >
              <Ionicons name="star" size={12} color="#d97706" />
              <Text className="text-[11px] font-sans-bold text-amber-700 dark:text-amber-400">
                {userPointBalance.toLocaleString()}
              </Text>
              <Ionicons name="add-circle" size={12} color="#d97706" />
            </Pressable>
            <Pressable onPress={handleClose} className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
              <Ionicons name="close" size={16} color="#6b7280" />
            </Pressable>
          </View>

          {/* Category Tabs — stays fixed at top */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
            className="mb-3"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${
                    isActive ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-800"
                  }`}
                  onPress={() => {
                    setActiveCategory(cat.key);
                    setSelectedGift(null);
                  }}
                >
                  <Text style={{ fontSize: 12 }}>{cat.emoji}</Text>
                  <Text
                    className={`text-[11px] font-sans-semibold ${
                      isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ── Scrollable content: Gift Grid + Send Section ── */}
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Gift Grid */}
            {catalogLoading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="small" color="#4A2D7A" />
                <Text className="text-xs font-sans text-gray-400 mt-2">Loading gifts...</Text>
              </View>
            ) : filteredGifts.length === 0 ? (
              <View className="items-center justify-center py-10 px-6">
                <Text style={{ fontSize: 28 }}>{"\u{1F381}"}</Text>
                <Text className="text-xs font-sans text-gray-400 text-center mt-2">
                  No {activeCategory.replace("_", " ")} available yet
                </Text>
              </View>
            ) : (
              <View className="px-4">
                {giftRows.map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-row gap-2 mb-2">
                    {row.map((item) => {
                      const isSelected = selectedGift?.id === item.id;
                      const emoji = emojiFor(item.icon);
                      const pts = item.point_cost ?? 0;
                      const isFree = pts === 0;
                      const canAfford = userPointBalance >= pts;
                      return (
                        <Pressable
                          key={item.id}
                          className={`flex-1 items-center py-2 px-1 rounded-2xl border ${
                            isSelected
                              ? "border-brand-700 bg-brand-50 dark:bg-brand-900/20"
                              : item.is_premium
                              ? "border-amber-200/60 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-900/10"
                              : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                          }`}
                          onPress={() => {
                            setSelectedGift(item);
                            setQuantity(1);
                          }}
                        >
                          <View className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center mb-1">
                            <Text style={{ fontSize: 22 }}>{emoji}</Text>
                          </View>
                          <Text
                            className="text-[10px] font-sans-semibold text-gray-700 dark:text-gray-300 text-center"
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text className={`text-[9px] font-sans-bold mt-0.5 ${
                            isFree
                              ? "text-green-600 dark:text-green-400"
                              : canAfford
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-500"
                          }`}>
                            {costLabel(item)}
                          </Text>
                          {isSelected && (
                            <View className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-700 items-center justify-center">
                              <Ionicons name="checkmark" size={10} color="#fff" />
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                    {/* Fill remaining cells in last row */}
                    {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, i) => (
                      <View key={`empty-${i}`} className="flex-1" />
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* ── Selected Gift Details + Send ── */}
            {selectedGift && (
              <View className="mx-4 mt-3 bg-gray-50 dark:bg-gray-800 rounded-3xl p-4">
                {/* Selected gift summary */}
                <View className="flex-row items-center gap-2.5 mb-3">
                  <View className="h-11 w-11 rounded-full bg-white dark:bg-gray-700 items-center justify-center">
                    <Text style={{ fontSize: 24 }}>{emojiFor(selectedGift.icon)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                      {selectedGift.name}
                    </Text>
                    {selectedGift.description && (
                      <Text className="text-[11px] font-sans text-gray-400" numberOfLines={1}>
                        {selectedGift.description}
                      </Text>
                    )}
                  </View>
                  {/* Quantity Stepper */}
                  <View className="flex-row items-center bg-white dark:bg-gray-700 rounded-full px-0.5">
                    <Pressable
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-7 w-7 rounded-full items-center justify-center"
                    >
                      <Ionicons name="remove" size={14} color="#6b7280" />
                    </Pressable>
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white w-6 text-center">
                      {quantity}
                    </Text>
                    <Pressable
                      onPress={() => setQuantity(Math.min(99, quantity + 1))}
                      className="h-7 w-7 rounded-full items-center justify-center"
                    >
                      <Ionicons name="add" size={14} color="#6b7280" />
                    </Pressable>
                  </View>
                </View>

                {/* Point cost */}
                {selectedPointCost > 0 && (
                  <View className={`flex-row items-center justify-between rounded-full px-3 py-2 mb-2.5 ${
                    hasEnoughPoints
                      ? "bg-amber-50 dark:bg-amber-900/20"
                      : "bg-red-50 dark:bg-red-900/20"
                  }`}>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="star" size={13} color={hasEnoughPoints ? "#d97706" : "#ef4444"} />
                      <Text className={`text-xs font-sans-semibold ${
                        hasEnoughPoints ? "text-amber-700 dark:text-amber-400" : "text-red-600"
                      }`}>
                        {selectedPointCost} pts
                      </Text>
                    </View>
                    {!hasEnoughPoints && onBuyPoints && (
                      <Pressable onPress={onBuyPoints} className="bg-amber-500 rounded-full px-2.5 py-0.5">
                        <Text className="text-[10px] font-sans-bold text-white">Get Points</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Message Input */}
                <TextInput
                  className="bg-white dark:bg-gray-700 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white mb-2.5"
                  placeholder="Add a personal message (optional)"
                  placeholderTextColor="#9ca3af"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  maxLength={250}
                  style={{ maxHeight: 60 }}
                />

                {/* Anonymous toggle */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="eye-off-outline" size={14} color="#6b7280" />
                    <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
                      Send anonymously
                    </Text>
                  </View>
                  <Switch
                    value={isAnonymous}
                    onValueChange={setIsAnonymous}
                    trackColor={{ false: "#d1d5db", true: "#7C3AED" }}
                    thumbColor="#ffffff"
                    style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                  />
                </View>

                {/* Send Button */}
                <Pressable
                  className="rounded-full py-3.5 items-center flex-row justify-center gap-2 bg-brand-700"
                  onPress={handleSend}
                  disabled={selectedPointCost > 0 && !hasEnoughPoints}
                  style={{
                    shadowColor: "#4A2D7A",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                    opacity: selectedPointCost > 0 && !hasEnoughPoints ? 0.5 : 1,
                  }}
                >
                  <Ionicons name="send" size={16} color="#ffffff" />
                  <Text className="text-sm font-sans-bold text-white">
                    {selectedPointCost > 0
                      ? hasEnoughPoints
                        ? `Send Gift \u00B7 ${selectedPointCost} pts`
                        : "Not Enough Points"
                      : "Send Gift"}
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
