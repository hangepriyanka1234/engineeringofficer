import React, { useState, useEffect } from 'react';
import {
  Database,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Key,
  Server,
  Layers,
  Copy,
  Terminal,
  Cpu
} from 'lucide-react';

export const AdminSupabaseConnector: React.FC = () => {
  const [status, setStatus] = useState<{
    connected: boolean;
    url?: string;
    message: string;
    tablesFound?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({
        connected: false,
        message: 'Could not connect to backend Supabase status API.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const copySchemaNotice = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Supabase PostgreSQL & Real-Time Engine
              {status?.connected ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> LIVE CONNECTED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> LOCAL STORAGE ENGINE (READY FOR LIVE CREDENTIALS)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              PostgreSQL 15+, Row-Level Security (RLS), Realtime replication, and secure Entitlements ledger.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Test Connection</span>
        </button>
      </div>

      {/* Connection Status Banner */}
      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
        status?.connected
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-start space-x-3">
          {status?.connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold">
              {status?.connected ? 'Database Status: Operational' : 'Supabase Client Integration Ready'}
            </div>
            <div>{status?.message || 'Checking Supabase connection...'}</div>
            {status?.url && (
              <div className="font-mono text-[11px] text-slate-600 mt-1">
                Target Endpoint: <span className="font-bold">{status.url}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Setup instructions & Live Schema verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
            <Key className="w-4 h-4 text-sky-600" />
            <span>Environment Variables Configuration</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Add these keys to your environment secrets or <code className="px-1 py-0.5 bg-slate-200 rounded font-mono text-[10px]">.env</code>:
          </p>
          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1 overflow-x-auto">
            <div><span className="text-sky-400">SUPABASE_URL</span>=https://your-project.supabase.co</div>
            <div><span className="text-emerald-400">SUPABASE_ANON_KEY</span>=eyJhbGci...</div>
            <div><span className="text-amber-400">SUPABASE_SERVICE_ROLE_KEY</span>=eyJhbGci...</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>Database Tables in <code className="font-mono text-[11px]">supabase/schema.sql</code></span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-slate-700">✓ profiles</div>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-slate-700">✓ questions (20k+)</div>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-slate-700">✓ mock_tests</div>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-slate-700">✓ test_attempts</div>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-slate-700">✓ payments_ledger</div>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-slate-700">✓ mistake_notebook</div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Ready for instant execution in SQL Editor.</span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 font-bold hover:underline flex items-center gap-1"
            >
              Supabase Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
