import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  X,
  Play,
  ArrowRight,
  TrendingUp,
  Settings,
  HelpCircle,
  Tag,
  ShieldAlert,
  BarChart2,
} from 'lucide-react';
import {
  SpacedQueueGroup,
  SmartMistakeRecord,
  ConfidenceLevel,
  SpacedAlgorithmSettings,
} from '../types';
import { SpacedRevisionService } from '../services/spacedRevisionService';

interface SpacedRevisionViewProps {
  userEmail?: string;
  onNavigateToMistakes?: () => void;
  onNavigateToPractice?: () => void;
}

export const SpacedRevisionView: React.FC<SpacedRevisionViewProps> = ({
  userEmail = 'gitevijay123@gmail.com',
  onNavigateToMistakes,
  onNavigateToPractice,
}) => {
  const [queues, setQueues] = useState<SpacedQueueGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'due' | 'overdue' | 'upcoming' | 'mastered'>('due');

  // Interactive Single Retest Modal
  const [activeRetestItem, setActiveRetestItem] = useState<SmartMistakeRecord | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel>('medium');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [retestResult, setRetestResult] = useState<any | null>(null);

  // Bulk Retest Session State
  const [isBulkSessionActive, setIsBulkSessionActive] = useState<boolean>(false);
  const [bulkQueue, setBulkQueue] = useState<SmartMistakeRecord[]>([]);
  const [bulkCurrentIndex, setBulkCurrentIndex] = useState<number>(0);
  const [bulkResults, setBulkResults] = useState<
    Array<{
      mistakeRecordId: string;
      selectedAnswer: number | string | null;
      isCorrect: boolean;
      confidence: ConfidenceLevel;
      timeSpentSeconds: number;
    }>
  >([]);
  const [bulkStartTime, setBulkStartTime] = useState<number>(Date.now());
  const [bulkSummary, setBulkSummary] = useState<any | null>(null);

  // Admin Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settings, setSettings] = useState<SpacedAlgorithmSettings | null>(null);
  const [settingsSaving, setSettingsSaving] = useState<boolean>(false);

  const fetchQueues = async () => {
    setLoading(true);
    const data = await SpacedRevisionService.getQueues(userEmail);
    if (data) {
      setQueues(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueues();
  }, [userEmail]);

  // Open settings
  const handleOpenSettings = async () => {
    const s = await SpacedRevisionService.getSettings();
    if (s) setSettings(s);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSettingsSaving(true);
    await SpacedRevisionService.updateSettings(settings);
    setSettingsSaving(false);
    setShowSettingsModal(false);
    fetchQueues();
  };

  // Reschedule Overdue
  const handleRescheduleOverdue = async () => {
    await SpacedRevisionService.rescheduleOverdue(userEmail);
    fetchQueues();
  };

  // Submit Single Retest
  const handleSingleRetestSubmit = async () => {
    if (!activeRetestItem || selectedOption === null) return;
    const isCorrect = selectedOption === activeRetestItem.canonicalQuestion.correctOption;

    const res = await SpacedRevisionService.submitAttempt({
      userEmail,
      mistakeRecordId: activeRetestItem.id,
      selectedAnswer: selectedOption,
      isCorrect,
      confidence: selectedConfidence,
      timeSpentSeconds: 30,
    });

    setIsAnswerSubmitted(true);
    setRetestResult(res);
  };

  const handleFinishSingleRetest = () => {
    setActiveRetestItem(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setRetestResult(null);
    fetchQueues();
  };

  // Launch Bulk Revision Session
  const handleStartBulkSession = (itemsToReview: SmartMistakeRecord[]) => {
    if (!itemsToReview || itemsToReview.length === 0) return;
    setBulkQueue(itemsToReview);
    setBulkCurrentIndex(0);
    setBulkResults([]);
    setBulkStartTime(Date.now());
    setBulkSummary(null);
    setSelectedOption(null);
    setSelectedConfidence('medium');
    setIsAnswerSubmitted(false);
    setIsBulkSessionActive(true);
  };

  // Next in bulk session
  const handleBulkStepSubmit = () => {
    const current = bulkQueue[bulkCurrentIndex];
    if (!current || selectedOption === null) return;

    const isCorrect = selectedOption === current.canonicalQuestion.correctOption;
    const timeSpent = Math.max(5, Math.round((Date.now() - bulkStartTime) / 1000));

    const updatedResults = [
      ...bulkResults,
      {
        mistakeRecordId: current.id,
        selectedAnswer: selectedOption,
        isCorrect,
        confidence: selectedConfidence,
        timeSpentSeconds: timeSpent,
      },
    ];

    setBulkResults(updatedResults);
    setIsAnswerSubmitted(true);
  };

  const handleBulkStepNext = async () => {
    if (bulkCurrentIndex + 1 < bulkQueue.length) {
      setBulkCurrentIndex(bulkCurrentIndex + 1);
      setSelectedOption(null);
      setSelectedConfidence('medium');
      setIsAnswerSubmitted(false);
      setBulkStartTime(Date.now());
    } else {
      // Bulk session completed -> send to server
      const summary = await SpacedRevisionService.bulkRetest(bulkResults, userEmail);
      setBulkSummary(summary);
      fetchQueues();
    }
  };

  const currentList =
    activeTab === 'due'
      ? queues?.dueToday || []
      : activeTab === 'overdue'
      ? queues?.overdue || []
      : activeTab === 'upcoming'
      ? queues?.upcoming || []
      : queues?.mastered || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
              SM-2 Enhanced Spaced Repetition Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Adaptive Spaced Revision
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
               scientifically scheduled retests using the SuperMemo-2 cognitive memory model. 
              Review questions at 1, 3, 7, 14, and 30-day intervals to convert short-term slips into permanent engineering mastery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(queues?.dueToday.length || 0) + (queues?.overdue.length || 0) > 0 && (
              <button
                id="btn-start-bulk-revision"
                onClick={() => handleStartBulkSession([...(queues?.overdue || []), ...(queues?.dueToday || [])])}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Today's Revision Session ({ (queues?.dueToday.length || 0) + (queues?.overdue.length || 0) })
              </button>
            )}

            <button
              onClick={handleOpenSettings}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
              title="Configure Spaced Repetition Algorithm Settings"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Algorithm Config
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
              <span>Due Today</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {queues?.dueToday.length || 0}
            </div>
            <div className="text-[11px] text-slate-400">Scheduled for today's review</div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-rose-400 font-medium mb-1">
              <span>Overdue</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-300 font-mono">
              {queues?.overdue.length || 0}
            </div>
            <div className="text-[11px] text-slate-400">Pending past target dates</div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-sky-400 font-medium mb-1">
              <span>Upcoming</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-300 font-mono">
              {queues?.upcoming.length || 0}
            </div>
            <div className="text-[11px] text-slate-400">Scheduled next 30 days</div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
              <span>Mastered Concepts</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300 font-mono">
              {queues?.mastered.length || 0}
            </div>
            <div className="text-[11px] text-slate-400">3+ clean consecutive recalls</div>
          </div>
        </div>
      </div>

      {/* Queue Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('due')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'due'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Due Today ({queues?.dueToday.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Overdue ({queues?.overdue.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Upcoming Queue ({queues?.upcoming.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('mastered')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'mastered'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mastered ({queues?.mastered.length || 0})
          </button>
        </div>

        {activeTab === 'overdue' && (queues?.overdue.length || 0) > 0 && (
          <button
            onClick={handleRescheduleOverdue}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reschedule All Overdue to Today
          </button>
        )}
      </div>

      {/* Main List Display */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RotateCcw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
          <p className="text-sm">Calculating memory intervals & loading spaced queue...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'due'
              ? 'All caught up for today!'
              : activeTab === 'overdue'
              ? 'No overdue revisions'
              : activeTab === 'upcoming'
              ? 'Upcoming queue is clear'
              : 'No mastered items recorded yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
            {activeTab === 'due'
              ? 'You have completed all scheduled spaced revisions for today. Continue with new CBT mock tests or subject practice.'
              : 'Practice more questions or check your Mistake Notebook to add items into the active revision schedule.'}
          </p>
          {onNavigateToPractice && (
            <button
              onClick={onNavigateToPractice}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all"
            >
              Solve Practice Questions
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold font-mono">
                      {item.canonicalQuestion.subjectName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                      {item.canonicalQuestion.topicName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-amber-200 dark:border-amber-800">
                      Error: {item.errorCategory.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.canonicalQuestion.questionText}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveRetestItem(item);
                      setSelectedOption(null);
                      setIsAnswerSubmitted(false);
                      setRetestResult(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retest Item
                  </button>
                </div>
              </div>

              {/* Spaced Interval Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Next Review: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{item.nextRevisionDate}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                  <span>Interval: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{item.repetitionIntervalDays} days</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Clean Streak: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{item.consecutiveSuccessCount} / 3</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Ease Factor (EF): </span>
                  <strong className="text-slate-800 dark:text-slate-200">{item.easeFactor.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Retest Modal */}
      {activeRetestItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Spaced Repetition Retest
                </h3>
              </div>
              <button
                onClick={() => setActiveRetestItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                {activeRetestItem.canonicalQuestion.subjectName} &bull; {activeRetestItem.canonicalQuestion.topicName}
              </div>

              <div className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {activeRetestItem.canonicalQuestion.questionText}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {activeRetestItem.canonicalQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === activeRetestItem.canonicalQuestion.correctOption;
                  let optStyle = 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/50';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                    } else if (isSelected) {
                      optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-xs">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswerSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Confidence Rating before submission */}
              {!isAnswerSubmitted && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Self-Reported Confidence Level (Calibrates SuperMemo interval):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedConfidence(c)}
                        className={`py-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                          selectedConfidence === c
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Post-submission result proof */}
              {isAnswerSubmitted && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                      retestResult?.attemptResult?.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-300'
                    }`}
                  >
                    <span>
                      {retestResult?.attemptResult?.isCorrect
                        ? '✓ Correct Answer Recalled!'
                        : '✗ Incorrect Answer — Interval Reset.'}
                    </span>
                    <span>
                      Next Review:{' '}
                      <strong>
                        {retestResult?.updatedRecord?.nextRevisionDate} (in {retestResult?.attemptResult?.newIntervalDays} days)
                      </strong>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Standard Engineering Explanation:
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {activeRetestItem.canonicalQuestion.explanation}
                    </p>
                    {activeRetestItem.canonicalQuestion.isCodeReference && (
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        Standard Reference: {activeRetestItem.canonicalQuestion.isCodeReference}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {!isAnswerSubmitted ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleSingleRetestSubmit}
                  className="px-5 py-2.5 bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Submit Retest
                </button>
              ) : (
                <button
                  onClick={handleFinishSingleRetest}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Done & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Revision Session Modal */}
      {isBulkSessionActive && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            {!bulkSummary ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Rapid-Fire Revision Session ({bulkCurrentIndex + 1} of {bulkQueue.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsBulkSessionActive(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${((bulkCurrentIndex + 1) / bulkQueue.length) * 100}%` }}
                  />
                </div>

                {bulkQueue[bulkCurrentIndex] && (
                  <div className="space-y-4">
                    <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                      {bulkQueue[bulkCurrentIndex].canonicalQuestion.subjectName} &bull;{' '}
                      {bulkQueue[bulkCurrentIndex].canonicalQuestion.topicName}
                    </div>

                    <div className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                      {bulkQueue[bulkCurrentIndex].canonicalQuestion.questionText}
                    </div>

                    <div className="space-y-2">
                      {bulkQueue[bulkCurrentIndex].canonicalQuestion.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === bulkQueue[bulkCurrentIndex].canonicalQuestion.correctOption;
                        let optStyle = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50';

                        if (isAnswerSubmitted) {
                          if (isCorrect) optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                          else if (isSelected) optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
                        } else if (isSelected) {
                          optStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900';
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isAnswerSubmitted}
                            onClick={() => setSelectedOption(idx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${optStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-xs">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isAnswerSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                            {isAnswerSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswerSubmitted && (
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
                        <div className="font-bold text-slate-800 dark:text-slate-200">Explanation:</div>
                        <p className="text-slate-600 dark:text-slate-300">
                          {bulkQueue[bulkCurrentIndex].canonicalQuestion.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {!isAnswerSubmitted ? (
                    <button
                      disabled={selectedOption === null}
                      onClick={handleBulkStepSubmit}
                      className="px-5 py-2.5 bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Confirm Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleBulkStepNext}
                      className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                    >
                      {bulkCurrentIndex + 1 < bulkQueue.length ? 'Next Question' : 'Complete Session'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Bulk Summary Report */
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Revision Session Completed!
                </h3>
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                    <div className="text-xs text-slate-500">Reviewed</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {bulkSummary.reviewedCount}
                    </div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200">
                    <div className="text-xs text-emerald-600">Mastered</div>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {bulkSummary.masteredCount}
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200">
                    <div className="text-xs text-amber-600">Reset Interval</div>
                    <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
                      {bulkSummary.resetCount}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsBulkSessionActive(false)}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Settings Modal */}
      {showSettingsModal && settings && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  SM-2 Algorithm Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Initial Interval Day 1:
                </label>
                <input
                  type="number"
                  value={settings.initialIntervalDays}
                  onChange={(e) =>
                    setSettings({ ...settings, initialIntervalDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Second Interval Day 2:
                </label>
                <input
                  type="number"
                  value={settings.secondIntervalDays}
                  onChange={(e) =>
                    setSettings({ ...settings, secondIntervalDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Consecutive Clean Recalls for Permanent Mastery:
                </label>
                <input
                  type="number"
                  value={settings.masteryStreakThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, masteryStreakThreshold: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={settingsSaving}
                onClick={handleSaveSettings}
                className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                {settingsSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
