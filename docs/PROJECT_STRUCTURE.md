# Flukee Project Structure

## Overview
Clean, scalable structure for MVP coaching platform with separation of concerns.

```
flukee/
├── backend/                 # Notify backend configuration & API logic
│   ├── models/            # Database model definitions
│   ├── api/               # API route handlers
│   ├── middleware/        # Auth, validation middleware
│   ├── config/            # Notify configuration
│   └── utils/             # Helper functions
│
├── web/                    # Coach web dashboard (React)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service layer
│   │   ├── context/      # Auth context, etc.
│   │   ├── utils/         # Utilities
│   │   └── App.jsx       # Main app component
│   ├── public/
│   └── package.json
│
├── mobile/                 # Trainee mobile app (React Native/Expo)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # Screen components
│   │   ├── navigation/   # Navigation setup
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/     # API service layer
│   │   ├── context/       # Auth context, etc.
│   │   ├── utils/         # Utilities
│   │   └── App.js         # Main app component
│   ├── app.json           # Expo config
│   └── package.json
│
├── shared/                 # Shared types/utilities (optional)
│   └── types/            # TypeScript types (if using TS)
│
├── docs/                   # Documentation
│   ├── BACKEND_SCHEMA.md
│   ├── PROJECT_STRUCTURE.md
│   └── API.md
│
└── README.md
```

## Technology Stack

### Backend (Notify)
- Database: PostgreSQL (via Notify)
- Auth: Notify Auth (email-based)
- API: RESTful endpoints
- Messaging: Notify messaging service
- Storage: Notify storage (for documents)

### Web Dashboard (React)
- Framework: React 18+
- Build: Vite
- Routing: React Router
- State: React Context + hooks
- HTTP: Axios/Fetch
- UI: Tailwind CSS (or similar)
- Forms: React Hook Form

### Mobile App (React Native/Expo)
- Framework: React Native (Expo)
- Navigation: React Navigation
- State: React Context + hooks
- HTTP: Axios/Fetch
- Forms: React Hook Form

## Key Design Decisions

1. **Monorepo Structure**: All code in one repo for easier development and shared types
2. **API-First**: Backend defines contracts, frontends consume
3. **Role-Based**: Clear separation between coach and trainee experiences
4. **MVP Focus**: Simple, clean code - no premature optimization
