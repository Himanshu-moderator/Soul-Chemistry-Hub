import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";

// The space backdrop. It sits quietly BEHIND the interface:
//   - a tinted night-sky gradient and soft nebula glows
//   - 21 stars spread across the whole sky: tiny dots, bigger dots, and a few
//     that twinkle and glow
//   - a couple of stars slowly falling diagonally, with their tail trailing behind
//   - on the welcome screen only: planets slowly orbiting (and a moon)
// Everything is slow on purpose and is decoration only (it never takes touches).
//   full    welcome screen and splash
//   starry  behind forms: same stars, no planets
//   subtle  behind the app screens: same sky, stars dimmed so text stays clean

export type SkyVariant = "full" | "starry" | "subtle";

// Small seeded generator so the sky looks the same on every render.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------- stars

const COLS = 3;
const ROWS = 7; // 3 x 7 = 21 stars

interface StarSpec {
  id: number;
  x: number; // percent
  y: number; // percent
  size: number;
  opacity: number;
  glow: boolean;
  loop: 0 | 1 | 2 | 3; // which shared twinkle loop drives it
}

// One star per cell of a 3x7 grid, nudged randomly inside its cell, so the stars
// are spread evenly over the whole background instead of clumping.
function makeStars(): StarSpec[] {
  const rand = seeded(11);
  const out: StarSpec[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const id = row * COLS + col;
      const kind = id % 3; // 0 tiny dot, 1 dot, 2 bigger glowing dot
      out.push({
        id,
        x: ((col + 0.15 + rand() * 0.7) / COLS) * 100,
        y: ((row + 0.15 + rand() * 0.7) / ROWS) * 100,
        size: kind === 0 ? 1.3 : kind === 1 ? 2 : 3.2,
        opacity: kind === 0 ? 0.6 : kind === 1 ? 0.75 : 0.95,
        glow: kind === 2,
        loop: (id % 4) as 0 | 1 | 2 | 3,
      });
    }
  }
  return out;
}

const STAR_BRIGHTNESS: Record<SkyVariant, number> = { full: 0.95, starry: 0.8, subtle: 0.6 };
const FALLING_COUNT: Record<SkyVariant, number> = { full: 2, starry: 2, subtle: 1 };

// One value that eases 0 -> 1 -> 0 forever. Four of these drive every star.
function useBreath(duration: number, delay: number) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration, delay]);
  return value;
}

const Stars = memo(function Stars({ variant }: { variant: SkyVariant }) {
  const specs = useMemo(makeStars, []);
  // Slow: a star takes 4 to 8 seconds to brighten and fade.
  const loops = [useBreath(4200, 0), useBreath(5600, 900), useBreath(6800, 1800), useBreath(8000, 2700)];
  const k = STAR_BRIGHTNESS[variant];

  return (
    <>
      {specs.map((s) => {
        const t = loops[s.loop];
        const base = s.opacity * k;
        const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [base * 0.3, base] });
        return (
          <View key={s.id} pointerEvents="none" style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 0, height: 0 }}>
            {s.glow && (
              // soft halo that swells and fades with the star
              <Animated.View
                style={{
                  position: "absolute",
                  left: -s.size * 4,
                  top: -s.size * 4,
                  opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0, k] }),
                  transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.3] }) }],
                }}
              >
                <Glow color="#D8D2FF" alpha={0.55} size={s.size * 8} style={{ position: "relative" }} />
              </Animated.View>
            )}
            <Animated.View
              style={{
                position: "absolute",
                left: -s.size / 2,
                top: -s.size / 2,
                width: s.size,
                height: s.size,
                borderRadius: s.size,
                backgroundColor: "#FFFFFF",
                opacity,
              }}
            />
          </View>
        );
      })}
    </>
  );
});

// A star that slowly slides down and a little to the left, tail trailing up behind
// it, then waits and starts again.
function FallingStar({ left, delay, duration, brightness }: { left: string; delay: number; duration: number; brightness: number }) {
  const { height } = Dimensions.get("window");
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(p, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(duration),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [p, delay, duration]);

  const travel = height * 0.5;
  // Direction of travel: mostly down, a little left (about 25 degrees off vertical).
  const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [0, -travel * 0.42] });
  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [0, travel * 0.9] });
  const opacity = p.interpolate({ inputRange: [0, 0.12, 0.7, 1], outputRange: [0, brightness, brightness * 0.7, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", left: left as `${number}%`, top: "3%", opacity, transform: [{ translateX }, { translateY }, { rotate: "115deg" }] }}
    >
      {/* the bright head is at the right end, which points down-left; the tail fades back up */}
      <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.35)", "#FFFFFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 54, height: 2, borderRadius: 2 }} />
    </Animated.View>
  );
}

// -------------------------------------------------------------- planets

// A shaded planet (optionally ringed), centred on (0, 0) of its parent.
function Planet({ size, colors, ring }: { size: number; colors: [string, string]; ring?: boolean }) {
  return (
    <View style={{ position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size }}>
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
  // Where the orbit is centred: the screen (pixels or percent), or, when nested,
  // relative to the parent body.
  x: number | `${number}%`;
  y: number | `${number}%`;
  radius: number;
  // Seconds for one full revolution (keep it long: this should barely seem to move).
  seconds: number;
  opacity?: number;
  // What travels around: its own centre sits on the orbit path. A body can carry
  // another <Orbit> inside it, e.g. a moon, which then follows it around.
  children: React.ReactNode;
}

// Carries its children slowly round a circle. The children are turned back
// against the rotation so they stay upright and their shading doesn't spin.
function Orbit({ x, y, radius, seconds, opacity = 1, children }: OrbitProps) {
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
      <Animated.View style={{ position: "absolute", left: radius, top: 0, width: 0, height: 0, transform: [{ rotate: back }] }}>{children}</Animated.View>
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

      <Glow color={glow ?? colors.accent} alpha={lively ? 0.28 : 0.13} size={460} style={{ top: -210, right: -200 }} />
      <Glow color={glow ?? colors.accentAlt} alpha={lively ? 0.2 : 0.08} size={520} style={{ bottom: -240, left: -220 }} />

      {!noStars && (
        <>
          <Stars variant={variant} />
          {falling >= 1 && <FallingStar left="78%" delay={3500} duration={9000} brightness={k} />}
          {falling >= 2 && <FallingStar left="46%" delay={11000} duration={10000} brightness={k} />}
        </>
      )}

      {variant === "full" && (
        <>
          {/* The big blue planet drifts round a point just off the left edge: one lap in 5 minutes. */}
          <Orbit x="-4%" y="52%" radius={34} seconds={300} opacity={0.7}>
            <Planet size={190} colors={["#38BDF8", "#4F46E5"]} />
          </Orbit>

          {/* The ringed planet circles a point near the top right (4 minutes a lap); its moon goes round it (1.5 minutes). */}
          <Orbit x="72%" y="17%" radius={34} seconds={240} opacity={0.8}>
            <Planet size={72} colors={["#FDBA74", "#F472B6"]} ring />
            <Orbit x={0} y={0} radius={62} seconds={90}>
              <Planet size={22} colors={["#E2E8F0", "#94A3B8"]} />
            </Orbit>
          </Orbit>
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
