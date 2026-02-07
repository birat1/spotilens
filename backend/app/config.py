from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings."""

    CLIENT_ID: str
    CLIENT_SECRET: str
    REDIRECT_URI: str
    SCOPE: str
    SESSION_SECRET: str
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file="../.env")

@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
