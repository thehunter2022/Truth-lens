import re
from urllib.parse import urlparse


class CredibilityService:
    """
    Calculate a credibility score for a news source.

    Score Range:
        0 - 100

    Levels:
        >=90  Highly Trusted
        >=75  Trusted
        >=60  Moderate
        >=40  Suspicious
        <40   Low Credibility
    """

    TRUSTED_DOMAINS = {
        "bbc.com",
        "reuters.com",
        "apnews.com",
        "nytimes.com",
        "theguardian.com",
        "wsj.com",
        "npr.org",
        "cnn.com",
        "abcnews.go.com",
        "cbsnews.com",
        "nbcnews.com",
    }

    LOW_CREDIBILITY = {
        "beforeitsnews.com",
        "naturalnews.com",
    }

    @classmethod
    def calculate(cls, url: str):

        score = 50

        if not url:
            return {
                "score": score,
                "level": "Unknown"
            }

        domain = urlparse(url).netloc.lower()

        domain = re.sub("^www\\.", "", domain)

        # HTTPS bonus
        if url.startswith("https://"):
            score += 10

        # Trusted
        if domain in cls.TRUSTED_DOMAINS:
            score += 35

        # Low credibility
        if domain in cls.LOW_CREDIBILITY:
            score -= 30

        # Domain length
        if len(domain) < 25:
            score += 5

        score = max(0, min(score, 100))

        if score >= 90:
            level = "Highly Trusted"

        elif score >= 75:
            level = "Trusted"

        elif score >= 60:
            level = "Moderate"

        elif score >= 40:
            level = "Suspicious"

        else:
            level = "Low Credibility"

        return {
            "score": score,
            "level": level
        }