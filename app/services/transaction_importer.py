import uuid
import pandas as pd
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.transaction import Transaction

class TransactionImporter:
    """
    Service responsible for securely persisting clean and anomalous transaction data to PostgreSQL.
    """
    
    def __init__(self, db: Session, job_id: uuid.UUID):
        self.db = db
        self.job_id = job_id

    def persist(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Phase: Persist transactions and return operational statistics.
        """
        transactions = []
        
        for _, row in df.iterrows():
            txn = Transaction(
                job_id=self.job_id,
                txn_id=str(row['txn_id']) if not pd.isna(row.get('txn_id')) else None,
                date=str(row['date']) if not pd.isna(row.get('date')) else None,
                merchant=str(row['merchant']) if not pd.isna(row.get('merchant')) else None,
                amount=float(row['amount']) if not pd.isna(row.get('amount')) else None,
                currency=str(row['currency']) if not pd.isna(row.get('currency')) else None,
                status=str(row['status']) if not pd.isna(row.get('status')) else None,
                category=str(row['category']) if not pd.isna(row.get('category')) else None,
                account_id=str(row['account_id']) if not pd.isna(row.get('account_id')) else None,
                is_anomaly=bool(row.get('is_anomaly', False)),
                anomaly_reason=str(row['anomaly_reason']) if not pd.isna(row.get('anomaly_reason')) else None
            )
            transactions.append(txn)
            
        # Bulk save for better performance
        self.db.add_all(transactions)
        self.db.commit()
        
        anomaly_count = int(df['is_anomaly'].sum()) if 'is_anomaly' in df.columns else 0
        
        return {
            "persisted_count": len(transactions),
            "anomaly_count": anomaly_count
        }
