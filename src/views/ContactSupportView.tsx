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
  CheckCircle2
} from 'lucide-react';

export const ContactSupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'Can final semester Diploma / B.E. Civil students apply for Maharashtra PWD JE or SSC JE?',
      a: 'For Maharashtra PWD JE & Civil Engineering Assistant (CEA), candidates must possess their qualifying diploma/degree certificate on or before the application cutoff date specified in the official notification. For SSC JE, final year students are eligible if their result is declared before the crucial date.',
    },
    {
      q: 'Is a physical scientific calculator allowed during the CBT Examination?',
      a: 'In Tier-1 of SSC JE and Maharashtra PWD/MPSC preliminary CBTs, physical calculators are strictly prohibited. However, for UPSC ESE Prelims (Paper 2) and SSC JE Tier-2 (Paper 2), an on-screen virtual calculator is provided on the TCS-iON exam interface.',
    },
    {
      q: 'How many marks weightage does IS 456:2000 and IS 800:2007 carry in AE/JE exams?',
      a: 'Standard codal specifications form nearly 35% to 45% of total structural questions in state JE and SSC JE exams. Direct clauses regarding minimum reinforcement, modular ratio, slump values, slenderness ratio, and bolt shear capacity are asked repeatedly.',
    },
    {
      q: 'How can I access previous year papers with verified official answer keys?',
      a: 'Head over to the "Previous Year Papers (PYQs)" tab on the sidebar. All shift-wise papers from 2015 to 2024 for Maharashtra PWD, SSC JE, and MPSC are available for both CBT simulation and PDF download.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setQuery('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">SP Mentorship & Aspirant Support Desk</h1>
            <p className="text-xs text-slate-500">
              Get technical guidance from Er. SP faculty and resolve test series or syllabus queries.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Left Contact Card & Query Form + Right FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Contact Information & Query Box */}
        <div className="space-y-4">
          <div className="bg-blueprint-dark text-white rounded-xl p-6 border border-sky-500/30 space-y-4 shadow-md">
            <div className="flex items-center space-x-2 text-sky-400">
              <HardHat className="w-5 h-5" />
              <span className="font-bold text-sm uppercase font-mono">SP Engineering Academy Hub</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We specialize in mentoring Diploma and Degree Civil Engineers for government service cadres. Reach our academic counselors directly:
            </p>

            <div className="space-y-2.5 text-xs text-slate-200 pt-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>support@engineeringofficersp.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>+91 98220 54321 / +91 91580 12345 (Mon–Sat 9AM–7PM)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Pune / Chhatrapati Sambhajinagar / Mumbai Center</span>
              </div>
            </div>
          </div>

          {/* Direct Query Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Send a Message to Er. SP Mentor Desk</h3>
            {submitted ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your query has been submitted! Our faculty will respond within 24 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Er. Rahul Kulkarni"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Civil Engineering Doubt or Query</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ask about test series access, IS code clarifications, or recruitment notifications..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Query</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: FAQs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 overflow-hidden text-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left font-semibold text-slate-900 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className="pr-2">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-3.5 bg-white text-slate-600 border-t border-slate-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
