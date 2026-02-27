import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useLifecycleStages } from "@foreverr/core";
import { Text, LifecycleStagePicker } from "@foreverr/ui";

const ICON_MAP: Record<string, string> = {
  sparkles: "\u2728",
  camera: "\uD83D\uDCF7",
  heart: "\u2764\uFE0F",
  flame: "\uD83D\uDD25",
  star: "\u2B50",
};

const STAGE_CTA: Record<string, string> = {
  celebrate: "Create Living Tribute",
  preserve: "Start Preserving",
  support: "Send Support",
  remember: "Visit Memorials",
  legacy: "Explore Legacies",
};

export default function LifecycleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: stages, isLoading } = useLifecycleStages();

  const [activeStage, setActiveStage] = React.useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 items-center justify-center mr-3"
        >
          <Text className="text-lg text-neutral-700 dark:text-neutral-300">
            {"\u2190"}
          </Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-neutral-900 dark:text-white">
          Your Legacy Journey
        </Text>
      </View>

      {/* Stage picker */}
      {stages && stages.length > 0 ? (
        <View className="py-3">
          <LifecycleStagePicker
            currentStage={activeStage}
            stages={stages}
            onSelect={(s) => setActiveStage(s === activeStage ? null : s)}
          />
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro text */}
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mb-5 leading-5">
          Life is a journey of connection. Foreverr helps you honor every stage
          -- from celebrating life's milestones to preserving legacies that
          inspire future generations.
        </Text>

        {isLoading ? (
          <View className="py-20 items-center">
            <Text className="text-neutral-400 dark:text-neutral-500">
              Loading stages...
            </Text>
          </View>
        ) : null}

        {/* Stage cards */}
        {(stages ?? []).map((stage, idx) => {
          const isActive =
            activeStage?.toLowerCase() === stage.name.toLowerCase();
          const emoji = ICON_MAP[stage.icon] ?? stage.icon;
          const ctaLabel =
            STAGE_CTA[stage.name.toLowerCase()] ?? "Explore";

          return (
            <View
              key={stage.id}
              className={`mb-4 rounded-2xl border overflow-hidden ${
                isActive
                  ? "border-2"
                  : "border-neutral-100 dark:border-neutral-800"
              }`}
              style={isActive ? { borderColor: stage.color } : undefined}
            >
              {/* Colored top bar */}
              <View className="h-1.5" style={{ backgroundColor: stage.color }} />

              <View className="p-4 bg-white dark:bg-neutral-900">
                {/* Icon + name + step number */}
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${stage.color}20` }}
                  >
                    <Text className="text-xl">{emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-neutral-900 dark:text-white">
                      {stage.name}
                    </Text>
                    <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                      Stage {idx + 1} of {stages?.length ?? 5}
                    </Text>
                  </View>
                  {isActive ? (
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    >
                      <Text className="text-[10px] font-bold text-white">
                        ACTIVE
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Description */}
                <Text className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 leading-5">
                  {stage.description}
                </Text>

                {/* Features list */}
                <View className="mb-3">
                  {(stage.features ?? []).map((feat, fi) => (
                    <View key={fi} className="flex-row items-center mb-1.5">
                      <View
                        className="w-1.5 h-1.5 rounded-full mr-2"
                        style={{ backgroundColor: stage.color }}
                      />
                      <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CTA button */}
                <TouchableOpacity
                  onPress={() =>
                    setActiveStage(stage.name.toLowerCase())
                  }
                  activeOpacity={0.7}
                  className="rounded-xl py-3 items-center"
                  style={{ backgroundColor: stage.color }}
                >
                  <Text className="text-white font-semibold text-sm">
                    {ctaLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
