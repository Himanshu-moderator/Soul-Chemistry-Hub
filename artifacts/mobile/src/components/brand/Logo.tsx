import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { font } from "@/theme/tokens";

// The Pdb mark: a ringed planet with a spark, on a deep-space tile.
// The same shapes are used to export the app icon (see docs/branding.md).

interface MarkProps {
  size?: number;
  // Draw the dark rounded tile behind the planet (off for the splash screen).
  tile?: boolean;
}

export function LogoMark({ size = 96, tile = true }: MarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1A1442" />
          <Stop offset="1" stopColor="#070612" />
        </LinearGradient>
        <LinearGradient id="planet" x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#A78BFA" />
          <Stop offset="0.55" stopColor="#D946EF" />
          <Stop offset="1" stopColor="#F472B6" />
        </LinearGradient>
        <RadialGradient id="shine" cx="0.32" cy="0.28" r="0.7">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#67E8F9" />
          <Stop offset="1" stopColor="#A78BFA" />
        </LinearGradient>
      </Defs>

      {tile && <Rect x="2" y="2" width="116" height="116" rx="30" fill="url(#tile)" />}

      {/* ring, back half (behind the planet) */}
      <G transform="rotate(-22 60 62)">
        <Path d="M 14 62 A 46 13 0 0 1 106 62" stroke="url(#ring)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.55" />
      </G>

      {/* planet */}
      <Circle cx="60" cy="62" r="27" fill="url(#planet)" />
      <Circle cx="60" cy="62" r="27" fill="url(#shine)" />

      {/* ring, front half (in front of the planet) */}
      <G transform="rotate(-22 60 62)">
        <Path d="M 14 62 A 46 13 0 0 0 106 62" stroke="url(#ring)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      </G>

      {/* sparkle and a few stars */}
      <Path d="M 94 20 L 96.2 26.8 L 103 29 L 96.2 31.2 L 94 38 L 91.8 31.2 L 85 29 L 91.8 26.8 Z" fill="#FDE68A" />
      <Circle cx="24" cy="30" r="1.8" fill="#FFFFFF" opacity="0.85" />
      <Circle cx="38" cy="18" r="1.2" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="100" cy="92" r="1.5" fill="#FFFFFF" opacity="0.7" />
      <Ellipse cx="24" cy="96" rx="1.3" ry="1.3" fill="#C4B5FD" opacity="0.8" />
    </Svg>
  );
}

interface LogoProps {
  size?: number;
  // Show the "pdb" wordmark beside the mark.
  wordmark?: boolean;
  tile?: boolean;
}

export function Logo({ size = 40, wordmark = true, tile = true }: LogoProps) {
  return (
    <View style={styles.row}>
      <LogoMark size={size} tile={tile} />
      {wordmark && <Text style={[styles.word, { fontSize: size * 0.62 }]}>pdb</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  word: { color: "#F4F3FA", fontFamily: font.bold, letterSpacing: -1 },
});
