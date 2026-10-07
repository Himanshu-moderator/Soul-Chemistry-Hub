import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { CosmicBackground, type SkyVariant } from "@/components/cosmic/CosmicBackground";

// One sky for the whole app, drawn once behind every screen. Screens don't draw
// their own background: they just say which sky they want (<Sky variant="full">).
// That keeps navigation smooth (the stars never reset) and the app light (the
// animations run once, not once per screen).

type Ctx = { variant: SkyVariant; setVariant: (v: SkyVariant) => void };
const SkyContext = createContext<Ctx | null>(null);

export function SkyProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<SkyVariant>("subtle");
  const value = useMemo(() => ({ variant, setVariant }), [variant]);
  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>;
}

// Renders the shared sky. Place it once, behind the navigator.
export function SkyHost() {
  const ctx = useContext(SkyContext);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CosmicBackground variant={ctx?.variant ?? "subtle"} />
    </View>
  );
}

// Ask for a sky while this screen is focused.
export function useSky(variant: SkyVariant) {
  const ctx = useContext(SkyContext);
  const set = ctx?.setVariant;
  useFocusEffect(
    useCallback(() => {
      set?.(variant);
    }, [set, variant])
  );
}

// A transparent page wrapper that requests a sky: <Sky variant="subtle">…</Sky>
export function Sky({ variant = "subtle", children }: { variant?: SkyVariant; children: React.ReactNode }) {
  useSky(variant);
  return <View style={styles.fill}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
