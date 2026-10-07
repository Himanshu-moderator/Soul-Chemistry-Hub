import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "@/components/ui";
import { useTheme } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";

export interface ChatMessage {
  id: string;
  mine: boolean;
  text: string;
  at: string; // ISO time, or a ready-made label
  author?: { name: string; mbti: string | null };
}

const timeLabel = (at: string) => {
  const d = new Date(at);
  return isNaN(d.getTime()) ? at : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

interface Props {
  message: ChatMessage;
  // Show the author's name and avatar (rooms); direct chats don't need it.
  showAuthor?: boolean;
}

// One message, styled by the active chat theme.
export function MessageBubble({ message, showAuthor = false }: Props) {
  const { chatTheme } = useTheme();
  const { mine, text, at, author } = message;

  return (
    <View style={[styles.row, mine && styles.rowMine]}>
      {!mine && showAuthor && author && <Avatar name={author.name} size={32} mbti={author.mbti} />}
      {mine ? (
        <LinearGradient colors={chatTheme.mine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, styles.bubbleMine]}>
          <Text style={[styles.text, { color: chatTheme.mineText }]}>{text}</Text>
          <Text style={[styles.time, { color: chatTheme.mineText, opacity: 0.65 }]}>{timeLabel(at)}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.bubbleTheirs, { backgroundColor: chatTheme.theirs }]}>
          {showAuthor && author && <Text style={[styles.author, { color: chatTheme.accent }]}>{author.name}</Text>}
          <Text style={[styles.text, { color: chatTheme.theirsText }]}>{text}</Text>
          <Text style={[styles.time, { color: chatTheme.theirsText, opacity: 0.5 }]}>{timeLabel(at)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "86%" },
  rowMine: { alignSelf: "flex-end" },
  bubble: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, flexShrink: 1 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleTheirs: { borderBottomLeftRadius: 6 },
  author: { fontFamily: font.semibold, fontSize: 12, marginBottom: 2 },
  text: { fontFamily: font.regular, fontSize: 15, lineHeight: 21 },
  time: { fontFamily: font.regular, fontSize: 10, marginTop: 3, alignSelf: "flex-end" },
});
