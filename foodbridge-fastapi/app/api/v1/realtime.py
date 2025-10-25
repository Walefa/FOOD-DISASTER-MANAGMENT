from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import uuid
import logging
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.websocket import manager, handle_websocket_message
from app.core.security import verify_token
from app.models import User, Notification, EmergencyAlert, SystemEvent
from app.schemas import (
    NotificationCreate, Notification as NotificationSchema,
    EmergencyAlertCreate, EmergencyAlert as EmergencyAlertSchema,
    SystemEventCreate, SystemEvent as SystemEventSchema
)

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

@router.websocket("/ws/{connection_id}")
async def websocket_endpoint(websocket: WebSocket, connection_id: str, token: Optional[str] = None):
    """WebSocket endpoint for real-time communication"""
    user_id = None
    
    # Verify token if provided
    if token:
        try:
            payload = verify_token(token)
            user_id = payload.get("user_id")
        except Exception:
            # Continue without user_id if token is invalid
            pass
    
    # Accept connection
    await manager.connect(websocket, connection_id, user_id)
    
    try:
        while True:
            # Listen for messages from client
            data = await websocket.receive_text()
            await handle_websocket_message(websocket, connection_id, data)
            
    except WebSocketDisconnect:
        manager.disconnect(connection_id, user_id)
        logger.info(f"Client {connection_id} disconnected")

@router.get("/notifications", response_model=List[NotificationSchema])
async def get_user_notifications(
    skip: int = 0, 
    limit: int = 50,
    unread_only: bool = False,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get notifications for the current user"""
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    query = db.query(Notification).filter(
        (Notification.target_user_id == user_id) | 
        (Notification.target_user_id.is_(None))  # Broadcast notifications
    )
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications

@router.post("/notifications", response_model=NotificationSchema)
async def create_notification(
    notification_data: NotificationCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create a new notification (Admin/NGO only)"""
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        user_role = payload.get("role")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    # Check permissions
    if user_role not in ["admin", "ngo", "emergency_responder"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create notifications"
        )
    
    # Create notification
    notification = Notification(**notification_data.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Broadcast via WebSocket
    await manager.send_notification({
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "priority": notification.priority,
        "category": notification.category,
        "action_url": notification.action_url,
        "created_at": notification.created_at.isoformat()
    }, notification.target_user_id)
    
    # Update broadcast status
    notification.is_broadcasted = True
    notification.broadcast_at = datetime.utcnow()
    db.commit()
    
    return notification

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        (Notification.target_user_id == user_id) | (Notification.target_user_id.is_(None))
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.post("/emergency-alerts", response_model=EmergencyAlertSchema)
async def create_emergency_alert(
    alert_data: EmergencyAlertCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create and broadcast an emergency alert"""
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        user_role = payload.get("role")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    # Check permissions
    if user_role not in ["admin", "emergency_responder"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create emergency alerts"
        )
    
    # Create alert
    alert = EmergencyAlert(**alert_data.dict(), issued_by_user_id=user_id)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # Broadcast emergency alert via WebSocket
    await manager.send_emergency_alert({
        "id": alert.id,
        "title": alert.title,
        "message": alert.message,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "location": alert.location,
        "latitude": alert.latitude,
        "longitude": alert.longitude,
        "emergency_contact": alert.emergency_contact,
        "response_instructions": alert.response_instructions,
        "created_at": alert.created_at.isoformat()
    })
    
    # Update broadcast status
    alert.is_broadcasted = True
    alert.broadcast_at = datetime.utcnow()
    db.commit()
    
    return alert

@router.get("/emergency-alerts", response_model=List[EmergencyAlertSchema])
async def get_emergency_alerts(
    active_only: bool = True,
    skip: int = 0,
    limit: int = 20,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get emergency alerts"""
    query = db.query(EmergencyAlert)
    
    if active_only:
        query = query.filter(EmergencyAlert.is_active == True)
    
    alerts = query.order_by(EmergencyAlert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts

@router.put("/emergency-alerts/{alert_id}/resolve")
async def resolve_emergency_alert(
    alert_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Resolve an emergency alert"""
    try:
        payload = verify_token(credentials.credentials)
        user_role = payload.get("role")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    # Check permissions
    if user_role not in ["admin", "emergency_responder"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to resolve emergency alerts"
        )
    
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency alert not found"
        )
    
    alert.is_active = False
    alert.resolved_at = datetime.utcnow()
    db.commit()
    
    # Notify about resolution
    await manager.send_notification({
        "title": f"Alert Resolved: {alert.title}",
        "message": f"The emergency alert for {alert.location} has been resolved.",
        "type": "success",
        "category": "emergency_alert",
        "alert_id": alert.id
    })
    
    return {"message": "Emergency alert resolved"}

@router.get("/ws/status")
async def get_websocket_status():
    """Get WebSocket connection status"""
    return {
        "active_connections": manager.get_connection_count(),
        "authenticated_users": manager.get_user_count(),
        "status": "operational"
    }

@router.post("/system-events", response_model=SystemEventSchema)
async def log_system_event(
    event_data: SystemEventCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Log a system event for real-time tracking"""
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
    except Exception:
        user_id = None
    
    # Create system event
    event = SystemEvent(**event_data.dict(), user_id=user_id or event_data.user_id)
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # Broadcast system update if it affects data
    if event.affected_data_type and event.change_type:
        await manager.send_system_update({
            "event_type": event.event_type,
            "data_type": event.affected_data_type,
            "record_id": event.affected_record_id,
            "change_type": event.change_type,
            "description": event.description
        })
    
    return event