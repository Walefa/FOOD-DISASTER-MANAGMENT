from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    NGO = "ngo"
    DONOR = "donor"
    COMMUNITY_LEADER = "community_leader"
    EMERGENCY_RESPONDER = "emergency_responder"
    RESEARCHER = "researcher"
    FARMER = "farmer"

class DisasterType(str, enum.Enum):
    FLOOD = "flood"
    DROUGHT = "drought"
    HURRICANE = "hurricane"
    WILDFIRE = "wildfire"
    EARTHQUAKE = "earthquake"
    EXTREME_HEAT = "extreme_heat"
    EXTREME_COLD = "extreme_cold"
    FOOD_SHORTAGE = "food_shortage"

class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class VulnerabilityLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class ProduceType(str, enum.Enum):
    GRAINS = "grains"
    VEGETABLES = "vegetables"
    FRUITS = "fruits"
    LEGUMES = "legumes"
    TUBERS = "tubers"
    HERBS = "herbs"
    DAIRY = "dairy"
    MEAT = "meat"
    OTHER = "other"

class DonationStatus(str, enum.Enum):
    AVAILABLE = "available"
    CLAIMED = "claimed"
    COLLECTED = "collected"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class DonationUrgency(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.COMMUNITY_LEADER)
    phone = Column(String)
    organization = Column(String)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    disaster_alerts = relationship("DisasterAlert", back_populates="created_by_user")
    vulnerability_assessments = relationship("VulnerabilityAssessment", back_populates="assessor")

class DisasterAlert(Base):
    __tablename__ = "disaster_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    disaster_type = Column(Enum(DisasterType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=10.0)  # Affected area radius
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    is_active = Column(Boolean, default=True)
    source = Column(String)  # Weather service, manual, AI prediction
    confidence_score = Column(Float)  # AI prediction confidence
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by_user = relationship("User", back_populates="disaster_alerts")

class FoodInventory(Base):
    __tablename__ = "food_inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    category = Column(String)  # grains, proteins, vegetables, etc.
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # kg, tons, packages
    expiry_date = Column(DateTime)
    location = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    owner_organization = Column(String)
    contact_person = Column(String)
    contact_phone = Column(String)
    contact_email = Column(String)
    is_emergency_reserve = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    nutritional_value = Column(Text)  # JSON string with nutritional info
    storage_requirements = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VulnerabilityAssessment(Base):
    __tablename__ = "vulnerability_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    community_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer)
    
    # Climate vulnerability factors
    flood_risk = Column(Enum(VulnerabilityLevel), default=VulnerabilityLevel.LOW)
    drought_risk = Column(Enum(VulnerabilityLevel), default=VulnerabilityLevel.LOW)
    extreme_weather_risk = Column(Enum(VulnerabilityLevel), default=VulnerabilityLevel.LOW)
    
    # Food security factors
    food_access_score = Column(Float)  # 0-10 scale
    nutrition_diversity_score = Column(Float)  # 0-10 scale
    food_affordability_score = Column(Float)  # 0-10 scale
    
    # Socioeconomic factors
    poverty_rate = Column(Float)
    unemployment_rate = Column(Float)
    education_level = Column(Float)
    healthcare_access = Column(Float)
    
    # Infrastructure
    road_access_quality = Column(Float)  # 0-10 scale
    water_infrastructure = Column(Float)  # 0-10 scale
    communication_coverage = Column(Float)  # 0-10 scale
    
    # Overall scores
    overall_vulnerability = Column(Enum(VulnerabilityLevel))
    climate_resilience_score = Column(Float)  # 0-100 scale
    food_security_score = Column(Float)  # 0-100 scale
    
    # Assessment metadata
    assessment_date = Column(DateTime, default=datetime.utcnow)
    assessor_id = Column(Integer, ForeignKey("users.id"))
    methodology = Column(String)
    notes = Column(Text)
    
    # Relationships
    assessor = relationship("User", back_populates="vulnerability_assessments")

