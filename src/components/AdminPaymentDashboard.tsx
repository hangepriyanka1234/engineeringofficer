import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  Tag,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Layers,
  Award,
  BookOpen,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Key,
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';
import { PaymentService } from '../services/paymentService';
import {
  PlanRecord,
  CouponRecord,
  PaymentTransactionRecord,
  PaymentDashboardStats,
  PaymentAuditLogRecord,
  ProductId,
  UserEntitlementRecord
} from '../types/payment';

export const AdminPaymentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'plans' | 'coupons' | 'transactions' | 'entitlements' | 'audit' | 'razorpay-config'
  >('overview');

  const [stats, setStats] = useState<PaymentDashboardStats | null>(null);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransactionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<PaymentAuditLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Razorpay Config State
  const [rzpKeyId, setRzpKeyId] = useState<string>('');
  const [rzpKeySecret, setRzpKeySecret] = useState<string>('');
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState<string>('');
  const [rzpSaved, setRzpSaved] = useState<boolean>(false);

  // Plan Edit Modal State
  const [editingPlan, setEditingPlan] = useState<Partial<PlanRecord> | null>(null);
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);

  // Coupon Modal State
  const [editingCoupon, setEditingCoupon] = useState<Partial<CouponRecord> | null>(null);
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);

  // Refund Modal State
  const [refundTarget, setRefundTarget] = useState<PaymentTransactionRecord | null>(null);
  const [refundReason, setRefundReason] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<number>(0);

  // Manual Entitlement State
  const [searchUserEmail, setSearchUserEmail] = useState<string>('');
  const [searchedEntitlements, setSearchedEntitlements] = useState<UserEntitlementRecord[] | null>(null);
  const [manualPlanId, setManualPlanId] = useState<string>('plan_engineering_pro_combo');
  const [manualDurationDays, setManualDurationDays] = useState<number>(30);
  const [manualReason, setManualReason] = useState<string>('Special Student Scholarship Grant');

  // Search filter for transactions
  const [txSearch, setTxSearch] = useState<string>('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, plansData, couponsData, txData, logsData] = await Promise.all([
        PaymentService.getAdminDashboard(),
        PaymentService.getAdminPlans(),
        PaymentService.getAdminCoupons(),
        PaymentService.getAdminTransactions(),
        PaymentService.getAdminAuditLogs(),
      ]);
      setStats(statsData);
      setPlans(plansData);
      setCoupons(couponsData);
      setTransactions(txData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin payment dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.name) return;
    try {
      await PaymentService.saveAdminPlan(editingPlan, 'admin@sp-engineering.gov.in');
      setShowPlanModal(false);
      setEditingPlan(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save plan');
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editingCoupon.code) return;
    try {
      await PaymentService.saveAdminCoupon(editingCoupon);
      setShowCouponModal(false);
      setEditingCoupon(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save coupon');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await PaymentService.deleteAdminCoupon(code);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const handleProcessRefund = async () => {
    if (!refundTarget) return;
    try {
      await PaymentService.processRefund(
        refundTarget.razorpay_payment_id,
        refundAmount || refundTarget.amount,
        refundReason || 'Customer requested refund',
        'admin@sp-engineering.gov.in'
      );
      setRefundTarget(null);
      setRefundReason('');
      await loadAllData();
      alert('Refund processed successfully and entitlements updated.');
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    }
  };

  const handleSearchUserEntitlements = async () => {
    if (!searchUserEmail.trim()) return;
    try {
      const ents = await PaymentService.getUserEntitlements(searchUserEmail.trim());
      setSearchedEntitlements(ents);
    } catch (err: any) {
      alert(err.message || 'Failed to search entitlements');
    }
  };

  const handleManualGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUserEmail.trim()) return;
    try {
      const res = await PaymentService.manualEntitlementGrant({
        userId: searchUserEmail.trim(),
        userEmail: searchUserEmail.trim(),
        planId: manualPlanId,
        durationDays: Number(manualDurationDays),
        adminReason: manualReason,
        adminEmail: 'admin@sp-engineering.gov.in',
      });
      setSearchedEntitlements(res.entitlements);
      await loadAllData();
      alert(`Granted ${manualDurationDays} days entitlement for ${searchUserEmail}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to grant entitlement');
    }
  };

  const allAvailableProducts: ProductId[] = [
    'MCQ_BANK',
    'PYQ_BANK',
    'TEST_SERIES',
    'FULL_TESTS',
    'FORMULA_LAB',
    'AI_PRO',
    'STUDY_PLANNER',
    'RECRUITMENT_PREMIUM',
    'VIDEO_LIBRARY',
    'COMBO_ALL',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Monetization, Plans & Razorpay Control Center</h2>
            <p className="text-xs text-slate-300">
              Server-side order management, cryptographic HMAC verification, product entitlements & refunds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Revenue & Analytics', icon: TrendingUp },
          { id: 'razorpay-config', label: 'Razorpay Keys & ₹299 Setup', icon: Key },
          { id: 'plans', label: 'Plan Configurator', icon: Layers },
          { id: 'coupons', label: 'Coupons Engine', icon: Tag },
          { id: 'transactions', label: 'Transactions & Orders', icon: CreditCard },
          { id: 'entitlements', label: 'Student Entitlements', icon: ShieldCheck },
          { id: 'audit', label: 'Audit Trail & Webhooks', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Revenue</span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{stats?.totalRevenue.toLocaleString() || '0'}</p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> Live Verified
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Orders</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalOrders || 0}</p>
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">Server Persisted</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Successful Payments</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.successfulPayments || 0}</p>
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">HMAC Verified</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Active Paid Users</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{stats?.activeSubscribers || 0}</p>
              <span className="text-[10px] text-blue-600 font-semibold mt-1 block">Valid Entitlements</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Expired Plans</span>
              <p className="text-2xl font-black text-slate-500 mt-1">{stats?.expiredPlans || 0}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Auto-Restricted</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Refunds Processed</span>
              <p className="text-2xl font-black text-amber-600 mt-1">₹{stats?.refundTotal || 0}</p>
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">{stats?.refundCount || 0} refunds</span>
            </div>
          </div>

          {/* Plan Breakdown & Sales Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan-wise Breakdown */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Plan-Wise Revenue Distribution</span>
                <span className="text-xs font-normal text-slate-500">All Time</span>
              </h3>
              <div className="space-y-4">
                {stats?.planSalesBreakdown.map((item) => {
                  const pct = stats.totalRevenue > 0 ? Math.round((item.revenue / stats.totalRevenue) * 100) : 0;
                  return (
                    <div key={item.planId} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{item.planName}</span>
                        <span className="text-slate-600 font-mono">
                          ₹{item.revenue.toLocaleString()} ({item.count} orders)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-Day Revenue Trend */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Last 7 Days Revenue Trend</span>
                <span className="text-xs font-normal text-slate-500">Daily Ledger</span>
              </h3>
              <div className="space-y-3">
                {stats?.dateWiseSales.map((d) => (
                  <div key={d.date} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="font-mono text-slate-600">{d.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">{d.orders} orders</span>
                      <span className="font-bold text-slate-900 font-mono">₹{d.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: PLAN CONFIGURATOR */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Admin Plan Configuration</h3>
              <p className="text-xs text-slate-500">
                Configure prices, duration, included products, AI query quotas, and active status
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPlan({
                  name: '',
                  slug: '',
                  price: 499,
                  original_price: 999,
                  duration: 6,
                  duration_unit: 'months',
                  billing_type: 'ONE_TIME',
                  product_type: 'bundle',
                  active: true,
                  featured: false,
                  included_products: ['MCQ_BANK', 'FORMULA_LAB'],
                  ai_daily_limit: 20,
                  features: ['Comprehensive Civil Engineering Access'],
                });
                setShowPlanModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl bg-white border ${
                  plan.featured ? 'border-blue-300 ring-2 ring-blue-500/20' : 'border-slate-200'
                } shadow-xs flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {plan.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-1.5 inline-block">
                          {plan.badge}
                        </span>
                      )}
                      <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        plan.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {plan.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{plan.description}</p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                    {plan.original_price && plan.original_price > plan.price && (
                      <span className="text-xs text-slate-400 line-through">₹{plan.original_price}</span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                      / {plan.duration} {plan.duration_unit}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Included Products:</span>
                      <span className="font-bold text-slate-900">{plan.included_products.length} Products</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plan.included_products.map((p) => (
                        <span key={p} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1">
                      <span>AI Daily Limit:</span>
                      <span className="font-bold text-blue-700">{plan.ai_daily_limit} queries/day</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setShowPlanModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: COUPONS ENGINE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Discount Coupons Engine</h3>
              <p className="text-xs text-slate-500">Manage promotional codes, percentage discounts & usage limits</p>
            </div>
            <button
              onClick={() => {
                setEditingCoupon({
                  code: '',
                  discount_type: 'percentage',
                  discount_value: 20,
                  minimum_amount: 0,
                  maximum_discount: 500,
                  usage_limit: 1000,
                  active: true,
                  applicable_plans: [],
                });
                setShowCouponModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Coupon
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Coupon Code</th>
                  <th className="p-3.5">Discount</th>
                  <th className="p-3.5">Min Cart / Max Cap</th>
                  <th className="p-3.5">Usage / Limit</th>
                  <th className="p-3.5">Validity</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-blue-700 text-sm">{coupon.code}</td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% OFF`
                        : `₹${coupon.discount_value} FLAT`}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      Min: ₹{coupon.minimum_amount} | Cap: ₹{coupon.maximum_discount}
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">
                      {coupon.used_count} / {coupon.usage_limit}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      Until {new Date(coupon.valid_until).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {coupon.active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon.code)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 4: TRANSACTIONS & ORDERS */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Transactions & Orders Ledger</h3>
              <p className="text-xs text-slate-500">Audited payment records with 1-click refund processing</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search email, order ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Student Email</th>
                  <th className="p-3.5">Plan Name</th>
                  <th className="p-3.5">Razorpay Identifiers</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Refund Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions
                  .filter(
                    (t) =>
                      t.user_email.toLowerCase().includes(txSearch.toLowerCase()) ||
                      t.razorpay_payment_id.toLowerCase().includes(txSearch.toLowerCase()) ||
                      t.razorpay_order_id.toLowerCase().includes(txSearch.toLowerCase())
                  )
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-slate-600">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{tx.user_email}</td>
                      <td className="p-3.5 font-medium text-slate-800">{tx.plan_name}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">
                        <div>Pay ID: {tx.razorpay_payment_id}</div>
                        <div>Order: {tx.razorpay_order_id}</div>
                      </td>
                      <td className="p-3.5 font-black text-slate-900 font-mono">₹{tx.amount}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tx.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'REFUNDED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {tx.status === 'SUCCESS' && (
                          <button
                            onClick={() => {
                              setRefundTarget(tx);
                              setRefundAmount(tx.amount);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 5: STUDENT ENTITLEMENTS & MANUAL OVERRIDE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'entitlements' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Student Entitlement Lookup & Manual Grant</h3>
            <p className="text-xs text-slate-500">
              Inspect active product access, expiry dates, or grant manual scholarships with audit logging.
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                value={searchUserEmail}
                onChange={(e) => setSearchUserEmail(e.target.value)}
                placeholder="Enter student email address (e.g. swapnil.t@gmail.com)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-blue-600 font-medium"
              />
              <button
                onClick={handleSearchUserEntitlements}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors"
              >
                Inspect Entitlements
              </button>
            </div>

            {searchedEntitlements && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">
                  Active Products for {searchUserEmail} ({searchedEntitlements.length})
                </h4>
                {searchedEntitlements.length === 0 ? (
                  <p className="text-xs text-slate-500">No active entitlements found for this student.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {searchedEntitlements.map((e) => (
                      <div key={e.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{e.product_id}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              e.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {e.status}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-1">
                          Expires: {new Date(e.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Grant Box */}
          <form onSubmit={handleManualGrant} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Manual Entitlement Grant (Admin Override)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Plan</label>
                <select
                  value={manualPlanId}
                  onChange={(e) => setManualPlanId(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={manualDurationDays}
                  onChange={(e) => setManualDurationDays(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Admin Audit Reason</label>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                  placeholder="e.g. Scholarship waiver"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
              >
                Grant Manual Entitlement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 6: AUDIT TRAIL & WEBHOOKS */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 rounded-2xl text-white space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Razorpay Gateway & Webhook Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-800 rounded-xl">
                <span className="text-slate-400">Webhook Endpoint URL:</span>
                <p className="font-mono text-blue-300 mt-0.5">/api/payments/razorpay-webhook</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl">
                <span className="text-slate-400">HMAC-SHA256 Signature Check:</span>
                <p className="font-bold text-emerald-400 mt-0.5">Enforced Server-Side</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl">
                <span className="text-slate-400">Idempotency Guard:</span>
                <p className="font-bold text-emerald-400 mt-0.5">Active (No Duplicates)</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Order / Pay ID</th>
                  <th className="p-3.5">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{log.user_id || '—'}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {log.order_id || log.payment_id || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {JSON.stringify(log.details_json)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB: RAZORPAY CONFIG & MERCHANT COMPLIANCE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'razorpay-config' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl text-white space-y-2 border border-blue-400/30 shadow-lg">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold">Razorpay Live Gateway & ₹299 Master Plan Approval</h3>
            </div>
            <p className="text-xs text-blue-200">
              Configure your Razorpay Merchant Keys (Key ID & Key Secret) to accept live student payments via UPI (GPay, PhonePe, Paytm), Net Banking, Cards & Wallets.
            </p>
          </div>

          {rzpSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Razorpay configuration updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">API Credentials</h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={rzpKeyId}
                  onChange={(e) => setRzpKeyId(e.target.value)}
                  placeholder="rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={rzpKeySecret}
                  onChange={(e) => setRzpKeySecret(e.target.value)}
                  placeholder="Enter Key Secret"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Webhook Secret (Optional)</label>
                <input
                  type="password"
                  value={rzpWebhookSecret}
                  onChange={(e) => setRzpWebhookSecret(e.target.value)}
                  placeholder="whsec_xxxxxxxx"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/razorpay/config', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        keyId: rzpKeyId,
                        keySecret: rzpKeySecret,
                        webhookSecret: rzpWebhookSecret,
                      }),
                    });
                    setRzpSaved(true);
                    setTimeout(() => setRzpSaved(false), 3000);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Save Razorpay Keys
              </button>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">₹299 Flagship Plan Details for Razorpay Approval</h4>
              
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-1.5 text-xs text-blue-950">
                <div className="font-bold flex items-center justify-between">
                  <span>₹299 Civil Officer Master Pass</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px]">Active</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Full 1-Year access to 20,000+ MCQs, Exam PYQs (MPSC MES, PWD, WRD, ZP, BMC), CBT Mock Tests, and AI Explanations.
                </p>
                <div className="font-mono text-xs font-bold text-slate-900 pt-1">
                  Price: ₹299 (Discounted from ₹999)
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800">Razorpay Merchant Approval Requirements:</div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Terms & Conditions Page active</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Privacy Policy & SSL Encryption active</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>7-Day Refund / Cancellation Policy active</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Merchant Contact & Grievance Support displayed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* PLAN EDIT MODAL */}
      {/* --------------------------------------------------------------------- */}
      {showPlanModal && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSavePlan}
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">Configure Plan</h4>
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.price ?? 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original / Strikethrough Price (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.original_price ?? 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, original_price: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="number"
                    value={editingPlan.duration ?? 6}
                    onChange={(e) => setEditingPlan({ ...editingPlan, duration: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration Unit</label>
                  <select
                    value={editingPlan.duration_unit || 'months'}
                    onChange={(e) => setEditingPlan({ ...editingPlan, duration_unit: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Included Products</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {allAvailableProducts.map((prod) => {
                    const isSelected = (editingPlan.included_products || []).includes(prod);
                    return (
                      <label key={prod} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const current = editingPlan.included_products || [];
                            const updated = e.target.checked
                              ? [...current, prod]
                              : current.filter((p) => p !== prod);
                            setEditingPlan({ ...editingPlan, included_products: updated });
                          }}
                        />
                        <span className="text-[11px] font-medium text-slate-800">{prod}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">AI Daily Limit (Queries/Day)</label>
                <input
                  type="number"
                  value={editingPlan.ai_daily_limit ?? 15}
                  onChange={(e) => setEditingPlan({ ...editingPlan, ai_daily_limit: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingPlan.active ?? true}
                    onChange={(e) => setEditingPlan({ ...editingPlan, active: e.target.checked })}
                  />
                  <span className="font-bold text-slate-700">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingPlan.featured ?? false}
                    onChange={(e) => setEditingPlan({ ...editingPlan, featured: e.target.checked })}
                  />
                  <span className="font-bold text-slate-700">Featured Badge</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* REFUND MODAL */}
      {/* --------------------------------------------------------------------- */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-bold text-slate-900">Process Transaction Refund</h4>
            <p className="text-xs text-slate-500">
              This will update the financial transaction status to REFUNDED and revoke all associated student entitlements.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500">Payment ID</label>
                <p className="font-mono font-bold text-slate-900">{refundTarget.razorpay_payment_id}</p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Student mistakenly bought double pack"
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRefundTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Refund & Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* COUPON ADD MODAL */}
      {/* --------------------------------------------------------------------- */}
      {showCouponModal && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveCoupon}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs"
          >
            <h4 className="text-base font-bold text-slate-900">Add Discount Coupon</h4>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
              <input
                type="text"
                value={editingCoupon.code || ''}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FESTIVAL50"
                className="w-full p-2 rounded-xl border border-slate-200 font-mono uppercase"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                <select
                  value={editingCoupon.discount_type || 'percentage'}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  value={editingCoupon.discount_value ?? 20}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={editingCoupon.minimum_amount ?? 0}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, minimum_amount: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Cap Discount (₹)</label>
                <input
                  type="number"
                  value={editingCoupon.maximum_discount ?? 500}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, maximum_discount: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-700 text-white font-bold">
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
