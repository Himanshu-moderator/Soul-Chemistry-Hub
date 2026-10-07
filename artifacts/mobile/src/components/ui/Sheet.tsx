import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStyles } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  // Cap the height as a fraction of the screen (the content scrolls beyond it).
  maxHeight?: number | `${number}%`;
}

// A bottom sheet over a dimmed backdrop. Tap the backdrop to close it.
export function Sheet({ visible, onClose, title, children, maxHeight = "86%" }: Props) {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight, paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.handle} />
          {title && <Text style={styles.title}>{title}</Text>}
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14 }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "flex-end", alignItems: "center", backgroundColor: c.overlay },
    sheet: {
      width: "100%",
      maxWidth: 440,
      backgroundColor: c.surfaceSolid,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 10,
      gap: 14,
    },
    handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: c.surfaceStrong, marginBottom: 4 },
    title: { ...type.title, color: c.text, fontFamily: font.bold },
  });
