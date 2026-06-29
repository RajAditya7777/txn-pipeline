import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.job import JobCreateResponse, JobStatusResponse, JobListResponse
from app.schemas.transaction import JobResultsResponse
from app.services.job_service import JobService

router = APIRouter()

@router.post("/upload", response_model=JobCreateResponse, status_code=202)
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file of transactions to be processed asynchronously.
    """
    job = JobService.create_job(db, file)
    return JobCreateResponse(job_id=job.id, message="File uploaded successfully and job queued.")

@router.get("/", response_model=List[JobListResponse])
def list_jobs(
    status: Optional[str] = Query(None, description="Filter jobs by status"),
    db: Session = Depends(get_db)
):
    """
    List all processing jobs, with optional status filtering.
    """
    jobs = JobService.get_jobs(db, status_filter=status)
    return [{"job_id": j.id, "filename": j.filename, "status": j.status, "row_count_raw": j.row_count_raw, "created_at": j.created_at} for j in jobs]

@router.get("/{job_id}/status", response_model=JobStatusResponse)
def get_job_status(
    job_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Get the current processing status of a specific job.
    """
    job = JobService.get_job_status(db, job_id)
    return {
        "job_id": job.id,
        "status": job.status,
        "created_at": job.created_at,
        "completed_at": job.completed_at,
        "row_count_raw": job.row_count_raw,
        "row_count_clean": job.row_count_clean,
        "error_message": job.error_message
    }

@router.get("/{job_id}/results", response_model=JobResultsResponse)
def get_job_results(
    job_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Get the final structured output (cleaned transactions, anomalies, summary) for a completed job.
    """
    return JobService.get_job_results(db, job_id)
