import React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Path,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Ellipse,
  Line,
} from "react-native-svg";

interface Props {
  slide: "remember" | "share" | "legacy" | "community";
  size?: number;
}

/**
 * Branded SVG illustrations for the onboarding carousel.
 * Designed for DARK backgrounds (bg-brand-900) — uses solid whites,
 * bright golds, and fully-opaque fills for maximum visibility.
 */
export function OnboardingIllustration({ slide, size = 240 }: Props) {
  switch (slide) {
    case "remember":
      return <RememberIllustration size={size} />;
    case "share":
      return <ShareIllustration size={size} />;
    case "legacy":
      return <LegacyIllustration size={size} />;
    case "community":
      return <CommunityIllustration size={size} />;
    default:
      return null;
  }
}

/* ───────── Slide 1: Remember Together ───────── */
function RememberIllustration({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Defs>
          <LinearGradient id="r_stone" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#e9d5ff" />
          </LinearGradient>
        </Defs>

        {/* Soft glow behind the scene */}
        <Circle cx="120" cy="115" r="95" fill="#7C3AED" fillOpacity={0.25} />

        {/* Light rays from behind stone */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <Line
            key={angle}
            x1="120"
            y1="105"
            x2={120 + 90 * Math.cos((angle * Math.PI) / 180)}
            y2={105 + 90 * Math.sin((angle * Math.PI) / 180)}
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity={0.2}
          />
        ))}

        {/* Memorial headstone */}
        <Path
          d="M78 190 L78 110 Q78 75 120 62 Q162 75 162 110 L162 190 Z"
          fill="url(#r_stone)"
          stroke="white"
          strokeWidth="2"
        />

        {/* Cross on stone */}
        <Rect x="116" y="85" width="8" height="50" rx="2" fill="#7C3AED" />
        <Rect x="103" y="98" width="34" height="8" rx="2" fill="#7C3AED" />

        {/* Dove silhouette — large, bright white */}
        <G transform="translate(80, 15) scale(0.5)">
          <Path
            d="M70 50 Q50 25 25 38 Q5 50 18 72 Q0 62 -5 80 Q5 98 30 88 Q22 105 40 98 L65 80 Q85 92 110 78 Q130 65 155 72 Q140 55 118 62 Q105 50 92 52 Q80 42 70 50Z"
            fill="white"
          />
        </G>

        {/* Ground line */}
        <Line x1="30" y1="190" x2="210" y2="190" stroke="white" strokeWidth="2" strokeOpacity={0.4} />

        {/* Flowers at base */}
        <G transform="translate(55, 175)">
          <Circle cx="0" cy="0" r="6" fill="#FFD700" />
          <Circle cx="-8" cy="-4" r="5" fill="#f472b6" />
          <Circle cx="8" cy="-4" r="5" fill="#f472b6" />
          <Circle cx="0" cy="-8" r="5" fill="#f472b6" />
          <Circle cx="0" cy="0" r="3" fill="#FFD700" />
        </G>
        <G transform="translate(185, 175)">
          <Circle cx="0" cy="0" r="6" fill="#FFD700" />
          <Circle cx="-8" cy="-4" r="5" fill="#c4b5fd" />
          <Circle cx="8" cy="-4" r="5" fill="#c4b5fd" />
          <Circle cx="0" cy="-8" r="5" fill="#c4b5fd" />
          <Circle cx="0" cy="0" r="3" fill="#FFD700" />
        </G>

        {/* Stars */}
        <Circle cx="40" cy="40" r="3" fill="white" />
        <Circle cx="200" cy="35" r="2.5" fill="white" />
        <Circle cx="25" cy="80" r="2" fill="white" fillOpacity={0.7} />
        <Circle cx="210" cy="75" r="2" fill="white" fillOpacity={0.7} />
        <Circle cx="185" cy="50" r="1.5" fill="#FFD700" />
        <Circle cx="55" cy="60" r="1.5" fill="#FFD700" />
      </Svg>
    </View>
  );
}

