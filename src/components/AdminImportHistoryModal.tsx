import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  Layers,
  Search
} from 'lucide-react';
import {
  QuestionBankService,
  ImportHistoryRecord
} from '../services/questionBankService';

interface AdminImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminImportHistoryModal: React.FC<AdminImportHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [histories, setHistories] = useState<ImportHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchHistories = async () => {
    setIsLoading(true);
    try {
      const list = await QuestionBankService.getImportHistories();
      setHistories(list);
    } catch (err) {
      console.error('Failed to load histories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchHistories();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = histories.filter((h) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      h.import_id.toLowerCase().includes(term) ||
      h.file_name.toLowerCase().includes(term) ||
      h.admin_email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Bulk Question Import Audit Trail</h3>
              <p className="text-[11px] text-slate-400">Complete immutable record of all bulk question batch imports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search file name, import ID, or admin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            onClick={fetchHistories}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <History className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No past import history found.</p>
              <p className="text-[11px] text-slate-400">All new uploads and bulk imports will be recorded here automatically.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-500 font-bold">{item.import_id}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-mono uppercase font-semibold">
                      {item.file_type}
                    </span>
                    <span className="text-slate-700 font-semibold">{item.file_name}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{item.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Rows</span>
                    <span className="font-bold text-slate-800">{item.total_rows.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Imported Count</span>
                    <span className="font-bold text-emerald-700">+{item.imported_count.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Duplicates Skipped</span>
                    <span className="font-bold text-amber-700">{item.duplicate_count.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Duration / Admin</span>
                    <span className="font-mono text-slate-800">{(item.duration_ms / 1000).toFixed(1)}s · {item.admin_email.split('@')[0]}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-200/60 pt-1 flex justify-between items-center">
                  <span>Imported on {new Date(item.upload_time).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
