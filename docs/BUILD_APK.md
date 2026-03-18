# Build an installable APK for reviewers

This creates a real Android app (.apk) that reviewers can download and install. No Expo Go needed.

## Prerequisites

- [Expo account](https://expo.dev) (free)
- Node.js installed

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Log in to Expo

```bash
eas login
```

Create an account at expo.dev if you don't have one.

## Step 3: Configure EAS (if needed)

```bash
cd mobile
eas build:configure
```

(This creates/updates `eas.json` - already done for this project.)

## Step 4: Build the APK

```bash
cd mobile
eas build -p android --profile preview
```

Wait 10–15 minutes for the build to finish in the cloud.

## Step 5: Share with reviewers

When the build completes:

1. You'll get a link in the terminal or at [expo.dev](https://expo.dev)
2. Open the link and download the APK
3. Share the APK file or the download link with reviewers
4. Reviewers install it on their Android phone (Settings → Allow from unknown sources if prompted)
5. They open the app and log in with `trainee@test.com` / `password`

## Notes

- **iOS:** Building for iOS requires an Apple Developer account ($99/year). For iOS reviewers, use "Add to Home Screen" (PWA) on the web version.
- **Android only:** The preview profile builds an APK that works without Google Play.
