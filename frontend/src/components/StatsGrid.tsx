import React from 'react';
import { Loader2, AlertCircle, Database, ShieldCheck, AlertTriangle, DollarSign, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconColorClass }) => (
  <div className="card p-5 flex items-start gap-4 transition-opacity duration-300 opacity-100">
    <div className={`p-3 rounded-xl ${iconColorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

export interface StatsGridProps {
  totalTxns?: number;
  cleanTxns?: number;
  anomalies?: number;
  spendInr?: number;
  spendUsd?: number;
  riskLevel?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalTxns = 0,
  cleanTxns = 0,
  anomalies = 0,
  spendInr = 0,
  spendUsd = 0,
  riskLevel = 'unknown',
  loading,
  error,
  empty
}) => {
  if (loading) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center w-full col-span-full min-h-[140px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Calculating statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center w-full col-span-full bg-red-50 border-red-200 min-h-[140px]">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm font-medium text-red-800">Error loading statistics</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center w-full col-span-full bg-slate-50 border-dashed min-h-[140px]">
        <Database className="w-8 h-8 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">Statistics will appear here once processing completes.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard 
        title="Total Transactions" 
        value={totalTxns} 
        icon={<Database className="w-5 h-5" />} 
        iconColorClass="bg-blue-100 text-blue-600"
      />
      <StatCard 
        title="Clean Transactions" 
        value={cleanTxns} 
        icon={<ShieldCheck className="w-5 h-5" />} 
        iconColorClass="bg-emerald-100 text-emerald-600"
      />
      <StatCard 
        title="Anomalies" 
        value={anomalies} 
        icon={<AlertTriangle className="w-5 h-5" />} 
        iconColorClass="bg-amber-100 text-amber-600"
      />
      <StatCard 
        title="Total Spend" 
        value={`₹${spendInr.toLocaleString()} INR`} 
        subtitle={spendUsd > 0 ? `$${spendUsd.toLocaleString()} USD` : undefined}
        icon={<DollarSign className="w-5 h-5" />} 
        iconColorClass="bg-purple-100 text-purple-600"
      />
      <StatCard 
        title="Risk Level" 
        value={riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} 
        icon={<Activity className="w-5 h-5" />} 
        iconColorClass={
          riskLevel === 'high' ? 'bg-red-100 text-red-600' : 
          riskLevel === 'medium' ? 'bg-amber-100 text-amber-600' : 
          riskLevel === 'low' ? 'bg-green-100 text-green-600' : 
          'bg-slate-100 text-slate-600'
        }
      />
    </div>
  );
};
