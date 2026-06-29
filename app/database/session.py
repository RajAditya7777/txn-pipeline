from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create the SQLAlchemy engine. 
# We use pool_pre_ping=True to ensure connections are alive before using them.
# The fallback to sqlite is just to prevent crashes during initialization if URI is completely missing.
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI or "sqlite:///:memory:",
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency to generate database sessions per request.
    Yields a session and automatically closes it when the request is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
