"""
Student OS — Semantic Knowledge Search & pgvector RAG Service (Blueprint §11, §12, §38)
Indexes creator resources and learning chunks with 768-dimensional embeddings.
Performs cosine distance retrieval (vector_cosine_ops) via Supabase / pgvector.
"""
from typing import Dict, Any, List, Optional
import math
import re
from app.services.supabase_service import supabase_service
from app.services.gemini_service import gemini_service
from app.db.database import db

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Computes cosine similarity between two numeric vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

class RAGService:
    """Provides semantic pgvector knowledge retrieval with citation grounding."""

    async def search_knowledge(
        self, 
        query: str, 
        top_k: int = 3, 
        threshold: float = 0.35
    ) -> List[Dict[str, Any]]:
        """
        Executes dense pgvector retrieval matching Schema v2 resource_chunks.
        Generates 768-dim embedding via Gemini text-embedding-004.
        """
        query_embedding = await gemini_service.generate_embedding(query)
        results: List[Dict[str, Any]] = []

        # 1. Attempt pgvector RPC search in Supabase if connected
        if supabase_service.is_connected():
            try:
                rpc_res = supabase_service.client.rpc(
                    "match_resource_chunks",
                    {
                        "query_embedding": query_embedding,
                        "match_threshold": threshold,
                        "match_count": top_k
                    }
                ).execute()
                if rpc_res.data:
                    for idx, row in enumerate(rpc_res.data, 1):
                        meta = row.get("metadata") or {}
                        results.append({
                            "id": row.get("id"),
                            "title": meta.get("title", "Resource Chunk"),
                            "creator": meta.get("creator", "Expert Creator"),
                            "category": meta.get("category", "General"),
                            "url": meta.get("url", ""),
                            "snippet": row.get("content", ""),
                            "similarity": round(float(row.get("similarity", 0.0)), 3),
                            "citationId": f"[{idx}]"
                        })
                    if results:
                        return results
            except Exception as e:
                print(f"[RAGService] pgvector RPC warning: {e}")

        # 2. In-memory / Fallback Hybrid Vector & Lexical Scoring
        seed_chunks = db.resource_chunks
        query_tokens = set(re.findall(r'\w+', query.lower()))

        scored = []
        for idx, chunk in enumerate(seed_chunks, 1):
            meta = chunk.get("metadata", {})
            content = chunk.get("content", "")
            title = meta.get("title", "")
            creator = meta.get("creator", "")

            # Lexical overlap
            tokens = re.findall(r'\w+', (title + " " + content + " " + creator).lower())
            overlap = sum(1 for t in query_tokens if t in tokens)
            lex_score = overlap / max(1, len(query_tokens))

            # Bonus for exact title/creator match
            if any(t in title.lower() for t in query_tokens):
                lex_score += 0.25
            if any(t in creator.lower() for t in query_tokens):
                lex_score += 0.20

            # Deterministic vector score simulation
            chunk_embedding = await gemini_service.generate_embedding(content)
            vec_sim = cosine_similarity(query_embedding, chunk_embedding)

            # Hybrid score (60% vector similarity + 40% lexical overlap)
            hybrid_score = (vec_sim * 0.60) + (min(1.0, lex_score) * 0.40)

            if hybrid_score >= threshold or lex_score > 0:
                scored.append({
                    "id": chunk.get("id"),
                    "title": title,
                    "creator": creator,
                    "category": meta.get("category", "AI/ML"),
                    "url": meta.get("url", ""),
                    "snippet": content,
                    "similarity": round(float(hybrid_score), 3),
                    "citationId": f"[{idx}]"
                })

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        return scored[:top_k]

    async def search_with_citations(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Retrieves matching chunks and builds a formatted citation block for LLM prompts.
        """
        chunks = await self.search_knowledge(query, top_k=top_k)
        if not chunks:
            return {
                "chunks": [],
                "citation_text": "No specific external knowledge chunks retrieved.",
                "sources": []
            }

        citation_lines = []
        sources = []
        for c in chunks:
            citation_lines.append(f"{c['citationId']} \"{c['title']}\" by {c['creator']}: {c['snippet']}")
            sources.append({
                "citation": c["citationId"],
                "title": c["title"],
                "creator": c["creator"],
                "url": c["url"],
                "score": c["similarity"]
            })

        return {
            "chunks": chunks,
            "citation_text": "\n\n".join(citation_lines),
            "sources": sources
        }

rag_service = RAGService()
