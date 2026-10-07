<div align="center">

# PersonaDB

**A personality-type social app: find your type, explore famous personalities, chat in groups, and see who you click with.**

[**Live demo**](https://himanshu-moderator.github.io/Soul-Chemistry-Hub/) · [Screens](#screens) · [Features](#features) · [Run it locally](#run-it-locally)

![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
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

> **Prototype.** PersonaDB is a design-and-product prototype: people, chats and communities are sample data, nothing is sent to a server, and no real payments exist. Open the demo on a phone, or on a desktop where it appears as a phone-sized column.

## What it is

Personality-type communities (MBTI, Enneagram, Socionics) are large and passionate, but the apps around them are scattered across quizzes, wikis and group chats. PersonaDB puts them in one place:

1. **Find your type** with a short chat or a four-question quiz (or pick it if you already know it).
2. **Explore** famous people and what their types are.
3. **Talk** in one-to-one chats and type-based communities.
4. **See your chemistry** with other types.
5. **Keep coming back** with coins, a daily check-in and themes.

## Screens

| Tab | What you get |
| --- | --- |
| **Explore** | Search and browse about two dozen famous personalities with their MBTI and Enneagram, follow them, filter by trending or type, and answer a daily knowledge question for coins |
| **Chats** | Conversations and **Communities in one place**: a switch at the top flips between your chats and the community list (join, leave, share a link), with view-once photos and video |
| **Soul** | Your connections with chemistry scores, "Wonder Chat" and other discovery modes, and your best chemistry types |
| **Profile** | Editable name, bio and types, level and streak, badges, an AI-style insights chat, and a theme picker |
| **Coins** | Coin packs, free daily rewards, a free trial and premium perks |

## Features

- **Type finder** with two routes. The chat asks three questions and scores each answer across the four MBTI dimensions (E/I, S/N, T/F, J/P); the quiz asks one question per dimension. Fifteen of the sixteen types are reachable from the chat, all sixteen from the quiz or the picker.
- **Everything follows your type.** Explore tiles, the chemistry pairings, the Big Five sketch and the insights chat all change with the type you end up with.
- **Remembers you.** Your profile, coins, follows, joined communities and theme are saved on the device; the daily check-in resets at your local midnight; returning visitors skip the intro.
- **Reset demo** at the bottom of the profile wipes everything and starts over.
- **Premium themes**, a 14-day trial flow and a coin economy, to explore monetisation ideas.
- **One codebase** for iOS, Android and web.

### How "AI" works here

The onboarding chat and the PersonaAI insights chat are **scripted**, not a language model. Answers are looked up from per-type notes (strengths, growth areas, careers, compatible types). That keeps the demo free and instant, and is clearly the next thing to upgrade: see the [roadmap](#roadmap).

## Tech stack

| | |
| --- | --- |
| App | Expo SDK 54, React Native 0.81, Expo Router (file-based routing), React Compiler |
| Language | TypeScript (strict, zero type errors) |
| State | React Context persisted to AsyncStorage (`localStorage` on web) |
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

The web app exports to static files and can be hosted anywhere. For a GitHub Pages project site, tell Expo the sub-path:

```bash
cd artifacts/mobile
EXPO_BASE_URL=/Soul-Chemistry-Hub pnpm run export:web
```

The `dist/` folder is the site. Add a `.nojekyll` file (Pages ignores `_expo` otherwise) and copy `index.html` to `404.html` so deep links work.

## Project structure

```
artifacts/mobile/
  app/             Screens (Expo Router): splash, onboarding, and the five tabs
  components/      Glass cards, tab bar, badges, rings
  context/         App state and persistence
  lib/             Type scoring, compatibility and Big Five helpers
  data/            Sample people, communities, themes
  constants/       Colours and theme tokens
docs/screens/      Screenshots used in this README
```

## Roadmap

- [ ] A real language model behind PersonaAI (a small server-side proxy keeps the key off the device)
- [ ] Accounts and a real backend for chats and communities
- [ ] Enneagram and Socionics finders, not just MBTI
- [ ] Real purchases for coins and premium
- [ ] Push notifications for new messages

## About

Built by [Himanshu](https://github.com/Himanshu-moderator) as a product prototype. Celebrity types are sample data for the demo, not claims about real people. PersonaDB is not affiliated with any personality-typing organisation.
