import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Sheet, TextField } from "@/components/ui";
import { useStyles } from "@/theme/ThemeProvider";
import { font, radius } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";

interface TextEditProps {
  visible: boolean;
  title: string;
  initial: string;
  multiline?: boolean;
  maxLength: number;
  onClose: () => void;
  onSave: (value: string) => void;
}

// A sheet with one text field (used for your name and bio).
export function TextEditSheet({ visible, title, initial, multiline, maxLength, onClose, onSave }: TextEditProps) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    if (visible) setValue(initial);
  }, [visible, initial]);

  const save = () => {
    const clean = value.trim();
    if (!multiline && !clean) return;
    onSave(clean);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <TextField value={value} onChangeText={setValue} maxLength={maxLength} multiline={multiline} autoFocus style={multiline ? { minHeight: 90, textAlignVertical: "top" } : undefined} />
      <Button label="Save" onPress={save} />
    </Sheet>
  );
}

interface PickProps {
  visible: boolean;
  title: string;
  options: string[];
  current: string;
  tint: (option: string) => string;
  onClose: () => void;
  onPick: (value: string) => void;
}

// A sheet that lists choices as chips (used for the type pickers).
export function PickSheet({ visible, title, options, current, tint, onClose, onPick }: PickProps) {
  const styles = useStyles(makeStyles);
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.grid}>
        {options.map((o) => {
          const on = o === current;
          const color = tint(o);
          return (
            <Pressable
              key={o}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                onPick(o);
                onClose();
              }}
              style={[styles.chip, { backgroundColor: withAlpha(color, on ? 0.3 : 0.12), borderColor: on ? color : "transparent" }]}
            >
              <Text style={[styles.chipText, { color }]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const makeStyles = (_c: Colors) =>
  StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: { minWidth: "21%", flexGrow: 1, alignItems: "center", paddingVertical: 12, borderRadius: radius.md, borderWidth: 1.5 },
    chipText: { fontFamily: font.bold, fontSize: 15 },
  });
