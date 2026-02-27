import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

interface FundraiserCardProps {
  title: string;
  goalCents: number;
  raisedCents: number;
  donorCount: number;
  isVerified: boolean;
  trustLevel: number;
  onDonate: () => void;
}

export function FundraiserCard({
  title,
  goalCents,
  raisedCents,
  donorCount,
  isVerified,
  trustLevel,
  onDonate,
}: FundraiserCardProps) {
  const percent = goalCents > 0 ? Math.min((raisedCents / goalCents) * 100, 100) : 0;
  const isCompleted = raisedCents >= goalCents;

  return (
    <View className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 mb-3">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-base font-sans-semibold text-gray-900 dark:text-white" numberOfLines={2}>
            {title}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          {isVerified && (
            <View className="flex-row items-center bg-green-50 dark:bg-green-900/20 rounded-full px-2 py-1">
              <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
              <Text className="text-[10px] font-sans-semibold text-green-600 ml-1">Verified</Text>
            </View>
          )}
          {trustLevel >= 3 && (
            <View className="flex-row items-center bg-purple-50 dark:bg-purple-900/20 rounded-full px-2 py-1">
              <Ionicons name="shield-checkmark" size={12} color="#7c3aed" />
              <Text className="text-[10px] font-sans-semibold text-purple-600 ml-1">L{trustLevel}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount */}
      <View className="flex-row items-baseline justify-between mb-2">
        <Text className="text-xl font-sans-bold text-brand-700">
          {formatCurrency(raisedCents)}
        </Text>
        <Text className="text-sm font-sans text-gray-500 dark:text-gray-400">
          of {formatCurrency(goalCents)}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <View
          className={`h-full rounded-full ${isCompleted ? "bg-green-500" : "bg-brand-700"}`}
          style={{ width: `${percent}%` }}
        />
      </View>

      {/* Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xs font-sans text-gray-400">
          {donorCount} donor{donorCount !== 1 ? "s" : ""}
        </Text>
        <Text className="text-xs font-sans-semibold text-brand-700">
          {Math.round(percent)}%
        </Text>
      </View>

      {/* Donate Button */}
      <Pressable
        className={`rounded-full py-3 items-center ${
          isCompleted ? "bg-green-500" : "bg-brand-700"
        }`}
        onPress={onDonate}
        disabled={isCompleted}
      >
        <View className="flex-row items-center">
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "heart"}
            size={16}
            color="white"
          />
          <Text className="text-sm font-sans-semibold text-white ml-1.5">
            {isCompleted ? "Goal Reached" : "Donate Now"}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
