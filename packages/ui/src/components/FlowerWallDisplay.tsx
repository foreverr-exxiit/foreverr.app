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

function StatCircle({
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
        className="h-14 w-14 rounded-full items-center justify-center mb-1.5"
        style={{ backgroundColor: bgColor }}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
        {formatCompact(count)}
      </Text>
      <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
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
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
      {/* Stat Circles Row */}
      <View className="flex-row items-start justify-around mb-4">
        <StatCircle
          icon="flower"
          iconColor="#ec4899"
          bgColor="rgba(236, 72, 153, 0.12)"
          count={totalFlowers}
          label="Flowers"
        />
        <StatCircle
          icon="flame"
          iconColor="#d97706"
          bgColor="rgba(217, 119, 6, 0.12)"
          count={totalCandles}
          label="Candles"
        />
        <StatCircle
          icon="gift"
          iconColor="#7C3AED"
          bgColor="rgba(124, 58, 237, 0.12)"
          count={totalGifts}
          label="Total Gifts"
        />
      </View>

      {/* Total Amount */}
      {hasAmount && (
        <View className="items-center mb-3">
          <Text className="text-xs font-sans text-gray-400 dark:text-gray-500">
            Total contributions
          </Text>
          <Text className="text-lg font-sans-bold text-brand-700">
            ${(totalAmountCents / 100).toFixed(2)}
          </Text>
        </View>
      )}

      {/* Recent Gifts Horizontal List */}
      {recentGifts.length > 0 && (
        <View className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
          <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">
            Recent Gifts
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentGifts.map((gift, idx) => (
              <View
                key={idx}
                className="items-center mr-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2"
                style={{ minWidth: 72 }}
              >
                <Text style={{ fontSize: 22 }}>{gift.giftIcon}</Text>
                <Text
                  className="text-[10px] font-sans-medium text-gray-700 dark:text-gray-300 mt-1"
                  numberOfLines={1}
                >
                  {gift.isAnonymous ? "Anonymous" : gift.senderName}
                </Text>
                <Text
                  className="text-[10px] font-sans text-gray-400"
                  numberOfLines={1}
                >
                  {gift.giftName}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* View All Button */}
      {onViewAll && (
        <Pressable
          className="flex-row items-center justify-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"
          onPress={onViewAll}
        >
          <Text className="text-sm font-sans-semibold text-brand-700">
            View All Gifts
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#4A2D7A" />
        </Pressable>
      )}
    </View>
  );
}
