# Student OS — Backend

FastAPI backend powered by Supabase PostgreSQL and Google Gemini agent workflows.

## Features
- **Student Profile Management**: Goal, skills, daily time commitment, and followed creators.
- **AI Gap Analysis & Roadmap Generation**: Evaluates what a student knows vs. what a target role demands using Gemini API.
- **Adaptive Roadmap**: 7-stage learning milestones with task completion tracking.
- **Personalized Resources & Creators**: Recommends top videos, docs, and creators mapped directly to roadmap nodes.
- **Job-Fit Analysis**: Computes readiness percentages and actionable gap-closing tasks.

## Setup & Running

1. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env` in the root or backend directory and set your `GEMINI_API_KEY`, `SUPABASE_URL`, etc.

4. **Run the API server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

Interactive API documentation will be available at `http://localhost:8000/docs`.
