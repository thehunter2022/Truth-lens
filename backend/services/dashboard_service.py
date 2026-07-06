from collections import Counter
from sqlalchemy import func
from sqlalchemy.future import select

from models.prediction import PredictionHistory


class DashboardService:
    """
    Dashboard Analytics Service
    """

    @classmethod
    async def get_statistics(cls, db):

        result = await db.execute(
            select(PredictionHistory)
        )

        predictions = result.scalars().all()

        total = len(predictions)

        fake = sum(
            1
            for p in predictions
            if p.label.lower() == "fake"
        )

        real = sum(
            1
            for p in predictions
            if p.label.lower() == "real"
        )

        avg_confidence = 0

        if total > 0:

            avg_confidence = round(

                sum(
                    p.confidence
                    for p in predictions
                ) / total,

                2

            )

        labels = Counter(

            p.label
            for p in predictions

        )

        models = Counter(

            p.model_used
            for p in predictions

        )

        return {

            "total_predictions": total,

            "fake_predictions": fake,

            "real_predictions": real,

            "fake_percentage":

                round(
                    fake / total * 100,
                    2
                ) if total else 0,

            "real_percentage":

                round(
                    real / total * 100,
                    2
                ) if total else 0,

            "average_confidence":

                avg_confidence,

            "top_labels":

                labels,

            "top_models":

                models

        }

    @classmethod
    async def get_history_chart(cls, db):

        result = await db.execute(

            select(

                func.date(
                    PredictionHistory.created_at
                ),

                func.count()

            )

            .group_by(

                func.date(
                    PredictionHistory.created_at
                )

            )

        )

        rows = result.all()

        return [

            {

                "date": str(r[0]),

                "count": r[1]

            }

            for r in rows

        ]