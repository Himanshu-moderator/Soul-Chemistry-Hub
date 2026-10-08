import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  onPass: () => void;
  onMessage: () => void;
  onLike: () => void;
  disabled?: boolean;
}

// The three floating buttons: pass (X), message (chat), like (heart). They stay put
// while the profile scrolls underneath, just above the tab bar.
export function ActionDock({ onPass, onMessage, onLike, disabled }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const tap = (fn: () => void) => () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
  };

  return (
    <View pointerEvents="box-none" style={[styles.dock, { bottom: Math.max(insets.bottom, 12) + 64 + 16 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Pass" onPress={tap(onPass)} style={[styles.btn, styles.small, { backgroundColor: "#4B4A5E" }]}>
        <Feather name="x" size={26} color="#FFFFFF" />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Send a message" onPress={tap(onMessage)} style={[styles.btn, styles.small, { backgroundColor: "#E7B341" }]}>
        <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Like" onPress={tap(onLike)} style={[styles.btn, styles.big]}>
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.big]} />
        <Ionicons name="heart" size={30} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { position: "absolute", left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 22 },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  small: { width: 56, height: 56, borderRadius: 28 },
  big: { width: 68, height: 68, borderRadius: 34 },
});
