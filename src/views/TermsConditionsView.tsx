import React from 'react';
import {
  FileText,
  ShieldCheck,
  Building2,
  Lock,
  CreditCard,
  AlertTriangle,
  Scale,
  ArrowLeft,
  CheckCircle2,
  Mail,
  UserCheck,
  Clock
} from 'lucide-react';

interface TermsConditionsViewProps {
  onBack?: () => void;
  setActiveView?: (view: string) => void;
}

export const TermsConditionsView: React.FC<TermsConditionsViewProps> = ({
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
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Razorpay & Legal Compliance Verified</span>
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
          Terms and Conditions (नियम व अटी)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official Terms of Service governing the use of the <strong>Engineering Officer BY MH</strong> competitive examination preparation portal, owned, operated, and legally billed by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>.
        </p>
      </div>

      {/* Mandatory Statutory Entity Disclosure Banner */}
      <div className="p-4 bg-sky-50/80 rounded-xl border border-sky-200 text-slate-800 text-xs space-y-2">
        <div className="font-bold text-sky-950 flex items-center space-x-2 text-sm">
          <Building2 className="w-4 h-4 text-sky-700" />
          <span>Statutory Business Operator & Licensing Details:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px] text-slate-700 pt-1">
          <div className="p-2.5 bg-white rounded-lg border border-sky-100">
            <span className="text-slate-400 block text-[10px]">LEGAL ENTITY</span>
            <span className="font-bold text-slate-900">PRIME MULTI SERVICES AND SUPPLIERS</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-sky-100">
            <span className="text-slate-400 block text-[10px]">REGISTRATIONS & LICENSING</span>
            <span className="font-bold text-slate-900">Maharashtra Shop Act & Udyam MSME Registered</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-sky-100">
            <span className="text-slate-400 block text-[10px]">PAYMENT GATEWAY</span>
            <span className="font-bold text-slate-900">Razorpay (RBI & PCI-DSS Authorized)</span>
          </div>
        </div>
      </div>

      {/* Legal Content Sections */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 text-slate-800 text-xs sm:text-sm leading-relaxed">
        {/* Section 1: Agreement to Terms */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Scale className="w-5 h-5 text-sky-600 shrink-0" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By creating an account, browsing this website, or purchasing any digital subscriptions, CBT test series, previous year solved questions (PYQs), or study materials on <strong>Engineering Officer BY MH</strong>, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
          <p>
            This portal is operated exclusively by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> ("Merchant", "We", "Us"). If you do not agree with any part of these Terms, you must immediately cease accessing or using our services.
          </p>
        </section>

        {/* Section 2: Scope of Educational Services */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <FileText className="w-5 h-5 text-sky-600 shrink-0" />
            <span>2. Nature & Scope of Educational Services</span>
          </h2>
          <p>
            <strong>Engineering Officer BY MH</strong> is an independent civil engineering competitive examination preparation portal designed for Diploma and Degree Civil Engineering aspirants preparing for exams such as MPSC Civil (MES), Maharashtra PWD, Water Resources Department (WRD), Zilla Parishad (ZP), BMC, SSC JE, RRB JE, and related engineering cadres.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Digital Test Engine:</strong> Online CBT mock tests, instant scoring, percentile calculations, and question analytics.</li>
            <li><strong>PYQ Database:</strong> Shift-wise solved question papers from past official recruitment tests with codal references (IS 456, IS 800, IRC, etc.).</li>
            <li><strong>Study Modules & Calculators:</strong> Interactive formula solvers, civil engineering notes, and preparation trackers.</li>
            <li><strong>Private Educational Platform:</strong> This platform is purely a private academic and training resource. We are NOT an official agency of the Government of Maharashtra, MPSC, or any state recruitment board.</li>
          </ul>
        </section>

        {/* Section 3: User Accounts & Single User License */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>3. User Registration & Single-Aspirant License</span>
          </h2>
          <p>
            Each user account registered with <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> is granted a non-exclusive, non-transferable, single-user license strictly for individual educational study:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Prohibition on Account Sharing:</strong> Sharing, renting, leasing, sub-licensing, or broadcasting access credentials to multiple individuals, coaching groups, or batch pools is strictly prohibited.</li>
            <li><strong>Anti-Piracy & Scraping:</strong> Any automated scraping, downloading of entire question banks, reverse-engineering, or unauthorized redistribution of our content will result in immediate termination of the account without any refund, and may invite civil or criminal legal proceedings under the Information Technology Act, 2000.</li>
            <li><strong>Accuracy of Information:</strong> You agree to provide accurate and complete contact information (name, valid email, mobile number) during registration and checkout.</li>
          </ul>
        </section>

        {/* Section 4: Pricing, Payments & Razorpay */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <CreditCard className="w-5 h-5 text-sky-600 shrink-0" />
            <span>4. Pricing, Payments & Gateway Authorization (Razorpay)</span>
          </h2>
          <p>
            All commercial transactions on this platform are processed securely via <strong>Razorpay Software Private Limited</strong>, an RBI-authorized payment gateway:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Currency & Taxes:</strong> All plan prices are quoted in Indian Rupees (INR) and are inclusive/exclusive of applicable statutory GST as indicated at the time of checkout.</li>
            <li><strong>Merchant of Record:</strong> The legal payee and billing merchant appearing on your bank statement, card statement, or UPI transaction receipt is <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>.</li>
            <li><strong>Instant Digital Provisioning:</strong> Upon successful authorization and confirmation from Razorpay, your purchased plan entitlements are instantly activated in your student account.</li>
            <li><strong>No Payment Details Stored:</strong> We do NOT collect, store, or process your credit/debit card numbers, CVVs, Net Banking passwords, or UPI MPINs. All payment processing occurs under Razorpay's PCI-DSS Level 1 compliant secure environment.</li>
          </ul>
        </section>

        {/* Section 5: Cancellation & Non-Refundability */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>5. Cancellation & Non-Refundability of Digital Plans</span>
          </h2>
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-300 text-amber-950 text-xs space-y-2">
            <p className="font-bold">
              Mandatory Digital Product Clause:
            </p>
            <p>
              Because all products offered on this platform are digital goods (e-learning access, CBT mock test attempts, instant question bank solutions, formula sheets) that are provisioned and delivered immediately upon payment, <strong>once a plan is activated, NO REFUND, CANCELLATION, OR EXCHANGE WILL BE GRANTED UNDER ANY CIRCUMSTANCES.</strong>
            </p>
            <p>
              <strong>Accidental Duplicate Payments:</strong> If a customer is charged more than once for the same transaction due to gateway timeout or technical failure, a refund for the duplicate transaction will be credited back to the original payment source within <strong>3 to 5 business days</strong> following verification. Full details are stipulated in our separate <button onClick={() => setActiveView && setActiveView('refund-policy')} className="font-bold underline text-amber-900 hover:text-amber-950">Refund & Cancellation Policy</button>.
            </p>
          </div>
        </section>

        {/* Section 6: Intellectual Property */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Lock className="w-5 h-5 text-purple-600 shrink-0" />
            <span>6. Intellectual Property Rights</span>
          </h2>
          <p>
            All custom graphics, mock test design interfaces, test questions, categorized explanations, algorithmic calculators, and promotional materials displayed on <strong>Engineering Officer BY MH</strong> are the proprietary intellectual property of <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>. No material may be copied, reproduced, republished, uploaded, posted, transmitted, or distributed without prior written permission.
          </p>
        </section>

        {/* Section 7: Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Scale className="w-5 h-5 text-slate-700 shrink-0" />
            <span>7. Limitation of Liability & Exam Outcome Disclaimer</span>
          </h2>
          <p>
            While we strive for the highest academic accuracy and adhere strictly to official government syllabus blueprints and standard Bureau of Indian Standards (BIS) codal clauses, <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> does not guarantee admission, selection, recruitment, or specific marks in any competitive examination. Exam success depends entirely on the candidate's dedication, individual aptitude, and preparation.
          </p>
        </section>

        {/* Section 8: Governing Law & Jurisdiction */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Building2 className="w-5 h-5 text-sky-600 shrink-0" />
            <span>8. Governing Law & Jurisdiction</span>
          </h2>
          <p>
            These Terms and Conditions shall be governed by, and construed in accordance with, the laws of the Republic of India. Any disputes arising out of or related to these Terms, transactions, or services shall be subject to the exclusive jurisdiction of the competent courts in the State of Maharashtra, India.
          </p>
        </section>

        {/* Section 9: Official Contact & Grievance */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Mail className="w-5 h-5 text-sky-600 shrink-0" />
            <span>9. Official Merchant Contact & Grievance Cell</span>
          </h2>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
            <div><strong>Operating Entity:</strong> PRIME MULTI SERVICES AND SUPPLIERS</div>
            <div><strong>Platform:</strong> Engineering Officer BY MH</div>
            <div><strong>Statutory License:</strong> Maharashtra Shop & Establishment Act | Udyam MSME Registered</div>
            <div><strong>Official Email:</strong> gitevijay123@gmail.com</div>
            <div><strong>Support Helpline:</strong> +91 93708 72123</div>
            <div><strong>Operational Hours:</strong> Monday to Saturday (10:00 AM to 6:00 PM IST)</div>
            <div><strong>Jurisdiction:</strong> Maharashtra, India</div>
          </div>
        </section>
      </div>

      {/* Footer Navigation Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100 rounded-xl text-xs text-slate-600">
        <span>© 2026 PRIME MULTI SERVICES AND SUPPLIERS. All rights reserved.</span>
        <div className="flex items-center space-x-3 font-semibold">
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
