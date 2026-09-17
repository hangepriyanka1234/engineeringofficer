import React, { useState, useEffect } from 'react';
import {
  Database,
  Activity,
  Layers,
  Zap,
  Clock,
  HardDrive,
  Cpu,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Server
} from 'lucide-react';
import { AdminOperationsService, DatabaseMetrics, RateLimitConfig } from '../services/adminOperationsService';

export const AdminDatabaseOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [rateLimits, setRateLimits] = useState<RateLimitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingLimits, setSavingLimits] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, r] = await Promise.all([
        AdminOperationsService.getDbMetrics(),
        AdminOperationsService.getRateLimits(),
      ]);
      setMetrics(m);
      setRateLimits(r);
    } catch (err) {
      console.error('Failed to load database optimization metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateLimits) return;
    setSavingLimits(true);
    try {
      const updated = await AdminOperationsService.updateRateLimits(rateLimits);
      setRateLimits(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save rate limits', err);
    } finally {
      setSavingLimits(false);
    }
  };

  if (loading || !metrics || !rateLimits) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
        <div className="text-xs text-slate-500 font-medium">Gathering real-time database optimization telemetry...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* High-Level Optimization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Query Volume (24h)</span>
            <Database className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {metrics.queryVolumeLast24h.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <Zap className="w-3 h-3" />
            {(metrics.batchedQueriesSavedCount / 1000).toFixed(1)}k individual queries saved by batching
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active Concurrent Sessions</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {metrics.activeConcurrentSessions} / 2,000+
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 12 Maharashtra Exam Targets
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Database & Storage Footprint</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {metrics.dbSizeFormatted} DB
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Storage: {metrics.storageUsageFormatted} · Bandwidth: {metrics.bandwidthUsageFormatted}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Cache Efficiency</span>
            <Cpu className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {metrics.cacheHitEfficiencyPercent}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Edge error rate: {metrics.edgeFunctionErrorRatePercent}%
          </div>
        </div>
      </div>

      {/* Optimization Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Batching & Selective Projection */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">High-Throughput Batching & Projection Engine</h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              ACTIVE
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates high-frequency database writes during CBT mock tests. Answers are stored in client state and synced via periodic autosave buffers.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <div className="font-bold text-slate-800">Selective Column Projection</div>
                <div className="text-slate-500 text-[11px]">Omits bulky explanations & proofs until question review is triggered.</div>
              </div>
              <span className="text-emerald-700 font-bold font-mono text-xs">-68% payload</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <div className="font-bold text-slate-800">Buffered CBT Test Autosave</div>
                <div className="text-slate-500 text-[11px]">Aggregates question responses every 15s rather than 1 write per radio click.</div>
              </div>
              <span className="text-emerald-700 font-bold font-mono text-xs">-95% DB IOPS</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <div className="font-bold text-slate-800">Materialized Daily Summary View</div>
                <div className="text-slate-500 text-[11px]">Pre-computes student accuracy & mistake counts to prevent heavy full-table scans.</div>
              </div>
              <span className="text-emerald-700 font-bold font-mono text-xs">O(1) dashboard lookup</span>
            </div>
          </div>
        </div>

        {/* Right: Application-Level Rate Limits */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Application Rate Limiter & Quota Rules</h4>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900"
              title="Refresh metrics"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleSaveRateLimits} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Free Tier RPM Limit</label>
                <input
                  type="number"
                  value={rateLimits.freeTierRpm}
                  onChange={(e) => setRateLimits({ ...rateLimits, freeTierRpm: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Requests per minute per student</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blueprint Pro RPM Limit</label>
                <input
                  type="number"
                  value={rateLimits.proTierRpm}
                  onChange={(e) => setRateLimits({ ...rateLimits, proTierRpm: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Requests per minute per student</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Officer Master RPM Limit</label>
                <input
                  type="number"
                  value={rateLimits.masterTierRpm}
                  onChange={(e) => setRateLimits({ ...rateLimits, masterTierRpm: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">High priority lane</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">IP Burst Threshold</label>
                <input
                  type="number"
                  value={rateLimits.ipBurstLimit}
                  onChange={(e) => setRateLimits({ ...rateLimits, ipBurstLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Prevents crawler abuse</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rateLimits.enabled}
                  onChange={(e) => setRateLimits({ ...rateLimits, enabled: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs font-semibold text-slate-800">Enforce Rate Limiting</span>
              </label>

              <button
                type="submit"
                disabled={savingLimits}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 flex items-center space-x-1.5 transition-all shadow-xs"
              >
                {savingLimits ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{savingLimits ? 'Saving...' : saveSuccess ? 'Updated!' : 'Save Limits'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
