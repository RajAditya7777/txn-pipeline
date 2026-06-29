from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, List, Any
from datetime import datetime

class TransactionResponse(BaseModel):
    txn_id: Optional[str] = None
    date: Optional[str] = None
    merchant: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    account_id: Optional[str] = None
    
    is_anomaly: bool
    anomaly_reason: Optional[str] = None
    
    llm_category: Optional[str] = None
    llm_raw_response: Optional[str] = None
    llm_failed: bool
    
    model_config = ConfigDict(from_attributes=True)

class JobSummaryResponse(BaseModel):
    total_spend_inr: Optional[float] = None
    total_spend_usd: Optional[float] = None
    top_merchants: Optional[Any] = None
    anomaly_count: int
    narrative: Optional[str] = None
    risk_level: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class JobResultsResponse(BaseModel):
    job_id: UUID
    summary: Optional[JobSummaryResponse] = None
    cleaned_transactions: List[TransactionResponse]
    anomalies: List[TransactionResponse]
