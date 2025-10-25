from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from app.db.session import get_db
from app.api.v1.auth import get_current_user
from app.models import (
    DisasterAlert, FoodInventory, VulnerabilityAssessment, 
    FoodDistribution, User, DisasterType, AlertSeverity, VulnerabilityLevel
)
from app.schemas import ClimateRisk, FoodShortageRisk, DashboardMetrics, ResourceAllocation
import random

router = APIRouter()

@router.get("/dashboard", response_model=DashboardMetrics)
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get comprehensive dashboard metrics"""
    # Active disaster alerts
    active_alerts = db.query(DisasterAlert).filter(DisasterAlert.is_active == True).count()
    
    # Total food inventory
    total_food_kg = db.query(func.sum(FoodInventory.quantity)).filter(
        and_(
            FoodInventory.is_available == True,
            FoodInventory.unit.in_(['kg', 'kilograms'])
        )
    ).scalar() or 0
    
    # Communities assessed
    communities_assessed = db.query(VulnerabilityAssessment).count()
    
    # Upcoming food distributions
    upcoming_distributions = db.query(FoodDistribution).filter(
        and_(
            FoodDistribution.scheduled_date >= datetime.utcnow(),
            FoodDistribution.status.in_(['planned', 'ongoing'])
        )
    ).count()
    
    # High-risk communities
    high_risk_communities = db.query(VulnerabilityAssessment).filter(
        VulnerabilityAssessment.overall_vulnerability.in_([VulnerabilityLevel.HIGH, VulnerabilityLevel.VERY_HIGH])
    ).count()
    
    # Emergency reserves running low
    low_reserves = db.query(FoodInventory).filter(
        and_(
            FoodInventory.is_emergency_reserve == True,
            FoodInventory.is_available == True,
            FoodInventory.quantity < 100  # Assuming 100 units is low threshold
        )
    ).count()
    
    return DashboardMetrics(
        active_alerts=active_alerts,
        total_food_inventory_kg=float(total_food_kg),
        communities_assessed=communities_assessed,
        upcoming_distributions=upcoming_distributions,
        high_risk_communities=high_risk_communities,
        emergency_reserves_low=low_reserves
    )

@router.get("/climate-risk-forecast")
async def get_climate_risk_forecast(
    lat: Optional[float] = Query(None, description="Latitude for location-specific forecast"),
    lng: Optional[float] = Query(None, description="Longitude for location-specific forecast"),
    days_ahead: int = Query(7, description="Number of days to forecast")
) -> List[ClimateRisk]:
    """Get AI-powered climate risk forecast (simplified simulation)"""
    # This is a simplified simulation - in production, integrate with:
    # - Weather APIs (OpenWeatherMap, NOAA)
    # - Climate models
    # - Machine learning predictions
    
    risks = []
    
    # Simulate different disaster types with varying probabilities
    disaster_probabilities = {
        DisasterType.FLOOD: 0.15,
        DisasterType.DROUGHT: 0.25,
        DisasterType.EXTREME_HEAT: 0.30,
        DisasterType.HURRICANE: 0.10,
        DisasterType.WILDFIRE: 0.08
    }
    
    for disaster_type, base_probability in disaster_probabilities.items():
        # Add some randomness and seasonal factors
        adjusted_probability = base_probability + (random.random() - 0.5) * 0.2
        adjusted_probability = max(0, min(1, adjusted_probability))
        
        if adjusted_probability > 0.1:  # Only include significant risks
            severity = AlertSeverity.LOW
            if adjusted_probability > 0.3:
                severity = AlertSeverity.MEDIUM
            if adjusted_probability > 0.6:
                severity = AlertSeverity.HIGH
            if adjusted_probability > 0.8:
                severity = AlertSeverity.CRITICAL
            
            confidence = 0.6 + (random.random() * 0.3)  # 60-90% confidence
            timeframe = random.randint(1, days_ahead)
            
            risks.append(ClimateRisk(
                disaster_type=disaster_type,
                probability=round(adjusted_probability, 2),
                severity=severity,
                timeframe_days=timeframe,
                confidence=round(confidence, 2)
            ))
    
    return sorted(risks, key=lambda x: x.probability, reverse=True)

@router.get("/food-shortage-risk")
async def get_food_shortage_risk_analysis(
    location: Optional[str] = None,
    radius_km: Optional[float] = 50,
    db: Session = Depends(get_db)
) -> List[FoodShortageRisk]:
    """Analyze food shortage risk for communities"""
    # Get vulnerability assessments
    query = db.query(VulnerabilityAssessment)
    
    if location:
        query = query.filter(VulnerabilityAssessment.location.ilike(f"%{location}%"))
    
    assessments = query.all()
    
    shortage_risks = []
    for assessment in assessments:
        # Calculate shortage risk based on multiple factors
        risk_factors = []
        
        # Food security score (lower = higher risk)
        if assessment.food_security_score:
            food_risk = (100 - assessment.food_security_score) / 100
            risk_factors.append(food_risk)
        
        # Climate vulnerability
        climate_risks = [
            assessment.flood_risk,
            assessment.drought_risk,
            assessment.extreme_weather_risk
        ]
        climate_risk_avg = sum(_vulnerability_to_numeric(risk) for risk in climate_risks) / len(climate_risks)
        risk_factors.append(climate_risk_avg / 100)
        
        # Socioeconomic factors
        if assessment.poverty_rate:
            risk_factors.append(assessment.poverty_rate / 100)
        
        # Calculate overall risk
        if risk_factors:
            overall_risk = sum(risk_factors) / len(risk_factors)
            risk_level = _risk_to_vulnerability_level(overall_risk)
            estimated_shortage = min(80, overall_risk * 100)  # Cap at 80%
            
            # Generate recommendations
            recommendations = _generate_food_security_recommendations(assessment, overall_risk)
            
            # Estimate timeframe based on risk level
            timeframe = 30 if risk_level == VulnerabilityLevel.VERY_HIGH else 60 if risk_level == VulnerabilityLevel.HIGH else 90
            
            shortage_risks.append(FoodShortageRisk(
                location=f"{assessment.community_name}, {assessment.location}",
                risk_level=risk_level,
                estimated_shortage_percent=round(estimated_shortage, 1),
                timeframe_days=timeframe,
                recommended_actions=recommendations
            ))
    
    # Sort by risk level (highest first)
    risk_order = {
        VulnerabilityLevel.VERY_HIGH: 4,
        VulnerabilityLevel.HIGH: 3,
        VulnerabilityLevel.MEDIUM: 2,
        VulnerabilityLevel.LOW: 1
    }
    
    return sorted(shortage_risks, key=lambda x: risk_order.get(x.risk_level, 0), reverse=True)

@router.get("/resource-allocation")
async def get_resource_allocation_analysis(
    disaster_alert_id: Optional[int] = None,
    lat: Optional[float] = Query(None, description="Target area latitude"),
    lng: Optional[float] = Query(None, description="Target area longitude"),
    radius_km: float = Query(25, description="Analysis radius in kilometers"),
    db: Session = Depends(get_db)
) -> List[ResourceAllocation]:
    """Analyze optimal resource allocation for disaster response"""
    allocations = []
    
    # If disaster alert is specified, get its location
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
    
    # Find vulnerable communities in the area
    vulnerable_communities = db.query(VulnerabilityAssessment).filter(
        and_(
            VulnerabilityAssessment.latitude.between(lat - radius_km/111, lat + radius_km/111),
            VulnerabilityAssessment.longitude.between(lng - radius_km/111, lng + radius_km/111),
            VulnerabilityAssessment.overall_vulnerability.in_([
                VulnerabilityLevel.MEDIUM, 
                VulnerabilityLevel.HIGH, 
                VulnerabilityLevel.VERY_HIGH
            ])
        )
    ).all()
    
    # Find available food resources in the area
    available_food = db.query(FoodInventory).filter(
        and_(
            FoodInventory.is_available == True,
            FoodInventory.latitude.isnot(None),
            FoodInventory.longitude.isnot(None),
            FoodInventory.latitude.between(lat - radius_km*2/111, lat + radius_km*2/111),
            FoodInventory.longitude.between(lng - radius_km*2/111, lng + radius_km*2/111)
        )
    ).all()
    
    for community in vulnerable_communities:
        # Estimate food needs based on population and vulnerability
        population = community.population or 1000  # Default estimate
        
        # Calculate daily food requirement (assuming 2kg per person per day)
        daily_food_kg = population * 2
        
        # Adjust based on vulnerability level
        vulnerability_multiplier = {
            VulnerabilityLevel.MEDIUM: 1.2,
            VulnerabilityLevel.HIGH: 1.5,
            VulnerabilityLevel.VERY_HIGH: 2.0
        }
        
        required_food = daily_food_kg * vulnerability_multiplier.get(
            community.overall_vulnerability, 1.0
        ) * 7  # One week supply
        
        # Find nearby food sources
        nearby_food = []
        for food_item in available_food:
            distance = _calculate_simple_distance(
                community.latitude, community.longitude,
                food_item.latitude, food_item.longitude
            )
            if distance <= radius_km * 1.5:  # Extend search radius for sources
                nearby_food.append({
                    'item': food_item,
                    'distance': distance
                })
        
        # Calculate available food
        available_kg = sum(
            item['item'].quantity for item in nearby_food 
            if item['item'].unit in ['kg', 'kilograms']
        )
        
        gap_kg = max(0, required_food - available_kg)
        
        # Determine priority based on vulnerability and gap
        if community.overall_vulnerability == VulnerabilityLevel.VERY_HIGH:
            priority = AlertSeverity.CRITICAL
        elif community.overall_vulnerability == VulnerabilityLevel.HIGH or gap_kg > required_food * 0.5:
            priority = AlertSeverity.HIGH
        elif gap_kg > required_food * 0.25:
            priority = AlertSeverity.MEDIUM
        else:
            priority = AlertSeverity.LOW
        
        # Recommend sources
        recommended_sources = []
        if gap_kg > 0:
            # Sort nearby food by distance and availability
            sorted_sources = sorted(nearby_food, key=lambda x: x['distance'])
            for source in sorted_sources[:3]:  # Top 3 closest sources
                recommended_sources.append(
                    f"{source['item'].owner_organization or 'Unknown'} - "
                    f"{source['item'].location} ({source['distance']:.1f}km)"
                )
        
        allocations.append(ResourceAllocation(
            location=f"{community.community_name}, {community.location}",
            priority=priority,
            required_food_kg=round(required_food, 1),
            available_food_kg=round(available_kg, 1),
            gap_kg=round(gap_kg, 1),
            recommended_sources=recommended_sources
        ))
    
    # Sort by priority
    priority_order = {
        AlertSeverity.CRITICAL: 4,
        AlertSeverity.HIGH: 3,
        AlertSeverity.MEDIUM: 2,
        AlertSeverity.LOW: 1
    }
    
    return sorted(allocations, key=lambda x: priority_order.get(x.priority, 0), reverse=True)

@router.get("/trends/climate-impact")
async def get_climate_impact_trends(
    months_back: int = Query(12, description="Number of months to analyze"),
    db: Session = Depends(get_db)
):
    """Analyze climate impact trends over time"""
    # Get disaster alerts over time
    start_date = datetime.utcnow() - timedelta(days=months_back * 30)
    
    alerts = db.query(DisasterAlert).filter(
        DisasterAlert.created_at >= start_date
    ).all()
    
    # Group by month and disaster type
    monthly_trends = {}
    for alert in alerts:
        month_key = alert.created_at.strftime('%Y-%m')
        if month_key not in monthly_trends:
            monthly_trends[month_key] = {}
        
        disaster_type = alert.disaster_type.value
        if disaster_type not in monthly_trends[month_key]:
            monthly_trends[month_key][disaster_type] = 0
        monthly_trends[month_key][disaster_type] += 1
    
    # Calculate food distribution trends
    distributions = db.query(FoodDistribution).filter(
        FoodDistribution.scheduled_date >= start_date
    ).all()
    
    distribution_trends = {}
    for dist in distributions:
        month_key = dist.scheduled_date.strftime('%Y-%m')
        if month_key not in distribution_trends:
            distribution_trends[month_key] = {
                'events': 0,
                'beneficiaries': 0,
                'food_distributed_kg': 0
            }
        
        distribution_trends[month_key]['events'] += 1
        distribution_trends[month_key]['beneficiaries'] += dist.actual_beneficiaries or 0
        distribution_trends[month_key]['food_distributed_kg'] += dist.total_weight_kg or 0
    
    return {
        "analysis_period_months": months_back,
        "disaster_trends": monthly_trends,
        "food_distribution_trends": distribution_trends,
        "summary": {
            "total_disasters": len(alerts),
            "total_distributions": len(distributions),
            "most_common_disaster": _get_most_common_disaster(alerts),
            "trend_direction": _analyze_trend_direction(monthly_trends)
        }
    }

# Helper functions
def _vulnerability_to_numeric(vulnerability: VulnerabilityLevel) -> float:
    """Convert vulnerability level to numeric value"""
    mapping = {
        VulnerabilityLevel.LOW: 25,
        VulnerabilityLevel.MEDIUM: 50,
        VulnerabilityLevel.HIGH: 75,
        VulnerabilityLevel.VERY_HIGH: 100
    }
    return mapping.get(vulnerability, 50)

def _risk_to_vulnerability_level(risk_score: float) -> VulnerabilityLevel:
    """Convert risk score to vulnerability level"""
    if risk_score >= 0.75:
        return VulnerabilityLevel.VERY_HIGH
    elif risk_score >= 0.6:
        return VulnerabilityLevel.HIGH
    elif risk_score >= 0.4:
        return VulnerabilityLevel.MEDIUM
    else:
        return VulnerabilityLevel.LOW

def _generate_food_security_recommendations(assessment: VulnerabilityAssessment, risk_score: float) -> List[str]:
    """Generate food security recommendations"""
    recommendations = []
    
    if risk_score > 0.7:
        recommendations.append("Establish emergency food distribution centers")
        recommendations.append("Create community food banks")
        recommendations.append("Implement early warning systems for food shortages")
    
    if assessment.drought_risk in [VulnerabilityLevel.HIGH, VulnerabilityLevel.VERY_HIGH]:
        recommendations.append("Develop drought-resistant crop varieties")
        recommendations.append("Implement water conservation measures")
    
    if assessment.poverty_rate and assessment.poverty_rate > 50:
        recommendations.append("Provide food vouchers or cash transfer programs")
        recommendations.append("Support local food production initiatives")
    
    if assessment.road_access_quality and assessment.road_access_quality < 5:
        recommendations.append("Improve transportation infrastructure for food delivery")
    
    return recommendations

def _calculate_simple_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate simple distance between coordinates"""
    return ((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2) ** 0.5 * 111  # Rough km conversion

def _get_most_common_disaster(alerts: List) -> str:
    """Get the most common disaster type"""
    if not alerts:
        return "None"
    
    disaster_counts = {}
    for alert in alerts:
        disaster_type = alert.disaster_type.value
        disaster_counts[disaster_type] = disaster_counts.get(disaster_type, 0) + 1
    
    return max(disaster_counts, key=disaster_counts.get) if disaster_counts else "None"

def _analyze_trend_direction(monthly_trends: Dict) -> str:
    """Analyze if disaster trends are increasing, decreasing, or stable"""
    if len(monthly_trends) < 2:
        return "Insufficient data"
    
    months = sorted(monthly_trends.keys())
    total_counts = [sum(monthly_trends[month].values()) for month in months]
    
    if len(total_counts) < 2:
        return "Stable"
    
    # Simple trend analysis
    recent_avg = sum(total_counts[-3:]) / min(3, len(total_counts[-3:]))
    earlier_avg = sum(total_counts[:3]) / min(3, len(total_counts[:3]))
    
    if recent_avg > earlier_avg * 1.2:
        return "Increasing"
    elif recent_avg < earlier_avg * 0.8:
        return "Decreasing" 
    else:
        return "Stable"