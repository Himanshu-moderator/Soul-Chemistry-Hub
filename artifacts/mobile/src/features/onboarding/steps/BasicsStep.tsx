import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextField } from "@/components/ui";
import { useStyles } from "@/theme/ThemeProvider";
import { type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

export interface Basics {
  name: string;
  username: string;
  bio: string;
}

interface Props {
  initial: Basics;
  // Returns an error message to show, or null when saved.
  onSubmit: (values: Basics) => Promise<string | null>;
}

// Step 1: how other people will see you.
export function BasicsStep({ initial, onSubmit }: Props) {
  const styles = useStyles(makeStyles);
  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The saved profile can arrive after this step mounted (e.g. after a reload).
  React.useEffect(() => {
    setName((n) => n || initial.name);
    setUsername((u) => u || initial.username);
  }, [initial.name, initial.username]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const message = await onSubmit({ name, username, bio });
    setBusy(false);
    if (message) setError(message);
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.title}>Let's set up your profile</Text>
      <Text style={styles.sub}>This is how other people will see you.</Text>

      <View style={styles.fields}>
        <TextField label="Your name" value={name} onChangeText={setName} placeholder="Alex Rivera" maxLength={40} autoCapitalize="words" />
        <TextField
          label="Username"
          prefix="@"
          value={username}
          onChangeText={(t) => setUsername(t.replace(/[^a-zA-Z0-9_]/g, ""))}
          placeholder="alex_rivera"
          maxLength={20}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField label="Bio (optional)" value={bio} onChangeText={setBio} placeholder="A line or two about you" maxLength={160} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Continue" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32, gap: 14 },
    emoji: { fontSize: 44, textAlign: "center" },
    title: { ...type.title, color: c.text, textAlign: "center" },
    sub: { ...type.body, color: c.textSecondary, textAlign: "center", marginBottom: 6 },
    fields: { gap: 16 },
    error: { ...type.body, color: c.danger },
  });
