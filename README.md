# Flukee - Coaching Platform MVP

A coaching platform with mobile app for trainees and web dashboard for coaches.

## Tech Stack

- **Backend**: Notify (native backend, auth, database, messaging)
- **Web Dashboard**: React + Vite
- **Mobile App**: React Native (Expo)

## Project Structure

```
flukee/
├── backend/          # Notify backend configuration & API logic
├── web/              # Coach web dashboard (React)
├── mobile/           # Trainee mobile app (React Native/Expo)
├── shared/           # Shared types/utilities
└── docs/             # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Notify account and project setup

### Backend Setup
See `backend/README.md` for Notify configuration.

### Web Dashboard
```bash
cd web
npm install
npm run dev
```

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

## Documentation

- [Backend Schema](./docs/BACKEND_SCHEMA.md) - Database models and schema
- [Project Structure](./docs/PROJECT_STRUCTURE.md) - Project organization
- [API Documentation](./docs/API.md) - API endpoints and data flow

## MVP Features

- Email-based authentication with roles (coach/trainee)
- Coach manages trainees
- Coaches create tasks for trainees
- Trainees complete tasks in mobile app
- Coaches see progress visually
- Basic 1:1 messaging between coach and trainee

### Task Types
- Text response
- Read document + mark as done
- Short questionnaire
