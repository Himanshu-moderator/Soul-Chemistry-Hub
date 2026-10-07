import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sky } from "@/components/cosmic/Sky";
import { Chip } from "@/components/ui";
import { PERSONALITY_TYPES } from "@/data/mockData";
import { ENNEAGRAM_TYPES, SOCIONICS_TYPES } from "@/data/typeInsights";
import { useApp } from "@/state/AppContext";
import { useAuth } from "@/state/AuthContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { PickSheet, TextEditSheet } from "./components/EditSheets";
import { InsightsSection } from "./components/InsightsSection";
import { OverviewSection, type TypeField } from "./components/OverviewSection";
import { ProfileHeader } from "./components/ProfileHeader";
import { ThemesSection } from "./components/ThemesSection";

type Tab = "Overview" | "Insights" | "Themes";

const PICKERS: Record<TypeField, { title: string; options: string[] }> = {
  mbti: { title: "Your MBTI type", options: PERSONALITY_TYPES.map((t) => t.code) },
  enneagram: { title: "Your Enneagram", options: ENNEAGRAM_TYPES },
  socionics: { title: "Your Socionics type", options: SOCIONICS_TYPES },
};

// Profile: you, your insights and your look.
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { mode, profile, saveProfile, resetDemo } = useApp();
  const { signOut } = useAuth();

  const [tab, setTab] = useState<Tab>("Overview");
  const [editing, setEditing] = useState<"name" | "bio" | null>(null);
  const [picking, setPicking] = useState<TypeField | null>(null);

  const leave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (mode === "demo") await resetDemo();
    await signOut();
    router.replace("/");
  };

  return (
    <Sky variant="subtle">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: insets.bottom + 120, gap: 22 }}>
        <ProfileHeader onEditName={() => setEditing("name")} onEditBio={() => setEditing("bio")} />

        <View style={styles.tabs}>
          {(["Overview", "Insights", "Themes"] as Tab[]).map((t) => (
            <Chip key={t} label={t} selected={tab === t} onPress={() => setTab(t)} />
          ))}
        </View>

        {tab === "Overview" && <OverviewSection onPick={setPicking} />}
        {tab === "Insights" && <InsightsSection />}
        {tab === "Themes" && <ThemesSection />}

        <Pressable accessibilityRole="button" onPress={leave} style={styles.leave}>
          <Text style={styles.leaveText}>{mode === "demo" ? "Exit demo and clear its data" : "Sign out"}</Text>
        </Pressable>
      </ScrollView>

      <TextEditSheet
        visible={editing === "name"}
        title="Your name"
        initial={profile.name}
        maxLength={40}
        onClose={() => setEditing(null)}
        onSave={(v) => void saveProfile({ name: v })}
      />
      <TextEditSheet
        visible={editing === "bio"}
        title="Your bio"
        initial={profile.bio}
        multiline
        maxLength={160}
        onClose={() => setEditing(null)}
        onSave={(v) => void saveProfile({ bio: v })}
      />
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
    tabs: { flexDirection: "row", gap: 8, justifyContent: "center" },
    leave: { alignSelf: "center", paddingVertical: 14, paddingHorizontal: 18 },
    leaveText: { ...type.body, color: c.textTertiary, fontFamily: font.medium, fontSize: 13.5 },
  });
