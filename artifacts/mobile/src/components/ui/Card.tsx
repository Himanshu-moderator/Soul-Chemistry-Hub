import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { radius } from "@/theme/tokens";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  // Tint the card with the theme's accent gradient instead of a plain surface.
  tinted?: boolean;
}

// A soft, borderless surface. Use sparingly: whitespace does most of the grouping.
export function Card({ children, style, padding = 16, tinted = false }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  if (tinted) {
    return (
      <View style={[styles.card, { padding: 0 }, style]}>
        <LinearGradient
          colors={[colors.accent + "40", colors.accentAlt + "26"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
        />
        <View style={{ padding }}>{children}</View>
      </View>
    );
  }
  return <View style={[styles.card, { padding }, style]}>{children}</View>;
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: c.border },
  });
