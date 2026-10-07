import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { LogoTile } from "@/components/brand/Logo";
import { IS_WEB, keyframes, timing } from "@/components/cosmic/motion";
import { font } from "@/theme/tokens";

interface Props {
  // Called as the intro starts fading out (the real sky can start up behind it).
  onFadeStart?: () => void;
  // Called once the intro has finished fading out.
  onDone: () => void;
  // Keep the splash up at least this long (ms), e.g. while data loads.
  minMs?: number;
}

// The animated launch screen. Every star and planet drifts in from beyond the
// edges and settles into place while fading in; the logo and tagline fade up as
// they arrive. The final frame matches the welcome screen, so the hand-off is a
// plain cross-fade.
const FADE_OUT_MS = 500;

// On the web the entrance is made of CSS animations (see motion.ts); phones use Animated.
const webFx = IS_WEB
  ? {
      overlayOut: keyframes({ "0%": { opacity: 1 }, "100%": { opacity: 0 } }, { iterations: 1, fill: "both" }),
      logoIn: keyframes(
        { "0%": { opacity: 0, transform: "scale(0.86)" }, "100%": { opacity: 1, transform: "scale(1)" } },
        { iterations: 1, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)", fill: "backwards" }
      ),
      tagIn: keyframes({ "0%": { opacity: 0 }, "100%": { opacity: 1 } }, { iterations: 1, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)", fill: "backwards" }),
    }
  : null;

export function SplashOverlay({ onFadeStart, onDone, minMs = 3200 }: Props) {
  const fade = useRef(new Animated.Value(1)).current;
  const logo = useRef(new Animated.Value(0)).current;
  const tag = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (IS_WEB) {
      const start = setTimeout(() => onFadeStart?.(), minMs);
      const done = setTimeout(onDone, minMs + FADE_OUT_MS);
      return () => {
        clearTimeout(start);
        clearTimeout(done);
      };
    }
    Animated.parallel([
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(logo, { toValue: 1, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(tag, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      onFadeStart?.();
      Animated.timing(fade, { toValue: 0, duration: 500, useNativeDriver: true }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, minMs);
    return () => clearTimeout(timer);
  }, [fade, logo, minMs, onDone, onFadeStart, tag]);

  if (webFx) {
    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 100 }, webFx.overlayOut, timing(FADE_OUT_MS, minMs)]} pointerEvents="auto">
        <CosmicBackground variant="full" gather>
          <View style={styles.center}>
            <View style={[webFx.logoIn, timing(1500, 500)]}>
              <LogoTile size={116} />
            </View>
            <View style={[webFx.tagIn, timing(1000, 1500)]}>
              <Text style={styles.tag}>Find your type.{"\n"}Find your people.</Text>
            </View>
          </View>
        </CosmicBackground>
      </View>
    );
  }

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade, zIndex: 100 }]} pointerEvents="auto">
      <CosmicBackground variant="full" gather>
        <View style={styles.center}>
          <Animated.View style={{ opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }] }}>
            <LogoTile size={116} />
          </Animated.View>
          <Animated.Text style={[styles.tag, { opacity: tag }]}>Find your type.{"\n"}Find your people.</Animated.Text>
        </View>
      </CosmicBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // The bottom padding leaves room for the welcome screen's buttons, so the logo
  // lands exactly where the welcome screen puts it.
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 250 },
  tag: { color: "rgba(244,243,250,0.62)", fontFamily: font.medium, fontSize: 18, lineHeight: 26, textAlign: "center", marginTop: 22 },
});
