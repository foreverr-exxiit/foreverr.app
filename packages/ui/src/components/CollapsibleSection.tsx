import React, { useState } from "react";
import { View, Pressable, Platform, LayoutAnimation } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface CollapsibleSectionProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  count?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  icon,
  iconColor = "#4A2D7A",
  count,
  defaultExpanded = true,
  children,
  headerRight,
  className = "",
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 1 : 0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }] as any,
  }));

  const toggle = () => {
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    rotation.value = withTiming(isExpanded ? 0 : 1, { duration: 250 });
    setIsExpanded((prev) => !prev);
  };

  return (
    <View className={className}>
      {/* Header */}
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between py-2.5 px-1"
        style={{ minHeight: 40 }}
      >
        <View className="flex-row items-center flex-1" style={{ gap: 8 }}>
          {icon && <Ionicons name={icon} size={18} color={iconColor} />}
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
            {title}
          </Text>
          {count !== undefined && count > 0 && (
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: "rgba(124, 58, 237, 0.12)" }}
            >
              <Text
                className="font-sans-bold"
                style={{ fontSize: 10, color: "#7C3AED" }}
              >
                {count}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center" style={{ gap: 8 }}>
          {headerRight}
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-up" size={18} color="#9ca3af" />
          </Animated.View>
        </View>
      </Pressable>

      {/* Content */}
      {isExpanded && children}
    </View>
  );
}
