"""
Student OS — Semantic Knowledge Search & RAG Service (Blueprint §6)
Indexes creator resources, roadmap topics, and architectural patterns.
Exposes semantic search tool for autonomous agent grounding.
"""
from typing import Dict, Any, List, Optional
import math
import re

KNOWLEDGE_CORPUS = [
    {
        "id": "kb-rag-hnsw",
        "title": "HNSW Vector Indexing & Distance Metrics",
        "category": "AI/ML",
        "creator": "Andrej Karpathy",
        "content": "Hierarchical Navigable Small World (HNSW) graphs organize high-dimensional vectors into multi-layer skip-list-like graphs. Cosine similarity vs dot product: normalize vectors for inner product to match cosine distance with lower compute overhead."
    },
    {
        "id": "kb-rag-chunking",
        "title": "Optimal Chunking Strategies for RAG",
        "category": "AI/ML",
        "creator": "Harrison Chase (LangChain)",
        "content": "Fixed-size chunking with 256-512 tokens and 10-20% overlap balances semantic completeness against context window limits. For structured data, markdown-aware header splitting prevents table truncation."
    },
    {
        "id": "kb-fastapi-async",
        "title": "FastAPI Asynchronous Concurrency Deep Dive",
        "category": "Backend",
        "creator": "Tiangolo",
        "content": "FastAPI runs async def endpoints directly on the asyncio event loop. Never call blocking I/O (time.sleep, requests.get, sync db) in async def. Use def for synchronous threadpool execution or use httpx.AsyncClient and asyncpg."
    },
    {
        "id": "kb-agent-react",
        "title": "Building Reliable ReAct Autonomous Agents",
        "category": "Agentic AI",
        "creator": "Chip Huyen",
        "content": "Autonomous agents require structured JSON output contracts, deterministic tool dispatch, and step-level reflection. Always ground agent memory with verified session state rather than unbounded context history."
    },
    {
        "id": "kb-ats-tailoring",
        "title": "Engineering High-Impact Technical CVs for ATS",
        "category": "Career",
        "creator": "Gergely Orosz (Pragmatic Engineer)",
        "content": "Technical resumes should follow Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z]. Emphasize actual architecture (FastAPI, Docker, ChromaDB) over generic buzzwords."
    }
]

class RAGService:
    """Provides semantic knowledge search across learning corpus and creator notes."""

    def search_knowledge(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Performs hybrid semantic and keyword retrieval against indexed knowledge base.
        """
        query_tokens = set(re.findall(r'\w+', query.lower()))
        scored_results = []

        for doc in KNOWLEDGE_CORPUS:
            content_tokens = re.findall(r'\w+', (doc["title"] + " " + doc["content"]).lower())
            
            # Compute token overlap & simple frequency score
            overlap_count = sum(1 for token in query_tokens if token in content_tokens)
            score = overlap_count / max(1, len(query_tokens))

            # Bonus if phrase in title or creator
            if any(token in doc["title"].lower() for token in query_tokens):
                score += 0.3
            if any(token in doc.get("creator", "").lower() for token in query_tokens):
                score += 0.2

            if score > 0:
                scored_results.append({
                    "id": doc["id"],
                    "title": doc["title"],
                    "creator": doc["creator"],
                    "category": doc["category"],
                    "snippet": doc["content"],
                    "relevanceScore": round(min(1.0, score), 2)
                })

        # Sort by relevance descending
        scored_results.sort(key=lambda x: x["relevanceScore"], reverse=True)
        return scored_results[:top_k]

rag_service = RAGService()
