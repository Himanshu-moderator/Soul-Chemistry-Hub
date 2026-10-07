import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  sending?: boolean;
}

// The message box and send button at the bottom of a chat.
export function Composer({ value, onChange, onSend, placeholder, sending }: Props) {
  const insets = useSafeAreaInsets();
  const { chatTheme } = useTheme();
  const can = value.trim().length > 0 && !sending;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        maxLength={500}
        multiline
        accessibilityLabel="Message"
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!can} onPress={onSend} style={{ opacity: can ? 1 : 0.45 }}>
        <LinearGradient colors={chatTheme.mine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.send}>
          <Ionicons name="arrow-up" size={20} color={chatTheme.mineText} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 14, paddingTop: 10 },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 11,
    color: "#FFFFFF",
    fontFamily: font.regular,
    fontSize: 15.5,
    outlineStyle: "none",
  } as object,
  send: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
