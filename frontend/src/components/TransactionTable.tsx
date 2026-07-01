import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types/transaction';
import { Search, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

interface TransactionTableProps {
  transactions: Transaction[];
}

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';
type FilterType = 'All' | 'Normal' | 'Anomalies';

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];

    if (filterType === 'Normal') {
      result = result.filter(t => !t.is_anomaly);
    } else if (filterType === 'Anomalies') {
      result = result.filter(t => t.is_anomaly);
    }

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(t => 
        (t.merchant && t.merchant.toLowerCase().includes(lowerSearch)) ||
        (t.txn_id && t.txn_id.toLowerCase().includes(lowerSearch))
      );
    }

    result.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const amtA = a.amount || 0;
        const amtB = b.amount || 0;
        return sortOrder === 'asc' ? amtA - amtB : amtB - amtA;
      }
    });

    return result;
  }, [transactions, filterType, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / rowsPerPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSorted.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSorted, currentPage]);

  if (!transactions.length) {
    return null;
  }

  return (
    <div className="card flex flex-col bg-white">
      <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Transactions Ledger</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search merchant or ID..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-colors"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as FilterType); setCurrentPage(1); }}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-auto"
          >
            <option value="All">All Transactions</option>
            <option value="Normal">Normal Only</option>
            <option value="Anomalies">Anomalies Only</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Txn ID</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 whitespace-nowrap transition-colors" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">Date {sortField === 'date' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</div>
              </th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Merchant</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 whitespace-nowrap transition-colors" onClick={() => handleSort('amount')}>
                <div className="flex items-center gap-1">Amount {sortField === 'amount' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</div>
              </th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Categories</th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((txn, index) => (
              <tr key={txn.txn_id || index} className={`hover:bg-slate-50/80 transition-colors ${txn.is_anomaly ? 'bg-red-50/30' : ''}`}>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{txn.txn_id || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">{formatDate(txn.date)}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{txn.merchant || 'Unknown'}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{txn.currency === 'INR' ? '₹' : (txn.currency === 'USD' ? '$' : '')}{txn.amount?.toLocaleString() || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500">Orig: {txn.category || '-'}</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block w-fit border border-blue-100">LLM: {(txn.llm_category && txn.llm_category !== '-') ? txn.llm_category : 'Not classified'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-2 items-start">
                    {txn.is_anomaly ? (
                      <span className="badge bg-red-100 text-red-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" /> Anomaly
                      </span>
                    ) : (
                      <span className="badge bg-green-100 text-green-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" /> Normal
                      </span>
                    )}
                    {txn.llm_failed && (
                      <span className="badge bg-yellow-100 text-yellow-800 text-[10px]">
                        LLM Fallback
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 max-w-[220px] truncate" title={txn.anomaly_reason || ''}>
                  {txn.anomaly_reason || '-'}
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 bg-slate-50">
                  No transactions match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-b-xl gap-4">
        <div>
          Showing <span className="font-medium text-slate-800">{Math.min((currentPage - 1) * rowsPerPage + 1, filteredAndSorted.length)}</span> to <span className="font-medium text-slate-800">{Math.min(currentPage * rowsPerPage, filteredAndSorted.length)}</span> of <span className="font-medium text-slate-800">{filteredAndSorted.length}</span> entries
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 bg-white shadow-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 font-medium text-slate-700">Page {currentPage} of {totalPages || 1}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 bg-white shadow-sm transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
