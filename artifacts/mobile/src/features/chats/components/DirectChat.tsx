import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatShell } from "@/components/chat/ChatShell";
import { ChatThemeSheet } from "@/components/chat/ChatThemeSheet";
import type { ChatMessage } from "@/components/chat/MessageBubble";
import { Avatar } from "@/components/ui";
import { CONNECTIONS } from "@/data/mockData";
import { font } from "@/theme/tokens";

type Contact = (typeof CONNECTIONS)[number];

interface Props {
  contact: Contact | null;
  onClose: () => void;
}

const OPENING: ChatMessage[] = [
  { id: "o1", mine: false, text: "Hey! I saw your type analysis post, really insightful 👏", at: "2:30 PM" },
  { id: "o2", mine: true, text: "Thank you! Type nerds tend to over-analyze everything lol", at: "2:31 PM" },
  { id: "o3", mine: false, text: "Same here 😄 Do you think we're compatible?", at: "2:32 PM" },
];

const REPLIES = ["Haha, I was thinking the same thing 😄", "Tell me more!", "That's a great point.", "Ha, fair enough 🙌", "Love that. Talk soon!"];

// A direct chat with one of the sample contacts. Whatever you send gets a
// friendly scripted reply (real conversations happen in communities).
export function DirectChat({ contact, onClose }: Props) {
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({});
  const [text, setText] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (!contact) return null;

  const messages = [...OPENING, ...(sent[contact.id] ?? [])];
  const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const send = () => {
    const body = text.trim();
    if (!body) return;
    const id = contact.id;
    setSent((cur) => ({ ...cur, [id]: [...(cur[id] ?? []), { id: `me-${Date.now()}`, mine: true, text: body, at: now() }] }));
    setText("");
    setTyping(id);
    timers.current.push(
      setTimeout(() => {
        const reply: ChatMessage = { id: `them-${Date.now()}`, mine: false, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], at: now() };
        setSent((cur) => ({ ...cur, [id]: [...(cur[id] ?? []), reply] }));
        setTyping((t) => (t === id ? null : t));
      }, 1300)
    );
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ChatShell
        header={
          <ChatHeader
            title={contact.name}
            subtitle={`${contact.mbti} · ${contact.isOnline ? "Online" : `Seen ${contact.lastSeen}`}`}
            leading={<Avatar name={contact.name} size={38} mbti={contact.mbti} online={contact.isOnline} />}
            onBack={onClose}
            onTheme={() => setThemeOpen(true)}
          />
        }
        messages={messages}
        value={text}
        onChange={setText}
        onSend={send}
        placeholder={`Message ${contact.name.split(" ")[0]}`}
        footer={
          typing === contact.id ? (
            <View style={styles.typing}>
              <Text style={styles.typingText}>{contact.name.split(" ")[0]} is typing…</Text>
            </View>
          ) : null
        }
      />
      <ChatThemeSheet visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  typing: { paddingTop: 8, paddingLeft: 4 },
  typingText: { color: "rgba(244,243,250,0.55)", fontFamily: font.regular, fontSize: 12.5 },
});
