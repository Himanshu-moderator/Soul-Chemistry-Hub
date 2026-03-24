import React, { useState, useRef } from "react";
import {
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
import { TypeBadge } from "@/components/TypeBadge";
import { GlassCard } from "@/components/GlassCard";

type Step = "welcome" | "know-type" | "select-type" | "ai-chat" | "agree-refine" | "complete";

const AI_QUESTIONS = [
  "Do you prefer spending time alone to recharge, or do you gain energy from social interactions?",
  "When making decisions, do you rely more on logic and data, or on feelings and values?",
  "Do you prefer having a structured plan, or do you like staying flexible and spontaneous?",
  "Are you more drawn to abstract ideas and future possibilities, or concrete facts and present realities?",
];

const AI_RESPONSES: Record<string, string> = {
  "0-alone": "Interesting — that sounds like Introversion (I). Let me dig deeper...",
  "0-social": "That sounds like Extraversion (E). You're energized by the world around you!",
  "1-logic": "Your preference for logic suggests Thinking (T) in the cognitive stack.",
  "1-feelings": "Prioritizing values and empathy suggests Feeling (F) in your profile.",
  "2-structured": "A preference for structure indicates Judging (J) — you like closure.",
  "2-flexible": "Loving flexibility suggests Perceiving (P) — you thrive in open-ended situations.",
  "3-abstract": "Abstract thinking strongly suggests iNtuition (N) as your information gathering function.",
  "3-concrete": "Grounded in facts? That's Sensing (S) — you trust what's real and present.",
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useApp();
  const [step, setStep] = useState<Step>("welcome");
  const [selectedType, setSelectedType] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    { role: "ai", text: "Hi! I'm your PersonaDB AI guide. I'll help you discover your personality type through a few questions. Ready? Let's begin!" },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const [suggestedType, setSuggestedType] = useState("INTJ");
  const [answers, setAnswers] = useState<string[]>([]);

  const aiQuickReplies = [
    ["I prefer alone time", "I love being social"],
    ["I rely on logic", "I go with my feelings"],
    ["I like having a plan", "I stay flexible"],
    ["I love abstract ideas", "I prefer concrete facts"],
  ];

  const handleQuickReply = (reply: string, optionIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const key = `${currentQuestion}-${optionIdx === 0 ? ["alone", "logic", "structured", "abstract"][currentQuestion] : ["social", "feelings", "flexible", "concrete"][currentQuestion]}`;
    const aiReply = AI_RESPONSES[key] || "Fascinating answer! I'm learning more about you...";

    const newMessages = [
      ...chatMessages,
      { role: "user" as const, text: reply },
      { role: "ai" as const, text: aiReply },
    ];
    setChatMessages(newMessages);
    setAnswers([...answers, optionIdx === 0 ? "0" : "1"]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    if (currentQuestion < AI_QUESTIONS.length - 1) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { role: "ai", text: AI_QUESTIONS[currentQuestion + 1] },
        ]);
        setCurrentQuestion(currentQuestion + 1);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }, 1200);
    } else {
      const newAnswers = [...answers, optionIdx === 0 ? "0" : "1"];
      const e = newAnswers[0] === "1" ? "E" : "I";
      const n = newAnswers[3] === "0" ? "N" : "S";
      const t = newAnswers[1] === "0" ? "T" : "F";
      const j = newAnswers[2] === "0" ? "J" : "P";
      const type = `${e}${n}${t}${j}`;
      setSuggestedType(type);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `Based on your answers, I believe you're most likely an **${type}**! Does this resonate with you?`,
          },
        ]);
        setTimeout(() => setStep("agree-refine"), 1500);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }, 1500);
    }
  };

  const handleAgree = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile({ mbti: suggestedType });
    setStep("complete");
  };

  const handleRefine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("select-type");
  };

  const handleSelectType = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedType(code);
  };

  const handleConfirmType = () => {
    if (!selectedType) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile({ mbti: selectedType });
    setStep("complete");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      {/* Header */}
      {step !== "welcome" && step !== "complete" && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Type Discovery</Text>
          <View style={{ width: 22 }} />
        </View>
      )}

      {/* Welcome */}
      {step === "welcome" && (
        <View style={styles.welcomeContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="sparkles" size={56} color={COLORS.accent} />
          </View>
          <Text style={styles.welcomeTitle}>Welcome to PersonaDB</Text>
          <Text style={styles.welcomeSub}>
            The world's most advanced personality database. Discover who you are, find your tribe, and understand the people around you.
          </Text>
          <GlassCard style={styles.welcomeCard}>
            <View style={styles.welcomeFeature}>
              <Ionicons name="analytics" size={22} color={COLORS.accent} />
              <Text style={styles.welcomeFeatureText}>MBTI · Enneagram · Socionics · Big 5</Text>
            </View>
            <View style={styles.welcomeFeature}>
              <Ionicons name="people" size={22} color={COLORS.accentBlue} />
              <Text style={styles.welcomeFeatureText}>10+ type communities, 50,000+ members</Text>
            </View>
            <View style={styles.welcomeFeature}>
              <Ionicons name="heart" size={22} color={COLORS.accentRed} />
              <Text style={styles.welcomeFeatureText}>AI-powered chemistry & compatibility</Text>
            </View>
          </GlassCard>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep("know-type")}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Feather name="arrow-right" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Know your type? */}
      {step === "know-type" && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Do you know your MBTI type?</Text>
          <Text style={styles.stepSub}>We'll customize your experience based on your type.</Text>
          <View style={styles.yesNoRow}>
            <TouchableOpacity
              style={styles.yesBtn}
              onPress={() => setStep("select-type")}
            >
              <Ionicons name="checkmark-circle" size={28} color={COLORS.accentGreen} />
              <Text style={styles.yesBtnText}>Yes, I know my type</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.noBtn}
              onPress={() => setStep("ai-chat")}
            >
              <Ionicons name="sparkles" size={28} color={COLORS.accent} />
              <Text style={styles.noBtnText}>Help me discover it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Select type manually */}
      {step === "select-type" && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Select your MBTI type</Text>
          <Text style={styles.stepSub}>Tap your type to select it.</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={styles.typeGrid}>
              {PERSONALITY_TYPES.map((t) => {
                const isSelected = selectedType === t.code;
                return (
                  <TouchableOpacity
                    key={t.code}
                    style={[styles.typeGridItem, isSelected && { borderColor: t.color, backgroundColor: t.color + "20" }]}
                    onPress={() => handleSelectType(t.code)}
                  >
                    <Text style={[styles.typeGridCode, { color: isSelected ? t.color : COLORS.textPrimary }]}>{t.code}</Text>
                    <Text style={styles.typeGridName} numberOfLines={1}>{t.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          {selectedType && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmType}>
              <Text style={styles.primaryBtnText}>Confirm {selectedType}</Text>
              <Feather name="arrow-right" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* AI Chat */}
      {step === "ai-chat" && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Text style={styles.stepTitle}>AI Type Discovery</Text>
          <Text style={styles.stepSub}>Answer a few questions and I'll analyze your type.</Text>
          <ScrollView
            ref={scrollRef}
            style={styles.chatScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {chatMessages.map((msg, i) => (
              <View key={i} style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}>
                {msg.role === "ai" && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={14} color={COLORS.accent} />
                  </View>
                )}
                <View style={[styles.bubbleInner, msg.role === "user" ? styles.userBubbleInner : styles.aiBubbleInner]}>
                  <Text style={[styles.bubbleText, msg.role === "user" && styles.userBubbleText]}>
                    {msg.text.replace(/\*\*/g, "")}
                  </Text>
                </View>
              </View>
            ))}

            {/* Quick replies for current question */}
            {currentQuestion < AI_QUESTIONS.length && step === "ai-chat" && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === "ai" && !chatMessages[chatMessages.length - 1].text.includes("believe you") && (
              <View style={styles.quickReplies}>
                {aiQuickReplies[currentQuestion]?.map((reply, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickReply}
                    onPress={() => handleQuickReply(reply, idx)}
                  >
                    <Text style={styles.quickReplyText}>{reply}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Agree or Refine */}
      {step === "agree-refine" && (
        <View style={styles.stepContainer}>
          <View style={styles.resultContainer}>
            <Ionicons name="sparkles" size={40} color={COLORS.accent} />
            <Text style={styles.stepTitle}>Your Type: {suggestedType}</Text>
            <Text style={styles.stepSub}>
              {PERSONALITY_TYPES.find((t) => t.code === suggestedType)?.name}
            </Text>
            <TypeBadge type={suggestedType} size="lg" />
            <Text style={styles.resultNote}>
              {PERSONALITY_TYPES.find((t) => t.code === suggestedType)?.tagline}
            </Text>
          </View>
          <View style={styles.agreeRefineRow}>
            <TouchableOpacity style={styles.agreeBtn} onPress={handleAgree}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.textPrimary} />
              <Text style={styles.agreeBtnText}>Yes, that's me!</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refineBtn} onPress={handleRefine}>
              <Feather name="edit-2" size={18} color={COLORS.accent} />
              <Text style={styles.refineBtnText}>Refine / Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Complete */}
      {step === "complete" && (
        <View style={styles.completeContainer}>
          <Ionicons name="checkmark-circle" size={72} color={COLORS.accentGreen} />
          <Text style={styles.completeTitle}>You're all set!</Text>
          <Text style={styles.completeSub}>Welcome to PersonaDB. Your type profile is ready.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Enter PersonaDB</Text>
            <Feather name="arrow-right" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 17 },
  welcomeContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  logoContainer: { width: 100, height: 100, borderRadius: 28, backgroundColor: COLORS.accentDim, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.accent + "40" },
  welcomeTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 28, textAlign: "center" },
  welcomeSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center", lineHeight: 24 },
  welcomeCard: { width: "100%", gap: 14 },
  welcomeFeature: { flexDirection: "row", alignItems: "center", gap: 12 },
  welcomeFeatureText: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14 },
  primaryBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 28, width: "100%", justifyContent: "center" },
  primaryBtnText: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 17 },
  stepContainer: { flex: 1, gap: 16 },
  stepTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 24, lineHeight: 32 },
  stepSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 15 },
  yesNoRow: { gap: 14, flex: 1, justifyContent: "center" },
  yesBtn: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.accentGreen + "15", borderRadius: 18, padding: 20, borderWidth: 1, borderColor: COLORS.accentGreen + "40" },
  yesBtnText: { color: COLORS.accentGreen, fontFamily: "Inter_600SemiBold", fontSize: 17 },
  noBtn: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.accentDim, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: COLORS.accent + "40" },
  noBtnText: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 17 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 20 },
  typeGridItem: { width: "22%", borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.glassBorder, backgroundColor: COLORS.bgCard, padding: 10, alignItems: "center", gap: 4 },
  typeGridCode: { fontFamily: "Inter_700Bold", fontSize: 15 },
  typeGridName: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 9, textAlign: "center" },
  chatScroll: { flex: 1 },
  chatContent: { gap: 12, paddingTop: 8, paddingBottom: 16 },
  bubble: { flexDirection: "row", gap: 8 },
  userBubble: { justifyContent: "flex-end" },
  aiBubble: { justifyContent: "flex-start", alignItems: "flex-end" },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.accentDim, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.accent + "40" },
  bubbleInner: { maxWidth: "80%", borderRadius: 18, padding: 14 },
  aiBubbleInner: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.glassBorder },
  userBubbleInner: { backgroundColor: COLORS.accent },
  bubbleText: { color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  userBubbleText: { color: COLORS.textPrimary },
  quickReplies: { gap: 8, marginTop: 4 },
  quickReply: { backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.accent + "50", padding: 12 },
  quickReplyText: { color: COLORS.accent, fontFamily: "Inter_500Medium", fontSize: 14 },
  resultContainer: { alignItems: "center", gap: 12, paddingVertical: 20 },
  resultNote: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  agreeRefineRow: { gap: 12 },
  agreeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: COLORS.accentGreen, borderRadius: 16, padding: 16 },
  agreeBtnText: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  refineBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: COLORS.accentDim, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.accent + "40" },
  refineBtnText: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 16 },
  completeContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  completeTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 28 },
  completeSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center" },
});
