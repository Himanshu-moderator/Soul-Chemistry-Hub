import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sky } from "@/components/cosmic/Sky";
import { Button, Sheet } from "@/components/ui";
import { PERSONALITY_TYPES } from "@/data/mockData";
import { SOUL_PEOPLE, type Interest } from "@/data/people";
import { ENNEAGRAM_TYPES, SOCIONICS_TYPES } from "@/data/typeInsights";
import { pickPhoto } from "@/lib/pickImage";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";
import { PickSheet, TextEditSheet } from "./components/EditSheets";
import type { TypeField } from "./components/OverviewSection";

const MAX_PHOTOS = 6;
const MAX_INTERESTS = 12;

// Every interest the sample people use, so there is a good list to choose from.
const INTEREST_CATALOG: Interest[] = Array.from(new Map(SOUL_PEOPLE.flatMap((p) => p.interests).map((i) => [i.label, i])).values());

type TextField = "name" | "bio" | "profession" | "education" | "languages" | "location" | "relationship" | "askMe" | "idols";
const TEXT: Record<TextField, { title: string; max: number; multiline?: boolean; hint?: string }> = {
  name: { title: "Your name", max: 40 },
  bio: { title: "Bio", max: 300, multiline: true },
  profession: { title: "Profession", max: 60 },
  education: { title: "Education", max: 60 },
  languages: { title: "Languages", max: 80 },
  location: { title: "Location", max: 50 },
  relationship: { title: "Looking for", max: 40 },
  askMe: { title: "Ask me about", max: 60 },
  idols: { title: "Idols (up to 3, separated by commas)", max: 100 },
};

const PICKERS: Record<TypeField, { title: string; options: string[] }> = {
  mbti: { title: "Your MBTI type", options: PERSONALITY_TYPES.map((t) => t.code) },
  enneagram: { title: "Your Enneagram", options: ENNEAGRAM_TYPES },
  socionics: { title: "Your Socionics type", options: SOCIONICS_TYPES },
};

const IDOL_EMOJI = ["🌟", "💫", "🔥"];

