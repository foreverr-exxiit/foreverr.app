import { View } from "react-native";
import { Text } from "../primitives/Text";

interface StageData {
  key: string;
  label: string;
  icon: string;
  color: string;
  completed: number;
  total: number;
}

interface BabyStageProgressProps {
  stages: StageData[];
  currentStage: string;
}

export function BabyStageProgress({ stages, currentStage }: BabyStageProgressProps) {
  return (
    <View className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
      <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">
        Stage Progress
      </Text>
      {stages.map((stage, index) => {
        const isCurrent = stage.key === currentStage;
        const isPast = stages.findIndex((s) => s.key === currentStage) > index;
        const pct = stage.total > 0 ? (stage.completed / stage.total) * 100 : 0;

        return (
          <View key={stage.key} className="flex-row items-center mb-2">
            {/* Icon */}
            <View
              className={`h-8 w-8 rounded-full items-center justify-center mr-3 ${
                isCurrent ? "border-2" : ""
              }`}
              style={{
                backgroundColor: isPast || isCurrent ? `${stage.color}20` : "#F3F4F6",
                borderColor: isCurrent ? stage.color : "transparent",
              }}
            >
              <Text className="text-sm">{stage.icon}</Text>
            </View>

            {/* Label + bar */}
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-0.5">
                <Text
                  className={`text-xs font-sans-medium ${
                    isCurrent
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500"
                  }`}
                >
                  {stage.label}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400">
                  {stage.completed}/{stage.total}
                </Text>
              </View>
              <View className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: stage.color,
                    width: `${Math.max(pct, 0)}%`,
                    opacity: isPast || isCurrent ? 1 : 0.3,
                  }}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
