# Google SSO Setup

How to enable "Sign in with Google" for Flukee.

---

## 1. Create Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
4. **Application type:** Web application (for the web dashboard)
5. **Authorized JavaScript origins:**
   - `http://localhost:3000` (local dev)
   - `https://flukee-web.netlify.app` (production)
   - Your Netlify URL if different
6. **Authorized redirect URIs:** Add `https://flukee-web.netlify.app/login` (optional for one-tap; needed for redirect flow)
7. Copy the **Client ID** and **Client Secret**

---

## 2. Backend (Render)

In Render → Your backend service → **Environment**:

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID (e.g. `123456-xxx.apps.googleusercontent.com`) |

Redeploy the backend after adding the variable.

---

## 3. Web (Netlify)

In Netlify → Site configuration → **Environment variables**:

| Variable | Value |
|----------|-------|
| `VITE_GOOGLE_CLIENT_ID` | Same Google Client ID as backend |

Or add to `web/.env.production`:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Then trigger a new deploy.

---

## 4. Mobile (Expo)

Google Sign-In on mobile requires additional setup (expo-auth-session or expo-google-sign-in). For now, use the web version or email/password on mobile.

---

## Testing

1. Ensure both backend and web have the same Client ID
2. Open the login page
3. You should see "or" and a "Continue with Google" button
4. Click it and sign in with a Google account
5. New users are created as **trainee** by default
