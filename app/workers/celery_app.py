import os
from celery import Celery
from app.core.config import settings

# Initialize Celery app
# We use Redis as both the message broker and the result backend.
celery_app = Celery(
    "txn_pipeline_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.processing"]
)

# Production-ready configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],  
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task state tracking
    task_track_started=True,
    
    # Hard limit on task execution time (1 hour)
    task_time_limit=3600, 
    
    # Ensures workers don't hoard tasks if they are long-running
    worker_prefetch_multiplier=1, 
    
    # Production reliability
    task_acks_late=True, # Acknowledge task only after it completes
    worker_max_tasks_per_child=50, # Prevent memory leaks
    broker_connection_retry_on_startup=True,
)
