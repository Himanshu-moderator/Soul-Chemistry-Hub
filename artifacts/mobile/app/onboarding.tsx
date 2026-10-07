import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { PERSONALITY_TYPES } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { COMPATIBLE_TYPES, typeFromAnswers } from "@/lib/personality";

const { width } = Dimensions.get("window");

type Step = "welcome" | "ai-chat" | "type-grid" | "quiz" | "complete";

const TYPE_ROWS = [
  ["INTJ", "INTP", "ENTJ", "ENTP"],
  ["INFJ", "INFP", "ENFJ", "ENFP"],
  ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  ["ISTP", "ISFP", "ESTP", "ESFP"],
];

const TYPE_EMOJIS: Record<string, string> = {
  INTJ: "🧐", INTP: "🤓", ENTJ: "👑", ENTP: "💡",
  INFJ: "🔮", INFP: "🌙", ENFJ: "🌟", ENFP: "✨",
  ISTJ: "📋", ISFJ: "🌺", ESTJ: "⚖️", ESFJ: "🤝",
  ISTP: "🔧", ISFP: "🎨", ESTP: "⚡", ESFP: "🎉",
};

const TYPE_AVATAR_BG: Record<string, string> = {
  INTJ: "#3D2B6E", INTP: "#2B3A6E", ENTJ: "#5C2B6E", ENTP: "#3D2B6E",
  INFJ: "#2B5060", INFP: "#2B456E", ENFJ: "#2B5060", ENFP: "#2B3D6E",
  ISTJ: "#4A3520", ISFJ: "#3A3840", ESTJ: "#504210", ESFJ: "#303845",
  ISTP: "#6E2020", ISFP: "#6E2040", ESTP: "#6E4014", ESFP: "#6E1414",
};

const QUIZ_QUESTIONS = [
  { q: "After a long day, you feel most recharged by...", a: ["Time alone reflecting", "Being with friends"], dim: ["I", "E"] },
  { q: "You prefer working with...", a: ["Abstract ideas & possibilities", "Concrete facts & reality"], dim: ["N", "S"] },
  { q: "When deciding, you rely more on...", a: ["Logic & objective analysis", "Feelings & personal values"], dim: ["T", "F"] },
  { q: "Your daily life is better when...", a: ["You have a clear plan", "Things flow spontaneously"], dim: ["J", "P"] },
];

// AI Conversation flow
type AiMsg = { id: string; from: "ai" | "user"; text: string; options?: string[] };

