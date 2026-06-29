import uuid
import logging
import os
import shutil
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.job import Job, JobStatus
from app.models.transaction import Transaction
from app.models.job_summary import JobSummary

logger = logging.getLogger(__name__)

class JobService:
    @staticmethod
    def create_job(db: Session, file: UploadFile) -> Job:
        if not file.filename.endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
        
        # Save file to a shared location for the worker to pick up
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{uuid.uuid4()}_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        job = Job(
            filename=file.filename,
            status=JobStatus.PENDING
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        logger.info(f"Created Job {job.id} for file {file.filename}")
        
        # TODO: Enqueue Celery task (Implemented in Step 5)
        # from app.tasks.processing import process_transaction_file
        # process_transaction_file.delay(str(job.id), file_path)
        
        return job

    @staticmethod
    def get_jobs(db: Session, status_filter: str | None = None) -> list[Job]:
        query = db.query(Job)
        if status_filter:
            try:
                status_enum = JobStatus(status_filter)
                query = query.filter(Job.status == status_enum)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status_filter}")
        return query.order_by(Job.created_at.desc()).all()
        
    @staticmethod
    def get_job_status(db: Session, job_id: uuid.UUID) -> Job:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job

    @staticmethod
    def get_job_results(db: Session, job_id: uuid.UUID) -> dict:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if job.status != JobStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Job results are only available when completed.")
            
        summary = db.query(JobSummary).filter(JobSummary.job_id == job_id).first()
        transactions = db.query(Transaction).filter(Transaction.job_id == job_id).all()
        
        cleaned_transactions = [t for t in transactions if not t.is_anomaly]
        anomalies = [t for t in transactions if t.is_anomaly]
        
        return {
            "job_id": job.id,
            "summary": summary,
            "cleaned_transactions": cleaned_transactions,
            "anomalies": anomalies
        }
