import React from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";

interface Props {
  children: React.ReactNode;
  // Which sky to draw behind the content.
  sky?: "full" | "subtle";
  // Wrap the content in a ScrollView.
  scroll?: boolean;
  // Leave room for the floating tab bar at the bottom.
  tabBar?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

// The standard page: space background, safe-area padding, optional scrolling.
export function Screen({ children, sky = "subtle", scroll = false, tabBar = false, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom + (tabBar ? 104 : 24);

  return (
    <CosmicBackground variant={sky}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[{ paddingTop: insets.top + 8, paddingBottom: bottom }, contentStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, { paddingTop: insets.top + 8, paddingBottom: tabBar ? bottom : insets.bottom }, contentStyle]}>
          {children}
        </View>
      )}
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
