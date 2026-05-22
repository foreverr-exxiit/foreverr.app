import { View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface RecentGift {
  senderName: string;
  giftName: string;
  giftIcon: string;
  isAnonymous: boolean;
}

interface FlowerWallDisplayProps {
  totalFlowers: number;
  totalCandles: number;
  totalGifts: number;
  totalAmountCents: number;
  recentGifts?: RecentGift[];
  onViewAll?: () => void;
}

function formatCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function StatPill({
  icon,
  iconColor,
  bgColor,
  count,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  count: number;
  label: string;
}) {
  return (
    <View className="items-center flex-1">
      <View
        className="h-11 w-11 rounded-full items-center justify-center mb-1"
        style={{ backgroundColor: bgColor }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
        {formatCompact(count)}
      </Text>
      <Text className="text-[10px] font-sans text-gray-400 dark:text-gray-500">
        {label}
      </Text>
    </View>
  );
}

export function FlowerWallDisplay({
  totalFlowers,
  totalCandles,
  totalGifts,
  totalAmountCents,
  recentGifts = [],
  onViewAll,
}: FlowerWallDisplayProps) {
  const hasAmount = totalAmountCents > 0;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-100 dark:border-gray-700">
      {/* Stat Circles Row */}
      <View className="flex-row items-start justify-around mb-3">
        <StatPill
          icon="flower"
          iconColor="#ec4899"
          bgColor="rgba(236, 72, 153, 0.1)"
          count={totalFlowers}
          label="Flowers"
        />
        <StatPill
          icon="flame"
          iconColor="#d97706"
          bgColor="rgba(217, 119, 6, 0.1)"
          count={totalCandles}
          label="Candles"
        />
        <StatPill
          icon="gift"
          iconColor="#7C3AED"
          bgColor="rgba(124, 58, 237, 0.1)"
          count={totalGifts}
          label="Gifts"
        />
      </View>

      {/* Total Amount */}
      {hasAmount && (
        <View className="items-center mb-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-full py-1.5 mx-6">
          <Text className="text-[10px] font-sans text-gray-400 dark:text-gray-500">
            Total contributions
          </Text>
          <Text className="text-sm font-sans-bold text-brand-700">
            ${(totalAmountCents / 100).toFixed(2)}
          </Text>
        </View>
      )}

      {/* Recent Gifts Horizontal List */}
      {recentGifts.length > 0 && (
        <View className="pt-2.5 mt-1">
          <Text className="text-[10px] font-sans-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
            Recent
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentGifts.map((gift, idx) => (
              <View
                key={idx}
                className="items-center mr-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-2.5 py-1.5"
                style={{ minWidth: 60 }}
              >
                <Text style={{ fontSize: 18 }}>{gift.giftIcon}</Text>
                <Text
                  className="text-[9px] font-sans-medium text-gray-600 dark:text-gray-300 mt-0.5"
                  numberOfLines={1}
                >
                  {gift.isAnonymous ? "Anon" : gift.senderName}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* View All Button */}
      {onViewAll && (
        <Pressable
          className="flex-row items-center justify-center gap-1 mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-700"
          onPress={onViewAll}
        >
          <Text className="text-xs font-sans-semibold text-brand-700">
            View All
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#4A2D7A" />
        </Pressable>
      )}
    </View>
  );
}
