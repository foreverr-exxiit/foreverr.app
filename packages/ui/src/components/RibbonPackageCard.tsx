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
      className={`rounded-xl border p-4 mb-3 ${
        isPopular ? "border-brand-700 bg-brand-50" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
      }`}
      onPress={onPress}
    >
      {isPopular && (
        <View className="absolute -top-2.5 right-4 bg-brand-700 rounded-full px-3 py-0.5">
          <Text className="text-[10px] font-sans-bold text-white">POPULAR</Text>
        </View>
      )}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
            <Ionicons name="ribbon" size={20} color="#4A2D7A" />
          </View>
          <View>
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{name}</Text>
            <Text className="text-xs font-sans text-gray-500">{ribbonAmount} ribbons</Text>
          </View>
        </View>
        <View className="bg-brand-700 rounded-full px-4 py-2">
          <Text className="text-sm font-sans-bold text-white">${(priceCents / 100).toFixed(2)}</Text>
        </View>
      </View>
      {description && (
        <Text className="text-xs font-sans text-gray-400 mt-2">{description}</Text>
      )}
    </Pressable>
  );
}
