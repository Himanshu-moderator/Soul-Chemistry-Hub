import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { font } from "@/theme/tokens";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";
import { useApp } from "@/state/AppContext";

// The parts of the tab-bar props used here (the navigation package is only a
// transitive dependency of expo-router, so it can't be imported directly).
type TabRoute = { key: string; name: string };
type TabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (event: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

// Order is the order on screen; "soul" is the raised centre button.
const TABS = [
  { name: "index", label: "Explore" },
  { name: "chats", label: "Chats" },
  { name: "soul", label: "Soul" },
  { name: "profile", label: "Profile" },
  { name: "market", label: "Coins" },
] as const;

function TabIcon({ name, color }: { name: string; color: string }) {
  switch (name) {
    case "index":
      return <Feather name="compass" size={23} color={color} />;
    case "chats":
      return <Feather name="message-circle" size={23} color={color} />;
    case "profile":
      return <Feather name="user" size={23} color={color} />;
    default:
      return <Ionicons name="sparkles-outline" size={23} color={color} />;
  }
}

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { mode } = useApp();
  const unread = mode === "demo" ? 6 : 0; // sample inbox only exists in the demo

  const press = (route: TabRoute, focused: boolean) => {
    Haptics.selectionAsync();
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {/* Solid, not blurred: a see-through bar lets list text show through it and looks cluttered. */}
        <View style={[StyleSheet.absoluteFill, styles.barBg]} />

        {TABS.map((tab) => {
          const route = state.routes.find((r) => r.name === tab.name);
          if (!route) return null;
          const focused = state.routes[state.index]?.name === tab.name;
          const color = focused ? colors.accent : colors.tabInactive;

          if (tab.name === "soul") {
            return (
              <Pressable key={tab.name} accessibilityRole="button" accessibilityLabel="Soul" onPress={() => press(route, focused)} style={styles.centerSlot}>
                <View style={[styles.orbGlow, focused && { opacity: 1 }]} />
                <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
                  <View style={styles.orbRing} />
                  <Ionicons name="planet" size={26} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.label, { color }]}>Soul</Text>
              </Pressable>
            );
          }

          return (
            <Pressable key={tab.name} accessibilityRole="button" accessibilityLabel={tab.label} onPress={() => press(route, focused)} style={styles.item}>
              <View>
                <TabIcon name={tab.name} color={color} />
                {tab.name === "chats" && unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    wrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 14 },
    bar: {
      flexDirection: "row",
      alignItems: "flex-end",
      height: 68,
      borderRadius: 28,
      overflow: "visible",
      paddingBottom: 9,
      borderWidth: 1,
      borderColor: c.border,
    },
    barBg: { backgroundColor: c.surfaceSolid, borderRadius: 28 },
    item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, height: "100%", paddingTop: 6 },
    label: { fontFamily: font.medium, fontSize: 10.5 },
    centerSlot: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 4 },
    orbGlow: {
      position: "absolute",
      bottom: 14,
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: c.accent,
      opacity: 0.35,
    },
    orb: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginTop: -22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: c.bgBottom,
    },
    orbRing: {
      position: "absolute",
      width: 70,
      height: 18,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.4)",
      transform: [{ rotate: "-20deg" }],
    },
    badge: {
      position: "absolute",
      top: -6,
      right: -10,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 4,
      backgroundColor: c.danger,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { color: "#FFFFFF", fontFamily: font.bold, fontSize: 10 },
  });
