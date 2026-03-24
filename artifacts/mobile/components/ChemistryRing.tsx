import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "@/constants/colors";

type Props = {
  percent: number;
  size?: number;
  color?: string;
  label?: string;
};

export function ChemistryRing({ percent, size = 80, color = COLORS.accent, label }: Props) {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color + "25"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.percent, { color, fontSize: size * 0.22 }]}>{percent}%</Text>
        {label && <Text style={[styles.label, { fontSize: size * 0.12 }]}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
  },
  percent: {
    fontFamily: "Inter_700Bold",
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
});
