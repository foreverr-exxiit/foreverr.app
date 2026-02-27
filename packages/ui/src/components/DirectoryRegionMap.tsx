import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface DirectoryRegionMapProps {
  region: string | null;
  categoryCount: number;
  listingCount: number;
  onChangeRegion: () => void;
}

export function DirectoryRegionMap({
  region,
  categoryCount,
  listingCount,
  onChangeRegion,
}: DirectoryRegionMapProps) {
  return (
    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
      {/* Region icon & name */}
      <View className="items-center mb-4">
        <View className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mb-3">
          <Text className="text-2xl">{"\uD83D\uDCCD"}</Text>
        </View>
        <Text className="text-lg font-bold text-neutral-900 dark:text-white">
          {region ?? "All Regions"}
        </Text>
      </View>

      {/* Stats row */}
      <View className="flex-row justify-around mb-4">
        <View className="items-center">
          <Text className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {categoryCount}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Categories
          </Text>
        </View>
        <View className="w-px bg-neutral-200 dark:bg-neutral-700" />
        <View className="items-center">
          <Text className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {listingCount}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Listings
          </Text>
        </View>
      </View>

      {/* Change button */}
      <TouchableOpacity
        onPress={onChangeRegion}
        activeOpacity={0.7}
        className="bg-purple-600 dark:bg-purple-700 rounded-xl py-3 items-center"
      >
        <Text className="text-white font-semibold text-sm">
          {region ? "Change Region" : "Select Region"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
