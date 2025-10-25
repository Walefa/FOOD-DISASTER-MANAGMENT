from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.session import get_db
from app.api.v1.auth import get_current_user
from app.models import DisasterAlert, User, DisasterType, AlertSeverity, Notification, NotificationType, NotificationPriority
from app.schemas import DisasterAlertCreate, DisasterAlertUpdate, DisasterAlert as DisasterAlertSchema
from app.core.websocket import manager
import math

router = APIRouter()

@router.post("/alerts", response_model=DisasterAlertSchema)
async def create_disaster_alert(
    alert_data: DisasterAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new disaster alert"""
    db_alert = DisasterAlert(
        **alert_data.dict(),
        created_by=current_user.id
    )
    
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    
    # Create a broadcast notification for all users
    org_info = f" by {current_user.organization}" if hasattr(current_user, 'organization') and current_user.organization else f" by {current_user.username}"
    notification = Notification(
        title=f"🚨 New {alert_data.disaster_type.value.title()} Alert{org_info}",
        message=f"{alert_data.title}: {alert_data.description} (Location: {alert_data.location})",
        type=NotificationType.EMERGENCY,
        priority=NotificationPriority.HIGH if alert_data.severity in ["high", "critical"] else NotificationPriority.MEDIUM,
        category="disaster_alert",
        target_user_id=None,  # Broadcast to all users
        action_url=f"/disasters/alerts/{db_alert.id}"
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Broadcast real-time notification to all connected users
    await manager.broadcast({
        "type": "disaster_alert",
        "data": {
            "id": db_alert.id,
            "title": alert_data.title,
            "description": alert_data.description,
            "disaster_type": alert_data.disaster_type.value,
            "severity": alert_data.severity.value,
            "location": alert_data.location,
            "latitude": alert_data.latitude,
            "longitude": alert_data.longitude,
            "created_by": current_user.username,
            "created_by_role": current_user.role.value,
            "created_by_organization": getattr(current_user, 'organization', None),
            "created_at": db_alert.created_at.isoformat()
        },
        "notification": {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "type": notification.type,
            "priority": notification.priority,
            "category": notification.category
        }
    })
    
    # Also send as emergency alert for high/critical severity
    if alert_data.severity in ["high", "critical"]:
        await manager.send_emergency_alert({
            "id": db_alert.id,
            "title": alert_data.title,
            "message": alert_data.description,
            "alert_type": alert_data.disaster_type.value,
            "severity": alert_data.severity.value,
            "location": alert_data.location,
            "latitude": alert_data.latitude,
            "longitude": alert_data.longitude,
            "emergency_contact": alert_data.emergency_contact,
            "response_instructions": alert_data.response_instructions,
            "created_at": db_alert.created_at.isoformat()
        })
    
    return db_alert

@router.get("/alerts", response_model=List[DisasterAlertSchema])
async def list_disaster_alerts(
    skip: int = 0,
    limit: int = 100,
    disaster_type: Optional[DisasterType] = None,
    severity: Optional[AlertSeverity] = None,
    active_only: bool = True,
    lat: Optional[float] = Query(None, description="Latitude for location-based filtering"),
    lng: Optional[float] = Query(None, description="Longitude for location-based filtering"),
    radius_km: Optional[float] = Query(None, description="Radius in kilometers for location-based filtering"),
    db: Session = Depends(get_db)
):
    """List disaster alerts with optional filters"""
    query = db.query(DisasterAlert)
    
    # Apply filters
    if active_only:
        query = query.filter(DisasterAlert.is_active == True)
    
    if disaster_type:
        query = query.filter(DisasterAlert.disaster_type == disaster_type)
    
    if severity:
        query = query.filter(DisasterAlert.severity == severity)
    
    # Location-based filtering
    if lat is not None and lng is not None and radius_km is not None:
        # Simple distance calculation (for more accurate results, use PostGIS)
        query = query.filter(
            and_(
                DisasterAlert.latitude.between(lat - radius_km/111, lat + radius_km/111),
                DisasterAlert.longitude.between(lng - radius_km/111, lng + radius_km/111)
            )
        )
    
    alerts = query.order_by(DisasterAlert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts

@router.get("/alerts/{alert_id}", response_model=DisasterAlertSchema)
async def get_disaster_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get a specific disaster alert"""
    alert = db.query(DisasterAlert).filter(DisasterAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disaster alert not found"
        )
    return alert

@router.put("/alerts/{alert_id}", response_model=DisasterAlertSchema)
async def update_disaster_alert(
    alert_id: int,
    alert_update: DisasterAlertUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a disaster alert"""
    alert = db.query(DisasterAlert).filter(DisasterAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disaster alert not found"
        )
    
    # Check permissions (only creator or admin can update)
    if alert.created_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this alert"
        )
    
    # Update fields
    update_data = alert_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alert, field, value)
    
    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/alerts/{alert_id}")
async def delete_disaster_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a disaster alert"""
    alert = db.query(DisasterAlert).filter(DisasterAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disaster alert not found"
        )
    
    # Check permissions (only creator or admin can delete)
    if alert.created_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this alert"
        )
    
    db.delete(alert)
    db.commit()
    return {"message": "Disaster alert deleted successfully"}

@router.get("/alerts/nearby/{lat}/{lng}")
async def get_nearby_alerts(
    lat: float,
    lng: float,
    radius_km: float = 50,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get disaster alerts near a specific location"""
    query = db.query(DisasterAlert)
    
    if active_only:
        query = query.filter(DisasterAlert.is_active == True)
    
    # Simple distance calculation
    alerts = query.filter(
        and_(
            DisasterAlert.latitude.between(lat - radius_km/111, lat + radius_km/111),
            DisasterAlert.longitude.between(lng - radius_km/111, lng + radius_km/111)
        )
    ).all()
    
    # Calculate actual distances and sort
    nearby_alerts = []
    for alert in alerts:
        distance = calculate_distance(lat, lng, alert.latitude, alert.longitude)
        if distance <= radius_km:
            alert_dict = {
                "alert": alert,
                "distance_km": round(distance, 2)
            }
            nearby_alerts.append(alert_dict)
    
    # Sort by distance
    nearby_alerts.sort(key=lambda x: x["distance_km"])
    
    return nearby_alerts

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lng1_rad = math.radians(lng1)
    lat2_rad = math.radians(lat2)
    lng2_rad = math.radians(lng2)
    
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

@router.get("/stats/overview")
async def get_disaster_stats(db: Session = Depends(get_db)):
    """Get overview statistics for disaster alerts"""
    total_alerts = db.query(DisasterAlert).count()
    active_alerts = db.query(DisasterAlert).filter(DisasterAlert.is_active == True).count()
    
    # Alerts by type
    alerts_by_type = {}
    for disaster_type in DisasterType:
        count = db.query(DisasterAlert).filter(
            and_(
                DisasterAlert.disaster_type == disaster_type,
                DisasterAlert.is_active == True
            )
        ).count()
        alerts_by_type[disaster_type.value] = count
    
    # Recent alerts (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_alerts = db.query(DisasterAlert).filter(
        DisasterAlert.created_at >= week_ago
    ).count()
    
    return {
        "total_alerts": total_alerts,
        "active_alerts": active_alerts,
        "recent_alerts_7_days": recent_alerts,
        "alerts_by_type": alerts_by_type
    }