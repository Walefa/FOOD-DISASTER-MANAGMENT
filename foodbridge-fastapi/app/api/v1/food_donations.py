from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ...db.session import get_db
from ...models import FoodDonation, User, ProduceType, DonationStatus, DonationUrgency
from .auth import get_current_user
from ...core.websocket import websocket_manager

router = APIRouter()

# Pydantic schemas for requests and responses
from pydantic import BaseModel, Field
from datetime import datetime

class FoodDonationCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: Optional[str] = None
    produce_type: ProduceType
    variety: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=20)
    quality_grade: Optional[str] = None
    harvest_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    available_until: Optional[datetime] = None
    urgency: DonationUrgency = DonationUrgency.MEDIUM
    farm_location: str = Field(..., min_length=5, max_length=200)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    pickup_instructions: Optional[str] = None
    transportation_available: bool = False
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    preferred_contact_method: str = "phone"
    storage_requirements: Optional[str] = None
    packaging_type: Optional[str] = None
    handling_notes: Optional[str] = None
    intended_beneficiaries: Optional[str] = None
    estimated_people_fed: Optional[int] = Field(None, ge=1)
    image_urls: Optional[str] = None  # JSON string
    certification: Optional[str] = None
    is_urgent: bool = False

class FoodDonationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    quality_grade: Optional[str] = None
    available_until: Optional[datetime] = None
    urgency: Optional[DonationUrgency] = None
    pickup_instructions: Optional[str] = None
    transportation_available: Optional[bool] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    storage_requirements: Optional[str] = None
    packaging_type: Optional[str] = None
    handling_notes: Optional[str] = None
    is_urgent: Optional[bool] = None

class FoodDonationResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    produce_type: str
    variety: Optional[str]
    quantity: float
    unit: str
    quality_grade: Optional[str]
    harvest_date: Optional[datetime]
    expiry_date: Optional[datetime]
    available_until: Optional[datetime]
    urgency: str
    farm_location: str
    latitude: float
    longitude: float
    pickup_instructions: Optional[str]
    transportation_available: bool
    contact_phone: Optional[str]
    contact_email: Optional[str]
    preferred_contact_method: str
    storage_requirements: Optional[str]
    packaging_type: Optional[str]
    handling_notes: Optional[str]
    status: str
    claimed_by: Optional[int]
    claimed_at: Optional[datetime]
    collected_at: Optional[datetime]
    intended_beneficiaries: Optional[str]
    estimated_people_fed: Optional[int]
    certification: Optional[str]
    is_verified: bool
    is_active: bool
    is_urgent: bool
    created_at: datetime
    updated_at: datetime
    
    # Farmer information
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_organization: Optional[str] = None
    
    # Claimed by information
    claimed_by_name: Optional[str] = None
    claimed_by_organization: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=FoodDonationResponse)