/* ───────── Slide 2: Share Their Story ───────── */
function ShareIllustration({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Defs>
          <LinearGradient id="s_page" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#f0e6ff" />
          </LinearGradient>
        </Defs>

        {/* Glow */}
        <Circle cx="120" cy="120" r="95" fill="#7C3AED" fillOpacity={0.25} />

        {/* Open book — left page */}
        <Path
          d="M120 180 L120 80 Q90 72 50 78 L50 172 Q90 165 120 180Z"
          fill="url(#s_page)"
          stroke="white"
          strokeWidth="2"
        />
        {/* Open book — right page */}
        <Path
          d="M120 180 L120 80 Q150 72 190 78 L190 172 Q150 165 120 180Z"
          fill="url(#s_page)"
          stroke="white"
          strokeWidth="2"
        />
        {/* Spine */}
        <Line x1="120" y1="80" x2="120" y2="180" stroke="#c4b5fd" strokeWidth="2.5" />

        {/* Text lines on left page */}
        <Line x1="64" y1="96" x2="108" y2="96" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
        <Line x1="64" y1="108" x2="104" y2="108" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="64" y1="120" x2="100" y2="120" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="64" y1="132" x2="106" y2="132" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="64" y1="144" x2="95" y2="144" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />

        {/* Photo on right page */}
        <Rect x="130" y="90" width="48" height="42" rx="4" fill="#c4b5fd" />
        <Rect x="133" y="93" width="42" height="33" rx="2" fill="white" />
        <Circle cx="154" cy="103" r="8" fill="#e9d5ff" />
        <Path d="M140 122 Q147 112 154 110 Q161 112 168 122" fill="#e9d5ff" />

        {/* Caption lines */}
        <Line x1="130" y1="142" x2="178" y2="142" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="130" y1="154" x2="170" y2="154" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />

        {/* Floating photo frame top-left */}
        <G transform="rotate(-12, 42, 45)">
          <Rect x="22" y="28" width="40" height="34" rx="4" fill="white" stroke="#e9d5ff" strokeWidth="2" />
          <Rect x="26" y="32" width="32" height="24" rx="2" fill="#e9d5ff" />
        </G>

        {/* Floating photo frame top-right */}
        <G transform="rotate(10, 198, 42)">
          <Rect x="178" y="25" width="38" height="32" rx="4" fill="white" stroke="#e9d5ff" strokeWidth="2" />
          <Rect x="182" y="29" width="30" height="22" rx="2" fill="#ddd6fe" />
        </G>

        {/* Hearts */}
        <Path d="M38 195 Q38 188 45 184 Q52 188 52 195 Q52 202 45 207 Q38 202 38 195Z" fill="#f472b6" />
        <Path d="M182 192 Q182 186 188 183 Q194 186 194 192 Q194 198 188 202 Q182 198 182 192Z" fill="#f472b6" fillOpacity={0.8} />
        <Path d="M160 40 Q160 36 164 34 Q168 36 168 40 Q168 44 164 47 Q160 44 160 40Z" fill="#f472b6" fillOpacity={0.7} />

        {/* Stars */}
        <Circle cx="15" cy="70" r="2.5" fill="white" />
        <Circle cx="225" cy="80" r="2" fill="white" />
        <Circle cx="110" cy="35" r="2" fill="#FFD700" />
      </Svg>
    </View>
  );
}

