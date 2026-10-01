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
  CheckCircle2,
  Bookmark,
  Share2,
  Bell,
  Layers,
  FileText,
  IndianRupee,
  HelpCircle,
  MapPin,
  Check
} from 'lucide-react';
import { RecruitmentNotice } from '../types';
import { ExamBadge } from './common/ExamBadge';
import { LinkVerificationService } from '../services/linkVerificationService';

interface RecruitmentDetailModalProps {
  notice: RecruitmentNotice | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (noticeId: string) => void;
  hasDeadlineReminder: boolean;
  onToggleReminder: (noticeId: string, title: string) => void;
  onSelectExam?: (examId: string) => void;
}

export const RecruitmentDetailModal: React.FC<RecruitmentDetailModalProps> = ({
  notice,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  hasDeadlineReminder,
  onToggleReminder,
  onSelectExam,
}) => {
  const [copied, setCopied] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  if (!isOpen || !notice) return null;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Official Recruitment: ${notice.postName} at ${notice.deptName} (${notice.totalVacancies} Vacancies). Last Date: ${notice.applyEndDate || 'Check Notice'}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: notice.postName,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(`${shareText} Apply officially at: ${notice.applyUrl || notice.applyOnlineUrl || notice.officialSource}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Upcoming':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Answer Key Out':
        return 'bg-sky-50 text-sky-700 border-sky-300';
      case 'Result Declared':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const daysUntilDeadline = () => {
    if (!notice.applyEndDate) return null;
    const end = new Date(notice.applyEndDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const diffDays = daysUntilDeadline();

  return (
    <div
      id="recruitment-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="recruitment-detail-modal"
        className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <ExamBadge examId={notice.examTargetId} />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(notice.status)}`}>
                {notice.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Advt: {notice.advtNumber || notice.advertisementNumber || 'Official Circular'}
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

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Official Verification Alert Box */}
        <div className="bg-amber-50 border-b border-amber-200 p-3.5 px-6 flex items-start gap-3 shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block text-amber-950">
              Mandatory Disclaimer: Verify from official notification before applying.
            </span>
            <span>
              Official Source:{' '}
              <strong className="underline underline-offset-2">
                {notice.officialSource || 'Government Official Gazette / Department Portal'}
              </strong>
              {notice.lastVerifiedDate && (
                <span className="ml-2 font-mono text-[11px] text-amber-800">
                  (Last Verified by SP Admin: {notice.lastVerifiedDate})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          {/* Key Metrics Quick Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Vacancies</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-1">
                {notice.totalVacancies.toLocaleString()} Posts
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salary Scale</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                {notice.salaryScale || 'As per 7th Pay Commission'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Last Date</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {notice.applyEndDate || 'Refer Notice'}
                {diffDays !== null && diffDays > 0 && (
                  <span className="block text-[10px] text-amber-700 font-mono font-normal">
                    {diffDays} days remaining
                  </span>
                )}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Location Cadre</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                {notice.districtOrState || 'Maharashtra State'}
              </p>
            </div>
          </div>

          {/* Section: Qualification & Eligibility Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>Qualification & Educational Criteria</span>
            </h3>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">Allowed Eligibility:</span>
                <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono text-[11px] font-bold">
                  {notice.eligibilityType || 'Both Diploma & Degree'}
                </span>
                {notice.diplomaEligible !== false && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    ✓ Diploma Civil
                  </span>
                )}
                {notice.degreeEligible !== false && (
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                    ✓ B.E. / B.Tech Civil
                  </span>
                )}
              </div>

              <div className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="font-medium">
                  {Array.isArray(notice.eligibility) ? notice.eligibility.join(', ') : notice.eligibility}
                </p>
                {notice.experience && (
                  <p className="mt-1 text-xs text-slate-600">
                    <strong className="text-slate-800">Experience Requirement:</strong> {notice.experience}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Age Limits & Reservation Rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Age Limits & Reservation Guidelines</span>
            </h3>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <p className="text-slate-800">
                <strong className="text-slate-900 font-semibold">Standard Age Limit:</strong> {notice.ageLimit}
              </p>
              {notice.ageRules && (
                <p className="text-slate-600 text-xs leading-relaxed">
                  <strong className="text-slate-800 font-semibold">Age Rules & Relaxations:</strong> {notice.ageRules}
                </p>
              )}
              {notice.categoryNotes && (
                <p className="text-slate-600 text-xs leading-relaxed border-t border-slate-100 pt-2">
                  <strong className="text-slate-800 font-semibold">Category & Parallel Quotas:</strong>{' '}
                  {notice.categoryNotes}
                </p>
              )}
            </div>
          </div>

          {/* Section: Selection Process & Stages */}
          {notice.stages && notice.stages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Selection Process & Examination Stages</span>
              </h3>

              <div className="space-y-2">
                {notice.stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-medium">{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Paper Pattern & Marking Scheme */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Paper Pattern & Marking Scheme</span>
            </h3>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <p className="text-slate-800 leading-relaxed font-medium">
                {notice.paperPattern || 'Refer to the official notification bulletin for the complete marks distribution.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block">TOTAL QUESTIONS</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {notice.questionCount ? `${notice.questionCount} MCQs` : '100 MCQs'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block">EXAM DURATION</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {notice.duration || '120 Minutes (2 Hours)'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block">NEGATIVE MARKING</span>
                  <span className="font-bold text-rose-700 font-mono">
                    {notice.negativeMarking || 'No negative marking'}
                  </span>
                </div>
              </div>

              {notice.subjectsCovered && notice.subjectsCovered.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1.5">SUBJECTS INCLUDED</span>
                  <div className="flex flex-wrap gap-1.5">
                    {notice.subjectsCovered.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Important Dates Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Important Dates Timeline</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <div>
                <span className="text-[10px] font-mono text-purple-800 block">APPLICATION OPENS</span>
                <span className="font-bold text-slate-900">{notice.applyStartDate || 'Notified Soon'}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-800 block">APPLICATION CLOSES</span>
                <span className="font-bold text-rose-700">{notice.applyEndDate || 'Check Notice'}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-800 block">EXAM SCHEDULE</span>
                <span className="font-bold text-slate-900">{notice.examDate || notice.examDateEstimated || 'TBD'}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-800 block">ADMIT CARD / RESULT</span>
                <span className="font-bold text-slate-900">{notice.admitCardDate || 'As per calendar'}</span>
              </div>
            </div>
          </div>

          {/* Section: Admin Notes & Special Guidance */}
          {(notice.adminNotes || notice.notes) && (
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-950 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-xs text-sky-900">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>SP Coaching & Preparation Guidance:</span>
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                {notice.adminNotes || notice.notes}
              </p>
            </div>
          )}
        </div>

        {/* Confirmation modal prompt before leaving to apply officially */}
        {/* Verification Alert Before Outbound Navigation */}
        {showApplyConfirm && (
          <div className="p-4 bg-sky-50 border-t border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-sky-950">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                तुम्ही <strong>{notice.deptName}</strong> च्या अधिकृत शासकीय संकेतस्थळावर जात आहात. (SSL Secured & Verified)
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowApplyConfirm(false)}
                className="px-3 py-1.5 bg-white text-slate-700 rounded-md border border-slate-300 font-medium hover:bg-slate-50"
              >
                रद्द करा
              </button>
              <button
                onClick={() => {
                  setShowApplyConfirm(false);
                  const dest = LinkVerificationService.getVerifiedPortalUrl(
                    notice.examTargetId,
                    notice.applyUrl || notice.applyOnlineUrl || notice.officialSource
                  );
                  LinkVerificationService.safeOpenExternalLink(dest);
                }}
                className="px-4 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-md font-bold inline-flex items-center shadow-xs transition-colors"
              >
                <span>अधिकृत पोर्टलवर जा</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left Actions: Bookmark, Share, Reminder */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleBookmark(notice.id)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-amber-600' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => onToggleReminder(notice.id, notice.postName)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                hasDeadlineReminder
                  ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${hasDeadlineReminder ? 'fill-current text-purple-600' : ''}`} />
              <span>{hasDeadlineReminder ? 'Reminder Set' : 'Deadline Alert'}</span>
            </button>
          </div>

          {/* Right Actions: Print & Apply */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>राजपत्र सेव्ह / प्रिंट करा</span>
            </button>

            <button
              onClick={() => setShowApplyConfirm(true)}
              className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <span>अर्ज करा (Apply)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
