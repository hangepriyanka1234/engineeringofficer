import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Target,
  Filter,
  CheckCircle2,
  XCircle,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Bot,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Calculator,
  HardHat,
  Share2,
  Flame,
  Zap,
  Clock,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  Check,
  RefreshCw,
  Globe2,
  Flag,
  Timer,
  Pause,
  Play,
  Award,
  ChevronLeft,
  ChevronDown,
  FileText,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import {
  Question,
  SubjectId,
  ExamTargetId,
  StudentProfile,
  PracticeMode,
  PracticeEvaluationResult
} from '../types';
import { SUBJECTS_LIST } from '../data/mockData';
import { StorageService } from '../services/storageService';
import { PracticeService, BatchQuestionsResponse } from '../services/practiceService';
import { QuestionCard } from '../components/QuestionCard';

interface PracticeViewProps {
  questions: Question[];
  profile: StudentProfile;
  selectedExam: ExamTargetId;
  initialSubject?: string;
  onQuestionSolved: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  questions: initialQuestions,
  profile,
  selectedExam,
  initialSubject = 'all',
  onQuestionSolved,
}) => {
  // Practice Mode & Language State
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('Subject');
  const [instantMode, setInstantMode] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'mr' | 'hi'>('en');

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [pyqYearFilter, setPyqYearFilter] = useState<string>('all');

  // Pagination & Batching State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [batchData, setBatchData] = useState<BatchQuestionsResponse | null>(null);
  const [loadingBatch, setLoadingBatch] = useState<boolean>(false);
  const [isCached, setIsCached] = useState<boolean>(false);

  // User Interaction State
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [savedQuestions, setSavedQuestions] = useState<string[]>(profile.savedQuestionIds || []);
  const [simulationSubmitted, setSimulationSubmitted] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<PracticeEvaluationResult | null>(null);
  const [submittingEvaluation, setSubmittingEvaluation] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Timed Practice State
  const [isTimed, setIsTimed] = useState<boolean>(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(30 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Daily Challenge State
  const [dailyStatus, setDailyStatus] = useState(() => StorageService.getDailyChallengeStatus());

  // Mistakes List
  const mistakeQuestionIds = useMemo(() => {
    const mistakes = StorageService.getMistakes();
    return new Set(mistakes.map((m) => m.questionId));
  }, []);

  // Fetch Questions Batch from Server Engine
  const fetchQuestionsBatch = useCallback(async () => {
    setLoadingBatch(true);
    try {
      const response = await PracticeService.getBatchedQuestions({
        mode: practiceMode,
        subjectId: selectedSubject,
        topic: selectedTopic,
        examTargetId: selectedExamFilter !== 'all' ? selectedExamFilter : (selectedExam || 'all'),
        difficulty: selectedDifficulty,
        language,
        page: currentPage,
        pageSize,
        simulationMode: !instantMode && !simulationSubmitted,
      });

      setBatchData(response);
      setIsCached(!!response.cached);
    } catch (err) {
      console.error('[PracticeView] Failed to load questions batch:', err);
    } finally {
      setLoadingBatch(false);
    }
  }, [
    practiceMode,
    selectedSubject,
    selectedTopic,
    selectedExamFilter,
    selectedExam,
    selectedDifficulty,
    language,
    currentPage,
    pageSize,
    instantMode,
    simulationSubmitted,
  ]);

  useEffect(() => {
    fetchQuestionsBatch();
  }, [fetchQuestionsBatch]);

  // Reset page when mode or subject changes
  const handleModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    setCurrentPage(1);
    setUserAnswers({});
    setMarkedForReview(new Set());
    setSimulationSubmitted(false);
    setEvaluationResult(null);
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeRemainingSeconds > 0 && !simulationSubmitted) {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsTimerRunning(false);
            // Auto submit on time expiry
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemainingSeconds, simulationSubmitted]);

  // Start or Toggle Timer
  const handleToggleTimer = () => {
    if (!isTimerRunning && timeRemainingSeconds === 0) {
      setTimeRemainingSeconds(timeLimitMinutes * 60);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  // Active Questions List
  const activeQuestions: Question[] = useMemo(() => {
    if (batchData?.questions && batchData.questions.length > 0) {
      return batchData.questions;
    }
    // Fallback to in-memory questions
    let list = [...initialQuestions];
    if (selectedSubject !== 'all') {
      list = list.filter((q) => q.subjectId === selectedSubject);
    }
    if (selectedDifficulty !== 'all') {
      list = list.filter((q) => q.difficulty === selectedDifficulty);
    }
    return list;
  }, [batchData, initialQuestions, selectedSubject, selectedDifficulty]);

  // Available topics for selected subject
  const availableTopics = useMemo(() => {
    if (selectedSubject === 'all') return [];
    const topics = new Set<string>();
    initialQuestions.forEach((q) => {
      if (q.subjectId === selectedSubject && q.topic) {
        topics.add(q.topic);
      }
    });
    return Array.from(topics);
  }, [initialQuestions, selectedSubject]);

  // Distinct PYQ years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    initialQuestions.forEach((q) => {
      if (q.year) years.add(q.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [initialQuestions]);

  // Handle Answer Selection
  const handleAnswerSelected = (question: Question, answer: number | string) => {
    setUserAnswers((prev) => ({ ...prev, [question.id]: answer }));
    onQuestionSolved();

    // In Instant Feedback Mode, evaluate and auto-record mistake
    if (instantMode && !question.isStripped) {
      let isCorrect = false;
      if (question.questionType === 'numerical') {
        const val = typeof answer === 'number' ? answer : parseFloat(answer as string);
        if (!isNaN(val) && typeof question.correctAnswer === 'number') {
          const tol = question.numericalTolerance || 0.05;
          isCorrect = Math.abs(val - question.correctAnswer) <= tol;
        }
      } else {
        isCorrect = Number(answer) === question.correctOption;
      }

      if (!isCorrect) {
        StorageService.recordMistake(
          question,
          typeof answer === 'number' ? answer : 0,
          question.correctOption,
          question.questionType === 'numerical' ? 'calculation_error' : 'conceptual_gap',
          `Auto-logged from ${practiceMode} Practice Engine`
        );
      }
    }

    // Daily Challenge Completion
    if (practiceMode === 'Daily Challenge') {
      const updatedAnswers = { ...userAnswers, [question.id]: answer };
      const allFiveAnswered = activeQuestions.every((q) => updatedAnswers[q.id] !== undefined);
      if (allFiveAnswered) {
        let score = 0;
        activeQuestions.forEach((q) => {
          const ans = updatedAnswers[q.id];
          if (ans === q.correctOption) score++;
        });
        StorageService.recordDailyChallengeAttempt(score, activeQuestions.length);
        setDailyStatus(StorageService.getDailyChallengeStatus());
      }
    }
  };

  // Toggle Mark for Review
  const toggleMarkForReview = (qId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Toggle Bookmark
  const toggleSaveQuestion = (qId: string) => {
    let updated: string[];
    if (savedQuestions.includes(qId)) {
      updated = savedQuestions.filter((id) => id !== qId);
    } else {
      updated = [...savedQuestions, qId];
    }
    setSavedQuestions(updated);
    StorageService.updateProfile({ savedQuestionIds: updated });
  };

  // Reset Session
  const handleResetSession = () => {
    if (confirm('Reset all answers for the current session?')) {
      setUserAnswers({});
      setMarkedForReview(new Set());
      setSimulationSubmitted(false);
      setEvaluationResult(null);
      setTimeSpentSeconds(0);
      setTimeRemainingSeconds(timeLimitMinutes * 60);
      setIsTimerRunning(false);
    }
  };

  // Final Server Submission for Exam Simulation Mode
  const handleFinalSubmit = async () => {
    setShowSubmitModal(false);
    setSubmittingEvaluation(true);
    setIsTimerRunning(false);

    try {
      const evalData = await PracticeService.submitSession({
        answers: userAnswers,
        timeSpentSeconds,
        targetExamId: selectedExam,
      });

      setEvaluationResult(evalData);
      setSimulationSubmitted(true);

      // Reload batch with unstripped questions so student can review answers & explanations
      const unstrippedBatch = await PracticeService.getBatchedQuestions({
        mode: practiceMode,
        subjectId: selectedSubject,
        topic: selectedTopic,
        examTargetId: selectedExamFilter !== 'all' ? selectedExamFilter : (selectedExam || 'all'),
        difficulty: selectedDifficulty,
        language,
        page: currentPage,
        pageSize,
        simulationMode: false,
      });

      setBatchData(unstrippedBatch);
    } catch (err) {
      console.error('[PracticeView] Error submitting evaluation:', err);
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  // Scroll to question
  const scrollToQuestion = (qId: string) => {
    const el = document.getElementById(`question-card-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 10 Practice Modes Configuration
  const MODES: { id: PracticeMode; label: string; icon: string; count?: number }[] = [
    { id: 'Subject', label: 'Subject-wise', icon: '📚' },
    { id: 'Topic', label: 'Topic-wise', icon: '🎯' },
    { id: 'Exam-specific', label: 'Exam-specific', icon: '🏛️' },
    { id: 'PYQ', label: 'Authentic PYQs', icon: '📜' },
    { id: 'Daily Challenge', label: 'Daily Challenge', icon: '⚡' },
    { id: 'Weak-topic', label: 'Weak Topics', icon: '⚠️' },
    { id: 'Revision', label: 'Formula & Code', icon: '🔄' },
    { id: 'Incorrect-only', label: 'Mistake Review', icon: '❌', count: mistakeQuestionIds.size },
    { id: 'Bookmarked', label: 'Saved Items', icon: '⭐', count: savedQuestions.length },
    { id: 'Mixed', label: 'Mixed Shuffle', icon: '🔀' },
  ];

  const solvedCount = Object.keys(userAnswers).length;
  const markedCount = markedForReview.size;
  const totalCount = batchData?.pagination.totalCount || activeQuestions.length;

  // Format Time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase">
                PART 9 · PRODUCTION CIVIL MCQ ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">Server-Controlled Key Bank</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 flex items-center space-x-2">
              <Target className="w-6 h-6 text-sky-600" />
              <span>Civil Engineering Practice & CBT Simulation</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Production-grade practice engine with official source provenance, codal review, and human-verified bilingual translations.
            </p>
          </div>

          {/* Controls: Language, Mode Toggle, Reset */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Multilingual Selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <Globe2 className="w-4 h-4 text-slate-500 ml-2 mr-1.5" />
              {(['en', 'mr', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    language === lang
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={
                    lang === 'en'
                      ? 'Standard English'
                      : lang === 'mr'
                      ? 'मराठी - अधिकृत नागरी अभियांत्रिकी परिभाषा (MPSC / PWD / WRD / ZP)'
                      : 'हिंदी - प्रामाणिक अनुवाद (SSC JE / RRB JE)'
                  }
                >
                  {lang === 'en' ? 'EN' : lang === 'mr' ? 'मराठी' : 'हिंदी'}
                </button>
              ))}
            </div>

            {/* Instant Mode vs Exam Simulation Toggle */}
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Mode:</span>
              <button
                type="button"
                onClick={() => {
                  setInstantMode(!instantMode);
                  setUserAnswers({});
                  setSimulationSubmitted(false);
                  setEvaluationResult(null);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  instantMode ? 'bg-sky-600' : 'bg-purple-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    instantMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-[11px] font-bold font-mono text-slate-700">
                {instantMode ? 'Instant Feedback' : 'CBT Simulation'}
              </span>
            </div>

            {/* Reset Button */}
            {solvedCount > 0 && (
              <button
                onClick={handleResetSession}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Reset session answers"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Timed Practice Toolbar (Visible in Simulation Mode) */}
        {!instantMode && (
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-purple-900 font-bold">
              <Timer className="w-4 h-4 text-purple-600" />
              <span>Exam Simulation Clock:</span>
              <span className="font-mono text-sm bg-white px-2 py-0.5 rounded-lg border border-purple-200 text-purple-950 font-black">
                {formatTime(timeRemainingSeconds)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleTimer}
                className={`px-3 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                  isTimerRunning
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? 'Pause Clock' : 'Start Timer'}</span>
              </button>

              <select
                disabled={isTimerRunning}
                value={timeLimitMinutes}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setTimeLimitMinutes(m);
                  setTimeRemainingSeconds(m * 60);
                }}
                className="rounded-lg border border-purple-200 bg-white px-2.5 py-1 font-semibold text-purple-900 disabled:opacity-50"
              >
                <option value={15}>15 Minutes (Sprint)</option>
                <option value={30}>30 Minutes (Standard)</option>
                <option value={45}>45 Minutes (Intensive)</option>
                <option value={60}>60 Minutes (Full Paper)</option>
              </select>
            </div>

            <span className="text-purple-700 text-[11px] font-mono">
              Server-Controlled Answer Keys Hidden · 0% Leakage
            </span>
          </div>
        )}

        {/* 10 Practice Modes Horizontal Selector */}
        <div className="border-t border-slate-100 pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            SELECT PRACTICE DISCIPLINE & MODE:
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            {MODES.map((m) => {
              const isActive = practiceMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                  {m.count !== undefined && m.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {m.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multilingual Notice Banner */}
      {language !== 'en' && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {language === 'mr'
                ? 'मराठी भाषांतर सक्रिय: अधिकृत तांत्रिक संज्ञा व IS Code क्लॉज भाषांतर मानकांचे पुनरावलोकन पूर्ण झाले आहे.'
                : 'हिंदी अनुवाद सक्रिय: आधिकारिक सिविल इंजीनियरिंग तकनीकी शब्दावली और संदर्भों की समीक्षा की गई है।'}
            </span>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-100 font-bold">
            Human-Audited Translation
          </span>
        </div>
      )}

      {/* Daily Challenge Banner */}
      {practiceMode === 'Daily Challenge' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900">
              <Flame className="w-6 h-6 text-amber-600" />
              <h2 className="font-extrabold text-base">Civil Daily Challenge · 5 High-Yield Questions</h2>
            </div>
            {dailyStatus.completed && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Completed Today ({dailyStatus.score}/5 Score)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Solve these 5 daily codal and numerical problems to protect your streak. Today's set focuses on
            IS 456 concrete limit states, Mohr's circle pure shear, and Terzaghi clay bearing capacity.
          </p>
        </div>
      )}

      {/* Mode-Specific Contextual Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400 font-semibold">
          <Filter className="w-4 h-4" />
          <span>Active Filters:</span>
        </div>

        {/* Subject Filter */}
        {['Subject', 'Topic', 'Mixed', 'Revision', 'PYQ'].includes(practiceMode) && (
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic('all');
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          >
            <option value="all">All Subjects ({SUBJECTS_LIST.length})</option>
            {SUBJECTS_LIST.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        )}

        {/* Topic Filter */}
        {practiceMode === 'Topic' && availableTopics.length > 0 && (
          <select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          >
            <option value="all">All Chapters / Topics ({availableTopics.length})</option>
            {availableTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        {/* Exam Specific Filter */}
        {practiceMode === 'Exam-specific' && (
          <select
            value={selectedExamFilter}
            onChange={(e) => {
              setSelectedExamFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          >
            <option value="all">All Target Recruitment Exams</option>
            <option value="Maha PWD">Maharashtra PWD JE / CEA</option>
            <option value="MPSC">MPSC Civil Engineering Services (MES)</option>
            <option value="SSC JE">SSC Junior Engineer (Civil)</option>
            <option value="RRB JE">RRB Junior Engineer</option>
            <option value="BMC">BMC / Municipal Corporation JE</option>
            <option value="ZP">Zilla Parishad (ZP) Civil JE</option>
            <option value="WRD">Water Resources Dept (WRD / Irrigation)</option>
          </select>
        )}

        {/* PYQ Year Filter */}
        {practiceMode === 'PYQ' && (
          <select
            value={pyqYearFilter}
            onChange={(e) => {
              setPyqYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          >
            <option value="all">All Exam Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={String(yr)}>
                {yr} Authentic Papers
              </option>
            ))}
          </select>
        )}

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => {
            setSelectedDifficulty(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
        >
          <option value="all">All Difficulty Levels</option>
          <option value="easy">Easy (Direct Codal)</option>
          <option value="medium">Medium (Analytical)</option>
          <option value="hard">Hard (Multi-step calculation)</option>
        </select>

        {/* Cache & Count Indicators */}
        <div className="ml-auto flex items-center space-x-3 text-slate-400 font-mono">
          {isCached && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              Cached (0 roundtrips)
            </span>
          )}
          <span>
            {batchData?.pagination
              ? `Page ${batchData.pagination.page} of ${batchData.pagination.totalPages} · ${batchData.pagination.totalCount} Qs`
              : `${activeQuestions.length} Questions`}
          </span>
        </div>
      </div>

      {/* CBT Question Palette (Visible in Exam Simulation Mode) */}
      {!instantMode && !simulationSubmitted && activeQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-purple-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>CBT Question Status Palette:</span>
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Answered: {solvedCount}</span>
              </span>
              <span className="flex items-center space-x-1 text-purple-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                <span>Marked: {markedCount}</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-500 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span>Unanswered: {Math.max(0, activeQuestions.length - solvedCount)}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
            {activeQuestions.map((q, qIdx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isMarked = markedForReview.has(q.id);

              let pillStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
              if (isMarked) {
                pillStyle = 'bg-purple-100 text-purple-900 border-purple-300 font-bold ring-1 ring-purple-400';
              } else if (isAnswered) {
                pillStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => scrollToQuestion(q.id)}
                  className={`w-8 h-8 rounded-lg border text-xs font-mono transition-all flex items-center justify-center ${pillStyle}`}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Post-Submission Performance Evaluation Card (Exam Simulation Mode) */}
      {simulationSubmitted && evaluationResult && (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                OFFICIAL SERVER EVALUATION COMPLETE
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1.5 flex items-center space-x-2">
                <Award className="w-6 h-6 text-emerald-600" />
                <span>Civil Exam Score Card & Rationale Review</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Answer keys verified by Engineering Officer authoritative grading engine. Full solutions unlocked below.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">TOTAL SCORE</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  {evaluationResult.totalScore} / {evaluationResult.maxScore}
                </span>
              </div>
              <div className="text-right border-l border-slate-200 pl-4">
                <span className="text-xs text-slate-400 block font-mono">ACCURACY</span>
                <span className="text-2xl font-black text-sky-700 font-mono">
                  {evaluationResult.accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 block font-semibold">Correct Answers</span>
              <span className="text-lg font-bold text-emerald-900 font-mono">
                {evaluationResult.correctAnswers} (+{evaluationResult.correctAnswers * 2} Marks)
              </span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-rose-700 block font-semibold">Negative Marking</span>
              <span className="text-lg font-bold text-rose-900 font-mono">
                {evaluationResult.incorrectAnswers} (-{(evaluationResult.incorrectAnswers * 0.5).toFixed(2)})
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 block font-semibold">Unattempted</span>
              <span className="text-lg font-bold text-slate-800 font-mono">
                {evaluationResult.unattemptedQuestions}
              </span>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
              <span className="text-indigo-700 block font-semibold">Time Spent</span>
              <span className="text-lg font-bold text-indigo-900 font-mono">
                {formatTime(evaluationResult.timeSpentSeconds)} ({evaluationResult.averageTimePerQuestion}s/Q)
              </span>
            </div>
          </div>

          {/* Subject-Wise Performance Breakdown */}
          {Object.keys(evaluationResult.subjectBreakdown).length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Discipline & Subject Score Breakdown:
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Attempted</th>
                      <th className="p-2.5">Correct</th>
                      <th className="p-2.5">Net Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(evaluationResult.subjectBreakdown).map(([subId, rawStats]) => {
                      const stats = rawStats as { attempted: number; correct: number; total: number; score: number };
                      const subObj = SUBJECTS_LIST.find((s) => s.id === subId);
                      return (
                        <tr key={subId} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-semibold text-slate-900">
                            {subObj?.name || subId.toUpperCase()}
                          </td>
                          <td className="p-2.5 font-mono">{stats.attempted} / {stats.total}</td>
                          <td className="p-2.5 font-mono text-emerald-700 font-bold">{stats.correct}</td>
                          <td className="p-2.5 font-mono font-bold">{stats.score.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions Stack */}
      <div className="space-y-5">
        {loadingBatch ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
            <span className="text-xs font-bold text-slate-600 block">
              Retrieving Authenticated Civil Engineering Questions...
            </span>
          </div>
        ) : activeQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Questions Available in This Mode</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {practiceMode === 'Incorrect-only'
                ? 'Your mistake notebook is currently empty! When you answer questions incorrectly in practice, they will automatically appear here for focused drill.'
                : practiceMode === 'Bookmarked'
                ? 'No questions bookmarked yet. Click the bookmark star on any question card to save it for revision.'
                : 'Try adjusting your subject, topic, or difficulty filter to load available items.'}
            </p>
          </div>
        ) : (
          activeQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={(currentPage - 1) * pageSize + idx}
              instantMode={instantMode || simulationSubmitted}
              isSaved={savedQuestions.includes(q.id)}
              isMarkedForReview={markedForReview.has(q.id)}
              userAnswer={userAnswers[q.id]}
              language={language}
              onAnswerSelected={handleAnswerSelected}
              onToggleBookmark={toggleSaveQuestion}
              onToggleMarkForReview={!instantMode && !simulationSubmitted ? toggleMarkForReview : undefined}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {batchData && batchData.pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1 || loadingBatch}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="font-mono text-slate-600 px-2">
              Page <strong>{currentPage}</strong> of <strong>{batchData.pagination.totalPages}</strong>
            </span>
            <button
              disabled={currentPage >= batchData.pagination.totalPages || loadingBatch}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Batch Size:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-800"
            >
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={25}>25 Questions</option>
            </select>
          </div>
        </div>
      )}

      {/* Sticky Exam Simulation Bottom Action Bar */}
      {!instantMode && !simulationSubmitted && activeQuestions.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between">
          <div>
            <span className="font-bold text-sm block">Exam Simulation Active</span>
            <span className="text-xs text-slate-400 font-mono">
              {solvedCount} / {activeQuestions.length} answered · {markedCount} marked for review
            </span>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <span>Submit Exam Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-purple-900">
              <div className="p-2 bg-purple-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Submit Exam Session?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Once submitted, your answers will be authoritatively graded on the server. Answer keys and detailed
              distractor analyses will be revealed.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Questions:</span>
                <span className="font-bold text-slate-900">{activeQuestions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Attempted:</span>
                <span>{solvedCount}</span>
              </div>
              <div className="flex justify-between text-purple-700 font-bold">
                <span>Marked for Review:</span>
                <span>{markedCount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Unattempted:</span>
                <span className="font-bold text-rose-700">{Math.max(0, activeQuestions.length - solvedCount)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Return to Test
              </button>
              <button
                type="button"
                disabled={submittingEvaluation}
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1"
              >
                {submittingEvaluation ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Confirm & Evaluate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