async def create_food_donation(
    donation: FoodDonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new food donation offer (farmers only)"""
    
    # Only farmers can create donations
    if current_user.role.value != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can create food donation offers"
        )
    
    # Validate dates
    if donation.harvest_date and donation.harvest_date > datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Harvest date cannot be in the future"
        )
    
    if donation.expiry_date and donation.expiry_date <= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Expiry date must be in the future"
        )
    
    if donation.available_until and donation.available_until <= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Available until date must be in the future"
        )
    
    # Create donation record
    db_donation = FoodDonation(
        **donation.dict(),
        farmer_id=current_user.id,
        contact_phone=donation.contact_phone or current_user.phone,
        contact_email=donation.contact_email or current_user.email
    )
    
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    
    # Broadcast new donation to connected users
    await websocket_manager.broadcast_to_role_based_channels({
        "type": "new_food_donation",
        "data": {
            "id": db_donation.id,
            "title": db_donation.title,
            "produce_type": db_donation.produce_type,
            "quantity": db_donation.quantity,
            "unit": db_donation.unit,
            "location": db_donation.farm_location,
            "urgency": db_donation.urgency,
            "farmer_name": current_user.full_name,
            "farmer_organization": current_user.organization
        }
    })
    
    # Prepare response
    response_data = FoodDonationResponse.from_orm(db_donation)
    response_data.farmer_name = current_user.full_name
    response_data.farmer_organization = current_user.organization
    
    return response_data

@router.get("/", response_model=List[FoodDonationResponse])
async def get_food_donations(
    status: Optional[DonationStatus] = Query(None, description="Filter by donation status"),
    produce_type: Optional[ProduceType] = Query(None, description="Filter by produce type"),
    urgency: Optional[DonationUrgency] = Query(None, description="Filter by urgency level"),
    location: Optional[str] = Query(None, description="Filter by location keyword"),
    available_only: bool = Query(True, description="Show only available donations"),
    limit: int = Query(50, le=100, description="Maximum number of donations to return"),
    offset: int = Query(0, ge=0, description="Number of donations to skip"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of food donations with filters"""
    
    query = db.query(FoodDonation).filter(FoodDonation.is_active == True)
    
    # Apply filters
    if available_only:
        query = query.filter(FoodDonation.status == DonationStatus.AVAILABLE)
    elif status:
        query = query.filter(FoodDonation.status == status)
    
    if produce_type:
        query = query.filter(FoodDonation.produce_type == produce_type)
    
    if urgency:
        query = query.filter(FoodDonation.urgency == urgency)
    
    if location:
        query = query.filter(FoodDonation.farm_location.ilike(f"%{location}%"))
    
    # Order by urgency and creation date
    query = query.order_by(
        FoodDonation.is_urgent.desc(),
        FoodDonation.urgency.desc(),
        FoodDonation.created_at.desc()
    )
    
    donations = query.offset(offset).limit(limit).all()
    
    # Enrich with farmer and claimed_by information
    result = []
    for donation in donations:
        response_data = FoodDonationResponse.from_orm(donation)
        
        # Add farmer info
        farmer = db.query(User).filter(User.id == donation.farmer_id).first()
        if farmer:
            response_data.farmer_name = farmer.full_name
            response_data.farmer_organization = farmer.organization
        
        # Add claimed_by info
        if donation.claimed_by:
            claimed_by = db.query(User).filter(User.id == donation.claimed_by).first()
            if claimed_by:
                response_data.claimed_by_name = claimed_by.full_name
                response_data.claimed_by_organization = claimed_by.organization
        
        result.append(response_data)
    
    return result

@router.get("/{donation_id}", response_model=FoodDonationResponse)
async def get_food_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific food donation by ID"""
    
    donation = db.query(FoodDonation).filter(
        FoodDonation.id == donation_id,
        FoodDonation.is_active == True
    ).first()
    
    if not donation:
        raise HTTPException(status_code=404, detail="Food donation not found")
    
    # Prepare response with farmer info
    response_data = FoodDonationResponse.from_orm(donation)
    
    farmer = db.query(User).filter(User.id == donation.farmer_id).first()
    if farmer:
        response_data.farmer_name = farmer.full_name
        response_data.farmer_organization = farmer.organization
    
    if donation.claimed_by:
        claimed_by = db.query(User).filter(User.id == donation.claimed_by).first()
        if claimed_by:
            response_data.claimed_by_name = claimed_by.full_name
            response_data.claimed_by_organization = claimed_by.organization
    
    return response_data

@router.put("/{donation_id}", response_model=FoodDonationResponse)
async def update_food_donation(
    donation_id: int,
    donation_update: FoodDonationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a food donation (farmers can update their own donations)"""
    
    donation = db.query(FoodDonation).filter(
        FoodDonation.id == donation_id,
        FoodDonation.is_active == True
    ).first()
    
    if not donation:
        raise HTTPException(status_code=404, detail="Food donation not found")
    
    # Only farmer who created it can update, or admin
    if donation.farmer_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can only update your own food donations"
        )
    
    # Can't update if already claimed/collected
    if donation.status in [DonationStatus.CLAIMED, DonationStatus.COLLECTED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot update donation that has been claimed or collected"
        )
    
    # Update fields
    update_data = donation_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(donation, field, value)
    
    donation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(donation)
    
    # Prepare response
    response_data = FoodDonationResponse.from_orm(donation)
    farmer = db.query(User).filter(User.id == donation.farmer_id).first()
    if farmer:
        response_data.farmer_name = farmer.full_name
        response_data.farmer_organization = farmer.organization
    
    return response_data

