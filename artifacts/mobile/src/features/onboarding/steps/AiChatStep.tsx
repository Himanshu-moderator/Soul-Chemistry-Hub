import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { ChatInput } from "../components/ChatInput";
import { TypeResult } from "../components/TypeResult";
import { usePersonaTyper, type ChatLine } from "../hooks/usePersonaTyper";

interface Props {
  // Called with the type once the interview ends and the person taps Continue.
  onResult: (type: string) => void;
  onProgress: (fraction: number) => void;
  // Lets someone switch to the classic questionnaire if the AI is not reachable.
  onUseQuiz: () => void;
}

// The PersonaAI interview: a real conversation with a language model. It asks a few
// open questions, reads your answers, and names your type once it is confident.
export function AiChatStep({ onResult, onProgress, onUseQuiz }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const typer = usePersonaTyper(onProgress);
  const [draft, setDraft] = useState("");
  const [showResult, setShowResult] = useState(false);
  const list = useRef<FlatList<ChatLine>>(null);

  // Keep the newest message in view.
  useEffect(() => {
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [typer.lines.length, typer.status]);

  // Give the closing message a moment, then show the result.
  useEffect(() => {
    if (typer.status !== "done") return;
    const t = setTimeout(() => setShowResult(true), 1800);
    return () => clearTimeout(t);
  }, [typer.status]);

  if (showResult && typer.result) {
    return <TypeResult type={typer.result.type} axes={typer.result.axes} intro="From our chat, you are" onContinue={() => onResult(typer.result!.type)} />;
  }

  const send = () => {
    typer.send(draft);
    setDraft("");
  };

  const Avatar = () => (
    <View style={styles.avatar}>
      <LogoMark size={30} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        ref={list}
        data={typer.lines}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            {typer.status === "thinking" && (
              <View style={styles.aiRow}>
                <Avatar />
                <View style={[styles.bubble, styles.theirs, styles.dots]}>
                  <View style={styles.dot} />
                  <View style={[styles.dot, { opacity: 0.6 }]} />
                  <View style={[styles.dot, { opacity: 0.3 }]} />
                </View>
              </View>
            )}
            {typer.status === "error" && (
              <View style={styles.error}>
                <Text style={styles.errorText}>{typer.error}</Text>
                <Button label="Try again" size="sm" onPress={typer.retry} />
                <Pressable accessibilityRole="button" onPress={onUseQuiz}>
                  <Text style={styles.link}>Take the classic questionnaire instead</Text>
                </Pressable>
              </View>
            )}
          </>
        }
        renderItem={({ item }) =>
          item.from === "ai" ? (
            <View style={styles.aiRow}>
              <Avatar />
              <View style={[styles.bubble, styles.theirs]}>
                <Text style={styles.text}>{item.text}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.userRow}>
              <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, styles.mine]}>
                <Text style={[styles.text, { color: colors.onAccent }]}>{item.text}</Text>
              </LinearGradient>
            </View>
          )
        }
      />

      {typer.status !== "done" && <ChatInput value={draft} onChange={setDraft} onSend={send} disabled={typer.status !== "your-turn"} />}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1 },
    list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 12 },
    aiRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "92%" },
    avatar: { width: 30, height: 30, flexShrink: 0 },
    userRow: { alignItems: "flex-end" },
    bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11, flexShrink: 1 },
    theirs: { backgroundColor: c.surface, borderBottomLeftRadius: 6 },
    mine: { borderBottomRightRadius: 6, maxWidth: "86%" },
    text: { color: c.text, fontFamily: font.regular, fontSize: 15.5, lineHeight: 22 },
    dots: { flexDirection: "row", gap: 5, paddingVertical: 15 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.textSecondary },
    error: { alignItems: "center", gap: 12, paddingVertical: 14 },
    errorText: { color: c.textSecondary, fontFamily: font.regular, fontSize: 14, textAlign: "center", lineHeight: 20 },
    link: { color: c.accent, fontFamily: font.semibold, fontSize: 14 },
  });
