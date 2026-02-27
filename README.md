# Timestamp Saver Mobile

Expo custom-dev-client React Native app for saving YouTube timestamps from Android share sheet and syncing with the existing `Save & Resume` Firestore schema.

## Implemented

- Firebase Auth + Google sign-in gate.
- Firestore compatibility repository using `users/{uid}/data/state` and `categoriesJson`.
- One timestamp per video behavior across all categories.
- Category UX parity for mobile shell:
  - `All` filter default
  - `Default` + user categories
  - create/delete categories
  - move timestamp between categories
  - delete timestamp
- YouTube deep link open (`watch?v=...&t=...s`).
- Android share-intent parsing and confirmation flow in JS.
- Missing `t` links are auto-saved at `0:00` with guidance alert to reshare with YouTube `Start at`.
- Shared timestamps are written to `users/{uid}/timestamps/{timestampId}` (with `note` + Firestore timestamp).
- Android native bridge plugin + Java module templates for share payload handoff.
- Unit tests for URL parser and state transforms.

## Environment

Copy `.env.example` to `.env` and fill values.

Required:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Google sign-in:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Commands

```bash
npm install
npm test
npx tsc --noEmit
npx expo start --dev-client
```

## Android Share Intent Setup

The plugin `./plugins/withAndroidShareIntent` does all of the following during `expo prebuild`:

- Adds `ACTION_SEND` + `text/plain` intent filter to MainActivity.
- Adds MainActivity hooks to forward shared text intents to JS.
- Registers `ShareIntentPackage` in MainApplication.
- Copies native files from `plugins/android-share/*` into Android app source.

Run after dependencies are installed and network is available:

```bash
npx expo prebuild --platform android
```

## Notes

- iOS is app-shell only in V1 (no iOS share extension yet).
- YouTube Shorts are intentionally rejected in V1.
- Optional notes are captured in share confirmation and stored in `users/{uid}/timestamps`.
