export const COLORS = {
  bg: "#000000",
  bgSecondary: "#0A0A0A",
  bgTertiary: "#111111",
  bgCard: "#141414",
  bgCardBorder: "rgba(255,255,255,0.08)",
  bgGlass: "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.1)",

  accent: "#7C4DFF",
  accentLight: "#9C6FFF",
  accentDim: "rgba(124,77,255,0.15)",
  accentGold: "#FFB800",
  accentGoldDim: "rgba(255,184,0,0.15)",
  accentBlue: "#00B4D8",
  accentBlueDim: "rgba(0,180,216,0.15)",
  accentGreen: "#00C896",
  accentRed: "#FF3B6B",
  accentOrange: "#FF6B35",

  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.6)",
  textTertiary: "rgba(255,255,255,0.35)",
  textMuted: "rgba(255,255,255,0.2)",

  tabActive: "#7C4DFF",
  tabInactive: "rgba(255,255,255,0.4)",

  MBTI: {
    INTJ: "#7C4DFF", INTP: "#5C6BC0", ENTJ: "#AB47BC", ENTP: "#7E57C2",
    INFJ: "#26A69A", INFP: "#42A5F5", ENFJ: "#26C6DA", ENFP: "#29B6F6",
    ISTJ: "#8D6E63", ISFJ: "#78909C", ESTJ: "#A1887F", ESFJ: "#90A4AE",
    ISTP: "#FF7043", ISFP: "#EC407A", ESTP: "#FFA726", ESFP: "#FF5252",
  },
};

export default {
  light: {
    text: COLORS.textPrimary,
    background: COLORS.bg,
    tint: COLORS.accent,
    tabIconDefault: COLORS.tabInactive,
    tabIconSelected: COLORS.tabActive,
  },
  dark: {
    text: COLORS.textPrimary,
    background: COLORS.bg,
    tint: COLORS.accent,
    tabIconDefault: COLORS.tabInactive,
    tabIconSelected: COLORS.tabActive,
  },
};
