import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sky } from "@/components/cosmic/Sky";
import { PERSONALITY_TYPES } from "@/data/mockData";
import { ENNEAGRAM_TYPES, SOCIONICS_TYPES } from "@/data/typeInsights";
import { useApp } from "@/state/AppContext";
import { useAuth } from "@/state/AuthContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { AboutTab } from "./components/AboutTab";
import { PickSheet } from "./components/EditSheets";
import { InsightsSection } from "./components/InsightsSection";
import type { TypeField } from "./components/OverviewSection";
import { ProfileTop } from "./components/ProfileTop";
import { ThemesSection } from "./components/ThemesSection";

type Tab = "About Me" | "Insights" | "Themes";
const TABS: Tab[] = ["About Me", "Insights", "Themes"];

const PICKERS: Record<TypeField, { title: string; options: string[] }> = {
  mbti: { title: "Your MBTI type", options: PERSONALITY_TYPES.map((t) => t.code) },
  enneagram: { title: "Your Enneagram", options: ENNEAGRAM_TYPES },
  socionics: { title: "Your Socionics type", options: SOCIONICS_TYPES },
};

// Profile: your page, laid out like everyone else's (cover, picture, photos, card),
// plus your numbers, badges, insights and look.
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { mode, profile, saveProfile, resetDemo } = useApp();
  const { signOut } = useAuth();

  const [tab, setTab] = useState<Tab>("About Me");
  const [picking, setPicking] = useState<TypeField | null>(null);

  const edit = () => router.push("/edit-profile" as never);

  const leave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (mode === "demo") await resetDemo();
    await signOut();
    router.replace("/");
  };

  return (
    <Sky variant="subtle">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <ProfileTop onEdit={edit} />

        <View style={styles.tabs}>
          {TABS.map((t) => {
            const on = tab === t;
            return (
              <Pressable
                key={t}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTab(t);
                }}
                style={styles.tab}
              >
                <Text style={[styles.tabText, on && { color: colors.text }]}>{t}</Text>
                <View style={[styles.tabLine, on && { backgroundColor: colors.accent }]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.body}>
          {tab === "About Me" && <AboutTab onPick={setPicking} onEdit={edit} />}
          {tab === "Insights" && <InsightsSection />}
          {tab === "Themes" && <ThemesSection />}

          <Pressable accessibilityRole="button" onPress={leave} style={styles.leave}>
            <Text style={styles.leaveText}>{mode === "demo" ? "Exit demo and clear its data" : "Sign out"}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {picking && (
        <PickSheet
          visible
          title={PICKERS[picking].title}
          options={PICKERS[picking].options}
          current={profile[picking]}
          tint={(o) => (picking === "mbti" ? colors.mbti[o] ?? colors.accent : picking === "enneagram" ? colors.cyan : colors.gold)}
          onClose={() => setPicking(null)}
          onPick={(v) => void saveProfile({ [picking]: v })}
        />
      )}
    </Sky>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    tabs: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 22, paddingHorizontal: 16 },
    tab: { alignItems: "center", paddingHorizontal: 14, gap: 8 },
    tabText: { color: c.textTertiary, fontFamily: font.semibold, fontSize: 15 },
    tabLine: { height: 3, alignSelf: "stretch", borderRadius: 2, backgroundColor: "transparent" },
    body: { paddingHorizontal: 16, paddingTop: 18, gap: 22 },
    leave: { alignSelf: "center", paddingVertical: 14, paddingHorizontal: 18 },
    leaveText: { ...type.body, color: c.textTertiary, fontFamily: font.medium, fontSize: 13.5 },
  });
