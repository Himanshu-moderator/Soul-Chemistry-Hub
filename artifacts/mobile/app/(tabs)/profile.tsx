import React, { useState, useRef } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { CONNECTIONS, PERSONALITY_TYPES, THEMES } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { bigFiveFor } from "@/lib/personality";
import { GlassCard } from "@/components/GlassCard";
import { TypeBadge } from "@/components/TypeBadge";
import { AvatarCircle } from "@/components/AvatarCircle";
import { ChemistryRing } from "@/components/ChemistryRing";
import { CoinBadge } from "@/components/CoinBadge";
import { SectionHeader } from "@/components/SectionHeader";

const MBTI_TYPES = PERSONALITY_TYPES.map((t) => t.code);
const ENNEAGRAM_TYPES = ["1w2","1w9","2w1","2w3","3w2","3w4","4w3","4w5","5w4","5w6","6w5","6w7","7w6","7w8","8w7","8w9","9w1","9w8"];
const SOCIONICS_TYPES = ["ILE","SEI","ESE","LII","EIE","LSI","SLE","IEI","SEE","ILI","LIE","ESI","LSE","EII","IEE","SLI"];

// AI insights per MBTI
const AI_INSIGHTS: Record<string, { strength: string; growth: string; career: string; love: string }> = {
  INTJ: { strength: "Strategic vision & systems thinking", growth: "Open up to emotional vulnerability", career: "Architecture, Engineering, Strategy, Science", love: "Seek depth over surface. ENFP & ENTP balance you perfectly." },
  INTP: { strength: "Analytical depth & original ideas", growth: "Act on ideas, not just analyze them", career: "Research, Programming, Philosophy, Academia", love: "You need intellectual stimulation first. ENTJ & ENFJ challenge you." },
  ENTJ: { strength: "Leadership & decisive execution", growth: "Practice empathy & listening", career: "CEO, Management, Law, Entrepreneurship", love: "Your ideal partner matches your ambition. INTP & INFP balance you." },
  ENTP: { strength: "Creative problem-solving & debate", growth: "Follow through on projects to the end", career: "Startups, Law, Consulting, Innovation", love: "INFJ understands your depth. INTJ matches your intensity." },
  INFJ: { strength: "Deep empathy & visionary thinking", growth: "Set boundaries & avoid burnout", career: "Psychology, Writing, Teaching, Counseling", love: "You're selective. ENTP & ENFP bring out your lighter side." },
  INFP: { strength: "Authentic creativity & deep values", growth: "Take action despite perfectionism", career: "Writing, Art, Psychology, Social Work", love: "ENFJ protects you. INFJ understands your inner world." },
  ENFJ: { strength: "Inspiring leadership & human insight", growth: "Prioritize your own needs too", career: "Teaching, HR, Leadership, Coaching", love: "INFP & INFJ are your soulmates. You grow with INTJ." },
  ENFP: { strength: "Boundless enthusiasm & emotional intelligence", growth: "Commit and finish what you start", career: "Marketing, Coaching, Acting, Entrepreneurship", love: "INTJ is your classic match. INFJ deeply understands you." },
  ISTJ: { strength: "Reliability, discipline & attention to detail", growth: "Embrace change and spontaneity", career: "Accounting, Law, Military, Administration", love: "ESFP & ESTP balance your seriousness with fun." },
  ISFJ: { strength: "Warm loyalty & practical care", growth: "Express your needs without guilt", career: "Nursing, Teaching, Social Work, Admin", love: "ESTP brings excitement. ESFP keeps life joyful." },
  ESTJ: { strength: "Organization, efficiency & leadership", growth: "Listen before directing", career: "Management, Military, Finance, Law", love: "ISFP's creativity softens you. INTP challenges you." },
  ESFJ: { strength: "Warmth, social harmony & care", growth: "Trust your own judgment more", career: "Healthcare, Education, HR, Events", love: "ISTP's calm complements your warmth." },
  ISTP: { strength: "Cool-headed problem solving & skill mastery", growth: "Communicate feelings proactively", career: "Engineering, Mechanics, Tech, Athletics", love: "ESFJ's warmth draws you out. ESTJ shares your practicality." },
  ISFP: { strength: "Artistic sensitivity & present-moment living", growth: "Build confidence in your vision", career: "Art, Music, Design, Nature, Healthcare", love: "ENTJ's direction guides you. ESFP shares your joy." },
  ESTP: { strength: "Bold action, charm & risk management", growth: "Think before acting in emotional situations", career: "Sales, Emergency Services, Sports, Entrepreneurship", love: "ISFJ's depth grounds you. ISTP's calm balances you." },
  ESFP: { strength: "Infectious energy, fun & generosity", growth: "Build financial & life plans", career: "Entertainment, Hospitality, Sales, Sports", love: "ISTJ's stability anchors you. ISFJ shares your warmth." },
};

