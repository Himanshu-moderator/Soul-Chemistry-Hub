import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { SplashOverlay } from "@/components/cosmic/SplashOverlay";
import { RouteGate } from "@/components/navigation/RouteGate";
import { AppProvider } from "@/state/AppContext";
import { AuthProvider } from "@/state/AuthContext";
import { ThemeProvider } from "@/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [intro, setIntro] = useState(!introPlayed);
  const finishIntro = useCallback(() => {
    introPlayed = true;
    setIntro(false);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
                      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#06050F" }, animation: "fade" }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="auth" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="onboarding" />
                        <Stack.Screen name="community/[id]" options={{ animation: "slide_from_right" }} />
                      </Stack>
                      <RouteGate />
                      {intro && <SplashOverlay onDone={finishIntro} />}
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
