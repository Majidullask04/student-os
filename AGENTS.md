# Agent Instructions & Project Conventions

## Context.dev Web Scraping & Educational Data Integration

This project integrates [Context.dev](https://docs.context.dev) to provide real-time web scraping, content discovery, and educational extraction for the Student OS platform.

### 1. Environment Variable
- **`CONTEXT_DEV_API_KEY`**: Set in `backend/.env` (and read in `backend/app/core/config.py`).
- **Ground Rule**: The API key is a server-side secret. NEVER hardcode it and NEVER expose it in any frontend/browser bundle.

### 2. Wrapper Module
- **Path**: `backend/app/services/context_service.py`
- **Class / Instance**: `ContextDevService` / `context_service`
- All calls to Context.dev MUST route through this module rather than being scattered across the codebase.

### 3. Chosen Endpoints & Documentation
- **Web Search**: `POST /web/search` (1 credit per 10 results)
  - Docs: https://docs.context.dev/api-reference/web-scraping/search
  - Purpose: Discovers authoritative educational curricula, roadmaps, tutorials, and documentation across the live web.
  - Wrapper Method: `context_service.search_educational_content(query, num_results=10, ...)`
- **Scrape**: `POST /web/scrape` (From 1 credit)
  - Docs: https://docs.context.dev/api-reference/web-scraping/scrape
  - Purpose: Extracts clean, structured Markdown from tutorial and documentation URLs for roadmap deep dives and node syllabus views.
  - Wrapper Method: `context_service.scrape_educational_resource(url, main_content_only=True)`

### 4. Application Integration
- **Backend API**:
  - `GET /api/resources/live-search`: Query live educational resources (`q`, `num_results`).
  - `POST /api/resources/live-scrape`: Scrape and format markdown for an educational URL (`url`).
- **Frontend Client**:
  - `api.searchLiveEducationalContent(query, numResults)` in `frontend/src/services/api.ts`.
  - `api.scrapeLiveEducationalResource(url)` in `frontend/src/services/api.ts`.

### 5. Operating & Credit Constraints
- **Targeted Calls Only**: Calls cost credits. Never execute unbound scraping loops or polling against the live API.
- **Testing**: Keep automated CI tests off the live API (mock `ContextDevService`).
- **Error Handling**: On `429`, honor `Retry-After`; retry `408`/`5xx` with bounded exponential backoff; never retry validation errors (`400`).
