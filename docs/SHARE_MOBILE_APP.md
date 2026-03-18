# Sharing the Mobile App with Reviewers

This guide explains how to let reviewers test the Flukee app on their phone (as a native app) instead of the web version.

---

## Option 1: Expo Go (recommended)

Reviewers install the free **Expo Go** app and open your project via a link or QR code.

### Step 1: Configure the backend URL

Ensure `mobile/.env` contains:

```
FLUKEE_API_BASE_URL=https://flukee-backend.onrender.com
```

(Copy from `mobile/.env.example` if needed.)

### Step 2: Start the app with tunnel

```bash
cd mobile
npm install
npm run start:share
```

This starts Expo with **tunnel** mode, so the link works from anywhere (not just your local network).

### Step 3: Share with the reviewer

- A **QR code** appears in the terminal
- Or press **`s`** to get a shareable link
- Send the link or QR to the reviewer

### Step 4: Reviewer instructions

1. Install **Expo Go** from [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Open the link (or scan the QR code with the phone camera)
3. The app opens in Expo Go
4. Login: `trainee@test.com` / `password`

---

## Option 2: APK for Android (installable app)

For reviewers who prefer a regular app install (no Expo Go):

### Prerequisites

- [Expo account](https://expo.dev) (free)
- EAS CLI: `npm install -g eas-cli`

### Build and share

```bash
cd mobile
eas login
eas build:configure   # first time only
FLUKEE_API_BASE_URL=https://flukee-backend.onrender.com eas build -p android --profile preview
```

When the build finishes, you get a download link. Share that link with the reviewer; they download and install the APK on their Android device.

---

## Summary

| Method    | Reviewer needs        | You need to do                    |
|-----------|------------------------|-----------------------------------|
| Expo Go   | Install Expo Go        | Run `npm run start:share`, share link |
| APK       | Android phone          | Run EAS build, share download link   |

For quick reviews, **Expo Go** is usually enough.
