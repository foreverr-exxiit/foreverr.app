import React, { useEffect, useRef } from "react";
import { View, Pressable, Animated, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface WelcomeJourneyTask {
  day_number: number;
  task_key: string;
  task_title: string;
  task_description: string;
  points_reward: number;
  is_completed: boolean;
  is_claimed: boolean;
}

interface WelcomeJourneyBannerProps {
  tasks: WelcomeJourneyTask[];
  currentDay: number;
  totalPointsEarned: number;
  totalPointsAvailable: number;
  onClaimReward: (taskKey: string) => void;
  onDismiss?: () => void;
}

export function WelcomeJourneyBanner({
  tasks,
  currentDay,
  totalPointsEarned,
  totalPointsAvailable,
  onClaimReward,
  onDismiss,
}: WelcomeJourneyBannerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for current day dot
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const currentTask = tasks.find((t) => t.day_number === currentDay) ?? tasks[0];

  return (
    <View
      className="rounded-3xl mx-4 mb-4 overflow-hidden"
      style={{ backgroundColor: "#4A2D7A" }}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Ionicons name="close" size={14} color="#ffffff" />
        </Pressable>
      )}

      {/* Header */}
      <View className="px-5 pt-5 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles" size={18} color="#ffffff" />
            <Text className="text-base font-sans-bold text-white">
              Welcome Journey
            </Text>
          </View>
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Text className="text-xs font-sans-semibold text-white">
              Day {currentDay} of 7
            </Text>
          </View>
        </View>

        {/* Progress dots */}
        <View className="flex-row items-center justify-between mb-4 px-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const dayNum = i + 1;
            const task = tasks.find((t) => t.day_number === dayNum);
            const isCompleted = task?.is_completed ?? false;
            const isCurrent = dayNum === currentDay;

            return (
              <View key={dayNum} className="items-center" style={{ flex: 1 }}>
                {/* Connector line (except first) */}
                {i > 0 && (
                  <View
                    className="absolute top-[10px] right-1/2"
                    style={{
                      width: "100%",
                      height: 2,
                      backgroundColor: isCompleted
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(255,255,255,0.15)",
                    }}
                  />
                )}
                {isCurrent ? (
                  <Animated.View
                    style={{
                      opacity: pulseAnim,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "#7C3AED",
                      borderWidth: 2,
                      borderColor: "#ffffff",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}
                  >
                    <Text
                      className="font-sans-bold text-white"
                      style={{ fontSize: 9 }}
                    >
                      {dayNum}
                    </Text>
                  </Animated.View>
                ) : (
                  <View
                    className="items-center justify-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: isCompleted
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.15)",
                      zIndex: 1,
                    }}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={12} color="#4A2D7A" />
                    ) : (
                      <Text
                        className="font-sans text-white"
                        style={{ fontSize: 9, opacity: 0.6 }}
                      >
                        {dayNum}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Current day task card */}
      {currentTask && (
        <View className="mx-4 mb-4 bg-white rounded-2xl p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text className="text-sm font-sans-bold text-gray-900">
                {currentTask.task_title}
              </Text>
              <Text
                className="text-xs font-sans text-gray-500 mt-1 leading-4"
                numberOfLines={2}
              >
                {currentTask.task_description}
              </Text>
            </View>
            {/* Points badge */}
            <View className="flex-row items-center bg-amber-50 rounded-full px-2.5 py-1 gap-1">
              <Ionicons name="star" size={12} color="#d97706" />
              <Text className="text-xs font-sans-bold text-amber-700">
                {currentTask.points_reward} pts
              </Text>
            </View>
          </View>

          {/* Action area */}
          {currentTask.is_completed && !currentTask.is_claimed ? (
            <Pressable
              className="mt-2 rounded-full py-2.5 items-center flex-row justify-center gap-1.5"
              style={{ backgroundColor: "#D97706" }}
              onPress={() => onClaimReward(currentTask.task_key)}
            >
              <Text className="text-sm font-sans-bold text-white">
                Claim Reward
              </Text>
              <Text style={{ fontSize: 14 }}>{"\u2728"}</Text>
            </Pressable>
          ) : currentTask.is_completed && currentTask.is_claimed ? (
            <View className="mt-2 flex-row items-center justify-center gap-1.5 py-2.5">
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text className="text-sm font-sans-semibold text-green-600">
                Claimed!
              </Text>
            </View>
          ) : (
            <View className="mt-2 py-2 items-center">
              <Text className="text-xs font-sans text-gray-400">
                Complete this task to earn points
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom points summary */}
      <View className="px-5 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text className="text-xs font-sans-semibold text-white">
            {totalPointsEarned} earned
          </Text>
        </View>
        <Text
          className="text-xs font-sans text-white"
          style={{ opacity: 0.7 }}
        >
          {totalPointsEarned} of {totalPointsAvailable} pts
        </Text>
      </View>
    </View>
  );
}