/* ───────── Slide 3: A Living Legacy ───────── */
function LegacyIllustration({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Defs>
          <LinearGradient id="l_candle" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#f0e6ff" />
          </LinearGradient>
          <LinearGradient id="l_flame" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#FFFDE0" />
            <Stop offset="0.35" stopColor="#FFD700" />
            <Stop offset="1" stopColor="#FF8C00" />
          </LinearGradient>
          <LinearGradient id="l_inner" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="white" />
            <Stop offset="1" stopColor="#FFE066" />
          </LinearGradient>
        </Defs>

        {/* Warm ambient glow */}
        <Circle cx="120" cy="80" r="70" fill="#FFD700" fillOpacity={0.12} />
        <Circle cx="120" cy="80" r="50" fill="#FFD700" fillOpacity={0.18} />
        <Circle cx="120" cy="80" r="32" fill="#FFD700" fillOpacity={0.25} />

        {/* Candle holder base */}
        <Ellipse cx="120" cy="200" rx="50" ry="10" fill="white" fillOpacity={0.3} />
        <Rect x="105" y="188" width="30" height="14" rx="4" fill="#c4b5fd" />

        {/* Candle body */}
        <Rect x="105" y="105" width="30" height="86" rx="4" fill="url(#l_candle)" stroke="white" strokeWidth="1" />

        {/* Wax drips */}
        <Circle cx="105" cy="125" r="4" fill="white" fillOpacity={0.8} />
        <Circle cx="135" cy="140" r="3.5" fill="white" fillOpacity={0.8} />
        <Ellipse cx="107" cy="148" rx="3.5" ry="6" fill="white" fillOpacity={0.7} />

        {/* Wick */}
        <Line x1="120" y1="105" x2="120" y2="88" stroke="white" strokeWidth="2" strokeOpacity={0.6} />

        {/* Flame outer — big and bright */}
        <Path
          d="M120 45 Q132 62 132 76 Q132 90 120 95 Q108 90 108 76 Q108 62 120 45Z"
          fill="url(#l_flame)"
        />
        {/* Flame inner */}
        <Path
          d="M120 60 Q126 70 126 80 Q126 88 120 92 Q114 88 114 80 Q114 70 120 60Z"
          fill="url(#l_inner)"
        />

        {/* Flower cluster left */}
        <G transform="translate(42, 168)">
          <Circle cx="0" cy="-7" r="7" fill="#f472b6" />
          <Circle cx="7" cy="0" r="7" fill="#f472b6" />
          <Circle cx="0" cy="7" r="7" fill="#f472b6" />
          <Circle cx="-7" cy="0" r="7" fill="#f472b6" />
          <Circle cx="0" cy="0" r="5" fill="#FFD700" />
          <Line x1="0" y1="14" x2="0" y2="30" stroke="white" strokeWidth="2" strokeOpacity={0.5} />
        </G>

        {/* Flower cluster right */}
        <G transform="translate(198, 168)">
          <Circle cx="0" cy="-7" r="7" fill="#c4b5fd" />
          <Circle cx="7" cy="0" r="7" fill="#c4b5fd" />
          <Circle cx="0" cy="7" r="7" fill="#c4b5fd" />
          <Circle cx="-7" cy="0" r="7" fill="#c4b5fd" />
          <Circle cx="0" cy="0" r="5" fill="#FFD700" />
          <Line x1="0" y1="14" x2="0" y2="30" stroke="white" strokeWidth="2" strokeOpacity={0.5} />
        </G>

        {/* Calendar icon */}
        <G transform="translate(175, 108)">
          <Rect x="0" y="0" width="28" height="26" rx="4" fill="white" stroke="#e9d5ff" strokeWidth="1.5" />
          <Rect x="0" y="0" width="28" height="8" rx="4" fill="#7C3AED" />
          <Circle cx="9" cy="17" r="3" fill="#7C3AED" fillOpacity={0.5} />
          <Circle cx="19" cy="17" r="3" fill="#FFD700" />
        </G>

        {/* Sparkles */}
        <Circle cx="80" cy="55" r="3" fill="#FFD700" />
        <Circle cx="160" cy="48" r="2.5" fill="#FFD700" />
        <Circle cx="65" cy="85" r="2" fill="white" fillOpacity={0.6} />
        <Circle cx="175" cy="78" r="2" fill="white" fillOpacity={0.6} />
        <Circle cx="55" cy="40" r="2" fill="white" />
        <Circle cx="185" cy="35" r="2" fill="white" />
      </Svg>
    </View>
  );
}

