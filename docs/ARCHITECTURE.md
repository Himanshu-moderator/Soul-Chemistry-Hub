# How the Pdb code is organised

Everything for the app lives in `artifacts/mobile/src`. The rule of thumb: **a screen is a feature, a feature is a folder.** If you want to change what a screen does or looks like, open `src/features/<screen>/`.

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
    │   ├── community/[id].tsx    → features/community
    │   └── (tabs)/               the five tabs: index, chats, soul, profile, market
    │
    ├── features/               SCREENS, one folder each (all the logic for that screen)
    │   ├── welcome/              first screen for signed-out visitors
    │   ├── auth/                 sign in, sign up, forgot password, check-your-email
    │   ├── onboarding/           OnboardingScreen.tsx (the flow) + steps/ (one file per step)
    │   │                         + content.ts (the questions and options)
    │   ├── explore/              ExploreScreen.tsx + components/ (person row, check-in, type guide)
    │   ├── chats/                ChatsScreen.tsx + components/ (inbox, community list, direct chat)
    │   ├── community/            the live chat room for one community
    │   ├── soul/                 chemistry and connections
    │   ├── profile/              ProfileScreen.tsx + components/ (header, overview, insights, themes, edit sheets)
    │   └── coins/                CoinsScreen.tsx + content.ts (packs, perks, rewards)
    │
    ├── components/             REUSABLE PIECES shared by several screens
    │   ├── ui/                   buttons, cards, chips, text fields, avatar, sheet… (import from "@/components/ui")
    │   ├── chat/                 message bubble, composer, header, chat-theme picker, the chat layout
    │   ├── cosmic/               the animated space background and the splash intro
    │   ├── brand/                the Pdb logo
    │   ├── navigation/           the floating tab bar and the route gate
    │   └── feedback/             error boundary
    │
    ├── theme/                  LOOK AND FEEL
    │   ├── tokens.ts             spacing, radii, fonts and text styles
    │   ├── themes.ts             the six app themes and how a theme becomes colours
    │   ├── chatThemes.ts         the three chat themes
    │   └── ThemeProvider.tsx     useTheme() and useStyles()
    │
    ├── state/                  APP DATA
    │   ├── AuthContext.tsx       who is signed in (demo, account or nobody)
    │   └── AppContext.tsx        profile, follows, communities, coins, themes (demo = device, account = backend)
    │
    ├── services/               OUTSIDE WORLD
    │   └── supabase.ts           the backend client (off when no keys are set)
    │
    ├── data/                   SAMPLE CONTENT (people, communities, quiz questions, per-type notes)
    └── lib/                    PURE HELPERS (type scoring, compatibility, scripted PersonaAI replies)
```

## Common jobs

| I want to… | Open |
| --- | --- |
| Change a screen's layout or text | `src/features/<screen>/` |
| Change the onboarding questions | `src/features/onboarding/content.ts` |
| Change a button, card or chip everywhere | `src/components/ui/` |
| Add or edit an **app theme** | `src/theme/themes.ts` (`APP_THEMES`) |
| Add or edit a **chat theme** | `src/theme/chatThemes.ts` (`CHAT_THEMES`); also add its id to the `chat_theme` check in the SQL |
| Change fonts, spacing, corner radii | `src/theme/tokens.ts` |
| Tweak the stars and planets | `src/components/cosmic/CosmicBackground.tsx` |
| Change the launch animation | `src/components/cosmic/SplashOverlay.tsx` |
| Change the logo | `src/components/brand/Logo.tsx` (then re-export the icons, see BRANDING.md) |
| Edit sample people or communities | `src/data/mockData.ts` |
| Change what happens on sign-in or sign-up | `src/state/AuthContext.tsx` and `src/features/auth/AuthScreen.tsx` |
| Add a database table or column | `supabase/migrations/` |
| Change the coin packs | `src/features/coins/content.ts` (keep amounts in sync with the SQL function) |

## Conventions

- **Colours never appear as literals in screens.** Read them from the theme: `const styles = useStyles(makeStyles)` where `makeStyles = (c: Colors) => StyleSheet.create({ ... })`. That is what lets the whole app re-colour when the user picks a theme.
- **Route files stay tiny.** `src/app/*` only re-exports a screen, so routing and UI never get tangled.
- **Screens own their sub-components.** A component used by one screen lives in that feature's `components/`; once two screens need it, move it to `src/components/`.
- **Data in, UI out.** Anything that reads or writes the backend goes through `state/AppContext` (or a feature-level query like the community chat); screens don't talk to Supabase directly except for chat messages.
- Imports use the `@/` alias for `src/`, e.g. `import { Button } from "@/components/ui"`.

## The shared sky

The star field is drawn **once**, behind the whole navigator (`SkyHost` in `src/app/_layout.tsx`). Screens never draw their own background: they wrap themselves in `<Sky variant="subtle">` (or `"starry"` for forms, `"full"` for the welcome screen) and stay transparent. Cards and the tab bar use **opaque** surface colours (`theme/themes.ts`), so stars never show through text. To change the sky, edit `components/cosmic/CosmicBackground.tsx`.

## Soul deck, requests and Superchat

- `features/soul`: the Soul tab is a deck of people (`data/people.ts`). `ProfileCard` is a full-screen photo you scroll down for chemistry, what they want, about them and their interests; `ActionDock` holds the floating pass / message / like buttons; `MessageSheet` is the first-message box.
- `state/SoulContext.tsx` owns everything that follows: passing, liking, the Requests lists, the three-message limit before someone accepts, Superchat, and the resulting chat threads. It is saved per demo or account on the device (the people are samples, there is no matching backend).
- Rules: liking someone who already liked you is an instant match. Writing to someone who has not accepted is capped at 3 messages (`FIRST_MESSAGE_LIMIT`). Superchat (`SUPERCHAT_COST` coins, spent through `AppContext.spendCoins`) skips the request and unlocks unlimited chat. In an account, coins are spent by the `spend_coins` function (`supabase/migrations/20261008000000_spend_coins.sql`), so the balance cannot be edited from the app.
- `features/chats/components/RequestsList.tsx` is the Requests section of Chats (Received / Sent). `DirectChat` serves both the sample contacts and people from the deck.
- Photos: `SoulPerson.photos` takes image URLs; while empty, `PersonPhoto` draws an illustrated portrait.
