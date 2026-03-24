# PersonaDB — Personality Social App

## Overview
A high-fidelity Expo React Native mobile app for personality type enthusiasts (MBTI, Enneagram, Socionics). Ultra-dark glassmorphism design with 5-tab navigation.

## Architecture
- **Monorepo**: pnpm workspace
- **Mobile**: `artifacts/mobile` — Expo SDK 54, Expo Router 6, React Native 0.81
- **API Server**: `artifacts/api-server` — Express on port 8080
- **Mockup Sandbox**: `artifacts/mockup-sandbox` — Vite component preview

## Mobile App Stack
- **Navigation**: Expo Router (file-based) with NativeTabs (liquid glass iOS 26+) or classic Tabs fallback
- **State**: React Context (`AppContext`) + AsyncStorage for persistence
- **UI**: Custom glassmorphism components, @expo/vector-icons
- **Fonts**: Inter (400, 500, 600, 700)

## Key Files
- `artifacts/mobile/app/_layout.tsx` — Root layout (fonts, providers)
- `artifacts/mobile/app/(tabs)/_layout.tsx` — 5-tab layout (NativeTabs + Classic fallback)
- `artifacts/mobile/app/(tabs)/index.tsx` — Personalities screen
- `artifacts/mobile/app/(tabs)/communities.tsx` — Communities screen
- `artifacts/mobile/app/(tabs)/soul.tsx` — Soul & Chemistry screen
- `artifacts/mobile/app/(tabs)/profile.tsx` — Profile screen
- `artifacts/mobile/app/(tabs)/market.tsx` — Market/Monetization screen
- `artifacts/mobile/app/onboarding.tsx` — AI type discovery onboarding
- `artifacts/mobile/constants/colors.ts` — Theme (ultra-dark #000000, accent #7C4DFF)
- `artifacts/mobile/context/AppContext.tsx` — Global state
- `artifacts/mobile/data/mockData.ts` — 100% dummy data (25 celebs, 10 communities, 8 connections)
- `artifacts/mobile/components/` — Shared UI (GlassCard, TypeBadge, AvatarCircle, ChemistryRing, CoinBadge, SectionHeader)

## Design System
- **Background**: #000000 (pure black)
- **Accent**: #7C4DFF (purple), #FFB800 (gold), #00B4D8 (blue), #00C896 (green), #FF3B6B (red)
- **Cards**: rgba glassmorphism with 1px borders
- **Typography**: Inter font family

## Features
1. **Personalities Tab**: 25 famous people, follow/unfollow, MBTI/Enneagram badges, trending, daily check-in modal
2. **Communities Tab**: 10 communities, join/leave, share link modal, public/private indicator
3. **Soul Tab**: 93% chemistry ring, 8 connections with status cards, compatibility pairs, Big 5 profile
4. **Profile Tab**: Fully editable name/bio/MBTI/Enneagram/Socionics via dropdown, XP bar, social stats, badges
5. **Market Tab**: 14-day free trial modal, 6 themes (2 free + 4 premium), coin packs, earn coins section
6. **Onboarding**: AI chat flow for type discovery, manual type selection, agree/refine logic

## Monetization
- 14-day free trial, $9.99/month
- PersonaCoins system (earn via check-ins, buy in packs)
- Premium themes (Neon Aura, Midnight Gold, Rose Noir, Arctic Frost)

## Workflows
- `artifacts/mobile: expo` — Expo dev server on $PORT (18115)
- `artifacts/api-server: API Server` — Express on 8080
