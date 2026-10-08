// Sample people for the Soul deck. This is a prototype with no real matching
// backend, so these profiles are invented. Swap `photos` for real image URLs and the
// deck shows them instead of the illustrated portraits.

export type InterestKind = "Hobby" | "Music" | "Food" | "Travel" | "Value";

export interface Interest {
  kind: InterestKind;
  label: string;
  emoji: string;
}

export interface SoulPerson {
  id: string;
  name: string;
  age: number;
  city: string;
  flag: string;
  mbti: string;
  enneagram: string;
  relationship: string; // what they are looking for
  askMe: string;
  about: string;
  verified: boolean;
  isNew: boolean;
  isOnline: boolean;
  lastSeen: string;
  // Two colours for the illustrated portrait, used while a photo is loading or missing.
  tones: [string, string];
  // Profile picture, cover picture and the rest of the gallery (image URLs).
  dp: string;
  cover: string;
  photos: string[];
  idols: { name: string; emoji: string }[];
  thoughts: { text: string; when: string }[];
  activities: { emoji: string; text: string; when: string }[];
  interests: Interest[];
  // They have already liked you: liking them back is an instant match.
  likesYou?: { message?: string };
  // They accept your request a few seconds after you send it (demo behaviour).
  autoAccept?: boolean;
}

const h = (label: string, emoji: string): Interest => ({ kind: "Hobby", label, emoji });
const m = (label: string, emoji: string): Interest => ({ kind: "Music", label, emoji });
const f = (label: string, emoji: string): Interest => ({ kind: "Food", label, emoji });
const t = (label: string, emoji: string): Interest => ({ kind: "Travel", label, emoji });
const v = (label: string, emoji: string): Interest => ({ kind: "Value", label, emoji });

type Raw = Omit<SoulPerson, "dp" | "cover" | "photos" | "idols" | "thoughts" | "activities">;

