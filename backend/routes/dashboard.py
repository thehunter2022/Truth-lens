from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/statistics")
async def statistics(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService.get_statistics(db)


@router.get("/history")
async def history_chart(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService.get_history_chart(db)


@router.get("/summary")
async def summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    stats = await DashboardService.get_statistics(db)

    return {

        "total": stats["total_predictions"],

        "fake": stats["fake_predictions"],

        "real": stats["real_predictions"],

        "accuracy": stats["average_confidence"]

    }


@router.get("/health")
async def dashboard_health():

    return {

        "status": "ok",

        "service": "dashboard"

    }