import React, { useEffect, useMemo } from "react";
import { View, Pressable, Dimensions, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PARTICLE_COLORS = [
  "#7C3AED", "#4A2D7A", "#F59E0B", "#EC4899",
  "#10B981", "#3B82F6", "#EF4444", "#FFD700",
];

const NUM_PARTICLES = 24;

interface CheersAnimationProps {
  visible: boolean;
  memorialName: string;
  onDismiss: () => void;
  duration?: number;
}

interface ParticleConfig {
  angle: number;
  distance: number;
  color: string;
  size: number;
  isCircle: boolean;
  rotation: number;
  speed: number;
}

function generateParticles(): ParticleConfig[] {
  return Array.from({ length: NUM_PARTICLES }, (_, i) => ({
    angle: (i / NUM_PARTICLES) * 360 + (Math.random() - 0.5) * 30,
    distance: 100 + Math.random() * 200,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    size: 4 + Math.random() * 6,
    isCircle: Math.random() > 0.5,
    rotation: Math.random() * 720,
    speed: 800 + Math.random() * 400,
  }));
}

function useParticle(config: ParticleConfig, visible: boolean) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  const rad = (config.angle * Math.PI) / 180;
  const endX = Math.cos(rad) * config.distance;
  const endY = Math.sin(rad) * config.distance;

  useEffect(() => {
    if (visible) {
      const delay = Math.random() * 100;
      translateX.value = withDelay(delay, withTiming(endX, { duration: config.speed, easing: Easing.out(Easing.quad) }));
      translateY.value = withDelay(delay, withTiming(endY, { duration: config.speed, easing: Easing.out(Easing.quad) }));
      scale.value = withDelay(delay, withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(0.3, { duration: config.speed - 100 })
      ));
      opacity.value = withDelay(delay, withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(1, { duration: config.speed - 300 }),
        withTiming(0, { duration: 220 })
      ));
      rotation.value = withDelay(delay, withTiming(config.rotation, { duration: config.speed }));
    } else {
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      opacity.value = 0;
      rotation.value = 0;
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ] as any,
  }));

  return style;
}

export function CheersAnimation({ visible, memorialName, onDismiss, duration = 2500 }: CheersAnimationProps) {
  const overlayOpacity = useSharedValue(0);
  const flashScale = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.5);

  const particles = useMemo(() => generateParticles(), []);

  // Use hooks for first 24 particles
  const p0 = useParticle(particles[0], visible);
  const p1 = useParticle(particles[1], visible);
  const p2 = useParticle(particles[2], visible);
  const p3 = useParticle(particles[3], visible);
  const p4 = useParticle(particles[4], visible);
  const p5 = useParticle(particles[5], visible);
  const p6 = useParticle(particles[6], visible);
  const p7 = useParticle(particles[7], visible);
  const p8 = useParticle(particles[8], visible);
  const p9 = useParticle(particles[9], visible);
  const p10 = useParticle(particles[10], visible);
  const p11 = useParticle(particles[11], visible);
  const p12 = useParticle(particles[12], visible);
  const p13 = useParticle(particles[13], visible);
  const p14 = useParticle(particles[14], visible);
  const p15 = useParticle(particles[15], visible);
  const p16 = useParticle(particles[16], visible);
  const p17 = useParticle(particles[17], visible);
  const p18 = useParticle(particles[18], visible);
  const p19 = useParticle(particles[19], visible);
  const p20 = useParticle(particles[20], visible);
  const p21 = useParticle(particles[21], visible);
  const p22 = useParticle(particles[22], visible);
  const p23 = useParticle(particles[23], visible);
  const particleStyles = [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21,p22,p23];

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });

      // Central flash
      flashScale.value = withTiming(2.0, { duration: 200, easing: Easing.out(Easing.exp) });
      flashOpacity.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(0, { duration: 300 })
      );

      // Text slides up after burst
      textOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
      textScale.value = withDelay(400, withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.back(1.3)),
      }));

      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 400 });
        textOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(onDismiss, 450);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      overlayOpacity.value = 0;
      flashScale.value = 0;
      flashOpacity.value = 0;
      textOpacity.value = 0;
      textScale.value = 0.5;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: "rgba(0, 0, 0, 0.80)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        },
        overlayStyle,
      ]}
    >
      <Pressable
        style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}
        onPress={onDismiss}
      >
        {/* Central flash */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(255, 215, 0, 0.6)",
            },
            flashStyle,
          ]}
        />

        {/* Particles */}
        {particleStyles.map((pStyle, i) => (
          <Animated.View
            key={i}
            style={[
              {
                position: "absolute",
                width: particles[i].isCircle ? particles[i].size : particles[i].size * 0.6,
                height: particles[i].size,
                borderRadius: particles[i].isCircle ? particles[i].size / 2 : 1,
                backgroundColor: particles[i].color,
              } as any,
              pStyle,
            ]}
          />
        ))}

        {/* Central emoji burst */}
        <Animated.View style={flashStyle}>
          <Text style={{ fontSize: 56 }}>{"\u2728"}</Text>
        </Animated.View>

        {/* Text */}
        <Animated.View style={{ position: "absolute", bottom: SCREEN_HEIGHT * 0.12, left: 0, right: 0, alignItems: "center", paddingHorizontal: 20 }}>
          <Animated.View style={textStyle}>
            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", borderRadius: 16, paddingVertical: 18, paddingHorizontal: 28, alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 215, 0, 0.25)" }}>
              <Text style={{ color: "#FFD700", fontSize: 23, fontWeight: "700", textAlign: "center", lineHeight: 30 }}>
                {"\uD83C\uDF89"} Cheers to {memorialName}! {"\uD83C\uDF89"}
              </Text>
            </View>
            <Text style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: 13, textAlign: "center", marginTop: 12 }}>
              Tap anywhere to close
            </Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
