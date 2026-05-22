import { useState } from "react";
import { View, Pressable, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text } from "../primitives/Text";

interface HostInfo {
  id?: string;
  role: string;
  relationship: string;
  relationship_detail: string | null;
  user: {
    id: string;
    display_name: string;
    username?: string | null;
    avatar_url: string | null;
  };
}

type HostMode = "memorial" | "celebration" | "event" | "family_tree" | "virtual_space" | "wedding" | "pet_page";

interface HostSectionProps {
  hosts: HostInfo[];
  mode: HostMode;
  onPressHost: (userId: string) => void;
  onMessageHost?: (userId: string, displayName: string) => void;
  currentUserId?: string;
  isCreatingDM?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  co_host: "Co-host",
  contributor: "Contributor",
  moderator: "Moderator",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  immediate_family: "Family",
  extended_family: "Extended Family",
  friend: "Friend",
  colleague: "Colleague",
  fan: "Admirer",
  spouse: "Spouse",
  partner: "Partner",
  pet_owner: "Pet Owner",
  caretaker: "Caretaker",
  wedding_party: "Wedding Party",
  organizer: "Organizer",
  other: "",
};

const MODE_LABELS: Record<HostMode, string> = {
  memorial: "Maintained by",
  celebration: "Created by",
  event: "Organized by",
  family_tree: "Managed by",
  virtual_space: "Created by",
  wedding: "Hosted by",
  pet_page: "Pet parent",
};

const MODE_ICONS: Record<HostMode, keyof typeof Ionicons.glyphMap> = {
  memorial: "shield-checkmark-outline",
  celebration: "people-outline",
  event: "calendar-outline",
  family_tree: "git-branch-outline",
  virtual_space: "cube-outline",
  wedding: "heart-outline",
  pet_page: "paw-outline",
};

