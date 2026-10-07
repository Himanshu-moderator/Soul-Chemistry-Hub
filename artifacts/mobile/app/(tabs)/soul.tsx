import { bestPairs } from "@/lib/personality";
import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { CONNECTIONS, MY_PROFILE, PERSONALITY_TYPES } from "@/data/mockData";
import { AvatarCircle } from "@/components/AvatarCircle";
import { TypeBadge } from "@/components/TypeBadge";
import { useApp } from "@/context/AppContext";

type SoulView = "main" | "visitors" | "wonder" | "bubbles" | "paper" | "preferences";

// Mock visitors data (like PDB "89 visits")
const VISITORS = [
  { id: "v1", name: "Medusa_182", mbti: "INTJ", flag: "🇮🇳", visits: 1, time: "16:13", blurred: false },
  { id: "v2", name: "???", mbti: "???", flag: "🐾", visits: 2, time: "Sun", blurred: true, note: "She visited you quietly", cta: "See who" },
  { id: "v3", name: "shreyaayayaya", mbti: "INTJ", flag: "🇮🇳", visits: 1, time: "Friday 15:27", blurred: false },
  { id: "v4", name: "???", mbti: "???", flag: "🐾", visits: 2, time: "Fri", blurred: true, note: "She's seeking someone from Uttar Pradesh", cta: "Talk to her" },
  { id: "v5", name: "ˢtadis☆", mbti: "ISFP", flag: "🇮🇩", visits: 1, time: "March 18 01:52", blurred: false },
  { id: "v6", name: "Kairo.exe", mbti: "ENTP", flag: "🇺🇸", visits: 1, time: "March 14", blurred: false },
];

const VISITOR_STATS = [
  { label: "this month", count: 22, flag: "🐾" },
  { label: "visits", count: 64, flag: "🇮🇳" },
  { label: "visits", count: 5, flag: "🇳🇵" },
  { label: "visits", count: 4, flag: "🇲🇾" },
];

const TYPE_BUBBLES = [
  { code: "xnfj", color: "#A78BFA", x: 60, y: 80, size: 60 },
  { code: "xsfj", color: "#60A5FA", x: 160, y: 60, size: 55 },
  { code: "xsfp", color: "#F472B6", x: 270, y: 50, size: 50 },
  { code: "xstj", color: "#FBBF24", x: 130, y: 160, size: 58, hasSaturn: true },
  { code: "xnfp", color: "#34D399", x: 40, y: 220, size: 52 },
  { code: "xstp", color: "#818CF8", x: 200, y: 190, size: 48 },
  { code: "xntj", color: "#FB923C", x: 50, y: 310, size: 56 },
  { code: "xntp", color: "#6EE7B7", x: 200, y: 300, size: 50 },
  { code: "All", color: "#F87171", x: 280, y: 220, size: 80, isAll: true },
];

const WONDER_PROMPTS = [
  "Connecting like-minded souls...",
  "Finding your type twin...",
  "The universe is aligning...",
];

