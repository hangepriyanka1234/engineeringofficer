import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Flag,
  Award,
  BarChart3,
  X
} from 'lucide-react';
import { PYQItem } from '../types';
import { ExamBadge } from './common/ExamBadge';

interface PYQPracticeSessionModalProps {
  title: string;
  subtitle?: string;
  questions: PYQItem[];
  instantFeedbackMode?: boolean;
  onClose: () => void;
  onSessionComplete?: (score: number, total: number) => void;
}

export const PYQPracticeSessionModal: React.FC<PYQPracticeSessionModalProps> = ({
  title,
  subtitle,
  questions,
  instantFeedbackMode = false,
  onClose,
  onSessionComplete,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(instantFeedbackMode);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  if (!questions || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <p className="text-sm text-slate-600">No questions available for this practice session.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(userAnswers).length;

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex,
    }));
  };

  const handleToggleReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleSubmit = () => {
    if (!isSubmitted) {
      if (!confirm(`Are you sure you want to submit? You have answered ${answeredCount} of ${questions.length} questions.`)) {
        return;
      }
      setIsSubmitted(true);
      if (onSessionComplete) {
        let correct = 0;
        questions.forEach((q) => {
          if (userAnswers[q.id] === q.correctOption) correct++;
        });
        onSessionComplete(correct, questions.length);
      }
    }
  };

  // Evaluation stats
  let correctCount = 0;
  let wrongCount = 0;
  questions.forEach((q) => {
    if (userAnswers[q.id] !== undefined) {
      if (userAnswers[q.id] === q.correctOption) correctCount++;
      else wrongCount++;
    }
  });
  const unattemptedCount = questions.length - (correctCount + wrongCount);
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col max-h-[95vh] shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[11px] font-bold border border-sky-500/30">
                OFFICIAL PYQ PRACTICE
              </span>
              <h2 className="font-bold text-sm sm:text-base text-white">{title}</h2>
            </div>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-slate-300 font-mono text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{formatTime(timeSpentSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Practice Mode Selector Sub-header */}
        {!isSubmitted && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600">Feedback Mode:</span>
              <button
                type="button"
                onClick={() => setInstantFeedback(false)}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all ${
                  !instantFeedback
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                CBT Exam Simulation
              </button>
              <button
                type="button"
                onClick={() => setInstantFeedback(true)}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all ${
                  instantFeedback
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                Instant Key & Explanation
              </button>
            </div>

            <div className="flex items-center space-x-3 text-slate-500 font-medium">
              <span>Answered: <strong>{answeredCount}/{questions.length}</strong></span>
              <span>Marked for Review: <strong>{Object.values(markedForReview).filter(Boolean).length}</strong></span>
            </div>
          </div>
        )}

        {/* Question Area & Navigator */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isSubmitted ? (
            /* Summary Result Card */
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-slate-900 text-white text-center space-y-2">
                <span className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 inline-block mb-1">
                  <Award className="w-8 h-8 mx-auto" />
                </span>
                <h3 className="text-xl font-bold">Practice Session Evaluation</h3>
                <p className="text-xs text-slate-400">
                  Evaluated against official commission answer keys.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-800 text-center">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">TOTAL SCORE</span>
                    <span className="text-xl font-mono font-bold text-emerald-400">{correctCount * 2} Marks</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">ACCURACY</span>
                    <span className="text-xl font-mono font-bold text-sky-400">{accuracy}%</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">CORRECT / WRONG</span>
                    <span className="text-xl font-mono font-bold text-slate-200">{correctCount} / {wrongCount}</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">TIME TAKEN</span>
                    <span className="text-xl font-mono font-bold text-slate-200">{formatTime(timeSpentSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Review Questions List */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Question Review & Codal Explanations</h4>
                {questions.map((q, idx) => {
                  const userAns = userAnswers[q.id];
                  const isCorrect = userAns === q.correctOption;
                  const isAttempted = userAns !== undefined;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                        !isAttempted
                          ? 'border-slate-200 bg-slate-50/50'
                          : isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          Question {idx + 1} (Q.{q.questionNumber} - {q.exam} {q.year})
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                            !isAttempted
                              ? 'bg-slate-200 text-slate-700'
                              : isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {!isAttempted ? 'Unattempted' : isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <p className="font-medium text-slate-900">{q.stem}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border text-xs flex items-center space-x-2 ${
                              oIdx === q.correctOption
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                                : oIdx === userAns
                                ? 'border-rose-400 bg-rose-50 text-rose-900'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            <span className="font-mono w-5 h-5 rounded-full flex items-center justify-center bg-white border border-slate-200 text-[10px]">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {oIdx === q.correctOption && (
                              <span className="text-[10px] text-emerald-700 font-bold uppercase">Key</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-[10px] uppercase text-slate-500 block">Explanation & IS Code</span>
                        <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                        {q.isCodeReference && (
                          <span className="inline-block mt-1 font-mono text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                            Reference: {q.isCodeReference}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Question Solver */
            <div className="space-y-4">
              {/* Question Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                    Q {currentIdx + 1} of {questions.length}
                  </span>
                  <ExamBadge examId={currentQ.examTargetId} />
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    Official No: Q.{currentQ.questionNumber} ({currentQ.year})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {currentQ.verificationStatus === 'official_verified' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Official Verified PYQ</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Community / Unverified</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleToggleReview}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 border ${
                      markedForReview[currentQ.id]
                        ? 'border-purple-300 bg-purple-50 text-purple-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    <span>{markedForReview[currentQ.id] ? 'Marked' : 'Mark for Review'}</span>
                  </button>
                </div>
              </div>

              {/* Stem */}
              <div className="text-slate-900 font-medium text-sm sm:text-base leading-relaxed">
                {currentQ.stem}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQ.id] === oIdx;
                  const showInstant = instantFeedback && userAnswers[currentQ.id] !== undefined;
                  const isCorrect = oIdx === currentQ.correctOption;

                  let optionStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';
                  if (showInstant) {
                    if (isCorrect) optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                    else if (isSelected) optionStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-medium';
                  } else if (isSelected) {
                    optionStyle = 'border-sky-600 bg-sky-50 text-sky-900 font-semibold ring-1 ring-sky-500';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center space-x-3 transition-all ${optionStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 bg-white">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {showInstant && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {showInstant && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Feedback Drawer */}
              {instantFeedback && userAnswers[currentQ.id] !== undefined && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mt-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Official Commission Key & IS Code Breakdown
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">
                      Correct Key: Option {String.fromCharCode(65 + currentQ.correctOption)}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>

                  {currentQ.isCodeReference && (
                    <div className="font-mono text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1 rounded inline-block border border-sky-200">
                      Standard Code Clause: {currentQ.isCodeReference}
                    </div>
                  )}

                  {currentQ.sourceProvenance.verifiedKeyRef && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      Provenance: {currentQ.sourceProvenance.conductingBody} · {currentQ.sourceProvenance.verifiedKeyRef}
                    </div>
                  )}
                </div>
              )}

              {/* Question Navigator Dots */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">Question Palette:</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {questions.map((q, qIdx) => {
                    const ans = userAnswers[q.id] !== undefined;
                    const rev = markedForReview[q.id];
                    const isCurr = qIdx === currentIdx;

                    let bg = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (isCurr) bg = 'bg-slate-900 text-white ring-2 ring-sky-500 border-slate-900';
                    else if (rev) bg = 'bg-purple-100 text-purple-800 border-purple-300';
                    else if (ans) bg = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(qIdx)}
                        className={`w-7 h-7 rounded-lg border text-xs font-mono flex items-center justify-center transition-all ${bg}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs flex items-center space-x-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                >
                  Submit Practice ({answeredCount}/{questions.length})
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIdx === questions.length - 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs flex items-center space-x-1 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Practice Session Finished · Provenance Protected
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs"
              >
                Close & Return to Library
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
