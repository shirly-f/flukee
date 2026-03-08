# Backend - Notify Configuration

This directory contains the backend configuration and API logic for the Flukee coaching platform.

## Quick Start

```bash
cd backend
npm install
npm start
```

The server will start on `http://localhost:3001`

## Test Users

The database is seeded with test users:

- **Coach**: `coach@test.com` / `password`
- **Trainee**: `trainee@test.com` / `password`

## API Endpoints

See `docs/API.md` for complete API documentation.

## Database

Currently using an in-memory database for MVP. Easy to swap with Notify database later by updating `db/index.js`.

## Authentication

Mock authentication using simple tokens. Replace `middleware/auth.js` with Notify Auth integration when ready.
