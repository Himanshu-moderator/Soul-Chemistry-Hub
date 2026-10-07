import type { ViewStyle } from "react-native";
import type { Colors } from "@/theme/themes";
import { radius } from "@/theme/tokens";

// Makes a long list read as ONE soft card instead of many boxes: every row shares
// a surface, the first row rounds the top, the last rounds the bottom, and a
// hairline separates the rows in between.
export function groupedRow(c: Colors, index: number, count: number): ViewStyle {
  const first = index === 0;
  const last = index === count - 1;
  return {
    backgroundColor: c.surface,
    paddingHorizontal: 16,
    borderTopLeftRadius: first ? radius.xl : 0,
    borderTopRightRadius: first ? radius.xl : 0,
    borderBottomLeftRadius: last ? radius.xl : 0,
    borderBottomRightRadius: last ? radius.xl : 0,
    borderBottomWidth: last ? 0 : 1,
    borderBottomColor: c.border,
  };
}
