"""
Seed the database with sample data for testing and demonstration
Run this script after setting up the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models import *
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random

def create_sample_users(db: Session):
    """Create sample users for different roles"""
    users = [
        {
            "email": "admin@allsecure.org",
            "username": "admin",
            "full_name": "System Administrator", 
            "password": "admin123"[:50],  # Truncate password
            "role": UserRole.ADMIN,
            "organization": "FOOD & DISASTER MANGEMENT",
            "location": "Cape Town, South Africa",
            "latitude": -33.9249,
            "longitude": 18.4241
        },
        {
            "email": "ngo@example.com", 
            "username": "ngo_user",
            "full_name": "Sarah Johnson",
            "password": "password123"[:50],  # Truncate password
            "role": UserRole.NGO,
            "organization": "Food Aid Foundation",
            "location": "Johannesburg, South Africa",
            "latitude": -26.2041,
            "longitude": 28.0473,
            "phone": "+27123456789"
        },
        {
            "email": "responder@example.com",
            "username": "emergency_user",
            "full_name": "Mike Thompson",
            "password": "password123"[:50],  # Truncate password
            "role": UserRole.EMERGENCY_RESPONDER,
            "organization": "Emergency Management Agency",
            "location": "Durban, South Africa",
            "latitude": -29.8587,
            "longitude": 31.0218,
            "phone": "+27987654321"
        },
        {
            "email": "mary.leader@community.org",
            "username": "mary_community",
            "full_name": "Mary Ndaba",
            "password": "community123",
            "role": UserRole.COMMUNITY_LEADER,
            "organization": "Soweto Community Council",
            "location": "Soweto, Johannesburg",
            "latitude": -26.2678,
            "longitude": 27.8546,
            "phone": "+27111222333"
        }
    ]
    
    for user_data in users:
        # Check if user already exists
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            password = user_data.pop("password")
            user = User(
                **user_data,
                hashed_password=get_password_hash(password),
                is_active=True,
                is_verified=True
            )
            db.add(user)
    
    db.commit()
    print("✓ Sample users created")

def create_sample_disaster_alerts(db: Session):
    """Create sample disaster alerts"""
    alerts = [
        {
            "title": "Severe Drought Warning - Western Cape",
            "description": "Extended drought conditions expected to continue for the next 3 months. Water restrictions in effect.",
            "disaster_type": DisasterType.DROUGHT,
            "severity": AlertSeverity.HIGH,
            "location": "Western Cape, South Africa",
            "latitude": -33.2277,
            "longitude": 21.8569,
            "radius_km": 150,
            "start_time": datetime.utcnow(),
            "end_time": datetime.utcnow() + timedelta(days=90),
            "source": "South African Weather Service",
            "confidence_score": 0.87,
            "created_by": 1
        },
        {
            "title": "Flash Flood Alert - KwaZulu-Natal",
            "description": "Heavy rainfall expected. Risk of flash flooding in low-lying areas.",
            "disaster_type": DisasterType.FLOOD,
            "severity": AlertSeverity.CRITICAL,
            "location": "KwaZulu-Natal, South Africa", 
            "latitude": -29.6097,
            "longitude": 30.3794,
            "radius_km": 75,
            "start_time": datetime.utcnow() + timedelta(hours=6),
            "end_time": datetime.utcnow() + timedelta(days=3),
            "source": "Weather Prediction Model",
            "confidence_score": 0.92,
            "created_by": 1
        },
        {
            "title": "Food Shortage Alert - Eastern Cape",
            "description": "Regional food shortage due to failed harvest. Immediate intervention required.",
            "disaster_type": DisasterType.FOOD_SHORTAGE,
            "severity": AlertSeverity.HIGH,
            "location": "Eastern Cape, South Africa",
            "latitude": -32.2968,
            "longitude": 26.4194,
            "radius_km": 100,
            "start_time": datetime.utcnow() - timedelta(days=5),
            "source": "Community Assessment",
            "confidence_score": 0.95,
            "created_by": 2
        }
    ]
    
    for alert_data in alerts:
        alert = DisasterAlert(**alert_data)
        db.add(alert)
    
    db.commit()
    print("✓ Sample disaster alerts created")

def create_sample_food_inventory(db: Session):
    """Create sample food inventory items"""
    inventory_items = [
        {
            "item_name": "White Rice",
            "category": "grains",
            "quantity": 500,
            "unit": "kg",
            "expiry_date": datetime.utcnow() + timedelta(days=365),
            "location": "Cape Town Food Bank",
            "latitude": -33.9249,
            "longitude": 18.4241,
            "owner_organization": "Cape Town Food Bank",
            "contact_person": "Jane Smith",
            "contact_phone": "+27123456001",
            "contact_email": "jane@ctfoodbank.org",
            "is_emergency_reserve": True,
            "nutritional_value": '{"calories_per_100g": 365, "protein_g": 7.1, "carbs_g": 80}'
        },
        {
            "item_name": "Canned Beans", 
            "category": "proteins",
            "quantity": 200,
            "unit": "cans",
            "expiry_date": datetime.utcnow() + timedelta(days=730),
            "location": "Johannesburg Distribution Center",
            "latitude": -26.2041,
            "longitude": 28.0473,
            "owner_organization": "Food Aid Foundation",
            "contact_person": "Sarah Johnson", 
            "contact_phone": "+27123456789",
            "contact_email": "sarah@foodaid.org",
            "is_emergency_reserve": False,
            "nutritional_value": '{"calories_per_100g": 347, "protein_g": 21.6, "fiber_g": 16.0}'
        },
        {
            "item_name": "Cooking Oil",
            "category": "fats", 
            "quantity": 50,
            "unit": "liters",
            "expiry_date": datetime.utcnow() + timedelta(days=180),
            "location": "Durban Warehouse",
            "latitude": -29.8587,
            "longitude": 31.0218,
            "owner_organization": "Emergency Relief Network",
            "contact_person": "Mike Thompson",
            "contact_phone": "+27987654321", 
            "is_emergency_reserve": True
        },
        {
            "item_name": "Dried Maize",
            "category": "grains",
            "quantity": 800,
            "unit": "kg", 
            "expiry_date": datetime.utcnow() + timedelta(days=300),
            "location": "Soweto Community Center", 
            "latitude": -26.2678,
            "longitude": 27.8546,
            "owner_organization": "Soweto Community Council",
            "contact_person": "Mary Ndaba",
            "contact_phone": "+27111222333",
            "is_emergency_reserve": False
        },
        {
            "item_name": "Baby Formula",
            "category": "nutrition",
            "quantity": 100, 
            "unit": "packages",
            "expiry_date": datetime.utcnow() + timedelta(days=90),
            "location": "Port Elizabeth Clinic",
            "latitude": -33.9608,
            "longitude": 25.6022,
            "owner_organization": "Healthcare Foundation",
            "contact_person": "Dr. Lisa van der Merwe", 
            "contact_phone": "+27444555666",
            "is_emergency_reserve": True,
            "nutritional_value": '{"calories_per_100g": 534, "protein_g": 11.0, "vitamins": "A,D,E,K,B-complex"}'
        }
    ]
    
    for item_data in inventory_items:
        item = FoodInventory(**item_data)
        db.add(item)
    
    db.commit()
    print("✓ Sample food inventory created")

def create_sample_vulnerability_assessments(db: Session):
    """Create sample vulnerability assessments"""
    assessments = [
        {
            "community_name": "Khayelitsha", 
            "location": "Cape Town, Western Cape",
            "latitude": -34.0351,
            "longitude": 18.6905,
            "population": 400000,
            "flood_risk": VulnerabilityLevel.HIGH,
            "drought_risk": VulnerabilityLevel.VERY_HIGH,
            "extreme_weather_risk": VulnerabilityLevel.HIGH,
            "food_access_score": 4.2,
            "nutrition_diversity_score": 3.8,
            "food_affordability_score": 3.5,
            "poverty_rate": 65.5,
            "unemployment_rate": 42.3,
            "education_level": 5.8,
            "healthcare_access": 6.2,
            "road_access_quality": 5.5,
            "water_infrastructure": 4.0,
            "communication_coverage": 8.2,
            "assessor_id": 1,
            "methodology": "Community-based assessment with GIS analysis",
            "notes": "High population density with limited infrastructure. Priority for climate adaptation."
        },
        {
            "community_name": "Alexandra Township",
            "location": "Johannesburg, Gauteng", 
            "latitude": -26.1017,
            "longitude": 28.1025,
            "population": 180000,
            "flood_risk": VulnerabilityLevel.MEDIUM,
            "drought_risk": VulnerabilityLevel.HIGH, 
            "extreme_weather_risk": VulnerabilityLevel.MEDIUM,
            "food_access_score": 5.1,
            "nutrition_diversity_score": 4.6,
            "food_affordability_score": 4.2,
            "poverty_rate": 58.2,
            "unemployment_rate": 38.7,
            "education_level": 6.5,
            "healthcare_access": 5.8,
            "road_access_quality": 6.8,
            "water_infrastructure": 6.0,
            "communication_coverage": 8.8,
            "assessor_id": 2,
            "methodology": "Household survey and infrastructure audit"
        },
        {
            "community_name": "Rural Limpopo Villages",
            "location": "Limpopo Province",
            "latitude": -23.4013,
            "longitude": 29.4179,
            "population": 25000,
            "flood_risk": VulnerabilityLevel.LOW,
            "drought_risk": VulnerabilityLevel.VERY_HIGH,
            "extreme_weather_risk": VulnerabilityLevel.HIGH,
            "food_access_score": 3.2,
            "nutrition_diversity_score": 2.8,
            "food_affordability_score": 2.5,
            "poverty_rate": 78.9,
            "unemployment_rate": 67.4,
            "education_level": 3.8,
            "healthcare_access": 2.5,
            "road_access_quality": 3.2,
            "water_infrastructure": 2.0,
            "communication_coverage": 4.5,
            "assessor_id": 3,
            "methodology": "Rapid assessment with satellite imagery analysis",
            "notes": "Remote rural communities with subsistence farming. Limited access to services."
        }
    ]
    
    for assessment_data in assessments:
        assessment = VulnerabilityAssessment(**assessment_data)
        db.add(assessment)
    
    db.commit()
    print("✓ Sample vulnerability assessments created")

def create_sample_food_distributions(db: Session):
    """Create sample food distribution events"""
    distributions = [
        {
            "event_name": "Emergency Food Relief - Drought Response",
            "location": "Khayelitsha Community Hall",
            "latitude": -34.0351,
            "longitude": 18.6905,
            "scheduled_date": datetime.utcnow() + timedelta(days=2),
            "duration_hours": 6.0,
            "target_beneficiaries": 500,
            "organizing_ngo": "Food Aid Foundation",
            "partner_organizations": '["Red Cross", "Gift of the Givers"]',
            "volunteers_count": 25,
            "status": "planned"
        },
        {
            "event_name": "Weekly Community Food Distribution",
            "location": "Alexandra Community Center",
            "latitude": -26.1017,
            "longitude": 28.1025,
            "scheduled_date": datetime.utcnow() - timedelta(days=3),
            "duration_hours": 4.0,
            "target_beneficiaries": 200,
            "actual_beneficiaries": 187,
            "food_items_distributed": '["Rice (50kg)", "Beans (30kg)", "Cooking Oil (20L)"]',
            "total_weight_kg": 100.0,
            "estimated_meals": 750,
            "organizing_ngo": "Community Care Network",
            "volunteers_count": 15,
            "status": "completed",
            "completion_notes": "Successful distribution. High community engagement.",
            "feedback_score": 4.6
        },
        {
            "event_name": "Rural Outreach Food Program",
            "location": "Limpopo Mobile Distribution Point",
            "latitude": -23.4013,
            "longitude": 29.4179,
            "scheduled_date": datetime.utcnow() + timedelta(days=7),
            "duration_hours": 8.0,
            "target_beneficiaries": 150,
            "organizing_ngo": "Rural Development Foundation",
            "partner_organizations": '["Department of Social Development"]',
            "volunteers_count": 12,
            "status": "planned"
        }
    ]
    
    for distribution_data in distributions:
        distribution = FoodDistribution(**distribution_data)
        db.add(distribution)
    
    db.commit()
    print("✓ Sample food distributions created")

def main():
    """Main function to seed all sample data"""
    print("🌱 Seeding database with sample data...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Create sample data
        create_sample_users(db)
        create_sample_disaster_alerts(db)
        create_sample_food_inventory(db)
        create_sample_vulnerability_assessments(db)
        create_sample_food_distributions(db)
        
        print("✅ Database seeding completed successfully!")
        print("\n📋 Sample login credentials:")
        print("Admin: admin / admin123")
        print("NGO: sarah_ngo / ngo123") 
        print("Emergency: mike_emergency / emergency123")
        print("Community: mary_community / community123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()