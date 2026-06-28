# Qadam — Mobile

Mobile app for **Qadam**, a ЕНТ (Unified National Test) prep platform for Kazakhstani
high-school students. Built with React Native + Expo. This is the mobile counterpart to the
Qadam web app and talks to the same backend API.

## Stack

- [Expo](https://docs.expo.dev/) (SDK 52) + React Native 0.76 — new architecture enabled
- [Expo Router](https://docs.expo.dev/routing/introduction/) — file-based navigation
- [Clerk](https://clerk.com/) — authentication (Google / Apple SSO)
- [TanStack Query](https://tanstack.com/query) — server state
- [NativeWind](https://www.nativewind.dev/) — Tailwind styling
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) + [Skia](https://shopify.github.io/react-native-skia/) — animations
- [Expo Video](https://docs.expo.dev/versions/latest/sdk/video/) — lesson video playback

## Prerequisites

- Node 20+ and npm
- For native builds: Xcode (iOS) and/or Android Studio, plus CocoaPods (`sudo gem install cocoapods`)

This app uses native modules and a custom dev client, so **Expo Go is not supported** — you build a local dev client.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your env file and fill in the values:
   ```bash
   cp DUMMY.env .env
   ```
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — from the [Clerk dashboard](https://dashboard.clerk.com) → API Keys
   - `EXPO_PUBLIC_API_BASE_URL` — the Qadam backend base URL
3. Run the app:
   ```bash
   # quick check in the browser
   npm run web

   # native dev build (recommended)
   npx expo prebuild        # generates ios/ and android/ (regenerate when native deps change)
   npx expo run:ios         # or: npx expo run:android
   ```
   After the first native build, `npm start` then press `i` / `a`.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` | Build & launch the native dev client |
| `npm run web` | Run in the browser |
| `npm run lint` | Lint with `expo lint` |
| `npm test` | Run Jest |

## Project structure

```
app/                       # expo-router routes
  (app)/(authenticated)/   # auth-gated area (tabs: Home, Profile)
  login.tsx                # Clerk SSO sign-in
components/                # shared components
providers/                 # React context providers
utils/                     # helpers (e.g. Clerk token cache)
```

> `.env` is gitignored — never commit real keys.
