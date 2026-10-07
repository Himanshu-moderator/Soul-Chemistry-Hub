import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { LogoMark } from "@/components/brand/Logo";
import { typeFromAnswers } from "@/lib/personality";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { AI_FLOW } from "../content";

interface Msg {
  id: string;
  from: "ai" | "user";
  text: string;
}

interface Props {
  // Called with the computed type once the conversation ends.
  onResult: (type: string) => void;
  onProgress: (fraction: number) => void;
}

// The scripted PersonaAI conversation: three real questions, then a type.
export function AiChatStep({ onResult, onProgress }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Msg[]>([{ id: "ai-0", from: "ai", text: AI_FLOW[0].text }]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  const scroll = () => later(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const choose = (optionIndex: number) => {
    const options = AI_FLOW[index].options;
    if (!options || typing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const nextChoices = [...choices, optionIndex];
    setChoices(nextChoices);
    setMessages((m) => [...m, { id: `u-${index}`, from: "user", text: options[optionIndex] }]);
    setTyping(true);
    scroll();

    const next = index + 1;
    later(() => {
      setTyping(false);
      setIndex(next);
      setMessages((m) => [...m, { id: `ai-${next}`, from: "ai", text: AI_FLOW[next].text }]);
      onProgress(0.15 + (next / AI_FLOW.length) * 0.5);
      scroll();
      if (next === AI_FLOW.length - 1) {
        // choices[0] is the opening "ready?" answer; the next three are the real questions
        const type = typeFromAnswers(nextChoices[1] ?? 0, nextChoices[2] ?? 0, nextChoices[3] ?? 0);
        later(() => onResult(type), 1600);
      }
    }, 1100);
  };

  const options = AI_FLOW[index].options;

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          typing ? (
            <View style={styles.aiRow}>
              <View style={{ width: 30, height: 30, flexShrink: 0 }}><LogoMark size={30} /></View>
              <View style={[styles.bubble, styles.theirs, styles.dots]}>
                <View style={styles.dot} />
                <View style={[styles.dot, { opacity: 0.6 }]} />
                <View style={[styles.dot, { opacity: 0.3 }]} />
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          item.from === "ai" ? (
            <View style={styles.aiRow}>
              <View style={{ width: 30, height: 30, flexShrink: 0 }}><LogoMark size={30} /></View>
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

      {options && !typing && (
        <View style={styles.options}>
          {options.map((label, i) => (
            <Pressable key={label} onPress={() => choose(i)} style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.surfaceStrong }]}>
              <Text style={styles.optionText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1 },
    list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 12 },
    aiRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "92%" },
    userRow: { alignItems: "flex-end" },
    bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11, flexShrink: 1 },
    theirs: { backgroundColor: c.surface, borderBottomLeftRadius: 6 },
    mine: { borderBottomRightRadius: 6, maxWidth: "86%" },
    text: { color: c.text, fontFamily: font.regular, fontSize: 15.5, lineHeight: 22 },
    dots: { flexDirection: "row", gap: 5, paddingVertical: 15 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.textSecondary },
    options: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
    option: { backgroundColor: c.surface, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 18 },
    optionText: { color: c.text, fontFamily: font.medium, fontSize: 15 },
  });
