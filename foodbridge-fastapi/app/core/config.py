from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Climate Resilience & Food Security Platform"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "sqlite:///./climate_food_security.db"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # External APIs
    WEATHER_API_KEY: str = ""
    DISASTER_API_KEY: str = ""
    
    # Redis for caching and background tasks
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # ML Model paths
    VULNERABILITY_MODEL_PATH: str = "./models/vulnerability_model.pkl"
    FOOD_SHORTAGE_MODEL_PATH: str = "./models/food_shortage_model.pkl"
    
    # Notification settings
    EMAIL_ENABLED: bool = False
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # SMS notifications
    SMS_ENABLED: bool = False
    SMS_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()