const RAW: Raw[] = [
  {
    id: "s1", name: "Anushka", age: 20, city: "Uttar Pradesh", flag: "🇮🇳", mbti: "ISTJ", enneagram: "6w5",
    relationship: "Consigliere", askMe: "What gives life meaning",
    about: "I know suturing. So better see what you speak. Quiet planner, loud laugh once you know me.",
    verified: true, isNew: true, isOnline: true, lastSeen: "now", tones: ["#7C5CFF", "#F472B6"],
    interests: [h("Science", "🔬"), h("Philosophy", "🏛️"), h("Medicine", "🩺"), m("Lo-fi music", "🎧"), h("Video games", "🎮"), h("Art", "🎨"), t("Hiking", "🥾"), h("Swimming", "🏊"), h("Dogs", "🐕")],
    likesYou: { message: "Your type caught my eye. Hi!" }, autoAccept: true,
  },
  {
    id: "s2", name: "Kabir", age: 25, city: "Mumbai", flag: "🇮🇳", mbti: "ENTP", enneagram: "7w8",
    relationship: "Partner in crime", askMe: "My worst startup idea",
    about: "Will argue about anything for fun. Terrible at replying fast, great at showing up.",
    verified: true, isNew: false, isOnline: true, lastSeen: "now", tones: ["#22D3EE", "#6366F1"],
    interests: [h("Startups", "🚀"), h("Stand-up comedy", "🎤"), m("Indie rock", "🎸"), f("Street food", "🌮"), t("Road trips", "🚗"), h("Chess", "♟️")],
    autoAccept: true,
  },
  {
    id: "s3", name: "Meera", age: 23, city: "Bengaluru", flag: "🇮🇳", mbti: "INFJ", enneagram: "4w5",
    relationship: "Deep conversations", askMe: "The book that changed me",
    about: "Tea, rain and long voice notes. I notice small things about people.",
    verified: true, isNew: false, isOnline: false, lastSeen: "1h ago", tones: ["#34D399", "#0EA5E9"],
    interests: [h("Reading", "📚"), h("Journaling", "📓"), f("Chai", "🍵"), m("Classical", "🎻"), h("Photography", "📷"), t("Mountains", "🏔️"), v("Kindness", "🌱")],
    likesYou: { message: "Do you also overthink your own type? 😅" },
  },
  {
    id: "s4", name: "Rohan", age: 27, city: "Delhi", flag: "🇮🇳", mbti: "INTJ", enneagram: "5w6",
    relationship: "Study buddy", askMe: "How I plan my week",
    about: "Systems nerd. Will happily explain the plot of any strategy game. Coffee snob.",
    verified: false, isNew: true, isOnline: true, lastSeen: "now", tones: ["#F59E0B", "#EF4444"],
    interests: [h("Strategy games", "🎲"), h("Coding", "💻"), f("Coffee", "☕"), m("Synthwave", "🎹"), h("Cycling", "🚴"), v("Honesty", "🧭")],
  },
  {
    id: "s5", name: "Isha", age: 21, city: "Pune", flag: "🇮🇳", mbti: "ENFP", enneagram: "7w6",
    relationship: "New friends", askMe: "My weirdest hobby",
    about: "Collects hobbies like trading cards. Currently learning pottery and the ukulele (badly).",
    verified: true, isNew: false, isOnline: true, lastSeen: "now", tones: ["#F472B6", "#FB923C"],
    interests: [h("Pottery", "🏺"), m("Ukulele", "🎶"), h("Dancing", "💃"), f("Baking", "🧁"), t("Beaches", "🏖️"), h("Cats", "🐈"), v("Curiosity", "✨")],
    likesYou: {},
    autoAccept: true,
  },
  {
    id: "s6", name: "Arjun", age: 26, city: "Hyderabad", flag: "🇮🇳", mbti: "ISFP", enneagram: "9w8",
    relationship: "Something slow and real", askMe: "My favourite quiet place",
    about: "Sketchbook in my bag, headphones on. Prefer one good conversation to ten loud ones.",
    verified: true, isNew: false, isOnline: false, lastSeen: "3h ago", tones: ["#A78BFA", "#38BDF8"],
    interests: [h("Sketching", "✏️"), m("Lo-fi", "🎧"), h("Film photography", "🎞️"), f("Biryani", "🍛"), t("Night walks", "🌙"), v("Calm", "🕊️")],
  },
  {
    id: "s7", name: "Tara", age: 24, city: "Kolkata", flag: "🇮🇳", mbti: "ENFJ", enneagram: "2w3",
    relationship: "Soulmate", askMe: "What I'd do with a free year",
    about: "I host dinner parties for people who just met. Ask me for a playlist.",
    verified: true, isNew: true, isOnline: true, lastSeen: "now", tones: ["#FB7185", "#8B5CF6"],
    interests: [h("Hosting", "🍽️"), m("Jazz", "🎷"), h("Theatre", "🎭"), f("Cooking", "🍳"), t("Old cities", "🏛️"), v("Loyalty", "🤝")],
    autoAccept: true,
  },
  {
    id: "s8", name: "Vihaan", age: 28, city: "Jaipur", flag: "🇮🇳", mbti: "ISTP", enneagram: "8w7",
    relationship: "Adventure partner", askMe: "My last repair disaster",
    about: "Fixes bikes, breaks plans. Happiest on a highway with no destination.",
    verified: false, isNew: false, isOnline: false, lastSeen: "yesterday", tones: ["#0EA5E9", "#14B8A6"],
    interests: [h("Motorbikes", "🏍️"), h("Mechanics", "🔧"), t("Deserts", "🏜️"), m("Rock", "🤘"), f("Dhaba food", "🥘"), v("Freedom", "🦅")],
  },
  {
    id: "s9", name: "Naina", age: 22, city: "Chennai", flag: "🇮🇳", mbti: "INFP", enneagram: "4w3",
    relationship: "Pen pal to partner", askMe: "A song I can't skip",
    about: "Writes poems nobody asked for. Will remember your birthday and your favourite colour.",
    verified: true, isNew: false, isOnline: true, lastSeen: "now", tones: ["#C084FC", "#F472B6"],
    interests: [h("Poetry", "🪶"), m("Indie folk", "🪕"), h("Stargazing", "🔭"), f("Filter coffee", "☕"), h("Anime", "🌸"), v("Empathy", "💜")],
  },
  {
    id: "s10", name: "Dev", age: 29, city: "Ahmedabad", flag: "🇮🇳", mbti: "ESTJ", enneagram: "1w9",
    relationship: "Serious relationship", askMe: "My five-year plan",
    about: "Organised, dependable, secretly a softie. Looking for someone who laughs at my spreadsheets.",
    verified: true, isNew: false, isOnline: false, lastSeen: "2h ago", tones: ["#F59E0B", "#10B981"],
    interests: [h("Finance", "📈"), h("Cricket", "🏏"), h("Fitness", "🏋️"), f("Home cooking", "🍲"), t("Family trips", "🧳"), v("Reliability", "⚓")],
  },
];

