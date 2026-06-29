from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.models.job import JobStatus

class JobBase(BaseModel):
    filename: str

class JobCreateResponse(BaseModel):
    job_id: UUID
    message: str

class JobStatusResponse(BaseModel):
    job_id: UUID
    status: JobStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    row_count_raw: Optional[int] = None
    row_count_clean: Optional[int] = None
    error_message: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class JobListResponse(BaseModel):
    job_id: UUID
    filename: str
    status: JobStatus
    row_count_raw: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
