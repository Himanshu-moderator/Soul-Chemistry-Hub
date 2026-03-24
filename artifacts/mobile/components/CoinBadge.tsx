import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

type Props = { amount: number; size?: "sm" | "md" };

export function CoinBadge({ amount, size = "md" }: Props) {
  const iconSize = size === "sm" ? 13 : 16;
  const fontSize = size === "sm" ? 12 : 15;
  return (
    <View style={styles.container}>
      <Ionicons name="logo-bitcoin" size={iconSize} color={COLORS.accentGold} />
      <Text style={[styles.text, { fontSize }]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 4 },
  text: { color: COLORS.accentGold, fontFamily: "Inter_700Bold" },
});
