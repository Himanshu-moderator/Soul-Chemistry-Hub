import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { LogoMark } from "@/components/brand/Logo";
import { font } from "@/theme/tokens";

interface Props {
  // Called once the intro has finished fading out.
  onDone: () => void;
  // Keep the splash up at least this long (ms), e.g. while data loads.
  minMs?: number;
}

// The animated launch screen: the logo blooms out of a star field, the name
// slides in, then everything fades into the app.
export function SplashOverlay({ onDone, minMs = 2300 }: Props) {
  const fade = useRef(new Animated.Value(1)).current;
  const logo = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const tag = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logo, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      Animated.loop(Animated.timing(halo, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true })),
      Animated.sequence([
        Animated.delay(550),
        Animated.timing(word, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(tag, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: true }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, minMs);
    return () => clearTimeout(timer);
  }, [fade, halo, logo, minMs, onDone, tag, word]);

  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2.1] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade, zIndex: 100 }]} pointerEvents="auto">
      <CosmicBackground variant="full">
        <View style={styles.center}>
          <View style={styles.markWrap}>
            <Animated.View style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]} />
            <Animated.View style={{ opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) }] }}>
              <LogoMark size={132} tile={false} />
            </Animated.View>
          </View>
          <Animated.Text
            style={[
              styles.word,
              { opacity: word, transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
            ]}
          >
            pdb
          </Animated.Text>
          <Animated.Text style={[styles.tag, { opacity: tag }]}>Find your type. Find your people.</Animated.Text>
        </View>
      </CosmicBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  markWrap: { width: 132, height: 132, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  halo: { position: "absolute", width: 132, height: 132, borderRadius: 66, borderWidth: 2, borderColor: "#A78BFA" },
  word: { color: "#F4F3FA", fontFamily: font.bold, fontSize: 48, letterSpacing: -2 },
  tag: { color: "rgba(244,243,250,0.6)", fontFamily: font.regular, fontSize: 14, letterSpacing: 0.4 },
});
