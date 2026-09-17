import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Flag, HelpCircle, X } from 'lucide-react';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  markedForReviewCount: number;
  timeLeftFormatted: string;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  unansweredCount,
  markedForReviewCount,
  timeLeftFormatted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Submit Examination Confirmation</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to submit your CBT test? Once submitted, you cannot modify your responses.
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Total Questions
              </span>
              <span className="font-bold text-slate-900">{totalQuestions}</span>
            </div>

            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between">
              <span className="text-emerald-800 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Answered
              </span>
              <span className="font-bold text-emerald-700">{answeredCount}</span>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between">
              <span className="text-amber-800 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Unanswered
              </span>
              <span className="font-bold text-amber-700">{unansweredCount}</span>
            </div>

            <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 flex items-center justify-between">
              <span className="text-purple-800 flex items-center">
                <Flag className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                Review Flagged
              </span>
              <span className="font-bold text-purple-700">{markedForReviewCount}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-sky-50 p-2.5 rounded-lg border border-sky-100">
            <Clock className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Time remaining in window: <strong className="text-sky-900 font-mono">{timeLeftFormatted}</strong></span>
          </div>

          {unansweredCount > 0 && (
            <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              ⚠️ Note: You have <strong>{unansweredCount}</strong> unattempted questions. They will be marked as zero marks with no negative penalty.
            </div>
          )}

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Resume Test
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
            >
              Yes, Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
