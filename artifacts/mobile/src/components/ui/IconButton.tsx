import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  icon: keyof typeof Feather.glyphMap;
  label: string; // accessibility label
  onPress?: () => void;
  size?: number;
  // A small red dot for "something new".
  badge?: boolean;
}

// A round, quiet icon button for headers and toolbars.
export function IconButton({ icon, label, onPress, size = 40, badge }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface },
        pressed && { backgroundColor: colors.surfaceStrong },
      ]}
    >
      <Feather name={icon} size={size * 0.46} color={colors.text} />
      {badge && <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.bg }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 8, right: 9, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
});