const AI_FLOW: AiMsg[] = [
  {
    id: "a1", from: "ai",
    text: "Hey! I'm PersonaAI 🔮 I'll figure out your personality type through a quick conversation. Ready?",
    options: ["Let's go!", "How does this work?"]
  },
  {
    id: "a2", from: "ai",
    text: "Great! When you imagine a perfect weekend, what sounds most appealing?",
    options: ["Deep conversations with a close friend", "A big party with lots of new people", "Solo creative project at home", "Adventure trip somewhere new"]
  },
  {
    id: "a3", from: "ai",
    text: "Interesting! When you face a tough decision, what do you tend to do first?",
    options: ["Make a pros and cons list", "Go with my gut feeling", "Ask trusted people for input", "Research extensively before deciding"]
  },
  {
    id: "a4", from: "ai",
    text: "Almost there! How would your friends describe you?",
    options: ["The deep thinker", "The social butterfly", "The reliable one", "The creative visionary"]
  },
  {
    id: "a5", from: "ai",
    text: "Perfect! I'm analyzing your answers now... 🧠✨",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile, setOnboarded } = useApp();
  const [step, setStep] = useState<Step>("welcome");
  const [selectedType, setSelectedType] = useState("");
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const progressAnim = useRef(new Animated.Value(0.05)).current;

  // AI Chat state
  const [aiMessages, setAiMessages] = useState<AiMsg[]>([AI_FLOW[0]]);
  const [aiFlowIdx, setAiFlowIdx] = useState(0);
  const [aiChoices, setAiChoices] = useState<number[]>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const animateProgress = (to: number) =>
    Animated.timing(progressAnim, { toValue: to, duration: 400, useNativeDriver: false }).start();

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  const handleAiOption = (optIdx: number) => {
    if (aiTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentFlow = AI_FLOW[aiFlowIdx];
    if (!currentFlow.options) return;

    const userMsg: AiMsg = { id: `u${aiFlowIdx}`, from: "user", text: currentFlow.options[optIdx] };
    const newChoices = [...aiChoices, optIdx];
    setAiChoices(newChoices);
    setAiMessages((prev) => [...prev.map((m): AiMsg => ({ ...m, options: undefined })), userMsg]);
    setAiTyping(true);

    const nextIdx = aiFlowIdx + 1;
    setTimeout(() => {
      setAiTyping(false);
      if (nextIdx < AI_FLOW.length) {
        setAiFlowIdx(nextIdx);
        const nextMsg = AI_FLOW[nextIdx];
        setAiMessages((prev) => [...prev, nextMsg]);
        animateProgress(0.1 + (nextIdx / AI_FLOW.length) * 0.4);
        if (nextIdx === AI_FLOW.length - 1) {
          // Last AI message — compute type
          setTimeout(() => {
            // choices[0] is the opening "ready?" answer; the next three are the real questions
            const computed = typeFromAnswers(newChoices[1] ?? 0, newChoices[2] ?? 0, newChoices[3] ?? 0);
            setSelectedType(computed);
            updateProfile({ mbti: computed } as any);
            setTimeout(() => { setStep("complete"); animateProgress(1); }, 1800);
          }, 1200);
        }
      }
      flatRef.current?.scrollToEnd({ animated: true });
    }, 1200);
  };

  const handleSelectType = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedType(code);
  };

  const handleConfirmType = () => {
    if (!selectedType) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile({ mbti: selectedType } as any);
    setStep("complete");
    animateProgress(1);
  };

  const handleQuizAnswer = (dimChar: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...quizAnswers, dimChar];
    setQuizAnswers(newAnswers);
    animateProgress(0.15 + (newAnswers.length / QUIZ_QUESTIONS.length) * 0.85);
    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(quizIdx + 1);
    } else {
      const type = `${newAnswers[0] || "I"}${newAnswers[1] || "N"}${newAnswers[2] || "T"}${newAnswers[3] || "J"}`;
      setSelectedType(type);
      updateProfile({ mbti: type } as any);
      setTimeout(() => { setStep("complete"); animateProgress(1); }, 400);
    }
  };

  const typeData = PERSONALITY_TYPES.find((t) => t.code === selectedType);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress bar */}
      <View style={styles.progressBg}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Welcome step */}
      {step === "welcome" && (
        <View style={[styles.stepContainer, styles.welcomeStep, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.welcomeIconWrap}>
            <Text style={styles.welcomeEmoji}>🔮</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome to PersonaDB</Text>
          <Text style={styles.welcomeSub}>The #1 personality database & social app. Let's discover who you are.</Text>

          <View style={styles.welcomeOptions}>
            <TouchableOpacity
              style={styles.primaryOption}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep("ai-chat"); animateProgress(0.1); }}
            >
              <View style={styles.optionLeft}>
                <View style={styles.aiOptionIcon}>
                  <Text style={{ fontSize: 22 }}>🤖</Text>
                </View>
                <View>
                  <Text style={styles.optionTitle}>AI Personality Test</Text>
                  <Text style={styles.optionSub}>Chat with PersonaAI · 2 min</Text>
                </View>
              </View>
              <Feather name="arrow-right" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryOption}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep("quiz"); animateProgress(0.1); }}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.aiOptionIcon, { backgroundColor: COLORS.accentBlueDim }]}>
                  <Feather name="list" size={20} color={COLORS.accentBlue} />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Quick Quiz</Text>
                  <Text style={styles.optionSub}>4 questions · Classic test</Text>
                </View>
              </View>
              <Feather name="arrow-right" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryOption}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep("type-grid"); animateProgress(0.08); }}
            >
              <Text style={styles.tertiaryText}>I already know my type</Text>
              <Feather name="chevron-right" size={16} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* AI Chat step */}
      {step === "ai-chat" && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setStep("welcome")}>
              <Feather name="arrow-left" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <View style={styles.aiAvatar}>
              <Text style={{ fontSize: 18 }}>🔮</Text>
            </View>
            <View>
              <Text style={styles.chatHeaderTitle}>PersonaAI</Text>
              <Text style={styles.chatHeaderSub}>Powered by personality science</Text>
            </View>
          </View>

          <FlatList
            ref={flatRef}
            data={aiMessages}
            keyExtractor={(m) => m.id}
            style={{ flex: 1 }}
            contentContainerStyle={styles.chatMessages}
            renderItem={({ item }) => (
              <View style={[styles.aiMsgWrap, item.from === "user" && styles.aiMsgWrapUser]}>
                {item.from === "ai" && (
                  <View style={styles.aiAvatarSm}>
                    <Text style={{ fontSize: 14 }}>🔮</Text>
                  </View>
                )}
                <View style={[styles.aiMsgBubble, item.from === "user" && styles.userMsgBubble]}>
                  <Text style={[styles.aiMsgText, item.from === "user" && styles.userMsgText]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            )}
            ListFooterComponent={
              <>
                {aiTyping && (
                  <View style={styles.aiMsgWrap}>
                    <View style={styles.aiAvatarSm}><Text style={{ fontSize: 14 }}>🔮</Text></View>
                    <View style={styles.aiMsgBubble}>
                      <View style={{ flexDirection: "row", gap: 5 }}>
                        {[0, 1, 2].map((i) => (
                          <View key={i} style={[styles.typingDot, { opacity: 0.3 + i * 0.3 }]} />
                        ))}
                      </View>
                    </View>
                  </View>
                )}
                {/* Current options */}
                {!aiTyping && aiMessages.length > 0 && aiMessages[aiMessages.length - 1].options && (
                  <View style={styles.aiOptionsContainer}>
                    {aiMessages[aiMessages.length - 1].options!.map((opt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.aiOption}
                        onPress={() => handleAiOption(idx)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.aiOptionText}>{opt}</Text>
                        <Feather name="chevron-right" size={16} color={COLORS.textTertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            }
          />
        </KeyboardAvoidingView>
      )}

      {/* Type Grid step */}
      {step === "type-grid" && (
        <View style={[styles.stepContainer, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>😌 Select your{"\n"}personality type</Text>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.typeGrid}>
            {TYPE_ROWS.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.typeRow}>
                {row.map((code) => {
                  const isSelected = selectedType === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                      onPress={() => handleSelectType(code)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.typeAvatarBg, { backgroundColor: TYPE_AVATAR_BG[code] || "#333" }]}>
                        <Text style={styles.typeEmoji}>{TYPE_EMOJIS[code] || "🧠"}</Text>
                      </View>
                      <Text style={styles.typeCode}>{code}</Text>
                      <Text style={styles.typeName} numberOfLines={1}>
                        {PERSONALITY_TYPES.find((t) => t.code === code)?.name.replace("The ", "") || ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
          <View style={[styles.typeGridBottom, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.dontKnowBtn}
              onPress={() => { setStep("ai-chat"); animateProgress(0.1); }}
            >
              <Text style={{ fontSize: 16 }}>🤖</Text>
              <Text style={styles.dontKnowText}>Help me find out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowBtn, !selectedType && { opacity: 0.3 }]}
              onPress={handleConfirmType}
              disabled={!selectedType}
            >
              <Feather name="arrow-right" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quiz step */}
      {step === "quiz" && (
        <View style={[styles.stepContainer, styles.quizStep]}>
          <View style={styles.quizProgressPill}>
            <Text style={styles.quizProgressText}>{quizIdx + 1} / {QUIZ_QUESTIONS.length}</Text>
          </View>
          <Text style={styles.quizQuestion}>{QUIZ_QUESTIONS[quizIdx].q}</Text>
          <View style={styles.quizOptions}>
            {QUIZ_QUESTIONS[quizIdx].a.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quizOption}
                onPress={() => handleQuizAnswer(QUIZ_QUESTIONS[quizIdx].dim[idx])}
                activeOpacity={0.75}
              >
                <Text style={styles.quizOptionText}>{opt}</Text>
                <Feather name="chevron-right" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => setStep("welcome")} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={COLORS.textSecondary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Complete step */}
      {step === "complete" && (
        <View style={[styles.stepContainer, styles.completeStep, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.completeCelebration}>
            <Text style={{ fontSize: 64 }}>🎉</Text>
          </View>
          <Text style={styles.completeTitle}>You're an</Text>
          <Text style={[styles.completeTypeCode, { color: COLORS.typeColor }]}>{selectedType}</Text>
          <Text style={styles.completeTypeName}>{typeData?.name || "The Thinker"}</Text>
          <Text style={styles.completeTagline}>{typeData?.tagline || ""}</Text>

          <View style={styles.completeInsights}>
            {[
              { icon: "🧠", text: typeData ? `${typeData.name}: ${typeData.tagline.toLowerCase()}` : `You're an ${selectedType}` },
              { icon: "🤝", text: `Often clicks with ${(COMPATIBLE_TYPES[selectedType] ?? ["ENFP", "INFJ"]).join(" & ")}` },
              { icon: "🌟", text: "Your personality profile is ready to explore" },
            ].map((item, idx) => (
              <View key={idx} style={styles.insightRow}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={styles.insightText}>{item.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.enterBtn}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setOnboarded(true);
              router.replace("/(tabs)");
            }}
          >
            <Text style={styles.enterBtnText}>Enter PersonaDB</Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  progressBg: { height: 3, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 20, marginTop: 8, borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: COLORS.accentGreen, borderRadius: 2 },
  stepContainer: { paddingHorizontal: 20, flex: 1 },
  welcomeStep: { justifyContent: "center", alignItems: "center", gap: 16 },
  welcomeIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accentDim, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.accent + "40" },
  welcomeEmoji: { fontSize: 40 },
  welcomeTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 28, textAlign: "center" },
  welcomeSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center", lineHeight: 24 },
  welcomeOptions: { width: "100%", gap: 10, marginTop: 8 },
  primaryOption: { backgroundColor: COLORS.accent, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  secondaryOption: { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: COLORS.glassBorder },
  tertiaryOption: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  tertiaryText: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 14 },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  aiOptionIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.accentGold + "20", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.accentGold + "30" },
  optionTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  optionSub: { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", fontSize: 13 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  aiAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.accentDim, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.accent + "50" },
  chatHeaderTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  chatHeaderSub: { color: COLORS.accent, fontFamily: "Inter_400Regular", fontSize: 11 },
  chatMessages: { padding: 16, gap: 12 },
  aiMsgWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  aiMsgWrapUser: { flexDirection: "row-reverse" },
  aiAvatarSm: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.accentDim, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  aiMsgBubble: { maxWidth: "78%", backgroundColor: COLORS.bgCard, borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, borderWidth: 1, borderColor: COLORS.glassBorder },
  userMsgBubble: { backgroundColor: COLORS.accent, borderBottomLeftRadius: 18, borderBottomRightRadius: 4, borderColor: "transparent" },
  aiMsgText: { color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  userMsgText: { color: "#FFF" },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textSecondary },
  aiOptionsContainer: { gap: 8, marginTop: 8, paddingBottom: 16 },
  aiOption: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: COLORS.glassBorder },
  aiOptionText: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  sectionTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 24, lineHeight: 34, marginTop: 24, marginBottom: 16 },
  typeGrid: { gap: 10, paddingBottom: 100 },
  typeRow: { flexDirection: "row", gap: 10 },
  typeCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 10, alignItems: "center", gap: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  typeCardSelected: { borderColor: COLORS.accentGreen, borderWidth: 2 },
  typeAvatarBg: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  typeEmoji: { fontSize: 24 },
  typeCode: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 12 },
  typeName: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 9, textAlign: "center" },
  typeGridBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 14 },
  dontKnowBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.bgCard, borderRadius: 50, paddingHorizontal: 18, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.glassBorder },
  dontKnowText: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14 },
  arrowBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  quizStep: { justifyContent: "center", gap: 28 },
  quizProgressPill: { alignSelf: "center", backgroundColor: COLORS.bgCard, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  quizProgressText: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  quizQuestion: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 22, lineHeight: 32, textAlign: "center" },
  quizOptions: { gap: 12 },
  quizOption: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: COLORS.glassBorder },
  quizOptionText: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", paddingVertical: 10 },
  backText: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 14 },
  completeStep: { justifyContent: "center", alignItems: "center", gap: 14 },
  completeCelebration: { width: 90, height: 90, borderRadius: 28, backgroundColor: COLORS.accentGold + "15", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.accentGold + "30" },
  completeTitle: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 18 },
  completeTypeCode: { fontFamily: "Inter_700Bold", fontSize: 52, letterSpacing: 3 },
  completeTypeName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 20 },
  completeTagline: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22, paddingHorizontal: 10 },
  completeInsights: { width: "100%", backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 16, gap: 12, borderWidth: 1, borderColor: COLORS.glassBorder },
  insightRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  insightText: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, flex: 1 },
  enterBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.accent, borderRadius: 50, paddingVertical: 16, paddingHorizontal: 32, marginTop: 8, width: "100%", justifyContent: "center" },
  enterBtnText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 16 },
});
