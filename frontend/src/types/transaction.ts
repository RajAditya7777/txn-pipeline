export interface Transaction {
  id: string;
  txn_id: string | null;
  job_id: string;
  date: string | null;
  merchant: string | null;
  amount: number | null;
  currency: string | null;
  category: string | null;
  is_anomaly: boolean;
  anomaly_reason: string | null;
  llm_category: string | null;
  llm_failed: boolean;
  created_at: string;
}
