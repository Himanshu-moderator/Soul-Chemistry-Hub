# How the Pdb code is organised

Everything for the app lives in `artifacts/mobile/src`. The rule of thumb: **a screen is a feature, a feature is a folder.** To change what a screen does or looks like, open `src/features/<screen>/`.

```
artifacts/mobile/
├── app.json / app.config.js    Expo config (name, icon, splash, web base path)
├── assets/images/              Logo, app icon, splash and favicon (see docs/BRANDING.md)
├── metro.config.js             Bundler config (+ the optional test-backend switch)
└── src/
    ├── app/                    ROUTES ONLY. One tiny file per URL; each re-exports a screen
    │   ├── _layout.tsx           providers, fonts, intro animation, the route gate
    │   ├── index.tsx             → features/welcome
    │   ├── auth.tsx              → features/auth
    │   ├── onboarding.tsx        → features/onboarding
    │   ├── edit-profile.tsx      → features/profile (EditProfileScreen)
    │   ├── person/[id].tsx       → features/soul (PersonProfileScreen)
    │   ├── community/[id].tsx    → features/community
    │   └── (tabs)/               the five tabs: index, chats, soul, profile, market
    │
    ├── features/               SCREENS, one folder each (all the logic for that screen)
    │   ├── welcome/              first screen for signed-out visitors
    │   ├── auth/                 sign in, sign up, forgot password, check-your-email
    │   ├── onboarding/           the set-up flow
    │   │   ├── OnboardingScreen.tsx   the flow and its progress bar
    │   │   ├── steps/                 one file per step (basics, finder, quiz, AI chat, type grid, communities, done)
    │   │   ├── components/            LikertScale, TypeResult, ChatInput
    │   │   ├── hooks/                 usePersonaTyper (the AI interview)
    │   │   └── content.ts             type grid and emoji tables
    │   ├── explore/              ExploreScreen.tsx + components/ (person row, check-in, type guide)
    │   ├── chats/                ChatsScreen.tsx + components/ (inbox, requests, community list, direct chat)
    │   ├── community/            the live chat room for one community
    │   ├── soul/                 the deck of people: SoulScreen, PersonProfileScreen, components/
    │   ├── profile/              ProfileScreen, EditProfileScreen, components/ (top, about, badges, insights, themes, sheets)
    │   └── coins/                CoinsScreen.tsx + content.ts (packs, perks, rewards)
    │
    ├── components/             REUSABLE PIECES shared by several screens
    │   ├── ui/                   buttons, cards, chips, text fields, avatar, sheet… (import from "@/components/ui")
    │   ├── chat/                 message bubble, composer, header, chat-theme picker, the chat layout
    │   ├── cosmic/               the animated space background (stars, planets) and the splash intro
    │   ├── brand/                the Pdb logo and logo tile
    │   ├── navigation/           the tab bar (with the swell around Soul) and the route gate
    │   └── feedback/             error boundary
    │
    ├── theme/                  LOOK AND FEEL
    │   ├── tokens.ts             spacing, radii, fonts and text styles
    │   ├── themes.ts             the six app themes and how a theme becomes colours
    │   ├── chatThemes.ts         the three chat themes
    │   └── ThemeProvider.tsx     useTheme() and useStyles()
    │
    ├── state/                  APP DATA (React Context)
    │   ├── AuthContext.tsx       who is signed in (demo, account or nobody)
    │   ├── AppContext.tsx        profile, follows, communities, coins, themes (demo = device, account = backend)
    │   └── SoulContext.tsx       the Soul deck, likes, requests, message limit, Superchat, chat threads
    │
    ├── services/               THE OUTSIDE WORLD
    │   ├── supabase.ts           the backend client (off when no keys are set)
    │   └── ai/                   talking to a language model (providers, fallbacks)
    │
    ├── lib/                    PURE LOGIC, no React (easy to test and reuse)
    │   ├── mbti/                 the classic questionnaire: axes, questions, scoring
    │   ├── persona/              PersonaAI: prompts and the rules that judge the model's replies
    │   ├── personality.ts        compatible types, Big Five sketch, chemistry score
    │   └── pickImage.ts          photo picker (shrinks pictures on the web)
    │
    └── data/                   SAMPLE CONTENT (people, communities, per-type notes)
```

## Common jobs

| I want to… | Open |
| --- | --- |
| Change a screen's layout or text | `src/features/<screen>/` |
| Change the classic questionnaire items | `src/lib/mbti/questions.ts` |
| Change how the questionnaire is scored | `src/lib/mbti/scoring.ts` |
| Change how PersonaAI asks and judges | `src/lib/persona/typerPrompt.ts` and `typerProtocol.ts` |
| Change which AI provider is used | `src/services/ai/` (see `docs/AI.md`) |
| Change a button, card or chip everywhere | `src/components/ui/` |
| Add or edit an **app theme** | `src/theme/themes.ts` (`APP_THEMES`) |
| Add or edit a **chat theme** | `src/theme/chatThemes.ts` (`CHAT_THEMES`); also add its id to the `chat_theme` check in the SQL |
| Change fonts, spacing, corner radii | `src/theme/tokens.ts` |
| Tweak the stars and planets | `src/components/cosmic/CosmicBackground.tsx` |
| Change the launch animation | `src/components/cosmic/SplashOverlay.tsx` |
| Change the bottom tab bar | `src/components/navigation/TabBar.tsx` |
| Change the logo | `src/components/brand/Logo.tsx` (then re-export the icons, see BRANDING.md) |
| Edit the sample people on the Soul deck | `src/data/people.ts` (photos are placeholder URLs) |
| Edit sample communities and famous people | `src/data/mockData.ts` |
| Change message limits or the Superchat price | `src/state/SoulContext.tsx` (`FIRST_MESSAGE_LIMIT`, `SUPERCHAT_COST`) |
| Change what happens on sign-in or sign-up | `src/state/AuthContext.tsx` and `src/features/auth/AuthScreen.tsx` |
| Add a database table, column or function | `supabase/migrations/` |
| Change the coin packs | `src/features/coins/content.ts` (keep amounts in sync with the SQL function) |

