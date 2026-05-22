import React, { useState } from "react";
import { View, Pressable, Modal, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

// ── Types ──────────────────────────────────────────────────

interface DatePickerFieldProps {
  label?: string;
  value: string; // ISO date string or empty
  onChange: (dateStr: string) => void;
  placeholder?: string;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  maximumDate?: Date;
  optional?: boolean;
  helpText?: string;
  quickOptions?: { label: string; value: string }[];
}

// ── Month/Day/Year Helpers ─────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function generateYears(min?: Date, max?: Date): number[] {
  const startYear = min ? min.getFullYear() : 1900;
  const endYear = max ? max.getFullYear() : new Date().getFullYear() + 10;
  const years: number[] = [];
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }
  return years;
}

function formatDate(dateStr: string, mode: "date" | "time" | "datetime"): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    if (mode === "time") {
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    if (mode === "datetime") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        + " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function generateHours(): { label: string; value: number }[] {
  const hours: { label: string; value: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const hr = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    hours.push({ label: `${hr}:00 ${ampm}`, value: h });
  }
  return hours;
}

// ── Component ──────────────────────────────────────────────

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder,
  mode = "date",
  minimumDate,
  maximumDate,
  optional = false,
  helpText,
  quickOptions,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Parse current value
  const currentDate = value ? new Date(value) : new Date();
  const isValid = value && !isNaN(currentDate.getTime());

  const [selectedMonth, setSelectedMonth] = useState(isValid ? currentDate.getMonth() : new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(isValid ? currentDate.getDate() : new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(isValid ? currentDate.getFullYear() : new Date().getFullYear());
  const [selectedHour, setSelectedHour] = useState(isValid ? currentDate.getHours() : 12);

  const years = generateYears(minimumDate, maximumDate);
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  const handleConfirm = () => {
    const day = Math.min(selectedDay, daysInMonth);
    const date = new Date(selectedYear, selectedMonth, day, selectedHour, 0, 0);
    onChange(date.toISOString().split("T")[0]);
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange("");
    setShowPicker(false);
  };

  const displayValue = isValid ? formatDate(value, mode) : "";

  return (
    <View className="mb-3">
      {label ? (
        <Text className="text-xs font-sans-medium text-gray-500 mb-1">
          {label}{optional ? "" : " *"}
        </Text>
      ) : null}

      {/* Trigger Button */}
      <Pressable
        className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700"
        onPress={() => {
          // Reset selections to current value or defaults
          if (isValid) {
            setSelectedMonth(currentDate.getMonth());
            setSelectedDay(currentDate.getDate());
            setSelectedYear(currentDate.getFullYear());
            setSelectedHour(currentDate.getHours());
          }
          setShowPicker(true);
        }}
      >
        <Ionicons
          name={mode === "time" ? "time-outline" : "calendar-outline"}
          size={18}
          color={displayValue ? "#4A2D7A" : "#9CA3AF"}
        />
        <Text
          className={`ml-2 text-sm font-sans flex-1 ${
            displayValue
              ? "text-gray-900 dark:text-white"
              : "text-gray-400"
          }`}
        >
          {displayValue || placeholder || "Select a date"}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </Pressable>

      {helpText ? (
        <Text className="text-[10px] font-sans text-gray-400 mt-1 ml-1">{helpText}</Text>
      ) : null}

      {/* Quick Options */}
      {quickOptions && quickOptions.length > 0 && !value ? (
        <View className="flex-row flex-wrap gap-2 mt-2">
          {quickOptions.map((opt) => (
            <Pressable
              key={opt.label}
              className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5"
              onPress={() => onChange(opt.value)}
            >
              <Text className="text-xs font-sans-medium text-brand-700">{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable className="flex-1 bg-black/50" onPress={() => setShowPicker(false)}>
          <View className="flex-1" />
          <Pressable
            className="bg-white dark:bg-gray-900 rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-3">
              <Pressable onPress={() => setShowPicker(false)}>
                <Text className="text-sm font-sans-medium text-gray-500">Cancel</Text>
              </Pressable>
              <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                {mode === "time" ? "Select Time" : "Select Date"}
              </Text>
              <Pressable onPress={handleConfirm}>
                <Text className="text-sm font-sans-bold text-brand-700">Done</Text>
              </Pressable>
            </View>

            {/* Preview */}
            <View className="bg-brand-50 dark:bg-brand-900/20 mx-5 rounded-xl p-3 mb-4 items-center">
              <Text className="text-lg font-sans-bold text-brand-700">
                {MONTH_SHORT[selectedMonth]} {Math.min(selectedDay, daysInMonth)}, {selectedYear}
                {(mode === "time" || mode === "datetime") && (
                  ` at ${generateHours().find(h => h.value === selectedHour)?.label ?? ""}`
                )}
              </Text>
            </View>

            {/* Month Selector */}
            {(mode === "date" || mode === "datetime") && (
              <View className="px-5 mb-3">
                <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider mb-2">Month</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {MONTHS.map((m, i) => (
                    <Pressable
                      key={m}
                      className={`rounded-lg px-2.5 py-1.5 ${
                        selectedMonth === i
                          ? "bg-brand-700"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                      onPress={() => setSelectedMonth(i)}
                    >
                      <Text
                        className={`text-xs font-sans-medium ${
                          selectedMonth === i
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {MONTH_SHORT[i]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Day Selector */}
            {(mode === "date" || mode === "datetime") && (
              <View className="px-5 mb-3">
                <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider mb-2">Day</Text>
                <View className="flex-row flex-wrap gap-1">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                    <Pressable
                      key={d}
                      className={`w-9 h-9 rounded-lg items-center justify-center ${
                        selectedDay === d
                          ? "bg-brand-700"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                      onPress={() => setSelectedDay(d)}
                    >
                      <Text
                        className={`text-xs font-sans-medium ${
                          selectedDay === d
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Year Selector (scrollable row) */}
            {(mode === "date" || mode === "datetime") && (
              <View className="px-5 mb-3">
                <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider mb-2">Year</Text>
                <View className="flex-row flex-wrap gap-1.5" style={{ maxHeight: 80 }}>
                  {years.slice(0, 30).map((y) => (
                    <Pressable
                      key={y}
                      className={`rounded-lg px-2.5 py-1.5 ${
                        selectedYear === y
                          ? "bg-brand-700"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                      onPress={() => setSelectedYear(y)}
                    >
                      <Text
                        className={`text-xs font-sans-medium ${
                          selectedYear === y
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {y}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Hour Selector for time/datetime mode */}
            {(mode === "time" || mode === "datetime") && (
              <View className="px-5 mb-3">
                <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider mb-2">Time</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {generateHours().map((h) => (
                    <Pressable
                      key={h.value}
                      className={`rounded-lg px-2.5 py-1.5 ${
                        selectedHour === h.value
                          ? "bg-brand-700"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                      onPress={() => setSelectedHour(h.value)}
                    >
                      <Text
                        className={`text-xs font-sans-medium ${
                          selectedHour === h.value
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {h.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Clear / Confirm */}
            <View className="flex-row px-5 pb-8 pt-3 gap-3">
              {optional && (
                <Pressable
                  className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 py-3 items-center"
                  onPress={handleClear}
                >
                  <Text className="text-sm font-sans-medium text-gray-500">Clear</Text>
                </Pressable>
              )}
              <Pressable
                className="flex-1 rounded-xl bg-brand-700 py-3 items-center"
                onPress={handleConfirm}
              >
                <Text className="text-sm font-sans-bold text-white">Confirm</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
