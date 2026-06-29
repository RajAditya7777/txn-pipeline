from datetime import datetime, timezone
from sqlalchemy import Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base_class import Base

class Transaction(Base):
    __tablename__ = "transaction"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("job.id", ondelete="CASCADE"), index=True)
    
    txn_id: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    date: Mapped[str | None] = mapped_column(String, nullable=True)  # Normalized to ISO 8601 string
    merchant: Mapped[str | None] = mapped_column(String, nullable=True)
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    account_id: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    
    # Anomaly fields
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_reason: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # LLM classification fields
    llm_category: Mapped[str | None] = mapped_column(String, nullable=True)
    llm_raw_response: Mapped[str | None] = mapped_column(String, nullable=True)
    llm_failed: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    job = relationship("Job", back_populates="transactions")
