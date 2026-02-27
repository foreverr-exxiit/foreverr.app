import { View } from "react-native";
import { useEffect, useRef } from "react";
import { Animated, useColorScheme } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, className }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const colorScheme = useColorScheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
        opacity,
      }}
    />
  );
}

/** Pre-built skeleton for a memorial card */
export function MemorialCardSkeleton() {
  return (
    <View className="w-[48%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
      <Skeleton width="100%" height={112} borderRadius={0} />
      <View className="p-2.5">
        <Skeleton width="70%" height={14} />
        <Skeleton width="40%" height={10} className="mt-1.5" />
      </View>
    </View>
  );
}

/** Pre-built skeleton for a tribute post */
export function TributeSkeleton() {
  return (
    <View className="px-4 py-4 border-b border-gray-50 dark:border-gray-800">
      <View className="flex-row items-center mb-3">
        <Skeleton width={36} height={36} borderRadius={18} />
        <View className="ml-2.5">
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={10} className="mt-1" />
        </View>
      </View>
      <Skeleton width="100%" height={14} />
      <Skeleton width="80%" height={14} className="mt-1.5" />
      <Skeleton width="60%" height={14} className="mt-1.5" />
    </View>
  );
}

/** Pre-built skeleton for the home screen */
export function HomeScreenSkeleton() {
  return (
    <View className="px-4 pt-4">
      {/* Top memorials */}
      <Skeleton width={200} height={20} className="mb-3" />
      <View className="flex-row gap-3">
        {[1, 2, 3].map((i) => (
          <View key={i} className="items-center">
            <Skeleton width={96} height={96} borderRadius={16} />
            <Skeleton width={60} height={12} className="mt-1.5" />
          </View>
        ))}
      </View>
    </View>
  );
}

/** Generic list skeleton — rows with icon + text */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View className="px-4 pt-2">
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} className="flex-row items-center py-3 border-b border-gray-50 dark:border-gray-800">
          <Skeleton width={44} height={44} borderRadius={12} />
          <View className="flex-1 ml-3">
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={10} className="mt-2" />
          </View>
          <Skeleton width={48} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

/** Card grid skeleton — 2 columns */
export function CardGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <View className="flex-row flex-wrap gap-3 px-4 pt-2">
      {Array.from({ length: cards }).map((_, i) => (
        <View key={i} className="w-[48%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <Skeleton width="100%" height={100} borderRadius={0} />
          <View className="p-3">
            <Skeleton width="75%" height={14} />
            <Skeleton width="50%" height={10} className="mt-2" />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Detail screen skeleton — hero + text blocks */
export function DetailScreenSkeleton() {
  return (
    <View>
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View className="px-4 pt-4">
        <Skeleton width="70%" height={22} />
        <Skeleton width="40%" height={14} className="mt-2" />
        <View className="mt-4">
          <Skeleton width="100%" height={14} />
          <Skeleton width="95%" height={14} className="mt-2" />
          <Skeleton width="85%" height={14} className="mt-2" />
          <Skeleton width="70%" height={14} className="mt-2" />
        </View>
        <View className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <Skeleton width="50%" height={14} className="mb-3" />
          <Skeleton width="100%" height={12} />
          <Skeleton width="100%" height={12} className="mt-2" />
          <Skeleton width="80%" height={12} className="mt-2" />
        </View>
      </View>
    </View>
  );
}
