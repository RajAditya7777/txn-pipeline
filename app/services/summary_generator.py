import logging
from sqlalchemy.orm import Session
import uuid
import json
from app.models.transaction import Transaction
from app.models.job_summary import JobSummary
from app.services.gemini_client import GeminiClient
from pydantic import BaseModel
from typing import Literal

logger = logging.getLogger(__name__)

class SummaryResponse(BaseModel):
    narrative: str
    risk_level: Literal["low", "medium", "high", "unknown"]

class SummaryGenerator:
    """
    Service responsible for aggregating raw transaction statistics and 
    prompting Gemini to generate a cohesive narrative and risk assessment.
    """
    def __init__(self, db: Session, job_id: uuid.UUID):
        self.db = db
        self.job_id = job_id
        self.client = GeminiClient()

    def generate(self):
        """
        Executes the second LLM call of the pipeline.
        Creates the JobSummary record even if the LLM completely fails (graceful degradation).
        """
        txns = self.db.query(Transaction).filter(Transaction.job_id == self.job_id).all()
        
        # Deterministic operational calculations
        total_inr = sum(t.amount for t in txns if t.currency == 'INR' and t.amount)
        total_usd = sum(t.amount for t in txns if t.currency == 'USD' and t.amount)
        anomaly_count = sum(1 for t in txns if t.is_anomaly)
        
        # Calculate top merchants based on raw spend
        merchant_spend = {}
        for t in txns:
            if t.merchant and t.amount:
                merchant_spend[t.merchant] = merchant_spend.get(t.merchant, 0) + t.amount
                
        top_merchants = sorted(merchant_spend.items(), key=lambda x: x[1], reverse=True)[:3]
        top_merchants_list = [{"merchant": m, "spend": s} for m, s in top_merchants]
        
        prompt = f"""
Analyze this batch of transactions and provide a short spending narrative and a risk level.

Data Summary:
- Total INR Spend: {total_inr}
- Total USD Spend: {total_usd}
- Total Anomalies Flagged: {anomaly_count}
- Top 3 Merchants: {json.dumps(top_merchants_list)}

Provide a JSON output with:
1. "narrative": A 2-3 sentence spending narrative based on this data.
2. "risk_level": "low", "medium", or "high" (Base this heavily on the anomaly count and USD spend).
"""
        
        # Default fallbacks indicating LLM distress
        narrative = "The LLM was unable to generate a narrative for this job due to API constraints."
        risk_level = "unknown"
        
        try:
            import time
            start_time = time.time()
            result = self.client.generate_json(prompt)
            duration = time.time() - start_time
            logger.info(f"Gemini API generated summary in {duration:.2f}s")
            
            validated_response = SummaryResponse(**result)
            narrative = validated_response.narrative
            risk_level = validated_response.risk_level
        except Exception as e:
            logger.error(f"LLM summary generation permanently failed. Proceeding with fallbacks. Error: {e}")

        # Persist summary
        summary = JobSummary(
            job_id=self.job_id,
            total_spend_inr=total_inr,
            total_spend_usd=total_usd,
            top_merchants=top_merchants_list,
            anomaly_count=anomaly_count,
            narrative=narrative,
            risk_level=risk_level
        )
        self.db.add(summary)
        self.db.commit()
