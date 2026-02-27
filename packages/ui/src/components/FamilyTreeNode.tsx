import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Text } from "../primitives/Text";

interface FamilyTreeNodeProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  gender?: string | null;
  isLiving: boolean;
  isSelected?: boolean;
  relationshipLabel?: string;
  onPress?: () => void;
}

const genderColors: Record<string, string> = {
  male: "border-blue-300 bg-blue-50",
  female: "border-pink-300 bg-pink-50",
  other: "border-purple-300 bg-purple-50",
  unknown: "border-gray-300 bg-gray-50",
};

export function FamilyTreeNode({
  firstName,
  lastName,
  photoUrl,
  dateOfBirth,
  dateOfDeath,
  gender,
  isLiving,
  isSelected,
  relationshipLabel,
  onPress,
}: FamilyTreeNodeProps) {
  const colorClass = genderColors[gender ?? "unknown"] || genderColors.unknown;
  const fullName = `${firstName} ${lastName}`;

  const formatYear = (date: string | null | undefined) => {
    if (!date) return "?";
    return new Date(date).getFullYear().toString();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`items-center p-3 rounded-xl border-2 ${colorClass} ${
        isSelected ? "border-purple-500 shadow-lg" : ""
      } ${!isLiving ? "opacity-80" : ""}`}
      style={{ width: 120 }}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          className="w-16 h-16 rounded-full mb-2"
        />
      ) : (
        <View className="w-16 h-16 rounded-full mb-2 bg-gray-200 items-center justify-center">
          <Text className="text-2xl">{isLiving ? "👤" : "🕊️"}</Text>
        </View>
      )}
      <Text className="text-sm font-semibold text-gray-900 dark:text-white text-center" numberOfLines={1}>
        {fullName}
      </Text>
      <Text className="text-xs text-gray-500 mt-0.5">
        {formatYear(dateOfBirth)}{dateOfDeath ? ` – ${formatYear(dateOfDeath)}` : ""}
      </Text>
      {relationshipLabel && (
        <View className="bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 mt-1 border border-gray-200 dark:border-gray-600">
          <Text className="text-xs text-gray-600 dark:text-gray-400">{relationshipLabel}</Text>
        </View>
      )}
      {!isLiving && (
        <View className="absolute top-1 right-1">
          <Text className="text-xs">✝</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
