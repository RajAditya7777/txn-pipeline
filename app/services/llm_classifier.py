import logging
from sqlalchemy.orm import Session
import uuid
from app.models.transaction import Transaction
from app.services.gemini_client import GeminiClient
import json

logger = logging.getLogger(__name__)

class LLMClassifier:
    """
    Service responsible for extracting uncategorized transactions and batching them
    for LLM-based categorization without overwhelming the API with single-row calls.
    """
    def __init__(self, db: Session, job_id: uuid.UUID):
        self.db = db
        self.job_id = job_id
        self.client = GeminiClient()

    def classify_batch(self):
        """
        Isolates 'Uncategorised' rows, constructs a batch JSON payload, and forces
        Gemini to predict categories dynamically. Handles graceful degradation on total failure.
        """
        transactions = self.db.query(Transaction).filter(
            Transaction.job_id == self.job_id,
            Transaction.category == 'Uncategorised'
        ).all()
        
        if not transactions:
            logger.info("No uncategorized transactions found in this batch.")
            return

        logger.info(f"Batch classifying {len(transactions)} transactions via Gemini LLM.")
        
        # Construct payload specifically requested by interviewer
        txns_payload = []
        for txn in transactions:
            txns_payload.append({
                "txn_id": txn.txn_id or str(txn.id), 
                "merchant": txn.merchant,
                "amount": txn.amount,
                "notes": txn.anomaly_reason or ""
            })
            
        prompt = f"""
You are a financial categorization assistant. Assign one of the exact following categories to each transaction:
Food, Shopping, Travel, Transport, Utilities, Cash Withdrawal, Entertainment, Other.

Transactions:
{json.dumps(txns_payload, indent=2)}

Return a JSON object with a single key "categories" containing a list of objects.
Each object must have "txn_id" (matching the input exactly) and "category".
"""
        
        try:
            result = self.client.generate_json(prompt)
            categories_map = {str(item.get("txn_id")): item.get("category") for item in result.get("categories", [])}
            
            # Map predictions back to the database models
            for txn in transactions:
                ref_id = str(txn.txn_id or txn.id)
                assigned_cat = categories_map.get(ref_id)
                
                if assigned_cat:
                    txn.llm_category = assigned_cat
                    txn.category = assigned_cat 
                    txn.llm_raw_response = json.dumps(result)
                else:
                    logger.warning(f"No category returned for txn {ref_id}")
                    txn.llm_failed = True

        except Exception as e:
            # Graceful failure: Do not fail the entire job.
            logger.error(f"Batch LLM classification suffered total failure: {e}")
            for txn in transactions:
                txn.llm_failed = True
                txn.llm_raw_response = str(e)
                
        self.db.commit()
