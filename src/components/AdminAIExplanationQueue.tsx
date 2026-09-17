import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Edit3,
  Check,
  X,
  Clock,
  ShieldCheck,
  ChevronRight,
  Database
} from 'lucide-react';
import {
  QuestionBankService,
  QuestionRecord,
  AIExplanationJob
} from '../services/questionBankService';

interface AdminAIExplanationQueueProps {
  onExplanationApproved?: () => void;
}

export const AdminAIExplanationQueue: React.FC<AdminAIExplanationQueueProps> = ({
  onExplanationApproved,
}) => {
  const [queue, setQueue] = useState<QuestionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJobs, setGeneratedJobs] = useState<AIExplanationJob[]>([]);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const list = await QuestionBankService.getAIExplanationQueue();
      setQueue(list);
    } catch (err: any) {
      console.error('Failed to load queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleGenerateBatch = async () => {
    if (queue.length === 0) return;
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const qIds = queue.slice(0, 15).map((q) => q.id);
      const jobs = await QuestionBankService.generateAIExplanations(qIds);
      setGeneratedJobs(jobs);
      setStatusMessage(`Successfully generated ${jobs.length} codal solutions via Gemini 2.5 Flash.`);
    } catch (err: any) {
      setStatusMessage(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (job: AIExplanationJob) => {
    const textToSave = editingJobId === job.id ? editedText : (job.generated_explanation || '');
    try {
      await QuestionBankService.approveAIExplanation(job.id, textToSave);
      setGeneratedJobs((prev) => prev.filter((j) => j.id !== job.id));
      setQueue((prev) => prev.filter((q) => q.id !== job.question_id));
      setEditingJobId(null);
      if (onExplanationApproved) onExplanationApproved();
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>AI Technical Panel Queue</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">{queue.length} Needing Solutions</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>Automated Codal Explanation Generation</span>
          </h3>
          <p className="text-xs text-slate-500">
            Batch-generate technical derivations with IS 456 / IS 800 codal clauses for newly imported questions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchQueue}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all text-xs font-semibold flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleGenerateBatch}
            disabled={isGenerating || queue.length === 0}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating (Flash)...' : `Generate Batch (Next 15)`}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Generated Solutions for Review */}
      {generatedJobs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Review & Approve AI Generated Explanations ({generatedJobs.length})</span>
          </h4>

          <div className="space-y-3">
            {generatedJobs.map((job) => (
              <div key={job.id} className="p-4 bg-purple-50/40 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Q-ID: <code className="font-mono text-purple-900">{job.question_id}</code></span>
                  <span className="text-[10px] text-purple-700 font-mono bg-purple-100 px-2 py-0.5 rounded font-semibold">
                    Cost: ₹{job.cost_inr} · Model: {job.model_used}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-900">{job.question_text}</p>

                {editingJobId === job.id ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 text-xs bg-white border border-purple-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="p-2.5 bg-white border border-purple-100 rounded-lg text-xs text-slate-700 leading-relaxed font-serif">
                    {job.generated_explanation}
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-1">
                  {editingJobId === job.id ? (
                    <button
                      onClick={() => setEditingJobId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingJobId(job.id);
                        setEditedText(job.generated_explanation || '');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-100 flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Solution</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleApprove(job)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Save to Q-Bank</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Pending Questions Missing Detailed Solutions ({queue.length})
        </h4>

        {queue.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800">All questions in repository have explanations!</p>
            <p className="text-[11px] text-slate-500">When questions are bulk imported without solutions, they will automatically queue here.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {queue.map((q) => (
              <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">{q.id}</span>
                    <span className="px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded text-[10px] font-semibold">{q.subject_id}</span>
                    <span className="text-[10px] text-slate-400">Option {q.correct_answer}</span>
                  </div>
                  <p className="font-medium text-slate-800 line-clamp-1">{q.question_text}</p>
                </div>

                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                  Missing Solution
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
