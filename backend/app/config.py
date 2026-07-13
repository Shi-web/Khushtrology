from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    groq_api_key: str
    stripe_secret_key: str
    stripe_webhook_secret: str
    frontend_url: str = "http://localhost:5173"
    supabase_url: Optional[str] = None
    supabase_service_key: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
