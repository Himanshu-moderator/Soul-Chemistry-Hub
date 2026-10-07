import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// On desktop browsers the app is a phone-sized column centred on the page
// instead of a stretched layout; on devices it is a no-op.
function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: "#05050A", alignItems: "center" }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 440,
          overflow: "hidden",
          backgroundColor: "#000",
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: "#1A1A24",
        }}
      >
        {children}
      </View>
    </View>
  );
}

// Sends people where they belong: signed-out visitors to the welcome screen,
// new members to onboarding, everyone else into the app.
function RouteGate() {
  const { ready, mode, signOut } = useAuth();
  const { hydrated, onboarded, loadError, retryLoad } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const first = segments[0] as string | undefined;

  useEffect(() => {
    if (!ready) return;
    if (mode === "none") {
      if (first !== undefined && first !== "auth") router.replace("/");
      return;
    }
    if (!hydrated || loadError) return;
    if (!onboarded) {
      if (first !== "onboarding") router.replace("/onboarding");
    } else if (first === undefined || first === "auth" || first === "onboarding") {
      router.replace("/(tabs)");
    }
  }, [ready, mode, hydrated, onboarded, loadError, first, router]);

  const loading = !ready || (mode !== "none" && !hydrated);
  if (!loading && !loadError) return null;
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 16,
      }}
    >
      {loadError ? (
        <>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Couldn't load your profile</Text>
          <Text style={{ color: "#8A8A99", textAlign: "center" }}>{loadError}</Text>
          <Pressable onPress={retryLoad} style={{ backgroundColor: "#7C4DFF", paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14 }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Try again</Text>
          </Pressable>
          <Pressable onPress={signOut}>
            <Text style={{ color: "#8A8A99" }}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator color="#7C4DFF" size="large" />
      )}
    </View>
  );
}

function RootLayoutNav() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
      </Stack>
      <RouteGate />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <StatusBar style="light" />
                <WebFrame>
                  <RootLayoutNav />
                </WebFrame>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
