import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Save
} from 'lucide-react';
import { AdminOperationsService, AIUsageRecord, AIBudgetConfig } from '../services/adminOperationsService';

export const AdminAIGatewayManager: React.FC = () => {
  const [ledger, setLedger] = useState<AIUsageRecord[]>([]);
  const [budget, setBudget] = useState<AIBudgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await AdminOperationsService.getAILedger();
      setLedger(data.ledger || []);
      setBudget(data.budget || null);
    } catch (err) {
      console.error('Failed to load AI Gateway ledger', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget) return;
    setSavingBudget(true);
    try {
      const updated = await AdminOperationsService.updateAIBudgetConfig(budget);
      setBudget(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update AI budget', err);
    } finally {
      setSavingBudget(false);
    }
  };

  if (loading || !budget) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
        <div className="text-xs text-slate-500 font-medium">Loading AI Gateway telemetry & cost ledger...</div>
      </div>
    );
  }

  const spendPercent = Math.min(100, (budget.currentMonthlySpendInr / budget.monthlyBudgetCapInr) * 100);

  return (
    <div className="space-y-6">
      {/* Top AI Budget & Gateway Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Monthly AI Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            ₹{budget.currentMonthlySpendInr.toFixed(2)} / ₹{budget.monthlyBudgetCapInr}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                spendPercent > 80 ? 'bg-rose-500' : spendPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${spendPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{spendPercent.toFixed(1)}% of monthly budget utilized</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active Concurrency</span>
            <Cpu className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {budget.currentActiveCalls} / {budget.concurrencyLimit} streams
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            Throttling active to prevent rate exhaustion
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Circuit Breaker</span>
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${budget.circuitBreakerTripped ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className="text-sm">{budget.circuitBreakerTripped ? 'TRIPPED (Fallback Active)' : 'HEALTHY (Normal Routing)'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero downtime fallback to IS Code repository
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Model Routing Distribution</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xs font-mono text-slate-800 mt-2 space-y-1">
            <div className="flex justify-between"><span>gemini-2.5-flash:</span> <span className="font-bold">72%</span></div>
            <div className="flex justify-between"><span>gemini-2.5-pro:</span> <span className="font-bold">28%</span></div>
          </div>
        </div>
      </div>

      {/* Quota & Cost Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs md:col-span-1 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900">Per-Tier Quota & Spend Thresholds</h4>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Spend Cap (INR)</label>
              <input
                type="number"
                value={budget.monthlyBudgetCapInr}
                onChange={(e) => setBudget({ ...budget, monthlyBudgetCapInr: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Tier Daily Quota</label>
              <input
                type="number"
                value={budget.freeTierDailyQuota}
                onChange={(e) => setBudget({ ...budget, freeTierDailyQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blueprint Pro Daily Quota</label>
              <input
                type="number"
                value={budget.proTierDailyQuota}
                onChange={(e) => setBudget({ ...budget, proTierDailyQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Officer Master Daily Quota</label>
              <input
                type="number"
                value={budget.masterTierDailyQuota}
                onChange={(e) => setBudget({ ...budget, masterTierDailyQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingBudget}
                className="w-full py-2.5 rounded-lg bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 flex items-center justify-center space-x-1.5 transition-all shadow-xs"
              >
                {savingBudget ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{savingBudget ? 'Saving...' : saveSuccess ? 'Updated!' : 'Save AI Quotas'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live AI Usage Ledger */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs md:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Live AI Token & Cost Ledger</h4>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900"
              title="Refresh ledger"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Student</th>
                  <th className="p-2">Model</th>
                  <th className="p-2">Tokens</th>
                  <th className="p-2">Latency</th>
                  <th className="p-2">Cost (INR)</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="p-2 text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td className="p-2 font-sans font-medium text-slate-800 truncate max-w-[140px]">{item.userEmail}</td>
                    <td className="p-2 text-slate-600">{item.modelUsed}</td>
                    <td className="p-2 text-slate-700">{item.totalTokens}</td>
                    <td className="p-2 text-slate-600">{item.latencyMs}ms</td>
                    <td className="p-2 font-bold text-emerald-700">₹{item.estimatedCostInr.toFixed(4)}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'CIRCUIT_FALLBACK'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
