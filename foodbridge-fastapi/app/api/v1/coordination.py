from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from app.db.session import get_db
from app.api.v1.auth import get_current_user
from app.models import (
    EmergencyResponse, DisasterAlert, FoodDistribution, 
    FoodInventory, User, VulnerabilityAssessment,
    AlertSeverity, UserRole
)
import json

router = APIRouter()

@router.post("/emergency-responses")
async def create_emergency_response(
    response_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new emergency response coordination"""
    # Validate disaster alert exists
    if response_data.get('disaster_alert_id'):
        alert = db.query(DisasterAlert).filter(
            DisasterAlert.id == response_data['disaster_alert_id']
        ).first()
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Disaster alert not found"
            )
    
    # Create emergency response
    db_response = EmergencyResponse(
        disaster_alert_id=response_data.get('disaster_alert_id'),
        response_type=response_data['response_type'],
        priority=AlertSeverity(response_data.get('priority', 'medium')),
        personnel_required=response_data.get('personnel_required'),
        vehicles_required=response_data.get('vehicles_required'),
        supplies_needed=json.dumps(response_data.get('supplies_needed', [])),
        estimated_duration_hours=response_data.get('estimated_duration_hours'),
        lead_organization=response_data.get('lead_organization'),
        participating_organizations=json.dumps(response_data.get('participating_organizations', [])),
        contact_person=response_data.get('contact_person'),
        contact_phone=response_data.get('contact_phone'),
        staging_area=response_data.get('staging_area'),
        affected_areas=json.dumps(response_data.get('affected_areas', []))
    )
    
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    return db_response

@router.get("/emergency-responses")
async def list_emergency_responses(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    response_type: Optional[str] = None,
    priority: Optional[AlertSeverity] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """List emergency responses with filters"""
    query = db.query(EmergencyResponse)
    
    if status_filter:
        query = query.filter(EmergencyResponse.status == status_filter)
    
    if response_type:
        query = query.filter(EmergencyResponse.response_type == response_type)
    
    if priority:
        query = query.filter(EmergencyResponse.priority == priority)
    
    if active_only:
        query = query.filter(EmergencyResponse.status.in_(['planned', 'active']))
    
    responses = query.order_by(EmergencyResponse.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert JSON fields back to objects
    result = []
    for response in responses:
        response_dict = {
            "id": response.id,
            "disaster_alert_id": response.disaster_alert_id,
            "response_type": response.response_type,
            "status": response.status,
            "priority": response.priority.value,
            "personnel_required": response.personnel_required,
            "vehicles_required": response.vehicles_required,
            "supplies_needed": json.loads(response.supplies_needed) if response.supplies_needed else [],
            "estimated_duration_hours": response.estimated_duration_hours,
            "lead_organization": response.lead_organization,
            "participating_organizations": json.loads(response.participating_organizations) if response.participating_organizations else [],
            "contact_person": response.contact_person,
            "contact_phone": response.contact_phone,
            "staging_area": response.staging_area,
            "affected_areas": json.loads(response.affected_areas) if response.affected_areas else [],
            "created_at": response.created_at,
            "updated_at": response.updated_at
        }
        result.append(response_dict)
    
    return result

@router.put("/emergency-responses/{response_id}")
async def update_emergency_response(
    response_id: int,
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update emergency response status and details"""
    response = db.query(EmergencyResponse).filter(EmergencyResponse.id == response_id).first()
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency response not found"
        )
    
    # Update allowed fields
    allowed_fields = [
        'status', 'personnel_required', 'vehicles_required', 'estimated_duration_hours',
        'contact_person', 'contact_phone', 'staging_area'
    ]
    
    for field in allowed_fields:
        if field in update_data:
            setattr(response, field, update_data[field])
    
    # Handle JSON fields
    if 'supplies_needed' in update_data:
        response.supplies_needed = json.dumps(update_data['supplies_needed'])
    
    if 'participating_organizations' in update_data:
        response.participating_organizations = json.dumps(update_data['participating_organizations'])
    
    if 'affected_areas' in update_data:
        response.affected_areas = json.dumps(update_data['affected_areas'])
    
    db.commit()
    db.refresh(response)
    return response

