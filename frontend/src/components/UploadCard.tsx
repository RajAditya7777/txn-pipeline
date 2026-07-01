import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface UploadCardProps {
  onJobCreated: (jobId: string) => void;
  disabled?: boolean;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onJobCreated, disabled }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/jobs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onJobCreated(response.data.job_id);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">Upload Transactions CSV</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-blue-50 border-slate-300 hover:border-blue-400'
        }`}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
        
        {!file ? (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-sm text-slate-600 mb-1">Click to select a CSV file</p>
            <p className="text-xs text-slate-400">Only .csv files are supported</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
              <File className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">{file.name}</p>
            <p className="text-xs text-slate-500 mb-4">{(file.size / 1024).toFixed(1)} KB</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFile(null)}
                disabled={uploading}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
              >
                {uploading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
