import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatShell } from "@/components/chat/ChatShell";
import { ChatThemeSheet } from "@/components/chat/ChatThemeSheet";
import type { ChatMessage } from "@/components/chat/MessageBubble";
import { Avatar } from "@/components/ui";
import { CONNECTIONS } from "@/data/mockData";
import { FIRST_MESSAGE_LIMIT, SUPERCHAT_COST, useSoul } from "@/state/SoulContext";
import { font } from "@/theme/tokens";

// Anyone with these fields can be chatted with: the sample contacts and the people
// from the Soul deck.
export interface ChatContact {
  id: string;
  name: string;
  mbti: string;
  isOnline: boolean;
  lastSeen: string;
}

interface Props {
  contact: ChatContact | null;
  onClose: () => void;
}

const OPENING: ChatMessage[] = [
  { id: "o1", mine: false, text: "Hey! I saw your type analysis post, really insightful 👏", at: "2:30 PM" },
  { id: "o2", mine: true, text: "Thank you! Type nerds tend to over-analyze everything lol", at: "2:31 PM" },
  { id: "o3", mine: false, text: "Same here 😄 Do you think we're compatible?", at: "2:32 PM" },
];

// A direct chat. With a connection it is unlimited; with someone who has not accepted
// yet you can send up to three messages, or start a Superchat with coins to skip the wait.
export function DirectChat({ contact, onClose }: Props) {
  const soul = useSoul();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);

  if (!contact) return null;

  const first = contact.name.split(" ")[0];
  const sample = CONNECTIONS.some((c) => c.id === contact.id);
  const messages = [...(sample ? OPENING : []), ...soul.threadFor(contact.id)];
  const pending = soul.status(contact.id) === "pending";
  const left = soul.messagesLeft(contact.id);

  const send = () => {
    setError(null);
    const r = soul.send(contact.id, text);
    if (r.ok) setText("");
    else if (r.reason === "limit") setError(`You have used your ${FIRST_MESSAGE_LIMIT} first messages. Wait for ${first} to accept, or start a Superchat.`);
  };

  const superchat = async () => {
    setError(null);
    const r = await soul.superchat(contact.id, text);
    if (r.ok) setText("");
    else setError("Not enough coins for a Superchat.");
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
        placeholder={`Message ${first}`}
        error={error}
        empty={pending ? <Text style={styles.hint}>Say hello. {first} will see it with your request.</Text> : null}
        footer={
          <View style={{ gap: 8 }}>
            {soul.typing(contact.id) && (
              <View style={styles.typing}>
                <Text style={styles.typingText}>{first} is typing…</Text>
              </View>
            )}
            {pending && (
              <View style={styles.banner}>
                <Text style={styles.bannerText}>
                  {left > 0 ? `${first} has not accepted yet. ${left} of ${FIRST_MESSAGE_LIMIT} first messages left.` : `${first} has not accepted yet.`}
                </Text>
                <Pressable accessibilityRole="button" onPress={superchat} style={styles.bannerBtn}>
                  <Text style={styles.bannerBtnText}>Superchat · {SUPERCHAT_COST} coins</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
      />
      <ChatThemeSheet visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  typing: { paddingTop: 8, paddingLeft: 4 },
  typingText: { color: "rgba(244,243,250,0.55)", fontFamily: font.regular, fontSize: 12.5 },
  hint: { color: "rgba(244,243,250,0.55)", fontFamily: font.regular, fontSize: 14, textAlign: "center" },
  banner: { marginTop: 8, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 12, gap: 8, alignItems: "center" },
  bannerText: { color: "rgba(244,243,250,0.7)", fontFamily: font.regular, fontSize: 13, textAlign: "center" },
  bannerBtn: { backgroundColor: "#E7B341", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  bannerBtnText: { color: "#1B1100", fontFamily: font.semibold, fontSize: 13 },
});
