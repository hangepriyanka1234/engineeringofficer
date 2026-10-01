import React from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  CreditCard,
  Building2,
  FileText,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Server
} from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack?: () => void;
  setActiveView?: (view: string) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({
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
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 & Razorpay Compliant</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Last Updated: 2026</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase">
          <Building2 className="w-4 h-4" />
          <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Privacy Policy (गोपनीयता धोरण)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official Privacy Policy governing candidate data protection, Supabase infrastructure, and Razorpay payment security for the <strong>Engineering Officer BY MH</strong> competitive examination preparation portal, owned and operated by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>.
        </p>
      </div>

      {/* Statutory Operator & Licensing Disclosure */}
      <div className="p-4 bg-sky-50/80 rounded-xl border border-sky-200 text-slate-800 text-xs space-y-2">
        <div className="font-bold text-sky-950 flex items-center space-x-2 text-sm">
          <Building2 className="w-4 h-4 text-sky-700" />
          <span>Statutory Business Operator & Licensing Details:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px] text-slate-700 pt-1">
          <div className="p-2.5 bg-white rounded-lg border border-sky-100">
            <span className="text-slate-400 block text-[10px]">LEGAL OPERATING ENTITY</span>
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

      {/* Main Legal Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 text-slate-800 text-xs sm:text-sm leading-relaxed">
        {/* Section 1: Merchant & Entity Disclosure */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Building2 className="w-5 h-5 text-sky-600 shrink-0" />
            <span>1. Merchant Entity & Scope of Operations</span>
          </h2>
          <p>
            The educational digital platform <strong>Engineering Officer BY MH</strong> (accessible via web and mobile application) is owned, operated, and billed by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> ("We", "Us", or "Our"). We are committed to safeguarding the privacy and personal data of civil engineering diploma and degree candidates utilizing our test engine, past question papers, notes, and study tools.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
            <div><strong>Legal Entity Name:</strong> PRIME MULTI SERVICES AND SUPPLIERS</div>
            <div><strong>Brand & Platform Name:</strong> Engineering Officer BY MH</div>
            <div><strong>Business Nature:</strong> Online Civil Engineering Competitive Exam Preparation & Educational Content Services</div>
            <div><strong>Regulatory Standing:</strong> Registered under Maharashtra Shop & Establishment Act and Udyam MSME Registration (Govt. of India)</div>
            <div><strong>Registered Support Email:</strong> gitevijay123@gmail.com</div>
            <div><strong>Support Helpline:</strong> +91 93708 72123</div>
          </div>
        </section>

        {/* Section 2: Information We Collect */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Eye className="w-5 h-5 text-sky-600 shrink-0" />
            <span>2. Information We Collect</span>
          </h2>
          <p>We collect only the minimal necessary data required to provide seamless educational access, personalized study planning, and verified mock test rankings:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Personal Identity Details:</strong> Candidate full name, email address, mobile number (for account recovery and OTP authentication), and target civil engineering cadre (e.g. MPSC Civil, Maha PWD, WRD, ZP, SSC JE).</li>
            <li><strong>Educational Telemetry:</strong> Test attempt scores, time taken per question, mistake log classifications, speed and accuracy statistics, and bookmark history.</li>
            <li><strong>Technical Diagnostics:</strong> Browser type, operating system version, IP address, and session timestamps to protect accounts from unauthorized multi-device sharing.</li>
          </ul>
        </section>

        {/* Section 3: Payment Data & Razorpay Security */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>3. Payment Information & Razorpay Security Guarantee</span>
          </h2>
          <p>
            All subscription payments for <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> are processed exclusively through <strong>Razorpay Software Private Limited</strong>, an RBI-authorized and PCI-DSS Level 1 compliant payment gateway.
          </p>
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 text-xs space-y-2">
            <div className="font-bold flex items-center space-x-1.5 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Financial Storage Pledge:</span>
            </div>
            <p>
              We do <strong>NOT</strong> collect, store, view, or process your credit/debit card numbers, CVV codes, net banking passwords, or UPI MPINs on our servers. All financial input is directly and securely tokenized within Razorpay’s encrypted payment framework under 256-bit bank-grade SSL encryption.
            </p>
          </div>
        </section>

        {/* Section 4: Data Storage & Supabase High-Capacity Architecture */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Database className="w-5 h-5 text-sky-600 shrink-0" />
            <span>4. Database Architecture & No-Limits Storage (Supabase)</span>
          </h2>
          <p>
            To deliver instantaneous page loads, zero reading quota bottlenecks, and real-time state synchronization, candidate progress and question bank data are hosted on a robust, scalable <strong>Supabase (PostgreSQL)</strong> infrastructure with Row Level Security (RLS) policies. Candidate data is strictly isolated; no user can access another candidate’s personal notes or confidential analytics.
          </p>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-sky-600" />
              <span>Zero Read-Limit Architecture:</span>
            </div>
            <p>
              Unlike traditional document databases with restrictive daily read quotas, our Supabase PostgreSQL architecture handles extensive question bank queries, mock test submissions, and PYQ lookups without rate throttling, ensuring rapid and uninterrupted access for all students.
            </p>
          </div>
        </section>

        {/* Section 5: No Third-Party Selling */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Lock className="w-5 h-5 text-rose-600 shrink-0" />
            <span>5. Non-Disclosure & Zero Advertising Networks</span>
          </h2>
          <p>
            <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> maintains an absolute zero-tolerance policy against commercial data trading:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>We do <strong>NOT</strong> sell, rent, lease, or monetize candidate data to any third-party marketing companies, coaching brokers, or external advertising syndicates.</li>
            <li>We do not display predatory third-party advertising SDKs or tracking pixels that compromise candidate focus.</li>
            <li>All communications sent to your registered email are strictly transactional (e.g. order confirmations, exam date announcements, syllabus alerts, and account password resets).</li>
          </ul>
        </section>

        {/* Section 6: Candidate Rights under DPDP Act 2023 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <FileText className="w-5 h-5 text-purple-600 shrink-0" />
            <span>6. Your Legal Rights & Data Portability</span>
          </h2>
          <p>In accordance with the Digital Personal Data Protection Act, 2023 (India), every student has the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Access & Review:</strong> View all profile information, subscription history, and test score telemetry directly from the Profile view.</li>
            <li><strong>Correction & Update:</strong> Modify your name, target exam preferences, and contact information at any time.</li>
            <li><strong>Erasure & Deletion:</strong> Request complete account closure and removal of telemetry records by emailing our Grievance Officer.</li>
          </ul>
        </section>

        {/* Section 7: Grievance Officer & Contact */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Mail className="w-5 h-5 text-sky-600 shrink-0" />
            <span>7. Grievance Redressal & Merchant Contact</span>
          </h2>
          <p>For any questions, privacy concerns, or data requests, please contact our designated Grievance Officer:</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
            <div><strong>Operating Entity:</strong> PRIME MULTI SERVICES AND SUPPLIERS</div>
            <div><strong>Attn:</strong> Grievance Officer / Privacy Redressal Cell</div>
            <div><strong>Official Email:</strong> gitevijay123@gmail.com</div>
            <div><strong>Helpline:</strong> +91 93708 72123</div>
            <div><strong>Jurisdiction:</strong> Maharashtra, India</div>
            <div><strong>Response Turnaround:</strong> Within 24–48 working hours</div>
          </div>
        </section>
      </div>

      {/* Footer Quick Links to other Legal Pages */}
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
