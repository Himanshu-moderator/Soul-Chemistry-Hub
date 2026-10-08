import React, { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sky } from "@/components/cosmic/Sky";
import { Avatar, Card, Chip, CoinPill, IconButton } from "@/components/ui";
import { FAMOUS_PEOPLE, PERSONALITY_TYPES } from "@/data/mockData";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { groupedRow } from "@/components/ui/grouped";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { CheckinSheet } from "./components/CheckinSheet";
import { PersonRow } from "./components/PersonRow";
import { TypeWikiSheet } from "./components/TypeWikiSheet";

type Filter = "All" | "Trending" | "Following" | string; // string = a type code

const TYPE_FILTERS = PERSONALITY_TYPES.map((t) => t.code);

// Explore: who's who in the world of personality types.
export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { profile, coins, followedPeople, toggleFollow, dailyCheckinDone, claimCheckin } = useApp();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [checkin, setCheckin] = useState(false);
  const [wiki, setWiki] = useState(false);

  const people = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAMOUS_PEOPLE.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.job.toLowerCase().includes(q)) return false;
      if (filter === "Trending") return p.trending;
      if (filter === "Following") return followedPeople.includes(p.id);
      if (filter !== "All") return p.mbti === filter;
      return true;
    });
  }, [search, filter, followedPeople]);

  const firstName = profile.name.split(" ")[0];

  const quick: { icon: keyof typeof Feather.glyphMap; title: string; sub: string; onPress: () => void }[] = [
    { icon: "star", title: `Famous ${profile.mbti}`, sub: "People like you", onPress: () => setFilter(profile.mbti) },
    { icon: "heart", title: "Chemistry", sub: "Who fits you", onPress: () => router.push("/(tabs)/soul") },
    { icon: "book-open", title: `${profile.mbti} guide`, sub: "Strengths & growth", onPress: () => setWiki(true) },
    { icon: "users", title: "Communities", sub: "Find your people", onPress: () => router.push("/(tabs)/chats") },
  ];

  const header = (
    <View style={{ gap: 18 }}>
      <View style={styles.top}>
        <Pressable onPress={() => router.push("/(tabs)/profile")} style={styles.who}>
          <Avatar name={profile.name} size={44} mbti={profile.mbti} />
          <View>
            <Text style={styles.hello}>Hi, {firstName} 👋</Text>
            <Text style={styles.helloSub}>Discover your people</Text>
          </View>
        </Pressable>
        <View style={styles.topRight}>
          <CoinPill amount={coins} />
        </View>
      </View>

      <View style={styles.search}>
        <Feather name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search people and characters"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={10}>
            <Feather name="x" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }} style={{ marginHorizontal: -20, paddingLeft: 20, flexGrow: 0, flexShrink: 0, marginBottom: 10 }}>
        {quick.map((t) => (
          <Pressable key={t.title} onPress={t.onPress} style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.97 }] }]}>
            <View style={styles.tileIcon}>
              <Feather name={t.icon} size={18} color={colors.accent} />
            </View>
            <Text style={styles.tileTitle}>{t.title}</Text>
            <Text style={styles.tileSub}>{t.sub}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable onPress={() => !dailyCheckinDone && setCheckin(true)}>
        <Card tinted padding={16}>
          <View style={styles.checkin}>
            <Text style={styles.checkinEmoji}>{dailyCheckinDone ? "✅" : "✨"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkinTitle}>{dailyCheckinDone ? "You're checked in today" : "Daily check-in"}</Text>
              <Text style={styles.checkinSub}>
                {dailyCheckinDone ? `${profile.streak} day streak · come back tomorrow` : "Answer one question, earn coins, keep your streak"}
              </Text>
            </View>
            {!dailyCheckinDone && <Feather name="chevron-right" size={20} color={colors.text} />}
          </View>
        </Card>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }} style={{ marginHorizontal: -20, paddingLeft: 20 }}>
        {(["All", "Trending", "Following", ...TYPE_FILTERS] as Filter[]).map((f) => (
          <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Sky variant="subtle">
      <FlatList
        data={people}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 120 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🔭</Text>
            <Text style={styles.emptyTitle}>Nobody here yet</Text>
            <Text style={styles.emptySub}>{filter === "Following" ? "Follow someone and they'll show up here." : "Try a different search or filter."}</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={groupedRow(colors, index, people.length)}>
            <PersonRow person={item} following={followedPeople.includes(item.id)} onToggleFollow={() => toggleFollow(item.id)} />
          </View>
        )}
      />

      <CheckinSheet visible={checkin} onClose={() => setCheckin(false)} onCorrect={(c) => void claimCheckin(c)} />
      <TypeWikiSheet visible={wiki} onClose={() => setWiki(false)} mbti={profile.mbti} />
    </Sky>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    who: { flexDirection: "row", alignItems: "center", gap: 12 },
    hello: { color: c.text, fontFamily: font.bold, fontSize: 18, letterSpacing: -0.3 },
    helloSub: { color: c.textSecondary, fontFamily: font.regular, fontSize: 13 },
    topRight: { flexDirection: "row", alignItems: "center", gap: 10 },
    search: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderRadius: radius.pill, paddingHorizontal: 18 },
    searchInput: { flex: 1, color: c.text, fontFamily: font.regular, fontSize: 15, paddingVertical: 14, outlineStyle: "none" } as object,
    tile: { width: 148, borderRadius: radius.xl, padding: 14, gap: 3, overflow: "hidden", backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    tileIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.accentSoft, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    tileTitle: { color: c.text, fontFamily: font.semibold, fontSize: 15 },
    tileSub: { color: c.textSecondary, fontFamily: font.regular, fontSize: 12 },
    checkin: { flexDirection: "row", alignItems: "center", gap: 12 },
    checkinEmoji: { fontSize: 28 },
    checkinTitle: { ...type.bodyStrong, color: c.text },
    checkinSub: { ...type.caption, color: c.textSecondary, marginTop: 1 },
    empty: { alignItems: "center", gap: 6, paddingVertical: 50 },
    emptyTitle: { ...type.heading, color: c.text },
    emptySub: { ...type.body, color: c.textSecondary, textAlign: "center" },
  });
