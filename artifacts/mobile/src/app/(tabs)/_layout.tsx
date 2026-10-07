import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/components/navigation/TabBar";

// The five main tabs. Each file here is a thin route that renders a screen
// from src/features/<name>/.
export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "transparent" } }}>
      <Tabs.Screen name="index" options={{ title: "Explore" }} />
      <Tabs.Screen name="chats" options={{ title: "Chats" }} />
      <Tabs.Screen name="soul" options={{ title: "Soul" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="market" options={{ title: "Coins" }} />
    </Tabs>
  );
}
