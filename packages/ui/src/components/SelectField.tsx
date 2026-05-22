import React, { useState } from "react";
import { View, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

// ── Types ──────────────────────────────────────────────────

interface SelectOption {
  label: string;
  value: string;
  emoji?: string;
  icon?: string;
  description?: string;
  color?: string;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  optional?: boolean;
  helpText?: string;
  /** Inline chips instead of dropdown modal */
  variant?: "dropdown" | "chips" | "grid";
  /** Allow custom text input after selecting "Other" */
  allowCustom?: boolean;
  onCustomChange?: (text: string) => void;
  customValue?: string;
}

// ── Component ──────────────────────────────────────────────

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  optional = false,
  helpText,
  variant = "dropdown",
  allowCustom = false,
}: SelectFieldProps) {
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  // ── Chips Variant ──
  if (variant === "chips") {
    return (
      <View className="mb-3">
        {label ? (
          <Text className="text-xs font-sans-medium text-gray-500 mb-2">
            {label}{optional ? "" : " *"}
          </Text>
        ) : null}
        <View className="flex-row flex-wrap gap-2">
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              className={`flex-row items-center rounded-full px-3.5 py-2 border ${
                value === opt.value
                  ? "border-brand-700 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              }`}
              onPress={() => onChange(opt.value)}
            >
              {opt.emoji ? (
                <Text className="text-sm mr-1.5">{opt.emoji}</Text>
              ) : opt.icon ? (
                <Ionicons
                  name={opt.icon as any}
                  size={14}
                  color={value === opt.value ? "#4A2D7A" : "#9CA3AF"}
                  style={{ marginRight: 4 }}
                />
              ) : null}
              <Text
                className={`text-xs font-sans-medium ${
                  value === opt.value
                    ? "text-brand-700"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {helpText ? (
          <Text className="text-[10px] font-sans text-gray-400 mt-1.5 ml-1">{helpText}</Text>
        ) : null}
      </View>
    );
  }

  // ── Grid Variant ──
  if (variant === "grid") {
    return (
      <View className="mb-3">
        {label ? (
          <Text className="text-xs font-sans-medium text-gray-500 mb-2">
            {label}{optional ? "" : " *"}
          </Text>
        ) : null}
        <View className="flex-row flex-wrap gap-2">
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              className={`rounded-2xl px-4 py-3 items-center border-2 ${
                value === opt.value
                  ? "border-brand-700"
                  : "border-transparent"
              }`}
              style={{
                backgroundColor: value === opt.value
                  ? (opt.color ? `${opt.color}15` : "#F5F3FF")
                  : "#F3F4F6",
                minWidth: 90,
              }}
              onPress={() => onChange(opt.value)}
            >
              {opt.emoji ? <Text className="text-2xl mb-1">{opt.emoji}</Text> : null}
              <Text className="text-xs font-sans-semibold text-gray-800 text-center">
                {opt.label}
              </Text>
              {opt.description ? (
                <Text className="text-[9px] font-sans text-gray-500 text-center mt-0.5">
                  {opt.description}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
        {helpText ? (
          <Text className="text-[10px] font-sans text-gray-400 mt-1.5 ml-1">{helpText}</Text>
        ) : null}
      </View>
    );
  }

  // ── Dropdown Variant (default) ──
  return (
    <View className="mb-3">
      {label ? (
        <Text className="text-xs font-sans-medium text-gray-500 mb-1">
          {label}{optional ? "" : " *"}
        </Text>
      ) : null}

      <Pressable
        className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700"
        onPress={() => setShowModal(true)}
      >
        {selectedOption?.emoji ? (
          <Text className="text-base mr-2">{selectedOption.emoji}</Text>
        ) : selectedOption?.icon ? (
          <Ionicons
            name={selectedOption.icon as any}
            size={18}
            color="#4A2D7A"
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text
          className={`text-sm font-sans flex-1 ${
            selectedOption
              ? "text-gray-900 dark:text-white"
              : "text-gray-400"
          }`}
        >
          {selectedOption?.label || placeholder || "Select an option"}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </Pressable>

      {helpText ? (
        <Text className="text-[10px] font-sans text-gray-400 mt-1 ml-1">{helpText}</Text>
      ) : null}

      {/* Dropdown Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable className="flex-1 bg-black/50" onPress={() => setShowModal(false)}>
          <View className="flex-1" />
          <Pressable
            className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[70%]"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </View>

            {/* Title */}
            <View className="px-5 pb-3">
              <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                {label || "Select Option"}
              </Text>
            </View>

            <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
              {options.map((opt) => (
                <Pressable
                  key={opt.value}
                  className={`flex-row items-center rounded-xl p-3.5 mb-2 ${
                    value === opt.value
                      ? "bg-brand-50 dark:bg-brand-900/20 border border-brand-200"
                      : "bg-gray-50 dark:bg-gray-800 border border-transparent"
                  }`}
                  onPress={() => {
                    onChange(opt.value);
                    setShowModal(false);
                  }}
                >
                  {opt.emoji ? (
                    <Text className="text-xl mr-3">{opt.emoji}</Text>
                  ) : opt.icon ? (
                    <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                      <Ionicons name={opt.icon as any} size={16} color={opt.color ?? "#4A2D7A"} />
                    </View>
                  ) : null}
                  <View className="flex-1">
                    <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                      {opt.label}
                    </Text>
                    {opt.description ? (
                      <Text className="text-xs font-sans text-gray-500 mt-0.5">
                        {opt.description}
                      </Text>
                    ) : null}
                  </View>
                  {value === opt.value ? (
                    <Ionicons name="checkmark-circle" size={20} color="#4A2D7A" />
                  ) : null}
                </Pressable>
              ))}

              {allowCustom && (
                <Pressable
                  className={`flex-row items-center rounded-xl p-3.5 mb-2 ${
                    value === "__custom__"
                      ? "bg-brand-50 dark:bg-brand-900/20 border border-brand-200"
                      : "bg-gray-50 dark:bg-gray-800 border border-transparent"
                  }`}
                  onPress={() => {
                    onChange("__custom__");
                    setShowModal(false);
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#9CA3AF" style={{ marginRight: 12 }} />
                  <Text className="text-sm font-sans-medium text-gray-500">Other (custom)</Text>
                </Pressable>
              )}
            </ScrollView>

            {/* Cancel */}
            <View className="px-5 pb-8 pt-3">
              <Pressable
                className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 py-3 items-center"
                onPress={() => setShowModal(false)}
              >
                <Text className="text-sm font-sans-medium text-gray-500">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
