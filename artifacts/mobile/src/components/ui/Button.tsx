import React from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { font, radius } from "@/theme/tokens";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  size?: "md" | "sm";
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = "primary", icon, loading, disabled, size = "md", style }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const small = size === "sm";
  const inactive = disabled || loading;

  const content = (
    <View style={[styles.row, small && styles.rowSmall]}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onAccent : colors.text} />
      ) : (
        <>
          {icon && <Feather name={icon} size={small ? 15 : 18} color={variant === "primary" ? colors.onAccent : colors.text} />}
          <Text style={[styles.label, small && styles.labelSmall, variant === "primary" && { color: colors.onAccent }]}>{label}</Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={inactive}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [styles.base, inactive && { opacity: 0.55 }, pressed && { transform: [{ scale: 0.98 }] }, style]}
    >
      {variant === "primary" ? (
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.fill, variant === "secondary" ? styles.secondary : styles.ghost]}>{content}</View>
      )}
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    base: { borderRadius: radius.pill, overflow: "hidden", alignSelf: "stretch" },
    fill: { borderRadius: radius.pill },
    secondary: { backgroundColor: c.surfaceStrong },
    ghost: { backgroundColor: "transparent" },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, paddingHorizontal: 22 },
    rowSmall: { paddingVertical: 10, paddingHorizontal: 16 },
    label: { color: c.text, fontFamily: font.semibold, fontSize: 16 },
    labelSmall: { fontSize: 14 },
  });
