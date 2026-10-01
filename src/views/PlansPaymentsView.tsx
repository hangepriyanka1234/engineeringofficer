import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Award,
  ShieldCheck,
  Tag,
  Download,
  Building2,
  Lock,
  Sparkles,
  CheckCircle2,
  X,
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpen,
  FileText,
  Video,
  Calculator,
  Laptop
} from 'lucide-react';
import { StudentProfile } from '../types';
import { PaymentService } from '../services/paymentService';
import { PlanRecord, ProductId } from '../types/payment';
import { MyPurchasesModal } from '../components/MyPurchasesModal';

interface PlansPaymentsViewProps {
  profile: StudentProfile;
  onPlanUpgraded: () => void;
  setActiveView?: (view: string) => void;
}

export const PlansPaymentsView: React.FC<PlansPaymentsViewProps> = ({
  profile,
  onPlanUpgraded,
  setActiveView,
}) => {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'bundles' | 'modules' | 'single'>('all');

  // Checkout modal states
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanRecord | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    message: string;
  } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Success state
  const [verifiedSuccessData, setVerifiedSuccessData] = useState<{
    planName: string;
    transactionId: string;
    expiresAt: string;
    entitlementsGranted: ProductId[];
  } | null>(null);

  // My purchases modal
  const [showMyPurchases, setShowMyPurchases] = useState<boolean>(false);

  // Razorpay Merchant Compliance Policy Modals
  const [activePolicyModal, setActivePolicyModal] = useState<'terms' | 'privacy' | 'refund' | 'contact' | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await PaymentService.getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !selectedPlanForCheckout) return;
    setCouponLoading(true);
    setCheckoutError(null);
    try {
      const res = await PaymentService.validateCoupon(
        couponCode.trim(),
        selectedPlanForCheckout.id,
        profile.email
      );
      if (res.valid) {
        setAppliedDiscount({
          code: couponCode.trim().toUpperCase(),
          discountAmount: res.discountAmount,
          finalPrice: res.finalPrice,
          message: res.message,
        });
      } else {
        setCheckoutError(res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Coupon validation failed');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // 1. Create Server-Side Order
      const orderRes = await PaymentService.createOrder({
        planId: selectedPlanForCheckout.id,
        userId: profile.email,
        userEmail: profile.email,
        couponCode: appliedDiscount?.code,
      });

      // 2. Trigger Razorpay Checkout
      await PaymentService.triggerRazorpayCheckout({
        orderData: orderRes,
        planId: selectedPlanForCheckout.id,
        profile,
        onSuccess: (verifyResult) => {
          setIsProcessing(false);
          setSelectedPlanForCheckout(null);
          setVerifiedSuccessData({
            planName: verifyResult.planName || selectedPlanForCheckout.name,
            transactionId: verifyResult.transactionId || `TXN_${Date.now()}`,
            expiresAt: verifyResult.expiresAt,
            entitlementsGranted: verifyResult.entitlementsGranted || selectedPlanForCheckout.included_products,
          });
          onPlanUpgraded();
        },
        onFailure: (errMsg) => {
          setIsProcessing(false);
          setCheckoutError(errMsg);
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      setCheckoutError(err.message || 'Order initialization failed');
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (activeCategory === 'bundles') return p.product_type === 'bundle';
    if (activeCategory === 'modules') return ['mcq_bank', 'pyq_bank', 'test_series', 'ai_pro', 'video_library'].includes(p.product_type);
    if (activeCategory === 'single') return p.product_type === 'single_item';
    return true;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              OFFICIAL MONETIZATION & SUBSCRIPTION PORTAL
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Targeted Civil Engineering Plans & Test Passes
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Transparent, student-friendly pricing with server-verified Razorpay payments, instant product unlock, and 256-bit SSL encryption.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowMyPurchases(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md shadow-lg transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              My Purchases & Active Passes
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
          {[
            { id: 'all', label: 'All Plans & Passes' },
            { id: 'bundles', label: 'All-In-One Combos' },
            { id: 'modules', label: 'Subject / Module Passes' },
            { id: 'single', label: 'Single Purchases (₹49+)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-white text-slate-900 shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching verified plans from server database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const isFree = plan.price === 0;
            const isFeatured = plan.featured;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? 'bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white shadow-2xl border-2 border-blue-500 ring-4 ring-blue-500/20'
                    : 'bg-white text-slate-900 shadow-sm hover:shadow-xl border border-slate-200'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-7">
                    <span
                      className={`px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide shadow-md ${
                        isFeatured
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="pt-2">
                    <h3 className={`text-xl font-black ${isFeatured ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-2 leading-relaxed ${isFeatured ? 'text-slate-300' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="mt-6 pt-4 border-t border-slate-200/20 flex items-baseline gap-2.5">
                    <span className={`text-4xl font-black ${isFeatured ? 'text-white' : 'text-slate-900'}`}>
                      {isFree ? 'Free' : `₹${plan.price}`}
                    </span>
                    {plan.original_price && plan.original_price > plan.price && (
                      <span className={`text-sm line-through ${isFeatured ? 'text-slate-400' : 'text-slate-400'}`}>
                        ₹{plan.original_price}
                      </span>
                    )}
                    <span className={`text-xs font-semibold ${isFeatured ? 'text-slate-300' : 'text-slate-500'}`}>
                      / {plan.duration} {plan.duration_unit}
                    </span>
                  </div>

                  {/* Included Features */}
                  <div className="mt-6 space-y-2.5">
                    <span className={`text-[11px] font-bold uppercase tracking-wider block ${isFeatured ? 'text-blue-300' : 'text-slate-400'}`}>
                      Included in this pass:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isFeatured ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={isFeatured ? 'text-slate-200' : 'text-slate-700'}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buy Action */}
                <div className="mt-8 pt-6 border-t border-slate-200/20">
                  <button
                    onClick={() => {
                      setSelectedPlanForCheckout(plan);
                      setAppliedDiscount(null);
                      setCouponCode('');
                      setCheckoutError(null);
                    }}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                      isFeatured
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/30'
                        : isFree
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-blue-800 hover:bg-blue-900 text-white shadow-blue-900/20'
                    }`}
                  >
                    {isFree ? 'Current Plan (Free)' : `Unlock ${plan.name}`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE PLAN COMPARISON MATRIX */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Feature & Entitlement Comparison Matrix</h2>
          <p className="text-xs text-slate-500">
            Compare access limits, question bank volumes, test mock series and AI tutor quotas across all plans
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Feature / Capability</th>
                <th className="p-4 text-center">Free Starter</th>
                <th className="p-4 text-center">Plan A (MCQ)</th>
                <th className="p-4 text-center">Plan B (PYQ)</th>
                <th className="p-4 text-center">Plan C (Tests)</th>
                <th className="p-4 text-center">Plan D (AI Pro)</th>
                <th className="p-4 text-center bg-blue-900">Plan F (Combo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="p-4 font-bold text-slate-900">Civil MCQ Question Bank</td>
                <td className="p-4 text-center text-slate-500">20 / Day</td>
                <td className="p-4 text-center font-bold text-emerald-600">20,000+ Unlimited</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-500">50 / Day</td>
                <td className="p-4 text-center font-bold text-emerald-600 bg-blue-50/50">20,000+ Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-900">Previous Year Questions (PYQ)</td>
                <td className="p-4 text-center text-slate-500">Sample Only</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center font-bold text-emerald-600">15 Years Verified</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center font-bold text-emerald-600 bg-blue-50/50">15 Years Verified</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-900">TCS iON CBT Mock Test Series</td>
                <td className="p-4 text-center text-slate-500">1 Demo Test</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center font-bold text-emerald-600">50+ Tests Unlimited</td>
                <td className="p-4 text-center text-slate-400">2 Tests</td>
                <td className="p-4 text-center font-bold text-emerald-600 bg-blue-50/50">50+ Tests Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-900">AI Civil Tutor (Gemini 2.5 Flash)</td>
                <td className="p-4 text-center text-slate-500">5 Queries/Day</td>
                <td className="p-4 text-center text-slate-500">15 Queries/Day</td>
                <td className="p-4 text-center text-slate-500">15 Queries/Day</td>
                <td className="p-4 text-center text-slate-500">20 Queries/Day</td>
                <td className="p-4 text-center font-bold text-blue-700">150 Queries/Day</td>
                <td className="p-4 text-center font-bold text-blue-700 bg-blue-50/50">300 Queries/Day</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-900">Formula Lab & Calculator Suite</td>
                <td className="p-4 text-center text-emerald-600">Included</td>
                <td className="p-4 text-center text-emerald-600">Included</td>
                <td className="p-4 text-center text-emerald-600">Included</td>
                <td className="p-4 text-center text-emerald-600">Included</td>
                <td className="p-4 text-center text-emerald-600">Included</td>
                <td className="p-4 text-center text-emerald-600 bg-blue-50/50">Included</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-900">Smart Study Planner & Revision</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center font-bold text-emerald-600">Mistake Notebook</td>
                <td className="p-4 text-center font-bold text-emerald-600">Mistake Notebook</td>
                <td className="p-4 text-center font-bold text-emerald-600">Speed Analytics</td>
                <td className="p-4 text-center font-bold text-emerald-600">AI Planner Pro</td>
                <td className="p-4 text-center font-bold text-emerald-600 bg-blue-50/50">Full Suite</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-900">Video Masterclass & Practicals</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center font-bold text-emerald-600 bg-blue-50/50">Full Video Library</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHECKOUT MODAL WITH RAZORPAY INTEGRATION */}
      {/* ========================================================================= */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Secure Razorpay Checkout</h3>
                  <p className="text-xs text-slate-300">256-Bit SSL Encrypted Payment</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedPlanForCheckout.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Validity: {selectedPlanForCheckout.duration} {selectedPlanForCheckout.duration_unit}
                    </p>
                  </div>
                  <span className="text-base font-black text-slate-900">
                    ₹{selectedPlanForCheckout.price}.00
                  </span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold border-t border-slate-200 pt-2">
                    <span>Coupon Discount ({appliedDiscount.code}):</span>
                    <span>- ₹{appliedDiscount.discountAmount}.00</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Payable Amount:</span>
                  <span className="text-blue-700 font-mono text-base">
                    ₹{appliedDiscount ? appliedDiscount.finalPrice : selectedPlanForCheckout.price}.00
                  </span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block font-bold text-slate-700">Have a Promo / Scholarship Coupon?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Try SP50, CIVIL50, ENGINEER20"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-mono uppercase text-xs focus:outline-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? 'Validating...' : 'Apply'}
                  </button>
                </div>
                {appliedDiscount && (
                  <p className="text-[11px] text-emerald-600 font-semibold">{appliedDiscount.message}</p>
                )}
                {checkoutError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{checkoutError}</p>
                )}
              </form>

              {/* Student Details Pre-check */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-700 space-y-1">
                <span className="font-bold text-blue-900 block">Student Account:</span>
                <p className="text-[11px]">{profile.name} ({profile.email})</p>
                <p className="text-[10px] text-slate-500">
                  Entitlements will be linked immediately to this authenticated email address upon verified payment.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleInitiatePayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-sm shadow-xl shadow-blue-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting to Razorpay Gateway...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Proceed to Pay ₹{appliedDiscount ? appliedDiscount.finalPrice : selectedPlanForCheckout.price} via Razorpay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERIFIED SUCCESS SCREEN */}
      {/* ========================================================================= */}
      {verifiedSuccessData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Payment Verified</span>
              <h3 className="text-xl font-black text-slate-900">{verifiedSuccessData.planName} Unlocked!</h3>
              <p className="text-xs text-slate-500">
                Your server-side entitlements have been activated successfully.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{verifiedSuccessData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access Valid Until:</span>
                <span className="font-bold text-slate-900">
                  {new Date(verifiedSuccessData.expiresAt).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Products Unlocked:</span>
                <div className="flex flex-wrap gap-1">
                  {verifiedSuccessData.entitlementsGranted.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setVerifiedSuccessData(null);
                setShowMyPurchases(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-lg transition-colors"
            >
              View My Active Entitlements
            </button>
          </div>
        </div>
      )}

      {/* Student Purchases Modal */}
      <MyPurchasesModal
        isOpen={showMyPurchases}
        onClose={() => setShowMyPurchases(false)}
        profile={profile}
      />

      {/* Razorpay Merchant Compliance Footer */}
      <div className="mt-12 pt-8 border-t border-slate-200 text-center space-y-4">
        <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200 max-w-3xl mx-auto text-xs text-slate-700 space-y-1">
          <div className="font-bold text-sky-950 flex items-center justify-center space-x-2">
            <Building2 className="w-4 h-4 text-sky-700" />
            <span>Operated & Billed by PRIME MULTI SERVICES AND SUPPLIERS</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Registered under Maharashtra Shops and Establishments Act & MSME Udyam Registration (Govt. of India) • Official Payment Gateway Partner: Razorpay
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs text-slate-600 font-semibold">
          <button
            onClick={() => (setActiveView ? setActiveView('terms-conditions') : setActivePolicyModal('terms'))}
            className="hover:text-sky-700 transition-colors cursor-pointer underline"
          >
            Terms & Conditions
          </button>
          <span>•</span>
          <button
            onClick={() => (setActiveView ? setActiveView('privacy-policy') : setActivePolicyModal('privacy'))}
            className="hover:text-sky-700 transition-colors cursor-pointer underline"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => (setActiveView ? setActiveView('refund-policy') : setActivePolicyModal('refund'))}
            className="hover:text-sky-700 transition-colors cursor-pointer underline"
          >
            Cancellation & Refund Policy
          </button>
          <span>•</span>
          <button
            onClick={() => (setActiveView ? setActiveView('shipping-policy') : setActivePolicyModal('shipping'))}
            className="hover:text-sky-700 transition-colors cursor-pointer underline"
          >
            Shipping Policy
          </button>
          <span>•</span>
          <button
            onClick={() => (setActiveView ? setActiveView('contact-us') : setActivePolicyModal('contact'))}
            className="hover:text-sky-700 transition-colors cursor-pointer underline"
          >
            Contact & Support
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          © 2026 PRIME MULTI SERVICES AND SUPPLIERS. All payments are securely tokenized and processed via Razorpay with 256-bit bank-grade SSL encryption.
        </p>
      </div>

      {/* Policy Details Modal */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4 text-slate-800 text-xs relative">
            <button
              onClick={() => setActivePolicyModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activePolicyModal === 'terms' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sky-600 font-mono font-bold text-[10px] uppercase">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Terms & Conditions — Engineering Officer BY MH
                </h3>
                <p>By purchasing subscriptions or mock test passes on <strong>Engineering Officer BY MH</strong>, operated by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> (Registered under Maharashtra Shop Act & Udyam MSME), you agree to the following terms:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Account Usage:</strong> Subscriptions are single-aspirant licenses strictly for individual competitive examination study. Account sharing is strictly prohibited.</li>
                  <li><strong>Intellectual Property:</strong> All MCQs, explanations, mock test questions, and engineering calculators are proprietary assets of PRIME MULTI SERVICES AND SUPPLIERS.</li>
                  <li><strong>Payment Gateway:</strong> All payments are securely processed by Razorpay. Entitlements are unlocked instantaneously upon payment verification.</li>
                  <li><strong>Jurisdiction:</strong> All transactions and disputes are governed by Indian law subject to Maharashtra jurisdiction.</li>
                </ul>
                {setActiveView && (
                  <button
                    onClick={() => {
                      setActivePolicyModal(null);
                      setActiveView('terms-conditions');
                    }}
                    className="mt-2 text-sky-700 font-bold hover:underline"
                  >
                    View Full Dedicated Terms & Conditions Page →
                  </button>
                )}
              </div>
            )}

            {activePolicyModal === 'privacy' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sky-600 font-mono font-bold text-[10px] uppercase">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Privacy Policy & Data Security
                </h3>
                <p>We respect candidate privacy and are committed to safeguarding personal information:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Information Collected:</strong> Candidate name, email address, mobile number, and test performance metrics.</li>
                  <li><strong>Payment Protection:</strong> We do NOT store card numbers, CVV, or UPI PINs. All financial transactions are handled securely by Razorpay (PCI-DSS Level 1 compliant).</li>
                  <li><strong>Supabase Data Architecture:</strong> Scalable PostgreSQL data storage ensuring high reliability with zero reading limits.</li>
                  <li><strong>Zero Commercial Selling:</strong> Candidate data is never traded or shared with external advertising syndicates.</li>
                </ul>
                {setActiveView && (
                  <button
                    onClick={() => {
                      setActivePolicyModal(null);
                      setActiveView('privacy-policy');
                    }}
                    className="mt-2 text-sky-700 font-bold hover:underline"
                  >
                    View Full Dedicated Privacy Policy Page →
                  </button>
                )}
              </div>
            )}

            {activePolicyModal === 'refund' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sky-600 font-mono font-bold text-[10px] uppercase">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Cancellation & Refund Policy (Strictly English Policy)
                </h3>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                  <div className="font-bold">No Refund Once Activated:</div>
                  <p>
                    All plans, test series, and study materials are digital services delivered instantaneously upon payment authorization. Therefore, <strong>once a digital plan is activated, NO REFUNDS, NO CANCELLATIONS, AND NO EXCHANGES WILL BE ISSUED UNDER ANY CIRCUMSTANCES.</strong>
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">Accidental Duplicate / Double Payments:</div>
                  <p>
                    If a candidate is charged more than once for the same transaction due to a network glitch or gateway timeout, report the issue with Razorpay Payment IDs to <strong>gitevijay123@gmail.com</strong>.
                  </p>
                  <p>
                    After verification within 24 to 48 hours, the duplicate amount will be refunded directly back to the original payment source within <strong>3 to 5 business days</strong>.
                  </p>
                </div>
                {setActiveView && (
                  <button
                    onClick={() => {
                      setActivePolicyModal(null);
                      setActiveView('refund-policy');
                    }}
                    className="mt-2 text-sky-700 font-bold hover:underline"
                  >
                    View Full Dedicated Refund Policy Page →
                  </button>
                )}
              </div>
            )}

            {activePolicyModal === 'shipping' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sky-600 font-mono font-bold text-[10px] uppercase">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Digital Shipping & Delivery Policy
                </h3>
                <p>All products and services provided on this platform are 100% digital goods and online educational services:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Instantaneous Delivery:</strong> Test series passes and question bank access are unlocked electronically within 0 to 60 seconds of Razorpay payment confirmation.</li>
                  <li><strong>No Physical Shipping:</strong> No physical parcels, printed books, or couriers are involved; zero shipping fees are charged.</li>
                </ul>
                {setActiveView && (
                  <button
                    onClick={() => {
                      setActivePolicyModal(null);
                      setActiveView('shipping-policy');
                    }}
                    className="mt-2 text-sky-700 font-bold hover:underline"
                  >
                    View Full Dedicated Shipping Policy Page →
                  </button>
                )}
              </div>
            )}

            {activePolicyModal === 'contact' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sky-600 font-mono font-bold text-[10px] uppercase">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Contact Us & Merchant Details
                </h3>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                  <div><strong>Operating Business Entity:</strong> PRIME MULTI SERVICES AND SUPPLIERS</div>
                  <div><strong>Platform:</strong> Engineering Officer BY MH</div>
                  <div><strong>Licensing:</strong> Maharashtra Shop & Establishment Act | Udyam MSME Registered</div>
                  <div><strong>Support Email:</strong> gitevijay123@gmail.com</div>
                  <div><strong>Support Helpline:</strong> +91 93708 72123</div>
                  <div><strong>Operating Address:</strong> Maharashtra, India</div>
                  <div><strong>Working Hours:</strong> Monday – Saturday (10:00 AM – 6:00 PM IST)</div>
                </div>
                {setActiveView && (
                  <button
                    onClick={() => {
                      setActivePolicyModal(null);
                      setActiveView('contact-us');
                    }}
                    className="mt-2 text-sky-700 font-bold hover:underline"
                  >
                    View Full Dedicated Contact Page →
                  </button>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
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
