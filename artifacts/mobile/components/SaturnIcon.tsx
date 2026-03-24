import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Ellipse, Circle } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
  ringColor?: string;
};

export function SaturnIcon({ size = 28, color = "#C0A060", ringColor = "#C0A060" }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.26;
  const ringW = size * 0.88;
  const ringH = size * 0.28;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Back half of ring (behind planet) */}
      <Ellipse
        cx={cx}
        cy={cy + size * 0.03}
        rx={ringW / 2}
        ry={ringH / 2}
        stroke={ringColor}
        strokeWidth={size * 0.065}
        fill="none"
        opacity={0.45}
        strokeDasharray={`${ringW * Math.PI * 0.5} ${ringW * Math.PI * 0.5}`}
        strokeDashoffset={0}
      />
      {/* Planet body */}
      <Circle cx={cx} cy={cy} r={r} fill={color} opacity={0.9} />
      {/* Front half of ring (over planet) */}
      <Ellipse
        cx={cx}
        cy={cy + size * 0.03}
        rx={ringW / 2}
        ry={ringH / 2}
        stroke={ringColor}
        strokeWidth={size * 0.065}
        fill="none"
        opacity={0.95}
        strokeDasharray={`${ringW * Math.PI * 0.5} ${ringW * Math.PI * 0.5}`}
        strokeDashoffset={ringW * Math.PI * 0.5}
      />
    </Svg>
  );
}
