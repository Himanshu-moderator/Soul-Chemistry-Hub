import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, ThemeProvider as NavigationTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";

import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { SplashOverlay } from "@/components/cosmic/SplashOverlay";
import { SoulProvider } from "@/state/SoulContext";
import { SkyHost, SkyProvider } from "@/components/cosmic/Sky";
import { RouteGate } from "@/components/navigation/RouteGate";
import { AppProvider } from "@/state/AppContext";
import { AuthProvider } from "@/state/AuthContext";
import { ThemeProvider } from "@/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// The navigator paints a background behind every screen by default. Make it clear
// so the shared sky (see components/cosmic/Sky.tsx) shows through.
const navigationTheme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: "transparent", card: "transparent", border: "transparent" } };

// The animated intro plays once per launch, not every time this layout remounts.
let introPlayed = false;

// On desktop browsers the app is a phone-sized column centred on the page
// instead of a stretched layout; on devices it is a no-op.
function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: "#030208", alignItems: "center" }}>
      <View style={{ flex: 1, width: "100%", maxWidth: 440, overflow: "clip" as unknown as "hidden", backgroundColor: "#06050F" }}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  // Text and icon fonts are loaded together, before anything is drawn, so a slow
  // first load can't leave serif text and empty icon boxes on screen.
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Feather.font,
    ...Ionicons.font,
  });
  const [intro, setIntro] = useState(!introPlayed);
  // True once the splash starts fading out: only then does the real sky start up.
  const [skyActive, setSkyActive] = useState(introPlayed);
  const startSky = useCallback(() => setSkyActive(true), []);
  const finishIntro = useCallback(() => {
    introPlayed = true;
    setIntro(false);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // While fonts load, show the app's own dark background instead of a white flash.
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: "#06050F" }} />;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <ThemeProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <StatusBar style="light" />
                    <WebFrame>
                      <SoulProvider>
                      <NavigationTheme value={navigationTheme}>
                      <SkyProvider>
                      <SkyHost active={skyActive} />
                      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" }, animation: "fade" }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="auth" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="onboarding" />
                        <Stack.Screen name="community/[id]" options={{ animation: "slide_from_right" }} />
                        <Stack.Screen name="person/[id]" options={{ animation: "slide_from_right" }} />
                        <Stack.Screen name="edit-profile" options={{ animation: "slide_from_right" }} />
                      </Stack>
                      <RouteGate />
                      </SkyProvider>
                      </NavigationTheme>
                      </SoulProvider>
                      {intro && <SplashOverlay onFadeStart={startSky} onDone={finishIntro} />}
                    </WebFrame>
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </ThemeProvider>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
