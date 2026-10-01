import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Printer,
  Download,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Eye,
  EyeOff,
  Calculator,
  HelpCircle,
  Share2,
  Bookmark,
  TrendingUp,
  FileCheck2,
  FileText,
  Building2,
  Compass,
  Check,
  Flag,
  Percent,
  Cpu
} from 'lucide-react';
import { PYQPaper, PYQItem } from '../types';
import { ExamBadge } from './common/ExamBadge';

interface PYQMasterPaperModalProps {
  paper: PYQPaper;
  questions: PYQItem[];
  onClose: () => void;
  onOpenTestSeries?: () => void;
}

export const PYQMasterPaperModal: React.FC<PYQMasterPaperModalProps> = ({
  paper,
  questions,
  onClose,
  onOpenTestSeries
}) => {
  // Main view modes
  const [activeMode, setActiveMode] = useState<'booklet' | 'cbt' | 'cutoff' | 'pdf'>('booklet');

  // Booklet Mode States
  const [selectedBookletSeries, setSelectedBookletSeries] = useState<string>(
    paper.officialBookletSeries && paper.officialBookletSeries.length > 0
      ? paper.officialBookletSeries[0]
      : 'Series A'
  );
  const [showAllExplanations, setShowAllExplanations] = useState<boolean>(false);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<string, boolean>>({});
  const [bilingualLanguage, setBilingualLanguage] = useState<'both' | 'english' | 'marathi'>('both');
  const [bookletSubjectFilter, setBookletSubjectFilter] = useState<string>('all');
  const [searchInPaper, setSearchInPaper] = useState<string>('');
  const [userSelfTestAnswers, setUserSelfTestAnswers] = useState<Record<string, number>>({});

  // CBT Simulator States
  const [cbtCurrentIdx, setCbtCurrentIdx] = useState<number>(0);
  const [cbtAnswers, setCbtAnswers] = useState<Record<string, number>>({});
  const [cbtMarkedForReview, setCbtMarkedForReview] = useState<Record<string, boolean>>({});
  const [cbtTimeRemainingSeconds, setCbtTimeRemainingSeconds] = useState<number>(
    (paper.durationMinutes || 120) * 60
  );
  const [cbtIsSubmitted, setCbtIsSubmitted] = useState<boolean>(false);
  const [cbtFontSize, setCbtFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string>('');
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);

  // Available questions pool for this paper
  const paperQuestions = React.useMemo(() => {
    if (!questions || questions.length === 0) return [];
    const matched = questions.filter(
      (q) => q.examTargetId === paper.examTargetId || q.year === paper.year
    );
    return matched.length > 0 ? matched : questions;
  }, [questions, paper]);

  // Filtered questions for Booklet mode
  const filteredBookletQuestions = React.useMemo(() => {
    return paperQuestions.filter((q) => {
      const matchesSubject = bookletSubjectFilter === 'all' || q.subjectId === bookletSubjectFilter;
      const matchesSearch =
        !searchInPaper ||
        q.stem.toLowerCase().includes(searchInPaper.toLowerCase()) ||
        (q.translations?.mr?.stem && q.translations.mr.stem.includes(searchInPaper)) ||
        (q.isCodeReference && q.isCodeReference.toLowerCase().includes(searchInPaper.toLowerCase()));
      return matchesSubject && matchesSearch;
    });
  }, [paperQuestions, bookletSubjectFilter, searchInPaper]);

  // CBT Countdown Timer
  useEffect(() => {
    if (activeMode !== 'cbt' || cbtIsSubmitted) return;
    const timer = setInterval(() => {
      setCbtTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCbtIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMode, cbtIsSubmitted]);

  // CBT Time Formatter
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remSecs = secs % 60;
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
    }
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  // Toggle individual question explanation in booklet mode
  const toggleExplanation = (id: string) => {
    setExpandedQuestionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculator evaluation
  const handleCalcButton = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (val === '=') {
      try {
        // Safe evaluation for basic math
        const sanitized = calcInput.replace(/[^0-9+\-*/().]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcResult(String(res));
      } catch (e) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  // CBT Evaluation
  const cbtAnsweredCount = Object.keys(cbtAnswers).length;
  let cbtCorrect = 0;
  let cbtWrong = 0;
  paperQuestions.forEach((q) => {
    if (cbtAnswers[q.id] !== undefined) {
      if (cbtAnswers[q.id] === q.correctOption) {
        cbtCorrect++;
      } else {
        cbtWrong++;
      }
    }
  });

  const marksPerQ = paper.marksPerQuestion || 2;
  const negativeMarkLoss = cbtWrong * (marksPerQ * (paper.negativeMarkRatio || 0.25));
  const rawScore = cbtCorrect * marksPerQ - negativeMarkLoss;
  const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
  const accuracyPercent =
    cbtAnsweredCount > 0 ? Math.round((cbtCorrect / cbtAnsweredCount) * 100) : 0;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full flex flex-col max-h-[96vh] shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header: Official Commission Exam Header */}
        <div className="px-5 py-3.5 bg-[#0F2744] text-white flex flex-wrap items-center justify-between gap-3 border-b border-sky-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
              <Building2 className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {paper.conductingBody || 'महाराष्ट्र लोकसेवा आयोग / PWD'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {paper.year} Official Paper
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                {paper.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Booklet Series Selector */}
            {paper.officialBookletSeries && paper.officialBookletSeries.length > 0 && (
              <div className="hidden sm:flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
                <span className="text-slate-400 text-[11px] font-bold">पुस्तिका मालिका:</span>
                <select
                  value={selectedBookletSeries}
                  onChange={(e) => setSelectedBookletSeries(e.target.value)}
                  className="bg-transparent text-amber-300 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {paper.officialBookletSeries.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Master Paper"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveMode('booklet')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMode === 'booklet'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>मास्टर प्रश्नपत्रिका (Master Booklet)</span>
            </button>

            <button
              onClick={() => setActiveMode('cbt')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMode === 'cbt'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>CBT परीक्षा सिम्युलेटर (TCS iON Mode)</span>
            </button>

            <button
              onClick={() => setActiveMode('cutoff')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMode === 'cutoff'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>कट-ऑफ व विश्लेषण (Cutoff & Intel)</span>
            </button>

            <button
              onClick={() => setActiveMode('pdf')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMode === 'pdf'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF डाऊनलोड</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 font-medium">
            <span className="text-[11px] font-mono">
              वेळ: <strong className="text-slate-800">{paper.durationMinutes} मिनिटे</strong> | गुण:{' '}
              <strong className="text-slate-800">{paper.totalMarks}</strong> | निगेटिव्ह:{' '}
              <strong className="text-rose-600">
                {paper.negativeMarkRatio === 0.333 ? '1/3rd' : '1/4th (0.50)'}
              </strong>
            </span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* MODE 1: MASTER BOOKLET (INTERACTIVE READER) */}
        {/* ==================================================== */}
        {activeMode === 'booklet' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
            {/* Booklet Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Bilingual Toggle */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <span className="text-slate-500 px-1 text-[11px]">भाषा:</span>
                  <button
                    onClick={() => setBilingualLanguage('both')}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      bilingualLanguage === 'both' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Bilingual (दोन्ही)
                  </button>
                  <button
                    onClick={() => setBilingualLanguage('marathi')}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      bilingualLanguage === 'marathi' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    मराठी
                  </button>
                  <button
                    onClick={() => setBilingualLanguage('english')}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      bilingualLanguage === 'english' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Toggle All Explanations */}
                <button
                  onClick={() => setShowAllExplanations((prev) => !prev)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1"
                >
                  {showAllExplanations ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-sky-600" />}
                  <span>{showAllExplanations ? 'सर्व उत्तरे लपवा' : 'सर्व अधिकृत उत्तरे व कोड उघडा'}</span>
                </button>
              </div>

              {/* Search Inside Paper */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="प्रश्न, IS Code, सूत्र शोधा..."
                  value={searchInPaper}
                  onChange={(e) => setSearchInPaper(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Official Candidate Instructions Notice Box */}
            {paper.officialInstructions && paper.officialInstructions.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-1.5">
                <div className="font-bold text-amber-900 flex items-center space-x-1.5 text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>परीक्षेच्या अधिकृत सूचना (Official Exam Instructions & Negative Marking)</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-amber-800 text-[11px]">
                  {paper.officialInstructions.map((inst, iIdx) => (
                    <li key={iIdx}>{inst}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {filteredBookletQuestions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
                  या फिल्टरनुसार प्रश्न उपलब्ध नाहीत.
                </div>
              ) : (
                filteredBookletQuestions.map((q, idx) => {
                  const isExpanded = showAllExplanations || !!expandedQuestionIds[q.id];
                  const userChoice = userSelfTestAnswers[q.id];
                  const isVerified = q.verificationStatus === 'official_verified';

                  return (
                    <div
                      key={q.id}
                      id={`booklet-q-${q.id}`}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 transition-all hover:border-slate-300"
                    >
                      {/* Question Header & Provenance */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 font-mono font-bold flex items-center justify-center border border-sky-200 text-xs">
                            Q.{idx + 1}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {q.subject} · {q.topic}
                          </span>
                          {q.isCodeReference && (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                              {q.isCodeReference}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="font-mono text-slate-500">
                            Booklet Q.{q.questionNumber || idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Key</span>
                          </span>
                        </div>
                      </div>

                      {/* Question Stem (Bilingual) */}
                      <div className="space-y-2">
                        {(bilingualLanguage === 'both' || bilingualLanguage === 'marathi') && q.translations?.mr?.stem && (
                          <p className="text-slate-900 font-medium text-sm leading-relaxed border-l-2 border-amber-500 pl-3">
                            {q.translations.mr.stem}
                          </p>
                        )}

                        {(bilingualLanguage === 'both' || bilingualLanguage === 'english') && (
                          <p className="text-slate-800 font-normal text-sm leading-relaxed pl-3 border-l-2 border-sky-400">
                            {q.stem}
                          </p>
                        )}
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isKey = oIdx === q.correctOption;
                          const isUserPicked = userChoice === oIdx;

                          let optBorderClass = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
                          if (isExpanded) {
                            if (isKey) {
                              optBorderClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs';
                            } else if (isUserPicked) {
                              optBorderClass = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                            }
                          } else if (isUserPicked) {
                            optBorderClass = 'border-sky-500 bg-sky-50 text-sky-900 font-bold';
                          }

                          const marathiOption = q.translations?.mr?.options?.[oIdx];

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                setUserSelfTestAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: oIdx,
                                }));
                              }}
                              className={`p-3 rounded-lg border text-left text-xs transition-all flex items-start space-x-2.5 ${optBorderClass}`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5 ${
                                  isExpanded && isKey
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <div className="flex-1 space-y-0.5">
                                {marathiOption && (bilingualLanguage === 'both' || bilingualLanguage === 'marathi') && (
                                  <div className="font-semibold text-slate-900">{marathiOption}</div>
                                )}
                                {(bilingualLanguage === 'both' || bilingualLanguage === 'english') && (
                                  <div className="text-slate-700">{opt}</div>
                                )}
                              </div>
                              {isExpanded && isKey && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase shrink-0">
                                  Official Key
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation & Codal Breakdown Drawer */}
                      {isExpanded && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 mt-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-emerald-800 font-bold">
                            <span className="flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>
                                अचूक उत्तर: पर्याय ({String.fromCharCode(65 + q.correctOption)}) — {q.options[q.correctOption]}
                              </span>
                            </span>
                            {q.isCodeReference && (
                              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                                {q.isCodeReference}
                              </span>
                            )}
                          </div>

                          {/* Bilingual Explanation */}
                          {q.translations?.mr?.explanation && (
                            <p className="text-slate-800 font-medium leading-relaxed">
                              <strong>मराठी स्पष्टीकरण:</strong> {q.translations.mr.explanation}
                            </p>
                          )}
                          <p className="text-slate-700 leading-relaxed">
                            <strong>English Codal Note:</strong> {q.explanation}
                          </p>

                          {/* Distractor Analysis */}
                          {q.whyOtherOptionsAreWrong && typeof q.whyOtherOptionsAreWrong === 'object' && (
                            <div className="pt-2 border-t border-slate-200 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                                इतर पर्याय का चूक आहेत? (Distractor Analysis):
                              </span>
                              {Object.entries(q.whyOtherOptionsAreWrong).map(([distractor, reason], rIdx) => (
                                <div key={rIdx} className="text-[11px] text-slate-600">
                                  • <strong className="text-slate-800">{distractor}</strong>: {reason}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Common Exam Trap Alert */}
                          {q.commonTraps && (
                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>
                                <strong>वारंवार होणारी चूक (Exam Trap):</strong> {q.commonTraps}
                              </span>
                            </div>
                          )}

                          {/* Source Provenance Footnote */}
                          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                            <span>
                              <strong>परीक्षेचे नाव:</strong> {q.sourceProvenance?.conductingBody || paper.conductingBody} · {paper.shift || 'Official Session'}
                            </span>
                            {q.sourceProvenance?.verifiedKeyRef && (
                              <span className="font-mono text-emerald-700">
                                {q.sourceProvenance.verifiedKeyRef}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card Bottom Actions */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => toggleExplanation(q.id)}
                          className="font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                        >
                          {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isExpanded ? 'स्पष्टीकरण लपवा' : 'अधिकृत उत्तर व IS कोड स्पष्टीकरण पहा'}</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            +2.00 / -0.50 Negative
                          </span>
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
        {/* MODE 2: CBT EXAM SIMULATOR (TCS iON REAL EXPERIENCE) */}
        {/* ==================================================== */}
        {activeMode === 'cbt' && (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden bg-slate-100">
            {cbtIsSubmitted ? (
              /* CBT Scorecard & Post-Exam Analytics */
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                <div className="p-6 rounded-2xl bg-[#0F2744] text-white text-center space-y-3 shadow-lg">
                  <span className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 inline-block mb-1">
                    <Award className="w-10 h-10 mx-auto" />
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    CBT परीक्षा निकाल व रँक अंदाज (Performance Scorecard)
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl mx-auto">
                    तुमच्या उत्तरांचे मूल्यमापन {paper.conductingBody || 'महाराष्ट्र आयोगाच्या'} अधिकृत उत्तरतालिकेनुसार करण्यात आले आहे.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-center">
                    <div className="p-3.5 bg-slate-800/90 rounded-xl">
                      <span className="text-[11px] text-slate-400 block font-semibold">अंतिम गुण (FINAL SCORE)</span>
                      <span className="text-2xl font-mono font-bold text-emerald-400">
                        {finalScore} / {paper.totalMarks}
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-800/90 rounded-xl">
                      <span className="text-[11px] text-slate-400 block font-semibold">अचूकता (ACCURACY)</span>
                      <span className="text-2xl font-mono font-bold text-sky-400">{accuracyPercent}%</span>
                    </div>
                    <div className="p-3.5 bg-slate-800/90 rounded-xl">
                      <span className="text-[11px] text-slate-400 block font-semibold">बरोबर / चूक / अनुत्तरित</span>
                      <span className="text-xl font-mono font-bold text-slate-200">
                        {cbtCorrect} / {cbtWrong} / {paperQuestions.length - cbtAnsweredCount}
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-800/90 rounded-xl">
                      <span className="text-[11px] text-slate-400 block font-semibold">निगेटिव्ह वजावट</span>
                      <span className="text-xl font-mono font-bold text-rose-400">
                        -{negativeMarkLoss.toFixed(2)} गुण
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cutoff Clearance Verdict Box */}
                {paper.cutoffScore && (
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                      finalScore >= paper.cutoffScore
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          finalScore >= paper.cutoffScore ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        {finalScore >= paper.cutoffScore ? '✓' : '!'}
                      </div>
                      <div>
                        <div className="font-bold text-sm">
                          {finalScore >= paper.cutoffScore
                            ? 'अभिनंदन! तुम्ही अधिकृत ओपन गुणवत्ता कट-ऑफ पार केला आहे.'
                            : 'कट-ऑफ पेक्षा थोडे गुण कमी पडले आहेत. सराव वाढवा.'}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {paper.year} मधील अधिकृत ओपन कट-ऑफ: <strong>{paper.cutoffScore} गुण</strong> | तुमचे गुण:{' '}
                          <strong>{finalScore} गुण</strong> (तफावत: {(finalScore - paper.cutoffScore).toFixed(2)} गुण)
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCbtIsSubmitted(false);
                        setActiveMode('booklet');
                        setShowAllExplanations(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 hover:bg-slate-50 text-xs shadow-xs"
                    >
                      स्पष्टीकरणासह संपूर्ण पेपर पहा
                    </button>
                  </div>
                )}

                {/* Retake or Switch */}
                <div className="flex items-center justify-end space-x-3 pt-3">
                  <button
                    onClick={() => {
                      setCbtAnswers({});
                      setCbtMarkedForReview({});
                      setCbtCurrentIdx(0);
                      setCbtTimeRemainingSeconds((paper.durationMinutes || 120) * 60);
                      setCbtIsSubmitted(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>पुन्हा CBT सोडवा (Retake)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Active CBT Interface */
              <>
                {/* Left Area: Active Question Canvas */}
                <div className="flex-1 flex flex-col justify-between p-5 bg-white overflow-y-auto">
                  {/* CBT Top Question Toolbar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">
                        Question No. {cbtCurrentIdx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                        {paperQuestions[cbtCurrentIdx]?.subject}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Font zoom */}
                      <div className="flex items-center space-x-1 text-slate-500 font-bold text-xs bg-slate-100 p-0.5 rounded">
                        <button
                          onClick={() => setCbtFontSize('sm')}
                          className={`px-1.5 py-0.5 rounded ${cbtFontSize === 'sm' ? 'bg-white shadow-xs' : ''}`}
                        >
                          A-
                        </button>
                        <button
                          onClick={() => setCbtFontSize('base')}
                          className={`px-1.5 py-0.5 rounded ${cbtFontSize === 'base' ? 'bg-white shadow-xs' : ''}`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => setCbtFontSize('lg')}
                          className={`px-1.5 py-0.5 rounded ${cbtFontSize === 'lg' ? 'bg-white shadow-xs' : ''}`}
                        >
                          A+
                        </button>
                      </div>

                      {/* Calculator Toggle */}
                      <button
                        onClick={() => setShowCalculator((prev) => !prev)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1"
                        title="Open Scientific Calculator"
                      >
                        <Calculator className="w-3.5 h-3.5 text-sky-600" />
                        <span>कॅल्क्युलेटर</span>
                      </button>

                      {/* Live Timer */}
                      <div className="flex items-center space-x-1 text-rose-700 font-mono font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(cbtTimeRemainingSeconds)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculator Floating Modal */}
                  {showCalculator && (
                    <div className="p-3 my-2 bg-slate-900 text-white rounded-xl shadow-xl max-w-xs space-y-2 text-xs border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-sky-400">Virtual Engineering Calculator</span>
                        <button onClick={() => setShowCalculator(false)} className="text-slate-400 hover:text-white">
                          ×
                        </button>
                      </div>
                      <div className="bg-slate-800 p-2 rounded text-right font-mono text-sm min-h-[30px]">
                        <div>{calcInput || '0'}</div>
                        {calcResult && <div className="text-emerald-400 text-xs font-bold">= {calcResult}</div>}
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center font-bold">
                        {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map(
                          (btn) => (
                            <button
                              key={btn}
                              type="button"
                              onClick={() => handleCalcButton(btn)}
                              className={`p-1.5 rounded text-xs ${
                                btn === '='
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white col-span-2'
                                  : btn === 'C'
                                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                  : 'bg-slate-700 hover:bg-slate-600 text-white'
                              }`}
                            >
                              {btn}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Question Stem Area */}
                  {paperQuestions[cbtCurrentIdx] && (
                    <div className="my-4 space-y-4">
                      {paperQuestions[cbtCurrentIdx].translations?.mr?.stem && (
                        <p
                          className={`font-semibold text-slate-900 leading-relaxed border-l-3 border-amber-500 pl-3 ${
                            cbtFontSize === 'lg' ? 'text-base' : cbtFontSize === 'sm' ? 'text-xs' : 'text-sm'
                          }`}
                        >
                          {paperQuestions[cbtCurrentIdx].translations?.mr?.stem}
                        </p>
                      )}

                      <p
                        className={`text-slate-700 leading-relaxed pl-3 border-l-3 border-sky-400 ${
                          cbtFontSize === 'lg' ? 'text-base' : cbtFontSize === 'sm' ? 'text-xs' : 'text-sm'
                        }`}
                      >
                        {paperQuestions[cbtCurrentIdx].stem}
                      </p>

                      {/* Options */}
                      <div className="space-y-2 pt-2">
                        {paperQuestions[cbtCurrentIdx].options.map((opt, optIndex) => {
                          const isSelected = cbtAnswers[paperQuestions[cbtCurrentIdx].id] === optIndex;
                          const mrOpt = paperQuestions[cbtCurrentIdx].translations?.mr?.options?.[optIndex];

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => {
                                setCbtAnswers((prev) => ({
                                  ...prev,
                                  [paperQuestions[cbtCurrentIdx].id]: optIndex,
                                }));
                              }}
                              className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start space-x-3 ${
                                isSelected
                                  ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold shadow-xs'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                  isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <div className="flex-1 space-y-0.5">
                                {mrOpt && <div className="font-semibold text-slate-900">{mrOpt}</div>}
                                <div className="text-slate-700">{opt}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CBT Bottom Action Buttons */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (paperQuestions[cbtCurrentIdx]) {
                            const qId = paperQuestions[cbtCurrentIdx].id;
                            setCbtMarkedForReview((prev) => ({
                              ...prev,
                              [qId]: !prev[qId],
                            }));
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold flex items-center space-x-1"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>
                          {cbtMarkedForReview[paperQuestions[cbtCurrentIdx]?.id]
                            ? 'रिव्ह्यू खूण काढा'
                            : 'Mark for Review'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (paperQuestions[cbtCurrentIdx]) {
                            const qId = paperQuestions[cbtCurrentIdx].id;
                            setCbtAnswers((prev) => {
                              const updated = { ...prev };
                              delete updated[qId];
                              return updated;
                            });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                      >
                        Clear Response
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={cbtCurrentIdx === 0}
                        onClick={() => setCbtCurrentIdx((prev) => Math.max(0, prev - 1))}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (cbtCurrentIdx < paperQuestions.length - 1) {
                            setCbtCurrentIdx((prev) => prev + 1);
                          } else {
                            setShowSubmitConfirmModal(true);
                          }
                        }}
                        className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs flex items-center space-x-1"
                      >
                        <span>{cbtCurrentIdx === paperQuestions.length - 1 ? 'Save & Finish' : 'Save & Next'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Area: CBT Question Palette & Candidate Profile */}
                <div className="w-full sm:w-72 bg-slate-50 p-4 border-t sm:border-t-0 sm:border-l border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Candidate Badge */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs mb-3 text-xs flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                        MH
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Engineering Officer Candidate</div>
                        <div className="text-[10px] text-slate-500">Roll: PWD-2024-8491</div>
                      </div>
                    </div>

                    {/* Question Status Legend */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] pb-3 border-b border-slate-200 font-medium text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[8px]">
                          ✓
                        </span>
                        <span>Answered ({cbtAnsweredCount})</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[8px]">
                          ✕
                        </span>
                        <span>Not Answered</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[8px]">
                          ★
                        </span>
                        <span>Marked Review</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-slate-300"></span>
                        <span>Not Visited</span>
                      </div>
                    </div>

                    {/* Question Number Palette Grid */}
                    <div className="pt-3">
                      <span className="text-[11px] font-bold text-slate-700 block mb-2">
                        Questions ({paperQuestions.length})
                      </span>
                      <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {paperQuestions.map((q, pIdx) => {
                          const isAnswered = cbtAnswers[q.id] !== undefined;
                          const isMarked = !!cbtMarkedForReview[q.id];
                          const isCurrent = cbtCurrentIdx === pIdx;

                          let bgClass = 'bg-slate-200 text-slate-700 hover:bg-slate-300';
                          if (isMarked) {
                            bgClass = 'bg-purple-600 text-white font-bold';
                          } else if (isAnswered) {
                            bgClass = 'bg-emerald-600 text-white font-bold';
                          }

                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => setCbtCurrentIdx(pIdx)}
                              className={`h-7 rounded text-xs font-mono font-semibold transition-all ${bgClass} ${
                                isCurrent ? 'ring-2 ring-sky-500 ring-offset-1' : ''
                              }`}
                            >
                              {pIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Final Submit Button */}
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirmModal(true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>अंतिम पेपर सबमिट करा (Submit Exam)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* MODE 3: CUTOFF & PAPER INTELLIGENCE */}
        {/* ==================================================== */}
        {activeMode === 'cutoff' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <span>अधिकृत कट-ऑफ व गुणवत्ता गुण (Official Historical Cutoffs)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {paper.conductingBody || 'महाराष्ट्र लोकसेवा आयोग / संबंधित विभाग'} द्वारे जाहीर अधिकृत वर्गवारीनुसार कट-ऑफ.
                  </p>
                </div>

                {paper.officialGazetteNotice && (
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                    {paper.officialGazetteNotice}
                  </span>
                )}
              </div>

              {/* Category Cutoff Cards */}
              {paper.categoryCutoffs ? (
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 text-white text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">OPEN MERIT</span>
                    <span className="text-2xl font-mono font-bold">{paper.categoryCutoffs.open}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">/ {paper.totalMarks} Marks</span>
                  </div>

                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-sky-800 block">OBC NON-CREAMY</span>
                    <span className="text-2xl font-mono font-bold text-sky-950">{paper.categoryCutoffs.obc}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">/ {paper.totalMarks} Marks</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">EWS 10%</span>
                    <span className="text-2xl font-mono font-bold text-emerald-950">{paper.categoryCutoffs.ews}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">/ {paper.totalMarks} Marks</span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-purple-800 block">SC CATEGORY</span>
                    <span className="text-2xl font-mono font-bold text-purple-950">{paper.categoryCutoffs.sc}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">/ {paper.totalMarks} Marks</span>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-800 block">ST CATEGORY</span>
                    <span className="text-2xl font-mono font-bold text-rose-950">{paper.categoryCutoffs.st}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">/ {paper.totalMarks} Marks</span>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-indigo-800 block">FEMALE / WOMEN</span>
                    <span className="text-2xl font-mono font-bold text-indigo-950">{paper.categoryCutoffs.female}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">/ {paper.totalMarks} Marks</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  Cutoff data available in detailed PDF annexure.
                </div>
              )}
            </div>

            {/* Subject Distribution Breakdown */}
            {paper.subjectBreakdown && paper.subjectBreakdown.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>या प्रश्नपत्रिकेतील विषयानुसार गुणांचे वाटप (Subject Weightage Split)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paper.subjectBreakdown.map((sb, sbIdx) => (
                    <div
                      key={sbIdx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{sb.subject}</span>
                      <span className="font-mono font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded">
                        {sb.count} Questions ({sb.count * (paper.marksPerQuestion || 2)} Marks)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* MODE 4: PRINTABLE OFFICIAL PDF & OMR BOOKLET */}
        {/* ==================================================== */}
        {activeMode === 'pdf' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80">
            {/* Print action header (hidden on actual print) */}
            <div className="print:hidden max-w-4xl mx-auto mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">अधिकृत प्रश्नपत्रिका प्रिंट व PDF फॉरमॅट</h4>
                <p className="text-xs text-slate-500">
                  परीक्षेचा प्रत्यक्ष पेपर जसा असतो तसाच दोन कॉलम स्वरूपात उत्तरतालिकेसह डाऊनलोड किंवा प्रिंट करा.
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिंट / PDF सेव्ह करा (Print PDF)</span>
              </button>
            </div>

            {/* Official Exam Paper Printable Sheet (A4 format) */}
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-xl border border-slate-300 rounded-sm text-slate-900 space-y-6 print:shadow-none print:border-none print:p-0">
              {/* Formal Govt. Exam Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-sm font-bold tracking-wider uppercase text-slate-800">
                  {paper.conductingBody || 'महाराष्ट्र शासन / महाराष्ट्र लोकसेवा आयोग'}
                </div>
                <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
                  {paper.title}
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold pt-1">
                  <span>वेळ: {paper.durationMinutes} मिनिटे (२ तास)</span>
                  <span>|</span>
                  <span>एकूण प्रश्न: {paper.totalQuestions}</span>
                  <span>|</span>
                  <span>एकूण गुण: {paper.totalMarks}</span>
                  <span>|</span>
                  <span>मालिका: {selectedBookletSeries}</span>
                </div>
              </div>

              {/* Candidate Info Box */}
              <div className="grid grid-cols-2 gap-4 text-xs p-3 border border-slate-400 bg-slate-50">
                <div>
                  <span className="font-bold block">उमेदवाराचा रोल नंबर (Roll No.):</span>
                  <div className="flex space-x-1 mt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                      <span key={b} className="w-6 h-6 border border-slate-400 inline-block bg-white"></span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-bold block">उमेदवाराची स्वाक्षरी:</span>
                  <div className="h-6 border-b border-slate-400 mt-1"></div>
                </div>
              </div>

              {/* Questions in Clean 2-Column Print Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                {paperQuestions.map((q, idx) => (
                  <div key={q.id} className="text-xs space-y-1.5 pb-3 border-b border-slate-200">
                    <div className="font-bold flex items-start space-x-1.5">
                      <span className="font-mono text-slate-900">Q.{idx + 1}.</span>
                      <div className="space-y-0.5">
                        {q.translations?.mr?.stem && (
                          <div className="text-slate-950 font-medium">{q.translations.mr.stem}</div>
                        )}
                        <div className="text-slate-800">{q.stem}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 pl-4 pt-1 text-[11px]">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="text-slate-700">
                          <strong>({String.fromCharCode(65 + oIdx)})</strong> {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Master Answer Key Annexure */}
              <div className="pt-6 border-t-2 border-slate-900 space-y-3">
                <div className="text-center font-bold text-sm uppercase tracking-wide">
                  अधिकृत अंतिम उत्तरतालिका (OFFICIAL MASTER FINAL KEY)
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center text-xs font-mono">
                  {paperQuestions.map((q, idx) => (
                    <div key={q.id} className="p-1 border border-slate-300 rounded bg-slate-50">
                      <span className="text-[10px] text-slate-500 block">Q.{idx + 1}</span>
                      <span className="font-bold text-slate-900">
                        {String.fromCharCode(65 + q.correctOption)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Final Submit in CBT */}
        {showSubmitConfirmModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-base">परीक्षा सबमिट करण्याची खात्री करा</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                तुम्ही <strong>{cbtAnsweredCount}</strong> पैकी <strong>{paperQuestions.length}</strong> प्रश्न सोडवले आहेत.
                आता सबमिट केल्यास तुमचे अंतिम गुण व विश्लेषण दाखवले जाईल.
              </p>
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  पुन्हा सोडवा (Continue)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitConfirmModal(false);
                    setCbtIsSubmitted(true);
                  }}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  होय, सबमिट करा
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
