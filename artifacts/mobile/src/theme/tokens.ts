// Design tokens: the fixed numbers every screen builds from. Colours live in
// themes.ts because they change with the user's chosen theme.

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;

// Inter is loaded once in app/_layout.tsx.
export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

// Ready-made text styles, spread into a StyleSheet entry: { ...type.title, color }.
export const type = {
  display: { fontFamily: font.bold, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  title: { fontFamily: font.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.5 },
  heading: { fontFamily: font.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: font.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 17 },
  label: { fontFamily: font.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: "uppercase" },
} as const;