@router.get("/organizations")
async def list_participating_organizations(
    response_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List organizations that have participated in emergency responses"""
    query = db.query(EmergencyResponse.lead_organization).distinct()
    
    if response_type:
        query = query.filter(EmergencyResponse.response_type == response_type)
    
    organizations = [org[0] for org in query.all() if org[0]]
    
    # Also get organizations from user registrations
    user_orgs = db.query(User.organization).distinct().filter(
        and_(
            User.organization.isnot(None),
            User.role.in_([UserRole.NGO, UserRole.EMERGENCY_RESPONDER])
        )
    ).all()
    
    organizations.extend([org[0] for org in user_orgs if org[0] and org[0] not in organizations])
    
    return sorted(organizations)

@router.get("/coordination-matrix")
async def get_coordination_matrix(
    disaster_alert_id: Optional[int] = None,
    lat: Optional[float] = Query(None, description="Center latitude"),
    lng: Optional[float] = Query(None, description="Center longitude"),
    radius_km: float = Query(50, description="Analysis radius"),
    db: Session = Depends(get_db)
):
    """Get coordination matrix showing resources, needs, and response capacity"""
    
    # If disaster alert specified, use its location
    if disaster_alert_id:
        alert = db.query(DisasterAlert).filter(DisasterAlert.id == disaster_alert_id).first()
        if alert:
            lat, lng = alert.latitude, alert.longitude
            radius_km = alert.radius_km
    
    if lat is None or lng is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location coordinates are required"
        )
    
    # Get vulnerable communities in area
    vulnerable_communities = db.query(VulnerabilityAssessment).filter(
        and_(
            VulnerabilityAssessment.latitude.between(lat - radius_km/111, lat + radius_km/111),
            VulnerabilityAssessment.longitude.between(lng - radius_km/111, lng + radius_km/111)
        )
    ).all()
    
    # Get available resources (food inventory)
    available_resources = db.query(FoodInventory).filter(
        and_(
            FoodInventory.is_available == True,
            FoodInventory.latitude.isnot(None),
            FoodInventory.longitude.isnot(None),
            FoodInventory.latitude.between(lat - radius_km*1.5/111, lat + radius_km*1.5/111),
            FoodInventory.longitude.between(lng - radius_km*1.5/111, lng + radius_km*1.5/111)
        )
    ).all()
    
    # Get active emergency responses
    active_responses = db.query(EmergencyResponse).filter(
        EmergencyResponse.status.in_(['planned', 'active'])
    ).all()
    
    # Get participating organizations and their capacity
    organizations = db.query(User).filter(
        and_(
            User.role.in_([UserRole.NGO, UserRole.EMERGENCY_RESPONDER]),
            User.latitude.isnot(None),
            User.longitude.isnot(None),
            User.latitude.between(lat - radius_km*2/111, lat + radius_km*2/111),
            User.longitude.between(lng - radius_km*2/111, lng + radius_km*2/111)
        )
    ).all()
    
    # Calculate coordination metrics
    coordination_matrix = {
        "area_analysis": {
            "center_lat": lat,
            "center_lng": lng,
            "radius_km": radius_km,
            "analysis_timestamp": datetime.utcnow().isoformat()
        },
        "vulnerable_communities": [
            {
                "name": community.community_name,
                "location": community.location,
                "population": community.population,
                "vulnerability_level": community.overall_vulnerability.value if community.overall_vulnerability else "unknown",
                "lat": community.latitude,
                "lng": community.longitude,
                "estimated_needs": _calculate_community_needs(community)
            }
            for community in vulnerable_communities
        ],
        "available_resources": [
            {
                "item": resource.item_name,
                "quantity": resource.quantity,
                "unit": resource.unit,
                "location": resource.location,
                "contact": resource.contact_person,
                "phone": resource.contact_phone,
                "lat": resource.latitude,
                "lng": resource.longitude,
                "is_emergency_reserve": resource.is_emergency_reserve
            }
            for resource in available_resources
        ],
        "response_organizations": [
            {
                "organization": org.organization,
                "role": org.role.value,
                "contact_person": org.full_name,
                "phone": org.phone,
                "email": org.email,
                "location": org.location,
                "lat": org.latitude,
                "lng": org.longitude
            }
            for org in organizations if org.organization
        ],
        "active_responses": [
            {
                "id": response.id,
                "type": response.response_type,
                "status": response.status,
                "priority": response.priority.value,
                "lead_org": response.lead_organization,
                "personnel_required": response.personnel_required,
                "vehicles_required": response.vehicles_required
            }
            for response in active_responses
        ],
        "coordination_gaps": _identify_coordination_gaps(
            vulnerable_communities, available_resources, organizations, active_responses
        )
    }
    
    return coordination_matrix

@router.post("/coordinate-response")
async def coordinate_emergency_response(
    coordination_request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Coordinate emergency response based on needs and available resources"""
    
    required_fields = ['disaster_type', 'affected_location', 'priority', 'required_resources']
    for field in required_fields:
        if field not in coordination_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Create coordination plan
    plan = {
        "coordination_id": f"COORD-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
        "requested_by": current_user.full_name,
        "request_timestamp": datetime.utcnow().isoformat(),
        "disaster_info": {
            "type": coordination_request['disaster_type'],
            "location": coordination_request['affected_location'],
            "priority": coordination_request['priority'],
            "estimated_affected_population": coordination_request.get('affected_population', 'unknown')
        },
        "resource_requirements": coordination_request['required_resources'],
        "coordination_actions": []
    }
    
    # Find matching organizations
    suitable_orgs = db.query(User).filter(
        and_(
            User.role.in_([UserRole.NGO, UserRole.EMERGENCY_RESPONDER]),
            User.is_active == True
        )
    ).all()
    
    # Generate coordination actions
    for org in suitable_orgs[:5]:  # Limit to top 5 organizations
        action = {
            "organization": org.organization or org.full_name,
            "contact_person": org.full_name,
            "phone": org.phone,
            "email": org.email,
            "recommended_role": _suggest_organization_role(org.role, coordination_request['disaster_type']),
            "status": "pending_contact"
        }
        plan["coordination_actions"].append(action)
    
    # Find available resources
    available_resources = db.query(FoodInventory).filter(
        FoodInventory.is_available == True
    ).limit(10).all()
    
    resource_matches = []
    for resource in available_resources:
        if any(req_resource.lower() in resource.item_name.lower() 
               for req_resource in coordination_request.get('required_resources', [])):
            resource_matches.append({
                "item": resource.item_name,
                "quantity": resource.quantity,
                "location": resource.location,
                "contact": resource.contact_person,
                "phone": resource.contact_phone
            })
    
    plan["available_resources"] = resource_matches
    
    # Suggest next steps
    plan["next_steps"] = [
        "Contact identified organizations to confirm availability",
        "Establish communication channels with all responders",
        "Set up staging area for resource coordination",
        "Begin resource mobilization based on priority",
        "Establish regular situation updates schedule"
    ]
    
    return plan

@router.get("/communication-tree")
async def get_communication_tree(
    emergency_response_id: Optional[int] = None,
    disaster_alert_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get communication tree for emergency response coordination"""
    
    # Find relevant users and organizations
    if emergency_response_id:
        response = db.query(EmergencyResponse).filter(EmergencyResponse.id == emergency_response_id).first()
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency response not found"
            )
    
    # Get emergency responders and NGOs
    responders = db.query(User).filter(
        and_(
            User.role.in_([UserRole.EMERGENCY_RESPONDER, UserRole.NGO, UserRole.ADMIN]),
            User.is_active == True,
            User.phone.isnot(None)
        )
    ).all()
    
    # Build communication tree
    comm_tree = {
        "primary_contacts": [],
        "secondary_contacts": [],
        "support_contacts": [],
        "communication_protocols": {
            "primary_method": "Phone call",
            "backup_method": "SMS/WhatsApp",
            "update_frequency": "Every 2 hours during active response",
            "escalation_time": "30 minutes for non-response"
        }
    }
    
    for responder in responders:
        contact_info = {
            "name": responder.full_name,
            "role": responder.role.value,
            "organization": responder.organization,
            "phone": responder.phone,
            "email": responder.email,
            "location": responder.location
        }
        
        if responder.role == UserRole.ADMIN:
            comm_tree["primary_contacts"].append(contact_info)
        elif responder.role == UserRole.EMERGENCY_RESPONDER:
            comm_tree["secondary_contacts"].append(contact_info)
        else:
            comm_tree["support_contacts"].append(contact_info)
    
    return comm_tree

# Helper functions
def _calculate_community_needs(community: VulnerabilityAssessment) -> dict:
    """Calculate estimated needs for a community"""
    population = community.population or 1000
    
    # Base needs per person per day
    daily_food_kg = 2.0
    daily_water_liters = 15.0
    
    # Adjust based on vulnerability
    vulnerability_multiplier = {
        "low": 1.0,
        "medium": 1.2,
        "high": 1.5,
        "very_high": 2.0
    }
    
    multiplier = vulnerability_multiplier.get(
        community.overall_vulnerability.value if community.overall_vulnerability else "medium",
        1.2
    )
    
    return {
        "food_kg_per_day": round(population * daily_food_kg * multiplier, 1),
        "water_liters_per_day": round(population * daily_water_liters * multiplier, 1),
        "estimated_population": population,
        "vulnerability_multiplier": multiplier,
        "priority_items": _get_priority_items(community)
    }

def _get_priority_items(community: VulnerabilityAssessment) -> List[str]:
    """Get priority items based on community vulnerability"""
    items = ["Rice", "Beans", "Cooking oil", "Clean water"]
    
    if community.overall_vulnerability and community.overall_vulnerability.value in ["high", "very_high"]:
        items.extend(["Baby formula", "Medical supplies", "Blankets"])
    
    return items

def _identify_coordination_gaps(communities, resources, organizations, responses) -> List[str]:
    """Identify gaps in coordination coverage"""
    gaps = []
    
    if len(communities) > len(responses):
        gaps.append(f"{len(communities) - len(responses)} communities without assigned response")
    
    if len([r for r in resources if r.is_emergency_reserve]) < 3:
        gaps.append("Insufficient emergency food reserves")
    
    org_types = [org.role.value for org in organizations]
    if "emergency_responder" not in org_types:
        gaps.append("No emergency responders in area")
    
    if "ngo" not in org_types:
        gaps.append("No NGOs available for coordination")
    
    total_personnel = sum(r.personnel_required or 0 for r in responses)
    if total_personnel > len(organizations) * 5:  # Assume 5 people per org
        gaps.append("Insufficient personnel for planned responses")
    
    return gaps

def _suggest_organization_role(user_role: UserRole, disaster_type: str) -> str:
    """Suggest role for organization based on their type and disaster"""
    role_suggestions = {
        UserRole.NGO: {
            "flood": "Food distribution and temporary shelter",
            "drought": "Water distribution and agricultural support",
            "hurricane": "Emergency supplies and evacuation support",
            "food_shortage": "Food bank coordination and distribution"
        },
        UserRole.EMERGENCY_RESPONDER: {
            "flood": "Evacuation and rescue operations",
            "drought": "Water delivery and health monitoring",
            "hurricane": "Emergency response and damage assessment",
            "food_shortage": "Logistics and transportation support"
        }
    }
    
    return role_suggestions.get(user_role, {}).get(
        disaster_type, 
        "General emergency support and coordination"
    )