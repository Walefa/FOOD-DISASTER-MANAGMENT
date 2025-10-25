from fastapi import APIRouter
from . import auth, disasters, food_inventory, vulnerability, analytics, coordination, realtime, admin

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(disasters.router, prefix="/disasters", tags=["disasters"])
api_router.include_router(food_inventory.router, prefix="/food", tags=["food-security"])
# Food donations API temporarily disabled
# api_router.include_router(food_donations.router, prefix="/food-donations", tags=["food-donations"])
api_router.include_router(vulnerability.router, prefix="/vulnerability", tags=["vulnerability"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(coordination.router, prefix="/coordination", tags=["coordination"])
api_router.include_router(realtime.router, prefix="/realtime", tags=["real-time"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])