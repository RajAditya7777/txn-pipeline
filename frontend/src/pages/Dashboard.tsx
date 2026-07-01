import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UploadCard } from '../components/UploadCard';
import { StatusCard } from '../components/StatusCard';
import { StatsGrid } from '../components/StatsGrid';
import { SummaryCard } from '../components/SummaryCard';
import { Charts } from '../components/Charts';
import { TransactionTable } from '../components/TransactionTable';
import { useJobPolling } from '../hooks/useJobPolling';
import api from '../services/api';
import type { JobResultsResponse } from '../types/job';
import { CheckCircle, Info, X, RefreshCw, AlertCircle, Play } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const TimelineStep = ({ label, active, completed, isLast }: { label: string, active: boolean, completed: boolean, isLast?: boolean }) => (
  <div className="flex items-center">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border-2 
        ${completed ? 'bg-blue-600 border-blue-600 text-white' : 
          active ? 'border-blue-600 bg-white text-blue-600' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>
        {completed ? <CheckCircle className="w-5 h-5" /> : active ? <Play className="w-4 h-4 fill-current" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
      </div>
      <span className={`text-xs mt-2 font-medium ${active || completed ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
    </div>
    {!isLast && (
      <div className={`h-1 w-12 sm:w-24 mx-2 -mt-6 transition-colors ${completed ? 'bg-blue-600' : 'bg-slate-200'}`} />
    )}
  </div>
);

export const Dashboard: React.FC = () => {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const { job, error: pollingError, resumePolling } = useJobPolling(currentJobId);
  
  const [results, setResults] = useState<JobResultsResponse | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'error') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, message, type }]);
    
    if (type !== 'error') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleJobCreated = useCallback((jobId: string) => {
    setCurrentJobId(jobId);
    setResults(null);
    setResultsError(null);
    addNotification('File uploaded successfully.', 'success');
  }, [addNotification]);

  const fetchResults = useCallback(async (id: string) => {
    setResultsLoading(true);
    setResultsError(null);
    try {
      const response = await api.get<JobResultsResponse>(`/jobs/${id}/results`);
      setResults(response.data);
      addNotification('Results loaded.', 'success');
    } catch (err: any) {
      setResultsError(err.response?.data?.detail || err.message || 'Failed to fetch results');
    } finally {
      setResultsLoading(false);
    }
  }, [addNotification]);

  // Handle status transitions
  useEffect(() => {
    const status = job?.status?.toLowerCase();
    if (status === 'processing') {
      addNotification('Processing started.', 'info');
    } else if (status === 'completed') {
      addNotification('Processing completed successfully.', 'success');
      if (currentJobId && !resultsLoading && !results) {
        fetchResults(currentJobId);
      }
    } else if (status === 'failed') {
      addNotification('Processing failed.', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status]); 
  // Omit fetchResults, currentJobId, results, resultsLoading to prevent infinite loops from object references

  const status = job?.status?.toLowerCase();
  const isUploaded = !!currentJobId;
  const isQueued = isUploaded && (status === 'pending' || status === 'processing' || status === 'completed' || status === 'failed');
  const isProcessing = status === 'processing' || status === 'completed';
  const isCompleted = status === 'completed';
  
  const allTxns = useMemo(() => {
    if (!results) return [];
    return [...(results.cleaned_transactions || []), ...(results.anomalies || [])];
  }, [results]);

  const summary = results?.summary || null;
  const totalTxns = allTxns.length;
  const cleanTxns = results?.cleaned_transactions?.length || 0;
  const anomaliesCount = results?.anomalies?.length || 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Notifications Area */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md w-full" role="alert" aria-live="assertive">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-lg shadow-lg flex items-start gap-3 border ${
              n.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              n.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {n.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> :
               n.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> :
               <Info className="w-5 h-5 shrink-0 mt-0.5" />}
              <p className="flex-1 text-sm font-medium leading-relaxed">{n.message}</p>
              <button 
                onClick={() => removeNotification(n.id)} 
                className="shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Global Error Actions */}
      {(pollingError || resultsError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Error: {pollingError || resultsError}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {pollingError && (
              <button 
                onClick={resumePolling}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm text-red-700 hover:bg-red-50 font-medium transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Resume Polling
              </button>
            )}
            {resultsError && currentJobId && (
              <button 
                onClick={() => fetchResults(currentJobId)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm text-white hover:bg-red-700 font-medium transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Retry Results
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UploadCard onJobCreated={handleJobCreated} disabled={isUploaded && !isCompleted && status !== 'failed'} />
        <div className="flex flex-col gap-6">
          <StatusCard job={job} loading={isUploaded && !job} error={pollingError} />
          {/* Progress Timeline inline above/below status card equivalent */}
          <div className="card p-5 flex flex-row items-center justify-center overflow-x-auto shadow-sm">
            <TimelineStep label="Uploaded" active={isUploaded && !isQueued} completed={isQueued} />
            <TimelineStep label="Queued" active={isQueued && !isProcessing} completed={isProcessing} />
            <TimelineStep label="Processing" active={status === 'processing'} completed={isCompleted} />
            <TimelineStep label="Completed" active={false} completed={isCompleted} isLast />
          </div>
        </div>
      </div>

      <StatsGrid 
        totalTxns={totalTxns}
        cleanTxns={cleanTxns}
        anomalies={anomaliesCount}
        spendInr={summary?.total_spend_inr}
        spendUsd={summary?.total_spend_usd}
        riskLevel={summary?.risk_level}
        loading={resultsLoading}
        error={resultsError}
        empty={!isCompleted && !results}
      />

      <SummaryCard 
        summary={summary}
        loading={resultsLoading}
        error={resultsError}
      />

      <div className={(!isCompleted && !results && !resultsLoading) ? 'hidden' : 'block'}>
        <Charts 
          transactions={allTxns}
          loading={resultsLoading}
        />
      </div>

      <div className={(!isCompleted && !results && !resultsLoading) ? 'hidden' : 'block'}>
        <TransactionTable transactions={allTxns} />
      </div>

    </div>
  );
};
