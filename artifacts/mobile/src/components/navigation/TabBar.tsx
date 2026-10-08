import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { font } from "@/theme/tokens";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";
import { useApp } from "@/state/AppContext";
import { useSoul } from "@/state/SoulContext";

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

// Height of the bar itself (without the bottom safe area). Screens use it to leave room.
export const TAB_BAR_HEIGHT = 64;

// The Soul button sits in a round notch cut into the top edge of the bar.
const ORB = 52;
const NOTCH_HALF = 44; // half the width of the notch, where it meets the top edge
const NOTCH_DEPTH = 34;
const ORB_TOP = -22; // the orb pokes this far above the bar

// Order is the order on screen; "soul" is the centre button.
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

// The bar's outline: a flat top edge with a smooth round notch in the middle.
function barPaths(width: number, height: number) {
  const cx = width / 2;
  const left = cx - NOTCH_HALF;
  const right = cx + NOTCH_HALF;
  const notch = `C ${left + 24} 0.5 ${cx - 30} ${NOTCH_DEPTH} ${cx} ${NOTCH_DEPTH} C ${cx + 30} ${NOTCH_DEPTH} ${right - 24} 0.5 ${right} 0.5`;
  const edge = `M 0 0.5 L ${left} 0.5 ${notch} L ${width} 0.5`;
  return { edge, fill: `${edge} L ${width} ${height} L 0 ${height} Z` };
}

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { mode } = useApp();
  const { received } = useSoul();
  const window = useWindowDimensions();
  // The app is shown in a column at most 440 wide on large screens.
  const width = Math.min(window.width, 440);
  const height = TAB_BAR_HEIGHT + insets.bottom;
  const paths = barPaths(width, height);
  // The sample inbox only exists in the demo; pending requests count everywhere.
  const unread = (mode === "demo" ? 6 : 0) + received.length;

  const press = (route: TabRoute, focused: boolean) => {
    Haptics.selectionAsync();
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={{ height }}>
        {/* A solid panel fixed to the bottom edge, with a notch for Soul. */}
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Path d={paths.fill} fill={colors.surfaceSolid} />
          <Path d={paths.edge} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={1} />
        </Svg>

        <View style={[styles.row, { paddingBottom: insets.bottom }]}>
          {TABS.map((tab) => {
            const route = state.routes.find((r) => r.name === tab.name);
            if (!route) return null;
            const focused = state.routes[state.index]?.name === tab.name;
            const color = focused ? colors.accent : colors.tabInactive;

            if (tab.name === "soul") {
              return (
                <Pressable key={tab.name} accessibilityRole="button" accessibilityLabel="Soul" onPress={() => press(route, focused)} style={styles.item}>
                  <View style={styles.orbSpacer} />
                  <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
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
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
    row: { flex: 1, flexDirection: "row", alignItems: "flex-end", paddingBottom: 0 },
    item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, height: TAB_BAR_HEIGHT },
    label: { fontFamily: font.medium, fontSize: 10.5 },
    // Takes the place of an icon so Soul's label lines up with the others.
    orbSpacer: { height: 23 },
    orb: {
      position: "absolute",
      top: ORB_TOP,
      alignSelf: "center",
      width: ORB,
      height: ORB,
      borderRadius: ORB / 2,
      alignItems: "center",
      justifyContent: "center",
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
