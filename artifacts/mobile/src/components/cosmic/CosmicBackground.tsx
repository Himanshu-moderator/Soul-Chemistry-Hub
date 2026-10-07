import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";

// The space backdrop, built as clear layers (back to front). The interface (text,
// buttons) is drawn above all of them:
//   1. a tinted night-sky gradient with soft nebula glows
//   2. 21 stars spread over the whole sky, plus a couple of shooting stars that
//      cross it diagonally, top to bottom, tail trailing behind
//   3. (welcome screen only) four planets, spaced apart; the two big ones spin
//      slowly on their own axis
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

// A bigger dot: it twinkles at random, resting dim for a few seconds, flaring with
// a soft glow, then settling again. Each star keeps its own random rhythm.
function BigStar({ spec, k }: { spec: StarSpec; k: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const next = () => {
      Animated.sequence([
        Animated.delay(1200 + Math.random() * 6500),
        Animated.timing(t, { toValue: 1, duration: 900 + Math.random() * 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 1400 + Math.random() * 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]).start(({ finished }) => finished && alive && next());
    };
    next();
    return () => {
      alive = false;
      t.stopAnimation();
    };
  }, [t]);

  const s = spec.size;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: `${spec.x}%`, top: `${spec.y}%`, width: 0, height: 0 }}>
      <Animated.View
        style={{
          position: "absolute",
          left: -s * 4,
          top: -s * 4,
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.15 * k, k] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.35] }) }],
        }}
      >
        <Glow color="#D8D2FF" alpha={0.55} size={s * 8} style={{ position: "relative" }} />
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          left: -s / 2,
          top: -s / 2,
          width: s,
          height: s,
          borderRadius: s,
          backgroundColor: "#FFFFFF",
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.5 * k, k] }),
        }}
      />
    </View>
  );
}

const Stars = memo(function Stars({ variant }: { variant: SkyVariant }) {
  const specs = useMemo(makeStars, []);
  // The smaller dots breathe gently on shared loops; the bigger ones twinkle on their own.
  const loops = [useBreath(4200, 0), useBreath(5600, 900), useBreath(6800, 1800), useBreath(8000, 2700)];
  const k = STAR_BRIGHTNESS[variant];

  return (
    <>
      {specs.map((s) => {
        if (s.glow) return <BigStar key={s.id} spec={s} k={k} />;
        const base = s.opacity * k;
        const opacity = loops[s.loop].interpolate({ inputRange: [0, 1], outputRange: [base * 0.35, base] });
        return (
          <Animated.View
            key={s.id}
            pointerEvents="none"
            style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, marginLeft: -s.size / 2, marginTop: -s.size / 2, borderRadius: s.size, backgroundColor: "#FFFFFF", opacity }}
          />
        );
      })}
    </>
  );
});

// A shooting star: a short bright streak that crosses the sky diagonally, top to
// bottom and a bit sideways (28 degrees off vertical, heading down-left). The head
// leads and the tail fades out behind it, above and to the right. Then it waits.
const FALL_ANGLE = 28;
const FALL_TAN = Math.tan((FALL_ANGLE * Math.PI) / 180);

function FallingStar({ left, delay, duration, brightness }: { left: string; delay: number; duration: number; brightness: number }) {
  const width = Math.min(Dimensions.get("window").width, 440);
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

  const dx = width * 0.55;
  const dy = dx / FALL_TAN;
  const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [0, -dx] });
  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
  const opacity = p.interpolate({ inputRange: [0, 0.1, 0.65, 1], outputRange: [0, brightness, brightness * 0.8, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", left: left as `${number}%`, top: "2%", opacity, transform: [{ translateX }, { translateY }, { rotate: `${90 + FALL_ANGLE}deg` }] }}
    >
      {/* the bright head is the right end, pointing down-left; the tail fades back up */}
      <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.4)", "#FFFFFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 96, height: 2, borderRadius: 2 }} />
    </Animated.View>
  );
}

// -------------------------------------------------------------- planets

const RING_TILT = "-16deg";

