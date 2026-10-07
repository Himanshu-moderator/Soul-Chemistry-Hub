// App themes. A theme is a small recipe (two accent colours and a background
// tint); buildColors turns it into the full palette every component reads.

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  free: boolean;
  accent: string;
  accentAlt: string;
  // Top and bottom of the page background gradient.
  bg: [string, string];
}

// The ids (t1..t6) are stored with each profile, so keep them stable.
export const APP_THEMES: AppTheme[] = [
  { id: "t1", name: "Nebula", description: "Violet and pink, the Pdb default", free: true, accent: "#8B5CF6", accentAlt: "#EC4899", bg: ["#06050F", "#100C26"] },
  { id: "t2", name: "Aurora", description: "Northern-lights teal and green", free: true, accent: "#2DD4BF", accentAlt: "#22C55E", bg: ["#030D0E", "#06201F"] },
  { id: "t3", name: "Pulsar", description: "Electric cyan to indigo", free: false, accent: "#22D3EE", accentAlt: "#6366F1", bg: ["#030812", "#0A1330"] },
  { id: "t4", name: "Solar Flare", description: "Amber and ember orange", free: false, accent: "#FBBF24", accentAlt: "#F97316", bg: ["#0B0703", "#241408"] },
  { id: "t5", name: "Quasar", description: "Rose to crimson", free: false, accent: "#FB7185", accentAlt: "#E11D48", bg: ["#0C0509", "#26101A"] },
  { id: "t6", name: "Comet", description: "Ice blue and silver mist", free: false, accent: "#7DD3FC", accentAlt: "#818CF8", bg: ["#030A12", "#0B1A2C"] },
];

export const DEFAULT_THEME_ID = "t1";

export const getTheme = (id: string): AppTheme => APP_THEMES.find((t) => t.id === id) ?? APP_THEMES[0];

// "#RRGGBB" + 0..1 alpha -> rgba(...)
export const withAlpha = (hex: string, alpha: number): string => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const MBTI = {
  INTJ: "#8B5CF6", INTP: "#6366F1", ENTJ: "#A855F7", ENTP: "#C084FC",
  INFJ: "#14B8A6", INFP: "#38BDF8", ENFJ: "#22D3EE", ENFP: "#60A5FA",
  ISTJ: "#D6A25C", ISFJ: "#94A3B8", ESTJ: "#EAB308", ESFJ: "#A1A1AA",
  ISTP: "#F87171", ISFP: "#F472B6", ESTP: "#FB923C", ESFP: "#FB7185",
} as Record<string, string>;

export function buildColors(theme: AppTheme) {
  return {
    // Surfaces
    bg: theme.bg[0],
    bgTop: theme.bg[0],
    bgBottom: theme.bg[1],
    surface: "rgba(255,255,255,0.055)",
    surfaceStrong: "rgba(255,255,255,0.095)",
    surfaceSolid: "#14122B", // opaque, for sheets and the tab bar
    border: "rgba(255,255,255,0.08)",
    overlay: "rgba(3,2,10,0.72)",

    // Text
    text: "#F4F3FA",
    textSecondary: "rgba(244,243,250,0.62)",
    textTertiary: "rgba(244,243,250,0.38)",
    onAccent: "#FFFFFF",

    // Brand
    accent: theme.accent,
    accentAlt: theme.accentAlt,
    accentSoft: withAlpha(theme.accent, 0.16),
    gradient: [theme.accent, theme.accentAlt] as [string, string],

    // Status
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#FB7185",
    gold: "#FBBF24",
    cyan: "#22D3EE",

    mbti: MBTI,
    tabInactive: "rgba(244,243,250,0.4)",
  };
}

export type Colors = ReturnType<typeof buildColors>;
