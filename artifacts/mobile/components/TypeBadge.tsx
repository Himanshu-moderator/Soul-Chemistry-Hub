import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  type: string;
  size?: "sm" | "md" | "lg";
  color?: string;
};

export function TypeBadge({ type, size = "md", color }: Props) {
  const bg = color || (COLORS.MBTI as Record<string, string>)[type] || COLORS.accent;
  const fontSize = size === "sm" ? 9 : size === "lg" ? 14 : 11;
  const px = size === "sm" ? 6 : size === "lg" ? 12 : 8;
  const py = size === "sm" ? 2 : size === "lg" ? 6 : 3;
  const br = size === "sm" ? 6 : size === "lg" ? 10 : 8;

  return (
    <View style={[styles.badge, { backgroundColor: bg + "25", borderColor: bg + "60", paddingHorizontal: px, paddingVertical: py, borderRadius: br }]}>
      <Text style={[styles.text, { color: bg, fontSize }]}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
