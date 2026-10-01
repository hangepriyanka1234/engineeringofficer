import React, { useState } from 'react';
import {
  Headphones,
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Building2,
  HardHat,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowLeft
} from 'lucide-react';

interface ContactSupportViewProps {
  onBack?: () => void;
  setActiveView?: (view: string) => void;
}

export const ContactSupportView: React.FC<ContactSupportViewProps> = ({
  onBack,
  setActiveView,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How quickly are test series and question bank plans activated after payment?',
      a: 'All digital plans on Engineering Officer BY MH are activated instantaneously (within 0–60 seconds) as soon as the Razorpay payment confirmation is received. You can immediately take mock tests and review questions.',
    },
    {
      q: 'What if I am charged twice or double payment occurs during checkout?',
      a: 'If an accidental double payment occurs due to network latency, submit a duplicate payment request with both Razorpay Payment IDs to gitevijay123@gmail.com. After verification within 24–48 hours, the duplicate amount will be refunded directly to your original payment source within 3 to 5 business days.',
    },
    {
      q: 'Can final semester Diploma / B.E. Civil students apply for Maharashtra PWD JE or SSC JE?',
      a: 'For Maharashtra PWD JE & Civil Engineering Assistant (CEA), candidates must possess their qualifying diploma/degree certificate on or before the application cutoff date specified in the official notification. For SSC JE, final year students are eligible if their result is declared before the crucial date.',
    },
    {
      q: 'How can I access previous year papers with verified official answer keys?',
      a: 'Head over to the "Previous Year Papers (PYQs)" tab on the sidebar. All shift-wise papers for Maharashtra PWD, SSC JE, WRD, and MPSC are available for CBT simulation and offline study.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setQuery('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Navigation */}
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
            <span>Official Support Desk</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Mon–Sat: 10 AM – 6 PM</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase">
          <Building2 className="w-4 h-4" />
          <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Contact Us & Support Desk (आमच्याशी संपर्क)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official Merchant & Aspirant Support Desk for <strong>Engineering Officer BY MH</strong>, operated and managed by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>.
        </p>
      </div>

      {/* Grid: Left Contact Card & Query Form + Right FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Contact Information & Query Box */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-md">
            <div className="flex items-center space-x-2 text-sky-400">
              <Building2 className="w-5 h-5" />
              <span className="font-bold text-sm uppercase font-mono tracking-wider">
                PRIME MULTI SERVICES AND SUPPLIERS
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We operate and manage the <strong>Engineering Officer BY MH</strong> civil engineering competitive examination platform. You can reach our billing and academic support desk directly:
            </p>

            <div className="space-y-2.5 text-xs text-slate-200 pt-2 font-mono">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">OFFICIAL SUPPORT EMAIL</span>
                  <a href="mailto:gitevijay123@gmail.com" className="hover:text-sky-300 underline font-bold">
                    gitevijay123@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">PHONE / HELPLINE</span>
                  <a href="tel:+919370872123" className="hover:text-emerald-300 font-bold">
                    +91 93708 72123
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">OPERATIONAL HOURS</span>
                  <span>Monday to Saturday: 10:00 AM – 6:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">STATUTORY LICENSES</span>
                  <span>Maharashtra Shop Act & Udyam MSME Registered</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">LOCATION / JURISDICTION</span>
                  <span>Maharashtra, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Query Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Send a Support or Billing Message</h3>
            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  तुमचा संदेश यशस्वीरित्या पाठवला आहे! आमची सपोर्ट टीम २४ तासांच्या आत उत्तर देईल. (Message sent successfully!)
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Full Name (पूर्ण नाव)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Er. Rahul Patil"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email Address (ईमेल)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile Number (मोबाईल)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Message / Billing or Technical Issue (तक्रार किंवा शंका)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Please mention your Razorpay Payment ID if this is regarding a payment or duplicate deduction..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>संदेश पाठवा (Submit Request)</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: FAQs */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Frequently Asked Questions (वारंवार विचारले जाणारे प्रश्न)</span>
            </h3>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3.5 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 text-slate-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Legal Links */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900">Mandatory Merchant Policy Pages:</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 font-semibold text-sky-700">
              <button
                onClick={() => setActiveView && setActiveView('terms-conditions')}
                className="text-left hover:underline p-2 rounded bg-white border border-slate-200"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => setActiveView && setActiveView('privacy-policy')}
                className="text-left hover:underline p-2 rounded bg-white border border-slate-200"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setActiveView && setActiveView('refund-policy')}
                className="text-left hover:underline p-2 rounded bg-white border border-slate-200"
              >
                Refund Policy
              </button>
              <button
                onClick={() => setActiveView && setActiveView('shipping-policy')}
                className="text-left hover:underline p-2 rounded bg-white border border-slate-200"
              >
                Shipping Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