@router.post("/{donation_id}/claim")
async def claim_food_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Claim a food donation (NGOs and emergency responders only)"""
    
    # Only NGOs and emergency responders can claim donations
    if current_user.role.value not in ["ngo", "emergency_responder"]:
        raise HTTPException(
            status_code=403,
            detail="Only NGOs and emergency responders can claim food donations"
        )
    
    donation = db.query(FoodDonation).filter(
        FoodDonation.id == donation_id,
        FoodDonation.is_active == True
    ).first()
    
    if not donation:
        raise HTTPException(status_code=404, detail="Food donation not found")
    
    if donation.status != DonationStatus.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail=f"Donation is not available (current status: {donation.status})"
        )
    
    # Claim the donation
    donation.status = DonationStatus.CLAIMED
    donation.claimed_by = current_user.id
    donation.claimed_at = datetime.utcnow()
    donation.updated_at = datetime.utcnow()
    
    db.commit()
    
    # Notify farmer about the claim
    await websocket_manager.send_to_user(donation.farmer_id, {
        "type": "donation_claimed",
        "data": {
            "donation_id": donation.id,
            "donation_title": donation.title,
            "claimed_by": current_user.full_name,
            "claimed_by_organization": current_user.organization,
            "claimed_by_phone": current_user.phone,
            "claimed_by_email": current_user.email
        }
    })
    
    return {"message": "Food donation claimed successfully", "donation_id": donation_id}

@router.post("/{donation_id}/collect")
async def mark_donation_collected(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a donation as collected"""
    
    donation = db.query(FoodDonation).filter(
        FoodDonation.id == donation_id,
        FoodDonation.is_active == True
    ).first()
    
    if not donation:
        raise HTTPException(status_code=404, detail="Food donation not found")
    
    # Only the claimer or farmer can mark as collected
    if donation.claimed_by != current_user.id and donation.farmer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the claimer or farmer can mark donation as collected"
        )
    
    if donation.status != DonationStatus.CLAIMED:
        raise HTTPException(
            status_code=400,
            detail=f"Donation must be claimed before marking as collected (current status: {donation.status})"
        )
    
    # Mark as collected
    donation.status = DonationStatus.COLLECTED
    donation.collected_at = datetime.utcnow()
    donation.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Food donation marked as collected", "donation_id": donation_id}

@router.delete("/{donation_id}")
async def cancel_food_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel/delete a food donation"""
    
    donation = db.query(FoodDonation).filter(
        FoodDonation.id == donation_id,
        FoodDonation.is_active == True
    ).first()
    
    if not donation:
        raise HTTPException(status_code=404, detail="Food donation not found")
    
    # Only farmer who created it can cancel, or admin
    if donation.farmer_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own food donations"
        )
    
    # Can't cancel if already collected
    if donation.status == DonationStatus.COLLECTED:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel donation that has been collected"
        )
    
    # If it was claimed, notify the claimer
    if donation.status == DonationStatus.CLAIMED and donation.claimed_by:
        await websocket_manager.send_to_user(donation.claimed_by, {
            "type": "donation_cancelled",
            "data": {
                "donation_id": donation.id,
                "donation_title": donation.title,
                "farmer_name": current_user.full_name,
                "reason": "Cancelled by farmer"
            }
        })
    
    # Mark as cancelled instead of deleting
    donation.status = DonationStatus.CANCELLED
    donation.is_active = False
    donation.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Food donation cancelled successfully", "donation_id": donation_id}

# Statistics endpoint
@router.get("/stats/summary")
async def get_donation_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get food donation statistics"""
    
    total_donations = db.query(FoodDonation).filter(FoodDonation.is_active == True).count()
    available_donations = db.query(FoodDonation).filter(
        FoodDonation.is_active == True,
        FoodDonation.status == DonationStatus.AVAILABLE
    ).count()
    claimed_donations = db.query(FoodDonation).filter(
        FoodDonation.is_active == True,
        FoodDonation.status == DonationStatus.CLAIMED
    ).count()
    collected_donations = db.query(FoodDonation).filter(
        FoodDonation.is_active == True,
        FoodDonation.status == DonationStatus.COLLECTED
    ).count()
    urgent_donations = db.query(FoodDonation).filter(
        FoodDonation.is_active == True,
        FoodDonation.status == DonationStatus.AVAILABLE,
        FoodDonation.is_urgent == True
    ).count()
    
    return {
        "total_donations": total_donations,
        "available_donations": available_donations,
        "claimed_donations": claimed_donations,
        "collected_donations": collected_donations,
        "urgent_donations": urgent_donations,
        "completion_rate": round((collected_donations / max(total_donations, 1)) * 100, 1)
    }