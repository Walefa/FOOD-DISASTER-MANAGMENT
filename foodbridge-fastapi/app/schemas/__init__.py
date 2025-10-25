from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, DisasterType, AlertSeverity, VulnerabilityLevel

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[dict] = None

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# Disaster Alert Schemas
class DisasterAlertBase(BaseModel):
    title: str
    description: Optional[str] = None
    disaster_type: DisasterType
    severity: AlertSeverity
    location: str
    latitude: float
    longitude: float
    radius_km: Optional[float] = 10.0
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    source: Optional[str] = None
    confidence_score: Optional[float] = None

class DisasterAlertCreate(DisasterAlertBase):
    pass

class DisasterAlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[AlertSeverity] = None
    end_time: Optional[datetime] = None
    is_active: Optional[bool] = None

class DisasterAlert(DisasterAlertBase):
    id: int
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Food Inventory Schemas
class FoodInventoryBase(BaseModel):
    item_name: str
    category: Optional[str] = None
    quantity: float
    unit: str
    expiry_date: Optional[datetime] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    owner_organization: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    is_emergency_reserve: bool = False
    nutritional_value: Optional[str] = None
    storage_requirements: Optional[str] = None

class FoodInventoryCreate(FoodInventoryBase):
    pass

class FoodInventoryUpdate(BaseModel):
    quantity: Optional[float] = None
    expiry_date: Optional[datetime] = None
    is_available: Optional[bool] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None

class FoodInventory(FoodInventoryBase):
    id: int
    is_available: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Vulnerability Assessment Schemas
class VulnerabilityAssessmentBase(BaseModel):
    community_name: str
    location: str
    latitude: float
    longitude: float
    population: Optional[int] = None
    flood_risk: VulnerabilityLevel = VulnerabilityLevel.LOW
    drought_risk: VulnerabilityLevel = VulnerabilityLevel.LOW
    extreme_weather_risk: VulnerabilityLevel = VulnerabilityLevel.LOW
    food_access_score: Optional[float] = None
    nutrition_diversity_score: Optional[float] = None
    food_affordability_score: Optional[float] = None
    poverty_rate: Optional[float] = None
    unemployment_rate: Optional[float] = None
    education_level: Optional[float] = None
    healthcare_access: Optional[float] = None
    road_access_quality: Optional[float] = None
    water_infrastructure: Optional[float] = None
    communication_coverage: Optional[float] = None
    methodology: Optional[str] = None
    notes: Optional[str] = None

class VulnerabilityAssessmentCreate(VulnerabilityAssessmentBase):
    pass

class VulnerabilityAssessment(VulnerabilityAssessmentBase):
    id: int
    overall_vulnerability: Optional[VulnerabilityLevel] = None
    climate_resilience_score: Optional[float] = None
    food_security_score: Optional[float] = None
    assessment_date: datetime
    assessor_id: int
    
    class Config:
        from_attributes = True

# Food Distribution Schemas
class FoodDistributionBase(BaseModel):
    event_name: str
    location: str
    latitude: float
    longitude: float
    scheduled_date: datetime
    duration_hours: float = 4.0
    target_beneficiaries: Optional[int] = None
    food_items_distributed: Optional[str] = None  # JSON string
    organizing_ngo: Optional[str] = None
    partner_organizations: Optional[str] = None  # JSON string
    volunteers_count: Optional[int] = None

class FoodDistributionCreate(FoodDistributionBase):
    pass

class FoodDistributionUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    actual_beneficiaries: Optional[int] = None
    food_items_distributed: Optional[str] = None
    total_weight_kg: Optional[float] = None
    estimated_meals: Optional[int] = None
    status: Optional[str] = None
    completion_notes: Optional[str] = None
    feedback_score: Optional[float] = None

class FoodDistribution(FoodDistributionBase):
    id: int
    actual_beneficiaries: Optional[int] = None
    total_weight_kg: Optional[float] = None
    estimated_meals: Optional[int] = None
    status: str
    completion_notes: Optional[str] = None
    feedback_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Schemas
class ClimateRisk(BaseModel):
    disaster_type: DisasterType
    probability: float  # 0-1
    severity: AlertSeverity
    timeframe_days: int
    confidence: float  # 0-1

class FoodShortageRisk(BaseModel):
    location: str
    risk_level: VulnerabilityLevel
    estimated_shortage_percent: float
    timeframe_days: int
    recommended_actions: List[str]

class DashboardMetrics(BaseModel):
    active_alerts: int
    total_food_inventory_kg: float
    communities_assessed: int
    upcoming_distributions: int
    high_risk_communities: int
    emergency_reserves_low: int

class ResourceAllocation(BaseModel):
    location: str
    priority: AlertSeverity
    required_food_kg: float
    available_food_kg: float
    gap_kg: float

# Real-time Features Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    type: Optional[str] = "info"
    priority: Optional[str] = "medium"
    category: Optional[str] = None
    action_url: Optional[str] = None
    action_data: Optional[str] = None
    target_user_id: Optional[int] = None
    target_roles: Optional[str] = None
    expires_at: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class Notification(NotificationBase):
    id: int
    is_read: bool
    is_broadcasted: bool
    broadcast_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class EmergencyAlertBase(BaseModel):
    title: str
    message: str
    alert_type: str
    severity: Optional[str] = "medium"
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    affected_radius_km: Optional[float] = None
    emergency_contact: Optional[str] = None
    response_instructions: Optional[str] = None
    evacuation_routes: Optional[str] = None
    affected_population_estimate: Optional[int] = None

class EmergencyAlertCreate(EmergencyAlertBase):
    pass

class EmergencyAlertUpdate(BaseModel):
    is_active: Optional[bool] = None
    confirmation_status: Optional[str] = None
    resolved_at: Optional[datetime] = None

class EmergencyAlert(EmergencyAlertBase):
    id: int
    is_active: bool
    is_broadcasted: bool
    broadcast_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    issued_by_user_id: int
    confirmation_status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SystemEventCreate(BaseModel):
    event_type: str
    description: Optional[str] = None
    details: Optional[str] = None
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    affected_data_type: Optional[str] = None
    affected_record_id: Optional[int] = None
    change_type: Optional[str] = None

class SystemEvent(BaseModel):
    id: int
    event_type: str
    description: Optional[str] = None
    details: Optional[str] = None
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    affected_data_type: Optional[str] = None
    affected_record_id: Optional[int] = None
    change_type: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    type: str
    data: Optional[dict] = None
    timestamp: Optional[str] = None
    priority: Optional[str] = "medium"
    recommended_sources: List[str]