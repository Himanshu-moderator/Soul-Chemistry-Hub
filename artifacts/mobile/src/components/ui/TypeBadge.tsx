import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { font, radius } from "@/theme/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/themes";

interface Props {
  type: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: { px: 8, py: 3, fs: 11 }, md: { px: 10, py: 4, fs: 13 }, lg: { px: 14, py: 6, fs: 16 } };

// The personality type as a coloured pill (INTJ, ENFP, ...).
export function TypeBadge({ type, size = "md" }: Props) {
  const { colors } = useTheme();
  const tint = colors.mbti[type] ?? colors.accent;
  const s = SIZES[size];
  return (
    <View style={[styles.pill, { backgroundColor: withAlpha(tint, 0.16), paddingHorizontal: s.px, paddingVertical: s.py }]}>
      <Text style={{ color: tint, fontFamily: font.bold, fontSize: s.fs, letterSpacing: 0.4 }}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: radius.pill, alignSelf: "flex-start" },
});
