import React from "react";
import { View, Pressable, Modal, ScrollView, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ProfileInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  memorial: {
    first_name?: string;
    last_name?: string;
    nickname?: string;
    biography?: string;
    date_of_birth?: string | null;
    date_of_death?: string | null;
    birth_place?: string | null;
    resting_place?: string | null;
    personality_traits?: string[] | null;
    hobbies?: string[] | null;
    accomplishments?: string[] | null;
    favorite_quotes?: string[] | null;
    cause_of_death?: string | null;
    occupation?: string | null;
    education?: string | null;
    military_service?: string | null;
    religion?: string | null;
    [key: string]: unknown;
  };
}

function Section({ title, icon, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons name={icon} size={16} color="#4A2D7A" />
        <Text className="text-sm font-sans-bold text-gray-800 dark:text-gray-200">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item, i) => (
        <View key={i} className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5">
          <Text className="text-xs font-sans-medium text-brand-700 dark:text-brand-400">{item}</Text>
        </View>
      ))}
    </View>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Normalize a value that might be a string, string[], or null into string[]
function normalizeToArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function ProfileInfoSheet({ visible, onClose, memorial }: ProfileInfoSheetProps) {
  const { height } = useWindowDimensions();
  const maxHeight = height * 0.85;

  const displayName = memorial.nickname
    ? `${memorial.first_name} "${memorial.nickname}" ${memorial.last_name}`
    : `${memorial.first_name ?? ""} ${memorial.last_name ?? ""}`.trim();

  // Normalize fields that may be stored as comma-separated strings or arrays
  const traits = normalizeToArray(memorial.personality_traits);
  const hobbies = normalizeToArray(memorial.hobbies);
  const accomplishments = normalizeToArray(memorial.accomplishments);
  const quotes = normalizeToArray(memorial.favorite_quotes);

  const hasKeyDates = memorial.date_of_birth || memorial.date_of_death;
  const hasLocations = memorial.birth_place || memorial.resting_place;
  const hasTraits = traits.length > 0;
  const hasHobbies = hobbies.length > 0;
  const hasAccomplishments = accomplishments.length > 0;
  const hasQuotes = quotes.length > 0;
  const hasDetails = memorial.occupation || memorial.education || memorial.military_service || memorial.religion;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50"
        onPress={onClose}
      >
        <View className="flex-1" />
        <Pressable
          className="bg-white dark:bg-gray-900 rounded-t-3xl"
          onPress={(e) => e.stopPropagation()}
          style={{ maxHeight }}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Header */}
          <View className="px-5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                {displayName}
              </Text>
              <Pressable onPress={onClose} className="p-1">
                <Ionicons name="close-circle" size={24} color="#9ca3af" />
              </Pressable>
            </View>
            {memorial.occupation && (
              <Text className="text-sm font-sans text-gray-500 mt-0.5">{memorial.occupation}</Text>
            )}
          </View>

          <ScrollView
            className="px-5 pt-4"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Biography */}
            {memorial.biography && (
              <Section title="Biography" icon="book-outline">
                <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-6">
                  {memorial.biography}
                </Text>
              </Section>
            )}

            {/* Key Dates */}
            {hasKeyDates && (
              <Section title="Key Dates" icon="calendar-outline">
                {memorial.date_of_birth && (
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Text className="text-xs font-sans-semibold text-gray-500 w-16">Born</Text>
                    <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">
                      {formatDate(memorial.date_of_birth)}
                    </Text>
                  </View>
                )}
                {memorial.date_of_death && (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-sans-semibold text-gray-500 w-16">Passed</Text>
                    <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">
                      {formatDate(memorial.date_of_death)}
                    </Text>
                  </View>
                )}
              </Section>
            )}

            {/* Locations */}
            {hasLocations && (
              <Section title="Locations" icon="location-outline">
                {memorial.birth_place && (
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Text className="text-xs font-sans-semibold text-gray-500 w-20">Birthplace</Text>
                    <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">
                      {memorial.birth_place}
                    </Text>
                  </View>
                )}
                {memorial.resting_place && (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-sans-semibold text-gray-500 w-20">Resting</Text>
                    <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">
                      {memorial.resting_place}
                    </Text>
                  </View>
                )}
              </Section>
            )}

            {/* Personality Traits */}
            {hasTraits && (
              <Section title="Personality & Traits" icon="heart-outline">
                <ChipList items={traits} />
              </Section>
            )}

            {/* Accomplishments */}
            {hasAccomplishments && (
              <Section title="Accomplishments" icon="trophy-outline">
                {accomplishments.map((item, i) => (
                  <View key={i} className="flex-row items-start gap-2 mb-1.5">
                    <Text className="text-brand-700 mt-0.5">•</Text>
                    <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300">{item}</Text>
                  </View>
                ))}
              </Section>
            )}

            {/* Hobbies */}
            {hasHobbies && (
              <Section title="Hobbies & Interests" icon="color-palette-outline">
                <ChipList items={hobbies} />
              </Section>
            )}

            {/* Life Details */}
            {hasDetails && (
              <Section title="Life Details" icon="information-circle-outline">
                {memorial.education && (
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Ionicons name="school-outline" size={14} color="#6b7280" />
                    <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">{memorial.education}</Text>
                  </View>
                )}
                {memorial.military_service && (
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Ionicons name="shield-outline" size={14} color="#6b7280" />
                    <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">{memorial.military_service}</Text>
                  </View>
                )}
                {memorial.religion && (
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Ionicons name="flower-outline" size={14} color="#6b7280" />
                    <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">{memorial.religion}</Text>
                  </View>
                )}
              </Section>
            )}

            {/* Favorite Quotes */}
            {hasQuotes && (
              <Section title="Favorite Quotes" icon="chatbox-ellipses-outline">
                {quotes.map((quote, i) => (
                  <View key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-2">
                    <Text className="text-sm font-sans italic text-gray-600 dark:text-gray-400 leading-5">
                      "{quote}"
                    </Text>
                  </View>
                ))}
              </Section>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
