"""
Configuration – reads settings from .env or environment variables.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    chroma_db_path: str = "./chroma_db"
    docs_path: str = "./docs"

    cors_origins_raw: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]

    class Config:
        env_prefix = ""
        # Map CORS_ORIGINS env var → cors_origins_raw field
        fields = {
            "cors_origins_raw": {"env": "CORS_ORIGINS"},
        }


settings = Settings()
