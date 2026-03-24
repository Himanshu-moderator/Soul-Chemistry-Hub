export const COLORS = {
  bg: "#0D0D0F",
  bgSecondary: "#151518",
  bgTertiary: "#1C1C21",
  bgCard: "#1A1A1E",
  bgCardBorder: "rgba(255,255,255,0.07)",
  bgGlass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.09)",

  accent: "#8B5CF6",
  accentLight: "#A78BFA",
  accentDim: "rgba(139,92,246,0.15)",
  accentGold: "#F59E0B",
  accentGoldDim: "rgba(245,158,11,0.15)",
  accentBlue: "#06B6D4",
  accentBlueDim: "rgba(6,182,212,0.15)",
  accentGreen: "#10B981",
  accentGreenDim: "rgba(16,185,129,0.15)",
  accentRed: "#F43F5E",
  accentOrange: "#F97316",

  // PDB-style: MBTI types in warm orange/amber
  typeColor: "#E8813A",
  typeBg: "rgba(232,129,58,0.12)",

  textPrimary: "#F0F0F0",
  textSecondary: "rgba(240,240,240,0.55)",
  textTertiary: "rgba(240,240,240,0.3)",
  textMuted: "rgba(240,240,240,0.15)",

  tabActive: "#8B5CF6",
  tabInactive: "rgba(240,240,240,0.35)",

  saturnRing: "#C0A060",

  MBTI: {
    INTJ: "#7C3AED", INTP: "#4F46E5", ENTJ: "#9333EA", ENTP: "#7C3AED",
    INFJ: "#0891B2", INFP: "#0EA5E9", ENFJ: "#06B6D4", ENFP: "#3B82F6",
    ISTJ: "#92400E", ISFJ: "#78716C", ESTJ: "#A16207", ESFJ: "#6B7280",
    ISTP: "#DC2626", ISFP: "#DB2777", ESTP: "#D97706", ESFP: "#EF4444",
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
