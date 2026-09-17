import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Download,
  ExternalLink,
  Layers,
  X,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { StudentProfile } from '../types';
import { PaymentService } from '../services/paymentService';
import { UserEntitlementRecord, PaymentTransactionRecord } from '../types/payment';

interface MyPurchasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
}

export const MyPurchasesModal: React.FC<MyPurchasesModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [entitlements, setEntitlements] = useState<UserEntitlementRecord[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTx, setSelectedTx] = useState<PaymentTransactionRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, profile.email]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ents, txs] = await Promise.all([
        PaymentService.getUserEntitlements(profile.email),
        PaymentService.getUserTransactions(profile.email),
      ]);
      setEntitlements(ents);
      setTransactions(txs);
    } catch (e) {
      console.error('Failed to load user purchase data', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const activeEntitlements = entitlements.filter(
    (e) => e.status === 'ACTIVE' && new Date(e.expires_at) > new Date()
  );

  const getProductDisplayName = (prod: string) => {
    const map: Record<string, string> = {
      MCQ_BANK: 'Civil MCQ Question Bank (20,000+ MCQs)',
      PYQ_BANK: 'Previous Year Questions (PYQs 2011-2024)',
      TEST_SERIES: 'Full CBT Mock Test Series (TCS iON)',
      FULL_TESTS: 'Full-Length Cadre Exam Tests',
      FORMULA_LAB: 'Formula Lab & Engineering Calculator Suite',
      AI_PRO: 'AI Study Pro & Doubt Solver (Gemini 2.5 Flash)',
      STUDY_PLANNER: 'Personalized Study Planner & Smart Revision',
      RECRUITMENT_PREMIUM: 'Recruitment Center Premium Alerts',
      VIDEO_LIBRARY: 'Video / Visual Practical Masterclasses',
      COMBO_ALL: 'All-In-One Engineering Pro Combo Access',
    };
    return map[prod] || prod;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">My Purchases & Active Entitlements</h2>
              <p className="text-xs text-slate-300">
                Verified server-side entitlements and immutable payment ledger for {profile.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Verifying active entitlements from Supabase ledger...</p>
            </div>
          ) : (
            <>
              {/* Active Products Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Active Unlocked Products ({activeEntitlements.length})
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Server Verified
                  </span>
                </div>

                {activeEntitlements.length === 0 ? (
                  <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <p className="text-sm text-slate-600 font-medium">No paid product entitlements currently active.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      You are currently accessing the Free Starter Tier (Formula Lab + Sample MCQs).
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeEntitlements.map((ent) => {
                      const daysLeft = Math.max(
                        0,
                        Math.ceil((new Date(ent.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      );
                      return (
                        <div
                          key={ent.id}
                          className="p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                  {getProductDisplayName(ent.product_id)}
                                </h4>
                                <p className="text-xs text-slate-500">{ent.plan_name || 'Standard Package'}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ACTIVE
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Expires: {new Date(ent.expires_at).toLocaleDateString()}
                            </span>
                            <span className="font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                              {daysLeft} days remaining
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Transaction History (Read-Only) */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Payment & Transaction History (Read-Only)
                </h3>

                {transactions.length === 0 ? (
                  <div className="p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                    No past transaction records found.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Plan / Description</th>
                          <th className="p-3">Order ID / Payment ID</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-medium text-slate-800">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {tx.plan_name || 'Civil Engineering Plan'}
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-500">
                              <div>{tx.razorpay_order_id}</div>
                              <div className="text-slate-400">{tx.razorpay_payment_id}</div>
                            </td>
                            <td className="p-3 text-slate-600 font-medium">{tx.payment_method}</td>
                            <td className="p-3 font-bold text-slate-900">₹{tx.amount}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  tx.status === 'SUCCESS'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : tx.status === 'REFUNDED'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedTx(tx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Receipt Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="text-center border-b border-slate-100 pb-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Official Payment Receipt</h4>
                <p className="text-xs text-slate-500">Engineering Officer BY SP — Portal Monetization</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 mb-5">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTx.razorpay_payment_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Razorpay Order ID:</span>
                  <span className="font-mono font-medium text-slate-900">{selectedTx.razorpay_order_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Plan Purchased:</span>
                  <span className="font-bold text-slate-900">{selectedTx.plan_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Student Email:</span>
                  <span className="font-medium text-slate-900">{selectedTx.user_email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(selectedTx.verified_at || selectedTx.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-medium text-slate-900">{selectedTx.payment_method}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold text-slate-900 bg-slate-50 px-3 rounded-lg">
                  <span>Total Amount Paid:</span>
                  <span className="text-blue-700">₹{selectedTx.amount}.00</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted Razorpay Gateway Verification</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
