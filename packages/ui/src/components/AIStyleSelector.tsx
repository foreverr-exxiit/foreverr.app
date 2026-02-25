import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

export interface AIStyleOption {
  key: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface AIStyleSelectorProps {
  options: AIStyleOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export function AIStyleSelector({ options, selected, onSelect }: AIStyleSelectorProps) {
  return (
    <View className="gap-3">
      {options.map((opt) => (
        <Pressable
          key={opt.key}
          className={`flex-row items-center rounded-xl border p-4 ${
            selected === opt.key
              ? "border-brand-700 bg-brand-50"
              : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          }`}
          onPress={() => onSelect(opt.key)}
        >
          <View
            className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
              selected === opt.key ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <Ionicons
              name={opt.icon}
              size={20}
              color={selected === opt.key ? "#ffffff" : "#6b7280"}
            />
          </View>
          <View className="flex-1">
            <Text
              className={`text-base font-sans-semibold ${
                selected === opt.key
                  ? "text-brand-700"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {opt.label}
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              {opt.description}
            </Text>
          </View>
          <View
            className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
              selected === opt.key ? "border-brand-700" : "border-gray-300"
            }`}
          >
            {selected === opt.key && (
              <View className="h-2.5 w-2.5 rounded-full bg-brand-700" />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
