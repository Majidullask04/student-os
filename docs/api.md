# Student OS — API Specification

The Student OS backend is built with FastAPI and provides RESTful endpoints for student onboarding, AI agent analysis, roadmap navigation, resources curation, creator integration, and job fit analysis.

## Base URL
`http://localhost:8000`

---

## Endpoints

### Authentication
- `POST /auth/signup`
  - Body: `{ "email": "student@example.com", "password": "...", "name": "Student Name" }`
  - Response: `{ "token": "...", "user": { ... } }`
- `POST /auth/login`
  - Body: `{ "email": "student@example.com", "password": "..." }`
  - Response: `{ "token": "...", "user": { ... } }`

### Profiles & Onboarding
- `GET /profiles`
  - Response: Current student profile (goals, current skills, time commitment, followed creators)
- `POST /profiles`
  - Body: `{ "goal": "AI Engineer", "skills": ["Python", "Git"], "timeCommitmentHours": 2, "followedCreatorIds": [...] }`
  - Response: Updated student profile

### AI Agent & Roadmap
- `POST /agent/analyze`
  - Body: `{ "goal": "AI Engineer", "skills": [...], "timeCommitmentHours": 2 }`
  - Response: Gap analysis and generated roadmap milestones
- `GET /roadmap`
  - Response: Adaptive learning roadmap with modules, tasks, and completion percentages
- `POST /progress`
  - Body: `{ "taskId": "...", "subTaskId": "...", "completed": true }`
  - Response: Updated task status and recalculated progress metrics
- `POST /agent/chat`
  - Body: `{ "message": "What should I learn today?", "model": "GPT-4o" }`
  - Response: AI agent guidance with structured recommendation blocks

### Resources & Creators
- `GET /resources/recommended`
  - Response: List of top personalized video lectures, articles, and courses
- `GET /resources?category=AI / ML`
  - Response: Filtered resource catalog
- `GET /creators`
  - Response: Verified creators with follower counts, featured series, and roadmap topic coverage
- `POST /creators/follow`
  - Body: `{ "creatorId": "karpathy" }`
  - Response: Updated following status

### Career & Jobs
- `GET /jobs`
  - Response: Curated jobs and internships with required skills
- `POST /jobs/analyze`
  - Body: `{ "jobId": "job-1" }`
  - Response: Match score percentage, matched skills, and skill gap improvement roadmap
