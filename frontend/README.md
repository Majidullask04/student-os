# Student OS — Frontend

React + Vite + TypeScript web application for Student OS.

## Tech Stack
- React 19 + TypeScript + Vite 8
- Tailwind CSS (v4)
- Lucide React icons
- React Router v7
- TanStack Query v5
- Recharts

## Setup

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.
By default, all API calls in `src/services/api.ts` gracefully fall back to rich seeded mock data in `src/mocks/data.ts` if the backend is not running.
When the FastAPI backend is running at `http://localhost:8000`, requests are routed to it automatically.
