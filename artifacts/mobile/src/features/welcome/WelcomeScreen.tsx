import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui";
import { useAuth } from "@/state/AuthContext";
import { useStyles } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

// First screen for signed-out visitors: the logo over a living night sky, and
// three ways in (create an account, sign in, or just try the demo).
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { backendConfigured, startDemo } = useAuth();

  const enter = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 900, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [enter, float]);

  const goAuth = (mode: "signup" | "signin") => router.push({ pathname: "/auth", params: { mode } } as never);

  return (
    <CosmicBackground variant="full">
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View
          style={[
            styles.hero,
            { opacity: enter, transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }) }] },
          ]}
        >
          <LogoMark size={128} tile={false} />
          <Text style={styles.word}>pdb</Text>
          <Text style={styles.tagline}>Find your type.{"\n"}Find your people.</Text>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}>
          {backendConfigured ? (
            <>
              <Button label="Create account" onPress={() => goAuth("signup")} />
              <Button label="I already have an account" variant="secondary" onPress={() => goAuth("signin")} />
              <Button label="Try the demo" variant="ghost" icon="play-circle" onPress={startDemo} />
            </>
          ) : (
            <Button label="Try the demo" icon="play-circle" onPress={startDemo} />
          )}
          <Text style={styles.note}>
            {backendConfigured
              ? "The demo needs no account: sample people and chats, saved on this device."
              : "Sample people and chats, saved on this device. No account needed."}
          </Text>
        </Animated.View>
      </View>
    </CosmicBackground>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24 },
    hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
    word: { color: c.text, fontFamily: font.bold, fontSize: 56, letterSpacing: -2.5, marginTop: 6 },
    tagline: { color: c.textSecondary, fontFamily: font.medium, fontSize: 18, lineHeight: 26, textAlign: "center", marginTop: 4 },
    actions: { gap: 12 },
    note: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12.5, textAlign: "center", marginTop: 4, lineHeight: 18 },
  });