function getModeLabel(mode: HostMode): string {
  return MODE_LABELS[mode] ?? "Created by";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function HostSection({ hosts, mode, onPressHost, onMessageHost, currentUserId, isCreatingDM }: HostSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!hosts || hosts.length === 0) return null;

  const primary = hosts[0];
  const others = hosts.slice(1);
  const modeLabel = getModeLabel(mode);
  const relationshipLabel = RELATIONSHIP_LABELS[primary.relationship] ?? primary.relationship_detail ?? "";

  // Show Message button for all real users (self-message handled by the callback)
  const canMessage = (hostUserId: string) =>
    !!onMessageHost &&
    hostUserId !== "community";

  // Smart press: single host → go to profile, multiple hosts → expand list
  const handleInfoPress = () => {
    if (others.length > 0) {
      setExpanded(!expanded);
    } else if (primary.user.id !== "community") {
      onPressHost(primary.user.id);
    }
  };

  return (
    <View className="mx-4 mb-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5">
      {/* Inline summary — info area and buttons are SEPARATE touch targets */}
      <View className="flex-row items-center justify-between">
        {/* Left: tappable host info (navigate or expand) */}
        <Pressable onPress={handleInfoPress} className="flex-row items-center gap-2 flex-1">
          <Ionicons
            name={MODE_ICONS[mode] ?? "people-outline"}
            size={14}
            color="#6b7280"
          />
          <View className="flex-row items-center gap-1.5 flex-1">
            {/* Primary host avatar */}
            <View className="h-6 w-6 rounded-full bg-brand-200 items-center justify-center overflow-hidden">
              {primary.user.avatar_url ? (
                <Image source={{ uri: primary.user.avatar_url }} style={{ width: 24, height: 24 }} contentFit="cover" />
              ) : (
                <Text className="text-[10px] font-sans-bold text-brand-700">
                  {getInitials(primary.user.display_name)}
                </Text>
              )}
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
              {modeLabel}{" "}
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-200">
                {primary.user.display_name}
              </Text>
              {relationshipLabel ? (
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {"  ·  "}{relationshipLabel}
                </Text>
              ) : null}
              {others.length > 0 ? (
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {"  and "}{others.length} other{others.length > 1 ? "s" : ""}
                </Text>
              ) : null}
            </Text>
          </View>
        </Pressable>

        {/* Right: Message button + chevron — independent touch target */}
        <View className="flex-row items-center gap-2">
          {canMessage(primary.user.id) && (
            <Pressable
              className="flex-row items-center gap-1 rounded-full bg-brand-700 px-2.5 py-1"
              onPress={() => onMessageHost!(primary.user.id, primary.user.display_name)}
              disabled={isCreatingDM}
            >
              {isCreatingDM ? (
                <ActivityIndicator size={11} color="white" />
              ) : (
                <Ionicons name="chatbubble-outline" size={11} color="white" />
              )}
              <Text className="text-[10px] font-sans-semibold text-white">
                {isCreatingDM ? "Opening…" : "Message"}
              </Text>
            </Pressable>
          )}
          {others.length > 0 ? (
            <Pressable onPress={() => setExpanded(!expanded)}>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={14}
                color="#9ca3af"
              />
            </Pressable>
          ) : primary.user.id !== "community" ? (
            <Pressable onPress={handleInfoPress}>
              <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Expanded host list */}
      {expanded && others.length > 0 && (
        <View className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700 gap-2">
          {/* Primary host row (detailed) */}
          <View className="flex-row items-center gap-3 py-1">
            <Pressable
              className="flex-row items-center gap-3 flex-1"
              onPress={() => onPressHost(primary.user.id)}
            >
              <View className="h-9 w-9 rounded-full bg-brand-200 items-center justify-center overflow-hidden">
                {primary.user.avatar_url ? (
                  <Image source={{ uri: primary.user.avatar_url }} style={{ width: 36, height: 36 }} contentFit="cover" />
                ) : (
                  <Text className="text-xs font-sans-bold text-brand-700">
                    {getInitials(primary.user.display_name)}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-sm font-sans-semibold text-gray-800 dark:text-white">
                  {primary.user.display_name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {ROLE_LABELS[primary.role] ?? primary.role}
                  {relationshipLabel ? ` · ${relationshipLabel}` : ""}
                </Text>
              </View>
            </Pressable>
            <View className="flex-row items-center gap-1.5">
              {canMessage(primary.user.id) && (
                <Pressable
                  className="rounded-full bg-gray-200 dark:bg-gray-600 px-2 py-0.5"
                  onPress={() => onMessageHost!(primary.user.id, primary.user.display_name)}
                  disabled={isCreatingDM}
                >
                  {isCreatingDM ? (
                    <ActivityIndicator size={12} color="#6b7280" />
                  ) : (
                    <Ionicons name="chatbubble-outline" size={12} color="#6b7280" />
                  )}
                </Pressable>
              )}
              <View className="rounded-full bg-brand-700 px-2 py-0.5">
                <Text className="text-[10px] font-sans-semibold text-white">
                  {ROLE_LABELS[primary.role] ?? "Host"}
                </Text>
              </View>
            </View>
          </View>

          {/* Other hosts */}
          {others.map((host, idx) => {
            const rel = RELATIONSHIP_LABELS[host.relationship] ?? host.relationship_detail ?? "";
            return (
              <View key={host.user.id ?? idx} className="flex-row items-center gap-3 py-1">
                <Pressable
                  className="flex-row items-center gap-3 flex-1"
                  onPress={() => onPressHost(host.user.id)}
                >
                  <View className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center overflow-hidden">
                    {host.user.avatar_url ? (
                      <Image source={{ uri: host.user.avatar_url }} style={{ width: 36, height: 36 }} contentFit="cover" />
                    ) : (
                      <Text className="text-xs font-sans-bold text-gray-600 dark:text-gray-300">
                        {getInitials(host.user.display_name)}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-sans-semibold text-gray-800 dark:text-white">
                      {host.user.display_name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {ROLE_LABELS[host.role] ?? host.role}
                      {rel ? ` · ${rel}` : ""}
                    </Text>
                  </View>
                </Pressable>
                <View className="flex-row items-center gap-1.5">
                  {canMessage(host.user.id) && (
                    <Pressable
                      className="rounded-full bg-gray-200 dark:bg-gray-600 px-2 py-0.5"
                      onPress={() => onMessageHost!(host.user.id, host.user.display_name)}
                      disabled={isCreatingDM}
                    >
                      {isCreatingDM ? (
                        <ActivityIndicator size={12} color="#6b7280" />
                      ) : (
                        <Ionicons name="chatbubble-outline" size={12} color="#6b7280" />
                      )}
                    </Pressable>
                  )}
                  <View className={`rounded-full px-2 py-0.5 ${host.role === "co_host" ? "bg-brand-400" : "bg-gray-300 dark:bg-gray-600"}`}>
                    <Text className={`text-[10px] font-sans-semibold ${host.role === "co_host" ? "text-white" : "text-gray-700 dark:text-gray-200"}`}>
                      {ROLE_LABELS[host.role] ?? "Host"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
