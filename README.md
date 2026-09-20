# Student OS 🎓🚀
> **Autonomous Agentic Learning & Career Operating System**  
> *Bridging the chasm from student curiosity to verified industry readiness with multi-agent intelligence, adaptive roadmaps, and automated career acceleration.*

[![Student OS CI](https://github.com/Majidullask04/student-os/actions/workflows/ci.yml/badge.svg)](https://github.com/Majidullask04/student-os/actions/workflows/ci.yml)
[![AWS Backend Deployment](https://github.com/Majidullask04/student-os/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/Majidullask04/student-os/actions/workflows/deploy-backend.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![Node.js 22](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)

---

## 🌟 Executive Summary

Students today are inundated with thousands of creator videos, fragmented tutorials, and conflicting career advice. The challenge is no longer access to information—**it is knowing what to learn today, which advice applies to their unique background, what critical gaps remain, and how to prove job-readiness to hiring teams.**

**Student OS** solves this with an enterprise-grade, multi-agent AI system:
- **Personalized Learning Engine:** Evaluates current student skills, time commitments, and career goals to synthesize an adaptive 7-stage roadmap.
- **Creator Conflict Resolution:** Contextualizes conflicting advice (e.g., Karpathy's deep mathematical foundations vs. Fireship's fast-iterative ship-fast philosophy) tailored to the student's constraints.
- **pgvector RAG Knowledge Layer:** 768-dimensional dense vector embeddings with semantic chunk retrieval and verified creator citations.
- **Autonomous Job Search & Career Agent:** Evaluates active tech job postings across 5 dimensions (Technical, Experience, Alignment, Behavioral, Location) and automatically generates tailored application kits, STAR stories, and targeted interview prep.

---

## 🏛️ System Architecture

```
                                  [ STUDENT USER ]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
       [ AWS Amplify Hosting ]                     [ Vercel Edge Fallback ]
    React 19 / Vite / TailwindCSS                React 19 / Vite / TailwindCSS
   Global CDN / CloudFront Edge                Automatic Preview Deployments
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         │ HTTPS / Bearer JWT
                                         ▼
                            [ AWS App Runner Service ]
                        FastAPI High-Performance Engine
                     (1 vCPU / 2GB • Auto-scaling 1-2 instances)
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
 [ Supabase Cloud ]              [ Google Gemini ]               [ CloudWatch ]
• PostgreSQL 15 + pgvector     • Gemini 2.0 / 1.5 Flash        • Centralized Logs
• Row-Level Security (RLS)     • Tool Calling (11 registered)  • Health Checks
• Supabase Auth (JWT)          • Multi-Agent Reasoning         • Deployment Status
• Tenant-Isolated Tables       • Deterministic Fallback
```

---

## 🤖 Multi-Agent Orchestration Architecture

Student OS employs a collaborative multi-agent architecture with deterministic fallback guardrails:

```
                                  [ User Request ]
                                         │
                                         ▼
                         [ Multi-Agent Orchestrator ]
                         (Intent Router & Context Builder)
                                         │
         ┌──────────────────┬────────────┴────────────┬──────────────────┐
         ▼                  ▼                         ▼                  ▼
  [ LearningAgent ]   [ JobSearchAgent ]    [ AssessmentAgent ]   [ ProjectAgent ]
  • Gap Analysis      • 5D Job Fit Scoring   • Diagnostic Tests    • Real-World Briefs
  • Adaptive Roadmap  • Canonical Dedup      • Gap Remediation     • Milestones
  • Conflict Engine   • Tailored CV Kits     • Injected Sprints    • Repo Templates
         │                  │                         │                  │
         └──────────────────┼─────────────────────────┴──────────────────┘
                            ▼
               [ pgvector RAG & Tool Registry ]
               • 768-dim Dense Vector Embeddings
               • Semantic Similarity Search (Cosine)
               • Citation Formatter & Guardrails
```

| Agent | Responsibilities | Key Tools Registered |
|---|---|---|
| **LearningAgent** | Evaluates student profile, computes verified skill gaps, and dynamically updates roadmap milestones. | `get_student_profile`, `update_roadmap_milestone`, `resolve_creator_conflict` |
| **JobSearchAgent** | Deduplicates job boards using canonical keys, scores job fit across 5 dimensions, and prepares applications. | `search_matching_jobs`, `generate_tailored_cv_bullets`, `generate_interview_prep` |
| **AssessmentAgent** | Dynamically quizzes the student on specific topics; injects targeted remediation sprints on knowledge gaps. | `generate_diagnostic_quiz`, `evaluate_assessment`, `inject_adaptive_sprint` |
| **ProjectAgent** | Generates hands-on production project blueprints tailored to portfolio deficiencies. | `generate_project_blueprint`, `verify_project_submission` |
| **RAG Service** | Performs cosine similarity queries against 768-dim embeddings in Supabase pgvector. | `search_knowledge_chunks`, `format_citations` |

---

## 🛡️ Production Security & Cloud Governance

1. **Zero-Stored-Keys Deployment via AWS OIDC:**
   - GitHub Actions connects to AWS using OpenID Connect (`sts:AssumeRoleWithWebIdentity`). No static `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` secrets are ever stored in GitHub.
2. **Production Auth Enforcement (`ENFORCE_AUTH=true`):**
   - Cryptographically validates Supabase JWT signatures (`HS256`).
   - Missing or forged tokens receive strict HTTP `401 Unauthorized`.
3. **Dynamic CORS & Origin Regex:**
   - Dynamically authorizes local environments (`localhost:5173`), Vercel staging environments, and wildcard AWS Amplify domains (`https://*.amplifyapp.com`).
4. **Tenant Isolation:**
   - Database queries are partitioned by `user_id` backed by Supabase Row-Level Security (RLS).
5. **Rate-Limiting Guardrails:**
   - Daily quota limit (60 requests/day per student) prevents API abuse and quota exhaustion.

---

## 🚀 AWS Cloud CI/CD Pipeline

Student OS features a fully automated dual-cloud CI/CD pipeline:

```
git push origin main
   │
   ├──► [ GitHub Actions: deploy-backend.yml ]
   │     1. Setup Python 3.11
   │     2. Execute all 5 backend test suites (100% pass required)
   │     3. Docker build for linux/amd64
   │     4. Push image to Amazon ECR (student-os-backend)
   │     5. Trigger AWS App Runner deployment operation
   │     6. Poll deployment status until SUCCEEDED
   │     7. Execute smoke test against /health
   │
   └──► [ AWS Amplify Hosting: amplify.yml ]
         1. Node.js 22 LTS environment setup
         2. Clean npm ci installation
         3. Production Vite compilation
         4. Global CloudFront CDN deployment with SPA rewrite rules
```

---

## 🧪 Comprehensive Test Suite (100% Pass)

The backend features 5 rigorous test suites covering all agent and database layers:

```bash
cd backend
PYTHONPATH=. python3 tests/test_schema_v2_and_rag.py
PYTHONPATH=. python3 tests/test_agent_flow.py
PYTHONPATH=. python3 tests/test_job_search_agent.py
PYTHONPATH=. python3 tests/test_adaptive_loop.py
PYTHONPATH=. python3 tests/test_personalization_eval.py
```

### Coverage Highlights:
- ✅ **Test 1:** Strict Multi-Tenant Isolation (Roadmap leakage protection).
- ✅ **Test 2:** 768-dimensional dense vector embeddings with normalized cosine search.
- ✅ **Test 3:** pgvector RAG retrieval with verified creator citations.
- ✅ **Test 4:** Agent Observability logging (latency, token costs, tool call tracing).
- ✅ **Test 5:** MadsLorentzen-inspired Job Search 5D fit evaluation and canonical deduplication.
- ✅ **Test 6:** Multi-Persona Personalization Evaluation across Beginner, Advanced, and Frontend learner paths.

---

## 💻 Local Quickstart

### Prerequisites
- Node.js 20.19+ or 22.x
- Python 3.11+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Majidullask04/student-os.git
cd student-os
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
# Fill in GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET

# Run FastAPI backend on port 8000
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Run Vite dev server on port 5173
npm run dev
```

Visit **`http://localhost:5173`** to access the Student OS platform.

---

## 📋 Environment Configuration Reference

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `ENVIRONMENT` | Runtime environment (`development` / `production`) | `production` |
| `ENFORCE_AUTH` | Require valid JWTs on all private endpoints | `true` |
| `SUPABASE_URL` | Supabase Project REST URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase client anon public key | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase privileged server key | `eyJhbGci...` |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret for HS256 validation | `your-jwt-secret` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `CORS_ORIGINS` | Comma-separated allowed HTTP origins | `http://localhost:5173,https://student-os.vercel.app` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend FastAPI base URL | `https://xxxx.ap-south-1.awsapprunner.com` |
| `VITE_SUPABASE_URL` | Supabase base URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase public key | `sb_publishable_...` |

---

## 📖 Deployment Guide

For the step-by-step AWS deployment walkthrough (ECR, GitHub OIDC, App Runner, and Amplify Hosting), see:
👉 **[AWS_SETUP.md](AWS_SETUP.md)**

---

## 👥 Contributors & Acknowledgements

- **Majidulla** — Full-stack Architecture, Multi-Agent Engineering, Cloud Infrastructure.
- Built for the **Bharat Builders Hackathon 2026**.
- Inspired by the creator pedagogical models of Andrej Karpathy, Kunal Kushwaha, Jeff Delaney (Fireship), and Hitesh Choudhary.
