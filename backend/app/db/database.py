import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

class InMemoryDatabase:
    """
    In-memory database layer for Student OS.
    Stores and manages all 10 core entities with high fidelity:
    - profiles
    - skills
    - creators
    - resources
    - roadmaps
    - roadmap_modules
    - roadmap_tasks
    - projects
    - progress
    - jobs
    - agent_memory
    """
    def __init__(self):
        self.profiles: Dict[str, Any] = {
            "user-1": {
                "id": "user-1",
                "name": "Majidulla",
                "email": "majidulla@studentos.dev",
                "goal": "AI Engineer",
                "targetRole": "AI Engineer",
                "level": "Intermediate",
                "interests": ["AI", "DevOps", "Full Stack"],
                "timeCommitmentHours": 2,
                "skills": ["Python", "FastAPI", "Git", "Docker"],
                "followedCreatorIds": ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"],
                "created_at": "2026-01-10T10:00:00Z",
                "updated_at": "2026-01-10T10:00:00Z"
            }
        }

        self.skills: Dict[str, List[Dict[str, Any]]] = {
            "user-1": [
                {"id": "sk-1", "name": "Python", "level": 4, "proficiency": 85, "category": "Language"},
                {"id": "sk-2", "name": "FastAPI", "level": 3, "proficiency": 70, "category": "Backend"},
                {"id": "sk-3", "name": "Git", "level": 3, "proficiency": 75, "category": "DevOps"},
                {"id": "sk-4", "name": "Docker", "level": 2, "proficiency": 50, "category": "DevOps"},
            ]
        }

        self.creators: Dict[str, Dict[str, Any]] = {
            "karpathy": {
                "id": "karpathy",
                "name": "Andrej Karpathy",
                "handle": "@karpathy",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "verified": True,
                "followers": "1.2M",
                "platform": "YouTube",
                "bio": "Building AI from scratch: micrograd, makemore, nanoGPT. Former Director of AI at Tesla and OpenAI founding team.",
                "tags": ["AI / Deep Learning", "LLMs", "From Scratch"],
                "featured_series": ["Neural Networks: Zero to Hero", "nanoGPT", "Building micrograd"],
                "why_relevant": "The gold standard for understanding transformers, backprop, and attention mechanisms at the code level.",
                "viewpoint": "Understand neural networks from first principles; code backpropagation and transformers from scratch before using high-level frameworks."
            },
            "kunalkushwaha": {
                "id": "kunalkushwaha",
                "name": "Kunal Kushwaha",
                "handle": "@kunalstwt",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "verified": True,
                "followers": "480K",
                "platform": "YouTube",
                "bio": "Democratizing tech education. Open source enthusiast, DevOps educator, CNCF ambassador, and community builder.",
                "tags": ["DevOps", "Open Source", "DSA", "Go"],
                "featured_series": ["DevOps Bootcamp", "Complete Git & GitHub", "Data Structures & Algorithms in Java"],
                "why_relevant": "Teaches how to package, deploy, and operationalize code using Docker, Kubernetes, and open-source practices.",
                "viewpoint": "Focus on strong computer science fundamentals, data structures & algorithms first, and open-source contributions."
            },
            "fireship": {
                "id": "fireship",
                "name": "Jeff Delaney (Fireship)",
                "handle": "@fireship_dev",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                "verified": True,
                "followers": "3.1M",
                "platform": "YouTube",
                "bio": "High-intensity code tutorials to help you build apps faster. Tech trends, architecture reviews, and 100-second overviews.",
                "tags": ["Full Stack", "AI Tools", "Cloud Architecture"],
                "featured_series": ["Code in 100 Seconds", "Full Stack AI Apps", "Beyond Fireship"],
                "why_relevant": "Keeps you updated on emerging ecosystem tools like Supabase, vector DBs, LangChain, and modern web frameworks.",
                "viewpoint": "Build real projects fast. Learn modern tooling (Supabase, Vector DBs, Next.js) by shipping MVPs rather than over-studying theory."
            },
            "hiteshchoudhary": {
                "id": "hiteshchoudhary",
                "name": "Hitesh Choudhary",
                "handle": "@hiteshdotcom",
                "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
                "verified": True,
                "followers": "920K",
                "platform": "YouTube",
                "bio": "Ex-CTO, teacher, and developer. Producing comprehensive courses on backend engineering, JavaScript, Python, and system design.",
                "tags": ["Backend", "Python", "JavaScript", "System Design"],
                "featured_series": ["Chai aur Python", "Chai aur Code Backend Series", "Production System Design"],
                "why_relevant": "Delivers in-depth, production-oriented backend courses covering API design, authentication, and database schemas.",
                "viewpoint": "Master the backend and database architecture first; learn how to structure scalable REST and WebSocket APIs."
            }
        }

        self.followed_creators: Dict[str, List[str]] = {
            "user-1": ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"]
        }

        self.resources: List[Dict[str, Any]] = [
            {
                "id": "res-1",
                "title": "Build a Complete RAG App with LangChain & ChromaDB",
                "platform": "YouTube Video",
                "creator": "codebasics",
                "category": "AI / ML",
                "tags": ["AI / LLMs", "RAG", "Vector Search", "LangChain"],
                "difficulty": "Intermediate",
                "duration": "1h 12m",
                "url": "https://youtube.com/watch?v=sample1",
                "rating": 4.9,
                "why_recommended": "Directly bridges your Python skills to vector database retrieval and prompt augmentation."
            },
            {
                "id": "res-2",
                "title": "FastAPI Full Course: Production REST APIs with Auth & Postgres",
                "platform": "Course (free)",
                "creator": "freeCodeCamp",
                "category": "Backend",
                "tags": ["Backend", "FastAPI", "APIs", "PostgreSQL"],
                "difficulty": "Beginner",
                "duration": "3h 12m",
                "url": "https://youtube.com/watch?v=sample2",
                "rating": 4.9,
                "why_recommended": "Strengthens backend API foundations needed before serving LLM endpoints."
            },
            {
                "id": "res-3",
                "title": "Neural Networks: Zero to Hero (Building micrograd)",
                "platform": "YouTube Series",
                "creator": "karpathy",
                "category": "AI / ML",
                "tags": ["AI / LLMs", "Deep Learning", "From Scratch"],
                "difficulty": "Intermediate",
                "duration": "2h 25m",
                "url": "https://youtube.com/watch?v=sample3",
                "rating": 5.0,
                "why_recommended": "Teaches fundamental attention mechanics and gradient flow directly from Andrej Karpathy."
            },
            {
                "id": "res-4",
                "title": "Docker & Containerization for Python Developers",
                "platform": "YouTube Video",
                "creator": "kunalkushwaha",
                "category": "DevOps",
                "tags": ["DevOps", "Docker", "Containers"],
                "difficulty": "Beginner",
                "duration": "1h 45m",
                "url": "https://youtube.com/watch?v=sample4",
                "rating": 4.8,
                "why_recommended": "Essential for containerizing your AI agent backend and deploying reproducible microservices."
            },
            {
                "id": "res-5",
                "title": "Vector Databases Explained: Embeddings, Cosine Similarity & Indexing",
                "platform": "Article & Guide",
                "creator": "fireship",
                "category": "AI / ML",
                "tags": ["RAG", "Vector Databases", "Embeddings"],
                "difficulty": "Beginner",
                "duration": "45m",
                "url": "https://fireship.io/lessons/sample5",
                "rating": 4.9,
                "why_recommended": "Fast, visual breakdown of embedding space and vector similarity math."
            },
            {
                "id": "res-6",
                "title": "Building Autonomous AI Agents with Tool Calling & ReAct Pattern",
                "platform": "YouTube Video",
                "creator": "codebasics",
                "category": "AI / ML",
                "tags": ["AI Agents", "Function Calling", "Gemini", "Python"],
                "difficulty": "Advanced",
                "duration": "1h 35m",
                "url": "https://youtube.com/watch?v=sample6",
                "rating": 4.9,
                "why_recommended": "Teaches the exact tool-calling and reasoning loops you need for advanced AI Engineer roles."
            }
        ]

        self.projects: Dict[str, List[Dict[str, Any]]] = {
            "user-1": [
                {
                    "id": "proj-1",
                    "title": "FastAPI Microservice with JWT Auth",
                    "description": "Production REST API with user registration, token revocation, and PostgreSQL storage.",
                    "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Docker"],
                    "repo_url": "https://github.com/student/fastapi-auth",
                    "live_url": "https://fastapi-auth.demo.dev",
                    "status": "Completed"
                },
                {
                    "id": "proj-2",
                    "title": "CLI Document Summarizer",
                    "description": "Command line tool utilizing LLM APIs to extract executive summaries from markdown files.",
                    "tech_stack": ["Python", "Gemini API", "Click"],
                    "repo_url": "https://github.com/student/doc-summarizer",
                    "live_url": None,
                    "status": "Completed"
                }
            ]
        }

        self.roadmaps: Dict[str, Dict[str, Any]] = {
            "user-1": {
                "id": "roadmap-user-1",
                "user_id": "user-1",
                "goal": "AI Engineer",
                "targetRole": "AI Engineer",
                "overallPercentage": 28,
                "stages": [
                    {
                        "stageNumber": 1,
                        "title": "Foundations",
                        "status": "Completed",
                        "description": "Core Python programming, data structures, Git, and developer workflows.",
                        "whyThisStep": "Establishes production software engineering hygiene before touching machine learning.",
                        "percentage": 100,
                        "tasks": [
                            {"id": "t1-1", "title": "Python OOP & Async/Await", "type": "Theory", "estimatedHours": 3, "completed": True},
                            {"id": "t1-2", "title": "Git Workflow & Version Control", "type": "Hands-on", "estimatedHours": 2, "completed": True},
                            {"id": "t1-3", "title": "Build a Modular CLI Tool", "type": "Project", "estimatedHours": 4, "completed": True}
                        ]
                    },
                    {
                        "stageNumber": 2,
                        "title": "Backend & APIs",
                        "status": "In Progress",
                        "description": "Build high-throughput REST APIs, database schemas, and microservices.",
                        "whyThisStep": "AI models are unusable without reliable backend APIs serving inference to clients.",
                        "percentage": 60,
                        "tasks": [
                            {"id": "t2-1", "title": "FastAPI Dependency Injection & Routing", "type": "Theory", "estimatedHours": 2, "completed": True},
                            {"id": "t2-2", "title": "PostgreSQL & Supabase CRUD Operations", "type": "Hands-on", "estimatedHours": 3, "completed": True},
                            {"id": "t2-3", "title": "Dockerize API & Multi-stage Build", "type": "Hands-on", "estimatedHours": 3, "completed": False}
                        ]
                    },
                    {
                        "stageNumber": 3,
                        "title": "AI & LLMs",
                        "status": "Next",
                        "description": "Master transformer mechanics, tokenization, prompt design, and embeddings.",
                        "whyThisStep": "Bridges traditional backend programming into modern generative AI systems.",
                        "percentage": 0,
                        "tasks": [
                            {"id": "t3-1", "title": "LLM Tokens & Context Window Mechanics", "type": "Theory", "estimatedHours": 2, "completed": False},
                            {"id": "t3-2", "title": "Structured Output & JSON Schema with Gemini", "type": "Hands-on", "estimatedHours": 3, "completed": False},
                            {"id": "t3-3", "title": "Generate Text Embeddings with Vector Math", "type": "Hands-on", "estimatedHours": 2, "completed": False}
                        ]
                    },
                    {
                        "stageNumber": 4,
                        "title": "RAG",
                        "status": "Upcoming",
                        "description": "Build retrieval-augmented generation pipelines using vector search and rerankers.",
                        "whyThisStep": "Companies need LLMs grounded in proprietary knowledge rather than generic hallucinations.",
                        "percentage": 0,
                        "tasks": [
                            {"id": "t4-1", "title": "Chunking Strategies (Fixed, Recursive, Semantic)", "type": "Theory", "estimatedHours": 2, "completed": False},
                            {"id": "t4-2", "title": "Vector Search with ChromaDB & Cosine Distance", "type": "Hands-on", "estimatedHours": 3, "completed": False},
                            {"id": "t4-3", "title": "Build a Document Q&A Retrieval Engine", "type": "Project", "estimatedHours": 6, "completed": False}
                        ]
                    },
                    {
                        "stageNumber": 5,
                        "title": "AI Agents",
                        "status": "Upcoming",
                        "description": "Implement autonomous tool-using agents with planning, execution, and verification.",
                        "whyThisStep": "The industry is shifting from static chatbots to autonomous action-oriented agent loops.",
                        "percentage": 0,
                        "tasks": [
                            {"id": "t5-1", "title": "ReAct Agent Pattern & Function Calling", "type": "Theory", "estimatedHours": 3, "completed": False},
                            {"id": "t5-2", "title": "Multi-Tool Execution & Error Recovery", "type": "Hands-on", "estimatedHours": 4, "completed": False},
                            {"id": "t5-3", "title": "Build an Autonomous Web Research Agent", "type": "Project", "estimatedHours": 8, "completed": False}
                        ]
                    },
                    {
                        "stageNumber": 6,
                        "title": "Production & DevOps",
                        "status": "Upcoming",
                        "description": "Rate limiting, evaluation harnesses, CI/CD, telemetry, and cloud deployment.",
                        "whyThisStep": "Proves you can operate resilient, low-latency AI services at scale.",
                        "percentage": 0,
                        "tasks": [
                            {"id": "t6-1", "title": "LLM Observability & Latency Tracing", "type": "Theory", "estimatedHours": 2, "completed": False},
                            {"id": "t6-2", "title": "CI/CD Pipeline with Automated Lint & Test", "type": "Hands-on", "estimatedHours": 3, "completed": False}
                        ]
                    },
                    {
                        "stageNumber": 7,
                        "title": "Career & Jobs",
                        "status": "Upcoming",
                        "description": "Portfolio polish, live demos, resume tailoring, and behavioral/technical interviews.",
                        "whyThisStep": "Translates technical capability into verified hiring offers.",
                        "percentage": 0,
                        "tasks": [
                            {"id": "t7-1", "title": "System Design Portfolio Case Study", "type": "Project", "estimatedHours": 4, "completed": False},
                            {"id": "t7-2", "title": "Technical Mock Interview on RAG & Agents", "type": "Hands-on", "estimatedHours": 2, "completed": False}
                        ]
                    }
                ]
            }
        }

        self.progress: Dict[str, Dict[str, bool]] = {
            "user-1": {
                "t1-1": True,
                "t1-2": True,
                "t1-3": True,
                "t2-1": True,
                "t2-2": True,
                "t2-3": False
            }
        }

        self.jobs: List[Dict[str, Any]] = [
            {
                "id": "job-1",
                "title": "Junior AI Engineer",
                "company": "Cognitive Scale AI",
                "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
                "location": "Remote",
                "job_type": "Full-time",
                "experience": "0-2 years",
                "salary": "$95,000 - $120,000",
                "skills_required": ["Python", "FastAPI", "RAG", "Vector Databases", "Docker"],
                "description": "We are seeking a junior AI engineer to build RAG pipelines, API integrations, and vector search microservices.",
                "apply_url": "https://example.com/jobs/ai-eng"
            },
            {
                "id": "job-2",
                "title": "AI Applications Developer",
                "company": "Nexus Agentic Systems",
                "company_logo": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100",
                "location": "San Francisco / Remote",
                "job_type": "Full-time",
                "experience": "1-3 years",
                "salary": "$115,000 - $140,000",
                "skills_required": ["Python", "FastAPI", "AI Agents", "Docker", "Git", "ChromaDB"],
                "description": "Join our team building autonomous reasoning systems, function calling agents, and automated data pipelines.",
                "apply_url": "https://example.com/jobs/nexus"
            },
            {
                "id": "job-3",
                "title": "Full Stack AI Intern",
                "company": "Applied GenAI Labs",
                "company_logo": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100",
                "location": "New York / Hybrid",
                "job_type": "Internship",
                "experience": "0-1 years",
                "salary": "$45/hr",
                "skills_required": ["Python", "Git", "REST APIs", "Prompt Engineering"],
                "description": "Great role for students: work directly on prompting, evaluation harnesses, and full stack prototype demos.",
                "apply_url": "https://example.com/jobs/intern"
            }
        ]

        self.agent_memory: Dict[str, List[Dict[str, Any]]] = {
            "user-1": [
                {
                    "id": "mem-1",
                    "role": "system",
                    "content": "Student profile initialized. Goal: AI Engineer. Baseline skills: Python, FastAPI, Git, Docker.",
                    "metadata": {"type": "onboarding"},
                    "created_at": "2026-01-10T10:05:00Z"
                },
                {
                    "id": "mem-2",
                    "role": "user",
                    "content": "I prefer project-based learning rather than watching 10-hour theoretical playlists.",
                    "metadata": {"preference": "project_based"},
                    "created_at": "2026-01-11T14:20:00Z"
                },
                {
                    "id": "mem-3",
                    "role": "assistant",
                    "content": "Noted! I will prioritize hands-on project tasks (like building micrograd or a vector search pipeline) over passive video lectures.",
                    "metadata": {"acknowledged": "hands_on"},
                    "created_at": "2026-01-11T14:20:05Z"
                }
            ]
        }

db = InMemoryDatabase()
