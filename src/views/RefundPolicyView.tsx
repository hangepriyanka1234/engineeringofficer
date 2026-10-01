import React from 'react';
import {
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Building2,
  Mail,
  AlertTriangle,
  ArrowLeft,
  FileCheck2,
  CreditCard,
  Scale
} from 'lucide-react';

interface RefundPolicyViewProps {
  onBack?: () => void;
  setActiveView?: (view: string) => void;
}

export const RefundPolicyView: React.FC<RefundPolicyViewProps> = ({
  onBack,
  setActiveView,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (onBack ? onBack() : setActiveView ? setActiveView('plans') : window.history.back())}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>प्लॅन्स व शुल्काकडे परत जा (Back to Plans)</span>
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Razorpay Compliant Merchant Policy</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Effective Date: 2026</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase">
          <Building2 className="w-4 h-4" />
          <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Cancellation & Refund Policy (परतावा व रद्दीकरण धोरण)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official statutory policy governing order cancellations, digital product deliveries, and duplicate transaction refund procedures for <strong>Engineering Officer BY MH</strong>, operated and billed by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>.
        </p>
      </div>

      {/* Entity & Licensing Disclosure Banner */}
      <div className="p-4 bg-sky-50/80 rounded-xl border border-sky-200 text-slate-800 text-xs space-y-2">
        <div className="font-bold text-sky-950 flex items-center space-x-2 text-sm">
          <Building2 className="w-4 h-4 text-sky-700" />
          <span>Merchant Operator & Legal Entity Disclosure:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px] text-slate-700 pt-1">
          <div className="p-2.5 bg-white rounded-lg border border-sky-100">
            <span className="text-slate-400 block text-[10px]">OPERATING ENTITY</span>
            <span className="font-bold text-slate-900">PRIME MULTI SERVICES AND SUPPLIERS</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-sky-100">
            <span className="text-slate-400 block text-[10px]">REGISTRATIONS & LICENSES</span>
            <span className="font-bold text-slate-900">Maharashtra Shop Act & MSME Udyam</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-sky-100">
            <span className="text-slate-400 block text-[10px]">PAYMENT GATEWAY</span>
            <span className="font-bold text-slate-900">Razorpay Software Private Limited</span>
          </div>
        </div>
      </div>

      {/* Main Policy Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 text-slate-800 text-xs sm:text-sm leading-relaxed">
        {/* Core Clause 1: Digital Nature of Service & Strict Non-Refundability Post-Activation */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>1. Digital Nature of Services & Strict No-Refund Policy Post-Activation</span>
          </h2>
          <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-300 text-amber-950 text-xs space-y-2">
            <div className="font-bold text-amber-900 flex items-center space-x-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Mandatory Digital Product Disclosure:</span>
            </div>
            <p className="leading-relaxed">
              All subscription tiers, online test series passes, Previous Year Question (PYQ) master access, formula cheat sheets, video masterclasses, and downloadable e-books provided through <strong>Engineering Officer BY MH</strong> are <strong>intangible, non-physical digital goods</strong> delivered instantaneously upon payment authorization.
            </p>
            <p className="leading-relaxed font-bold text-amber-950 bg-amber-100/80 p-2.5 rounded-lg border border-amber-300">
              PLEASE NOTE: Once a digital plan or subscription has been activated on the user's account, NO REFUNDS, NO CANCELLATIONS, AND NO TRANSFERS WILL BE ISSUED UNDER ANY CIRCUMSTANCES.
            </p>
            <p className="text-slate-700">
              Because digital study materials, test series questions, and recruitment analysis are immediately accessible and consumed in full upon subscription activation, the service is deemed fully delivered at the moment of access provisioning.
            </p>
          </div>
          <p className="text-slate-600">
            Aspirants are strongly encouraged to inspect the free sample questions, preview the publicly accessible syllabus blueprints, and review the demo CBT mock tests before executing any payment.
          </p>
        </section>

        {/* Core Clause 2: Duplicate / Accidental Double Payments */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <CreditCard className="w-5 h-5 text-sky-600 shrink-0" />
            <span>2. Accidental Duplicate / Double Payment Policy</span>
          </h2>
          <p>
            We recognize that due to intermittent network connectivity, bank server timeouts, payment gateway latency, or accidental multiple submissions, a candidate may occasionally be charged more than once for a single intended order. In such genuine technical failure cases, full protection is guaranteed:
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900">Eligibility for Duplicate Payment Reversal:</div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>The candidate was billed twice (or multiple times) for the exact same plan on the same user account within a short timeframe.</li>
              <li>Funds were debited from the candidate's bank account or UPI app, but the transaction timed out or failed to return a success token to our application server, resulting in an inadvertent second payment attempt.</li>
            </ul>
          </div>
        </section>

        {/* Core Clause 3: Refund Processing Timeline */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>3. Refund Processing Timeline (3 to 5 Business Days)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-slate-400 block text-[10px] uppercase">Step 1: Verification</span>
              <span className="font-bold text-slate-900 block text-sm">24 to 48 Hours</span>
              <p className="text-slate-600 text-[11px]">
                Our accounts team cross-verifies bank transaction logs and Razorpay Order / Payment IDs.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
              <span className="font-mono text-sky-600 block text-[10px] uppercase">Step 2: Gateway Reversal</span>
              <span className="font-bold text-sky-950 block text-sm">Automated API Release</span>
              <p className="text-sky-800 text-[11px]">
                The refund instruction is triggered directly through Razorpay's verified banking API.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="font-mono text-emerald-600 block text-[10px] uppercase">Step 3: Source Account Credit</span>
              <span className="font-bold text-emerald-950 block text-sm">3 to 5 Business Days</span>
              <p className="text-emerald-800 text-[11px]">
                Amount reflects directly in candidate's original bank account, card, or UPI VPA (3–4 banking days).
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-xs">
            <em>Important Notice: Credited funds will return exclusively to the original payment instrument used during the transaction. Under no circumstances will refunds be issued in cash or transferred to alternative third-party accounts.</em>
          </p>
        </section>

        {/* Core Clause 4: Step-by-Step Refund Reporting Process */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <FileCheck2 className="w-5 h-5 text-purple-600 shrink-0" />
            <span>4. How to Report a Duplicate Payment or Billing Discrepancy</span>
          </h2>
          <p>
            To report a double payment or raise a billing discrepancy, the candidate must send an email to our official billing desk within <strong>seven (7) days</strong> of the transaction date:
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900">Email Submission Checklist:</div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-700">
              <li><strong>To:</strong> gitevijay123@gmail.com</li>
              <li><strong>Subject:</strong> "DUPLICATE PAYMENT REFUND REQUEST — [Your Registered Email / Phone]"</li>
              <li><strong>Razorpay Payment IDs:</strong> e.g., <code>pay_XXXXXXXXXX</code> (from your SMS / Email receipt)</li>
              <li><strong>Order ID / Date:</strong> Date and timestamp of both transactions</li>
              <li><strong>Bank Statement Screenshot:</strong> Showing the debit reference and UTR number</li>
            </ol>
          </div>
        </section>

        {/* Core Clause 5: Plan Cancellations & Non-Recurring Purchases */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <RotateCcw className="w-5 h-5 text-sky-600 shrink-0" />
            <span>5. Subscription Validity & Non-Recurring Purchases</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Non-Recurring One-Time Purchases:</strong> All plans on our portal are one-time advance payments for specified durations (e.g. 1 month, 6 months, or 12 months). We do NOT automatically charge or auto-debit candidate cards without explicit consent.</li>
            <li><strong>Mid-Term Termination:</strong> Candidates may discontinue using the portal at their sole discretion; however, mid-term cessation will not entitle the candidate to partial or prorated refunds.</li>
            <li><strong>Account Suspension for Malpractice:</strong> If an account is suspended or permanently blocked due to copyright infringement, test piracy, scraping question banks, or unauthorized password sharing, all remaining plan validity is forfeited without refund.</li>
          </ul>
        </section>

        {/* Section 6: Official Merchant Information */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Building2 className="w-5 h-5 text-sky-600 shrink-0" />
            <span>6. Merchant Details & Support Desk</span>
          </h2>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
            <div><strong>Operating Business Entity:</strong> PRIME MULTI SERVICES AND SUPPLIERS</div>
            <div><strong>Registered App / Platform:</strong> Engineering Officer BY MH</div>
            <div><strong>Official Support Email:</strong> gitevijay123@gmail.com</div>
            <div><strong>Helpline:</strong> +91 93708 72123</div>
            <div><strong>Licensing:</strong> Shop & Establishment Act (Maharashtra) & Udyam MSME Registration (Govt. of India)</div>
            <div><strong>Support Timings:</strong> Monday to Saturday (10:00 AM to 6:00 PM IST)</div>
            <div><strong>Merchant State / Country:</strong> Maharashtra, India</div>
          </div>
        </section>
      </div>

      {/* Footer Quick Links */}
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
            onClick={() => setActiveView && setActiveView('shipping-policy')}
            className="hover:text-sky-700 underline"
          >
            Shipping Policy
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
