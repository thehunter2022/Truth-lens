import os
import logging
from typing import Dict, List, Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from config import settings


log = logging.getLogger("news-service")


class NewsService:

    BASE_URL = "https://gnews.io/api/v4"

    API_KEY = settings.GNEWS_API_KEY or os.getenv("GNEWS_API_KEY")

    session = requests.Session()

    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )

    session.mount(
        "https://",
        HTTPAdapter(max_retries=retry),
    )

    @classmethod
    def _request(
        cls,
        endpoint: str,
        params: Dict,
    ) -> Dict:

        if not cls.API_KEY:
            raise RuntimeError(
                "Missing GNEWS_API_KEY configuration. Live news requires a valid GNews API key."
            )

        params["apikey"] = cls.API_KEY

        try:
            response = cls.session.get(
                f"{cls.BASE_URL}/{endpoint}",
                params=params,
                timeout=15,
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout as ex:
            log.error("GNews timeout: %s", ex)
            raise RuntimeError("GNews request timed out. Please try again later.") from ex
        except requests.exceptions.RequestException as ex:
            log.error("GNews request failed: %s", ex)
            raise RuntimeError(f"GNews request failed: {ex}") from ex

    @classmethod
    def get_latest_news(
        cls,
        category="general",
        country="us",
        language="en",
        max_results=10,
    ) -> List[Dict]:

        data = cls._request(
            "top-headlines",
            {
                "category": category,
                "country": country,
                "lang": language,
                "max": max_results,
            },
        )

        return data.get("articles", [])

    @classmethod
    def search_news(
        cls,
        query: str,
        language="en",
        country="us",
        max_results=10,
    ) -> List[Dict]:

        data = cls._request(
            "search",
            {
                "q": query,
                "lang": language,
                "country": country,
                "max": max_results,
            },
        )

        return data.get("articles", [])

    @classmethod
    def trending_news(
        cls,
        max_results=10,
    ) -> List[Dict]:

        return cls.get_latest_news(
            category="general",
            max_results=max_results,
        )

    @classmethod
    def technology_news(
        cls,
        max_results=10,
    ):

        return cls.get_latest_news(
            category="technology",
            max_results=max_results,
        )

    @classmethod
    def sports_news(
        cls,
        max_results=10,
    ):

        return cls.get_latest_news(
            category="sports",
            max_results=max_results,
        )

    @classmethod
    def business_news(
        cls,
        max_results=10,
    ):

        return cls.get_latest_news(
            category="business",
            max_results=max_results,
        )

    @classmethod
    def science_news(
        cls,
        max_results=10,
    ):

        return cls.get_latest_news(
            category="science",
            max_results=max_results,
        )

    @classmethod
    def health_news(
        cls,
        max_results=10,
    ):

        return cls.get_latest_news(
            category="health",
            max_results=max_results,
        )

    @classmethod
    def entertainment_news(
        cls,
        max_results=10,
    ):

        return cls.get_latest_news(
            category="entertainment",
            max_results=max_results,
        )

    @classmethod
    def get_article(
        cls,
        article_index=0,
    ) -> Optional[Dict]:

        articles = cls.get_latest_news(
            max_results=20,
        )

        if article_index >= len(articles):
            return None

        return articles[article_index]