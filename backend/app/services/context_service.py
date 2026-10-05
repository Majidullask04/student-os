import os
import logging
from typing import List, Dict, Any, Optional
import httpx
from context.dev import ContextDev
from app.core.config import settings

logger = logging.getLogger(__name__)

class ContextDevService:
    """
    Server-side wrapper for Context.dev API (https://docs.context.dev).
    Consolidates all web scraping, search, and educational content extraction into one module.
    Secret key is read securely from server-side environment (CONTEXT_DEV_API_KEY).
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("CONTEXT_DEV_API_KEY") or getattr(settings, "CONTEXT_DEV_API_KEY", "")
        if not self.api_key:
            logger.warning("[ContextDevService] Warning: CONTEXT_DEV_API_KEY is not set.")
        
        self.client: Optional[ContextDev] = None
        if self.api_key:
            self.client = ContextDev(api_key=self.api_key)

    def is_configured(self) -> bool:
        return bool(self.api_key and self.client)

    def search_educational_content(
        self,
        query: str,
        num_results: int = 10,
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None,
        freshness: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search the live web for authoritative educational content, tutorials, and documentation.
        Endpoint: POST /web/search (https://docs.context.dev/api-reference/web-scraping/search)
        """
        if not self.is_configured():
            raise ValueError("Context.dev client is not configured. Missing CONTEXT_DEV_API_KEY.")

        try:
            kwargs: Dict[str, Any] = {
                "query": query,
                "num_results": max(10, min(100, num_results)),
            }
            if include_domains:
                kwargs["include_domains"] = include_domains
            if exclude_domains:
                kwargs["exclude_domains"] = exclude_domains
            if freshness:
                kwargs["freshness"] = freshness

            response = self.client.web.search(**kwargs)
            
            # Format results for consumption by Student OS
            results_data = []
            if hasattr(response, "results") and response.results:
                for item in response.results:
                    results_data.append({
                        "url": getattr(item, "url", ""),
                        "title": getattr(item, "title", ""),
                        "description": getattr(item, "description", ""),
                        "relevance": getattr(item, "relevance", "medium"),
                    })

            return {
                "success": True,
                "query": query,
                "total": len(results_data),
                "results": results_data,
            }
        except Exception as e:
            logger.error(f"[ContextDevService] search_educational_content failed for '{query}': {e}")
            raise

    def scrape_educational_resource(
        self,
        url: str,
        main_content_only: bool = True
    ) -> Dict[str, Any]:
        """
        Scrape high-value documentation, roadmap node guides, and open tutorials into clean Markdown.
        Endpoint: POST /web/scrape (https://docs.context.dev/api-reference/web-scraping/scrape)
        """
        if not self.is_configured():
            raise ValueError("Context.dev client is not configured. Missing CONTEXT_DEV_API_KEY.")

        try:
            response = self.client.web.scrape(
                url=url,
                formats={"markdown": True},
                shared_params={"main_content_only": main_content_only}
            )

            markdown_content = ""
            if hasattr(response, "markdown") and response.markdown:
                markdown_content = getattr(response.markdown, "data", "") or ""

            title = ""
            if hasattr(response, "metadata") and response.metadata:
                title = getattr(response.metadata, "title", "") or ""
            if not title and hasattr(response, "title"):
                title = getattr(response, "title", "") or ""

            return {
                "success": True,
                "url": url,
                "title": title,
                "markdown": markdown_content
            }
        except Exception as e:
            logger.error(f"[ContextDevService] scrape_educational_resource failed for '{url}': {e}")
            raise

# Singleton service instance
context_service = ContextDevService()
