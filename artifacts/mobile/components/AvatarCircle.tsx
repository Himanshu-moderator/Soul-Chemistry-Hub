import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

const AVATAR_COLORS = [
  "#7C4DFF", "#00B4D8", "#FF3B6B", "#FFB800", "#00C896",
  "#FFA726", "#29B6F6", "#EC407A", "#26A69A", "#AB47BC",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type Props = {
  name: string;
  size?: number;
  isOnline?: boolean;
  style?: ViewStyle;
  mbti?: string;
};

export function AvatarCircle({ name, size = 44, isOnline, style, mbti }: Props) {
  const color = mbti ? ((COLORS.MBTI as Record<string, string>)[mbti] || getColor(name)) : getColor(name);
  const fontSize = size * 0.36;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color + "25",
            borderColor: color + "60",
          },
        ]}
      >
        <Text style={[styles.initials, { fontSize, color }]}>{getInitials(name)}</Text>
      </View>
      {isOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  avatar: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  onlineDot: {
    position: "absolute",
    backgroundColor: COLORS.accentGreen,
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
});
