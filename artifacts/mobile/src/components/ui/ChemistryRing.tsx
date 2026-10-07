import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { font } from "@/theme/tokens";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  percent: number;
  size?: number;
  stroke?: number;
  label?: boolean;
}

// A progress ring in the theme gradient, with the percentage in the middle.
export function ChemistryRing({ percent, size = 56, stroke = 5, label = true }: Props) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accent} />
            <Stop offset="1" stopColor={colors.accentAlt} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circ * pct) / 100} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {label && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: size * 0.27 }}>{pct}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
