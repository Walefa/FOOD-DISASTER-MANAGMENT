from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn

from app.core.config import settings
from app.api.v1 import api_router
from app.db.session import engine
from app.db.base import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Climate Resilience & Food Security Platform",
    description="""
    A comprehensive platform for climate disaster preparedness and food system resilience.
    
    ## Key Features
    
    * **Disaster Alerts**: Real-time climate disaster monitoring and notifications
    * **Food Security**: Track food availability, distribution, and shortages
    * **Emergency Inventory**: Manage emergency food supplies and resources
    * **Vulnerability Assessment**: Assess and map community climate risks
    * **Resource Coordination**: Connect donors, NGOs, and affected communities
    * **Predictive Analytics**: AI-powered climate impact and food shortage forecasting
    
    ## Use Cases
    
    * Monitor approaching climate disasters (floods, droughts, storms)
    * Coordinate emergency food distribution
    * Assess community vulnerability to climate impacts
    * Predict and prevent food shortages
    * Optimize resource allocation during emergencies
    * Track recovery progress post-disaster
    """,
    version="1.0.0",
    openapi_tags=[
        {
            "name": "auth",
            "description": "Authentication and user management"
        },
        {
            "name": "disasters",
            "description": "Climate disaster monitoring and alerts"
        },
        {
            "name": "food-security",
            "description": "Food availability and distribution tracking"
        },
        {
            "name": "inventory",
            "description": "Emergency inventory management"
        },
        {
            "name": "vulnerability",
            "description": "Community vulnerability assessment"
        },
        {
            "name": "analytics",
            "description": "Predictive analytics and forecasting"
        },
        {
            "name": "coordination",
            "description": "Resource and response coordination"
        },
        {
            "name": "real-time",
            "description": "Real-time notifications and WebSocket communication"
        }
    ]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["root"])
async def root():
    """Welcome endpoint with platform overview"""
    return {
        "message": "Climate Resilience & Food Security Platform",
        "version": "1.0.0",
        "description": "Innovative platform for climate disaster preparedness and food system resilience",
        "features": [
            "Real-time disaster monitoring",
            "Food security tracking",
            "Emergency inventory management",
            "Vulnerability assessment",
            "Predictive analytics",
            "Resource coordination"
        ],
        "documentation": "/docs",
        "api_base": "/api/v1"
    }

@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )