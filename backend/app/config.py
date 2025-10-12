from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    CLIENT_ID: str
    CLIENT_SECRET: str
    REDIRECT_URI: str
    SCOPE: str

    model_config = SettingsConfigDict(env_file="../.env")

@lru_cache
def get_settings():
    return Settings()
