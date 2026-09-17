import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  FileText,
  Video,
  ShieldCheck,
  Trash2,
  Download,
  Link,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { AdminOperationsService, StorageObjectMetadata } from '../services/adminOperationsService';

export const AdminStorageMediaManager: React.FC = () => {
  const [objects, setObjects] = useState<StorageObjectMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaningOrphans, setCleaningOrphans] = useState(false);
  const [cleanResult, setCleanResult] = useState<{ deletedCount: number; bytesReclaimed: number } | null>(null);
  const [signedUrlModal, setSignedUrlModal] = useState<{ open: boolean; url?: string; filename?: string }>({ open: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await AdminOperationsService.getStorageObjects();
      setObjects(data);
    } catch (err) {
      console.error('Failed to load storage objects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanOrphans = async () => {
    setCleaningOrphans(true);
    try {
      const res = await AdminOperationsService.cleanOrphans();
      setCleanResult(res);
      await loadData();
    } catch (err) {
      console.error('Orphan cleanup failed', err);
    } finally {
      setCleaningOrphans(false);
    }
  };

  const handleGenerateSignedUrl = async (obj: StorageObjectMetadata) => {
    try {
      const res = await AdminOperationsService.requestSignedUrl(obj.id, 'admin@enggbysp.com', 'master');
      if (res.success && res.signedUrl) {
        setSignedUrlModal({ open: true, url: res.signedUrl, filename: obj.filename });
      }
    } catch (err) {
      console.error('Failed to generate signed URL', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
        <div className="text-xs text-slate-500 font-medium">Scanning storage buckets & validating object entitlements...</div>
      </div>
    );
  }

  const totalSizeMb = (objects.reduce((acc, o) => acc + o.sizeBytes, 0) / (1024 * 1024)).toFixed(1);
  const totalDownloads = objects.reduce((acc, o) => acc + o.downloadCount, 0);

  return (
    <div className="space-y-6">
      {/* Storage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Storage Objects</span>
            <HardDrive className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {objects.length} Files ({totalSizeMb} MB)
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across study-notes, is-codes, and videos
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Entitlement Protection</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            100% Signed URLs
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Prevents direct unauthorized URL guessing
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Bandwidth Delivery Hits</span>
            <Download className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {totalDownloads.toLocaleString()} Downloads
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Separated from database query load
          </div>
        </div>
      </div>

      {/* Orphan Cleanup Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Orphan & Temporary File Garbage Collection</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Detects unlinked uploads, drafts, and temporary sketches that consume quota without active syllabus links.
          </p>
          {cleanResult && (
            <div className="text-xs text-emerald-600 font-bold mt-2">
              Reclaimed {(cleanResult.bytesReclaimed / (1024 * 1024)).toFixed(2)} MB across {cleanResult.deletedCount} orphan files!
            </div>
          )}
        </div>

        <button
          onClick={handleCleanOrphans}
          disabled={cleaningOrphans}
          className="px-4 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          {cleaningOrphans ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          <span>{cleaningOrphans ? 'Purging...' : 'Run Orphan Cleaner'}</span>
        </button>
      </div>

      {/* Object Catalog */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900">Protected Storage Catalog & Signed Access</h4>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">File Name</th>
                <th className="p-3">Bucket</th>
                <th className="p-3">Size</th>
                <th className="p-3">Entitlement Required</th>
                <th className="p-3">Downloads</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {objects.map((obj) => (
                <tr key={obj.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                    {obj.mimeType.includes('video') ? (
                      <Video className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    )}
                    <span className="truncate max-w-xs">{obj.filename}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">{obj.bucket}</td>
                  <td className="p-3 font-mono text-slate-600">{obj.sizeFormatted}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        obj.requiresTier === 'master'
                          ? 'bg-purple-100 text-purple-800'
                          : obj.requiresTier === 'pro'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {obj.requiresTier.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-700">{obj.downloadCount}</td>
                  <td className="p-3">
                    {obj.isOrphan ? (
                      <span className="text-rose-600 font-bold text-[10px]">ORPHAN</span>
                    ) : (
                      <span className="text-emerald-600 font-bold text-[10px]">LINKED</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleGenerateSignedUrl(obj)}
                      className="px-2.5 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold flex items-center gap-1 ml-auto"
                    >
                      <Link className="w-3 h-3" />
                      <span>Test Signed URL</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signed URL Preview Modal */}
      {signedUrlModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-300">
            <h3 className="font-bold text-slate-900 text-sm">Protected Signed URL Generated (15m Expiry)</h3>
            <div className="text-xs text-slate-600 font-medium">{signedUrlModal.filename}</div>
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg break-all select-all">
              {signedUrlModal.url}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSignedUrlModal({ open: false })}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
