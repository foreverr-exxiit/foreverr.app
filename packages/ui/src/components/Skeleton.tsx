import { View } from "react-native";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, className }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

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
        backgroundColor: "#e5e7eb",
        opacity,
      }}
    />
  );
}

/** Pre-built skeleton for a memorial card */
export function MemorialCardSkeleton() {
  return (
    <View className="w-[48%] rounded-2xl bg-gray-50 overflow-hidden">
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
    <View className="px-4 py-4 border-b border-gray-50">
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
