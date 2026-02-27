import { View } from "react-native";
import { Text } from "../primitives/Text";

interface DonationProgressProps {
  raisedCents: number;
  goalCents: number;
  donorCount: number;
  currency?: string;
}

function formatCurrency(cents: number, currency: string = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function DonationProgress({ raisedCents, goalCents, donorCount, currency = "usd" }: DonationProgressProps) {
  const percent = goalCents > 0 ? Math.min((raisedCents / goalCents) * 100, 100) : 0;

  return (
    <View>
      <View className="flex-row items-baseline justify-between mb-2">
        <Text className="text-lg font-sans-bold text-brand-700">{formatCurrency(raisedCents, currency)}</Text>
        <Text className="text-sm font-sans text-gray-500">
          raised of {formatCurrency(goalCents, currency)} goal
        </Text>
      </View>
      <View className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <View className="h-full bg-brand-700 rounded-full" style={{ width: `${percent}%` }} />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-sans text-gray-400">{donorCount} donor{donorCount !== 1 ? "s" : ""}</Text>
        <Text className="text-xs font-sans-semibold text-brand-700">{Math.round(percent)}%</Text>
      </View>
    </View>
  );
}
