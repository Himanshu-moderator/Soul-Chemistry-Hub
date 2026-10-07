import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "@/components/ui";
import { font } from "@/theme/tokens";

interface Props {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode; // avatar or community badge
  onBack: () => void;
  onTheme: () => void;
}

// Top bar of a conversation: back, who it is, and the chat-theme picker.
export function ChatHeader({ title, subtitle, leading, onBack, onTheme }: Props) {
  return (
    <View style={styles.bar}>
      <IconButton icon="arrow-left" label="Back" onPress={onBack} />
      {leading}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.sub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <IconButton icon="droplet" label="Chat theme" onPress={onTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  title: { color: "#F4F3FA", fontFamily: font.bold, fontSize: 17, letterSpacing: -0.2 },
  sub: { color: "rgba(244,243,250,0.6)", fontFamily: font.regular, fontSize: 12.5, marginTop: 1 },
});