// Placeholder pictures for the prototype: faces from pravatar.cc (a free set made for
// mock-ups) and everyday scenes from picsum.photos for the cover and the rest of the
// gallery. They are random stand-ins, not these characters' real photos: replace the
// URLs with real uploads when there is a backend.
const face = (img: number | string) => (typeof img === "string" ? img : `https://i.pravatar.cc/800?img=${img}`);
const scene = (seed: string, w: number, h: number) => `https://picsum.photos/seed/pdb-${seed}/${w}/${h}`;

interface Extra {
  img: number | string; // a pravatar face number, or a full image URL
  idols: [string, string][];
  thoughts: string[];
}

const EXTRA: Record<string, Extra> = {
  s1: { img: "https://images.pexels.com/photos/4584566/pexels-photo-4584566.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1600&fit=crop", idols: [["Dr. Kalpana Chawla", "🚀"], ["Marie Curie", "🔬"], ["Socrates", "🏛️"]], thoughts: ["Anatomy exams taught me patience more than any book.", "Is it normal to feel calmest at 3 a.m.?"] },
  s2: { img: 12, idols: [["Elon Musk", "🛰️"], ["Zakir Khan", "🎤"], ["Steve Jobs", "🍎"]], thoughts: ["Pitched a terrible idea today. 10/10 would pitch again.", "Debate me about pineapple on pizza."] },
  s3: { img: 32, idols: [["Maya Angelou", "🪶"], ["Haruki Murakami", "📚"], ["Ruskin Bond", "🏔️"]], thoughts: ["Rain plus chai plus a good book is a complete personality.", "Some silences are the loudest kind of honest."] },
  s4: { img: 59, idols: [["Nikola Tesla", "⚡"], ["Magnus Carlsen", "♟️"], ["Ratan Tata", "🏭"]], thoughts: ["Optimising my morning routine again. Send help.", "Best code I wrote this year was a delete."] },
  s5: { img: 44, idols: [["Frida Kahlo", "🎨"], ["Prajakta Koli", "📹"], ["Hayao Miyazaki", "🌸"]], thoughts: ["My pottery bowl looks like a hat. I love it.", "New hobby unlocked, again."] },
  s6: { img: 53, idols: [["Vincent van Gogh", "🌻"], ["Satyajit Ray", "🎞️"], ["A. R. Rahman", "🎹"]], thoughts: ["Drew the same window five times today. Each time different.", "Quiet is not empty."] },
  s7: { img: 16, idols: [["Michelle Obama", "💛"], ["Oprah Winfrey", "🎙️"], ["Rabindranath Tagore", "🪔"]], thoughts: ["Hosted nine strangers for dinner. We left as friends.", "Good playlists are love letters."] },
  s8: { img: 14, idols: [["Ayrton Senna", "🏎️"], ["Anthony Bourdain", "🍜"], ["Che Guevara", "🧭"]], thoughts: ["Another weekend, another highway.", "Rule one: fix it yourself."] },
  s9: { img: 45, idols: [["Emily Dickinson", "🪶"], ["Hozier", "🎸"], ["Gulzar", "🌙"]], thoughts: ["Wrote a poem on a receipt. Kept the receipt.", "Why do songs feel like memories I have not lived yet?"] },
  s10: { img: 54, idols: [["Sachin Tendulkar", "🏏"], ["Warren Buffett", "📈"], ["Dhirubhai Ambani", "🏢"]], thoughts: ["Discipline is just self respect in action.", "Sunday: meal prep, budget review, call parents."] },
};

const WHEN = ["2h ago", "yesterday", "3d ago", "last week"];

const SOUL_PEOPLE_FULL: SoulPerson[] = RAW.map((r) => {
  const x = EXTRA[r.id];
  // First photo is the face; the others are things they might have posted.
  const photos = [face(x.img), ...[1, 2, 3, 4].map((i) => scene(`${r.id}-${i}`, 800, 1100))];
  return {
    ...r,
    dp: photos[0],
    cover: scene(`${r.id}-cover`, 900, 600),
    photos,
    idols: x.idols.map(([name, emoji]) => ({ name, emoji })),
    thoughts: x.thoughts.map((text, i) => ({ text, when: WHEN[i % WHEN.length] })),
    activities: [
      { emoji: "🌌", text: `Joined the ${r.mbti} community`, when: "4d ago" },
      { emoji: r.interests[0].emoji, text: `Added ${r.interests[0].label} to their card`, when: "6d ago" },
      { emoji: "✨", text: "Finished the daily check-in", when: "today" },
    ],
  };
});

export { SOUL_PEOPLE_FULL as SOUL_PEOPLE };

export const personById = (id: string) => SOUL_PEOPLE_FULL.find((p) => p.id === id);
