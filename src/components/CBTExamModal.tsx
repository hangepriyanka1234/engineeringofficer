import React, { useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  X,
  FileCheck2,
  ShieldCheck,
  Send,
  RotateCcw
} from 'lucide-react';
import {
  ScalableQuestionPaper,
  ScalableHubQuestion,
  CBTUserAnswerState,
  CBTExamSubmissionResult,
} from '../types/examHub';
import { ExamHubService } from '../services/examHubService';

interface CBTExamModalProps {
  paper: ScalableQuestionPaper;
  questions: ScalableHubQuestion[];
  userEmail: string;
  onClose: () => void;
  onSubmitted?: (result: CBTExamSubmissionResult) => void;
}

export const CBTExamModal: React.FC<CBTExamModalProps> = ({
  paper,
  questions,
  userEmail,
  onClose,
  onSubmitted,
}) => {
  // Navigation & Palette State
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [activeSectionId, setActiveSectionId] = useState<string>(paper.sections[0]?.id || 'sec_1');
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(
    (paper.duration_minutes || 120) * 60
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // User Responses State
  const [userStates, setUserStates] = useState<Record<string, CBTUserAnswerState>>(() => {
    const initial: Record<string, CBTUserAnswerState> = {};
    questions.forEach((q) => {
      initial[q.id] = {
        questionId: q.id,
        selectedOption: null,
        status: 'NOT_VISITED',
        timeSpentSeconds: 0,
        visitCount: 0,
      };
    });
    // Mark first question visited
    if (questions.length > 0) {
      initial[questions[0].id].status = 'NOT_ANSWERED';
      initial[questions[0].id].visitCount = 1;
    }
    return initial;
  });

  const [submissionResult, setSubmissionResult] = useState<CBTExamSubmissionResult | null>(null);

  // Timer Countdown Effect
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });

      // Track time spent on current question
      if (questions[currentIdx]) {
        const qId = questions[currentIdx].id;
        setUserStates((prev) => ({
          ...prev,
          [qId]: {
            ...prev[qId],
            timeSpentSeconds: (prev[qId]?.timeSpentSeconds || 0) + 1,
          },
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, currentIdx, questions]);

  const currentQuestion = questions[currentIdx];

  // Formatting Time
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Select Option
  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    setUserStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: optId,
      },
    }));
  };

  // Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setUserStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: null,
        status: 'NOT_ANSWERED',
      },
    }));
  };

  // Save & Next
  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    const currentState = userStates[currentQuestion.id];
    const newStatus = currentState.selectedOption ? 'ANSWERED' : 'NOT_ANSWERED';

    setUserStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: newStatus,
      },
    }));

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const nextQId = questions[nextIdx].id;
      if (userStates[nextQId].status === 'NOT_VISITED') {
        setUserStates((prev) => ({
          ...prev,
          [nextQId]: { ...prev[nextQId], status: 'NOT_ANSWERED' },
        }));
      }
    }
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;
    const currentState = userStates[currentQuestion.id];
    const newStatus = currentState.selectedOption
      ? 'ANSWERED_AND_MARKED_FOR_REVIEW'
      : 'MARKED_FOR_REVIEW';

    setUserStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: newStatus,
      },
    }));

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const nextQId = questions[nextIdx].id;
      if (userStates[nextQId].status === 'NOT_VISITED') {
        setUserStates((prev) => ({
          ...prev,
          [nextQId]: { ...prev[nextQId], status: 'NOT_ANSWERED' },
        }));
      }
    }
  };

  // Jump to Question Index
  const handleJumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    const qId = questions[idx].id;
    if (userStates[qId].status === 'NOT_VISITED') {
      setUserStates((prev) => ({
        ...prev,
        [qId]: { ...prev[qId], status: 'NOT_ANSWERED' },
      }));
    }
  };

  // Calculate Summary
  const getSummaryCounts = () => {
    let answered = 0;
    let notAnswered = 0;
    let markedForReview = 0;
    let answeredAndMarked = 0;
    let notVisited = 0;

    (Object.values(userStates) as CBTUserAnswerState[]).forEach((st) => {
      if (st.status === 'ANSWERED') answered++;
      else if (st.status === 'NOT_ANSWERED') notAnswered++;
      else if (st.status === 'MARKED_FOR_REVIEW') markedForReview++;
      else if (st.status === 'ANSWERED_AND_MARKED_FOR_REVIEW') answeredAndMarked++;
      else notVisited++;
    });

    return { answered, notAnswered, markedForReview, answeredAndMarked, notVisited };
  };

  // Submit Test
  const handleFinalSubmit = () => {
    let totalScore = 0;
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    const breakdown = questions.map((q) => {
      const state = userStates[q.id];
      const selected = state?.selectedOption || null;
      let isCorrect = false;
      let marksAwarded = 0;

      if (selected) {
        attempted++;
        if (selected === q.correct_answer) {
          isCorrect = true;
          correct++;
          marksAwarded = q.marks || 2;
        } else {
          incorrect++;
          marksAwarded = -(q.negative_marks || 0.5);
        }
      } else {
        unattempted++;
      }

      totalScore += marksAwarded;

      return {
        question: q,
        userSelectedOption: selected,
        isCorrect,
        marksAwarded,
        timeSpentSeconds: state?.timeSpentSeconds || 0,
      };
    });

    const maxScore = paper.total_marks || questions.length * 2;
    const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const percentage = Math.round((finalScore / maxScore) * 100);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const totalTimeSpent = (paper.duration_minutes * 60) - timeRemainingSeconds;

    const result: CBTExamSubmissionResult = {
      paperId: paper.id,
      paperTitle: paper.paper_name,
      totalQuestions: questions.length,
      attemptedQuestions: attempted,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattemptedQuestions: unattempted,
      totalScore: finalScore,
      maxScore,
      percentage,
      accuracy,
      timeSpentSeconds: totalTimeSpent,
      rank: Math.floor(1 + Math.random() * 25),
      percentile: Math.min(99.8, Math.round((85 + Math.random() * 14) * 10) / 10),
      questionBreakdown: breakdown,
      submittedAt: new Date().toISOString(),
    };

    ExamHubService.saveCBTSubmission(userEmail, result);
    setSubmissionResult(result);
    setIsSubmitted(true);
    setShowSubmitModal(false);

    if (onSubmitted) {
      onSubmitted(result);
    }
  };

  const counts = getSummaryCounts();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header Controls Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
              {paper.exam_name} - {paper.paper_name}
            </h1>
            <div className="text-[10px] text-sky-400 font-mono">
              TCS iON CBT Exam Interface • {paper.shift}
            </div>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center space-x-4">
          {!isSubmitted && (
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-mono font-bold text-xs ${
                timeRemainingSeconds < 300
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-sky-300 border border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
          )}

          {!isSubmitted ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Close Result
            </button>
          )}
        </div>
      </div>

      {/* Main CBT Body */}
      {!isSubmitted ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Question Area */}
          <div className="flex-1 flex flex-col bg-slate-900/40 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold text-sky-400 font-mono">
                Question No. {currentIdx + 1} of {questions.length}
              </span>
              <div className="flex items-center space-x-3 text-slate-400 font-mono">
                <span>Marks: +{currentQuestion?.marks || 2}</span>
                <span>Negative: -{currentQuestion?.negative_marks || 0.5}</span>
              </div>
            </div>

            {/* Question Text */}
            {currentQuestion && (
              <div className="space-y-4">
                <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {currentQuestion.question_text}
                </div>

                {/* Marathi Text */}
                {currentQuestion.marathi_text && (
                  <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded-xl text-xs text-sky-200 font-sans leading-relaxed">
                    <span className="font-bold text-sky-400 block mb-1">मराठी भाषांतर (Marathi Version):</span>
                    {currentQuestion.marathi_text}
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = userStates[currentQuestion.id]?.selectedOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <div className="flex-1 space-y-1">
                          <div>{opt.text}</div>
                          {opt.marathi_text && (
                            <div className="text-xs text-slate-400 font-sans">{opt.marathi_text}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Action Control Bar */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkForReviewAndNext}
                  className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-semibold"
                >
                  Mark for Review & Next
                </button>
                <button
                  onClick={handleClearResponse}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Clear Response
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => handleJumpToQuestion(currentIdx - 1)}
                  className="px-3 py-2 rounded-xl bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-300 font-semibold flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold flex items-center space-x-1 shadow-lg shadow-sky-500/20"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Floating Question Palette */}
          <div className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 p-4 space-y-4 overflow-y-auto">
            {/* Palette Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center font-bold">
                  {counts.answered}
                </span>
                <span className="text-slate-300">Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-rose-500 text-white flex items-center justify-center font-bold">
                  {counts.notAnswered}
                </span>
                <span className="text-slate-300">Not Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-purple-600 text-white flex items-center justify-center font-bold">
                  {counts.markedForReview}
                </span>
                <span className="text-slate-300">Marked for Review</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-purple-600 text-emerald-300 border-2 border-emerald-400 flex items-center justify-center font-bold">
                  {counts.answeredAndMarked}
                </span>
                <span className="text-slate-300">Ans & Marked</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                  {counts.notVisited}
                </span>
                <span className="text-slate-300">Not Visited</span>
              </div>
            </div>

            {/* Question Grid Buttons */}
            <div>
              <div className="text-xs font-bold text-white mb-2 font-mono">Question Palette Grid</div>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const state = userStates[q.id];
                  let btnStyle = 'bg-slate-800 text-slate-400 hover:bg-slate-700';

                  if (state.status === 'ANSWERED') btnStyle = 'bg-emerald-500 text-white font-bold';
                  else if (state.status === 'NOT_ANSWERED') btnStyle = 'bg-rose-500 text-white font-bold';
                  else if (state.status === 'MARKED_FOR_REVIEW') btnStyle = 'bg-purple-600 text-white font-bold';
                  else if (state.status === 'ANSWERED_AND_MARKED_FOR_REVIEW')
                    btnStyle = 'bg-purple-600 text-emerald-300 border-2 border-emerald-400 font-bold';

                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-9 rounded-lg text-xs font-mono transition-all flex items-center justify-center ${btnStyle} ${
                        isCurrent ? 'ring-2 ring-sky-400 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Result Scorecard View */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950">
          {submissionResult && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Score Card Banner */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl text-center space-y-4">
                <Award className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                <h2 className="text-2xl font-bold text-white">Test Completed Successfully!</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Total Score</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {submissionResult.totalScore} / {submissionResult.maxScore}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Accuracy %</div>
                    <div className="text-2xl font-bold text-sky-400">{submissionResult.accuracy}%</div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400">State Percentile</div>
                    <div className="text-2xl font-bold text-purple-400">{submissionResult.percentile}%ile</div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Est. State Rank</div>
                    <div className="text-2xl font-bold text-amber-400">#{submissionResult.rank}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Question Solution Key */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-sky-400" />
                  <span>Detailed Answer Key & IS Code Solutions</span>
                </h3>

                <div className="space-y-4">
                  {submissionResult.questionBreakdown.map((item, idx) => (
                    <div
                      key={item.question.id}
                      className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-sky-400">Q{idx + 1}. {item.question.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : item.userSelectedOption
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.isCorrect ? 'Correct (+2)' : item.userSelectedOption ? 'Incorrect (-0.5)' : 'Unattempted'}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-white">{item.question.question_text}</div>

                      <div className="p-3 bg-slate-950 rounded-lg space-y-1 font-mono text-slate-300">
                        <div>Correct Answer: <strong className="text-emerald-400">Option {item.question.correct_answer}</strong></div>
                        <div>Your Option: <strong className={item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{item.userSelectedOption || 'None'}</strong></div>
                      </div>

                      <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded-lg space-y-1 text-sky-200">
                        <div className="font-bold text-sky-400">Solution & Proof:</div>
                        <div>{item.question.explanation}</div>
                        {item.question.marathi_explanation && (
                          <div className="pt-1 text-slate-300">{item.question.marathi_explanation}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Are you sure you want to submit?</span>
            </h3>

            <div className="p-3 bg-slate-950 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between"><span>Answered:</span><span className="text-emerald-400 font-bold">{counts.answered}</span></div>
              <div className="flex justify-between"><span>Not Answered:</span><span className="text-rose-400 font-bold">{counts.notAnswered}</span></div>
              <div className="flex justify-between"><span>Marked for Review:</span><span className="text-purple-400 font-bold">{counts.markedForReview}</span></div>
              <div className="flex justify-between font-bold border-t border-slate-800 pt-1"><span>Total Questions:</span><span>{questions.length}</span></div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Continue Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
