<div align="center">

# Pdb

**A personality-type social app: find your type, join communities, and chat with people who think like you.**

[**Live demo**](https://himanshu-moderator.github.io/Soul-Chemistry-Hub/) · [Screens](#screens) · [Features](#features) · [Backend](#backend) · [Run it locally](#run-it-locally)

![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white)
![Platform](https://img.shields.io/badge/Runs%20on-iOS%20%C2%B7%20Android%20%C2%B7%20Web-7C4DFF)

</div>

<p align="center">
  <img src="docs/screens/explore.jpg" width="15.5%" alt="Explore" />
  <img src="docs/screens/chats.jpg" width="15.5%" alt="Chats" />
  <img src="docs/screens/communities.jpg" width="15.5%" alt="Communities" />
  <img src="docs/screens/soul.jpg" width="15.5%" alt="Soul" />
  <img src="docs/screens/profile.jpg" width="15.5%" alt="Profile" />
  <img src="docs/screens/coins.jpg" width="15.5%" alt="Coins" />
</p>

> **Try it without signing up.** Tap **Try the demo** on the welcome screen. You get the whole app with sample people and chats, saved on your device only. **Create account** gives you a real profile stored in the backend, and real chat with other members in the communities.

## What it is

Personality-type communities (MBTI, Enneagram, Socionics) are large and passionate, but the apps around them are scattered across quizzes, wikis and group chats. Pdb puts them in one place:

1. **Sign up** (or try the demo) and set up a profile.
2. **Find your type** with a short chat or a four-question quiz, or pick it if you already know it.
3. **Join communities** for your type and others, and talk in them live.
4. **Explore** famous people and what their types are.
5. **See your chemistry** with other types, and keep coming back with a daily check-in, coins and themes.

## Screens

| Tab | What you get |
| --- | --- |
| **Explore** | Search and browse famous personalities with their MBTI and Enneagram, follow them, filter by trending or type, and answer a daily question for coins |
| **Chats** | A switch at the top flips between your **Chats** and **Communities**. Open a community to talk with its members in real time |
| **Soul** | Your connections with chemistry scores, discovery modes, and your best chemistry types |
| **Profile** | Editable name, bio and types, level and streak, badges, an insights chat, and a theme picker |
| **Coins** | Coin packs, daily rewards that follow your streak, a 14-day free trial and premium perks |

## Features

- **Real accounts**: email and password sign-up and sign-in, confirmation emails, password reset, clear error messages, and a session that survives reloads.
- **A proper onboarding**: profile basics (name, unique @username, bio), then finding your type, then picking communities to join.
- **Try the demo** with no account: everything works with sample data saved on the device, and "Exit demo" clears it.
- **Live community chat** (accounts): join a community and talk with its other members. Messages arrive in real time, you can only read and post in rooms you have joined, and posting is rate-limited.
- **Type finder**: the chat scores each answer across the four MBTI dimensions; the quiz asks one question per dimension. Fifteen of the sixteen types are reachable from the chat, all sixteen from the quiz or the picker.
- **Everything follows your type**: Explore tiles, chemistry pairings, the Big Five sketch and the insights chat change with your type.
- **Server-enforced economy** (accounts): coins, streaks, XP and premium can't be edited from the client. The daily check-in, the trial and (demo) coin packs are database functions.
- **One codebase** for iOS, Android and web, shown as a phone-sized column on desktop.

### How "AI" works here

The onboarding chat and the PersonaAI insights chat are **scripted**, not a language model: answers are looked up from per-type notes. Swapping in a real model is on the [roadmap](#roadmap). The 1:1 chats with the sample contacts are also scripted; real conversations happen in communities.

## Backend

Supabase (Postgres, Auth, Realtime). The schema is one file: [`supabase/migrations/20261007000000_pdb_schema.sql`](supabase/migrations/20261007000000_pdb_schema.sql).

| Table | Purpose |
| --- | --- |
| `profiles` | One row per account: name, unique username, bio, types, theme, coins, streak, premium. Clients can only edit the profile fields; the economy columns are locked |
| `follows` | Which famous people you follow |
| `community_members` | Which communities you have joined |
| `community_messages` | Chat messages. Readable and writable only by members of that room |

Row Level Security is on for every table, and the app only ever uses the public anon key.

### Set up your own backend

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of the migration file and run it.
3. In **Authentication → Sign In / Providers → Email**, choose whether to require email confirmation (turning it off makes trying the app quicker).
4. In **Authentication → URL Configuration**, set the Site URL to where you host the app.
5. Copy `artifacts/mobile/.env.example` to `artifacts/mobile/.env` and fill in the project URL and anon key (Project Settings → API).

Without these values the app still works: it shows the demo only.

## Tech stack

| | |
| --- | --- |
| App | Expo SDK 54, React Native 0.81, Expo Router (file-based routing), React Compiler |
| Language | TypeScript (strict, zero type errors) |
| Backend | Supabase: Postgres with Row Level Security, Auth, Realtime |
| State | React Context; demo data in AsyncStorage (`localStorage` on web) |
| UI | Custom glassmorphism components, Reanimated, Expo Blur, Haptics |
| Monorepo | pnpm workspace (mobile app, an Express API stub, a Vite component sandbox) |

## Run it locally

You need Node 20+ and pnpm.

```bash
pnpm install
cd artifacts/mobile
npx expo start --web      # web, http://localhost:8081
npx expo start            # scan the QR code with Expo Go for a phone
```

> On Windows and macOS the first `pnpm install` is slow: the workspace was set up on Linux, so esbuild falls back to downloading its own binary. It works, it just takes a while.

Type-check with `pnpm run typecheck` from the repo root.

## Deploy the web build

The web app exports to static files and can be hosted anywhere. For a GitHub Pages project site, tell Expo the sub-path (and have your `.env` filled in so accounts work):

```bash
cd artifacts/mobile
EXPO_BASE_URL=/Soul-Chemistry-Hub pnpm run export:web
```

The `dist/` folder is the site. Add a `.nojekyll` file (Pages ignores `_expo` otherwise) and copy `index.html` to `404.html` so deep links work.

## Project structure

```
artifacts/mobile/
  app/             Screens (Expo Router): welcome, auth, onboarding, community room, five tabs
  components/      Glass cards, tab bar, badges, rings
  context/         Auth (sessions, demo mode) and app state (profile, follows, economy)
  lib/             Backend client, type scoring, compatibility and Big Five helpers
  data/            Sample people, communities, themes
supabase/          Database schema
docs/screens/      Screenshots used in this README
```

## Roadmap

- [ ] A real language model behind PersonaAI (a small server-side proxy keeps the key off the device)
- [ ] Direct messages between real members, and people discovery
- [ ] Google sign-in
- [ ] Enneagram and Socionics finders, not just MBTI
- [ ] Real purchases for coins and premium
- [ ] Push notifications for new messages

## About

Built by [Himanshu](https://github.com/Himanshu-moderator) as a product prototype. People, celebrity types and the coin shop are sample data for the demo. Pdb is not affiliated with any personality-typing organisation.
