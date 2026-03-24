import React, { useState, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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

const { width } = Dimensions.get("window");

type Step = "type-select" | "test" | "complete";

// Row of personality type cards in reference style
const TYPE_ROWS = [
  ["INTJ", "INTP", "ENTJ", "ENTP"],
  ["INFJ", "INFP", "ENFJ", "ENFP"],
  ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  ["ISTP", "ISFP", "ESTP", "ESFP"],
];

// Avatar placeholder colors per type
const TYPE_AVATAR_COLORS: Record<string, string> = {
  INTJ: "#5C3D8F", INTP: "#3D4F8F", ENTJ: "#7A3D8F", ENTP: "#5C3D8F",
  INFJ: "#3D7A8A", INFP: "#3D6A8F", ENFJ: "#3D7A8A", ENFP: "#3D5A8F",
  ISTJ: "#6B4C2A", ISFJ: "#5A5055", ESTJ: "#7A5C1A", ESFJ: "#4A5060",
  ISTP: "#8F2A2A", ISFP: "#8F2A5C", ESTP: "#8F6020", ESFP: "#8F2020",
};

const TYPE_AVATARS: Record<string, string> = {
  INTJ: "🧐", INTP: "🤓", ENTJ: "👑", ENTP: "💡",
  INFJ: "🔮", INFP: "🌙", ENFJ: "🌟", ENFP: "✨",
  ISTJ: "📋", ISFJ: "🌺", ESTJ: "⚖️", ESFJ: "🤝",
  ISTP: "🔧", ISFP: "🎨", ESTP: "⚡", ESFP: "🎉",
};

const QUIZ_QUESTIONS = [
  {
    q: "After a long day, you feel most recharged by...",
    a: ["Time alone, reflecting", "Being with friends"],
    dim: ["I", "E"],
  },
  {
    q: "When solving a problem, you prefer...",
    a: ["Abstract patterns & theories", "Concrete facts & experience"],
    dim: ["N", "S"],
  },
  {
    q: "When making decisions, you rely more on...",
    a: ["Logic & objective analysis", "Feelings & personal values"],
    dim: ["T", "F"],
  },
  {
    q: "In your daily life, you prefer...",
    a: ["Having a clear plan & schedule", "Going with the flow"],
    dim: ["J", "P"],
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useApp();
  const [step, setStep] = useState<Step>("type-select");
  const [showTestCard, setShowTestCard] = useState(true);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const progressAnim = useRef(new Animated.Value(0.05)).current;

  const animateProgress = (to: number) => {
    Animated.timing(progressAnim, { toValue: to, duration: 400, useNativeDriver: false }).start();
  };

  const handleStartTest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowTestCard(false);
    setStep("test");
    animateProgress(0.15);
  };

  const handleKnowMyType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTestCard(false);
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

  const handleAnswer = (dimChar: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...answers, dimChar];
    setAnswers(newAnswers);
    const progress = 0.15 + (newAnswers.length / QUIZ_QUESTIONS.length) * 0.85;
    animateProgress(progress);

    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(quizIdx + 1);
    } else {
      // Compute type
      const e = newAnswers[0] || "I";
      const n = newAnswers[1] || "N";
      const t = newAnswers[2] || "T";
      const j = newAnswers[3] || "J";
      const type = `${e}${n}${t}${j}`;
      updateProfile({ mbti: type } as any);
      setSelectedType(type);
      setTimeout(() => {
        setStep("complete");
        animateProgress(1);
      }, 400);
    }
  };

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress bar */}
      <View style={styles.progressBg}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Type Select step */}
      {step === "type-select" && (
        <View style={styles.stepContainer}>
          <Text style={styles.welcomeText}>😌 Welcome! What is your{"\n"}personality type?</Text>

          {/* Test card overlay */}
          {showTestCard && (
            <View style={styles.testCardOverlay}>
              <View style={styles.testCard}>
                <Text style={styles.testCardTitle}>Take a quick personality test</Text>
                <Text style={styles.testCardSub}>Discover your unique traits, and compatible types!</Text>
                <TouchableOpacity style={styles.startTestBtn} onPress={handleStartTest}>
                  <Text style={styles.startTestText}>Start Test (2 min)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleKnowMyType}>
                  <Text style={styles.alreadyKnowText}>I already know my personality type</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Type grid - scrollable behind the card */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.typeScroll} contentContainerStyle={styles.typeScrollContent}>
            {TYPE_ROWS.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.typeRow}>
                {row.map((code) => {
                  const isSelected = selectedType === code;
                  const typeData = PERSONALITY_TYPES.find((t) => t.code === code);
                  const avatarBg = TYPE_AVATAR_COLORS[code] || "#333";
                  return (
                    <TouchableOpacity
                      key={code}
                      style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                      onPress={() => handleSelectType(code)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.typeAvatarBg, { backgroundColor: avatarBg }]}>
                        <Text style={styles.typeAvatarEmoji}>{TYPE_AVATARS[code] || "🧠"}</Text>
                      </View>
                      <Text style={styles.typeCode}>{code}</Text>
                      <Text style={styles.typeName} numberOfLines={1}>{typeData?.name.replace("The ", "") || ""}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* Bottom actions */}
          {!showTestCard && (
            <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
              <TouchableOpacity style={styles.dontKnowBtn}>
                <Text style={styles.dontKnowText}>I don't know my type</Text>
              </TouchableOpacity>
              {selectedType ? (
                <TouchableOpacity style={styles.arrowBtn} onPress={handleConfirmType}>
                  <Feather name="arrow-right" size={22} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <View style={[styles.arrowBtn, { opacity: 0.3 }]}>
                  <Feather name="arrow-right" size={22} color="#FFF" />
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Quiz / Test step */}
      {step === "test" && (
        <View style={[styles.stepContainer, styles.quizContainer]}>
          <View style={styles.quizProgress}>
            <Text style={styles.quizProgressText}>{quizIdx + 1} / {QUIZ_QUESTIONS.length}</Text>
          </View>
          <Text style={styles.quizQuestion}>{QUIZ_QUESTIONS[quizIdx].q}</Text>
          <View style={styles.quizOptions}>
            {QUIZ_QUESTIONS[quizIdx].a.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quizOption}
                onPress={() => handleAnswer(QUIZ_QUESTIONS[quizIdx].dim[idx])}
                activeOpacity={0.75}
              >
                <Text style={styles.quizOptionText}>{opt}</Text>
                <Feather name="chevron-right" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={COLORS.textSecondary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Complete step */}
      {step === "complete" && (
        <View style={[styles.stepContainer, styles.completeContainer, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.completeIcon}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.accentGreen} />
          </View>
          <Text style={styles.completeTitle}>You're {selectedType}!</Text>
          <Text style={styles.completeSub}>
            {PERSONALITY_TYPES.find((t) => t.code === selectedType)?.name || "The Thinker"}
          </Text>
          <Text style={styles.completeTagline}>
            {PERSONALITY_TYPES.find((t) => t.code === selectedType)?.tagline || ""}
          </Text>
          <View style={styles.typeShowcase}>
            <Text style={[styles.typeShowcaseCode, { color: COLORS.typeColor }]}>{selectedType}</Text>
          </View>
          <TouchableOpacity style={styles.enterBtn} onPress={handleDone}>
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
  stepContainer: { flex: 1, paddingHorizontal: 20 },
  welcomeText: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 24, lineHeight: 34, marginTop: 28, marginBottom: 20 },
  testCardOverlay: { ...StyleSheet.absoluteFillObject, top: 80, zIndex: 10, alignItems: "center", paddingHorizontal: 0 },
  testCard: { backgroundColor: "#1E1E24", borderRadius: 24, padding: 24, width: "100%", alignItems: "center", gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  testCardTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18, textAlign: "center" },
  testCardSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
  startTestBtn: { width: "100%", backgroundColor: COLORS.accentGreen, borderRadius: 50, paddingVertical: 16, alignItems: "center" },
  startTestText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 16 },
  alreadyKnowText: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 14, marginTop: 4 },
  typeScroll: { flex: 1 },
  typeScrollContent: { gap: 10, paddingBottom: 100 },
  typeRow: { flexDirection: "row", gap: 10 },
  typeCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 12, alignItems: "center", gap: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  typeCardSelected: { borderColor: COLORS.accentGreen, borderWidth: 2 },
  typeAvatarBg: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  typeAvatarEmoji: { fontSize: 26 },
  typeCode: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 13 },
  typeName: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "center" },
  bottomActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16 },
  dontKnowBtn: { backgroundColor: COLORS.bgCard, borderRadius: 50, paddingHorizontal: 20, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.glassBorder },
  dontKnowText: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14 },
  arrowBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  quizContainer: { justifyContent: "center", gap: 24 },
  quizProgress: { alignSelf: "center", backgroundColor: COLORS.bgCard, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  quizProgressText: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  quizQuestion: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20, lineHeight: 30, textAlign: "center" },
  quizOptions: { gap: 12 },
  quizOption: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: COLORS.glassBorder },
  quizOptionText: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", paddingVertical: 10 },
  backText: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 14 },
  completeContainer: { alignItems: "center", justifyContent: "center", gap: 16 },
  completeIcon: { marginBottom: 8 },
  completeTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 28 },
  completeSub: { color: COLORS.typeColor, fontFamily: "Inter_600SemiBold", fontSize: 18 },
  completeTagline: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
  typeShowcase: { backgroundColor: COLORS.typeBg, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 14, borderWidth: 1.5, borderColor: COLORS.typeColor + "50" },
  typeShowcaseCode: { fontFamily: "Inter_700Bold", fontSize: 36, letterSpacing: 2 },
  enterBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.accent, borderRadius: 50, paddingVertical: 16, paddingHorizontal: 32, marginTop: 8 },
  enterBtnText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 16 },
});
