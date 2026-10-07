import React, { createContext, useContext, useMemo } from "react";
import { useApp } from "@/state/AppContext";
import { buildColors, getTheme, type AppTheme, type Colors } from "@/theme/themes";
import { getChatTheme, type ChatTheme } from "@/theme/chatThemes";

type ThemeContextType = {
  theme: AppTheme;
  colors: Colors;
  chatTheme: ChatTheme;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// Reads the user's saved theme choices and hands the matching palette to the tree.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { selectedTheme, chatTheme } = useApp();

  const value = useMemo<ThemeContextType>(() => {
    const theme = getTheme(selectedTheme);
    return { theme, colors: buildColors(theme), chatTheme: getChatTheme(chatTheme) };
  }, [selectedTheme, chatTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

// Builds a StyleSheet from the current palette, rebuilt only when the theme changes.
//   const styles = useStyles(makeStyles);
//   const makeStyles = (c: Colors) => StyleSheet.create({ ... });
export function useStyles<T>(factory: (colors: Colors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
