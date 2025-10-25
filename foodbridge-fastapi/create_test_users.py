#!/usr/bin/env python3
"""
Simple script to create test users for the FoodBridge platform
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models import User, UserRole
from app.core.security import get_password_hash

def create_test_users():
    """Create test users for demo"""
    db = SessionLocal()
    try:
        # Clear existing users and recreate  
        print("🧹 Clearing existing users to recreate...")
        db.query(User).delete()
        db.commit()

        # Create admin user with simple password (for testing only)
        admin_user = User(
            email="admin@allsecure.org",
            username="admin", 
            full_name="Admin User",
            hashed_password="admin123",  # Using plain password for demo
            role=UserRole.ADMIN,
            organization="FOOD & DISASTER MANGEMENT",
            location="Cape Town, South Africa",
            is_active=True
        )
        
        # Create NGO user
        ngo_user = User(
            email="ngo@example.com",
            username="ngouser",
            full_name="NGO Representative", 
            hashed_password="password123",  # Using plain password for demo
            role=UserRole.NGO,
            organization="Food Aid NGO",
            location="Johannesburg, South Africa",
            is_active=True
        )
        
        # Create responder user
        responder_user = User(
            email="responder@emergency.gov",
            username="responder",
            full_name="Emergency Responder",
            hashed_password="password123",  # Using plain password for demo
            role=UserRole.EMERGENCY_RESPONDER,
            organization="Emergency Services",
            location="Durban, South Africa",
            is_active=True
        )
        
        # Create farmer user
        farmer_user = User(
            email="farmer@greenvalley.farm",
            username="farmer",
            full_name="John Botha",
            hashed_password="password123",  # Using plain password for demo
            role=UserRole.FARMER,
            organization="Green Valley Farm",
            location="Western Cape, South Africa",
            is_active=True
        )
        
        db.add(admin_user)
        db.add(ngo_user) 
        db.add(responder_user)
        db.add(farmer_user)
        db.commit()
        
        print("✅ Created test users:")
        print("   - admin / admin123")
        print("   - ngouser / password123") 
        print("   - responder / password123")
        print("   - farmer / password123")
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()