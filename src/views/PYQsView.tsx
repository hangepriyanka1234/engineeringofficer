import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Layers,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  FileCheck2,
  Download,
  Play,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit3
} from 'lucide-react';
import {
  PYQItem,
  PYQPaper,
  PYQTopicMappingItem,
  PYQAnalyticsData,
  PYQVerificationStatus,
  ExamTargetId,
  SubjectId
} from '../types';
import { PyqService } from '../services/pyqService';
import { EXAM_CATALOGUE, SUBJECTS_LIST, PYQ_PAPERS } from '../data/mockData';
import { ExamBadge } from '../components/common/ExamBadge';
import { PYQPracticeSessionModal } from '../components/PYQPracticeSessionModal';

interface PYQsViewProps {
  isAdmin?: boolean;
  onStartPYQTest?: (pyq: PYQPaper) => void;
  onNavigateToAdmin?: () => void;
}

export const PYQsView: React.FC<PYQsViewProps> = ({
  isAdmin = false,
  onStartPYQTest,
  onNavigateToAdmin,
}) => {
  // Navigation tabs in PYQ view
  const [activeTab, setActiveTab] = useState<'library' | 'topic-mapping' | 'papers' | 'analytics'>('library');

  // Query and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Data states
  const [questions, setQuestions] = useState<PYQItem[]>([]);
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>({});
  const [topicMappings, setTopicMappings] = useState<PYQTopicMappingItem[]>([]);
  const [analytics, setAnalytics] = useState<PYQAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Modals & Practice
  const [historyModalQuestion, setHistoryModalQuestion] = useState<PYQItem | null>(null);
  const [practiceSessionConfig, setPracticeSessionConfig] = useState<{
    title: string;
    subtitle?: string;
    questions: PYQItem[];
    instantFeedback: boolean;
  } | null>(null);

  // Self-test answer tracker for browse mode
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<string, number>>({});

  // Quick Admin Approval State (for inline admin workflow)
  const [quickApproveQuestion, setQuickApproveQuestion] = useState<PYQItem | null>(null);
  const [approvalVerifiedBy, setApprovalVerifiedBy] = useState<string>('Er. S. Patil (Executive Admin & Head Faculty)');
  const [approvalNotes, setApprovalNotes] = useState<string>('Verified against official master answer key and IS code clause.');
  const [approvalKeyRef, setApprovalKeyRef] = useState<string>('');

  // Fetch Questions
  const loadPYQs = async () => {
    try {
      setLoading(true);
      const res = await PyqService.getPYQs({
        query: searchQuery,
        examTargetId: selectedExamFilter,
        year: selectedYearFilter,
        subjectId: selectedSubjectFilter,
        difficulty: selectedDifficultyFilter,
        status: selectedStatusFilter,
        pageSize: 50,
      });
      setQuestions(res.questions);
      setCountsByStatus(res.countsByStatus);
    } catch (err) {
      console.error('Error loading PYQ library:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Topic Mapping
  const loadTopicMapping = async () => {
    try {
      const res = await PyqService.getTopicMapping({
        examTargetId: selectedExamFilter,
        year: selectedYearFilter !== 'all' ? Number(selectedYearFilter) : undefined,
      });
      setTopicMappings(res);
    } catch (err) {
      console.error('Error loading topic mapping:', err);
    }
  };

  // Fetch Analytics
  const loadAnalytics = async () => {
    try {
      const res = await PyqService.getAnalytics({
        examTargetId: selectedExamFilter,
        year: selectedYearFilter !== 'all' ? Number(selectedYearFilter) : undefined,
      });
      setAnalytics(res);
    } catch (err) {
      console.error('Error loading PYQ analytics:', err);
    }
  };

  useEffect(() => {
    loadPYQs();
  }, [
    selectedExamFilter,
    selectedYearFilter,
    selectedSubjectFilter,
    selectedDifficultyFilter,
    selectedStatusFilter,
  ]);

  useEffect(() => {
    if (activeTab === 'topic-mapping') {
      loadTopicMapping();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, selectedExamFilter, selectedYearFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPYQs();
  };

  // Launch Practice Session (Exam-wise, Year-wise, or Topic-wise)
  const handleLaunchPractice = (
    practiceTitle: string,
    practiceQuestions: PYQItem[],
    instantMode: boolean = false,
    subtitle?: string
  ) => {
    if (!practiceQuestions || practiceQuestions.length === 0) {
      alert('No verified questions currently available for this selection.');
      return;
    }
    setPracticeSessionConfig({
      title: practiceTitle,
      subtitle: subtitle || `${practiceQuestions.length} Official Questions · Negative Marking Enforced`,
      questions: practiceQuestions,
      instantFeedback: instantMode,
    });
  };

  // Start exam paper practice
  const handleStartPaperPractice = (paper: PYQPaper, instantMode: boolean = false) => {
    // Match questions for this exam and year from current bank
    const matched = questions.filter(
      (q) => q.examTargetId === paper.examTargetId || q.year === paper.year
    );
    const pool = matched.length > 0 ? matched : questions.slice(0, 10);

    handleLaunchPractice(
      paper.title,
      pool,
      instantMode,
      `${paper.shift || 'Official Session'} · Year ${paper.year} · ${paper.totalMarks} Marks`
    );
  };

  // Quick Approve Inline Handler
  const handleQuickApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickApproveQuestion) return;
    try {
      await PyqService.approvePYQ(quickApproveQuestion.id, {
        verifiedBy: approvalVerifiedBy,
        adminApprovalNotes: approvalNotes,
        verifiedKeyRef: approvalKeyRef || `Confirmed from ${quickApproveQuestion.exam} final key`,
        isCodeReference: quickApproveQuestion.isCodeReference,
        correctedOption: quickApproveQuestion.correctOption,
      });
      setQuickApproveQuestion(null);
      loadPYQs();
      alert('Question approved and promoted to Official Verified PYQ.');
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Official Authenticity Pledge */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                <History className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                Verified Previous Year Question (PYQ) System
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Authentic civil engineering questions from Maharashtra PWD, MPSC MES, SSC JE, RRB JE, WRD, BMC, ZP & UPSC ESE (2019–2024). Every question carries verified source provenance, master booklet codes, official keys, and version history.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Provenance Audited</span>
            </span>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 mt-5 overflow-x-auto pb-1">
          {[
            { id: 'library', label: 'Browse & Search PYQs', icon: BookOpen, count: countsByStatus.all || questions.length },
            { id: 'topic-mapping', label: 'Topic Mapping Matrix', icon: Layers },
            { id: 'papers', label: 'Exam-Wise & Year-Wise Papers', icon: Calendar, count: PYQ_PAPERS.length },
            { id: 'analytics', label: 'PYQ Analytics & Trends', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`pyq-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: BROWSE & SEARCH PYQ LIBRARY */}
      {/* ==================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {/* Search & Multi-Filters Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search stem, topic, IS code (e.g. IS 456, IS 800), formula, or booklet series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-24 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-bold shadow-xs"
              >
                Search
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {/* Exam Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">EXAM CADRE</label>
                <select
                  value={selectedExamFilter}
                  onChange={(e) => setSelectedExamFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Exams</option>
                  {EXAM_CATALOGUE.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">YEAR</label>
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">SUBJECT</label>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Subjects</option>
                  {SUBJECTS_LIST.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">DIFFICULTY</label>
                <select
                  value={selectedDifficultyFilter}
                  onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy (Direct IS Clause)</option>
                  <option value="medium">Medium (Formula / Standard)</option>
                  <option value="hard">Hard (Advanced / Multi-Step)</option>
                </select>
              </div>

              {/* Verification Status Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">VERIFICATION STATUS</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Records</option>
                  <option value="official_verified">Official Verified Only</option>
                  <option value="under_review">Under Admin Review</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Practice Filtered Button */}
          {questions.length > 0 && (
            <div className="flex items-center justify-between p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs">
              <span className="font-semibold text-sky-900">
                Found <strong>{questions.length}</strong> previous year questions matching your filters.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleLaunchPractice(
                      'Filtered PYQ Practice Session',
                      questions,
                      true,
                      'Instant Codal Feedback Mode'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-white border border-sky-300 text-sky-700 font-bold hover:bg-sky-100 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Study Mode (Instant Key)</span>
                </button>
                <button
                  onClick={() =>
                    handleLaunchPractice(
                      'Filtered PYQ Practice Session',
                      questions,
                      false,
                      'Exam Simulation with Negative Marking'
                    )
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center space-x-1 shadow-xs"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Solve in CBT Exam Mode</span>
                </button>
              </div>
            </div>
          )}

          {/* Question Cards List */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
                Loading official previous year questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 text-xs">
                No previous year questions match the chosen filters. Try resetting the exam or subject filter.
              </div>
            ) : (
              questions.map((q) => {
                const isVerified = q.verificationStatus === 'official_verified';
                const isExpanded = expandedQuestionId === q.id;
                const userSelected = userSelectedOptions[q.id];

                return (
                  <div
                    key={q.id}
                    id={`pyq-card-${q.id}`}
                    className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                      isVerified ? 'border-slate-200 hover:border-slate-300' : 'border-amber-200 bg-amber-50/10'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <ExamBadge examId={q.examTargetId} />
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {q.year} · {q.paper}
                        </span>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Q.{q.questionNumber}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isVerified ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>OFFICIAL VERIFIED PYQ</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>UNVERIFIED / COMMUNITY IMPORT</span>
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-50 text-emerald-700'
                              : q.difficulty === 'medium'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Problem Stem */}
                    <div className="text-slate-900 font-medium text-sm sm:text-base leading-relaxed">
                      {q.stem}
                    </div>

                    {/* Options (Interactive Self-Test) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = userSelected === oIdx;
                        const showKey = isExpanded || userSelected !== undefined;
                        const isCorrectKey = oIdx === q.correctOption;

                        let style = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';
                        if (showKey) {
                          if (isCorrectKey) {
                            style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                          } else if (isChosen) {
                            style = 'border-rose-400 bg-rose-50 text-rose-900 font-medium';
                          }
                        } else if (isChosen) {
                          style = 'border-sky-600 bg-sky-50 text-sky-900 font-semibold';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              setUserSelectedOptions((prev) => ({
                                ...prev,
                                [q.id]: oIdx,
                              }))
                            }
                            className={`text-left p-3 rounded-xl border text-xs flex items-center space-x-2.5 transition-all ${style}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 bg-white">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {showKey && isCorrectKey && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Expandable Official Solution & Provenance Breakdown */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs animate-in fade-in">
                        {/* Solution & Codal Clause */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] uppercase text-slate-700 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                              Official Technical Solution & IS Code Validation
                            </span>
                            <span className="font-mono text-emerald-700 font-bold text-xs">
                              Correct Option: {String.fromCharCode(65 + q.correctOption)}
                            </span>
                          </div>

                          <p className="text-slate-700 text-xs leading-relaxed">{q.explanation}</p>

                          {q.whyOtherOptionsAreWrong && typeof q.whyOtherOptionsAreWrong === 'object' && (
                            <div className="pt-2 border-t border-slate-200 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                                Distractor Analysis (Why other choices are incorrect):
                              </span>
                              {Object.entries(q.whyOtherOptionsAreWrong).map(([distractor, reason], rIdx) => (
                                <div key={rIdx} className="text-[11px] text-slate-600">
                                  • <strong className="text-slate-700">{distractor}</strong>: {reason}
                                </div>
                              ))}
                            </div>
                          )}

                          {q.commonTraps && (
                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span><strong>Common Exam Trap:</strong> {q.commonTraps}</span>
                            </div>
                          )}

                          {q.formula && (
                            <div className="font-mono text-[11px] text-sky-800 bg-sky-50 px-2.5 py-1 rounded inline-block border border-sky-200">
                              Applicable Formula: {q.formula}
                            </div>
                          )}

                          {q.isCodeReference && (
                            <div className="font-mono text-[11px] text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded inline-block border border-indigo-200 ml-2">
                              Standard Code: {q.isCodeReference}
                            </div>
                          )}
                        </div>

                        {/* Provenance Metadata Card */}
                        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-sky-400 font-bold uppercase text-[10px] tracking-wider">
                            <span>Authoritative Provenance Audit Record</span>
                            {isVerified ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified by Admin
                              </span>
                            ) : (
                              <span className="text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Not yet verified by Admin
                              </span>
                            )}
                          </div>
                          <div><strong>Conducting Exam Commission:</strong> {q.sourceProvenance.conductingBody}</div>
                          {q.sourceProvenance.officialBookletSeries && (
                            <div><strong>Master Booklet Series:</strong> {q.sourceProvenance.officialBookletSeries}</div>
                          )}
                          {q.sourceProvenance.officialKeyNotification && (
                            <div><strong>Key Notification Gazette:</strong> {q.sourceProvenance.officialKeyNotification}</div>
                          )}
                          {q.sourceProvenance.verifiedKeyRef && (
                            <div><strong>Official Answer Key Reference:</strong> {q.sourceProvenance.verifiedKeyRef}</div>
                          )}
                          {q.verifiedBy && (
                            <div><strong>Audited By:</strong> {q.verifiedBy} ({q.verifiedAt ? new Date(q.verifiedAt).toLocaleDateString() : 'Audited'})</div>
                          )}
                          {q.adminApprovalNotes && (
                            <div><strong>Admin Approval Notes:</strong> {q.adminApprovalNotes}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                      >
                        <span>{isExpanded ? 'Hide Solution & Provenance' : 'View Official Key & Solution'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setHistoryModalQuestion(q)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1"
                          title="View Version Changelog"
                        >
                          <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                          <span>Changelog ({q.versionHistory.length})</span>
                        </button>

                        {/* Quick Audit for Admin */}
                        {!isVerified && isAdmin && (
                          <button
                            onClick={() => {
                              setQuickApproveQuestion(q);
                              setApprovalKeyRef(q.sourceProvenance.verifiedKeyRef || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Provenance</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: TOPIC MAPPING MATRIX */}
      {/* ==================================================== */}
      {activeTab === 'topic-mapping' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <span>Syllabus Topic to PYQ Recurrence Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Analyze how frequently specific civil engineering topics appear across Maharashtra PWD, MPSC MES, SSC JE, WRD, BMC, and ZP exams. Click any topic to start a focused practice session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topicMappings.map((tm, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-mono">
                      {tm.subjectName}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {tm.verifiedCount} Verified
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{tm.topic}</h3>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Exam Cadre Appearances:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(tm.examDistribution).map(([ex, cnt], eIdx) => (
                        <span key={eIdx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                          {ex.split(' ')[0]}: <strong>{cnt} Qs</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Difficulty: Easy ({tm.difficultyBreakdown.easy}) · Med ({tm.difficultyBreakdown.medium}) · Hard ({tm.difficultyBreakdown.hard})</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    {tm.totalQuestions} Total Questions
                  </span>

                  <button
                    onClick={() => {
                      const matched = questions.filter((q) => q.topic === tm.topic);
                      handleLaunchPractice(
                        `Topic Practice: ${tm.topic}`,
                        matched.length > 0 ? matched : questions.slice(0, 5),
                        false,
                        `Official Questions from ${tm.subjectName}`
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1 shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Practice Topic PYQs</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: EXAM-WISE & YEAR-WISE PAPERS */}
      {/* ==================================================== */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              <span>Authentic Exam & Year-Wise Question Paper Collections</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Solve complete official question papers under authentic computer-based test conditions or review verified keys paper-by-paper.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PYQ_PAPERS.map((paper) => (
              <div
                key={paper.id}
                id={`pyq-paper-card-${paper.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <ExamBadge examId={paper.examTargetId} />
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      Year {paper.year}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {paper.title}
                  </h3>

                  {paper.shift && (
                    <p className="text-xs text-slate-500 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>{paper.shift}</span>
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">QUESTIONS</span>
                      <span className="font-bold text-slate-800 font-mono">{paper.totalQuestions} MCQs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">DURATION</span>
                      <span className="font-bold text-slate-800 font-mono">{paper.durationMinutes} Min</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">MAX MARKS</span>
                      <span className="font-bold text-slate-800 font-mono">{paper.totalMarks} Marks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-medium flex items-center">
                    <FileCheck className="w-4 h-4 mr-1 text-emerald-600" />
                    Verified Official Key
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartPaperPractice(paper, true)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center space-x-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Study Mode</span>
                    </button>
                    <button
                      onClick={() => handleStartPaperPractice(paper, false)}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Solve CBT</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: PYQ ANALYTICS & REPEATED CONCEPTS */}
      {/* ==================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <span>PYQ Trend Analytics & High-Yield Concept Intelligence</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Data-driven insights extracted from verified official question papers to guide priority revision.
            </p>
          </div>

          {/* Quick Metrics */}
          {analytics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block">TOTAL QUESTIONS</span>
                <span className="text-2xl font-bold font-mono text-slate-900">{analytics.totalQuestions}</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-700 block">OFFICIAL VERIFIED</span>
                <span className="text-2xl font-bold font-mono text-emerald-800">{analytics.verifiedCount}</span>
              </div>
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
                <span className="text-[11px] font-semibold text-sky-700 block">EXAM CADRES COVERED</span>
                <span className="text-2xl font-bold font-mono text-sky-800">{Object.keys(analytics.examWiseCount).length}</span>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-[11px] font-semibold text-purple-700 block">YEARS COVERED</span>
                <span className="text-2xl font-bold font-mono text-purple-800">{Object.keys(analytics.yearWiseCount).length}</span>
              </div>
            </div>
          )}

          {/* Top Repeated High-Yield Concepts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Top Recurring Concepts & Codal Provisions (High-Yield Questions)</span>
            </h3>

            {analytics && analytics.topRepeatedConcepts.length > 0 ? (
              <div className="space-y-3">
                {analytics.topRepeatedConcepts.map((concept, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <span>{concept.conceptName}</span>
                        {concept.isCode && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                            {concept.isCode}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Appeared in: {concept.exams.slice(0, 3).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                        {concept.occurrenceCount}x Repeated
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading concept intelligence...</p>
            )}
          </div>

          {/* Year-over-Year & Subject Weightage Breakdown */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Year Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Year-Wise Distribution
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.yearWiseCount).map(([yr, count]) => {
                    const cnt = Number(count);
                    return (
                      <div key={yr} className="text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Year {yr}</span>
                          <span className="font-mono">{cnt} Questions</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (cnt / (analytics.totalQuestions || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Subject Weightage Split
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.subjectWiseCount).map(([sub, count]) => {
                    const cnt = Number(count);
                    return (
                      <div key={sub} className="text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>{sub}</span>
                          <span className="font-mono">{cnt} Qs</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (cnt / (analytics.totalQuestions || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: VERSION HISTORY CHANGELOG */}
      {/* ==================================================== */}
      {historyModalQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Content Version History & Provenance Trail
                </h3>
              </div>
              <button
                onClick={() => setHistoryModalQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div><strong>Question ID:</strong> <span className="font-mono text-slate-800">{historyModalQuestion.id}</span></div>
              <div><strong>Exam:</strong> {historyModalQuestion.exam} ({historyModalQuestion.year}) · Q.{historyModalQuestion.questionNumber}</div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {historyModalQuestion.versionHistory.map((item, vIdx) => (
                <div key={vIdx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      v{item.version}
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.editedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    Editor: {item.editorName} ({item.editorRole})
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {item.changeSummary}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setHistoryModalQuestion(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white font-bold text-xs"
              >
                Close Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: QUICK ADMIN APPROVAL (INLINE PROVENANCE AUDIT) */}
      {/* ==================================================== */}
      {quickApproveQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Audit & Verify Official PYQ Provenance
                </h3>
              </div>
              <button
                onClick={() => setQuickApproveQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Confirm official key and add audit changelog for: <strong>{quickApproveQuestion.exam} Q.{quickApproveQuestion.questionNumber}</strong>
            </p>

            <form onSubmit={handleQuickApproveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Key Reference</label>
                <input
                  type="text"
                  value={approvalKeyRef}
                  onChange={(e) => setApprovalKeyRef(e.target.value)}
                  placeholder="e.g. Master Final Key Series A Q.42"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Auditor Name & Role</label>
                <input
                  type="text"
                  value={approvalVerifiedBy}
                  onChange={(e) => setApprovalVerifiedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Audit Notes & Revision Log</label>
                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickApproveQuestion(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                >
                  Approve as Official PYQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* PRACTICE SESSION MODAL (CBT OR INSTANT FEEDBACK) */}
      {/* ==================================================== */}
      {practiceSessionConfig && (
        <PYQPracticeSessionModal
          title={practiceSessionConfig.title}
          subtitle={practiceSessionConfig.subtitle}
          questions={practiceSessionConfig.questions}
          instantFeedbackMode={practiceSessionConfig.instantFeedback}
          onClose={() => setPracticeSessionConfig(null)}
        />
      )}
    </div>
  );
};
