import React, { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useApp } from "@/state/AppContext";
import { useAuth } from "@/state/AuthContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

// Sends people where they belong: signed-out visitors to the welcome screen,
// new members to onboarding, everyone else into the app. It also covers the
// screen with a spinner while the account's data is still loading.
export function RouteGate() {
  const { ready, mode, signOut } = useAuth();
  const { hydrated, onboarded, loadError, retryLoad } = useApp();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const segments = useSegments();
  const router = useRouter();
  const first = segments[0] as string | undefined;

  useEffect(() => {
    if (!ready) return;
    if (mode === "none") {
      if (first !== undefined && first !== "auth") router.replace("/");
      return;
    }
    if (!hydrated || loadError) return;
    if (!onboarded) {
      if (first !== "onboarding") router.replace("/onboarding");
    } else if (first === undefined || first === "auth" || first === "onboarding") {
      router.replace("/(tabs)");
    }
  }, [ready, mode, hydrated, onboarded, loadError, first, router]);

  const loading = !ready || (mode !== "none" && !hydrated);
  if (!loading && !loadError) return null;

  return (
    <View style={styles.cover}>
      {loadError ? (
        <>
          <Text style={styles.title}>Couldn't load your profile</Text>
          <Text style={styles.body}>{loadError}</Text>
          <Pressable onPress={retryLoad} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
          <Pressable onPress={signOut}>
            <Text style={styles.body}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator color={colors.accent} size="large" />
      )}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    cover: { ...StyleSheet.absoluteFillObject, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
    title: { color: c.text, fontFamily: font.bold, fontSize: 18 },
    body: { color: c.textSecondary, fontFamily: font.regular, textAlign: "center" },
    button: { backgroundColor: c.accent, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 999 },
    buttonText: { color: c.onAccent, fontFamily: font.semibold },
  });
