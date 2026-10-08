import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { font } from "@/theme/tokens";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { withAlpha, type Colors } from "@/theme/themes";
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
// How far the bar swells upwards around the Soul button. Floating buttons keep clear of it.
export const TAB_BAR_BUMP = 36;

const ORB = 54;
const BUMP_HALF = 58; // half the width of the swell, where it meets the flat top edge

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
      return <Feather name="compass" size={22} color={color} />;
    case "chats":
      return <Feather name="message-circle" size={22} color={color} />;
    case "profile":
      return <Feather name="user" size={22} color={color} />;
    default:
      return <Ionicons name="sparkles-outline" size={22} color={color} />;
  }
}

// The bar's outline, drawn in a box that starts BUMP above the bar: a flat top edge
// that swells smoothly upwards in the middle to wrap around the Soul button.
function barPaths(width: number, barHeight: number) {
  const cx = width / 2;
  const top = TAB_BAR_BUMP; // y of the flat edge inside the drawing
  const left = cx - BUMP_HALF;
  const right = cx + BUMP_HALF;
  const edge =
    `M 0 ${top + 0.5} L ${left} ${top + 0.5} ` +
    `C ${left + 30} ${top + 0.5} ${cx - 38} 0.5 ${cx} 0.5 ` +
    `C ${cx + 38} 0.5 ${right - 30} ${top + 0.5} ${right} ${top + 0.5} L ${width} ${top + 0.5}`;
  return { edge, fill: `${edge} L ${width} ${top + barHeight} L 0 ${top + barHeight} Z` };
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
      {/* a soft shadow so the bar lifts off the page */}
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.28)"]} pointerEvents="none" style={styles.shadow} />

      <View style={{ height }}>
        {/* The bar: a solid panel with a gentle top-lit gradient that swells around Soul. */}
        <Svg width={width} height={height + TAB_BAR_BUMP} style={[styles.svg, { top: -TAB_BAR_BUMP }]}>
          <Defs>
            <SvgGradient id="bar" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.surfaceStrong} />
              <Stop offset="1" stopColor={colors.surfaceSolid} />
            </SvgGradient>
          </Defs>
          <Path d={paths.fill} fill="url(#bar)" />
          <Path d={paths.edge} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
        </Svg>

        <View style={[styles.row, { paddingBottom: insets.bottom }]}>
          {TABS.map((tab) => {
            const route = state.routes.find((r) => r.name === tab.name);
            if (!route) return null;
            const focused = state.routes[state.index]?.name === tab.name;
            const color = focused ? colors.accent : "rgba(244,243,250,0.5)";

            if (tab.name === "soul") {
              return (
                <Pressable key={tab.name} accessibilityRole="button" accessibilityLabel="Soul" onPress={() => press(route, focused)} style={styles.item}>
                  <View style={[styles.orbWrap, { borderColor: focused ? withAlpha(colors.accent, 0.55) : "rgba(255,255,255,0.12)" }]}>
                    <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
                      <Ionicons name="planet" size={27} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.soulSpacer} />
                  <Text style={[styles.label, { color }]}>Soul</Text>
                </Pressable>
              );
            }

            return (
              <Pressable key={tab.name} accessibilityRole="button" accessibilityLabel={tab.label} onPress={() => press(route, focused)} style={styles.item}>
                <View style={[styles.iconPill, focused && { backgroundColor: withAlpha(colors.accent, 0.16) }]}>
                  <TabIcon name={tab.name} color={color} />
                  {tab.name === "chats" && unread > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.label, { color }, focused && { fontFamily: font.semibold }]}>{tab.label}</Text>
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
    shadow: { position: "absolute", left: 0, right: 0, top: -26, height: 26 },
    svg: { position: "absolute", left: 0 },
    row: { flex: 1, flexDirection: "row", alignItems: "flex-end" },
    item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, height: TAB_BAR_HEIGHT },
    label: { fontFamily: font.medium, fontSize: 10.5 },
    iconPill: { width: 46, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    // The ring around the Soul orb, sitting in the swell of the bar.
    orbWrap: {
      position: "absolute",
      top: -TAB_BAR_BUMP + 6,
      alignSelf: "center",
      width: ORB + 8,
      height: ORB + 8,
      borderRadius: (ORB + 8) / 2,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.accent,
      shadowOpacity: 0.45,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
    },
    orb: { width: ORB, height: ORB, borderRadius: ORB / 2, alignItems: "center", justifyContent: "center" },
    // Keeps Soul's label level with the other labels.
    soulSpacer: { height: 28 },
    badge: {
      position: "absolute",
      top: -5,
      right: 2,
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
