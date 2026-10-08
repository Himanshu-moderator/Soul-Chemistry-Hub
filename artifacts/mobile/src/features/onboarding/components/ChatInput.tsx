import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

// The message box at the bottom of the PersonaAI chat: free typing, no choices.
export function ChatInput({ value, onChange, onSend, disabled, placeholder = "Type your answer" }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const canSend = !disabled && value.trim().length > 0;

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={disabled ? "PersonaAI is thinking…" : placeholder}
        placeholderTextColor={colors.textTertiary}
        editable={!disabled}
        multiline
        maxLength={700}
        onSubmitEditing={onSend}
        blurOnSubmit={false}
        accessibilityLabel="Your answer"
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!canSend} onPress={onSend} style={[styles.send, !canSend && { opacity: 0.4 }]}>
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendFill}>
          <Feather name="arrow-up" size={20} color={colors.onAccent} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingBottom: 14, paddingTop: 8 },
    input: {
      flex: 1,
      minHeight: 46,
      maxHeight: 130,
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingTop: 13,
      paddingBottom: 13,
      color: c.text,
      fontFamily: font.regular,
      fontSize: 15.5,
      outlineStyle: "none",
    } as object,
    send: { width: 46, height: 46, borderRadius: 23, overflow: "hidden" },
    sendFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  });
