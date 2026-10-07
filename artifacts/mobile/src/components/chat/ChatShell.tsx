import React, { useRef } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { useTheme } from "@/theme/ThemeProvider";
import { Composer } from "./Composer";
import { MessageBubble, type ChatMessage } from "./MessageBubble";

interface Props {
  header: React.ReactNode;
  messages: ChatMessage[];
  showAuthors?: boolean;
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder: string;
  error?: string | null;
  empty?: React.ReactNode;
  // Shown under the last message (e.g. a typing indicator).
  footer?: React.ReactNode;
}

// The common layout for a conversation: themed sky, header, messages, composer.
export function ChatShell({ header, messages, showAuthors, value, onChange, onSend, sending, placeholder, error, empty, footer }: Props) {
  const insets = useSafeAreaInsets();
  const { chatTheme } = useTheme();
  const list = useRef<FlatList<ChatMessage>>(null);

  return (
    <CosmicBackground sky={chatTheme.bg} glow={chatTheme.accent} noStars={!chatTheme.stars}>
      <KeyboardAvoidingView style={{ flex: 1, paddingTop: insets.top }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {header}
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={empty ? <View style={styles.empty}>{empty}</View> : null}
          ListFooterComponent={footer ? <View>{footer}</View> : null}
          renderItem={({ item }) => <MessageBubble message={item} showAuthor={showAuthors} />}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Composer value={value} onChange={onChange} onSend={onSend} placeholder={placeholder} sending={sending} />
      </KeyboardAvoidingView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10, flexGrow: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 60 },
  error: { color: "#FB7185", textAlign: "center", paddingVertical: 4, fontSize: 13 },
});