class FoodDonation(Base):
    __tablename__ = "food_donations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)  # e.g., "Fresh Tomatoes - 50kg Available"
    description = Column(Text)  # Additional details about the produce
    
    # Produce details
    produce_type = Column(Enum(ProduceType), nullable=False)
    variety = Column(String)  # e.g., "Roma Tomatoes", "Sweet Corn"
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # kg, tons, bags, crates
    quality_grade = Column(String)  # A, B, C or Fresh, Good, Fair
    
    # Timing and availability
    harvest_date = Column(DateTime)
    expiry_date = Column(DateTime)
    available_until = Column(DateTime)  # Last day for pickup
    urgency = Column(Enum(DonationUrgency), default=DonationUrgency.MEDIUM)
    
    # Location and logistics
    farm_location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    pickup_instructions = Column(Text)  # How to access the farm, special instructions
    transportation_available = Column(Boolean, default=False)
    
    # Contact information
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_phone = Column(String)
    contact_email = Column(String)
    preferred_contact_method = Column(String, default="phone")  # phone, email, whatsapp
    
    # Storage and handling
    storage_requirements = Column(Text)  # Temperature, humidity requirements
    packaging_type = Column(String)  # boxes, bags, loose, crates
    handling_notes = Column(Text)  # Special handling requirements
    
    # Donation tracking
    status = Column(Enum(DonationStatus), default=DonationStatus.AVAILABLE)
    claimed_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # NGO/responder who claimed it
    claimed_at = Column(DateTime)
    collected_at = Column(DateTime)
    
    # Distribution tracking
    intended_beneficiaries = Column(String)  # Community/area where it should go
    estimated_people_fed = Column(Integer)
    distribution_notes = Column(Text)
    
    # Images and documentation
    image_urls = Column(Text)  # JSON array of image URLs
    certification = Column(String)  # Organic, pesticide-free, etc.
    
    # Admin and moderation
    is_verified = Column(Boolean, default=False)  # Verified by platform admin
    is_active = Column(Boolean, default=True)
    is_urgent = Column(Boolean, default=False)  # Flag for urgent donations
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    farmer = relationship("User", foreign_keys=[farmer_id], backref="food_donations")
    claimed_by_user = relationship("User", foreign_keys=[claimed_by], backref="claimed_donations")

class EmergencyResponse(Base):
    __tablename__ = "emergency_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    disaster_alert_id = Column(Integer, ForeignKey("disaster_alerts.id"))
    response_type = Column(String, nullable=False)  # evacuation, food_distribution, medical_aid
    status = Column(String, default="planned")  # planned, active, completed
    priority = Column(Enum(AlertSeverity), default=AlertSeverity.MEDIUM)
    
    # Resource requirements
    personnel_required = Column(Integer)
    vehicles_required = Column(Integer)
    supplies_needed = Column(Text)  # JSON string
    estimated_duration_hours = Column(Float)
    
    # Coordination
    lead_organization = Column(String)
    participating_organizations = Column(Text)  # JSON array
    contact_person = Column(String)
    contact_phone = Column(String)
    
    # Location and logistics
    staging_area = Column(String)
    affected_areas = Column(Text)  # JSON array of affected locations
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FoodDistribution(Base):
    __tablename__ = "food_distributions"
    
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Scheduling
    scheduled_date = Column(DateTime, nullable=False)
    duration_hours = Column(Float, default=4.0)
    
    # Target population
    target_beneficiaries = Column(Integer)
    actual_beneficiaries = Column(Integer)
    
    # Food items
    food_items_distributed = Column(Text)  # JSON array of items and quantities
    total_weight_kg = Column(Float)
    estimated_meals = Column(Integer)
    
    # Organizations involved
    organizing_ngo = Column(String)
    partner_organizations = Column(Text)  # JSON array
    volunteers_count = Column(Integer)
    
    # Status and outcomes
    status = Column(String, default="planned")  # planned, ongoing, completed, cancelled
    completion_notes = Column(Text)
    feedback_score = Column(Float)  # 1-5 scale from beneficiaries
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NotificationType(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    ERROR = "error"
    EMERGENCY = "emergency"

class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    
    # Targeting
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Specific user or null for broadcast
    target_roles = Column(Text)  # JSON array of roles to target
    
    # Metadata
    category = Column(String)  # disaster, food_security, vulnerability, etc.
    action_url = Column(String)  # URL to redirect when notification clicked
    action_data = Column(Text)  # JSON data for client-side actions
    
    # Status tracking
    is_read = Column(Boolean, default=False)
    is_broadcasted = Column(Boolean, default=False)
    broadcast_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    target_user = relationship("User", backref="notifications")

class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(Enum(DisasterType), nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.MEDIUM)
    
    # Location information
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    affected_radius_km = Column(Float)
    
    # Contact and response information
    emergency_contact = Column(String)
    response_instructions = Column(Text)
    evacuation_routes = Column(Text)  # JSON array of route information
    
    # Status and tracking
    is_active = Column(Boolean, default=True)
    is_broadcasted = Column(Boolean, default=False)
    broadcast_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Metadata
    issued_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    affected_population_estimate = Column(Integer)
    confirmation_status = Column(String, default="unconfirmed")  # unconfirmed, verified, false_alarm
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    issued_by = relationship("User", backref="emergency_alerts")

class SystemEvent(Base):
    __tablename__ = "system_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)  # user_login, data_update, system_maintenance, etc.
    description = Column(String)
    details = Column(Text)  # JSON data with event details
    
    # User and system context
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String)
    user_agent = Column(String)
    
    # Data tracking for real-time updates
    affected_data_type = Column(String)  # disasters, food_items, vulnerability_assessments, etc.
    affected_record_id = Column(Integer)
    change_type = Column(String)  # create, update, delete
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships  
    user = relationship("User", backref="system_events")