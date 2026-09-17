import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  CheckCircle2,
  HelpCircle,
  FileText,
  Bookmark,
  ShieldAlert
} from 'lucide-react';
import { Question, QuestionReport } from '../types';
import { StorageService } from '../services/storageService';

interface ReportQuestionModalProps {
  question: Question;
  onClose: () => void;
  onReportSubmitted?: (report: QuestionReport) => void;
}

export const ReportQuestionModal: React.FC<ReportQuestionModalProps> = ({
  question,
  onClose,
  onReportSubmitted,
}) => {
  const [category, setCategory] = useState<QuestionReport['category']>('wrong_answer');
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories: { id: QuestionReport['category']; label: string; desc: string; icon: string }[] = [
    {
      id: 'wrong_answer',
      label: 'Wrong Answer / Key Issue',
      desc: 'Marked answer disagrees with authentic official notification key or IS code calculation.',
      icon: '❌',
    },
    {
      id: 'ambiguity',
      label: 'Ambiguity in Question Stem',
      desc: 'Incomplete parameters, missing units, or multiple interpretations possible.',
      icon: '❓',
    },
    {
      id: 'outdated_code',
      label: 'Outdated Code / Clause',
      desc: 'Question refers to superseded Indian Standard (e.g. IS 456:1978 or IS 800:1984 instead of latest limit state).',
      icon: '📜',
    },
    {
      id: 'typo',
      label: 'Typo / Formula Formatting',
      desc: 'Spelling error, broken subscript/superscript, or mathematical symbol glitch.',
      icon: '✏️',
    },
    {
      id: 'explanation_issue',
      label: 'Explanation / Distractor Rationale Issue',
      desc: 'Steps lack derivation, wrong intermediate equations, or missing "why other options are wrong".',
      icon: '💡',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    const report = StorageService.reportQuestion({
      questionId: question.id,
      questionStem: question.stem || question.text,
      category,
      comment: comment.trim(),
      userEmail: userEmail.trim() || undefined,
    });

    setIsSubmitting(false);
    setSubmitted(true);
    if (onReportSubmitted) {
      onReportSubmitted(report);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold text-slate-900 text-base">Report Question Issue</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Feedback Submitted to Review Board</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for contributing to the accuracy of our Civil Engineering Question Bank.
              Our faculty review panel will re-verify the codal clauses and update the question accordingly.
            </p>
            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Question Summary Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>ID: {question.id}</span>
                <span className="font-semibold text-sky-700 uppercase">{question.subjectId}</span>
              </div>
              <p className="font-medium text-slate-800 line-clamp-2 text-xs">
                {question.stem || question.text}
              </p>
              {question.isCodeReference && (
                <div className="text-[10px] text-indigo-700 font-mono font-medium">
                  Ref: {question.isCodeReference}
                </div>
              )}
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                What is the specific issue with this question? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-start space-x-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      category === cat.id
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 ring-1 ring-sky-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_category"
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="font-bold text-xs flex items-center space-x-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{cat.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Explanation & Proposed Correction <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain why the answer or question is incorrect, citing standard IS/IRC code clause, page number, or formula calculation..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* Optional Email */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                Email Address <span className="text-slate-400 font-normal">(Optional, to notify you when resolved)</span>
              </label>
              <input
                type="email"
                placeholder="youremail@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1.5 disabled:opacity-50 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
