import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { font, radius } from "@/theme/tokens";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
  // Adds a show/hide toggle (for passwords).
  secret?: boolean;
  // A fixed prefix inside the field, e.g. "@".
  prefix?: string;
}

export function TextField({ label, error, secret, prefix, style, ...input }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.field, focused && { borderColor: colors.accent }, !!error && { borderColor: colors.danger }]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          {...input}
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secret ? hidden : input.secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
        />
        {secret && (
          <Pressable accessibilityLabel={hidden ? "Show password" : "Hide password"} onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Feather name={hidden ? "eye" : "eye-off"} size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    wrap: { gap: 6 },
    label: { color: c.textSecondary, fontFamily: font.medium, fontSize: 13 },
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: "transparent",
      paddingHorizontal: 16,
    },
    prefix: { color: c.textSecondary, fontFamily: font.medium, fontSize: 16 },
    input: { flex: 1, color: c.text, fontFamily: font.regular, fontSize: 16, paddingVertical: 15, outlineStyle: "none" } as object,
    error: { color: c.danger, fontFamily: font.regular, fontSize: 13 },
  });
