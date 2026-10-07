import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";

// The space backdrop: a tinted night-sky gradient, twinkling and drifting stars,
// floating planets and the odd shooting star. `full` is for the welcome and splash
// screens; `starry` is the same sky without planets (behind forms); `subtle` is a
// calmer starfield for the app screens.

type Variant = "full" | "starry" | "subtle";

// Small seeded generator so the sky looks the same on every render.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface StarSpec {
  id: number;
  x: number; // percent
  y: number; // percent
  size: number;
  opacity: number;
  twinkle: number; // ms
  delay: number;
  drift: number; // px, 0 = none
}

function makeStars(count: number, seed: number): StarSpec[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rand() * 100,
    y: rand() * 100,
    size: 1 + rand() * 1.8,
    opacity: 0.35 + rand() * 0.6,
    twinkle: 1400 + rand() * 2600,
    delay: rand() * 2500,
    drift: rand() < 0.3 ? 6 + rand() * 12 : 0,
  }));
}

// One value that eases back and forth forever.
function useLoop(duration: number, delay = 0, native = true) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration, delay, native]);
  return value;
}

const Star = memo(function Star({ s, animated }: { s: StarSpec; animated: boolean }) {
  const t = useLoop(s.twinkle, s.delay);
  const opacity = animated ? t.interpolate({ inputRange: [0, 1], outputRange: [s.opacity * 0.25, s.opacity] }) : s.opacity;
  const translateX = animated && s.drift ? t.interpolate({ inputRange: [0, 1], outputRange: [-s.drift, s.drift] }) : 0;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: `${s.x}%`,
        top: `${s.y}%`,
        width: s.size,
        height: s.size,
        borderRadius: s.size,
        backgroundColor: "#FFFFFF",
        opacity,
        transform: [{ translateX }],
      }}
    />
  );
});

interface PlanetProps {
  size: number;
  colors: [string, string];
  style: object;
  ring?: boolean;
  floatPx?: number;
  floatMs?: number;
}

// A shaded, softly floating planet (optionally ringed).
function Planet({ size, colors, style, ring, floatPx = 10, floatMs = 6500 }: PlanetProps) {
  const t = useLoop(floatMs);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-floatPx, floatPx] });
  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", width: size, height: size, transform: [{ translateY }] }, style]}>
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
        <LinearGradient colors={colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
        {/* terminator: dark side of the planet */}
        <LinearGradient
          colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0)", "rgba(0,0,12,0.6)"]}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.9, y: 0.95 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {ring && (
        <View
          style={{
            position: "absolute",
            left: -size * 0.32,
            top: size * 0.36,
            width: size * 1.64,
            height: size * 0.28,
            borderRadius: size,
            borderWidth: Math.max(2, size * 0.035),
            borderColor: "rgba(255,255,255,0.4)",
            transform: [{ rotate: "-18deg" }],
          }}
        />
      )}
    </Animated.View>
  );
}

// A streak of light across the corner of the sky every few seconds.
function ShootingStar() {
  const { width, height } = Dimensions.get("window");
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(4200),
        Animated.timing(p, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(5200),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [p]);
  const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [width * 0.15, -width * 0.35] });
  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [height * 0.08, height * 0.3] });
  const opacity = p.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 0.8, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", right: 0, top: 0, opacity, transform: [{ translateX }, { translateY }, { rotate: "-32deg" }] }}
    >
      <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.95)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 110, height: 2, borderRadius: 2 }} />
    </Animated.View>
  );
}

interface Props {
  variant?: Variant;
  // Override the sky colours (used by chat themes). Defaults to the app theme.
  sky?: [string, string];
  // Glow colour for the override above.
  glow?: string;
  // Turn the stars off entirely.
  noStars?: boolean;
  children?: React.ReactNode;
}

export function CosmicBackground({ variant = "subtle", sky, glow, noStars, children }: Props) {
  const { colors } = useTheme();
  const full = variant === "full";
  const lively = variant !== "subtle";
  const stars = useMemo(() => makeStars(lively ? 70 : 26, lively ? 7 : 11), [lively]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={sky ?? [colors.bgTop, colors.bgBottom]} style={StyleSheet.absoluteFill} />

      {/* soft nebula glows in the theme's colours */}
      <Glow color={glow ?? colors.accent} alpha={lively ? 0.5 : 0.28} size={460} style={{ top: -200, right: -190 }} />
      <Glow color={glow ?? colors.accentAlt} alpha={lively ? 0.4 : 0.2} size={520} style={{ bottom: -230, left: -210 }} />

      {!noStars && stars.map((s) => <Star key={s.id} s={s} animated={lively || s.id % 3 === 0} />)}

      {full && (
        <>
          <Planet size={190} colors={["#38BDF8", "#4F46E5"]} floatPx={9} floatMs={7600} style={{ left: -105, top: "40%" }} />
          <Planet size={74} colors={["#FDBA74", "#F472B6"]} ring floatPx={7} floatMs={5400} style={{ right: 22, top: "13%" }} />
          <Planet size={30} colors={["#E2E8F0", "#94A3B8"]} floatPx={5} floatMs={4600} style={{ right: "30%", top: "27%" }} />
          <ShootingStar />
        </>
      )}

      {children}
    </View>
  );
}

// A circle of colour that fades smoothly to nothing at its edge.
function Glow({ color, alpha, size, style }: { color: string; alpha: number; size: number; style: object }) {
  return (
    <View pointerEvents="none" style={[{ position: "absolute", width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="g" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={alpha} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#g)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // `clip` (unlike `hidden`) can never be scrolled by the browser, which stops the
  // page from drifting sideways when a decoration extends past the edge.
  root: { flex: 1, overflow: "clip" as unknown as "hidden", backgroundColor: "#06050F" },
});