// A planet is a flat disc made to look like a sphere: its surface (bands and
// storms) lives on a strip that slides sideways behind a fixed soft shading, so
// sliding it slowly reads as the planet turning on its axis.
function Planet({
  x,
  y,
  size,
  colors,
  ring,
  spinSeconds,
  seed,
  opacity = 1,
}: {
  x: `${number}%`;
  y: `${number}%`;
  size: number;
  colors: [string, string];
  ring?: boolean;
  spinSeconds?: number;
  seed: number;
  opacity?: number;
}) {
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spinSeconds) return;
    const loop = Animated.loop(Animated.timing(turn, { toValue: 1, duration: spinSeconds * 1000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [turn, spinSeconds]);

  const surface = useMemo(() => {
    const rand = seeded(seed);
    const bands = Array.from({ length: 6 }, (_, i) => ({ y: ((i + 0.3 + rand() * 0.4) / 6) * size, h: size * (0.05 + rand() * 0.07), light: rand() > 0.5 }));
    const spots = Array.from({ length: 4 }, () => ({ x: rand() * size, y: size * (0.2 + rand() * 0.6), rx: size * (0.08 + rand() * 0.1), ry: size * (0.03 + rand() * 0.04) }));
    return { bands, spots };
  }, [seed, size]);

  const ringW = size * 2;
  const ringH = size * 0.7;
  const rx = size * 0.92;
  const ry = size * 0.2;
  const cx = ringW / 2;
  const cy = ringH / 2;
  const sw = Math.max(2, size * 0.045);
  // The ring is one ellipse drawn in two halves: the far half behind the planet, the near half in front.
  const arc = (front: boolean, r: number, q: number) => `M ${cx - r} ${cy} A ${r} ${q} 0 0 ${front ? 0 : 1} ${cx + r} ${cy}`;
  const ringHalf = (front: boolean) => (
    <View style={{ position: "absolute", left: -ringW / 2, top: -ringH / 2, width: ringW, height: ringH, transform: [{ rotate: RING_TILT }] }}>
      <Svg width={ringW} height={ringH}>
        <Path d={arc(front, rx, ry)} stroke="rgba(255,236,214,0.6)" strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Path d={arc(front, rx * 0.84, ry * 0.84)} stroke="rgba(255,236,214,0.28)" strokeWidth={sw * 0.5} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );

  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity }}>
      <Glow color={colors[0]} alpha={0.2} size={size * 2.1} style={{ left: -size * 1.05, top: -size * 1.05 }} />
      {ring && ringHalf(false)}
      <View style={{ position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
        <LinearGradient colors={colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size * 2,
            height: size,
            transform: [{ translateX: turn.interpolate({ inputRange: [0, 1], outputRange: [0, -size] }) }],
          }}
        >
          <Svg width={size * 2} height={size}>
            {[0, size].map((o) => (
              <React.Fragment key={o}>
                {surface.bands.map((b, i) => (
                  <Rect key={`b${i}`} x={o} y={b.y} width={size} height={b.h} fill={b.light ? "#FFFFFF" : "#1B1033"} opacity={b.light ? 0.16 : 0.14} />
                ))}
                {surface.spots.map((sp, i) => (
                  <Ellipse key={`s${i}`} cx={o + sp.x} cy={sp.y} rx={sp.rx} ry={sp.ry} fill="#FFFFFF" opacity={0.2} />
                ))}
              </React.Fragment>
            ))}
          </Svg>
        </Animated.View>
        {/* fixed shading: lit from the top left, darker towards the far edge */}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="sphere" cx="35%" cy="30%" r="80%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.22} />
              <Stop offset="0.5" stopColor="#000010" stopOpacity={0} />
              <Stop offset="1" stopColor="#000010" stopOpacity={0.7} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#sphere)" />
        </Svg>
      </View>
      {ring && ringHalf(true)}
    </View>
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
          {falling >= 1 && <FallingStar left="92%" delay={3500} duration={8000} brightness={k} />}
          {falling >= 2 && <FallingStar left="68%" delay={10000} duration={9000} brightness={k} />}
        </>
      )}

      {variant === "full" && (
        <>
          {/* Four planets, well apart. The big blue one and the ringed orange one spin slowly. */}
          <Planet x="-6%" y="64%" size={180} colors={["#38BDF8", "#4F46E5"]} spinSeconds={150} seed={7} opacity={0.75} />
          <Planet x="76%" y="15%" size={72} colors={["#FDC27A", "#F2711C"]} ring spinSeconds={110} seed={3} opacity={0.9} />
          <Planet x="14%" y="12%" size={30} colors={["#C4B5FD", "#7C3AED"]} seed={5} opacity={0.8} />
          <Planet x="90%" y="47%" size={24} colors={["#5EEAD4", "#0D9488"]} seed={9} opacity={0.8} />
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
