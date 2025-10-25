from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.session import get_db
from app.api.v1.auth import get_current_user
from app.models import FoodInventory, User, FoodDistribution
from app.schemas import (
    FoodInventoryCreate, 
    FoodInventoryUpdate, 
    FoodInventory as FoodInventorySchema,
    FoodDistributionCreate,
    FoodDistributionUpdate,
    FoodDistribution as FoodDistributionSchema
)

router = APIRouter()

# Food Inventory Endpoints
@router.post("/inventory", response_model=FoodInventorySchema)
async def create_food_inventory(
    inventory_data: FoodInventoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add new food inventory item"""
    db_inventory = FoodInventory(**inventory_data.dict())
    
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    
    return db_inventory

@router.get("/inventory", response_model=List[FoodInventorySchema])
async def list_food_inventory(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    location: Optional[str] = None,
    available_only: bool = True,
    emergency_only: bool = False,
    expiring_soon_days: Optional[int] = Query(None, description="Show items expiring within X days"),
    lat: Optional[float] = Query(None, description="Latitude for location-based search"),
    lng: Optional[float] = Query(None, description="Longitude for location-based search"),
    radius_km: Optional[float] = Query(50, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    """List food inventory with optional filters"""
    query = db.query(FoodInventory)
    
    # Apply filters
    if available_only:
        query = query.filter(FoodInventory.is_available == True)
    
    if emergency_only:
        query = query.filter(FoodInventory.is_emergency_reserve == True)
    
    if category:
        query = query.filter(FoodInventory.category.ilike(f"%{category}%"))
    
    if location:
        query = query.filter(FoodInventory.location.ilike(f"%{location}%"))
    
    if expiring_soon_days is not None:
        expiry_threshold = datetime.utcnow() + timedelta(days=expiring_soon_days)
        query = query.filter(
            and_(
                FoodInventory.expiry_date.isnot(None),
                FoodInventory.expiry_date <= expiry_threshold
            )
        )
    
    # Location-based filtering
    if lat is not None and lng is not None:
        query = query.filter(
            and_(
                FoodInventory.latitude.between(lat - radius_km/111, lat + radius_km/111),
                FoodInventory.longitude.between(lng - radius_km/111, lng + radius_km/111)
            )
        )
    
    inventory = query.order_by(FoodInventory.created_at.desc()).offset(skip).limit(limit).all()
    return inventory

@router.get("/inventory/{inventory_id}", response_model=FoodInventorySchema)
async def get_food_inventory_item(inventory_id: int, db: Session = Depends(get_db)):
    """Get a specific food inventory item"""
    item = db.query(FoodInventory).filter(FoodInventory.id == inventory_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food inventory item not found"
        )
    return item

@router.put("/inventory/{inventory_id}", response_model=FoodInventorySchema)
async def update_food_inventory(
    inventory_id: int,
    inventory_update: FoodInventoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update food inventory item"""
    item = db.query(FoodInventory).filter(FoodInventory.id == inventory_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food inventory item not found"
        )
    
    # Update fields
    update_data = inventory_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/inventory/{inventory_id}")
async def delete_food_inventory_item(
    inventory_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete food inventory item"""
    item = db.query(FoodInventory).filter(FoodInventory.id == inventory_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food inventory item not found"
        )
    
    db.delete(item)
    db.commit()
    return {"message": "Food inventory item deleted successfully"}

# Food Distribution Endpoints
@router.post("/distributions", response_model=FoodDistributionSchema)
async def create_food_distribution(
    distribution_data: FoodDistributionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new food distribution event"""
    db_distribution = FoodDistribution(**distribution_data.dict())
    
    db.add(db_distribution)
    db.commit()
    db.refresh(db_distribution)
    
    return db_distribution

@router.get("/distributions", response_model=List[FoodDistributionSchema])
async def list_food_distributions(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    upcoming_only: bool = False,
    organization: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List food distribution events"""
    query = db.query(FoodDistribution)
    
    if status_filter:
        query = query.filter(FoodDistribution.status == status_filter)
    
    if upcoming_only:
        query = query.filter(FoodDistribution.scheduled_date >= datetime.utcnow())
    
    if organization:
        query = query.filter(FoodDistribution.organizing_ngo.ilike(f"%{organization}%"))
    
    distributions = query.order_by(FoodDistribution.scheduled_date.desc()).offset(skip).limit(limit).all()
    return distributions

@router.get("/distributions/{distribution_id}", response_model=FoodDistributionSchema)
async def get_food_distribution(distribution_id: int, db: Session = Depends(get_db)):
    """Get a specific food distribution event"""
    distribution = db.query(FoodDistribution).filter(FoodDistribution.id == distribution_id).first()
    if not distribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food distribution event not found"
        )
    return distribution

@router.put("/distributions/{distribution_id}", response_model=FoodDistributionSchema)
async def update_food_distribution(
    distribution_id: int,
    distribution_update: FoodDistributionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update food distribution event"""
    distribution = db.query(FoodDistribution).filter(FoodDistribution.id == distribution_id).first()
    if not distribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food distribution event not found"
        )
    
    # Update fields
    update_data = distribution_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(distribution, field, value)
    
    db.commit()
    db.refresh(distribution)
    return distribution

# Analytics and Statistics
@router.get("/stats/inventory-summary")
async def get_inventory_summary(db: Session = Depends(get_db)):
    """Get food inventory summary statistics"""
    total_items = db.query(FoodInventory).count()
    available_items = db.query(FoodInventory).filter(FoodInventory.is_available == True).count()
    emergency_reserves = db.query(FoodInventory).filter(FoodInventory.is_emergency_reserve == True).count()
    
    # Total quantity by category
    category_stats = db.query(
        FoodInventory.category,
        func.sum(FoodInventory.quantity).label('total_quantity'),
        func.count(FoodInventory.id).label('item_count')
    ).filter(FoodInventory.is_available == True).group_by(FoodInventory.category).all()
    
    # Expiring soon (next 30 days)
    expiry_threshold = datetime.utcnow() + timedelta(days=30)
    expiring_soon = db.query(FoodInventory).filter(
        and_(
            FoodInventory.expiry_date.isnot(None),
            FoodInventory.expiry_date <= expiry_threshold,
            FoodInventory.is_available == True
        )
    ).count()
    
    return {
        "total_items": total_items,
        "available_items": available_items,
        "emergency_reserves": emergency_reserves,
        "expiring_soon_30_days": expiring_soon,
        "category_breakdown": [
            {
                "category": stat.category or "uncategorized",
                "total_quantity": float(stat.total_quantity or 0),
                "item_count": stat.item_count
            }
            for stat in category_stats
        ]
    }

@router.get("/stats/distribution-summary")
async def get_distribution_summary(db: Session = Depends(get_db)):
    """Get food distribution summary statistics"""
    total_events = db.query(FoodDistribution).count()
    completed_events = db.query(FoodDistribution).filter(FoodDistribution.status == "completed").count()
    upcoming_events = db.query(FoodDistribution).filter(
        and_(
            FoodDistribution.scheduled_date >= datetime.utcnow(),
            FoodDistribution.status.in_(["planned", "ongoing"])
        )
    ).count()
    
    # Total beneficiaries served
    total_beneficiaries = db.query(func.sum(FoodDistribution.actual_beneficiaries)).scalar() or 0
    
    # This month's distributions
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_events = db.query(FoodDistribution).filter(
        FoodDistribution.scheduled_date >= current_month_start
    ).count()
    
    return {
        "total_events": total_events,
        "completed_events": completed_events,
        "upcoming_events": upcoming_events,
        "total_beneficiaries_served": int(total_beneficiaries),
        "events_this_month": monthly_events
    }

@router.get("/search/nearby-resources")
async def search_nearby_food_resources(
    lat: float,
    lng: float,
    radius_km: float = 25,
    emergency_only: bool = False,
    db: Session = Depends(get_db)
):
    """Search for nearby food resources"""
    query = db.query(FoodInventory).filter(FoodInventory.is_available == True)
    
    if emergency_only:
        query = query.filter(FoodInventory.is_emergency_reserve == True)
    
    # Location-based filtering
    resources = query.filter(
        and_(
            FoodInventory.latitude.isnot(None),
            FoodInventory.longitude.isnot(None),
            FoodInventory.latitude.between(lat - radius_km/111, lat + radius_km/111),
            FoodInventory.longitude.between(lng - radius_km/111, lng + radius_km/111)
        )
    ).all()
    
    # Calculate distances and add to response
    nearby_resources = []
    for resource in resources:
        if resource.latitude and resource.longitude:
            # Simple distance calculation
            distance = ((lat - resource.latitude) ** 2 + (lng - resource.longitude) ** 2) ** 0.5 * 111
            if distance <= radius_km:
                resource_dict = {
                    "resource": resource,
                    "distance_km": round(distance, 2)
                }
                nearby_resources.append(resource_dict)
    
    # Sort by distance
    nearby_resources.sort(key=lambda x: x["distance_km"])
    
    return nearby_resources