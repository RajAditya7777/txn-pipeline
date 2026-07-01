import React from 'react';
import type { Job, JobStatus } from '../types/job';
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

interface StatusCardProps {
  job: Job | null;
  loading?: boolean;
  error?: string | null;
}

const getStatusBadge = (status: JobStatus) => {
  const normStatus = status?.toLowerCase();
  switch (normStatus) {
    case 'pending':
      return <span className="badge badge-pending flex items-center gap-1.5"><Clock className="w-3 h-3" /> Pending</span>;
    case 'processing':
      return <span className="badge badge-processing flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>;
    case 'completed':
      return <span className="badge badge-completed flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
    case 'failed':
      return <span className="badge badge-failed flex items-center gap-1.5"><XCircle className="w-3 h-3" /> Failed</span>;
    default:
      return null;
  }
};



export const StatusCard: React.FC<StatusCardProps> = ({ job, loading, error }) => {
  if (loading && !job) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Loading job status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center min-h-[220px] bg-red-50 border-red-200">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm font-medium text-red-800">Error fetching status</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center min-h-[220px] bg-slate-50 border-dashed">
        <Clock className="w-8 h-8 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">No active job. Upload a CSV to begin.</p>
      </div>
    );
  }

  return (
    <div className="card p-6 transition-opacity duration-300 ease-in-out opacity-100 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Job Status</h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">ID: {job.job_id}</p>
        </div>
        <div>
          {getStatusBadge(job.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm flex-1">
        <div>
          <p className="text-slate-500 mb-1 text-xs uppercase tracking-wide font-medium">Created At</p>
          <p className="font-medium text-slate-800">{formatDate(job.created_at)}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-1 text-xs uppercase tracking-wide font-medium">Completed At</p>
          <p className="font-medium text-slate-800">{formatDate(job.completed_at)}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-1 text-xs uppercase tracking-wide font-medium">Raw Rows</p>
          <p className="font-medium text-slate-800 text-lg">{job.row_count_raw ?? '-'}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-1 text-xs uppercase tracking-wide font-medium">Clean Rows</p>
          <p className="font-medium text-slate-800 text-lg">{job.row_count_clean ?? '-'}</p>
        </div>
      </div>

      {job.status?.toLowerCase() === 'failed' && job.error_message && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Processing Failed</p>
            <p className="text-sm text-red-700 mt-1 break-words">{job.error_message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
