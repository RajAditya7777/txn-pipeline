from functools import lru_cache
from typing import Any, Optional

from pydantic import field_validator
from pydantic_core.core_schema import ValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings and environment variables.
    
    Using Pydantic's BaseSettings to automatically read from environment variables.
    The variables are loaded from a .env file if it exists in the current directory.
    """

    # Application Setup
    PROJECT_NAME: str = "AI Transaction Processing Pipeline"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str

    # PostgreSQL Connection Configuration
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> Any:
        """
        Assemble the database connection URI from other parts if it isn't provided directly.
        This provides a single source of truth for the database connection string.
        """
        if isinstance(v, str):
            return v
        
        values = info.data
        user = values.get("POSTGRES_USER")
        password = values.get("POSTGRES_PASSWORD")
        server = values.get("POSTGRES_SERVER")
        port = values.get("POSTGRES_PORT")
        db = values.get("POSTGRES_DB")

        if not all([user, password, server, port, db]):
            # Avoid failing prematurely if not all config is present during tests/build
            return None

        # Build postgresql+psycopg2 DSN for SQLAlchemy
        return f"postgresql+psycopg2://{user}:{password}@{server}:{port}/{db}"

    # Redis Connection Configuration
    REDIS_URL: str = "redis://localhost:6379/0"

    # LLM Configuration (Gemini API)
    GEMINI_API_KEY: str

    # Configure how Pydantic should read the environment variables
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Load and cache settings. 
    `lru_cache` ensures the settings are only parsed and validated once at application startup.
    """
    return Settings()

# Instantiate settings once to be imported throughout the project
settings = get_settings()
