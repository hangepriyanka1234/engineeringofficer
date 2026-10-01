import React from 'react';
import {
  Truck,
  Zap,
  Building2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Mail,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface ShippingPolicyViewProps {
  onBack?: () => void;
  setActiveView?: (view: string) => void;
}

export const ShippingPolicyView: React.FC<ShippingPolicyViewProps> = ({
  onBack,
  setActiveView,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (onBack ? onBack() : setActiveView ? setActiveView('dashboard') : window.history.back())}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पानावर परत जा (Back to Dashboard)</span>
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digital Delivery Compliant</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Effective: 2026</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase">
          <Building2 className="w-4 h-4" />
          <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Shipping & Delivery Policy (डिजिटल वितरण धोरण)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official terms governing the electronic delivery and fulfillment of digital educational plans, test series, and study materials on <strong>Engineering Officer BY MH</strong>, operated by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>.
        </p>
      </div>

      {/* Main Delivery Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 text-slate-800 text-xs sm:text-sm leading-relaxed">
        {/* Section 1: 100% Digital Delivery Model */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <span>1. 100% Instant Digital Fulfillment (Zero Physical Shipping)</span>
          </h2>
          <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-950 text-xs space-y-2">
            <div className="font-bold flex items-center space-x-1.5 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instantaneous Electronic Provisioning:</span>
            </div>
            <p>
              All products, subscriptions, and services offered on <strong>Engineering Officer BY MH</strong> are <strong>purely digital goods and electronic educational services</strong>. We do NOT ship or physically deliver any physical books, paper question papers, or hard-copy postal packets.
            </p>
            <p className="font-semibold">
              Consequently, there are NO physical shipping charges, courier transit delays, or postal handling fees applicable to any transaction.
            </p>
          </div>
        </section>

        {/* Section 2: Delivery Timeline */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Clock className="w-5 h-5 text-sky-600 shrink-0" />
            <span>2. Delivery Timeline & Access Confirmation</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-slate-400 block text-[10px] uppercase">Step 1: Payment</span>
              <span className="font-bold text-slate-900 block text-sm">Instant Authorization</span>
              <p className="text-slate-600 text-[11px]">
                Payment is authorized in real time via Razorpay Gateway (UPI / Card / NetBanking).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
              <span className="font-mono text-sky-600 block text-[10px] uppercase">Step 2: Entitlement</span>
              <span className="font-bold text-sky-950 block text-sm">Within 0 to 60 Seconds</span>
              <p className="text-sky-800 text-[11px]">
                Plan is bound to your student account and all test series & question banks are unlocked.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="font-mono text-emerald-600 block text-[10px] uppercase">Step 3: Receipt</span>
              <span className="font-bold text-emerald-950 block text-sm">Email Confirmation</span>
              <p className="text-emerald-800 text-[11px]">
                A payment confirmation receipt with Razorpay Payment ID is emailed automatically.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Technical Delivery Assistance */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <FileCheck className="w-5 h-5 text-purple-600 shrink-0" />
            <span>3. Technical Assistance & Non-Delivery Support</span>
          </h2>
          <p>
            If due to network disruption or temporary server latency your plan is not unlocked within 5 minutes of debit, please follow these steps:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Log out and log back in or refresh your browser to re-sync entitlement tokens with the server.</li>
            <li>If the status still shows inactive, email our technical helpdesk at <strong>gitevijay123@gmail.com</strong> with your Razorpay Payment ID.</li>
            <li>Our support team will manually verify the payment logs and activate your plan within <strong>2 to 4 business hours</strong>.</li>
          </ul>
        </section>

        {/* Section 4: Merchant Operator Details */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Building2 className="w-5 h-5 text-sky-600 shrink-0" />
            <span>4. Merchant Entity & Contact Information</span>
          </h2>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
            <div><strong>Business Entity:</strong> PRIME MULTI SERVICES AND SUPPLIERS</div>
            <div><strong>App / Platform:</strong> Engineering Officer BY MH</div>
            <div><strong>Licensing:</strong> Maharashtra Shop & Establishment Act | Udyam MSME Registered</div>
            <div><strong>Official Email:</strong> gitevijay123@gmail.com</div>
            <div><strong>Helpline:</strong> +91 93708 72123 (10 AM to 6 PM IST, Mon–Sat)</div>
            <div><strong>State / Country:</strong> Maharashtra, India</div>
          </div>
        </section>
      </div>

      {/* Footer Navigation Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100 rounded-xl text-xs text-slate-600">
        <span>© 2026 PRIME MULTI SERVICES AND SUPPLIERS. All rights reserved.</span>
        <div className="flex items-center space-x-3 font-semibold">
          <button
            onClick={() => setActiveView && setActiveView('terms-conditions')}
            className="hover:text-sky-700 underline"
          >
            Terms & Conditions
          </button>
          <span>·</span>
          <button
            onClick={() => setActiveView && setActiveView('privacy-policy')}
            className="hover:text-sky-700 underline"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button
            onClick={() => setActiveView && setActiveView('refund-policy')}
            className="hover:text-sky-700 underline"
          >
            Refund Policy
          </button>
          <span>·</span>
          <button
            onClick={() => setActiveView && setActiveView('contact-us')}
            className="hover:text-sky-700 underline"
          >
            Contact Merchant
          </button>
        </div>
      </div>
    </div>
  );
};
