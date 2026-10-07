import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { font } from "@/theme/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/themes";

interface Props {
  name: string;
  size?: number;
  // The person's type; tints the ring and the initials.
  mbti?: string | null;
  online?: boolean;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

// Initials in a gradient ring coloured by the person's type.
export function Avatar({ name, size = 44, mbti, online }: Props) {
  const { colors } = useTheme();
  const tint = (mbti && colors.mbti[mbti]) || colors.accent;
  const ring = Math.max(2, Math.round(size / 22));

  return (
    <View style={{ width: size, height: size }}>
      <LinearGradient
        colors={[tint, withAlpha(tint, 0.25)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ring, { borderRadius: size / 2, padding: ring }]}
      >
        <View style={[styles.inner, { borderRadius: size / 2, backgroundColor: colors.surfaceSolid }]}>
          <Text style={{ color: tint, fontFamily: font.bold, fontSize: size * 0.34 }}>{initials(name)}</Text>
        </View>
      </LinearGradient>
      {online && (
        <View
          style={[
            styles.dot,
            { width: size * 0.26, height: size * 0.26, borderRadius: size, backgroundColor: colors.success, borderColor: colors.surfaceSolid },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { flex: 1 },
  inner: { flex: 1, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: 0, bottom: 0, borderWidth: 2 },
});
