from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.auth import get_current_user
from app.models import User, DisasterAlert, FoodInventory, SystemEvent
from app.schemas import User as UserSchema
from typing import Dict
from datetime import datetime

router = APIRouter()


@router.post("/backup")
async def create_backup_snapshot(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a lightweight backup snapshot (admin only). Returns JSON snapshot.
    This is intentionally non-destructive and safe for demos.
    """
    if current_user.role.value != "admin" and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    users_count = db.query(User).count()
    active_alerts = db.query(DisasterAlert).filter(DisasterAlert.is_active == True).count()
    food_items = db.query(FoodInventory).count()
    recent_events = db.query(SystemEvent).order_by(SystemEvent.created_at.desc()).limit(10).all()

    # Minimal serialization
    events_serialized = []
    for e in recent_events:
        events_serialized.append({
            "id": e.id,
            "event_type": e.event_type,
            "description": e.description,
            "created_at": e.created_at.isoformat() if hasattr(e, 'created_at') else None
        })

    snapshot: Dict = {
        "generated_at": datetime.utcnow().isoformat(),
        "users_count": users_count,
        "active_alerts": active_alerts,
        "food_items": food_items,
        "recent_events": events_serialized
    }

    return snapshot
