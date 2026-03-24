import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  type: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  style?: "pill" | "plain";
};

export function TypeBadge({ type, size = "md", color, style: variant = "pill" }: Props) {
  const col = color || COLORS.typeColor;
  const fontSize = size === "sm" ? 10 : size === "lg" ? 15 : 12;
  const px = size === "sm" ? 7 : size === "lg" ? 14 : 9;
  const py = size === "sm" ? 2 : size === "lg" ? 6 : 3;
  const br = size === "sm" ? 6 : size === "lg" ? 10 : 8;

  if (variant === "plain") {
    return <Text style={[styles.plainText, { color: col, fontSize }]}>{type}</Text>;
  }

  return (
    <View style={[styles.badge, { backgroundColor: col + "18", borderColor: col + "45", paddingHorizontal: px, paddingVertical: py, borderRadius: br }]}>
      <Text style={[styles.text, { color: col, fontSize }]}>{type}</Text>
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
    letterSpacing: 0.4,
  },
  plainText: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.4,
  },
});
