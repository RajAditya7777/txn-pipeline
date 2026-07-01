import React from 'react';
import type { JobSummary } from '../types/job';
import { Loader2, AlertCircle, FileText } from 'lucide-react';

interface SummaryCardProps {
  summary: JobSummary | null;
  loading?: boolean;
  error?: string | null;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, loading, error }) => {
  if (loading && !summary) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Generating LLM narrative...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center min-h-[300px] bg-red-50 border-red-200">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm font-medium text-red-800">Error loading summary</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center min-h-[300px] bg-slate-50 border-dashed">
        <FileText className="w-8 h-8 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">Summary is not available yet.</p>
      </div>
    );
  }

  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
    unknown: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const riskBadgeClass = riskColors[summary.risk_level] || riskColors.unknown;

  return (
    <div className="card p-6 transition-opacity duration-300 opacity-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Financial Summary</h2>
        <span className={`px-3 py-1 uppercase tracking-wider text-xs font-bold rounded-full border ${riskBadgeClass}`}>
          {summary.risk_level} Risk
        </span>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Narrative</h3>
        <p className="text-slate-700 leading-relaxed text-sm mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          {summary.narrative}
        </p>

        <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Top Merchants</h3>
        <div className="space-y-2 flex-1">
          {summary.top_merchants.map((merchant, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
              <span className="font-medium text-slate-700 text-sm">{merchant.merchant}</span>
              <span className="text-slate-800 text-sm font-semibold">
                ₹{merchant.spend.toLocaleString()}
              </span>
            </div>
          ))}
          {summary.top_merchants.length === 0 && (
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-sm text-slate-400 italic">No merchant data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
