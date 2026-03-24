import React, { useRef, useEffect, memo } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { SaturnIcon } from "@/components/SaturnIcon";

function getTabIcon(routeName: string, focused: boolean, color: string) {
  const sz = 22;
  switch (routeName) {
    case "index": return <Feather name="search" size={sz} color={color} />;
    case "chats": return <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={sz} color={color} />;
    case "communities": return <Ionicons name={focused ? "people" : "people-outline"} size={sz} color={color} />;
    case "profile": return <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={sz} color={color} />;
    case "market": return <Ionicons name={focused ? "heart-circle" : "heart-circle-outline"} size={sz} color={color} />;
    default: return <Feather name="circle" size={sz} color={color} />;
  }
}

function getTabLabel(routeName: string) {
  switch (routeName) {
    case "index": return "Personalities";
    case "chats": return "Chats";
    case "communities": return "Community";
    case "profile": return "Profile";
    case "market": return "Market";
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
  const handleIn = () => Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, speed: 40 }).start();
  const handleOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={[styles.tabItem, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        style={styles.tabBtn}
        activeOpacity={1}
      >
        <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
          {getTabIcon(route.name, isFocused, color)}
          {!!unreadCount && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
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

  const saturnPulse = useRef(new Animated.Value(1)).current;
  const saturnGlow = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(saturnPulse, { toValue: 1.07, duration: 2200, useNativeDriver: true }),
        Animated.timing(saturnPulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ])
    );
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(saturnGlow, { toValue: 1, duration: 2800, useNativeDriver: false }),
        Animated.timing(saturnGlow, { toValue: 0.2, duration: 2800, useNativeDriver: false }),
      ])
    );
    pulseAnim.start();
    glowAnim.start();
    return () => { pulseAnim.stop(); glowAnim.stop(); };
  }, []);

  const leftRoutes = state.routes.slice(0, Math.floor(state.routes.length / 2));
  const rightRoutes = state.routes.slice(Math.floor(state.routes.length / 2) + 1);
  const soulRoute = state.routes[soulIdx];

  const handleTabPress = (route: { key: string; name: string }, isFocused: boolean) => {
    Haptics.selectionAsync();
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const handleSoul = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (soulRoute) {
      const event = navigation.emit({ type: "tabPress", target: soulRoute.key, canPreventDefault: true });
      if (!isSoulActive && !event.defaultPrevented) {
        navigation.navigate(soulRoute.name);
      }
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {isIOS ? (
        <BlurView intensity={75} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,10,12,0.97)" }]} />
      )}
      <View style={styles.topBorder} />

      <View style={styles.tabRow}>
        {/* Left half */}
        <View style={styles.halfRow}>
          {leftRoutes.map((route) => (
            <TabItem
              key={route.key}
              route={route}
              isFocused={state.index === state.routes.findIndex((r) => r.key === route.key)}
              onPress={() => handleTabPress(route, state.index === state.routes.findIndex((r) => r.key === route.key))}
              unreadCount={route.name === "chats" ? 6 : 0}
            />
          ))}
        </View>

        {/* Saturn center FAB */}
        <View style={styles.saturnCenter}>
          {/* Glow ring */}
          <Animated.View style={[styles.saturnGlowOuter, { opacity: saturnGlow, transform: [{ scale: saturnPulse }] }]} />
          <Animated.View style={{ transform: [{ scale: saturnPulse }] }}>
            <TouchableOpacity
              style={[styles.saturnFAB, isSoulActive && styles.saturnFABActive]}
              onPress={handleSoul}
              activeOpacity={0.8}
            >
              <SaturnIcon size={30} color={isSoulActive ? "#FFD580" : "#C8A84B"} ringColor={isSoulActive ? "#FFD580" : "#C8A84B"} />
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.saturnLabel, isSoulActive && { color: "#FFD580" }]}>Soul</Text>
        </View>

        {/* Right half */}
        <View style={styles.halfRow}>
          {rightRoutes.map((route) => (
            <TabItem
              key={route.key}
              route={route}
              isFocused={state.index === state.routes.findIndex((r) => r.key === route.key)}
              onPress={() => handleTabPress(route, state.index === state.routes.findIndex((r) => r.key === route.key))}
              unreadCount={0}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "visible",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 4,
    overflow: "visible",
  },
  halfRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabBtn: {
    alignItems: "center",
    paddingHorizontal: 2,
    paddingVertical: 2,
    gap: 3,
  },
  tabIconWrap: {
    width: 38,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    position: "relative",
  },
  tabIconWrapActive: {
    backgroundColor: COLORS.accentDim,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: 0,
    backgroundColor: COLORS.accentRed,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.bg,
  },
  badgeText: {
    color: "#FFF",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
  },
  tabLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9.5,
    marginTop: 1,
  },
  saturnCenter: {
    width: 70,
    alignItems: "center",
    overflow: "visible",
    marginBottom: 2,
    position: "relative",
  },
  saturnGlowOuter: {
    position: "absolute",
    top: -22,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(200,168,75,0.15)",
  },
  saturnFAB: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#181408",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
    borderWidth: 1.5,
    borderColor: "#5A4010",
    shadowColor: "#C8A84B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  saturnFABActive: {
    borderColor: "#FFD580",
    backgroundColor: "#201800",
    shadowOpacity: 0.6,
  },
  saturnLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9.5,
    color: COLORS.tabInactive,
    marginTop: 4,
  },
});
