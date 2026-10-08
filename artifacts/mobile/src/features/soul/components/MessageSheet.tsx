import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Sheet } from "@/components/ui";
import type { SoulPerson } from "@/data/people";
import { useApp } from "@/state/AppContext";
import { FIRST_MESSAGE_LIMIT, SUPERCHAT_COST, useSoul } from "@/state/SoulContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Props {
  person: SoulPerson | null;
  onClose: () => void;
  // Called after a Superchat, so the screen can open the chat straight away.
  onSuperchat: (person: SoulPerson) => void;
}

// Say hello before they have accepted: up to three messages, or spend coins on a
// Superchat to skip the request and start talking right away.
export function MessageSheet({ person, onClose, onSuperchat }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { coins } = useApp();
  const { send, superchat, messagesLeft, threadFor, status } = useSoul();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!person) return null;
  const first = person.name.split(" ")[0];
  const left = messagesLeft(person.id);
  const sent = threadFor(person.id).filter((m) => m.mine);
  const enough = coins >= SUPERCHAT_COST;
  // They accepted while the sheet was open: no limits any more, so go to the real chat.
  const accepted = status(person.id) === "connected";

  const submit = () => {
    setError(null);
    const r = send(person.id, text);
    if (r.ok) setText("");
    else if (r.reason === "limit") setError(`You have used your ${FIRST_MESSAGE_LIMIT} first messages.`);
  };

  const goSuper = async () => {
    setError(null);
    setBusy(true);
    const r = await superchat(person.id, text);
    setBusy(false);
    if (r.ok) {
      setText("");
      onClose();
      onSuperchat(person);
    } else {
      setError("Not enough coins for a Superchat.");
    }
  };

  return (
    <Sheet visible onClose={onClose} title={`Message ${first}`}>
      <Text style={styles.sub}>
        {accepted
          ? `${first} accepted your request. You can chat freely now.`
          : left > 0
          ? `Say something real. You can send ${FIRST_MESSAGE_LIMIT} messages until ${first} accepts. ${left} left.`
          : `${first} has not accepted yet. Wait for their reply, or start a Superchat.`}
      </Text>

      {sent.length > 0 && (
        <View style={{ gap: 6 }}>
          {sent.map((m) => (
            <View key={m.id} style={styles.sentBubble}>
              <Text style={styles.sentText}>{m.text}</Text>
            </View>
          ))}
        </View>
      )}

      {accepted && (
        <Button
          label={`Open chat with ${first}`}
          onPress={() => {
            onClose();
            onSuperchat(person);
          }}
        />
      )}

      {!accepted && left > 0 && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={`Hi ${first}…`}
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={240}
            accessibilityLabel="Your message"
          />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {!accepted && left > 0 && <Button label="Send message" onPress={submit} disabled={!text.trim()} />}

      {!accepted && (
      <View style={styles.superBox}>
        <View style={styles.superHead}>
          <Ionicons name="flash" size={18} color={colors.gold} />
          <Text style={styles.superTitle}>Superchat</Text>
          <Text style={styles.superCost}>{SUPERCHAT_COST} coins</Text>
        </View>
        <Text style={styles.superText}>Skip the request and chat with {first} straight away, with no message limit.</Text>
        {enough ? (
          <Button label={`Superchat for ${SUPERCHAT_COST} coins`} variant="secondary" onPress={goSuper} loading={busy} />
        ) : (
          <Button
            label={`You have ${coins} coins. Get more`}
            variant="secondary"
            onPress={() => {
              onClose();
              router.push("/market" as never);
            }}
          />
        )}
      </View>
      )}
    </Sheet>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    sub: { color: c.textSecondary, fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
    sentBubble: { alignSelf: "flex-end", maxWidth: "85%", backgroundColor: c.accentSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16, borderBottomRightRadius: 4 },
    sentText: { color: c.text, fontFamily: font.regular, fontSize: 14 },
    inputRow: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: 12 },
    input: { color: c.text, fontFamily: font.regular, fontSize: 15, minHeight: 56, maxHeight: 120, textAlignVertical: "top", outlineStyle: "none" } as object,
    error: { color: c.danger, fontFamily: font.medium, fontSize: 13 },
    superBox: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: 14, gap: 10 },
    superHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    superTitle: { color: c.text, fontFamily: font.semibold, fontSize: 15, flex: 1 },
    superCost: { color: c.gold, fontFamily: font.semibold, fontSize: 13 },
    superText: { color: c.textSecondary, fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  });
