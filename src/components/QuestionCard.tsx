import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Bookmark,
  BookmarkCheck,
  Bot,
  AlertTriangle,
  FileCode,
  Calculator,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Flag,
  Award,
  Globe2
} from 'lucide-react';
import { Question, SubjectId } from '../types';
import { SUBJECTS_LIST } from '../data/mockData';
import { GeminiService } from '../services/geminiService';
import { ReportQuestionModal } from './ReportQuestionModal';

interface QuestionCardProps {
  question: Question;
  index: number;
  instantMode?: boolean;
  isSaved?: boolean;
  isMarkedForReview?: boolean;
  userAnswer?: number | string;
  language?: 'en' | 'mr' | 'hi';
  onAnswerSelected?: (question: Question, answer: number | string) => void;
  onToggleBookmark?: (questionId: string) => void;
  onToggleMarkForReview?: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  instantMode = true,
  isSaved = false,
  isMarkedForReview = false,
  userAnswer,
  language = 'en',
  onAnswerSelected,
  onToggleBookmark,
  onToggleMarkForReview,
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(instantMode && userAnswer !== undefined);
  const [numericalInput, setNumericalInput] = useState<string>('');
  const [numericalSubmitted, setNumericalSubmitted] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showWhyWrong, setShowWhyWrong] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const subject = SUBJECTS_LIST.find((s) => s.id === question.subjectId);
  const isAnswered = userAnswer !== undefined || numericalSubmitted;

  // Language translation selection
  const hasMarathi = !!question.translations?.mr;
  const hasHindi = !!question.translations?.hi;

  let activeStem = question.stem || question.text;
  let activeOptions = question.options || [];
  let activeExplanation = question.explanation;
  let activeLangBadge = 'EN';
  let isTranslationReviewed = true;

  if (language === 'mr' && question.translations?.mr) {
    activeStem = question.translations.mr.stem;
    activeOptions = question.translations.mr.options;
    if (question.translations.mr.explanation) {
      activeExplanation = question.translations.mr.explanation;
    }
    activeLangBadge = 'मराठी (अधिकृत)';
  } else if (language === 'hi' && question.translations?.hi) {
    activeStem = question.translations.hi.stem;
    activeOptions = question.translations.hi.options;
    if (question.translations.hi.explanation) {
      activeExplanation = question.translations.hi.explanation;
    }
    activeLangBadge = 'हिंदी (अधिकृत)';
  }

  // Evaluate correctness (only meaningful in instantMode and when answer is present)
  let isCorrect = false;
  if (!question.isStripped && question.correctAnswer !== undefined) {
    if (question.questionType === 'numerical') {
      const val = parseFloat(numericalInput);
      if (!isNaN(val)) {
        if (typeof question.correctAnswer === 'number') {
          const tol = question.numericalTolerance || 0.05;
          isCorrect = Math.abs(val - question.correctAnswer) <= tol;
        } else if (question.numericalRange) {
          isCorrect = val >= question.numericalRange.min && val <= question.numericalRange.max;
        }
      }
    } else {
      isCorrect = Number(userAnswer) === question.correctOption;
    }
  }

  const handleSelectMcq = (optIdx: number) => {
    // In instant mode, lock after answer. In simulation mode, allow changing choice.
    if (instantMode && !question.isStripped && isAnswered) return;

    if (onAnswerSelected) {
      onAnswerSelected(question, optIdx);
    }
    if (instantMode && !question.isStripped) {
      setShowExplanation(true);
    }
  };

  const handleNumericalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericalInput.trim()) return;
    if (instantMode && !question.isStripped && isAnswered) return;

    setNumericalSubmitted(true);
    const val = parseFloat(numericalInput);
    if (onAnswerSelected) {
      onAnswerSelected(question, isNaN(val) ? numericalInput : val);
    }
    if (instantMode && !question.isStripped) {
      setShowExplanation(true);
    }
  };

  const requestAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await GeminiService.getQuestionDeepAnalysis(
      activeStem,
      activeOptions,
      question.correctOption,
      subject?.name || 'Civil Engineering',
      question.isCodeReference
    );
    setAiExplanation(result);
    setLoadingAi(false);
  };

  return (
    <div
      id={`question-card-${question.id}`}
      className={`bg-white rounded-2xl border ${
        isMarkedForReview ? 'border-purple-300 ring-2 ring-purple-100' : 'border-slate-200 hover:border-slate-300'
      } p-5 sm:p-6 shadow-xs transition-all space-y-4`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
            Q.{index + 1} · {subject?.code || question.subjectId.toUpperCase()}
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              question.difficulty === 'easy'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : question.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {question.difficulty}
          </span>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {question.questionType === 'numerical'
              ? 'Numerical (NAT)'
              : question.questionType === 'assertion_reason'
              ? 'Assertion & Reason'
              : question.questionType === 'match_the_following'
              ? 'Match Following'
              : question.questionType === 'statement_based'
              ? 'Statement Based'
              : question.questionType === 'diagram_based'
              ? 'Diagram Based'
              : 'Standard MCQ'}
          </span>

          {question.isCodeReference && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
              <FileCode className="w-3 h-3 text-indigo-500" />
              <span>{question.isCodeReference}</span>
            </span>
          )}

          {/* Language & Provenance Chips */}
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
            <Globe2 className="w-3 h-3 text-amber-600" />
            <span>{activeLangBadge}</span>
          </span>

          {question.provenance?.verifiedFromOfficialKey && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
              <Award className="w-3 h-3 text-emerald-600" />
              <span>Official Key Verified</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Mark For Review Toggle (Simulation Mode) */}
          {onToggleMarkForReview && (
            <button
              onClick={() => onToggleMarkForReview(question.id)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center space-x-1 transition-all ${
                isMarkedForReview
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700'
              }`}
              title="Mark for review during exam simulation"
            >
              <Flag className={`w-3.5 h-3.5 ${isMarkedForReview ? 'text-purple-700 fill-purple-700' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isMarkedForReview ? 'Marked' : 'Mark'}</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 font-mono">
            +{question.marks || 2} / -{question.negativeMarks || 0.5}
          </span>

          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(question.id)}
              className="text-slate-400 hover:text-amber-500 transition-colors p-1"
              title={isSaved ? 'Remove from Saved' : 'Save for Revision'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-amber-500" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          )}

          <button
            onClick={() => setShowReportModal(true)}
            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
            title="Report Issue with Question"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Provenance Banner if available */}
      {question.provenance && (
        <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1 font-mono">
          <span className="font-semibold text-slate-800">
            Source: {question.provenance.examName} {question.provenance.year ? `(${question.provenance.year})` : ''} {question.provenance.paper ? `· ${question.provenance.paper}` : ''}
          </span>
          {question.versionMetadata && (
            <span className="text-slate-400 text-[10px]">
              Ver: {question.versionMetadata.version} · {question.versionMetadata.reviewedBy ? `Reviewed by ${question.versionMetadata.reviewedBy}` : 'Audited'}
            </span>
          )}
        </div>
      )}

      {/* Diagram / Image Rendering */}
      {question.diagramSvg && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
          <div
            className="w-full max-w-md mx-auto overflow-hidden"
            dangerouslySetInnerHTML={{ __html: question.diagramSvg }}
          />
          <span className="text-[10px] text-slate-400 mt-2 font-mono">Figure: Structural Diagram</span>
        </div>
      )}

      {/* Assertion & Reason Specialized Layout */}
      {question.questionType === 'assertion_reason' && question.assertion && (
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-sky-800 block text-xs uppercase mb-1">Assertion (A):</span>
            <p className="text-slate-800 font-medium leading-relaxed">{question.assertion}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-indigo-800 block text-xs uppercase mb-1">Reason (R):</span>
            <p className="text-slate-800 font-medium leading-relaxed">{question.reason}</p>
          </div>
        </div>
      )}

      {/* Match-the-following Table Layout */}
      {question.questionType === 'match_the_following' && question.matchList1 && question.matchList2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-2">
            <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">List-I (Properties / Items)</span>
            {question.matchList1.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold font-mono text-sky-700">{item.label}.</span>
                <span className="text-slate-800">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">List-II (Standards / Methods)</span>
            {question.matchList2.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold font-mono text-indigo-700">{item.label}.</span>
                <span className="text-slate-800">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statement-based Numbered Items Layout */}
      {question.questionType === 'statement_based' && question.statements && (
        <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">Statements for Verification:</span>
          {question.statements.map((stmt, idx) => (
            <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium leading-relaxed">
              {stmt}
            </div>
          ))}
        </div>
      )}

      {/* Question Stem Statement */}
      <div className="space-y-1">
        <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
          {activeStem}
        </p>
      </div>

      {/* Answer Input Section */}
      {question.questionType === 'numerical' ? (
        /* Numerical (NAT) Input Form */
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
            <Calculator className="w-4 h-4 text-sky-600" />
            <span>Numerical Answer Type (Enter value within specified unit):</span>
          </div>

          <form onSubmit={handleNumericalSubmit} className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="number"
                step="any"
                disabled={instantMode && !question.isStripped && isAnswered}
                placeholder="e.g. 11.25"
                value={numericalInput}
                onChange={(e) => setNumericalInput(e.target.value)}
                className="w-48 px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden disabled:bg-slate-100"
              />
              {question.unit && (
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  {question.unit}
                </span>
              )}
            </div>

            {!isAnswered ? (
              <button
                type="submit"
                disabled={!numericalInput.trim()}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
              >
                Submit Answer
              </button>
            ) : (!instantMode || question.isStripped) ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-100 text-sky-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>Answer Recorded: {numericalInput} {question.unit || ''}</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 ${
                    isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                  <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </span>
                <span className="text-xs text-slate-600 font-mono">
                  Correct Value: <strong>{String(question.correctAnswer)} {question.unit || ''}</strong>
                </span>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* MCQ / Option Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {activeOptions.map((opt, oIdx) => {
            const optionLetter = String.fromCharCode(65 + oIdx);
            let optionStyle = 'border-slate-200 hover:border-sky-300 hover:bg-slate-50 text-slate-800';

            if (!instantMode || question.isStripped) {
              // Simulation mode: highlight selected without revealing answer
              if (userAnswer === oIdx) {
                optionStyle = 'border-sky-500 bg-sky-50 text-sky-950 font-semibold ring-2 ring-sky-500 shadow-xs';
              }
            } else if (isAnswered) {
              // Instant feedback mode: reveal green/red
              if (oIdx === question.correctOption) {
                optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
              } else if (userAnswer === oIdx) {
                optionStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-500';
              } else {
                optionStyle = 'border-slate-200 text-slate-400 opacity-60';
              }
            }

            const isSelectedInSim = (!instantMode || question.isStripped) && userAnswer === oIdx;

            return (
              <button
                key={oIdx}
                disabled={instantMode && !question.isStripped && isAnswered}
                onClick={() => handleSelectMcq(oIdx)}
                className={`text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start space-x-3 ${optionStyle}`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelectedInSim
                      ? 'bg-sky-600 text-white'
                      : isAnswered && instantMode && !question.isStripped && oIdx === question.correctOption
                      ? 'bg-emerald-600 text-white'
                      : isAnswered && instantMode && !question.isStripped && userAnswer === oIdx
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {optionLetter}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Answer Explanation Box (Instant Mode) */}
      {showExplanation && !question.isStripped && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
          {/* Result Alert Header */}
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
              isCorrect
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-800">Correct Answer! +{question.marks || 2} Marks</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-800">Incorrect. -{question.negativeMarks || 0.5} Negative Marking Applied.</span>
                </>
              )}
            </div>

            <p className="text-slate-800 leading-relaxed font-sans">{activeExplanation}</p>

            {/* Calculation Steps if available */}
            {question.calculationSteps && question.calculationSteps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                <span className="font-bold text-xs text-slate-800 block">Step-by-Step Derivation / Calculation:</span>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 font-mono">
                  {question.calculationSteps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Governing Formula */}
            {question.formula && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center space-x-2 text-xs font-mono">
                <span className="font-bold text-slate-700">Formula:</span>
                <code className="px-2 py-0.5 bg-white/80 rounded border border-slate-300 text-slate-900">
                  {question.formula}
                </code>
              </div>
            )}
          </div>

          {/* Common Traps / Examiner's Pitfall */}
          {question.commonTraps && (
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Examiner's Common Trap / Pitfall:</span>
              </div>
              <p className="text-amber-900 leading-relaxed">{question.commonTraps}</p>
            </div>
          )}

          {/* Why Other Options Are Wrong Accordion */}
          {question.whyOtherOptionsAreWrong && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowWhyWrong(!showWhyWrong)}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Info className="w-3.5 h-3.5 text-sky-600" />
                  <span>Why Other Options Are Wrong (Distractor Analysis)</span>
                </div>
                {showWhyWrong ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showWhyWrong && (
                <div className="p-4 bg-white space-y-2 text-xs border-t border-slate-200 divide-y divide-slate-100">
                  {Array.isArray(question.whyOtherOptionsAreWrong) ? (
                    question.whyOtherOptionsAreWrong.map((reason, rIdx) => (
                      <div key={rIdx} className="pt-2 first:pt-0 text-slate-700">
                        {reason}
                      </div>
                    ))
                  ) : (
                    Object.entries(question.whyOtherOptionsAreWrong).map(([opt, reason]) => (
                      <div key={opt} className="pt-2 first:pt-0 space-y-0.5">
                        <span className="font-bold text-rose-700 font-mono">Option "{opt}":</span>
                        <p className="text-slate-700 leading-relaxed pl-2">{reason}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Controls: AI Deep Analysis & Reviewer Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={requestAiAnalysis}
              disabled={loadingAi}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{loadingAi ? 'Synthesizing AI Analysis...' : 'Ask AI Coach (Codal Analysis)'}</span>
            </button>

            <div className="flex items-center space-x-3 text-[11px] text-slate-500">
              {question.examTags && question.examTags.length > 0 && (
                <span className="font-mono">Asked in: {question.examTags.join(', ')}</span>
              )}
              {question.reviewer && (
                <span className="hidden sm:inline border-l border-slate-200 pl-3">
                  Verified by: {question.reviewer}
                </span>
              )}
            </div>
          </div>

          {/* Gemini AI Deep Analysis Response */}
          {aiExplanation && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs border border-indigo-500/30 whitespace-pre-line leading-relaxed font-sans shadow-inner">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-bold mb-2 pb-2 border-b border-slate-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Expert Codal Rationale & Field Application:</span>
              </div>
              {aiExplanation}
            </div>
          )}
        </div>
      )}

      {/* Report Question Modal */}
      {showReportModal && (
        <ReportQuestionModal
          question={question}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