/* ───────── Slide 4: Join the Community ───────── */
function CommunityIllustration({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Defs>
          <LinearGradient id="c_person1" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#e9d5ff" />
          </LinearGradient>
          <LinearGradient id="c_person2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#e9d5ff" />
            <Stop offset="1" stopColor="#c4b5fd" />
          </LinearGradient>
        </Defs>

        {/* Glow */}
        <Circle cx="120" cy="120" r="95" fill="#7C3AED" fillOpacity={0.25} />

        {/* Large heart in background */}
        <Path
          d="M120 195 Q55 155 42 115 Q30 75 65 58 Q100 42 120 72 Q140 42 175 58 Q210 75 198 115 Q185 155 120 195Z"
          fill="#f472b6"
          fillOpacity={0.2}
          stroke="white"
          strokeWidth="2"
          strokeOpacity={0.4}
        />

        {/* Connection lines — solid white */}
        <Line x1="78" y1="112" x2="120" y2="90" stroke="white" strokeWidth="1.5" strokeOpacity={0.5} />
        <Line x1="162" y1="112" x2="120" y2="90" stroke="white" strokeWidth="1.5" strokeOpacity={0.5} />
        <Line x1="78" y1="112" x2="100" y2="155" stroke="white" strokeWidth="1.5" strokeOpacity={0.5} />
        <Line x1="162" y1="112" x2="140" y2="155" stroke="white" strokeWidth="1.5" strokeOpacity={0.5} />
        <Line x1="100" y1="155" x2="140" y2="155" stroke="white" strokeWidth="1.5" strokeOpacity={0.5} />
        <Line x1="120" y1="90" x2="100" y2="155" stroke="white" strokeWidth="1.5" strokeOpacity={0.4} />
        <Line x1="120" y1="90" x2="140" y2="155" stroke="white" strokeWidth="1.5" strokeOpacity={0.4} />

        {/* Person top center — largest */}
        <G transform="translate(120, 80)">
          <Circle cx="0" cy="-12" r="16" fill="url(#c_person1)" stroke="white" strokeWidth="2.5" />
          <Path d="M-20 15 Q-12 0 0 -4 Q12 0 20 15" fill="url(#c_person1)" stroke="white" strokeWidth="1" />
        </G>

        {/* Person left */}
        <G transform="translate(72, 105)">
          <Circle cx="0" cy="-10" r="14" fill="url(#c_person2)" stroke="white" strokeWidth="2" />
          <Path d="M-18 12 Q-10 0 0 -3 Q10 0 18 12" fill="url(#c_person2)" stroke="white" strokeWidth="1" />
        </G>

        {/* Person right */}
        <G transform="translate(168, 105)">
          <Circle cx="0" cy="-10" r="14" fill="url(#c_person2)" stroke="white" strokeWidth="2" />
          <Path d="M-18 12 Q-10 0 0 -3 Q10 0 18 12" fill="url(#c_person2)" stroke="white" strokeWidth="1" />
        </G>

        {/* Person bottom-left */}
        <G transform="translate(96, 152)">
          <Circle cx="0" cy="-10" r="13" fill="url(#c_person1)" stroke="white" strokeWidth="2" />
          <Path d="M-16 10 Q-9 -1 0 -3 Q9 -1 16 10" fill="url(#c_person1)" stroke="white" strokeWidth="1" />
        </G>

        {/* Person bottom-right */}
        <G transform="translate(144, 152)">
          <Circle cx="0" cy="-10" r="13" fill="url(#c_person1)" stroke="white" strokeWidth="2" />
          <Path d="M-16 10 Q-9 -1 0 -3 Q9 -1 16 10" fill="url(#c_person1)" stroke="white" strokeWidth="1" />
        </G>

        {/* Hearts scattered */}
        <Path d="M48 55 Q48 48 55 44 Q62 48 62 55 Q62 62 55 67 Q48 62 48 55Z" fill="#f472b6" />
        <Path d="M178 48 Q178 43 183 40 Q188 43 188 48 Q188 53 183 57 Q178 53 178 48Z" fill="#f472b6" fillOpacity={0.8} />
        <Path d="M112 200 Q112 195 117 192 Q122 195 122 200 Q122 205 117 208 Q112 205 112 200Z" fill="#f472b6" fillOpacity={0.7} />

        {/* Stars */}
        <Circle cx="35" cy="130" r="3" fill="white" />
        <Circle cx="205" cy="135" r="2.5" fill="white" />
        <Circle cx="120" cy="32" r="3" fill="white" />
        <Circle cx="30" cy="70" r="2" fill="#FFD700" />
        <Circle cx="210" cy="65" r="2" fill="#FFD700" />
      </Svg>
    </View>
  );
}
