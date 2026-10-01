import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Users,
  GraduationCap,
  Download,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Bookmark,
  Share2,
  Bell,
  Archive,
  Info,
  MapPin,
  Check,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { RecruitmentNotice, ExamTargetId } from '../types';
import { ExamBadge } from '../components/common/ExamBadge';
import { RecruitmentDetailModal } from '../components/RecruitmentDetailModal';
import { OfficialDocumentViewerModal } from '../components/OfficialDocumentViewerModal';
import { PlayStoreComplianceModal } from '../components/PlayStoreComplianceModal';
import { ExternalPortalNavigatorModal } from '../components/ExternalPortalNavigatorModal';
import { StorageService } from '../services/storageService';

interface CurrentRecruitmentViewProps {
  notices: RecruitmentNotice[];
  selectedExam: ExamTargetId | string;
  onSelectExam: (examId: ExamTargetId | string) => void;
}

export const CurrentRecruitmentView: React.FC<CurrentRecruitmentViewProps> = ({
  notices: initialNotices,
  selectedExam,
  onSelectExam,
}) => {
  // Notices list from storage
  const [notices, setNotices] = useState<RecruitmentNotice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qualificationFilter, setQualificationFilter] = useState('all');
  const [cadreFilter, setCadreFilter] = useState('all');
  const [deadlinesFilter, setDeadlinesFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'live' | 'bookmarked' | 'archived'>('live');

  // Bookmarks & Reminders state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [reminderIds, setReminderIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail Modal & Official Apply Dialog
  const [selectedNotice, setSelectedNotice] = useState<RecruitmentNotice | null>(null);
  const [applyPromptNotice, setApplyPromptNotice] = useState<RecruitmentNotice | null>(null);
  const [viewerNotice, setViewerNotice] = useState<RecruitmentNotice | null>(null);
  const [showComplianceModal, setShowComplianceModal] = useState<boolean>(false);

  useEffect(() => {
    loadNoticesAndPrefs();
  }, [initialNotices]);

  const loadNoticesAndPrefs = () => {
    const storedNotices = StorageService.getRecruitmentNotices();
    setNotices(storedNotices);
    setBookmarkedIds(StorageService.getBookmarkedNoticeIds());
    setReminderIds(StorageService.getDeadlineReminderIds());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleBookmark = (id: string) => {
    const isNowBookmarked = StorageService.toggleBookmarkNotice(id);
    setBookmarkedIds(StorageService.getBookmarkedNoticeIds());
    showToast(isNowBookmarked ? 'Notice saved to Bookmarks' : 'Removed from Bookmarks');
  };

  const handleToggleReminder = (id: string, title: string) => {
    const hasReminder = StorageService.toggleDeadlineReminder(id, title);
    setReminderIds(StorageService.getDeadlineReminderIds());
    showToast(hasReminder ? `Deadline alert activated for ${title}` : 'Deadline alert removed');
  };

  const handleShare = async (notice: RecruitmentNotice) => {
    const shareUrl = window.location.href;
    const shareText = `Official Civil Engg Recruitment: ${notice.postName} at ${notice.deptName} (${notice.totalVacancies} Vacancies). Last Date: ${notice.applyEndDate || 'Check Notice'}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: notice.postName,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }
    navigator.clipboard.writeText(`${shareText} Apply officially at: ${notice.applyUrl || notice.applyOnlineUrl || notice.officialSource}`);
    showToast('Recruitment link copied to clipboard!');
  };

  // Helper for days remaining
  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Filter logic
  const filteredNotices = notices.filter((n) => {
    // Tab filter
    if (activeTab === 'bookmarked') {
      if (!bookmarkedIds.includes(n.id)) return false;
    } else if (activeTab === 'archived') {
      if (!n.isArchived && n.status !== 'Archived') return false;
    } else {
      // 'live' tab
      if (n.isArchived || n.status === 'Archived') return false;
    }

    // Search query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      n.postName.toLowerCase().includes(query) ||
      n.deptName.toLowerCase().includes(query) ||
      (n.advtNumber && n.advtNumber.toLowerCase().includes(query)) ||
      (n.advertisementNumber && n.advertisementNumber.toLowerCase().includes(query)) ||
      (n.districtOrState && n.districtOrState.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'all' && n.status !== statusFilter) {
      return false;
    }

    // Qualification filter
    if (qualificationFilter !== 'all') {
      if (qualificationFilter === 'diploma' && n.diplomaEligible === false) return false;
      if (qualificationFilter === 'degree' && n.degreeEligible === false) return false;
      if (qualificationFilter === 'both' && n.eligibilityType !== 'Both Diploma & Degree') return false;
    }

    // Cadre filter
    if (cadreFilter !== 'all') {
      const examId = String(n.examTargetId);
      if (cadreFilter === 'central' && !['upsc_ese', 'ssc_je', 'rrb_je'].includes(examId)) return false;
      if (cadreFilter === 'maharashtra' && !['maha_pwd', 'mpsc_civil', 'wrd_irrigation', 'mjp_je', 'maha_housing'].includes(examId)) return false;
      if (cadreFilter === 'local_body' && !['zp_civil', 'bmc_je', 'pmc_je'].includes(examId)) return false;
    }

    // Deadline filter
    if (deadlinesFilter !== 'all' && n.applyEndDate) {
      const days = getDaysRemaining(n.applyEndDate);
      if (days !== null) {
        if (deadlinesFilter === 'urgent' && (days < 0 || days > 7)) return false;
        if (deadlinesFilter === 'month' && (days < 0 || days > 30)) return false;
      }
    }

    return true;
  });

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
      case 'Archived':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                OFFICIAL CIVIL RECRUITMENT CMS
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Verified Sources
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-sky-600" />
              <span>Civil Engineering Recruitment Notices & Vacancies</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl">
              Authentic vacancy updates for UPSC ESE, SSC JE, RRB JE, MPSC Civil, Maha PWD JE/CEA, WRD, ZP, and Municipal Corporations. Never fabricated.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search post, department, or advt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Mandatory Official Notice & Play Store Policy Banner */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50/90 to-sky-50/90 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>अधिकृत शासकीय राजपत्र व प्ले स्टोअर पडताळणी:</strong> सर्व जाहिराती आणि परिपत्रके १००% सत्यापित आहेत. बाह्य सरकारी सर्व्हर बंद असला तरीही इन-ॲप संपूर्ण तपशील अखंडित वाचता येईल.
            </p>
          </div>
          <button
            onClick={() => setShowComplianceModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white border border-sky-300 text-sky-800 hover:bg-sky-50 font-bold shrink-0 shadow-xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>गोपनीयता व धोरण हमी</span>
          </button>
        </div>

        {/* Navigation Tabs (Live / Bookmarked / Archived) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'live'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Live & Upcoming Notices ({notices.filter((n) => !n.isArchived && n.status !== 'Archived').length})
            </button>

            <button
              onClick={() => setActiveTab('bookmarked')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'bookmarked'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Notices ({bookmarkedIds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'archived'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived Past Notices</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Showing {filteredNotices.length} notifications
          </span>
        </div>

        {/* Detailed Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] font-mono text-slate-500 block mb-1">STATUS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter notices by status"
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active (Apply Now)</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Answer Key Out">Answer Key Out</option>
              <option value="Result Declared">Result Declared</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 block mb-1">QUALIFICATION</label>
            <select
              value={qualificationFilter}
              onChange={(e) => setQualificationFilter(e.target.value)}
              aria-label="Filter notices by qualification"
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="all">All Qualifications</option>
              <option value="diploma">Diploma in Civil Engineering</option>
              <option value="degree">B.E. / B.Tech in Civil</option>
              <option value="both">Both Diploma & Degree</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 block mb-1">CADRE / REGION</label>
            <select
              value={cadreFilter}
              onChange={(e) => setCadreFilter(e.target.value)}
              aria-label="Filter notices by cadre or region"
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="all">All Cadres</option>
              <option value="maharashtra">Maharashtra State (PWD, MPSC, WRD)</option>
              <option value="central">Central Govt (UPSC ESE, SSC JE, RRB JE)</option>
              <option value="local_body">Local Bodies (ZP, BMC, PMC)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 block mb-1">DEADLINE</label>
            <select
              value={deadlinesFilter}
              onChange={(e) => setDeadlinesFilter(e.target.value)}
              aria-label="Filter notices by application deadline"
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="all">Any Deadline</option>
              <option value="urgent">Closing Soon (≤ 7 Days)</option>
              <option value="month">Closing within 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notices Cards Grid */}
      {filteredNotices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Recruitment Notices Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your filters or search keywords. New notifications are regularly verified by SP faculty.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setQualificationFilter('all');
              setCadreFilter('all');
              setDeadlinesFilter('all');
              setActiveTab('live');
            }}
            className="px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotices.map((notice) => {
            const isBookmarked = bookmarkedIds.includes(notice.id);
            const hasReminder = reminderIds.includes(notice.id);
            const daysLeft = getDaysRemaining(notice.applyEndDate);

            return (
              <div
                key={notice.id}
                id={`notice-card-${notice.id}`}
                className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 p-5 shadow-xs transition-all space-y-4"
              >
                {/* Top Metas & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <ExamBadge examId={notice.examTargetId} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(notice.status)}`}>
                      {notice.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Advt: {notice.advtNumber || notice.advertisementNumber || 'Official Notice'}
                    </span>
                    {notice.districtOrState && (
                      <span className="text-[10px] text-slate-500 flex items-center bg-slate-100 px-2 py-0.5 rounded">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {notice.districtOrState}
                      </span>
                    )}
                  </div>

                  {/* Vacancy and quick actions */}
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                      <Users className="w-3.5 h-3.5" />
                      <span>{notice.totalVacancies.toLocaleString()} Posts</span>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(notice.id)}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this notice'}
                      aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark this notice'}
                      className={`p-1.5 rounded-md border transition-colors ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-600' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleShare(notice)}
                      title="Share Notification"
                      aria-label="Share Notification"
                      className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleReminder(notice.id, notice.postName)}
                      title={hasReminder ? 'Deadline Reminder Active' : 'Set Deadline Reminder'}
                      aria-label={hasReminder ? 'Deadline Reminder Active' : 'Set Deadline Reminder'}
                      className={`p-1.5 rounded-md border transition-colors ${
                        hasReminder
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <Bell className={`w-4 h-4 ${hasReminder ? 'fill-current text-purple-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title & Organization */}
                <div
                  className="cursor-pointer group"
                  onClick={() => setSelectedNotice(notice)}
                >
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-sky-700 transition-colors">
                    {notice.postName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span>{notice.deptName}</span>
                  </p>
                </div>

                {/* Key Eligibility & Criteria Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">QUALIFICATION</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {notice.eligibilityType || (Array.isArray(notice.eligibility) ? notice.eligibility[0] : notice.eligibility)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">AGE LIMIT</span>
                    <span className="font-semibold text-slate-800">{notice.ageLimit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">LAST DATE TO APPLY</span>
                    <div className="font-semibold text-slate-800 flex items-center space-x-1">
                      <span>{notice.applyEndDate || 'Check Notice'}</span>
                      {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-mono">
                          {daysLeft}d left
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">EXAM DATE</span>
                    <span className="font-semibold text-amber-800">
                      {notice.examDate || notice.examDateEstimated || 'TBD'}
                    </span>
                  </div>
                </div>

                {/* Official Source & Verification Footnote */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Official Source:{' '}
                      <strong className="text-slate-700">
                        {notice.officialSource || 'Official Govt Gazette'}
                      </strong>
                    </span>
                    {notice.lastVerifiedDate && (
                      <span className="text-slate-400 font-mono">
                        (Verified: {notice.lastVerifiedDate})
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-amber-800 font-medium">
                    Verify from official notification before applying
                  </span>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onSelectExam(notice.examTargetId)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center transition-colors"
                    >
                      Set as Target Exam →
                    </button>

                    <button
                      onClick={() => setSelectedNotice(notice)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center"
                    >
                      <Info className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>Full Exam Pattern & Syllabus</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewerNotice(notice)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                      title="इन-ॲप संपूर्ण राजपत्र व तपशील उघडा"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>अधिकृत जाहिरात व PDF</span>
                    </button>

                    <button
                      onClick={() => setApplyPromptNotice(notice)}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                    >
                      <span>अर्ज करा (Apply)</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verified External Portal Navigator Modal */}
      {applyPromptNotice && (
        <ExternalPortalNavigatorModal
          isOpen={Boolean(applyPromptNotice)}
          onClose={() => setApplyPromptNotice(null)}
          title={applyPromptNotice.postName}
          deptName={applyPromptNotice.deptName}
          targetUrl={applyPromptNotice.applyUrl || applyPromptNotice.applyOnlineUrl || applyPromptNotice.officialSource || ''}
          onOpenInAppNotice={() => {
            const n = applyPromptNotice;
            setApplyPromptNotice(null);
            setViewerNotice(n);
          }}
        />
      )}

      {/* Official In-App Document & Gazette Reader Modal (Zero Broken Links) */}
      {viewerNotice && (
        <OfficialDocumentViewerModal
          notice={viewerNotice}
          onClose={() => setViewerNotice(null)}
        />
      )}

      {/* Google Play Store Compliance, Privacy Policy & Link Health Audit Modal */}
      {showComplianceModal && (
        <PlayStoreComplianceModal
          isOpen={showComplianceModal}
          onClose={() => setShowComplianceModal(false)}
        />
      )}

      {/* Full Recruitment Notice Detail Modal */}
      <RecruitmentDetailModal
        notice={selectedNotice}
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        isBookmarked={selectedNotice ? bookmarkedIds.includes(selectedNotice.id) : false}
        onToggleBookmark={handleToggleBookmark}
        hasDeadlineReminder={selectedNotice ? reminderIds.includes(selectedNotice.id) : false}
        onToggleReminder={handleToggleReminder}
        onSelectExam={onSelectExam}
      />
    </div>
  );
};
