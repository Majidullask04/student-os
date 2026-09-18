# Student OS — Personalized AI Learning Platform

Student OS is a personalized AI-powered learning operating system for students aspiring to become AI Engineers, Full Stack Developers, Data Scientists, and DevOps Engineers. It features dynamic roadmap milestones, curated resources from top educators, AI assistant guidance, real-time job fit analysis, and progress analytics.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS + Custom Design System Tokens (Dark navy `#0B1120` sidebar, purple/indigo primary `#4F46E5` / `#6366F1`)
- **Icons**: Lucide React
- **Routing**: React Router
- **State & Data Fetching**: TanStack Query
- **Charts & Visualizations**: Recharts (Donut progress chart, Daily learning hours bar chart, GitHub-style activity heatmap)
- **Delight & Micro-interactions**: Canvas Confetti, custom smooth scrollbars, responsive drawers

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Architecture: Mock Data vs Live FastAPI Backend

Student OS includes an intelligent dual-mode API layer in `src/services/api.ts`:

- **Out of the Box (Demo Mode)**: Every API call automatically falls back to rich seeded mock data in `src/mocks/data.ts`. All pages, charts, filters, checklists, and AI chat interactions work immediately without any backend running.
- **Switching to Live FastAPI Backend**:
  1. Set the backend URL in `.env`:
     ```env
     VITE_API_URL=http://localhost:8000
     ```
  2. Start your FastAPI server on port 8000.
  3. The frontend will automatically detect the live backend and route requests to it. If the backend ever restarts or becomes unreachable, the frontend gracefully falls back to local data so you never experience broken UI or white screens.

---

## FastAPI Backend Endpoints Supported

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Student signup |
| `POST` | `/auth/login` | Student authentication |
| `GET` | `/profiles` | Get active student profile |
| `POST` | `/profiles` | Save onboarding targets, skills, time commitment |
| `POST` | `/agent/analyze` | AI gap analysis and roadmap generation |
| `GET` | `/roadmap` | Fetch customized roadmap stages and tasks |
| `POST` | `/progress` | Mark milestone/task/subtask complete |
| `GET` | `/resources/recommended` | Personalized high-yield resource feed |
| `GET` | `/resources?category=` | Filter resources by category |
| `GET` | `/creators` | List top educators with roadmap topic coverage |
| `POST` | `/creators/follow` | Toggle following creator |
| `POST` | `/agent/chat` | AI conversational assistant guidance with rich card outputs |
| `GET` | `/jobs` | Recommended job openings with match percentages |
| `POST` | `/jobs/analyze` | AI job-fit analysis and skill gap breakdown |

---

## Features & Pages

1. **Dashboard (`/`)**: Morning motivational hero, 5 metric stats cards, 6-stage roadmap stepper, active module task checklist, Today's Focus, Ask Your AI Agent mini widget, and progress donut chart.
2. **My Roadmap (`/roadmap`)**: 7-stage master stepper, module list with progress bars, task details with subtask checkboxes, estimated hours, "Why this step?", and AI Agent next task suggestions.
3. **AI Assistant (`/assistant`)**: Chat history grouped by time, model selector (GPT-4o, Claude 3.5, Gemini 1.5), rich interactive recommendation cards with accordions for "Why this recommendation?", curated resources, and next action items.
4. **Learning Resources (`/resources`)**: Curated content categorized by AI/ML, Backend, DevOps, DSA, System Design, with level/duration filters and instant bookmarks.
5. **Creators (`/creators`)**: Top tech educators (Andrej Karpathy, Kunal Kushwaha, Fireship, Hitesh Choudhary, etc.) with bio, series, follow toggle, and the "Creators for Your Path" comparison matrix table.
6. **My Projects (`/projects`)**: Filterable project gallery with progress bars, tech stack tags, live demo links, and AI project idea recommendations.
7. **Career Hub (`/career`)**: Jobs and internships with skill match percentages, skills matched/missing tags, and automated AI action plan generation.
8. **Your Progress (`/progress`)**: Daily learning hours Recharts bar chart, 112-day GitHub-style contribution heatmap, skill proficiency levels, and achievements.
9. **Community (`/community`)**: Interactive post composer, discussion feed, study group join toggles, and live event registrations.
10. **Authentication & Onboarding (`/login`, `/onboarding`)**: Split-screen auth and a 3-step personalized onboarding wizard.
11. **Command Palette (`⌘K`)**: Instant search across all modules, resources, creators, and direct prompts to the AI assistant.
