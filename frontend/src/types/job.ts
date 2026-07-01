export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  job_id: string;
  filename: string;
  status: JobStatus;
  row_count_raw: number | null;
  row_count_clean: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface JobSummary {
  id: string;
  job_id: string;
  total_spend_inr: number;
  total_spend_usd: number;
  anomaly_count: number;
  risk_level: 'low' | 'medium' | 'high' | 'unknown';
  narrative: string;
  top_merchants: Array<{ merchant: string; spend: number }>;
  created_at: string;
}

import type { Transaction } from './transaction';

export interface JobResultsResponse {
  job_id: string;
  summary: JobSummary | null;
  cleaned_transactions: Transaction[];
  anomalies: Transaction[];
}
