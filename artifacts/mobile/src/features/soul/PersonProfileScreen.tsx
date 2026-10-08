import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sky } from "@/components/cosmic/Sky";
import { ChemistryRing, TypeBadge } from "@/components/ui";
import { personById, type SoulPerson } from "@/data/people";
import { DirectChat } from "@/features/chats/components/DirectChat";
import { chemistryBetween } from "@/lib/personality";
import { useApp } from "@/state/AppContext";
import { useSoul } from "@/state/SoulContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";
import { InterestGrid } from "./components/InterestGrid";
import { MessageSheet } from "./components/MessageSheet";

type Tab = "about" | "thoughts" | "activities";
const TABS: { key: Tab; label: string }[] = [
  { key: "about", label: "About Me" },
  { key: "thoughts", label: "Thoughts" },
  { key: "activities", label: "Activities" },
];

// A person's own page: cover picture, profile picture, gallery, idols and their
// interest cards, with their thoughts and activity on separate tabs. Opened by
// tapping a profile picture in the Soul deck.
export default function PersonProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = personById(String(id));
  if (!person) return <Missing />;
  return <Profile person={person} />;
}

function Missing() {
  const styles = useStyles(makeStyles);
  return (
    <Sky variant="subtle">
      <View style={styles.missing}>
        <Text style={styles.missingText}>We could not find that profile.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    </Sky>
  );
}

