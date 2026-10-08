// The words and options used by onboarding, kept apart from the screens so
// they are easy to find and edit.

export const TYPE_ROWS = [
  ["INTJ", "INTP", "ENTJ", "ENTP"],
  ["INFJ", "INFP", "ENFJ", "ENFP"],
  ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  ["ISTP", "ISFP", "ESTP", "ESFP"],
] as const;

export const TYPE_EMOJIS: Record<string, string> = {
  INTJ: "🧐", INTP: "🤓", ENTJ: "👑", ENTP: "💡",
  INFJ: "🔮", INFP: "🌙", ENFJ: "🌟", ENFP: "✨",
  ISTJ: "📋", ISFJ: "🌺", ESTJ: "⚖️", ESFJ: "🤝",
  ISTP: "🔧", ISFP: "🎨", ESTP: "⚡", ESFP: "🎉",
};