## Conventions

- **Colours never appear as literals in screens.** Read them from the theme: `const styles = useStyles(makeStyles)` where `makeStyles = (c: Colors) => StyleSheet.create({ ... })`. That is what lets the whole app re-colour when the user picks a theme.
- **Route files stay tiny.** `src/app/*` only re-exports a screen, so routing and UI never get tangled.
- **Screens own their sub-components.** A component used by one screen lives in that feature's `components/`; once two screens need it, move it to `src/components/`.
- **Logic lives outside components.** Scoring, prompts and judging are plain functions in `src/lib` (no React, no storage), screens only call them. State that outlives a screen lives in `src/state`.
- **One door per service.** Screens call `chat()` from `@/services/ai`, never a provider directly; they call `useApp()`/`useSoul()`, never AsyncStorage or Supabase directly (chat messages in a community room are the one exception).
- **Folders have an `index.ts`** when other code imports several things from them (`@/lib/mbti`, `@/lib/persona`, `@/services/ai`, `@/components/ui`).
- Imports use the `@/` alias for `src/`, e.g. `import { Button } from "@/components/ui"`.
- Comments say **why**, not what; each file starts with a one-line description of its job.

## The shared sky

The star field is drawn **once**, behind the whole navigator (`SkyHost` in `src/app/_layout.tsx`). Screens never draw their own background: they wrap themselves in `<Sky variant="subtle">` (or `"starry"` for forms, `"full"` for the welcome screen) and stay transparent. Cards and the tab bar use **opaque** surface colours (`theme/themes.ts`), so stars never show through text.

On the web, every sky animation is a CSS animation (`components/cosmic/motion.ts`) so the browser runs it off the JavaScript thread; phones use `Animated` with the native driver. The layers, back to front: gradient, stars and shooting stars, planets (welcome only), then the interface.

## Finding your type

Two routes, both in onboarding (details and your setup steps in [`docs/AI.md`](AI.md)):

- **Classic questionnaire**: `lib/mbti` + `steps/QuizStep.tsx`. 32 statements on a five-point scale, up to 40 when an axis is too close to call. Pure scoring, no network.
- **PersonaAI chat**: `lib/persona` + `services/ai` + `hooks/usePersonaTyper.ts` + `steps/AiChatStep.tsx`. A real conversation with a language model. The model proposes a lean and confidence per axis each turn; `typerProtocol.ts` decides when to stop (5 to 7 answers, every axis at 75+), and the type is computed in code.

## Soul deck, requests and Superchat

- `features/soul`: the Soul tab is a deck of people (`data/people.ts`). `ProfileCard` is a full-screen photo you scroll down for chemistry, what they want, about them and their interests; `ActionDock` holds the floating pass / message / like buttons; `MessageSheet` is the first-message box.
- `state/SoulContext.tsx` owns everything that follows: passing, liking, the Requests lists, the three-message limit before someone accepts, Superchat, and the resulting chat threads. It is saved per demo or account on the device (the people are samples, there is no matching backend).
- Rules: liking someone who already liked you is an instant match. Writing to someone who has not accepted is capped at 3 messages. Superchat (50 coins, spent through `AppContext.spendCoins`) skips the request and unlocks unlimited chat. In an account, coins are spent by the `spend_coins` function (`supabase/migrations/20261008000000_spend_coins.sql`), so the balance cannot be edited from the app.
- `features/chats/components/RequestsList.tsx` is the Requests section of Chats (Received / Sent). `DirectChat` serves both the sample contacts and people from the deck.
- Tapping the small profile picture on a deck card opens `/person/[id]`: cover, profile picture, About Me / Thoughts / Activities tabs, gallery, idols and interest cards. The pictures in `data/people.ts` are placeholder URLs (pravatar.cc faces, picsum.photos scenes), not real people.

## Your profile

- `features/profile/ProfileScreen.tsx`: your page, laid out like everyone else's (`ProfileTop`: cover, picture, name, stats, level) with tabs About Me / Insights / Themes. `AboutTab` shows your photos, what you are looking for, bio, details, idols, interest card, badges, types and Big Five. Insights has a real PersonaAI chat.
- `features/profile/EditProfileScreen.tsx` (route `/edit-profile`): photo grid, profile and cover pictures, verify, and rows for bio, card, idols, profession and so on. Every change saves at once through `saveProfile`.
- The extra fields (photos, interests, idols, profession...) are listed in `PROFILE_EXTRA_KEYS` (`data/mockData.ts`). They are stored on this device only: with the demo's saved state, and for accounts under `profileExtras:<user id>` (the backend schema only has the core profile columns).

## Backend

`supabase/migrations/` holds the schema (profiles, follows, community members and messages, economy functions) and `supabase/functions/persona-ai` the AI proxy. See the README for setup.
