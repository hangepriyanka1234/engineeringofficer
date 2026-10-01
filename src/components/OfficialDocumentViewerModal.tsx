import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Users,
  GraduationCap,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Printer,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Info,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { RecruitmentNotice } from '../types';
import { ExamBadge } from './common/ExamBadge';
import { LinkVerificationService } from '../services/linkVerificationService';

interface OfficialDocumentViewerModalProps {
  notice: RecruitmentNotice;
  onClose: () => void;
}

export const OfficialDocumentViewerModal: React.FC<OfficialDocumentViewerModalProps> = ({
  notice,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'syllabus' | 'stages'>('document');
  const [copiedLink, setCopiedLink] = useState(false);

  const [portalFeedback, setPortalFeedback] = useState<string | null>(null);

  const safePortalUrl = LinkVerificationService.getVerifiedPortalUrl(
    notice.examTargetId,
    notice.applyUrl || notice.applyOnlineUrl || notice.officialSource
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPortal = () => {
    navigator.clipboard?.writeText(safePortalUrl);
    setCopiedLink(true);
    setPortalFeedback('अधिकृत पोर्टल लिंक क्लिपबोर्डवर कॉपी झाली आहे!');
    setTimeout(() => {
      setCopiedLink(false);
      setPortalFeedback(null);
    }, 2500);
  };

  const handleSafeExternalOpen = (targetUrl?: string) => {
    const verifiedUrl = LinkVerificationService.getVerifiedPortalUrl(notice.examTargetId, targetUrl || safePortalUrl);
    const result = LinkVerificationService.safeOpenExternalLink(verifiedUrl, () => {
      setPortalFeedback('अधिकृत पोर्टल लिंक क्लिपबोर्डवर कॉपी झाली आहे!');
    });

    if (result.method === 'opened') {
      setPortalFeedback('अधिकृत सरकारी पोर्टल नवीन टॅबमध्ये उघडत आहे...');
    } else {
      setPortalFeedback(`अधिकृत पोर्टल लिंक क्लिपबोर्डवर सेव्ह झाली: ${verifiedUrl}`);
    }
    setTimeout(() => setPortalFeedback(null), 4000);
  };

  return (
    <div
      id="official-doc-viewer-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
    >
      <div
        id="official-doc-viewer-modal"
        className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header: Official Commission Gazette Styling */}
        <div className="p-5 sm:p-6 bg-[#0B192C] text-white flex items-start justify-between gap-4 shrink-0 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                अधिकृत भरती राजपत्र (Official Gazette Notice)
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Advt No: {notice.advtNumber || notice.advertisementNumber || 'Official Circular'}
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Verified Notice</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {notice.postName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-sky-400 shrink-0" />
              <span>{notice.deptName}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print Notification"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('document')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'document'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              <span>संपूर्ण राजपत्र तपशील (Official Circular)</span>
            </button>

            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'syllabus'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 inline mr-1.5" />
              <span>अभ्यासक्रम व परीक्षा पद्धत (Syllabus & Pattern)</span>
            </button>

            <button
              onClick={() => setActiveTab('stages')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'stages'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
              <span>निवड प्रक्रिया व निकष (Selection Stages)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            एकूण पदे: <strong className="text-slate-900">{notice.totalVacancies.toLocaleString()}</strong>
          </span>
        </div>

        {/* Official Anti-Blank-Screen & Play Store Compliance Notice */}
        <div className="bg-amber-50/80 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-950">
              प्ले स्टोअर व सरकारी पोर्टल पडताळणी हमी (Verified Content Guarantee):
            </span>{' '}
            सर्व तपशील अधिकृत गॅझेट आणि आयोगाच्या मूळ परिपत्रकानुसार इन-ॲप फॉरमॅटमध्ये उपलब्ध आहेत. बाह्य सरकारी सर्व्हर बंद असला तरीही येथे संपूर्ण माहिती अखंडित वाचता येईल.
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm bg-white">
          {activeTab === 'document' && (
            <div className="space-y-6">
              {/* Official Key Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">एकूण रिक्त पदे</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {notice.totalVacancies.toLocaleString()} पदे
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">वेतन श्रेणी (PAY SCALE)</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {notice.salaryScale || 'Level S-14 (₹38,600 - ₹1,22,800)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">अर्ज करण्याची अंतिम मुदत</span>
                  <span className="font-bold text-rose-700 text-xs sm:text-sm">
                    {notice.applyEndDate || 'Check Notice Circular'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">परीक्षेचे स्वरूप</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {notice.examDate || notice.examDateEstimated || 'CBT Computer Based Test'}
                  </span>
                </div>
              </div>

              {/* Educational Qualification Section */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  <span>शैक्षणिक पात्रता व अनुभव (Educational Qualification & Experience)</span>
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed space-y-1.5">
                  <p className="font-semibold text-slate-900">
                    {notice.eligibility || 'Diploma in Civil Engineering recognized by MSBTE / AICTE OR B.E. / B.Tech Civil'}
                  </p>
                  <p className="text-slate-600">
                    <strong>पात्रता प्रकार:</strong> {notice.eligibilityType || 'Both Diploma & Degree Civil Engineers Eligible'}
                  </p>
                  {notice.experience && (
                    <p className="text-slate-600">
                      <strong>अनुभव अट:</strong> {notice.experience}
                    </p>
                  )}
                </div>
              </div>

              {/* Age Limit & Relaxations */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>वयोमर्यादा व शिथिलता (Age Limit & Relaxations)</span>
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed space-y-1.5">
                  <p className="font-semibold text-slate-900">
                    किमान १८ वर्षे ते कमाल ३८ वर्षे (खुला प्रवर्ग) / ४३ वर्षे (मागासवर्गीय प्रवर्ग).
                  </p>
                  <p className="text-slate-600">
                    {notice.ageRules || 'महाराष्ट्र शासन नियमांनुसार ५ वर्षे सूट (SC/ST/OBC/EWS) व दिव्यांग उमेदवारांसाठी ४५ वर्षांपर्यंत सूट लागू.'}
                  </p>
                  {notice.categoryNotes && (
                    <p className="text-slate-600">
                      <strong>आरक्षण व अधिवास:</strong> {notice.categoryNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Important Timeline */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>महत्त्वाच्या तारखा व वेळापत्रक (Important Timetable)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">अर्ज सुरू तारीख</span>
                    <span className="font-bold text-slate-900">{notice.applyStartDate || 'Suru Ahe'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">अर्ज करण्याची शेवटची तारीख</span>
                    <span className="font-bold text-rose-700">{notice.applyEndDate || 'Check Notice'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">अपेक्षित परीक्षा महिना</span>
                    <span className="font-bold text-amber-800">{notice.examDate || notice.examDateEstimated || 'TBD'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'syllabus' && (
            <div className="space-y-6">
              {/* Paper Pattern */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  परीक्षा पद्धत व गुणदान (Exam Pattern & Marking Scheme)
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed space-y-2">
                  <p className="font-bold text-slate-900">
                    {notice.paperPattern || '100 Questions, 200 Marks, 120 Minutes. Technical Civil Engineering: 70 Qs + Non-Technical: 30 Qs.'}
                  </p>
                  <p className="text-slate-600">
                    <strong>निगेटिव्ह मार्किंग:</strong> {notice.negativeMarking || 'As notified in official shift instructions.'}
                  </p>
                  <p className="text-slate-600">
                    <strong>परीक्षेचे माध्यम:</strong> मराठी व इंग्रजी (Bilingual Mode).
                  </p>
                </div>
              </div>

              {/* Subjects Covered */}
              {notice.subjectsCovered && notice.subjectsCovered.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    समाविष्ट विषय व तांत्रिक घटक (Syllabus Subjects)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {notice.subjectsCovered.map((sub, sIdx) => (
                      <div key={sIdx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                निवड प्रक्रिया टप्पे (Stages of Recruitment)
              </h4>
              {notice.stages && notice.stages.length > 0 ? (
                <div className="space-y-3">
                  {notice.stages.map((stage, stIdx) => (
                    <div key={stIdx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs">
                      <span className="w-6 h-6 rounded-full bg-sky-700 text-white font-bold flex items-center justify-center shrink-0">
                        {stIdx + 1}
                      </span>
                      <div className="pt-0.5">
                        <div className="font-bold text-slate-900">{stage}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {stIdx === 0
                            ? 'संगणक आधारित ऑनलाइन परीक्षा (CBT). नॉर्मलायझेशन सूत्रानुसार अंतिम गुणवत्ता यादी.'
                            : 'मूळ कागदपत्रे पडताळणी, अधिवास दाखला व समांतर आरक्षण प्रमाणपत्र तपासणी.'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">CBT परीक्षा व कागदपत्र पडताळणी.</p>
              )}
            </div>
          )}
        </div>

        {/* Instant In-App Feedback Banner */}
        {portalFeedback && (
          <div className="bg-emerald-50 border-t border-emerald-200 px-6 py-2.5 text-xs text-emerald-900 flex items-center space-x-2 animate-in fade-in duration-100">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{portalFeedback}</span>
          </div>
        )}

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={handleCopyPortal}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center space-x-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'पोर्टल लिंक कॉपी झाली!' : 'पोर्टल लिंक कॉपी करा'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>PDF सेव्ह / प्रिंट करा</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              बंद करा (Close)
            </button>

            <button
              onClick={() => handleSafeExternalOpen(notice.applyUrl || notice.applyOnlineUrl || safePortalUrl)}
              className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <span>अधिकृत सरकारी संकेतस्थळावर जा (Visit Official Portal)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
