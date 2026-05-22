import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface RibbonPackageCardProps {
  name: string;
  description?: string | null;
  ribbonAmount: number;
  priceCents: number;
  isPopular?: boolean;
  onPress: () => void;
}

export function RibbonPackageCard({ name, description, ribbonAmount, priceCents, isPopular, onPress }: RibbonPackageCardProps) {
  return (
    <Pressable
      className={`rounded-2xl border p-3 mb-2.5 ${
        isPopular ? "border-brand-700 bg-brand-50 dark:bg-brand-900/10" : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
      }`}
      onPress={onPress}
    >
      {isPopular && (
        <View className="absolute -top-2 right-3 bg-brand-700 rounded-full px-2.5 py-0.5">
          <Text className="text-[9px] font-sans-bold text-white tracking-wider">POPULAR</Text>
        </View>
      )}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-900/20 items-center justify-center">
            <Ionicons name="ribbon" size={18} color="#4A2D7A" />
          </View>
          <View>
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{name}</Text>
            <Text className="text-[11px] font-sans text-gray-400">{ribbonAmount} ribbons</Text>
          </View>
        </View>
        <View className="bg-brand-700 rounded-full px-3.5 py-1.5">
          <Text className="text-xs font-sans-bold text-white">${(priceCents / 100).toFixed(2)}</Text>
        </View>
      </View>
      {description && (
        <Text className="text-[11px] font-sans text-gray-400 mt-1.5 ml-[46px]">{description}</Text>
      )}
    </Pressable>
  );
}
