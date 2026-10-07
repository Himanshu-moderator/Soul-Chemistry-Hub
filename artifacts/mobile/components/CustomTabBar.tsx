import React, { useRef, useEffect, memo } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Just the parts of the tab bar props this component uses (the navigation
// package is only a transitive dependency of expo-router, so it can't be imported).
type TabRoute = { key: string; name: string };
type BottomTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (event: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};
import { BlurView } from "expo-blur";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { SaturnIcon } from "@/components/SaturnIcon";

// Coin with heart icon
function CoinHeartIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 24, height: 24 }}>
      <View style={[
        coinHeart.outer,
        { borderColor: focused ? "#F59E0B" : "#5A4A20", backgroundColor: focused ? "#F59E0B22" : "transparent" }
      ]}>
        <Ionicons name="heart" size={11} color={focused ? "#F59E0B" : "#8A7040"} />
      </View>
    </View>
  );
}

const coinHeart = StyleSheet.create({
  outer: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});

const TAB_ORDER = ["index", "chats", "soul", "profile", "market"];

function getTabIcon(routeName: string, focused: boolean, color: string) {
  const sz = 22;
  switch (routeName) {
    case "index": return <Feather name="search" size={sz} color={color} />;
    case "chats": return <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={sz} color={color} />;
    case "profile": return <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={sz} color={color} />;
    case "market": return <CoinHeartIcon focused={focused} color={color} />;
    default: return <Feather name="circle" size={sz} color={color} />;
  }
}

function getTabLabel(routeName: string) {
  switch (routeName) {
    case "index": return "Explore";
    case "chats": return "Chats";
    case "profile": return "Profile";
    case "market": return "Coins";
    default: return routeName;
  }
}

type TabItemProps = {
  route: { key: string; name: string };
  isFocused: boolean;
  onPress: () => void;
  unreadCount?: number;
};

const TabItem = memo(({ route, isFocused, onPress, unreadCount }: TabItemProps) => {
  const color = isFocused ? COLORS.accent : COLORS.tabInactive;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.84, useNativeDriver: true, speed: 50 }).start();
  const handleOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 24 }).start();

  return (
    <Animated.View style={[styles.tabItem, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        style={styles.tabBtn}
        activeOpacity={1}
      >
        <View style={styles.tabIconWrap}>
          {getTabIcon(route.name, isFocused, color)}
          {!!unreadCount && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.tabLabel, { color: isFocused ? COLORS.accent : COLORS.tabInactive }]} numberOfLines={1}>
          {getTabLabel(route.name)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";

  const soulIdx = state.routes.findIndex((r) => r.name === "soul");
  const isSoulActive = state.index === soulIdx;

  // CRITICAL: separate Animated.Values for native vs non-native drivers
  const saturnScale = useRef(new Animated.Value(1)).current;   // useNativeDriver: true
  const glowOpacity = useRef(new Animated.Value(0.25)).current; // useNativeDriver: false

  useEffect(() => {
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(saturnScale, { toValue: 1.09, duration: 2400, useNativeDriver: true }),
        Animated.timing(saturnScale, { toValue: 1, duration: 2400, useNativeDriver: true }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.85, duration: 2800, useNativeDriver: false }),
        Animated.timing(glowOpacity, { toValue: 0.2, duration: 2800, useNativeDriver: false }),
      ])
    );
    scaleLoop.start();
    glowLoop.start();
    return () => { scaleLoop.stop(); glowLoop.stop(); };
  }, []);

  // Only the five real tabs belong in the bar (hidden routes like the old
  // standalone communities screen must not show up).
  const visibleRoutes = state.routes.filter((r) => TAB_ORDER.includes(r.name));
  const leftRoutes = visibleRoutes.slice(0, 2);
  const rightRoutes = visibleRoutes.slice(3);
  const soulRoute = state.routes[soulIdx];

  const handleTabPress = (route: { key: string; name: string }, isFocused: boolean) => {
    Haptics.selectionAsync();
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const handleSoul = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!soulRoute) return;
    const event = navigation.emit({ type: "tabPress", target: soulRoute.key, canPreventDefault: true });
    if (!isSoulActive && !event.defaultPrevented) navigation.navigate(soulRoute.name);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {isIOS ? (
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(8,8,10,0.98)" }]} />
      )}
      <View style={styles.topBorder} />

      <View style={styles.tabRow}>
        {/* Left 2 tabs */}
        <View style={styles.halfRow}>
          {leftRoutes.map((route) => {
            const routeIdx = state.routes.findIndex((r) => r.key === route.key);
            return (
              <TabItem
                key={route.key}
                route={route}
                isFocused={state.index === routeIdx}
                onPress={() => handleTabPress(route, state.index === routeIdx)}
                unreadCount={route.name === "chats" ? 6 : 0}
              />
            );
          })}
        </View>

        {/* Center Soul FAB */}
        <View style={styles.saturnCenter} pointerEvents="box-none">
          {/* Glow ring – ONLY non-native opacity */}
          <Animated.View style={[styles.saturnGlowRing, { opacity: glowOpacity }]} />
          {/* Scale – ONLY native driver */}
          <Animated.View style={{ transform: [{ scale: saturnScale }] }}>
            <TouchableOpacity
              style={[styles.saturnFAB, isSoulActive && styles.saturnFABActive]}
              onPress={handleSoul}
              activeOpacity={0.82}
            >
              <SaturnIcon size={28} color={isSoulActive ? "#E8C84A" : "#B09030"} ringColor={isSoulActive ? "#E8C84A" : "#7A6020"} />
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.saturnLabel, isSoulActive && { color: "#E8C84A" }]}>Soul</Text>
        </View>

        {/* Right 2 tabs */}
        <View style={styles.halfRow}>
          {rightRoutes.map((route) => {
            const routeIdx = state.routes.findIndex((r) => r.key === route.key);
            return (
              <TabItem
                key={route.key}
                route={route}
                isFocused={state.index === routeIdx}
                onPress={() => handleTabPress(route, state.index === routeIdx)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 0, left: 0, right: 0, overflow: "visible" },
  topBorder: { position: "absolute", top: 0, left: 0, right: 0, height: 0.5, backgroundColor: "rgba(255,255,255,0.08)" },
  tabRow: { flexDirection: "row", alignItems: "flex-end", paddingTop: 6, paddingBottom: 2, paddingHorizontal: 4, overflow: "visible" },
  halfRow: { flex: 1, flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end" },
  tabItem: { flex: 1, alignItems: "center" },
  tabBtn: { alignItems: "center", paddingHorizontal: 2, paddingVertical: 4, gap: 3 },
  tabIconWrap: { width: 36, height: 28, alignItems: "center", justifyContent: "center", position: "relative" },
  badge: { position: "absolute", top: -4, right: -2, backgroundColor: "#EF4444", borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1, minWidth: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#08080A" },
  badgeText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 9 },
  tabLabel: { fontFamily: "Inter_500Medium", fontSize: 9.5 },
  saturnCenter: { width: 68, alignItems: "center", overflow: "visible", marginBottom: 0, position: "relative" },
  saturnGlowRing: { position: "absolute", top: -26, width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(184,140,30,0.2)" },
  saturnFAB: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#141005", alignItems: "center", justifyContent: "center", marginTop: -20, borderWidth: 1.5, borderColor: "#4A3808", shadowColor: "#C8A82A", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 14 },
  saturnFABActive: { borderColor: "#E8C84A", backgroundColor: "#1C1400", shadowOpacity: 0.75 },
  saturnLabel: { fontFamily: "Inter_500Medium", fontSize: 9.5, color: COLORS.tabInactive, marginTop: 3 },
});
