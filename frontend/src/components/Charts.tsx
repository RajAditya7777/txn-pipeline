import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Transaction } from '../types/transaction';
import { PieChart as PieChartIcon, BarChart2 } from 'lucide-react';

interface ChartsProps {
  transactions: Transaction[];
  loading?: boolean;
}

const COLORS = {
  normal: '#3b82f6', // blue-500
  anomaly: '#ef4444', // red-500
};

export const Charts: React.FC<ChartsProps> = ({ transactions, loading }) => {
  const { pieData, barData } = useMemo(() => {
    if (!transactions.length) return { pieData: [], barData: [] };

    let normalCount = 0;
    let anomalyCount = 0;
    const merchantSpend: Record<string, number> = {};

    transactions.forEach(txn => {
      if (txn.is_anomaly) anomalyCount++;
      else normalCount++;

      if (txn.merchant && txn.amount) {
        // Convert everything to INR equivalently for ranking, or assume amounts are pre-normalized.
        // Assuming amounts are comparable or we just sum raw values as per backend logic.
        merchantSpend[txn.merchant] = (merchantSpend[txn.merchant] || 0) + txn.amount;
      }
    });

    const pieData = [
      { name: 'Normal', value: normalCount },
      { name: 'Anomalies', value: anomalyCount },
    ];

    const barData = Object.entries(merchantSpend)
      .map(([merchant, spend]) => ({ merchant, spend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    return { pieData, barData };
  }, [transactions]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 h-[400px] flex items-center justify-center bg-slate-50 animate-pulse border-dashed">
          <div className="w-48 h-48 rounded-full bg-slate-200"></div>
        </div>
        <div className="card p-6 h-[400px] flex flex-col items-center justify-center bg-slate-50 animate-pulse gap-4 border-dashed">
          <div className="w-full h-8 bg-slate-200 rounded"></div>
          <div className="w-full h-8 bg-slate-200 rounded"></div>
          <div className="w-full h-8 bg-slate-200 rounded"></div>
          <div className="w-full h-8 bg-slate-200 rounded"></div>
          <div className="w-full h-8 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-8 flex flex-col items-center justify-center min-h-[400px] bg-slate-50 border-dashed col-span-full">
          <PieChartIcon className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-sm font-medium text-slate-500">No transaction data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
          <PieChartIcon className="w-5 h-5 text-blue-500" /> Normal vs Anomalies
        </h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Normal' ? COLORS.normal : COLORS.anomaly} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Transactions']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6 h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
          <BarChart2 className="w-5 h-5 text-blue-500" /> Top 5 Merchants by Spend
        </h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="merchant" type="category" width={100} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total Spend']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="spend" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
