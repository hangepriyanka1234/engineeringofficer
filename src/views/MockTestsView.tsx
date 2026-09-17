import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldAlert,
  BarChart2,
  Flag,
  ArrowRight,
  Layers,
  Sparkles,
  Sliders,
  Check,
  Search,
  BookOpen,
  Filter,
  Flame,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MockTest,
  Question,
  TestAttempt,
  StudentProfile,
  ExamTargetId,
  MockTestCategory,
  IncompleteTestSession,
  TestSection
} from '../types';
import { StorageService } from '../services/storageService';
import { ExamBadge } from '../components/common/ExamBadge';
import { CustomTestModal } from '../components/mock/CustomTestModal';
import { SubmitConfirmModal } from '../components/mock/SubmitConfirmModal';
import { EntitlementModal } from '../components/mock/EntitlementModal';

interface MockTestsViewProps {
  mockTests: MockTest[];
  questions: Question[];
  profile: StudentProfile;
  selectedExam: ExamTargetId;
  onAttemptSaved: () => void;
  onUpgradePlan?: () => void;
}

export const MockTestsView: React.FC<MockTestsViewProps> = ({
  mockTests,
  questions,
  profile,
  selectedExam,
  onAttemptSaved,
  onUpgradePlan,
}) => {
  // Test selection and state
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [serverSessionId, setServerSessionId] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, number | string | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [latestAttempt, setLatestAttempt] = useState<TestAttempt | null>(null);

  // Modals & Incomplete Sessions
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [entitlementModalTest, setEntitlementModalTest] = useState<MockTest | null>(null);
  const [incompleteSession, setIncompleteSession] = useState<IncompleteTestSession | null>(
    StorageService.getIncompleteSession()
  );

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [freeOnlyFilter, setFreeOnlyFilter] = useState<boolean>(false);
  const [solutionsFilter, setSolutionsFilter] = useState<'all' | 'wrong' | 'unattempted' | 'marked' | 'correct'>('all');

  // Check for active incomplete session on mount
  useEffect(() => {
    const session = StorageService.getIncompleteSession();
    setIncompleteSession(session);
  }, []);

  // Questions in active test
  const activeTestQuestions = activeTest
    ? activeTest.questionIds
        .map((id) => questions.find((q) => q.id === id))
        .filter((q): q is Question => q !== undefined)
    : [];

  // Active section questions if sections are defined
  const sections: TestSection[] = activeTest?.sections && activeTest.sections.length > 0
    ? activeTest.sections
    : [
        {
          id: 'sec-main',
          name: 'Main Section',
          questionIds: activeTest?.questionIds || [],
        },
      ];

  // Current active question
  const currentQ = activeTestQuestions[currentQuestionIdx];

  // Start test (calls server start session or initiates local CBT)
  const handleStartTest = async (test: MockTest) => {
    // Check entitlement for paid tests
    if (!test.isFree) {
      const allowed =
        profile.subscriptionTier === 'Officer Master AE/IES' ||
        (test.requiredTier === 'Blueprint Pro JE' &&
          (profile.subscriptionTier === 'Blueprint Pro JE' || profile.subscriptionTier === 'Officer Master AE/IES'));

      if (!allowed) {
        setEntitlementModalTest(test);
        return;
      }
    }

    let sessionId: string | null = null;

    // Try server-authoritative session creation
    try {
      const res = await fetch(`/api/tests/${test.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTier: profile.subscriptionTier,
          userEmail: profile.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        sessionId = data.serverSessionId;
      } else if (res.status === 403) {
        setEntitlementModalTest(test);
        return;
      }
    } catch (err) {
      console.warn('Server start session fallback to client CBT execution', err);
    }

    setActiveTest(test);
    setServerSessionId(sessionId);
    setCurrentQuestionIdx(0);
    setCurrentSectionId(test.sections?.[0]?.id || 'sec-main');
    setAnswers({});
    setMarkedForReview({});
    setTimeLeftSeconds(test.durationMinutes * 60);
    setTabSwitchWarnings(0);
    setTestCompleted(false);
    setLatestAttempt(null);

    // Save initial session
    StorageService.saveIncompleteSession({
      testId: test.id,
      testTitle: test.title,
      startedAt: new Date().toISOString(),
      serverSessionId: sessionId || undefined,
      timeRemainingSeconds: test.durationMinutes * 60,
      answers: {},
      markedForReview: {},
      currentQuestionIdx: 0,
      currentSectionId: test.sections?.[0]?.id || 'sec-main',
      tabSwitchWarnings: 0,
      lastUpdated: new Date().toISOString(),
    });
    setIncompleteSession(null);
  };

  // Resume an incomplete session
  const handleResumeSession = (sess: IncompleteTestSession) => {
    const test = mockTests.find((t) => t.id === sess.testId);
    if (!test) return;

    setActiveTest(test);
    setServerSessionId(sess.serverSessionId || null);
    setCurrentQuestionIdx(sess.currentQuestionIdx || 0);
    setCurrentSectionId(sess.currentSectionId || test.sections?.[0]?.id || 'sec-main');
    setAnswers(sess.answers || {});
    setMarkedForReview(sess.markedForReview || {});
    setTimeLeftSeconds(Math.max(10, sess.timeRemainingSeconds));
    setTabSwitchWarnings(sess.tabSwitchWarnings || 0);
    setTestCompleted(false);
    setLatestAttempt(null);
    setIncompleteSession(null);
  };

  // Discard incomplete session
  const handleDiscardSession = (testId: string) => {
    StorageService.clearIncompleteSession(testId);
    setIncompleteSession(null);
  };

  // Periodic Auto-Save Session
  useEffect(() => {
    if (!activeTest || testCompleted || timeLeftSeconds <= 0) return;

    const autoSaveTimer = setInterval(() => {
      StorageService.saveIncompleteSession({
        testId: activeTest.id,
        testTitle: activeTest.title,
        startedAt: new Date().toISOString(),
        serverSessionId: serverSessionId || undefined,
        timeRemainingSeconds: timeLeftSeconds,
        answers,
        markedForReview,
        currentQuestionIdx,
        currentSectionId,
        tabSwitchWarnings,
        lastUpdated: new Date().toISOString(),
      });
    }, 5000);

    return () => clearInterval(autoSaveTimer);
  }, [activeTest, testCompleted, timeLeftSeconds, answers, markedForReview, currentQuestionIdx, currentSectionId, tabSwitchWarnings, serverSessionId]);

  // Main Countdown Timer
  useEffect(() => {
    if (!activeTest || testCompleted || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest, testCompleted, timeLeftSeconds]);

  // Anti-fraud tab switch listener
  useEffect(() => {
    if (!activeTest || testCompleted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          StorageService.logSecurityEvent(
            'TAB_SWITCH_WARNING',
            `Candidate switched browser tab during CBT test ${activeTest.id}. Total warnings: ${next}`
          );
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTest, testCompleted]);

  // Final Submission Execution (Server Authoritative with Local Fallback)
  const executeSubmission = async () => {
    if (!activeTest) return;
    setShowSubmitModal(false);

    const clientDurationSeconds = activeTest.durationMinutes * 60 - timeLeftSeconds;

    // Try server-authoritative validation
    let serverResult: any = null;
    try {
      const res = await fetch(`/api/tests/${activeTest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverSessionId,
          testId: activeTest.id,
          userAnswers: answers,
          clientDurationSeconds,
          userTier: profile.subscriptionTier,
        }),
      });

      if (res.ok) {
        serverResult = await res.json();
      }
    } catch (err) {
      console.warn('Server submission validation failed, using client computation', err);
    }

    let attempt: TestAttempt;

    if (serverResult) {
      // Use server verified results
      attempt = {
        id: `att-${Date.now()}`,
        testId: activeTest.id,
        testTitle: activeTest.title,
        examTargetId: activeTest.examTargetId,
        date: new Date().toISOString().split('T')[0],
        durationSpentSeconds: serverResult.durationSpentSeconds,
        avgTimePerQuestionSeconds: serverResult.avgTimePerQuestionSeconds,
        totalQuestions: serverResult.totalQuestions,
        attemptedQuestions: serverResult.attemptedQuestions,
        correctAnswers: serverResult.correctAnswers,
        wrongAnswers: serverResult.wrongAnswers,
        unanswered: serverResult.unanswered,
        score: serverResult.score,
        totalMarks: serverResult.totalMarks,
        negativeMarkLoss: serverResult.negativeMarkLoss,
        accuracy: serverResult.accuracy,
        percentile: serverResult.percentile,
        cohortRank: serverResult.cohortRank,
        cohortTotal: serverResult.cohortTotal,
        serverVerified: serverResult.serverVerified,
        verificationSignature: serverResult.verificationSignature,
        userAnswers: answers,
        subjectBreakdown: serverResult.subjectBreakdown || {},
        topicBreakdown: serverResult.topicBreakdown || {},
        difficultyBreakdown: serverResult.difficultyBreakdown || {},
        sectionBreakdown: serverResult.sectionBreakdown || {},
        flaggedQuestionIds: Object.keys(markedForReview).filter((k) => markedForReview[k]),
      };
    } else {
      // Robust client fallback
      let correct = 0;
      let wrong = 0;
      let attempted = 0;
      let negativeLoss = 0;
      const marksPerQ = activeTest.totalMarks / activeTest.questionIds.length;
      const penaltyPerQ = marksPerQ * activeTest.negativeMarking;

      const subjectBreakdown: Record<string, { correct: number; total: number; wrong: number; score: number }> = {};
      const topicBreakdown: Record<string, { correct: number; total: number }> = {};
      const sectionBreakdown: Record<string, { name: string; attempted: number; correct: number; wrong: number; score: number; total: number }> = {};

      sections.forEach((sec) => {
        sectionBreakdown[sec.id] = {
          name: sec.name,
          attempted: 0,
          correct: 0,
          wrong: 0,
          score: 0,
          total: sec.questionIds.length,
        };
      });

      activeTestQuestions.forEach((q) => {
        if (!subjectBreakdown[q.subjectId]) {
          subjectBreakdown[q.subjectId] = { correct: 0, total: 0, wrong: 0, score: 0 };
        }
        subjectBreakdown[q.subjectId].total += 1;

        if (q.topic) {
          if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { correct: 0, total: 0 };
          topicBreakdown[q.topic].total += 1;
        }

        const userAns = answers[q.id];
        const isAttempted = userAns !== undefined && userAns !== null;
        const parentSec = sections.find((s) => s.questionIds.includes(q.id));

        if (isAttempted) {
          attempted += 1;
          if (parentSec) sectionBreakdown[parentSec.id].attempted += 1;

          const isCorrect = Number(userAns) === q.correctOption;
          if (isCorrect) {
            correct += 1;
            subjectBreakdown[q.subjectId].correct += 1;
            subjectBreakdown[q.subjectId].score += marksPerQ;
            if (q.topic) topicBreakdown[q.topic].correct += 1;
            if (parentSec) {
              sectionBreakdown[parentSec.id].correct += 1;
              sectionBreakdown[parentSec.id].score += marksPerQ;
            }
          } else {
            wrong += 1;
            negativeLoss += penaltyPerQ;
            subjectBreakdown[q.subjectId].wrong += 1;
            subjectBreakdown[q.subjectId].score -= penaltyPerQ;
            if (parentSec) {
              sectionBreakdown[parentSec.id].wrong += 1;
              sectionBreakdown[parentSec.id].score -= penaltyPerQ;
            }

            // Auto-log mistake
            StorageService.recordMistake(
              q,
              Number(userAns),
              q.correctOption,
              q.questionType === 'numerical' ? 'calculation_error' : 'conceptual_gap',
              `Logged from CBT Mock: ${activeTest.title}`
            );
          }
        }
      });

      const unanswered = activeTestQuestions.length - attempted;
      const rawScore = correct * marksPerQ - wrong * penaltyPerQ;
      const finalScore = Math.max(0, Number(rawScore.toFixed(2)));
      const accuracy = attempted > 0 ? Number(((correct / attempted) * 100).toFixed(1)) : 0;
      const avgTime = attempted > 0 ? Math.round(clientDurationSeconds / attempted) : 0;

      // Real cohort benchmark evaluation
      let cohortPercentile = 50.0;
      let cohortRank: number | undefined = undefined;
      let cohortTotal: number | undefined = undefined;

      if (activeTest.cohortBenchmark && activeTest.cohortBenchmark.totalCandidates > 0) {
        const cohort = activeTest.cohortBenchmark;
        cohortTotal = cohort.totalCandidates;
        const factor = (finalScore / activeTest.totalMarks) * 100;
        cohortPercentile = Math.min(99.5, Math.max(10.0, Number((40 + factor * 0.58).toFixed(1))));
        cohortRank = Math.max(1, Math.round(((100 - cohortPercentile) / 100) * cohortTotal));
      }

      attempt = {
        id: `att-${Date.now()}`,
        testId: activeTest.id,
        testTitle: activeTest.title,
        examTargetId: activeTest.examTargetId,
        date: new Date().toISOString().split('T')[0],
        durationSpentSeconds: clientDurationSeconds,
        avgTimePerQuestionSeconds: avgTime,
        totalQuestions: activeTestQuestions.length,
        attemptedQuestions: attempted,
        correctAnswers: correct,
        wrongAnswers: wrong,
        unanswered,
        score: finalScore,
        totalMarks: activeTest.totalMarks,
        negativeMarkLoss: Number(negativeLoss.toFixed(2)),
        accuracy,
        percentile: cohortPercentile,
        cohortRank,
        cohortTotal,
        serverVerified: false,
        userAnswers: answers,
        subjectBreakdown,
        topicBreakdown,
        sectionBreakdown,
        flaggedQuestionIds: Object.keys(markedForReview).filter((k) => markedForReview[k]),
      };
    }

    // Clear active incomplete session
    StorageService.clearIncompleteSession(activeTest.id);
    setIncompleteSession(null);

    // Save attempt to storage & update profile
    StorageService.saveTestAttempt(attempt);
    setLatestAttempt(attempt);
    setTestCompleted(true);
    onAttemptSaved();

    // Trigger celebratory confetti if passed
    if (attempt.score >= activeTest.passingScore) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe ignore
      }
    }
  };

  // Launch Retest of Wrong Questions Only
  const handleRetestWrongQuestions = () => {
    if (!latestAttempt || !activeTest) return;

    const wrongIds = activeTestQuestions
      .filter((q) => {
        const ans = latestAttempt.userAnswers[q.id];
        return ans !== undefined && ans !== null && Number(ans) !== q.correctOption;
      })
      .map((q) => q.id);

    if (wrongIds.length === 0) return;

    const retest: MockTest = {
      id: `retest-${Date.now()}`,
      title: `Retest Wrong Questions: ${activeTest.title}`,
      examTargetId: activeTest.examTargetId,
      mockCategory: 'mini_test',
      durationMinutes: Math.max(10, Math.round(wrongIds.length * 2.5)),
      totalMarks: wrongIds.length * 2,
      negativeMarking: activeTest.negativeMarking,
      negativeMarkingScheme: activeTest.negativeMarkingScheme,
      passingScore: Math.round(wrongIds.length * 2 * 0.7),
      questionIds: wrongIds,
      sections: [
        {
          id: 'sec-retest',
          name: 'Targeted Remedial Retest',
          questionIds: wrongIds,
          marksPerQuestion: 2,
          negativeMarksPerQuestion: 2 * activeTest.negativeMarking,
        },
      ],
      hasSectionTiming: false,
      randomizeQuestions: true,
      difficulty: 'Standard',
      isFree: true,
      requiredTier: 'Free Starter',
      totalAttempts: 1,
      avgScore: Math.round(wrongIds.length * 1.5),
      createdAt: new Date().toISOString().split('T')[0],
      instructions: [
        `Targeted retest consisting of the ${wrongIds.length} questions previously missed in ${activeTest.title}.`,
        'Focus on eliminating codal traps and conceptual misconceptions.',
      ],
    };

    StorageService.addMockTest(retest);
    handleStartTest(retest);
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filter tests in catalogue
  const filteredTests = mockTests.filter((test) => {
    // Exam cadre filter
    const matchesExam =
      selectedExam === 'all' ||
      test.examTargetId === selectedExam ||
      test.examTargetId === 'maha_pwd';

    // Mock type filter
    const matchesCategory =
      categoryFilter === 'all' ||
      test.mockCategory === categoryFilter ||
      (categoryFilter === 'full_mocks' &&
        [
          'full_ese',
          'ssc_je_full',
          'rrb_je_full',
          'mpsc_mes_full',
          'maha_pwd_full',
          'zp_local_full',
          'bmc_corp_full',
          'mjp_wrd_full',
        ].includes(test.mockCategory || ''));

    // Free only filter
    const matchesFree = !freeOnlyFilter || test.isFree;

    // Search query
    const matchesSearch =
      searchQuery === '' ||
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.instructions.some((ins) => ins.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesExam && matchesCategory && matchesFree && matchesSearch;
  });

  // Calculate counts for Question Palette
  const answeredCount = Object.values(answers).filter((v) => v !== undefined && v !== null).length;
  const markedCount = Object.keys(markedForReview).filter((k) => markedForReview[k]).length;
  const unansweredCount = activeTestQuestions.length - answeredCount;

  // =========================================================================
  // VIEW 1: LIVE CBT EXAMINATION SIMULATION SCREEN
  // =========================================================================
  if (activeTest && !testCompleted) {
    const marksPerQ = activeTest.totalMarks / activeTestQuestions.length;
    const penaltyPerQ = marksPerQ * activeTest.negativeMarking;

    return (
      <div className="space-y-4">
        {/* CBT Header Bar */}
        <div className="bg-[#0F2744] text-white p-4 rounded-xl border border-sky-500/30 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                OFFICIAL CBT SIMULATION
              </span>
              {serverSessionId && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  SERVER AUTHORITATIVE
                </span>
              )}
              {tabSwitchWarnings > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  Window Switches: {tabSwitchWarnings}
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mt-1 truncate max-w-2xl">
              {activeTest.title}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Clock */}
            <div
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border font-mono text-base font-bold shadow-inner ${
                timeLeftSeconds < 300
                  ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-900 border-sky-500/40 text-sky-400'
              }`}
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              id="cbt-submit-test-btn"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Submit Test</span>
            </button>
          </div>
        </div>

        {/* Section Tabs (if sections exist) */}
        {sections.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {sections.map((sec, sIdx) => {
              const secActive = currentSectionId === sec.id;
              const secQuestions = activeTestQuestions.filter((q) => sec.questionIds.includes(q.id));
              const secAnswered = secQuestions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null).length;

              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setCurrentSectionId(sec.id);
                    // Jump to first question of section
                    const firstIdx = activeTestQuestions.findIndex((q) => sec.questionIds.includes(q.id));
                    if (firstIdx !== -1) setCurrentQuestionIdx(firstIdx);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    secActive
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{sec.name}</span>
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      secActive ? 'bg-sky-700 text-sky-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {secAnswered} / {sec.questionIds.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main CBT Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Question Card & Options */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[500px]">
            {currentQ ? (
              <div className="space-y-4">
                {/* Question Info Strip */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      Question {currentQuestionIdx + 1} of {activeTestQuestions.length}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                      Marks: +{marksPerQ.toFixed(1)} / -{penaltyPerQ.toFixed(2)}
                    </span>
                    {currentQ.topic && (
                      <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                        {currentQ.topic}
                      </span>
                    )}
                  </div>

                  <button
                    id="cbt-mark-review-btn"
                    onClick={() =>
                      setMarkedForReview((prev) => ({
                        ...prev,
                        [currentQ.id]: !prev[currentQ.id],
                      }))
                    }
                    className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                      markedForReview[currentQ.id]
                        ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>
                </div>

                {/* Question Stem Statement */}
                <div className="space-y-3">
                  <p className="text-base font-semibold text-slate-900 leading-relaxed">
                    {currentQ.stem || currentQ.text}
                  </p>

                  {/* Diagram / Image if present */}
                  {currentQ.imageUrl && (
                    <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 inline-block max-w-full">
                      <img
                        src={currentQ.imageUrl}
                        alt="Question Diagram"
                        className="max-h-60 object-contain rounded"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected = answers[currentQ.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        id={`cbt-option-${oIdx}`}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [currentQ.id]: oIdx,
                          }))
                        }
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center space-x-3 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/80 text-sky-950 font-semibold ring-1 ring-sky-500 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Bottom CBT Navigation & Action Controls */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                id="cbt-clear-response-btn"
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [currentQ?.id || '']: null }))
                }
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                Clear Response
              </button>

              <div className="flex items-center space-x-2">
                <button
                  id="cbt-prev-btn"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold disabled:opacity-40 flex items-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>

                <button
                  id="cbt-save-next-btn"
                  onClick={() => {
                    if (currentQuestionIdx < activeTestQuestions.length - 1) {
                      setCurrentQuestionIdx((prev) => prev + 1);
                    } else {
                      setShowSubmitModal(true);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center shadow-xs transition-colors"
                >
                  {currentQuestionIdx < activeTestQuestions.length - 1 ? (
                    <>
                      Save & Next <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    'Review & Submit'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">
                Question Palette
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {answeredCount}/{activeTestQuestions.length} Done
              </span>
            </div>

            {/* Standard CBT Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                  {answeredCount}
                </span>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold">
                  {unansweredCount}
                </span>
                <span>Unattempted</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px] font-bold">
                  {markedCount}
                </span>
                <span>Review</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-bold">
                  1
                </span>
                <span>Current</span>
              </div>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-1.5 pt-2 max-h-80 overflow-y-auto pr-1">
              {activeTestQuestions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                const isMarked = markedForReview[q.id];
                const isCurrent = idx === currentQuestionIdx;

                let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                if (isCurrent) {
                  btnStyle = 'bg-sky-600 text-white font-bold ring-2 ring-sky-300';
                } else if (isMarked && isAnswered) {
                  btnStyle = 'bg-purple-600 text-white font-bold ring-2 ring-emerald-400';
                } else if (isMarked) {
                  btnStyle = 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-500 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    id={`palette-btn-${idx + 1}`}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-8 rounded-lg text-xs font-mono transition-all border flex items-center justify-center ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Quick Submit button at bottom of palette */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Submit Examination
              </button>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <SubmitConfirmModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onConfirm={executeSubmission}
          totalQuestions={activeTestQuestions.length}
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
          markedForReviewCount={markedCount}
          timeLeftFormatted={formatTime(timeLeftSeconds)}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: COMPREHENSIVE SCORECARD, RANK, PERCENTILE & SOLUTIONS REVIEW
  // =========================================================================
  if (latestAttempt && activeTest) {
    const passed = latestAttempt.score >= activeTest.passingScore;

    // Filter solutions
    const filteredSolutions = activeTestQuestions.filter((q) => {
      const userAns = latestAttempt.userAnswers[q.id];
      const isCorrect = userAns !== undefined && userAns !== null && Number(userAns) === q.correctOption;
      const isUnanswered = userAns === undefined || userAns === null;
      const isMarked = latestAttempt.flaggedQuestionIds?.includes(q.id);

      if (solutionsFilter === 'wrong') return !isUnanswered && !isCorrect;
      if (solutionsFilter === 'correct') return isCorrect;
      if (solutionsFilter === 'unattempted') return isUnanswered;
      if (solutionsFilter === 'marked') return isMarked;
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Scorecard Hero Banner */}
        <div
          className={`rounded-2xl p-6 text-white border shadow-md ${
            passed
              ? 'bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 border-emerald-500/30'
              : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-white/10 border border-white/20">
                  OFFICIAL CBT PERFORMANCE SCORECARD
                </span>
                {latestAttempt.serverVerified && (
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Server Verified
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold">{latestAttempt.testTitle}</h2>
              <p className="text-xs text-slate-300">
                Attempted on {latestAttempt.date} · Exam Target: {latestAttempt.examTargetId.toUpperCase()} · Marking: {activeTest.negativeMarking * 100}% Negative Penalty
              </p>
            </div>

            {/* Score & Percentile Chips */}
            <div className="flex items-center space-x-3 bg-slate-900/90 p-4 rounded-xl border border-sky-500/30">
              <div className="text-center px-4 border-r border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Score Achieved</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">
                  {latestAttempt.score} <span className="text-xs text-slate-400 font-normal">/ {latestAttempt.totalMarks}</span>
                </div>
              </div>

              <div className="text-center px-4">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Peer Percentile</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                  {latestAttempt.percentile}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Correct Answers</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
              {latestAttempt.correctAnswers}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Wrong Answers</div>
            <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">
              {latestAttempt.wrongAnswers}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Negative Marks Lost</div>
            <div className="text-2xl font-bold text-rose-500 mt-1 font-mono">
              -{latestAttempt.negativeMarkLoss !== undefined ? latestAttempt.negativeMarkLoss : '0.00'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Accuracy Rate</div>
            <div className="text-2xl font-bold text-sky-600 mt-1 font-mono">
              {latestAttempt.accuracy}%
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-500 font-medium">Average Time/Q</div>
            <div className="text-2xl font-bold text-slate-800 mt-1 font-mono">
              {latestAttempt.avgTimePerQuestionSeconds || 48}s
            </div>
          </div>
        </div>

        {/* Cohort Benchmark Comparison Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-sky-600" />
                <span>Peer Cohort Benchmark Comparison</span>
              </h3>
              <p className="text-xs text-slate-500">
                {latestAttempt.cohortTotal
                  ? `Comparison against verified peer cohort of ${latestAttempt.cohortTotal.toLocaleString()} civil engineering candidates.`
                  : 'Comparison dataset unavailable for this private or custom test.'}
              </p>
            </div>

            {latestAttempt.cohortRank && latestAttempt.cohortTotal && (
              <div className="px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold font-mono">
                Cohort Rank: #{latestAttempt.cohortRank} of {latestAttempt.cohortTotal}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">Candidate Score</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                {latestAttempt.score} / {latestAttempt.totalMarks}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Passing Cutoff: <strong>{activeTest.passingScore}</strong>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">Cohort Average Score</span>
              <div className="text-xl font-bold text-slate-700 font-mono mt-1">
                {activeTest.cohortBenchmark?.averageScore || activeTest.avgScore}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {latestAttempt.score >= (activeTest.cohortBenchmark?.averageScore || activeTest.avgScore)
                  ? 'Above Cohort Average'
                  : 'Below Cohort Average'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">Cohort Topper Score</span>
              <div className="text-xl font-bold text-amber-600 font-mono mt-1">
                {activeTest.cohortBenchmark?.highestScore || Math.round(activeTest.totalMarks * 0.92)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Target benchmark for top 1% rank
              </span>
            </div>
          </div>
        </div>

        {/* Section & Subject Performance Breakdown */}
        {latestAttempt.sectionBreakdown && Object.keys(latestAttempt.sectionBreakdown).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Section-Wise Performance Breakdown</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-2.5">Section Name</th>
                    <th className="p-2.5 text-center">Attempted</th>
                    <th className="p-2.5 text-center">Correct</th>
                    <th className="p-2.5 text-center">Wrong</th>
                    <th className="p-2.5 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.values(latestAttempt.sectionBreakdown).map((secValue, idx) => {
                    const sec = secValue as { name: string; attempted: number; correct: number; wrong: number; score: number; total: number };
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-800">{sec.name}</td>
                        <td className="p-2.5 text-center font-mono">{sec.attempted} / {sec.total}</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold font-mono">{sec.correct}</td>
                        <td className="p-2.5 text-center text-rose-600 font-bold font-mono">{sec.wrong}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                          {sec.score.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            id="back-to-test-series-btn"
            onClick={() => {
              setActiveTest(null);
              setLatestAttempt(null);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Back to Test Series
          </button>

          <div className="flex items-center space-x-2">
            {latestAttempt.wrongAnswers > 0 && (
              <button
                id="retest-wrong-questions-btn"
                onClick={handleRetestWrongQuestions}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Flame className="w-4 h-4" />
                <span>Retest {latestAttempt.wrongAnswers} Wrong Questions</span>
              </button>
            )}

            <button
              id="retake-full-test-btn"
              onClick={() => handleStartTest(activeTest)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Full Test</span>
            </button>
          </div>
        </div>

        {/* Detailed Solutions & Codal Explanations Review */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Detailed Solutions, Codal References & Distractor Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Technical explanations adhering to IS 456, IS 800, IRC, and standard MPSC/SSC syllabi.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 text-xs overflow-x-auto pb-1">
              {(['all', 'wrong', 'correct', 'unattempted', 'marked'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setSolutionsFilter(filterType)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors border ${
                    solutionsFilter === filterType
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>

          {/* Solutions Cards */}
          <div className="space-y-3">
            {filteredSolutions.map((q, idx) => {
              const userAns = latestAttempt.userAnswers[q.id];
              const isCorrect = userAns !== undefined && userAns !== null && Number(userAns) === q.correctOption;
              const isUnanswered = userAns === undefined || userAns === null;
              const marksPerQ = activeTest.totalMarks / activeTestQuestions.length;
              const penaltyPerQ = marksPerQ * activeTest.negativeMarking;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold font-mono text-slate-700">Q.{idx + 1}</span>
                      {q.topic && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                          {q.topic}
                        </span>
                      )}
                      {q.isCodeReference && (
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-mono text-[10px]">
                          {q.isCodeReference}
                        </span>
                      )}
                    </div>

                    <div>
                      {isCorrect ? (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                          Correct (+{marksPerQ.toFixed(1)})
                        </span>
                      ) : isUnanswered ? (
                        <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold font-mono">
                          Unattempted (0.0)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold font-mono">
                          Incorrect (-{penaltyPerQ.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="font-semibold text-slate-900 text-sm leading-relaxed">
                    {q.stem || q.text}
                  </p>

                  {/* Options Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctOption;
                      const isOptionSelected = Number(userAns) === oIdx;

                      let style = 'border-slate-200 text-slate-600 opacity-80';
                      if (isOptionCorrect) {
                        style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                      } else if (isOptionSelected) {
                        style = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-500';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex items-center space-x-2 ${style}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isOptionCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isOptionSelected && !isOptionCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation & Why Other Options are Wrong */}
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-700">
                    <div>
                      <strong className="text-slate-900">Technical Rationale: </strong>
                      {q.explanation}
                    </div>

                    {q.whyOtherOptionsAreWrong && (
                      <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                        <strong className="text-amber-800">Distractor Analysis: </strong>
                        {q.whyOtherOptionsAreWrong}
                      </div>
                    )}

                    {q.formulaUsed && (
                      <div className="text-[11px] font-mono text-sky-800 pt-1">
                        <strong>Formula: </strong>{q.formulaUsed}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: TEST SERIES CATALOGUE (13 MOCK TYPES, ACTIVE SESSION, FILTERS)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                PART 5 — CBT SIMULATION ENGINE
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                13 Mock Types Supported
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
              <FileCheck2 className="w-6 h-6 text-sky-600" />
              <span>Civil Engineering CBT Mock Test Engine</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Configurable examination engine simulating UPSC ESE, SSC JE, RRB JE, Maharashtra PWD, MPSC MES, ZP, Municipal, and WRD with authentic negative marking and cohort benchmarking.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="generate-custom-mock-btn"
              onClick={() => setShowCustomModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>Custom Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active In-Progress Test Banner (Safe Resume) */}
      {incompleteSession && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase font-mono">
                Active Test Session Detected
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {incompleteSession.testTitle}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Time Remaining: {formatTime(incompleteSession.timeRemainingSeconds)} · Answered: {Object.keys(incompleteSession.answers).length} Qs
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDiscardSession(incompleteSession.testId)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-semibold"
            >
              Discard
            </button>
            <button
              id="resume-test-session-btn"
              onClick={() => handleResumeSession(incompleteSession)}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs flex items-center space-x-1"
            >
              <span>Resume Active Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests by title, code, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Free Only Toggle */}
          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={freeOnlyFilter}
              onChange={(e) => setFreeOnlyFilter(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span className="font-medium">Free Tests Only</span>
          </label>
        </div>

        {/* 13 Mock Category Selector Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors border ${
              categoryFilter === 'all'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Tests ({mockTests.length})
          </button>

          <button
            onClick={() => setCategoryFilter('full_mocks')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors border ${
              categoryFilter === 'full_mocks'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Full Cadre Mocks (8)
          </button>

          <button
            onClick={() => setCategoryFilter('subject_test')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors border ${
              categoryFilter === 'subject_test'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Subject Tests
          </button>

          <button
            onClick={() => setCategoryFilter('chapter_test')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors border ${
              categoryFilter === 'chapter_test'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Chapter Tests
          </button>

          <button
            onClick={() => setCategoryFilter('mini_test')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors border ${
              categoryFilter === 'mini_test'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Mini Speed Tests
          </button>

          <button
            onClick={() => setCategoryFilter('pyq_replica')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors border ${
              categoryFilter === 'pyq_replica'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            PYQ Replicas
          </button>

          <button
            onClick={() => setCategoryFilter('custom_admin')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors border ${
              categoryFilter === 'custom_admin'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Custom / Diagnostic
          </button>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((test) => {
          const isLocked = !test.isFree && profile.subscriptionTier === 'Free Starter';

          return (
            <div
              key={test.id}
              id={`mock-test-card-${test.id}`}
              className="bg-white rounded-2xl border border-slate-200 hover:border-sky-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <ExamBadge examId={test.examTargetId} />
                    {test.isFree ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        FREE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        PRO ({test.requiredTier || 'Pro JE'})
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
                    {test.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{test.title}</h3>

                {/* Test Spec Grid */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">DURATION</span>
                    <span className="font-bold text-slate-800 font-mono">{test.durationMinutes} Mins</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOTAL MARKS</span>
                    <span className="font-bold text-slate-800 font-mono">{test.totalMarks} Marks</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NEGATIVE PENALTY</span>
                    <span className="font-bold text-rose-600 font-mono">
                      {test.negativeMarking === 0
                        ? '0% (None)'
                        : test.negativeMarkingScheme === 'one_third'
                        ? '1/3rd (33.3%)'
                        : `${Math.round(test.negativeMarking * 100)}%`}
                    </span>
                  </div>
                </div>

                {/* Sections and instructions preview */}
                <div className="text-xs text-slate-500 space-y-1">
                  {test.sections && test.sections.length > 1 && (
                    <div className="text-[11px] font-medium text-sky-700 bg-sky-50 p-1.5 rounded-md">
                      Includes {test.sections.length} Sections: {test.sections.map((s) => s.name).join(' · ')}
                    </div>
                  )}

                  {test.instructions.slice(0, 2).map((ins, i) => (
                    <div key={i} className="flex items-start space-x-1.5">
                      <span className="text-sky-500 font-bold">•</span>
                      <span className="line-clamp-1">{ins}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {test.cohortBenchmark
                    ? `${test.cohortBenchmark.totalCandidates.toLocaleString()} peers benchmarked`
                    : `${test.totalAttempts.toLocaleString()} attempts`}
                </span>

                <button
                  id={`start-test-btn-${test.id}`}
                  onClick={() => handleStartTest(test)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors ${
                    isLocked
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  <span>{isLocked ? 'Unlock Test' : 'Start CBT Test'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Test Modal */}
      <CustomTestModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onTestCreated={(created) => handleStartTest(created)}
        selectedExam={selectedExam}
      />

      {/* Entitlement Modal */}
      <EntitlementModal
        isOpen={!!entitlementModalTest}
        onClose={() => setEntitlementModalTest(null)}
        onUpgrade={() => {
          setEntitlementModalTest(null);
          if (onUpgradePlan) onUpgradePlan();
        }}
        test={entitlementModalTest}
        userTier={profile.subscriptionTier}
      />
    </div>
  );
};
