import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export function SectionHeader({ title, action, onAction, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 17 },
  action: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
