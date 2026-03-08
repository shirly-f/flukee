# Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- Notify account and project configured

## Initial Setup

### 1. Backend Configuration

1. Set up your Notify project
2. Configure environment variables in `backend/config/notify.js`
3. Set up database schema using models in `backend/models/`
4. Configure API routes in `backend/api/`

### 2. Web Dashboard Setup

```bash
cd web
npm install
```

Create `.env` file:
```
VITE_API_BASE_URL=https://api.notify.com/flukee
```

Start development server:
```bash
npm run dev
```

### 3. Mobile App Setup

```bash
cd mobile
npm install
```

Create `.env` file (or update `src/services/api.js`):
```
API_BASE_URL=https://api.notify.com/flukee
```

Start Expo:
```bash
npx expo start
```

## Next Steps

1. **Backend**: Implement Notify Auth integration in `backend/middleware/auth.js`
2. **Backend**: Implement database queries in API handlers
3. **Backend**: Set up Notify messaging for real-time updates
4. **Web**: Complete questionnaire task type UI
5. **Mobile**: Add coach ID resolution for messaging
6. **Mobile**: Implement questionnaire response UI
7. **Both**: Add error handling and loading states
8. **Both**: Add form validation

## Environment Variables

### Backend
- `NOTIFY_PROJECT_ID`
- `NOTIFY_API_KEY`
- `NOTIFY_DB_HOST`
- `NOTIFY_DB_NAME`
- `NOTIFY_DB_USER`
- `NOTIFY_DB_PASSWORD`
- `NOTIFY_AUTH_URL`
- `NOTIFY_MESSAGING_URL`
- `NOTIFY_STORAGE_URL`

### Web
- `VITE_API_BASE_URL`

### Mobile
- `API_BASE_URL` (update in `src/services/api.js`)
