import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

interface LiveRoomCardProps {
  title: string;
  hostName: string;
  hostAvatar?: string | null;
  memorialName?: string;
  roomType?: string;
  status?: string;
  participantCount?: number;
  maxParticipants?: number | null;
  scheduledAt?: string;
  onPress?: () => void;
}

export function LiveRoomCard({
  title,
  hostName,
  hostAvatar,
  memorialName,
  roomType = "audio",
  status = "live",
  participantCount = 0,
  maxParticipants,
  scheduledAt,
  onPress,
}: LiveRoomCardProps) {
  const isLive = status === "live";
  const isScheduled = status === "scheduled";

  const formatScheduledTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`rounded-2xl p-4 mb-3 border ${
        isLive ? "bg-purple-50 border-purple-200" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
      }`}
    >
      {/* Header */}
      <View className="flex-row items-start gap-3">
        {/* Host avatar */}
        {hostAvatar ? (
          <Image source={{ uri: hostAvatar }} className="w-11 h-11 rounded-full" />
        ) : (
          <View className="w-11 h-11 rounded-full bg-purple-200 items-center justify-center">
            <Feather name="user" size={18} color="#7C3AED" />
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
              {title}
            </Text>
            {/* Status indicator */}
            {isLive && (
              <View className="flex-row items-center gap-1 bg-red-500 rounded-full px-2 py-0.5">
                <View className="w-1.5 h-1.5 rounded-full bg-white" />
                <Text className="text-xs text-white font-bold">LIVE</Text>
              </View>
            )}
            {isScheduled && (
              <View className="flex-row items-center gap-1 bg-blue-100 rounded-full px-2 py-0.5">
                <Feather name="clock" size={10} color="#3B82F6" />
                <Text className="text-xs text-blue-600 font-medium">Scheduled</Text>
              </View>
            )}
          </View>

          <Text className="text-xs text-gray-500 mt-0.5">
            Hosted by {hostName}
          </Text>

          {memorialName && (
            <Text className="text-xs text-purple-600 mt-0.5">
              {memorialName} Memorial
            </Text>
          )}
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center gap-3">
          {/* Room type */}
          <View className="flex-row items-center gap-1">
            <Feather
              name={roomType === "video" ? "video" : roomType === "stream" ? "radio" : "mic"}
              size={14}
              color="#6B7280"
            />
            <Text className="text-xs text-gray-500 capitalize">{roomType}</Text>
          </View>

          {/* Participant count */}
          <View className="flex-row items-center gap-1">
            <Feather name="users" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {participantCount}{maxParticipants ? `/${maxParticipants}` : ""}
            </Text>
          </View>
        </View>

        {/* Schedule time or Join button */}
        {isScheduled && scheduledAt ? (
          <Text className="text-xs text-gray-400">{formatScheduledTime(scheduledAt)}</Text>
        ) : isLive ? (
          <View className="bg-purple-600 rounded-full px-4 py-1.5">
            <Text className="text-xs text-white font-semibold">Join</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
