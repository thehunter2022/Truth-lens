import re
from collections import Counter


class ExplainService:
    """
    Lightweight Explainable AI service.

    This service explains why the model may have predicted
    Fake or Real using keyword statistics.

    (Can later be replaced by SHAP or LIME.)
    """

    FAKE_KEYWORDS = {
        "shocking",
        "breaking",
        "exclusive",
        "secret",
        "conspiracy",
        "hoax",
        "miracle",
        "urgent",
        "leaked",
        "must",
        "viral",
        "unbelievable",
        "exposed",
        "fake",
    }

    REAL_KEYWORDS = {
        "official",
        "government",
        "report",
        "research",
        "study",
        "according",
        "university",
        "agency",
        "statistics",
        "evidence",
        "confirmed",
    }

    @classmethod
    def tokenize(cls, text: str):

        words = re.findall(r"[A-Za-z]+", text.lower())

        return words

    @classmethod
    def generate(
        cls,
        text: str,
        prediction: str,
    ):

        words = cls.tokenize(text)

        fake_words = []
        real_words = []

        for word in words:

            if word in cls.FAKE_KEYWORDS:
                fake_words.append(word)

            if word in cls.REAL_KEYWORDS:
                real_words.append(word)

        common = Counter(words).most_common(10)

        return {

            "prediction": prediction,

            "fake_keywords": sorted(
                list(set(fake_words))
            ),

            "real_keywords": sorted(
                list(set(real_words))
            ),

            "top_words": [
                w
                for w, _
                in common
            ],

            "summary":

            (
                "The article contains language "
                "commonly associated with sensational news."
                if prediction.lower() == "fake"

                else

                "The article contains factual "
                "and evidence-based language."
            )

        }