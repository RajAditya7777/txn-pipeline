import React from 'react';
import { Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                AI Transaction Processing Pipeline
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                Backend DevOps Assignment
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
