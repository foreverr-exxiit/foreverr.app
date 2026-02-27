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
    <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Decorative header band */}
      <View className="h-20 bg-pink-50 dark:bg-pink-900/20 items-center justify-center">
        <Text style={{ fontSize: 32 }}>{"\uD83C\uDF39\u2728\uD83C\uDF39"}</Text>
      </View>

      <View className="items-center -mt-8 px-5 pb-5">
        {/* Recipient Photo */}
        {recipientPhotoUrl ? (
          <Image
            source={{ uri: recipientPhotoUrl }}
            className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center border-4 border-white dark:border-gray-800">
            <Ionicons name="person" size={28} color="#7C3AED" />
          </View>
        )}

        {/* Title */}
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-3 text-center">
          Give {recipientName} Their Flowers
        </Text>

        {/* Occasion subtitle */}
        {occasion ? (
          <View className="flex-row items-center gap-1.5 mt-1.5">
            <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
            <Text className="text-sm font-sans text-gray-500 dark:text-gray-400">
              {occasion}
            </Text>
          </View>
        ) : null}

        <Text className="text-xs font-sans text-gray-400 dark:text-gray-500 text-center mt-2 px-4">
          Show your love and appreciation with a beautiful gift or contribution.
        </Text>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-3 mt-5 w-full">
          {/* Primary: Send Flowers */}
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 bg-pink-500 rounded-xl py-3.5"
            style={{
              shadowColor: "#ec4899",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={onSendFlowers}
          >
            <Ionicons name="flower" size={18} color="#ffffff" />
            <Text className="text-sm font-sans-bold text-white">
              Send Flowers
            </Text>
          </Pressable>

          {/* Secondary: Send Gift Card */}
          {onSendMoney && (
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl py-3.5 border border-gray-200 dark:border-gray-600"
              onPress={onSendMoney}
            >
              <Ionicons name="card-outline" size={18} color="#4A2D7A" />
              <Text className="text-sm font-sans-bold text-gray-800 dark:text-gray-200">
                Send Gift Card
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
