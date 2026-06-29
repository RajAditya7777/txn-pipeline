from datetime import datetime, timezone
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base_class import Base

class JobSummary(Base):
    __tablename__ = "job_summary"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("job.id", ondelete="CASCADE"), index=True, unique=True)
    
    total_spend_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_spend_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # We use JSON as a generic type, but for Postgres it translates nicely. 
    # Using sqlalchemy.types.JSON for wider compatibility, though JSONB is also fine.
    top_merchants: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    
    anomaly_count: Mapped[int] = mapped_column(Integer, default=0)
    narrative: Mapped[str | None] = mapped_column(String, nullable=True)
    risk_level: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    job = relationship("Job", back_populates="summary")