// Edit profile: photos, bio, your card and the details people see on your page.
// Every change is saved straight away.
export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { profile, saveProfile } = useApp();

  const [editing, setEditing] = useState<TextField | null>(null);
  const [picking, setPicking] = useState<TypeField | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/profile" as never));

  // ---- photos
  const setPhoto = async (index: number) => {
    const uri = await pickPhoto([3, 4]);
    if (!uri) return;
    const next = [...profile.photos];
    if (index < next.length) next[index] = uri;
    else next.push(uri);
    void saveProfile({ photos: next });
  };
  const removePhoto = (index: number) => void saveProfile({ photos: profile.photos.filter((_, i) => i !== index) });
  const setSingle = async (field: "cover" | "dp", aspect: [number, number]) => {
    const uri = await pickPhoto(aspect);
    if (uri) void saveProfile({ [field]: uri });
  };

  // ---- text rows
  const valueOf = (f: TextField): string => (f === "idols" ? profile.idols.map((i) => i.name).join(", ") : String(profile[f] ?? ""));
  const saveText = (f: TextField, v: string) => {
    if (f === "idols") {
      const names = v.split(",").map((n) => n.trim()).filter(Boolean).slice(0, 3);
      void saveProfile({ idols: names.map((name, i) => ({ name, emoji: profile.idols.find((o) => o.name === name)?.emoji ?? IDOL_EMOJI[i % 3] })) });
    } else {
      void saveProfile({ [f]: v });
    }
  };

  const toggleInterest = (it: Interest) => {
    Haptics.selectionAsync();
    const has = profile.interests.some((x) => x.label === it.label);
    if (!has && profile.interests.length >= MAX_INTERESTS) return;
    void saveProfile({ interests: has ? profile.interests.filter((x) => x.label !== it.label) : [...profile.interests, it] });
  };

  const Row = ({ label, value, onPress, last }: { label: string; value?: string; onPress: () => void; last?: boolean }) => (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.row, !last && styles.rowLine]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value || "Add"}
      </Text>
      <Feather name="chevron-right" size={18} color={colors.textTertiary} />
    </Pressable>
  );

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => profile.photos[i] ?? null);

  return (
    <Sky variant="subtle">
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.heading}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, gap: 14 }}>
        <Pressable accessibilityRole="button" onPress={back} style={styles.preview}>
          <Feather name="eye" size={17} color={colors.accent} />
          <Text style={styles.previewText}>View my profile</Text>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.grid}>
            {slots.map((uri, i) => (
              <View key={i} style={styles.slot}>
                {uri ? (
                  <>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Replace photo ${i + 1}`} onPress={() => setPhoto(i)} style={StyleSheet.absoluteFill}>
                      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remove photo ${i + 1}`} onPress={() => removePhoto(i)} style={styles.remove}>
                      <Feather name="x" size={14} color="#FFFFFF" />
                    </Pressable>
                  </>
                ) : (
                  <Pressable accessibilityRole="button" accessibilityLabel="Add photo" onPress={() => setPhoto(profile.photos.length)} style={styles.empty}>
                    <Feather name="plus" size={26} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <View style={styles.pair}>
            <Pressable accessibilityRole="button" onPress={() => setSingle("dp", [1, 1])} style={styles.pairItem}>
              <View style={styles.dp}>{profile.dp ? <Image source={{ uri: profile.dp }} style={{ width: "100%", height: "100%" }} /> : <Feather name="user" size={22} color={colors.textTertiary} />}</View>
              <Text style={styles.pairText}>Profile picture</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setSingle("cover", [16, 9])} style={styles.pairItem}>
              <View style={styles.coverThumb}>{profile.cover ? <Image source={{ uri: profile.cover }} style={{ width: "100%", height: "100%" }} /> : <Feather name="image" size={22} color={colors.textTertiary} />}</View>
              <Text style={styles.pairText}>Cover picture</Text>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={() => setVerifyOpen(true)} style={styles.verify}>
            <Text style={[styles.rowLabel, { width: undefined, flex: 1 }]}>Verify my profile</Text>
            {profile.verified ? (
              <View style={styles.verified}>
                <Ionicons name="checkmark-circle" size={16} color={colors.cyan} />
                <Text style={[styles.rowValue, { flex: 0, color: colors.cyan }]}>Verified</Text>
              </View>
            ) : (
              <Text style={[styles.rowValue, { flex: 0, color: colors.accent }]}>Start</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.card}>
          <Row label="Name" value={profile.name} onPress={() => setEditing("name")} />
          <Row label="Bio" value={profile.bio} onPress={() => setEditing("bio")} />
          <Pressable accessibilityRole="button" onPress={() => setCardOpen(true)} style={[styles.row, styles.rowLine]}>
            <Text style={styles.rowLabel}>Card</Text>
            <Text style={[styles.rowValue, { fontSize: 20 }]} numberOfLines={1}>
              {profile.interests.length ? profile.interests.slice(0, 6).map((i) => i.emoji).join(" ") : "Add"}
            </Text>
            <Feather name="chevron-right" size={18} color={colors.textTertiary} />
          </Pressable>
          <Row label="Idols" value={valueOf("idols")} onPress={() => setEditing("idols")} />
          <Row label="Looking for" value={profile.relationship} onPress={() => setEditing("relationship")} />
          <Row label="Ask me about" value={profile.askMe} onPress={() => setEditing("askMe")} last />
        </View>

        <View style={styles.card}>
          <Row label="Profession" value={profile.profession} onPress={() => setEditing("profession")} />
          <Row label="Education" value={profile.education} onPress={() => setEditing("education")} />
          <Row label="Languages" value={profile.languages} onPress={() => setEditing("languages")} />
          <Row label="Location" value={profile.location} onPress={() => setEditing("location")} last />
        </View>

        <View style={styles.card}>
          <Row label="MBTI" value={profile.mbti} onPress={() => setPicking("mbti")} />
          <Row label="Enneagram" value={profile.enneagram} onPress={() => setPicking("enneagram")} />
          <Row label="Socionics" value={profile.socionics} onPress={() => setPicking("socionics")} last />
        </View>
      </ScrollView>

      {editing && (
        <TextEditSheet
          visible
          title={TEXT[editing].title}
          initial={valueOf(editing)}
          multiline={TEXT[editing].multiline}
          maxLength={TEXT[editing].max}
          onClose={() => setEditing(null)}
          onSave={(v) => saveText(editing, v)}
        />
      )}

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

      <Sheet visible={cardOpen} onClose={() => setCardOpen(false)} title={`Your card (${profile.interests.length}/${MAX_INTERESTS})`}>
        <Text style={styles.sheetSub}>Pick the hobbies, music, food and values that describe you.</Text>
        <View style={styles.chips}>
          {INTEREST_CATALOG.map((it) => {
            const on = profile.interests.some((x) => x.label === it.label);
            return (
              <Pressable
                key={it.label}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => toggleInterest(it)}
                style={[styles.chip, { backgroundColor: on ? withAlpha(colors.accent, 0.2) : colors.surface, borderColor: on ? colors.accent : colors.border }]}
              >
                <Text style={styles.chipText}>
                  {it.emoji} {it.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Button label="Done" onPress={() => setCardOpen(false)} />
      </Sheet>

      <Sheet visible={verifyOpen} onClose={() => setVerifyOpen(false)} title="Verify my profile">
        <Text style={styles.sheetSub}>
          {profile.verified
            ? "Your profile is verified. People see a blue tick next to your name."
            : "In the full app you would take a quick selfie so we can match it to your photos. This is a prototype, so you can verify with one tap."}
        </Text>
        {!profile.verified && (
          <Button
            label="Verify now"
            onPress={() => {
              void saveProfile({ verified: true });
              setVerifyOpen(false);
            }}
          />
        )}
      </Sheet>
    </Sky>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
    heading: { ...type.heading, color: c.text },
    preview: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.surface, borderRadius: radius.lg, paddingVertical: 14, borderWidth: 1, borderColor: c.border },
    previewText: { color: c.accent, fontFamily: font.semibold, fontSize: 15 },
    card: { backgroundColor: c.surface, borderRadius: radius.xl, padding: 14, borderWidth: 1, borderColor: c.border },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    slot: { width: "31%", aspectRatio: 3 / 4, borderRadius: 16, overflow: "hidden", backgroundColor: c.surfaceStrong },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderStyle: "dashed", borderColor: c.border, borderRadius: 16 },
    remove: { position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(10,8,24,0.7)", alignItems: "center", justifyContent: "center" },
    pair: { flexDirection: "row", gap: 12, marginTop: 14 },
    pairItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surfaceStrong, borderRadius: radius.md, padding: 10 },
    pairText: { color: c.text, fontFamily: font.medium, fontSize: 13.5, flex: 1 },
    dp: { width: 44, height: 44, borderRadius: 22, overflow: "hidden", backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
    coverThumb: { width: 56, height: 34, borderRadius: 8, overflow: "hidden", backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
    verify: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.border },
    verified: { flexDirection: "row", alignItems: "center", gap: 6 },
    row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 4 },
    rowLine: { borderBottomWidth: 1, borderBottomColor: c.border },
    rowLabel: { color: c.text, fontFamily: font.semibold, fontSize: 15, width: 104 },
    rowValue: { color: c.textSecondary, fontFamily: font.regular, fontSize: 14, flex: 1, textAlign: "right" },
    sheetSub: { color: c.textSecondary, fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1 },
    chipText: { color: c.text, fontFamily: font.medium, fontSize: 13.5 },
  });
