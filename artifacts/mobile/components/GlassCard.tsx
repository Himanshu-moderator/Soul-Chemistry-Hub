import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
};

export function GlassCard({ children, style, padding = 16 }: Props) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
});
