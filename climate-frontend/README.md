# FOOD & DISASTER MANGEMENT — Frontend (React + TypeScript + Vite)

This repository contains the FOOD & DISASTER MANGEMENT frontend application built with React, TypeScript and Vite. It's the UI for the FOOD & DISASTER MANGEMENT climate resilience and food security platform (previously developed as FoodBridge).

This README provides quick developer setup and notes about a few important project decisions made during development.

## What this app contains
- React + TypeScript app scaffolded with Vite
- Custom UI primitives in `src/components/ui`
- Pages for dashboards, maps, disaster detail, analytics, and admin tools
- WebSocket integration for real-time alerts (`src/hooks/useWebSocket.ts`, `src/components/WebSocketProvider.tsx`)

## Quick start (Windows / PowerShell)
1. Install dependencies:

```powershell
cd climate-frontend
npm install
```

2. Start the dev server (Vite):

```powershell
npm run dev
```

3. Open the app: by default Vite serves on http://localhost:5173 — open that in your browser.

Notes:
- The frontend expects a backend API server running at the configured API base URL (see `src/lib/api.ts`). In development this is typically `http://localhost:8000`.
- If you changed ports, update the `VITE_API_BASE_URL` environment variable or the `lib/api.ts` helper.

## Admin quick actions
The admin dashboard includes three quick actions:

- Manage Users — downloads a JSON export of users from the backend (`GET /api/v1/auth/users`).
- Generate Reports — downloads a JSON snapshot of dashboard analytics (`GET /api/v1/analytics/dashboard`).
- Data Backup — triggers a lightweight snapshot export (`POST /api/v1/admin/backup`) and downloads it as JSON.

These buttons call the backend endpoints and will prompt a file download in your browser. Ensure you're logged in as an admin user when using them.

## Food-donations feature (soft-disabled)
During development the original 'food-donations' feature (for farmers to donate surplus produce) was implemented and later intentionally soft-disabled at the routing level. The source code remains in the repo but the public routes and menu entries were removed. If you want to re-enable it, undo the router mounting change in the backend and re-add the route in the frontend navigation.

## Developer pointers
- Sidebar branding and app name changed to FOOD & DISASTER MANGEMENT (see `public/allsecure-icon.svg` and `index.html`).
- Map detail pages use `react-leaflet`; if you see "Map container is already initialized" errors, the code now forces a remount via a unique `key` prop on `MapContainer` in `src/pages/DisasterDetail.tsx`.
- WebSocket disconnections (close code 1006) were observed in some environments; check backend uvicorn logs and browser console to debug network/AV interference.

## Linting / typechecks
This project uses TypeScript; run the normal Vite TypeScript checks during builds. For linting, follow the ESLint config in the repository root.

## Contributing
- Create a feature branch and open a PR. Keep changes focused and include small runnable steps for reviewers.

---
If you'd like, I can also open a PR that normalizes remaining branding occurrences across docs and exports.
