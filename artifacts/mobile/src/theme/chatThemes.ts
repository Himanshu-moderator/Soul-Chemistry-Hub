// Chat themes: a separate look for conversations (rooms and direct chats),
// picked per person and independent of the app theme.

export interface ChatTheme {
  id: string;
  name: string;
  blurb: string;
  // Chat background gradient, top to bottom.
  bg: [string, string];
  // Your bubbles (gradient) and theirs (flat).
  mine: [string, string];
  theirs: string;
  theirsText: string;
  mineText: string;
  // Send button and small highlights.
  accent: string;
  // Twinkling stars behind the messages.
  stars: boolean;
}

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: "nebula",
    name: "Nebula",
    blurb: "Violet haze with a starry sky",
    bg: ["#08061A", "#1B1040"],
    mine: ["#8B5CF6", "#C026D3"],
    theirs: "rgba(255,255,255,0.09)",
    theirsText: "#F4F3FA",
    mineText: "#FFFFFF",
    accent: "#A78BFA",
    stars: true,
  },
  {
    id: "aurora",
    name: "Aurora",
    blurb: "Calm teal and green glow",
    bg: ["#031412", "#08302B"],
    mine: ["#14B8A6", "#22C55E"],
    theirs: "rgba(255,255,255,0.08)",
    theirsText: "#EAFBF6",
    mineText: "#03150F",
    accent: "#2DD4BF",
    stars: false,
  },
  {
    id: "eclipse",
    name: "Eclipse",
    blurb: "Near-black with a golden edge",
    bg: ["#050505", "#14110A"],
    mine: ["#FBBF24", "#F59E0B"],
    theirs: "rgba(255,255,255,0.07)",
    theirsText: "#F5F0E1",
    mineText: "#1A1204",
    accent: "#FBBF24",
    stars: true,
  },
];

export const DEFAULT_CHAT_THEME_ID = "nebula";

export const getChatTheme = (id: string): ChatTheme => CHAT_THEMES.find((t) => t.id === id) ?? CHAT_THEMES[0];
