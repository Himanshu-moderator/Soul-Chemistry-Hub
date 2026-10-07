import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { font, radius } from "@/theme/tokens";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";

// The coin balance as a small gold pill.
export function CoinPill({ amount }: { amount: number }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.pill}>
      <Ionicons name="heart" size={13} color={colors.gold} />
      <Text style={styles.text}>{amount.toLocaleString()}</Text>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(251,191,36,0.14)",
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: radius.pill,
    },
    text: { color: c.gold, fontFamily: font.bold, fontSize: 13.5 },
  });
