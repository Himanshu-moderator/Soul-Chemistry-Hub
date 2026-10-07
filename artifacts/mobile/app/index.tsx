import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const { width, height } = Dimensions.get("window");

function Star({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  const anim = useRef(new Animated.Value(opacity)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: opacity * 0.3, duration: 1500 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: opacity, duration: 1500 + Math.random() * 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#FFFFFF",
        opacity: anim,
      }}
    />
  );
}

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height * 0.7,
  size: Math.random() * 2.5 + 0.5,
  opacity: Math.random() * 0.7 + 0.2,
}));

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
    const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const orb1Scale = useRef(new Animated.Value(1)).current;
  const orb2Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 900, delay: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Scale, { toValue: 1.08, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Scale, { toValue: 1, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Scale, { toValue: 1.12, duration: 5500, useNativeDriver: true }),
        Animated.timing(orb2Scale, { toValue: 1, duration: 5500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const { backendConfigured, startDemo } = useAuth();

  const goAuth = (mode: "signup" | "signin") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/auth", params: { mode } } as never);
  };

  const tryDemo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await startDemo();
  };

  return (
    <View style={styles.container}>
      {/* Starfield */}
      {STARS.map((s) => (
        <Star key={s.id} x={s.x} y={s.y} size={s.size} opacity={s.opacity} />
      ))}

      {/* Glowing orb - top center (sun/moon) */}
      <Animated.View style={[styles.glowOrb, { transform: [{ scale: orb1Scale }] }]}>
        <View style={styles.glowOrbInner} />
        <View style={styles.glowOrbHalo} />
      </Animated.View>

      {/* Blue planet - left */}
      <Animated.View style={[styles.bluePlanet, { transform: [{ scale: orb2Scale }] }]}>
        <View style={styles.bluePlanetInner} />
      </Animated.View>

      {/* App icon */}
      <Animated.View style={[styles.appIconContainer, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        <View style={styles.appIcon}>
          <View style={styles.appIconBg} />
          <Text style={styles.appIconText}>Pdb</Text>
          <View style={styles.appIconMoon} />
        </View>
      </Animated.View>

      {/* Bottom section */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeIn, transform: [{ translateY: slideUp }], paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.tagline}>Find your type.{"\n"}Find your people.</Text>

        {backendConfigured && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => goAuth("signup")} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Create account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.googleBtn} onPress={() => goAuth("signin")} activeOpacity={0.85}>
              <Text style={styles.googleBtnText}>I already have an account</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={backendConfigured ? styles.demoLink : styles.primaryBtn}
          onPress={tryDemo}
          activeOpacity={0.85}
        >
          <Feather name="play-circle" size={backendConfigured ? 16 : 20} color={backendConfigured ? COLORS.accent : "#FFF"} />
          <Text style={backendConfigured ? styles.demoLinkText : styles.primaryBtnText}>Try the demo</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          {backendConfigured
            ? "The demo needs no account: sample people and chats, saved on this device."
            : "Sample people and chats, saved on this device. No account needed."}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080B12",
    alignItems: "center",
  },
  glowOrb: {
    position: "absolute",
    top: -40,
    left: "50%",
    marginLeft: -90,
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  glowOrbInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#D4C5A0",
    shadowColor: "#E8D89C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },
  glowOrbHalo: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(230,210,140,0.06)",
  },
  bluePlanet: {
    position: "absolute",
    top: height * 0.18,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
  },
  bluePlanetInner: {
    flex: 1,
    borderRadius: 80,
    backgroundColor: "#4A90D9",
    shadowColor: "#4A90D9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    opacity: 0.85,
  },
  appIconContainer: {
    position: "absolute",
    top: height * 0.28,
    alignItems: "center",
  },
  appIcon: {
    width: 110,
    height: 110,
    borderRadius: 26,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  appIconBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0D1018",
    borderRadius: 26,
  },
  appIconText: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    color: "#E8D8C0",
    letterSpacing: -1,
    zIndex: 1,
  },
  appIconMoon: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F0D890",
    zIndex: 2,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    gap: 14,
    alignItems: "center",
  },
  tagline: { color: "#E8E8F0", fontSize: 26, fontWeight: "700", textAlign: "center", lineHeight: 34, marginBottom: 20 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7C4DFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignSelf: "stretch",
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  demoLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  demoLinkText: { color: "#B39DFF", fontSize: 15, fontWeight: "600" },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  googleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#4285F4",
  },
  googleBtnText: {
    color: COLORS.textPrimary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  moreBtn: {
    paddingVertical: 8,
  },
  moreText: {
    color: COLORS.textSecondary,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  termsText: {
    color: COLORS.textTertiary,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.accentBlue,
    textDecorationLine: "underline",
  },
});
