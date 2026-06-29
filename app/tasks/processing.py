import logging
from uuid import UUID
from celery import shared_task
from app.database.session import SessionLocal
from app.models.job import Job, JobStatus

logger = logging.getLogger(__name__)

# Production retry logic: Exponential backoff on any unexpected exceptions.
# Max retries = 3. 
@shared_task(bind=True, max_retries=3, autoretry_for=(Exception,), retry_backoff=True)
def process_transaction_file(self, job_id: str, file_path: str):
    """
    Background Celery task to process the uploaded transactions CSV.
    """
    logger.info(f"Starting task for job {job_id} using file {file_path}")
    
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == UUID(job_id)).first()
        if not job:
            logger.error(f"Job {job_id} not found in database. Aborting task.")
            return

        # Mark job as processing
        job.status = JobStatus.PROCESSING
        db.commit()
        
        logger.info(f"Job {job_id} marked as PROCESSING.")
        
        # --- DATA PROCESSING (Step 6) ---
        from app.services.csv_cleaner import CSVCleaner
        from app.services.anomaly_detector import AnomalyDetector
        from app.services.transaction_importer import TransactionImporter
        
        # 1. Clean Data
        cleaner = CSVCleaner(file_path)
        df = cleaner.process()
        
        # Update raw/clean row counts early
        job.row_count_raw = cleaner.raw_row_count
        job.row_count_clean = cleaner.clean_row_count
        db.commit()

        # 2. Detect Anomalies
        detector = AnomalyDetector()
        df = detector.detect(df)

        # 3. Persist Transactions
        importer = TransactionImporter(db, job.id)
        stats = importer.persist(df)
        
        logger.info(f"Pipeline Stage 1 complete: Persisted {stats['persisted_count']} rows ({stats['anomaly_count']} anomalies) for job {job_id}.")
        
        # --- LLM PROCESSING (To be implemented in Step 7) ---
        
    except Exception as e:
        logger.exception(f"Unexpected error processing job {job_id}: {e}")
        # If we have exhausted all retries, permanently mark the job as FAILED
        if self.request.retries == self.max_retries:
            job = db.query(Job).filter(Job.id == UUID(job_id)).first()
            if job:
                job.status = JobStatus.FAILED
                job.error_message = str(e)
                db.commit()
                logger.error(f"Job {job_id} permanently marked as FAILED after max retries.")
        raise e
    finally:
        db.close()
