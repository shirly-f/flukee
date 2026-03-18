# Native App Testing Setup

How to give testers access to the **native mobile app** (React Native), not the web version.

---

## For the developer: Build and share

### Android (APK) – Recommended

Creates an installable app. Testers download and install; no Expo Go needed.

```bash
npm install -g eas-cli
eas login
cd mobile
eas build -p android --profile preview
```

- Build takes ~10–15 minutes
- You get a download link when it finishes
- Share that link with testers

### iOS

**Option A: iOS Simulator (on your Mac)**  
For demos, run locally:

```bash
cd mobile
npm start
```

Then press `i` to open the iOS Simulator. Screen-record and share the video.

**Option B: TestFlight (real devices)**  
Requires Apple Developer account ($99/year):

```bash
eas build -p ios --profile production
eas submit --platform ios --latest
```

Then add testers in App Store Connect.

**Option C: Upgrade to Expo SDK 54**  
Makes Expo Go work on iPhones. Run `npx expo upgrade` in the `mobile` folder (may need fixes).

---

## For testers: Installing and testing

### Android

1. Get the APK link from the developer
2. Open the link on your Android phone
3. Download the APK (allow browser to download if prompted)
4. Install (Settings → Security → Enable "Unknown sources" if needed)
5. Open the app
6. Log in: `trainee@test.com` / `password`

### iOS

- **Without TestFlight:** Use the web version with "Add to Home Screen" (app-like)
- **With TestFlight:** Developer invites you; install from TestFlight app

---

## Test credentials

| Role | Email | Password |
|------|-------|----------|
| Trainee | trainee@test.com | password |
| Coach | coach@test.com | password |

*(Coach view is mainly on web; the native app focuses on the trainee experience.)*

---

## What testers should try

- [ ] Log in as trainee
- [ ] See task list
- [ ] Open a task, submit a response
- [ ] Confirm completion
- [ ] Messages (if coach creates one)
- [ ] Navigation, language switch (if available)
- [ ] App behavior on different screen sizes
