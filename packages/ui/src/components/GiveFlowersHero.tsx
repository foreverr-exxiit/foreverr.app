import { View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface GiveFlowersHeroProps {
  recipientName: string;
  recipientPhotoUrl?: string | null;
  occasion?: string;
  onSendFlowers: () => void;
  onSendMoney?: () => void;
}

export function GiveFlowersHero({
  recipientName,
  recipientPhotoUrl,
  occasion,
  onSendFlowers,
  onSendMoney,
}: GiveFlowersHeroProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Decorative header band */}
      <View className="h-16 bg-pink-50 dark:bg-pink-900/20 items-center justify-center">
        <Text style={{ fontSize: 24 }}>{"\uD83C\uDF39\u2728\uD83C\uDF39"}</Text>
      </View>

      <View className="items-center -mt-7 px-5 pb-4">
        {/* Recipient Photo */}
        {recipientPhotoUrl ? (
          <Image
            source={{ uri: recipientPhotoUrl }}
            className="w-14 h-14 rounded-full border-[3px] border-white dark:border-gray-800"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center border-[3px] border-white dark:border-gray-800">
            <Ionicons name="person" size={24} color="#7C3AED" />
          </View>
        )}

        {/* Title */}
        <Text className="text-base font-sans-bold text-gray-900 dark:text-white mt-2 text-center">
          Give {recipientName} Their Flowers
        </Text>

        {/* Occasion subtitle */}
        {occasion ? (
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
            <Text className="text-xs font-sans text-gray-400 dark:text-gray-500">
              {occasion}
            </Text>
          </View>
        ) : null}

        <Text className="text-[11px] font-sans text-gray-400 dark:text-gray-500 text-center mt-1.5 px-2">
          Show your love with a beautiful gift or contribution
        </Text>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-2.5 mt-4 w-full">
          {/* Primary: Send Flowers */}
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-pink-500 rounded-full py-3"
            style={{
              shadowColor: "#ec4899",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={onSendFlowers}
          >
            <Ionicons name="flower" size={16} color="#ffffff" />
            <Text className="text-xs font-sans-bold text-white">
              Send Flowers
            </Text>
          </Pressable>

          {/* Secondary: Send Gift Card */}
          {onSendMoney && (
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-700 rounded-full py-3 border border-gray-200 dark:border-gray-600"
              onPress={onSendMoney}
            >
              <Ionicons name="card-outline" size={16} color="#4A2D7A" />
              <Text className="text-xs font-sans-bold text-gray-700 dark:text-gray-200">
                Gift Card
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
