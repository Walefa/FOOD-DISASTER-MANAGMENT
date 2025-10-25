"""
Seed disaster alerts for testing NGO -> Responder visibility
This script creates test disaster alerts that will be visible to all users
"""
import asyncio
import sys
import os

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import DisasterAlert, User, DisasterType, AlertSeverity, Notification, UserRole, NotificationType, NotificationPriority
from app.core.websocket import manager
from sqlalchemy.orm import Session
import datetime

async def seed_disasters():
    """Create test disaster alerts that will be visible to all users"""
    db = SessionLocal()
    
    try:
        # Find an NGO user to be the creator
        ngo_user = db.query(User).filter(User.role == 'ngo').first()
        if not ngo_user:
            print("No NGO user found. Creating one...")
            ngo_user = User(
                username="test_ngo",
                email="ngo@test.com",
                full_name="Test NGO User",
                role=UserRole.NGO,
                organization="Test NGO Organization",
                hashed_password="test_password"
            )
            db.add(ngo_user)
            db.commit()
            db.refresh(ngo_user)
        
        # Create test disasters
        disasters = [
                {
                    "title": "Emergency Food Shortage - Soweto",
                    "description": "Critical food shortage affecting 2000+ families in Soweto area. Immediate food aid needed. Contact local food banks and emergency services.",
                    "disaster_type": DisasterType.FOOD_SHORTAGE,
                    "severity": AlertSeverity.CRITICAL,
                    "location": "Soweto, Johannesburg",
                    "latitude": -26.2678,
                    "longitude": 27.8546,
                    "radius_km": 15.0,
                    "created_by": ngo_user.id
                },
                {
                "title": "Flash Flood Alert - Durban",
                "description": "Heavy rains causing flooding in low-lying areas. Evacuation recommended.",
                "disaster_type": DisasterType.FLOOD,
                "severity": AlertSeverity.HIGH,
                "location": "Durban, KwaZulu-Natal",
                "latitude": -29.8587,
                "longitude": 31.0218,
                "radius_km": 20.0,
                "created_by": ngo_user.id
            },
                {
                "title": "Drought Warning - Northern Cape",
                "description": "Severe drought conditions affecting agricultural areas and water supply.",
                "disaster_type": DisasterType.DROUGHT,
                "severity": AlertSeverity.MEDIUM,
                "location": "Northern Cape, Kimberley",
                "latitude": -28.7282,
                "longitude": 24.7499,
                "radius_km": 50.0,
                "created_by": ngo_user.id
            }
        ]
        
        created_disasters = []
        
        for disaster_data in disasters:
            # Check if disaster already exists
            existing = db.query(DisasterAlert).filter(
                DisasterAlert.title == disaster_data["title"]
            ).first()
            
            if existing:
                print(f"Disaster '{disaster_data['title']}' already exists, skipping...")
                continue
            
            # Create disaster alert
            disaster = DisasterAlert(**disaster_data)
            db.add(disaster)
            db.commit()
            db.refresh(disaster)
            
            # Create broadcast notification
            notification = Notification(
                title=f"🚨 New {disaster.disaster_type.value.title()} Alert by {ngo_user.organization or 'NGO'}",
                message=f"{disaster.title}: {disaster.description} (Location: {disaster.location})",
                type=NotificationType.EMERGENCY,
                priority=NotificationPriority.HIGH if disaster.severity in [AlertSeverity.HIGH, AlertSeverity.CRITICAL] else NotificationPriority.MEDIUM,
                category="disaster_alert",
                target_user_id=None,  # Broadcast to all users
                action_url=f"/disasters/alerts/{disaster.id}",
                created_by=ngo_user.id
            )
            
            db.add(notification)
            db.commit()
            
            created_disasters.append(disaster)
            print(f"✅ Created disaster: {disaster.title} (ID: {disaster.id})")
            
            # Broadcast to WebSocket (if connections exist)
            try:
                await manager.broadcast({
                    "type": "disaster_alert",
                    "data": {
                        "id": disaster.id,
                        "title": disaster.title,
                        "description": disaster.description,
                        "disaster_type": disaster.disaster_type.value,
                        "severity": disaster.severity.value,
                        "location": disaster.location,
                        "latitude": disaster.latitude,
                        "longitude": disaster.longitude,
                        "created_by": ngo_user.username,
                        "created_by_role": ngo_user.role.value,
                        "created_by_organization": ngo_user.organization,
                        "created_at": disaster.created_at.isoformat()
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
                print(f"📡 Broadcast notification for: {disaster.title}")
            except Exception as ws_error:
                print(f"⚠️ WebSocket broadcast failed (normal if no connections): {ws_error}")
        
        print(f"\n🎉 Successfully created {len(created_disasters)} disaster alerts!")
        print("These disasters will now be visible to ALL users including:")
        print("- Emergency Responders")
        print("- Farmers") 
        print("- Community Leaders")
        print("- Other NGOs")
        print("- Administrators")
        
        return created_disasters
        
    except Exception as e:
        print(f"❌ Error creating disasters: {e}")
        db.rollback()
        return []
    finally:
        db.close()

if __name__ == "__main__":
    print("🚨 Seeding Disaster Alerts for Cross-User Visibility Testing...")
    print("=" * 60)
    
    # Run the async function
    loop = asyncio.get_event_loop()
    disasters = loop.run_until_complete(seed_disasters())
    
    if disasters:
        print(f"\n✅ SUCCESS: {len(disasters)} disasters created and ready for testing!")
        print("\nTest Instructions:")
        print("1. Login as any user type (NGO, Responder, Farmer, etc.)")
        print("2. Go to Dashboard - you should see disaster alerts")
        print("3. Check the Disasters page to see all alerts")
        print("4. Switch to different user types to verify visibility")
    else:
        print("❌ No disasters were created. Check for errors above.")