// AI conversation messages
const AI_CHAT_INIT: AiMsg[] = [
  { id: "ai1", from: "ai", text: "Hi! I'm your personal PersonaAI 🔮 Ask me anything about your personality, compatibility, or growth paths." },
];

type AiMsg = { id: string; from: "ai" | "user"; text: string };

// Scripted PersonaAI answers built from the per-type notes above, so they match
// whichever type the user actually has.
function aiReply(mbti: string, query: string): string {
  const info = AI_INSIGHTS[mbti];
  if (!info) return `I don't have notes on ${mbti} yet. Try the Soul tab for chemistry insights.`;
  const q = query.toLowerCase();
  if (q.includes("compat") || q.includes("match") || q.includes("love")) return `For an ${mbti}: ${info.love}`;
  if (q.includes("strength")) return `Your top strength as an ${mbti}: ${info.strength}.`;
  if (q.includes("weak") || q.includes("growth")) return `A growth area for ${mbti}: ${info.growth}.`;
  if (q.includes("career") || q.includes("job")) return `Careers that suit an ${mbti}: ${info.career}.`;
  return `Good question! Try asking about your strengths, growth areas, compatible types or careers as an ${mbti}.`;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, coins, isPremium, selectedTheme, setSelectedTheme, resetDemo, mode } = useApp();
  const { signOut } = useAuth();

  const [activeSection, setActiveSection] = useState<"profile" | "ai" | "themes">("profile");
  const [editVisible, setEditVisible] = useState(false);
  const [editField, setEditField] = useState<"name" | "bio" | "mbti" | "enneagram" | "socionics" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [aiMessages, setAiMessages] = useState<AiMsg[]>(AI_CHAT_INIT);
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const typeColor = (COLORS.MBTI as Record<string, string>)[profile.mbti] || COLORS.accent;
  const bestConnections = CONNECTIONS.filter((c) => profile.bestConnections.includes(c.id));
  const xpProgress = (profile.xp % 500) / 500;
  const insights = AI_INSIGHTS[profile.mbti] || AI_INSIGHTS["INTJ"];

  const openEdit = (field: typeof editField) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditField(field);
    if (field === "name") { setEditValue(profile.name); setEditVisible(true); }
    else if (field === "bio") { setEditValue(profile.bio); setEditVisible(true); }
    else if (field === "mbti") { setEditValue(profile.mbti); setDropdownOptions(MBTI_TYPES); setDropdownVisible(true); }
    else if (field === "enneagram") { setEditValue(profile.enneagram); setDropdownOptions(ENNEAGRAM_TYPES); setDropdownVisible(true); }
    else if (field === "socionics") { setEditValue(profile.socionics); setDropdownOptions(SOCIONICS_TYPES); setDropdownVisible(true); }
  };

  const saveEdit = () => {
    if (!editField) return;
    updateProfile({ [editField]: editValue } as any);
    setEditVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const selectDropdown = (val: string) => {
    if (!editField) return;
    updateProfile({ [editField]: val } as any);
    setDropdownVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const sendAiMessage = () => {
    if (!aiInput.trim() || aiTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: AiMsg = { id: `u${Date.now()}`, from: "user", text: aiInput.trim() };
    const query = aiInput.toLowerCase();
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setAiTyping(true);
    setTimeout(() => {
      const reply = aiReply(profile.mbti, query);
      const aiMsg: AiMsg = { id: `ai${Date.now()}`, from: "ai", text: reply };
      setAiMessages((prev) => [...prev, aiMsg]);
      setAiTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1400);
  };

  const QUICK_PROMPTS = ["Compatible types?", "My strengths", "Growth areas", "Career paths"];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight}>
          <CoinBadge amount={coins} size="sm" />
          <TouchableOpacity style={styles.settingsBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Feather name="settings" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Tabs */}
      <View style={styles.sectionTabs}>
        {[
          { id: "profile" as const, label: "Profile", icon: "person-outline" },
          { id: "ai" as const, label: "AI Insights", icon: "sparkles" },
          { id: "themes" as const, label: "Themes", icon: "color-palette-outline" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.sectionTab, activeSection === tab.id && styles.sectionTabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveSection(tab.id); }}
          >
            <Ionicons name={tab.icon as any} size={14} color={activeSection === tab.id ? "#FFF" : COLORS.textTertiary} />
            <Text style={[styles.sectionTabText, activeSection === tab.id && styles.sectionTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PROFILE SECTION */}
      {activeSection === "profile" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
          {/* Profile Hero */}
          <GlassCard style={styles.profileHero}>
            <View style={styles.heroTop}>
              <TouchableOpacity style={styles.avatarWrapper}>
                <AvatarCircle name={profile.name} size={76} mbti={profile.mbti} />
                <View style={styles.avatarEditBadge}>
                  <Feather name="camera" size={11} color={COLORS.textPrimary} />
                </View>
              </TouchableOpacity>
              <View style={styles.heroInfo}>
                <TouchableOpacity onPress={() => openEdit("name")} style={styles.nameRow}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Feather name="edit-2" size={13} color={COLORS.textTertiary} />
                </TouchableOpacity>
                <Text style={styles.profileUsername}>{profile.username}</Text>
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="star" size={11} color={COLORS.accentGold} />
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity onPress={() => openEdit("bio")}>
              <Text style={styles.bioText}>{profile.bio}</Text>
              <Text style={styles.editHint}>Tap to edit bio</Text>
            </TouchableOpacity>

            <View style={styles.typesRow}>
              {[
                { field: "mbti", label: "MBTI", val: profile.mbti, color: typeColor },
                { field: "enneagram", label: "Ennea", val: profile.enneagram, color: COLORS.accentBlue },
                { field: "socionics", label: "Socio", val: profile.socionics, color: COLORS.accentGold },
              ].map((t) => (
                <TouchableOpacity key={t.field} onPress={() => openEdit(t.field as any)} style={[styles.typeEditBtn, { borderColor: t.color + "50" }]}>
                  <Text style={[styles.typeEditLabel, { color: t.color }]}>{t.label}</Text>
                  <Text style={[styles.typeEditValue, { color: t.color }]}>{t.val}</Text>
                  <Feather name="chevron-down" size={12} color={t.color} />
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* XP / Level */}
          <GlassCard style={styles.xpCard}>
            <View style={styles.xpRow}>
              <View>
                <Text style={styles.xpLevel}>Level {profile.level} · {profile.streak} day streak 🔥</Text>
                <Text style={styles.xpSub}>{profile.xp} XP · {Math.round(xpProgress * 500)} / 500 to next level</Text>
              </View>
              <View style={[styles.streakBadge]}>
                <Ionicons name="flame" size={16} color={COLORS.accentOrange} />
                <Text style={styles.streakText}>{profile.streak}</Text>
              </View>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
            </View>
          </GlassCard>

          {/* Stats */}
          <GlassCard>
            <View style={styles.statsGrid}>
              {[
                { label: "Followers", val: profile.followers.toLocaleString(), icon: "users", color: COLORS.accent },
                { label: "Following", val: profile.following.toLocaleString(), icon: "user-check", color: COLORS.accentBlue },
                { label: "Matches", val: profile.matches.toString(), icon: "heart", color: COLORS.accentRed },
                { label: "Coins", val: coins.toString(), icon: "award", color: COLORS.accentGold },
              ].map((s) => (
                <View key={s.label} style={[styles.statBox, { backgroundColor: s.color + "12" }]}>
                  <Feather name={s.icon as any} size={18} color={s.color} />
                  <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Badges */}
          <SectionHeader title="Badges" action="View All" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
            {profile.badges.map((badge) => (
              <View key={badge} style={styles.badge}>
                <MaterialCommunityIcons name="medal" size={18} color={COLORS.accentGold} />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
            <View style={[styles.badge, { borderStyle: "dashed" }]}>
              <Feather name="plus" size={16} color={COLORS.textTertiary} />
              <Text style={[styles.badgeText, { color: COLORS.textTertiary }]}>Earn More</Text>
            </View>
          </ScrollView>

          {/* Best Connections */}
          <SectionHeader title="Best Connections" action="See All" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestConns}>
            {bestConnections.map((c) => (
              <GlassCard key={c.id} style={styles.bestConnCard} padding={12}>
                <AvatarCircle name={c.name} size={46} mbti={c.mbti} isOnline={c.isOnline} />
                <Text style={styles.bestConnName} numberOfLines={1}>{c.name.split(" ")[0]}</Text>
                <ChemistryRing percent={c.chemistry} size={38} color={COLORS.accent} />
                <TypeBadge type={c.mbti} size="sm" />
              </GlassCard>
            ))}
          </ScrollView>

          {/* Quick AI Tip */}
          <TouchableOpacity onPress={() => setActiveSection("ai")}>
            <GlassCard style={styles.aiTeaserCard}>
              <View style={styles.aiTeaserLeft}>
                <Text style={{ fontSize: 22 }}>🤖</Text>
                <View>
                  <Text style={styles.aiTeaserTitle}>AI Personality Insights</Text>
                  <Text style={styles.aiTeaserSub}>Chat with PersonaAI · Learn about your type</Text>
                </View>
              </View>
              <Feather name="arrow-right" size={16} color={COLORS.accent} />
            </GlassCard>
          </TouchableOpacity>

          {/* Leave: end the demo (and clear it) or sign out of the account */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (mode === "demo") await resetDemo();
              await signOut();
              router.replace("/");
            }}
            style={{ alignSelf: "center", paddingVertical: 14, paddingHorizontal: 18 }}
          >
            <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>
              {mode === "demo" ? "Exit demo and clear its data" : "Sign out"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* AI INSIGHTS SECTION */}
      {activeSection === "ai" && (
        <View style={{ flex: 1 }}>
          {/* Static insights at top */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={[styles.aiContent, { paddingBottom: 160 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Header card */}
            <GlassCard style={styles.aiHeaderCard}>
              <View style={styles.aiHeaderRow}>
                <View style={styles.aiHeaderLeft}>
                  <Text style={{ fontSize: 36 }}>🤖</Text>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.aiHeaderTitle}>PersonaAI</Text>
                    <Text style={styles.aiHeaderSub} numberOfLines={1}>Your personality guide</Text>
                  </View>
                </View>
                <View style={[styles.typeBigPill, { backgroundColor: COLORS.typeColor + "20", borderColor: COLORS.typeColor + "50" }]}>
                  <Text style={[styles.typeBigCode, { color: COLORS.typeColor }]}>{profile.mbti}</Text>
                </View>
              </View>
            </GlassCard>

            {/* Insights cards */}
            {[
              { icon: "💪", title: "Core Strength", text: insights.strength, color: COLORS.accentGreen },
              { icon: "🌱", title: "Growth Path", text: insights.growth, color: COLORS.accentBlue },
              { icon: "💼", title: "Career Matches", text: insights.career, color: COLORS.accentGold },
              { icon: "💕", title: "Love & Chemistry", text: insights.love, color: COLORS.accentRed },
            ].map((card) => (
              <GlassCard key={card.title} style={[styles.insightCard, { borderLeftColor: card.color, borderLeftWidth: 3 }]}>
                <View style={styles.insightCardHeader}>
                  <Text style={{ fontSize: 20 }}>{card.icon}</Text>
                  <Text style={[styles.insightCardTitle, { color: card.color }]}>{card.title}</Text>
                </View>
                <Text style={styles.insightCardText}>{card.text}</Text>
              </GlassCard>
            ))}

            {/* Big 5 from AI */}
            <GlassCard>
              <Text style={styles.big5Title}>AI Big 5 Analysis</Text>
              {Object.entries(bigFiveFor(profile.mbti)).map(([key, val]) => {
                const labels: Record<string, string> = { O: "Openness", C: "Conscientiousness", E: "Extraversion", A: "Agreeableness", N: "Neuroticism" };
                const color = val > 70 ? COLORS.accent : val > 40 ? COLORS.accentBlue : COLORS.accentGreen;
                return (
                  <View key={key} style={styles.big5Row}>
                    <Text style={styles.big5Label}>{labels[key]}</Text>
                    <View style={styles.big5Bar}>
                      <View style={[styles.big5Fill, { width: `${val}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.big5Val, { color }]}>{val}</Text>
                  </View>
                );
              })}
            </GlassCard>

            {/* AI Chat */}
            <View style={styles.chatSection}>
              <Text style={styles.chatSectionTitle}>🔮 Ask PersonaAI</Text>
              {aiMessages.map((msg) => (
                <View key={msg.id} style={[styles.chatRow, msg.from === "user" && styles.chatRowUser]}>
                  {msg.from === "ai" && (
                    <View style={styles.chatAiAvatar}><Text style={{ fontSize: 14 }}>🤖</Text></View>
                  )}
                  <View style={[styles.chatBubble, msg.from === "user" && styles.chatBubbleUser]}>
                    <Text style={[styles.chatText, msg.from === "user" && styles.chatTextUser]}>{msg.text}</Text>
                  </View>
                </View>
              ))}
              {aiTyping && (
                <View style={styles.chatRow}>
                  <View style={styles.chatAiAvatar}><Text style={{ fontSize: 14 }}>🤖</Text></View>
                  <View style={styles.chatBubble}>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      {[0.3, 0.6, 1].map((o, i) => <View key={i} style={[styles.dotTyping, { opacity: o }]} />)}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Quick prompts + input fixed at bottom */}
          <View style={[styles.aiInputArea, { paddingBottom: insets.bottom + 90 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPrompts}>
              {QUICK_PROMPTS.map((p) => (
                <TouchableOpacity key={p} style={styles.quickPrompt} onPress={() => setAiInput(p)}>
                  <Text style={styles.quickPromptText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.aiInputRow}>
              <TextInput
                style={styles.aiInput}
                value={aiInput}
                onChangeText={setAiInput}
                placeholder="Ask about your personality..."
                placeholderTextColor={COLORS.textTertiary}
                onSubmitEditing={sendAiMessage}
              />
              <TouchableOpacity
                style={[styles.aiSendBtn, (!aiInput.trim() || aiTyping) && { opacity: 0.4 }]}
                onPress={sendAiMessage}
                disabled={!aiInput.trim() || aiTyping}
              >
                <Ionicons name="send" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* THEMES SECTION */}
      {activeSection === "themes" && (
        <ScrollView contentContainerStyle={[styles.themesContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.themesHeader}>
            <Text style={styles.themesTitle}>Choose Your Theme</Text>
            <Text style={styles.themesSub}>Personalize your Pdb experience</Text>
          </View>

          {THEMES.map((theme) => {
            const isActive = selectedTheme === theme.id;
            const isLocked = !theme.free && !isPremium;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[styles.themeCard, isActive && styles.themeCardActive, { borderColor: isActive ? theme.accent : COLORS.glassBorder }]}
                onPress={() => {
                  if (isLocked) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); return; }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setSelectedTheme(theme.id);
                }}
                activeOpacity={0.8}
              >
                {/* Preview swatch */}
                <View style={[styles.themePreview, { backgroundColor: theme.preview }]}>
                  <View style={[styles.themeAccentDot, { backgroundColor: theme.accent }]} />
                  <View style={[styles.themeBarShort, { backgroundColor: theme.accent + "50" }]} />
                  <View style={[styles.themeBarLong, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
                </View>
                <View style={styles.themeInfo}>
                  <View style={styles.themeNameRow}>
                    <Text style={styles.themeName}>{theme.name}</Text>
                    {isLocked && (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={11} color={COLORS.accentGold} />
                        <Text style={styles.lockedText}>Premium</Text>
                      </View>
                    )}
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: theme.accent + "20" }]}>
                        <Ionicons name="checkmark-circle" size={14} color={theme.accent} />
                        <Text style={[styles.activeText, { color: theme.accent }]}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.themeDesc}>{theme.description}</Text>
                </View>
                <View style={[styles.themeAccentPill, { backgroundColor: theme.accent }]} />
              </TouchableOpacity>
            );
          })}

          {!isPremium && (
            <GlassCard style={styles.premiumThemeCard}>
              <Ionicons name="star" size={24} color={COLORS.accentGold} />
              <Text style={styles.premiumThemeTitle}>Unlock All Themes</Text>
              <Text style={styles.premiumThemeSub}>Get Premium to access Neon Aura, Midnight Gold, Rose Noir & Arctic Frost</Text>
              <TouchableOpacity style={styles.unlockBtn}>
                <Text style={styles.unlockBtnText}>Try Premium Free · 14 days</Text>
              </TouchableOpacity>
            </GlassCard>
          )}
        </ScrollView>
      )}

      {/* Text Edit Modal */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.editTitle}>Edit {editField === "name" ? "Name" : "Bio"}</Text>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              multiline={editField === "bio"}
              autoFocus
              placeholder={editField === "name" ? "Your name" : "Tell your story..."}
              placeholderTextColor={COLORS.textTertiary}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dropdown Modal */}
      <Modal visible={dropdownVisible} transparent animationType="slide" onRequestClose={() => setDropdownVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.editTitle}>
              Select {editField === "mbti" ? "MBTI Type" : editField === "enneagram" ? "Enneagram" : "Socionics"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.dropdownScroll}>
              {dropdownOptions.map((opt) => {
                const cur = editField === "mbti" ? profile.mbti : editField === "enneagram" ? profile.enneagram : profile.socionics;
                const isSelected = cur === opt;
                const col = editField === "mbti" ? ((COLORS.MBTI as Record<string, string>)[opt] || COLORS.accent) : editField === "enneagram" ? COLORS.accentBlue : COLORS.accentGold;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.dropdownItem, isSelected && { backgroundColor: col + "20", borderColor: col + "50" }]}
                    onPress={() => selectDropdown(opt)}
                  >
                    <Text style={[styles.dropdownItemText, isSelected && { color: col }]}>{opt}</Text>
                    {editField === "mbti" && (
                      <Text style={styles.dropdownSubText}>{PERSONALITY_TYPES.find((t) => t.code === opt)?.name || ""}</Text>
                    )}
                    {isSelected && <Ionicons name="checkmark" size={18} color={col} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtnFull} onPress={() => setDropdownVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 10 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 26 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  settingsBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.bgCard, alignItems: "center", justifyContent: "center" },
  sectionTabs: { flexDirection: "row", marginHorizontal: 20, marginBottom: 14, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: COLORS.glassBorder },
  sectionTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10 },
  sectionTabActive: { backgroundColor: COLORS.accent },
  sectionTabText: { color: COLORS.textTertiary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sectionTabTextActive: { color: "#FFF" },
  content: { paddingHorizontal: 20, gap: 14 },
  profileHero: { gap: 14 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarWrapper: { position: "relative" },
  avatarEditBadge: { position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.bg },
  heroInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileName: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  profileUsername: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 13 },
  premiumBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.accentGold + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: COLORS.accentGold + "40", alignSelf: "flex-start" },
  premiumText: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 11 },
  bioText: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  editHint: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 },
  typesRow: { flexDirection: "row", gap: 8 },
  typeEditBtn: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: "center", gap: 3, backgroundColor: COLORS.bgTertiary },
  typeEditLabel: { fontFamily: "Inter_500Medium", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 },
  typeEditValue: { fontFamily: "Inter_700Bold", fontSize: 15 },
  xpCard: { gap: 10 },
  xpRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  xpLevel: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  xpSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.accentOrange + "20", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.accentOrange + "40" },
  streakText: { color: COLORS.accentOrange, fontFamily: "Inter_700Bold", fontSize: 15 },
  xpBarBg: { height: 6, backgroundColor: COLORS.bgTertiary, borderRadius: 3, overflow: "hidden" },
  xpBarFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: { width: "47%", borderRadius: 14, padding: 14, gap: 5, alignItems: "center" },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  badgesRow: { gap: 10, paddingVertical: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: 14, paddingVertical: 10 },
  badgeText: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bestConns: { gap: 10, paddingVertical: 4 },
  bestConnCard: { width: 96, alignItems: "center", gap: 7 },
  bestConnName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  aiTeaserCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderColor: COLORS.accent + "30" },
  aiTeaserLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiTeaserTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 15 },
  aiTeaserSub: { color: COLORS.accent, fontFamily: "Inter_400Regular", fontSize: 12 },
  aiContent: { paddingHorizontal: 20, gap: 14, paddingTop: 8 },
  aiHeaderCard: { gap: 10 },
  aiHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aiHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
  aiHeaderTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18 },
  aiHeaderSub: { color: COLORS.accent, fontFamily: "Inter_400Regular", fontSize: 12 },
  typeBigPill: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1.5 },
  typeBigCode: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: 1.5 },
  insightCard: { gap: 8 },
  insightCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  insightCardTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  insightCardText: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 22 },
  big5Title: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 12 },
  big5Row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  big5Label: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 12, width: 100 },
  big5Bar: { flex: 1, height: 6, backgroundColor: COLORS.bgTertiary, borderRadius: 3, overflow: "hidden" },
  big5Fill: { height: 6, borderRadius: 3 },
  big5Val: { fontFamily: "Inter_700Bold", fontSize: 13, width: 28, textAlign: "right" },
  chatSection: { gap: 10 },
  chatSectionTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  chatRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  chatRowUser: { flexDirection: "row-reverse" },
  chatAiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.accentDim, alignItems: "center", justifyContent: "center" },
  chatBubble: { maxWidth: "80%", backgroundColor: COLORS.bgCard, borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: COLORS.glassBorder },
  chatBubbleUser: { backgroundColor: COLORS.accent, borderBottomLeftRadius: 16, borderBottomRightRadius: 4, borderColor: "transparent" },
  chatText: { color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  chatTextUser: { color: "#FFF" },
  dotTyping: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.textTertiary },
  aiInputArea: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, paddingTop: 8, paddingHorizontal: 16, gap: 8 },
  quickPrompts: { gap: 8, paddingBottom: 2 },
  quickPrompt: { backgroundColor: COLORS.bgTertiary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  quickPromptText: { color: COLORS.accent, fontFamily: "Inter_500Medium", fontSize: 12 },
  aiInputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  aiInput: { flex: 1, backgroundColor: COLORS.bgTertiary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 14, borderWidth: 1, borderColor: COLORS.glassBorder },
  aiSendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  themesContent: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  themesHeader: { gap: 4, marginBottom: 4 },
  themesTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 22 },
  themesSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  themeCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.bgCard, borderRadius: 18, borderWidth: 1, padding: 14, overflow: "hidden" },
  themeCardActive: { backgroundColor: COLORS.bgSecondary },
  themePreview: { width: 70, height: 60, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 8, gap: 5, justifyContent: "center" },
  themeAccentDot: { width: 16, height: 16, borderRadius: 8 },
  themeBarShort: { height: 4, borderRadius: 2, width: "60%" },
  themeBarLong: { height: 4, borderRadius: 2, width: "90%" },
  themeInfo: { flex: 1, gap: 4 },
  themeNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  themeName: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 15 },
  lockedBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: COLORS.accentGold + "20", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: COLORS.accentGold + "40" },
  lockedText: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  activeText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  themeDesc: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  themeAccentPill: { width: 6, height: "100%", borderRadius: 3, position: "absolute", right: 0, top: 0, bottom: 0 },
  premiumThemeCard: { gap: 10, alignItems: "center", borderColor: COLORS.accentGold + "30" },
  premiumThemeTitle: { color: COLORS.accentGold, fontFamily: "Inter_700Bold", fontSize: 18 },
  premiumThemeSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 20 },
  unlockBtn: { backgroundColor: COLORS.accentGold, borderRadius: 50, paddingVertical: 13, paddingHorizontal: 24, width: "100%", alignItems: "center" },
  unlockBtnText: { color: COLORS.bg, fontFamily: "Inter_700Bold", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  editModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16 },
  dropdownModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16, maxHeight: "75%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center", marginBottom: 4 },
  editTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  editInput: { backgroundColor: COLORS.bgTertiary, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 14, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15, minHeight: 50 },
  editActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: "center" },
  cancelText: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  saveBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: COLORS.accent, alignItems: "center" },
  saveBtnText: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  dropdownScroll: { maxHeight: 400 },
  dropdownItem: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "transparent", marginBottom: 6 },
  dropdownItemText: { flex: 1, color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  dropdownSubText: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 },
  cancelBtnFull: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: "center", marginTop: 4 },
});
