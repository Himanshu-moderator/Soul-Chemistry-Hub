import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { font, radius } from "@/theme/tokens";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

// A small pill for filters and choices.
export function Chip({ label, selected = false, onPress }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      style={styles.base}
    >
      {selected ? (
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inner}>
          <Text style={[styles.label, { color: colors.onAccent }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <Text style={[styles.inner, styles.plain, styles.label]}>{label}</Text>
      )}
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    base: { borderRadius: radius.pill, overflow: "hidden" },
    inner: { paddingVertical: 8, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
    plain: { backgroundColor: c.surface, color: c.textSecondary, overflow: "hidden", borderRadius: radius.pill },
    label: { fontFamily: font.semibold, fontSize: 13.5, color: c.textSecondary },
  });