function Profile({ person }: { person: SoulPerson }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useApp();
  const soul = useSoul();
  const [tab, setTab] = useState<Tab>("about");
  const [messaging, setMessaging] = useState<SoulPerson | null>(null);
  const [chatWith, setChatWith] = useState<SoulPerson | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const [dpFailed, setDpFailed] = useState(false);

  const first = person.name.split(" ")[0];
  const pct = chemistryBetween(profile.mbti, person.mbti, person.name.length);
  const status = soul.status(person.id);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)"));
  const like = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (soul.like(person.id) === "match") setChatWith(person);
  };

  return (
    <Sky variant="subtle">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}>
        {/* Cover and profile picture */}
        <View style={styles.cover}>
          {coverFailed ? (
            <LinearGradient colors={person.tones} style={StyleSheet.absoluteFill} />
          ) : (
            <Image source={{ uri: person.cover }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setCoverFailed(true)} />
          )}
          <LinearGradient colors={["rgba(6,5,15,0.5)", "rgba(6,5,15,0)", "rgba(6,5,15,0.85)"]} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={[styles.back, { top: insets.top + 10 }]}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.head}>
          <View style={styles.dpRing}>
            {dpFailed ? (
              <LinearGradient colors={person.tones} style={StyleSheet.absoluteFill} />
            ) : (
              <Image source={{ uri: person.dp }} style={styles.dpImg} onError={() => setDpFailed(true)} />
            )}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{person.name}</Text>
            {person.verified && <Ionicons name="checkmark-circle" size={22} color={colors.cyan} />}
          </View>
          <Text style={styles.facts}>
            {person.age} · {person.city}, India
          </Text>
          <View style={styles.typeRow}>
            <TypeBadge type={person.mbti} />
            <Text style={styles.enn}>Enneagram {person.enneagram}</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={[styles.dot, { backgroundColor: person.isOnline ? colors.success : colors.textTertiary }]} />
            <Text style={styles.statusText}>{person.isOnline ? "Online now" : `Active ${person.lastSeen}`}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <Pressable
                key={t.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTab(t.key);
                }}
                style={styles.tab}
              >
                <Text style={[styles.tabText, on && { color: colors.text }]}>{t.label}</Text>
                <View style={[styles.tabLine, on && { backgroundColor: colors.accent }]} />
              </Pressable>
            );
          })}
        </View>

        {tab === "about" && (
          <View style={styles.body}>
            <View>
              <Text style={styles.sectionLabel}>Soul</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
                {person.photos.map((uri, i) => (
                  <View key={uri} style={styles.shot}>
                    <LinearGradient colors={person.tones} style={StyleSheet.absoluteFill} />
                    <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={`${person.name} photo ${i + 1}`} />
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.card}>
              <ChemistryRing percent={pct} size={72} stroke={7} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.verdict}>{pct >= 88 ? "Our chemistry is great 🧩" : pct >= 75 ? "We could click ✨" : "Different, in a good way 🌗"}</Text>
                <Text style={styles.sub}>
                  {profile.mbti} & {person.mbti}
                </Text>
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.card, styles.tile]}>
                <Text style={styles.tileLabel}>looking for</Text>
                <Text style={styles.tileValue}>{person.relationship}</Text>
              </View>
              <View style={[styles.card, styles.tile]}>
                <Text style={styles.tileLabel}>ask me about</Text>
                <Text style={styles.tileValue}>{person.askMe}</Text>
              </View>
            </View>

            <View style={[styles.card, styles.stack]}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <Text style={styles.about}>{person.about}</Text>
            </View>

            <View style={[styles.card, styles.stack]}>
              <Text style={styles.sectionTitle}>Idols</Text>
              <View style={styles.idols}>
                {person.idols.map((idol) => (
                  <View key={idol.name} style={styles.idol}>
                    <View style={[styles.idolArt, { backgroundColor: withAlpha(colors.accent, 0.16) }]}>
                      <Text style={styles.idolEmoji}>{idol.emoji}</Text>
                    </View>
                    <Text style={styles.idolName} numberOfLines={2}>
                      {idol.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.card, styles.stack]}>
              <Text style={styles.sectionTitle}>My card</Text>
              <InterestGrid interests={person.interests} />
            </View>
          </View>
        )}

        {tab === "thoughts" && (
          <View style={styles.body}>
            {person.thoughts.map((t) => (
              <View key={t.text} style={[styles.card, styles.stack]}>
                <Text style={styles.about}>{t.text}</Text>
                <Text style={styles.when}>{t.when}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === "activities" && (
          <View style={styles.body}>
            {person.activities.map((a) => (
              <View key={a.text} style={styles.activity}>
                <View style={[styles.activityIcon, { backgroundColor: withAlpha(colors.accent, 0.16) }]}>
                  <Text style={{ fontSize: 18 }}>{a.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityText}>{a.text}</Text>
                  <Text style={styles.when}>{a.when}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating actions */}
      <View pointerEvents="box-none" style={[styles.dock, { bottom: insets.bottom + 18 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Chat with ${first}`} onPress={() => (status === "connected" ? setChatWith(person) : setMessaging(person))} style={styles.chatBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
          <Text style={styles.chatText}>{status === "connected" ? "Chat" : status === "pending" ? "Message" : "Chat"}</Text>
        </Pressable>
        {status === "none" && (
          <Pressable accessibilityRole="button" accessibilityLabel={`Like ${first}`} onPress={like} style={styles.likeBtn}>
            <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 28 }]} />
            <Ionicons name="heart" size={24} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      <MessageSheet person={messaging} onClose={() => setMessaging(null)} onSuperchat={setChatWith} />
      <DirectChat contact={chatWith} onClose={() => setChatWith(null)} />
    </Sky>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    missingText: { ...type.body, color: c.textSecondary },
    link: { color: c.accent, fontFamily: font.semibold, fontSize: 15 },

    cover: { height: 230, backgroundColor: c.surface },
    back: { position: "absolute", left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(10,8,24,0.55)", alignItems: "center", justifyContent: "center" },
    head: { alignItems: "center", marginTop: -52, paddingHorizontal: 20, gap: 6 },
    dpRing: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: c.bg, overflow: "hidden", backgroundColor: c.surfaceStrong },
    dpImg: { width: "100%", height: "100%" },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
    name: { ...type.title, color: c.text },
    facts: { ...type.body, color: c.textSecondary },
    typeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    enn: { color: c.textSecondary, fontFamily: font.medium, fontSize: 13 },
    statusPill: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: c.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { color: c.textSecondary, fontFamily: font.medium, fontSize: 12.5 },

    tabs: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 20, paddingHorizontal: 16 },
    tab: { alignItems: "center", paddingHorizontal: 14, gap: 8 },
    tabText: { color: c.textTertiary, fontFamily: font.semibold, fontSize: 15 },
    tabLine: { height: 3, alignSelf: "stretch", borderRadius: 2, backgroundColor: "transparent" },

    body: { paddingHorizontal: 16, paddingTop: 18, gap: 12 },
    sectionLabel: { color: c.textTertiary, fontFamily: font.medium, fontSize: 14, marginBottom: 10, paddingLeft: 4 },
    gallery: { gap: 12, paddingRight: 8 },
    shot: { width: 150, height: 214, borderRadius: 22, overflow: "hidden", backgroundColor: c.surface },

    card: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: c.surface, borderRadius: radius.xl, padding: 18, borderWidth: 1, borderColor: c.border },
    stack: { flexDirection: "column", alignItems: "stretch", gap: 12 },
    verdict: { color: c.accent, fontFamily: font.semibold, fontSize: 16 },
    sub: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14 },
    twoCol: { flexDirection: "row", gap: 12 },
    tile: { flex: 1, flexDirection: "column", alignItems: "flex-start", gap: 6, padding: 16 },
    tileLabel: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12 },
    tileValue: { color: c.text, fontFamily: font.semibold, fontSize: 15, lineHeight: 20 },
    sectionTitle: { ...type.heading, color: c.text },
    about: { ...type.body, color: c.text },
    when: { ...type.caption, color: c.textTertiary },

    idols: { flexDirection: "row", gap: 14 },
    idol: { flex: 1, alignItems: "center", gap: 8 },
    idolArt: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
    idolEmoji: { fontSize: 28 },
    idolName: { color: c.textSecondary, fontFamily: font.medium, fontSize: 12.5, textAlign: "center" },

    activity: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: c.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: c.border },
    activityIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
    activityText: { color: c.text, fontFamily: font.medium, fontSize: 15 },

    dock: { position: "absolute", left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 14 },
    chatBtn: { flexDirection: "row", alignItems: "center", gap: 8, height: 54, paddingHorizontal: 34, borderRadius: 27, backgroundColor: "#3A394C", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
    chatText: { color: "#FFFFFF", fontFamily: font.semibold, fontSize: 16 },
    likeBtn: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  });
