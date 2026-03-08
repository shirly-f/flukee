# Quick Start Guide

## End-to-End Happy Path

This guide walks through the complete flow: Coach creates task → Trainee sees and completes it → Coach sees completion.

## 1. Start Backend Server

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3001`

## 2. Start Web Dashboard (Coach)

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`

**Login as Coach:**
- Email: `coach@test.com`
- Password: `password`

## 3. Start Mobile App (Trainee)

```bash
cd mobile
npm install
npx expo start
```

Scan QR code with Expo Go app or press `i` for iOS simulator / `a` for Android emulator.

**Login as Trainee:**
- Email: `trainee@test.com`
- Password: `password`

## 4. Test the Flow

### Step 1: Coach Creates Task

1. In web dashboard, click on "Test Trainee" card
2. Click "Create Task" button
3. Fill in:
   - Title: "Complete workout log"
   - Description: "Log your workouts for this week"
   - Type: "Text Response"
   - Prompt: "Describe your workout routine"
4. Click "Create Task"

### Step 2: Trainee Sees Task

1. In mobile app, refresh the home screen (pull down)
2. You should see "Complete workout log" task
3. Tap on the task to open details

### Step 3: Trainee Submits Response

1. In task detail screen, enter your response in the text field
2. Click "Submit"
3. Task status changes to "completed"

### Step 4: Coach Sees Completion

1. In web dashboard, refresh the trainee overview page
2. Check the stats - completed tasks count should increase
3. View task details to see the submitted response

## Troubleshooting

- **CORS errors**: Make sure backend is running on port 3001
- **Can't login from mobile (physical device)**: The app uses `localhost` which only works on simulator. On a real phone, set your computer's IP:
  1. Get your IP: Mac run `ipconfig getifaddr en0`, Windows run `ipconfig`
  2. In `mobile/app.config.js`, set `API_HOST = 'YOUR_IP'` (e.g. `'192.168.1.5'`)
  3. Restart Expo (`npx expo start -c`)
- **Connection refused**: Backend must be running. Ensure backend and phone are on same Wi‑Fi
- **401 Unauthorized**: Use correct credentials: coach `coach@test.com`, trainee `trainee@test.com` (password: `password`)
- **Tasks not showing**: Verify coach-trainee relationship exists (seeded automatically)

## Next Steps

- Replace in-memory database with Notify database
- Replace mock auth with Notify Auth
- Add real-time updates
- Enhance UI/UX
