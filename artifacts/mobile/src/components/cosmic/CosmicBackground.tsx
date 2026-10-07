import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";

// The space backdrop. It is meant to sit quietly BEHIND the interface: a tinted
// night-sky gradient, a few slowly twinkling stars, one or two stars drifting down,
// soft nebula glows and, on the welcome screen only, planets slowly orbiting.
//   full    welcome screen and splash: planets and a few more stars
//   starry  behind forms: a gentle starfield, no planets
//   subtle  behind the app screens: very faint stars, so text always reads cleanly
// Everything is slow on purpose, and decoration only: it never receives touches.

export type SkyVariant = "full" | "starry" | "subtle";

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
  phase: 0 | 1 | 2; // which shared twinkle loop drives it
  twinkle: boolean;
}

const STAR_COUNT: Record<SkyVariant, number> = { full: 22, starry: 14, subtle: 9 };
const FALLING_COUNT: Record<SkyVariant, number> = { full: 3, starry: 2, subtle: 1 };
// How bright stars are, relative to full. Faint on app screens.
const STAR_BRIGHTNESS: Record<SkyVariant, number> = { full: 0.75, starry: 0.5, subtle: 0.32 };

function makeStars(count: number, seed: number): StarSpec[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rand() * 100,
    y: rand() * 100,
    size: 1 + rand() * 1.3,
    opacity: 0.4 + rand() * 0.5,
    phase: (id % 3) as 0 | 1 | 2,
    twinkle: id % 2 === 0, // the rest just shine steadily
  }));
}

// One value that eases 0 -> 1 -> 0 forever. Three of these drive every twinkling
// star, instead of one animation per star.
function useBreath(duration: number, delay = 0, enabled = true) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration, delay, enabled]);
  return value;
}

const Stars = memo(function Stars({ variant }: { variant: SkyVariant }) {
  const specs = useMemo(() => makeStars(STAR_COUNT[variant], 7), [variant]);
  const moving = variant !== "subtle";
  // Slow: each star takes 4 to 7 seconds to brighten and fade.
  const loops = [useBreath(4200, 0, moving), useBreath(5600, 900, moving), useBreath(7000, 1800, moving)];
  const k = STAR_BRIGHTNESS[variant];

  return (
    <>
      {specs.map((s) => {
        const base = s.opacity * k;
        const opacity = moving && s.twinkle ? loops[s.phase].interpolate({ inputRange: [0, 1], outputRange: [base * 0.2, base] }) : base;
        return (
          <Animated.View
            key={s.id}
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
            }}
          />
        );
      })}
    </>
  );
});

// A star that slowly slides down the sky and fades, then waits and starts again.
function FallingStar({ left, delay, duration, brightness }: { left: string; delay: number; duration: number; brightness: number }) {
  const { height } = Dimensions.get("window");
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(p, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(duration * 0.8),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [p, delay, duration]);
  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.55] });
  const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.16] });
  const opacity = p.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, brightness, brightness * 0.6, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", left: left as `${number}%`, top: "4%", opacity, transform: [{ translateX }, { translateY }, { rotate: "-71deg" }] }}
    >
      <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.9)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 46, height: 1.5, borderRadius: 2 }} />
    </Animated.View>
  );
}

// A shaded planet (optionally ringed). Light always comes from the top left.
function Planet({ size, colors, ring }: { size: number; colors: [string, string]; ring?: boolean }) {
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
        <LinearGradient colors={colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
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
    </View>
  );
}

interface OrbitProps {
  // Where the orbit is centred (pixels or percent of the sky).
  x: number | `${number}%`;
  y: number | `${number}%`;
  radius: number;
  // Seconds for one full revolution.
  seconds: number;
  size: number;
  opacity?: number;
  // Planets can carry their own satellites.
  children?: React.ReactNode;
  planet: React.ReactNode;
}

// Moves a planet slowly round a point. The planet is turned back against the
// rotation so its shading doesn't spin with it.
function Orbit({ x, y, radius, seconds, size, opacity = 0.8, planet, children }: OrbitProps) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: seconds * 1000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [t, seconds]);
  const around = t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const back = t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });

  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity, transform: [{ rotate: around }] }}>
      <Animated.View style={{ position: "absolute", left: radius - size / 2, top: -size / 2, transform: [{ rotate: back }] }}>
        {planet}
        {children}
      </Animated.View>
    </Animated.View>
  );
}

// A circle of colour that fades smoothly to nothing at its edge.
const Glow = memo(function Glow({ color, alpha, size, style }: { color: string; alpha: number; size: number; style: object }) {
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
});

interface Props {
  variant?: SkyVariant;
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
  const lively = variant !== "subtle";
  const falling = FALLING_COUNT[variant];
  const k = STAR_BRIGHTNESS[variant];

  return (
    <View style={styles.root}>
      <LinearGradient colors={sky ?? [colors.bgTop, colors.bgBottom]} style={StyleSheet.absoluteFill} />

      <Glow color={glow ?? colors.accent} alpha={lively ? 0.3 : 0.14} size={460} style={{ top: -210, right: -200 }} />
      <Glow color={glow ?? colors.accentAlt} alpha={lively ? 0.22 : 0.09} size={520} style={{ bottom: -240, left: -220 }} />

      {!noStars && (
        <>
          <Stars variant={variant} />
          {falling >= 1 && <FallingStar left="72%" delay={3000} duration={9000} brightness={k} />}
          {falling >= 2 && <FallingStar left="38%" delay={9500} duration={11000} brightness={k} />}
          {falling >= 3 && <FallingStar left="90%" delay={15000} duration={10000} brightness={k} />}
        </>
      )}

      {variant === "full" && (
        <>
          {/* the big blue planet circles slowly just off the left edge */}
          <Orbit x="-6%" y="50%" radius={26} seconds={160} size={190} opacity={0.7} planet={<Planet size={190} colors={["#38BDF8", "#4F46E5"]} />} />
          {/* the ringed planet, with a small moon going round it */}
          <Orbit
            x="80%"
            y="15%"
            radius={14}
            seconds={110}
            size={74}
            opacity={0.8}
            planet={<Planet size={74} colors={["#FDBA74", "#F472B6"]} ring />}
          />
          <Orbit x="80%" y="15%" radius={64} seconds={46} size={26} opacity={0.75} planet={<Planet size={26} colors={["#E2E8F0", "#94A3B8"]} />} />
        </>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // `clip` (unlike `hidden`) can never be scrolled by the browser, which stops the
  // page from drifting sideways when a decoration extends past the edge.
  root: { flex: 1, overflow: "clip" as unknown as "hidden", backgroundColor: "#06050F" },
});
