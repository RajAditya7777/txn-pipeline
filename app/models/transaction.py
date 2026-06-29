import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base_class import Base

class Transaction(Base):
    __tablename__ = "transaction"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("job.id", ondelete="CASCADE"), index=True)
    
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
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="transactions")

    __table_args__ = (
        Index("ix_transaction_job_id_status", "job_id", "status"),
    )
