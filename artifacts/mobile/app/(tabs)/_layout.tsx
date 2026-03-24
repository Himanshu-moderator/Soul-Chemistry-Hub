import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass.circle.fill" }} />
        <Label>Personalities</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="communities">
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
        <Label>Communities</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="soul">
        <Icon sf={{ default: "sparkles", selected: "sparkles" }} />
        <Label>Soul</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="market">
        <Icon sf={{ default: "heart.circle", selected: "heart.circle.fill" }} />
        <Label>Market</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () => (
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={[StyleSheet.absoluteFill, { borderTopWidth: 1, borderTopColor: COLORS.glassBorder }]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: "rgba(0,0,0,0.92)",
                  borderTopWidth: 1,
                  borderTopColor: COLORS.glassBorder,
                },
              ]}
            />
          )
        ),
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Personas",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "magnifyingglass.circle.fill" : "magnifyingglass"} tintColor={color} size={24} />
            ) : (
              <Feather name="search" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Community",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "person.3.fill" : "person.3"} tintColor={color} size={24} />
            ) : (
              <Feather name="users" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="soul"
        options={{
          title: "Soul",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="sparkles" tintColor={color} size={26} />
            ) : (
              <Feather name="star" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "person.crop.circle.fill" : "person.crop.circle"} tintColor={color} size={24} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "heart.circle.fill" : "heart.circle"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "heart-circle" : "heart-circle-outline"} size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