export default function SoulScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isPremium } = useApp();
  const [view, setView] = useState<SoulView>("main");
  const [wonderActive, setWonderActive] = useState(false);
  const [openToFriends, setOpenToFriends] = useState(true);
  const [bubbleMsg, setBubbleMsg] = useState("");
  const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
  const [prefVisible, setPrefVisible] = useState(false);
  const [prefGender, setPrefGender] = useState<"male" | "female" | "all">("all");
  const [detailPerson, setDetailPerson] = useState<typeof CONNECTIONS[0] | null>(null);

  // Floating bubble animations
  const bubbleAnims = useRef(TYPE_BUBBLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = bubbleAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 2000 + i * 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2000 + i * 300, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  const totalVisits = 89;

  if (view === "visitors") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setView("main")}>
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={[styles.visitorsContent, { paddingBottom: insets.bottom + 100 }]}>
          <View style={styles.visitorsHero}>
            <Text style={{ fontSize: 40 }}>🐾</Text>
            <Text style={styles.visitsBigNum}>{totalVisits} visits</Text>
            <Text style={styles.visitsSub}>They have been secretly supporting you</Text>
          </View>
          {/* Stats row */}
          <View style={styles.visitorStatsRow}>
            {VISITOR_STATS.map((s, i) => (
              <View key={i} style={styles.visitorStatCard}>
                <Text style={styles.visitorStatFlag}>{s.flag}</Text>
                <Text style={styles.visitorStatCount}>{s.count}</Text>
                <Text style={styles.visitorStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          {/* Visitor list */}
          {VISITORS.map((v) => (
            <View key={v.id} style={styles.visitorRow}>
              {v.blurred ? (
                <View style={[styles.visitorAvatarBlur, { alignItems: "center", justifyContent: "center" }]}>
                  <Text style={{ fontSize: 22 }}>🐾</Text>
                </View>
              ) : (
                <AvatarCircle name={v.name} size={46} mbti={v.mbti} />
              )}
              <View style={styles.visitorInfo}>
                {v.blurred ? (
                  <>
                    <Text style={styles.visitorNote}>{v.note}</Text>
                    <Text style={styles.visitorTime}>🐾 {v.visits} visit · {v.time}</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.visitorNameRow}>
                      <Text style={styles.visitorName}>{v.name}</Text>
                      <Ionicons name="paw" size={12} color={COLORS.accent} />
                      <Text style={styles.visitorMbti}>{v.mbti}</Text>
                      <Text>{v.flag}</Text>
                    </View>
                    <Text style={styles.visitorTime}>{v.time}</Text>
                  </>
                )}
              </View>
              <View style={styles.visitorRight}>
                {v.blurred ? (
                  <TouchableOpacity style={styles.ctaBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <Text style={styles.ctaBtnText}>{v.cta}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pawCount}>
                    <Text style={styles.pawCountText}>{v.visits}</Text>
                    <Text style={{ fontSize: 12 }}>🐾</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
          {!isPremium && (
            <TouchableOpacity style={styles.seeWhoBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <Text style={styles.seeWhoBtnText}>👀 See who visited you</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  if (view === "wonder") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.wonderHeader}>
          <TouchableOpacity onPress={() => setView("main")}>
            <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.wonderTitle}>Wonder Chat</Text>
          <TouchableOpacity>
            <Feather name="settings" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        {!wonderActive ? (
          <View style={styles.wonderOff}>
            <View style={styles.wonderToggleRow}>
              <Switch
                value={wonderActive}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setWonderActive(v); }}
                trackColor={{ false: "#2A2A35", true: COLORS.accentGreen }}
                thumbColor="#FFF"
              />
              <Text style={styles.wonderToggleText}>Wonder Chat turned off</Text>
            </View>
            <Text style={styles.wonderBigText}>Connecting{"\n"}like-minded souls...</Text>
            <Text style={styles.wonderDesc}>
              What's Wonder Chat?{"\n"}
              Wonder Chat is an anonymous chat feature for connecting with like-minded people. You reveal yourselves only if both agree ✨
            </Text>
          </View>
        ) : (
          <View style={styles.wonderActive}>
            <View style={[styles.wonderToggleRow, { backgroundColor: COLORS.accentGreen + "20" }]}>
              <Switch
                value={wonderActive}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setWonderActive(v); }}
                trackColor={{ false: "#2A2A35", true: COLORS.accentGreen }}
                thumbColor="#FFF"
              />
              <Text style={[styles.wonderToggleText, { color: COLORS.accentGreen }]}>Wonder Chat turned on</Text>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accentGreen} />
            </View>
            <Text style={styles.wonderBigText}>Connecting{"\n"}like-minded souls...</Text>
            <View style={styles.wonderDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.wonderDot, { opacity: 0.3 + i * 0.35 }]} />
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }

  if (view === "bubbles") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.wonderHeader}>
          <TouchableOpacity onPress={() => setView("main")}>
            <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.wonderTitle}>Thought Bubbles</Text>
          <View style={styles.switcherRow}>
            <TouchableOpacity style={styles.switcherPill}><Text style={styles.switcherPillText}>send</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.switcherPill, { backgroundColor: COLORS.bgTertiary }]}><Text style={[styles.switcherPillText, { color: COLORS.textSecondary }]}>my bubbles</Text></TouchableOpacity>
          </View>
        </View>
        <View style={styles.bubblesCanvas}>
          {TYPE_BUBBLES.map((b, i) => {
            const translateY = bubbleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
            const isSelected = selectedBubble === b.code;
            return (
              <Animated.View
                key={b.code}
                style={[
                  styles.bubble,
                  {
                    left: b.x,
                    top: b.y,
                    width: b.size,
                    height: b.size,
                    borderRadius: b.size / 2,
                    backgroundColor: b.color + (isSelected ? "EE" : "66"),
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: b.color,
                    transform: [{ translateY }],
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.bubbleTap}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedBubble(isSelected ? null : b.code); }}
                >
                  <Text style={styles.bubbleText}>{b.code}</Text>
                  {b.hasSaturn && <Text style={{ fontSize: 10 }}>🪐</Text>}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
        <View style={[styles.bubblesInputArea, { paddingBottom: insets.bottom + 90 }]}>
          <Text style={styles.bubblesTarget}>send to {selectedBubble || "all"} planet, girls ⇌</Text>
          <View style={styles.bubblesInputRow}>
            <TextInput
              style={styles.bubblesInput}
              value={bubbleMsg}
              onChangeText={setBubbleMsg}
              placeholder="ask a question, someone from the stars might answer..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
            />
            <TouchableOpacity
              style={styles.bubblesBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setBubbleMsg(""); }}
            >
              <Feather name="send" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.othersAsk}>others are asking: "shall i compare thee to a summer's day?"</Text>
        </View>
      </View>
    );
  }

  if (view === "paper") {
    return (
      <View style={[styles.container]}>
        <View style={[styles.paperCanvas, { paddingTop: insets.top }]}>
          <TouchableOpacity style={{ position: "absolute", top: insets.top + 12, left: 16 }} onPress={() => setView("main")}>
            <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {CONNECTIONS.slice(0, 6).map((c, i) => {
            const positions = [
              { x: 40, y: 80 }, { x: 210, y: 60 },
              { x: 30, y: 200 }, { x: 200, y: 190 },
              { x: 50, y: 340 }, { x: 210, y: 310 },
            ];
            const pos = positions[i];
            const isRed = i % 2 === 1;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.paperPerson, { left: pos.x, top: pos.y }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDetailPerson(c); }}
              >
                <View style={[styles.paperAirplane, { borderTopColor: isRed ? "#F87171" : "#60A5FA", borderRightColor: isRed ? "#F87171" : "#60A5FA" }]} />
                <AvatarCircle name={c.name} size={46} mbti={c.mbti} />
                <View style={styles.paperTypeBubble}>
                  <Text style={styles.paperTypeText}>{c.mbti}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Bottom actions */}
        <View style={[styles.paperActions, { paddingBottom: insets.bottom + 90 }]}>
          {[
            { icon: "shuffle", label: "Shuffle" },
            { icon: "feather", label: "Catch One" },
            { icon: "send", label: "Edit Mine" },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.paperActionBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Feather name={a.icon as any} size={22} color={COLORS.textSecondary} />
              <Text style={styles.paperActionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Send signal modal */}
        {detailPerson && (
          <Modal visible transparent animationType="slide" onRequestClose={() => setDetailPerson(null)}>
            <Pressable style={styles.paperModalBack} onPress={() => setDetailPerson(null)}>
              <View style={styles.paperModal}>
                <Text style={styles.paperModalTag}>#Internet &gt;</Text>
                <TouchableOpacity style={styles.paperModalClose} onPress={() => setDetailPerson(null)}>
                  <Feather name="x" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <View style={styles.paperModalUser}>
                  <AvatarCircle name={detailPerson.name} size={40} mbti={detailPerson.mbti} />
                  <View>
                    <Text style={styles.paperModalName}>{detailPerson.name} 🇮🇳</Text>
                    <Text style={styles.paperModalMbti}>♂ {detailPerson.mbti}</Text>
                  </View>
                </View>
                <TextInput
                  style={styles.paperModalInput}
                  placeholder="send a signal and meet wonders"
                  placeholderTextColor={COLORS.textTertiary}
                  multiline
                />
                <View style={styles.photoArea}>
                  <Feather name="image" size={22} color={COLORS.textTertiary} />
                  <Text style={styles.photoAreaText}>Add your photo here</Text>
                </View>
                <Text style={styles.topicsLabel}>Topics</Text>
                <View style={styles.topicsDivider} />
                <TouchableOpacity style={styles.sendSignalBtn} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setDetailPerson(null); }}>
                  <Feather name="send" size={16} color="#FFF" />
                  <Text style={styles.sendSignalText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recallBtn} onPress={() => setDetailPerson(null)}>
                  <Ionicons name="refresh" size={14} color={COLORS.textTertiary} />
                  <Text style={styles.recallText}>Recall my paper airplane</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        )}
      </View>
    );
  }

  // Main Soul Hub
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.mainContent, { paddingBottom: insets.bottom + 100 }]}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <View>
            <Text style={styles.mainTitle}>Soul</Text>
            <Text style={styles.mainSub}>Find your people & connections</Text>
          </View>
          <TouchableOpacity style={styles.prefBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPrefVisible(true); }}>
            <Feather name="sliders" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Visitor card */}
        <TouchableOpacity style={styles.visitorCard} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setView("visitors"); }}>
          <View style={styles.visitorCardLeft}>
            <Text style={{ fontSize: 28 }}>🐾</Text>
            <View>
              <Text style={styles.visitorCardNum}>{totalVisits} visits</Text>
              <Text style={styles.visitorCardSub}>See who stopped by</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.textTertiary} />
        </TouchableOpacity>

        {/* Chemistry section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Connections</Text>
          <TouchableOpacity><Text style={styles.sectionAction}>See All</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.connectionsRow}>
          {CONNECTIONS.map((c) => {
            const typeColor = (COLORS.MBTI as Record<string, string>)[c.mbti] || COLORS.accent;
            return (
              <TouchableOpacity key={c.id} style={styles.connectionCard} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <AvatarCircle name={c.name} size={52} mbti={c.mbti} isOnline={c.isOnline} />
                <View style={[styles.chemBadge, { backgroundColor: typeColor + "25" }]}>
                  <Text style={[styles.chemNum, { color: typeColor }]}>{c.chemistry}%</Text>
                </View>
                <Text style={styles.connName} numberOfLines={1}>{c.name.split(" ")[0]}</Text>
                <View style={[styles.connTypePill, { backgroundColor: typeColor + "20", borderColor: typeColor + "50" }]}>
                  <Text style={[styles.connTypeTxt, { color: typeColor }]}>{c.mbti}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Soul Features */}
        <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Discover</Text>
        <View style={styles.featuresGrid}>
          {[
            { icon: "🌙", label: "Wonder Chat", sub: "Anonymous · Connect", onPress: () => setView("wonder"), color: "#4C1D95" },
            { icon: "🐾", label: "Paper Airplane", sub: "Send signals · Float", onPress: () => setView("paper"), color: "#1E3A5F" },
            { icon: "🫧", label: "Thought Bubbles", sub: "Ask · Type planets", onPress: () => setView("bubbles"), color: "#064E3B" },
            { icon: "👀", label: "Who Noticed", sub: `${totalVisits} secret visits`, onPress: () => setView("visitors"), color: "#7C2D12" },
          ].map((f) => (
            <TouchableOpacity key={f.label} style={[styles.featureCard, { backgroundColor: f.color }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); f.onPress(); }}>
              <Text style={{ fontSize: 28 }}>{f.icon}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureSub}>{f.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Open to friends toggle */}
        <View style={styles.friendsToggle}>
          <View style={styles.friendsLeft}>
            <Text style={styles.friendsTitle}>Open to make new friends</Text>
            <Text style={styles.friendsSub}>Let new friends discover you · Toggle anytime</Text>
          </View>
          <Switch
            value={openToFriends}
            onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOpenToFriends(v); }}
            trackColor={{ false: "#2A2A35", true: COLORS.accentGreen }}
            thumbColor="#FFF"
          />
        </View>

        {/* Compatibility pairs */}
        <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Your Best Chemistry Types</Text>
        {bestPairs(profile.mbti).map((pair, i) => {
          const c1 = (COLORS.MBTI as Record<string, string>)[pair.type1] || COLORS.accent;
          const c2 = (COLORS.MBTI as Record<string, string>)[pair.type2] || COLORS.accentBlue;
          return (
            <TouchableOpacity key={i} style={styles.pairRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={[styles.pairTypePill, { backgroundColor: c1 + "20", borderColor: c1 + "50" }]}>
                <Text style={[styles.pairTypeText, { color: c1 }]}>{pair.type1}</Text>
              </View>
              <Ionicons name="heart" size={16} color={COLORS.accentRed} />
              <View style={[styles.pairTypePill, { backgroundColor: c2 + "20", borderColor: c2 + "50" }]}>
                <Text style={[styles.pairTypeText, { color: c2 }]}>{pair.type2}</Text>
              </View>
              <View style={styles.pairLabelBadge}>
                <Text style={styles.pairLabel}>{pair.label}</Text>
              </View>
              <Text style={styles.pairScore}>{pair.score}%</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Preferences modal */}
      <Modal visible={prefVisible} transparent animationType="slide" onRequestClose={() => setPrefVisible(false)}>
        <Pressable style={styles.prefOverlay} onPress={() => setPrefVisible(false)}>
          <View style={styles.prefSheet}>
            <View style={styles.prefHandle} />
            <Text style={styles.prefTitle}>Preferences</Text>
            <View style={styles.prefGenderRow}>
              {[
                { emoji: "🧑", label: "Mostly male", val: "male" as const },
                { emoji: "👧", label: "Mostly female", val: "female" as const },
                { emoji: "😊", label: "Everyone", val: "all" as const },
              ].map((g) => (
                <TouchableOpacity
                  key={g.val}
                  style={[styles.prefGenderCard, prefGender === g.val && styles.prefGenderCardActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPrefGender(g.val); }}
                >
                  <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                  <Text style={[styles.prefGenderLabel, prefGender === g.val && { color: COLORS.textPrimary }]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.prefRows}>
              <TouchableOpacity style={styles.prefRow}>
                <Text style={styles.prefRowLabel}>Personality</Text>
                <View style={styles.premiumTag}><Text style={styles.premiumTagText}>🌙 Premium</Text></View>
                <Text style={styles.prefRowValue}>All personalities &gt;</Text>
              </TouchableOpacity>
              <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.prefRowLabel}>Region</Text>
                <View style={styles.premiumTag}><Text style={styles.premiumTagText}>🌙 Premium</Text></View>
                <Text style={styles.prefRowValue}>🌍 India and Worldwide &gt;</Text>
              </View>
            </View>
            <Text style={styles.prefNote}>You may see people slightly outside your filters.</Text>
            <View style={styles.prefFriends}>
              <View>
                <Text style={styles.prefFriendsTitle}>Open to make new friends</Text>
                <Text style={styles.prefFriendsSub}>Let new friends discover you anytime</Text>
              </View>
              <Switch
                value={openToFriends}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOpenToFriends(v); }}
                trackColor={{ false: "#2A2A35", true: COLORS.accentGreen }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  backBtn: { padding: 16 },

  // Main
  mainContent: { paddingHorizontal: 16, gap: 14 },
  mainHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mainTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 26 },
  mainSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13 },
  prefBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.bgCard, alignItems: "center", justifyContent: "center" },

  visitorCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.glassBorder },
  visitorCardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  visitorCardNum: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18 },
  visitorCardSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  sectionAction: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 13 },

  connectionsRow: { gap: 12, paddingVertical: 4 },
  connectionCard: { alignItems: "center", gap: 6, width: 70 },
  chemBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  chemNum: { fontFamily: "Inter_700Bold", fontSize: 11 },
  connName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  connTypePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  connTypeTxt: { fontFamily: "Inter_700Bold", fontSize: 10 },

  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureCard: { width: "47%", borderRadius: 18, padding: 16, gap: 6 },
  featureLabel: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 14 },
  featureSub: { color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular", fontSize: 12 },

  friendsToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.glassBorder },
  friendsLeft: { flex: 1, gap: 3 },
  friendsTitle: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  friendsSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },

  pairRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.glassBorder },
  pairTypePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  pairTypeText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  pairLabelBadge: { flex: 1, alignItems: "flex-end" },
  pairLabel: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  pairScore: { color: COLORS.textSecondary, fontFamily: "Inter_700Bold", fontSize: 14 },

  // Visitors
  visitorsContent: { paddingHorizontal: 16, gap: 12 },
  visitorsHero: { alignItems: "center", gap: 6, paddingVertical: 16 },
  visitsBigNum: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 28 },
  visitsSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  visitorStatsRow: { flexDirection: "row", gap: 8 },
  visitorStatCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 10, alignItems: "center", gap: 4, borderWidth: 1, borderColor: COLORS.glassBorder },
  visitorStatFlag: { fontSize: 16 },
  visitorStatCount: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  visitorStatLabel: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 10 },
  visitorRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  visitorAvatarBlur: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.glassBorder },
  visitorInfo: { flex: 1 },
  visitorNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  visitorName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  visitorMbti: { color: COLORS.accent, fontFamily: "Inter_700Bold", fontSize: 12 },
  visitorTime: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  visitorNote: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13 },
  visitorRight: {},
  ctaBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accentGreen },
  ctaBtnText: { color: COLORS.accentGreen, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  pawCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  pawCountText: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 14 },
  seeWhoBtn: { backgroundColor: COLORS.accentGreen, borderRadius: 50, paddingVertical: 16, alignItems: "center" },
  seeWhoBtnText: { color: COLORS.bg, fontFamily: "Inter_700Bold", fontSize: 16 },

  // Wonder Chat
  wonderHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  wonderTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18 },
  switcherRow: { flexDirection: "row", gap: 4 },
  switcherPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.accent },
  switcherPillText: { color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 12 },
  wonderOff: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 24 },
  wonderActive: { flex: 1, alignItems: "center", padding: 40, gap: 24 },
  wonderToggleRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: COLORS.bgCard },
  wonderToggleText: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 14 },
  wonderBigText: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 26, textAlign: "center", lineHeight: 38 },
  wonderDesc: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 22 },
  wonderDots: { flexDirection: "row", gap: 8 },
  wonderDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accentGreen },

  // Bubbles
  bubblesCanvas: { flex: 1, position: "relative" },
  bubble: { position: "absolute" },
  bubbleTap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  bubbleText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 11 },
  bubblesInputArea: { paddingHorizontal: 20, gap: 8 },
  bubblesTarget: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },
  bubblesInputRow: { flexDirection: "row", gap: 10, backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: COLORS.glassBorder },
  bubblesInput: { flex: 1, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 14 },
  bubblesBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  othersAsk: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },

  // Paper Airplane
  paperCanvas: { flex: 1, backgroundColor: "#5B9BD5", position: "relative" },
  paperPerson: { position: "absolute", alignItems: "center", gap: 4 },
  paperAirplane: { width: 0, height: 0, borderTopWidth: 16, borderRightWidth: 28, borderTopColor: "transparent", borderRightColor: "#60A5FA", borderBottomWidth: 4, borderBottomColor: "transparent", marginBottom: 2, opacity: 0.7 },
  paperTypeBubble: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  paperTypeText: { color: "#111", fontFamily: "Inter_700Bold", fontSize: 11 },
  paperActions: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)", paddingVertical: 12 },
  paperActionBtn: { alignItems: "center", gap: 4 },
  paperActionLabel: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 11 },
  paperModalBack: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  paperModal: { backgroundColor: "#FFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  paperModalTag: { color: "#333", fontFamily: "Inter_700Bold", fontSize: 14 },
  paperModalClose: { position: "absolute", top: 24, right: 24 },
  paperModalUser: { flexDirection: "row", alignItems: "center", gap: 12 },
  paperModalName: { color: "#111", fontFamily: "Inter_700Bold", fontSize: 15 },
  paperModalMbti: { color: "#555", fontFamily: "Inter_400Regular", fontSize: 13 },
  paperModalInput: { borderRadius: 14, backgroundColor: "#F5F5F5", padding: 14, color: "#111", fontSize: 14, minHeight: 80 },
  photoArea: { borderRadius: 14, backgroundColor: "#F5F5F5", padding: 20, alignItems: "center", gap: 8 },
  photoAreaText: { color: "#888", fontFamily: "Inter_400Regular", fontSize: 13 },
  topicsLabel: { color: "#888", fontFamily: "Inter_500Medium", fontSize: 13 },
  topicsDivider: { height: 1, backgroundColor: "#EEE" },
  sendSignalBtn: { backgroundColor: COLORS.accentGreen, borderRadius: 50, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  sendSignalText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 16 },
  recallBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 },
  recallText: { color: "#888", fontFamily: "Inter_400Regular", fontSize: 13 },

  // Preferences
  prefOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  prefSheet: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16, borderWidth: 1, borderColor: COLORS.glassBorder },
  prefHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center", marginBottom: 4 },
  prefTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 22 },
  prefGenderRow: { flexDirection: "row", gap: 10 },
  prefGenderCard: { flex: 1, backgroundColor: COLORS.bgTertiary, borderRadius: 14, padding: 14, alignItems: "center", gap: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  prefGenderCardActive: { backgroundColor: COLORS.bgSecondary, borderColor: COLORS.accent },
  prefGenderLabel: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 12, textAlign: "center" },
  prefRows: { backgroundColor: COLORS.bgTertiary, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden" },
  prefRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  prefRowLabel: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15, flex: 1 },
  prefRowValue: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 13 },
  premiumTag: { backgroundColor: "#1C1030", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: "#7C3AED50" },
  premiumTagText: { color: "#A78BFA", fontFamily: "Inter_600SemiBold", fontSize: 10 },
  prefNote: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  prefFriends: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.bgTertiary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.glassBorder },
  prefFriendsTitle: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  prefFriendsSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },
});
