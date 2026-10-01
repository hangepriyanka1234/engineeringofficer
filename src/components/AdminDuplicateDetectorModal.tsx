import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Filter,
  ArrowRight,
  Layers,
  Globe,
  Trash2,
  Link,
  Merge,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ScalableHubQuestion, DuplicateQuestionMatch } from '../types/examHub';
import { DuplicateDetectionService } from '../services/duplicateDetectionService';
import { ExamHubService } from '../services/examHubService';

interface AdminDuplicateDetectorModalProps {
  onClose: () => void;
}

export const AdminDuplicateDetectorModal: React.FC<AdminDuplicateDetectorModalProps> = ({ onClose }) => {
  const [questions, setQuestions] = useState<ScalableHubQuestion[]>(ExamHubService.getQuestions({}));
  const [duplicates, setDuplicates] = useState<DuplicateQuestionMatch[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXACT_DUPLICATE' | 'NEAR_DUPLICATE' | 'CROSS_LANGUAGE_DUPLICATE'>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<DuplicateQuestionMatch | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    runScan();
  }, []);

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const allQs = ExamHubService.getQuestions({});
      setQuestions(allQs);
      const results = DuplicateDetectionService.findDuplicates(allQs);
      setDuplicates(results);
      setIsScanning(false);
      if (results.length > 0) {
        setSelectedMatch(results[0]);
      }
    }, 500);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleResolveMerge = (match: DuplicateQuestionMatch) => {
    // Merge Duplicate B into Primary A
    const primary = match.primary_question;
    const dup = match.duplicate_question;

    // Enhance Primary with Marathi translation if dup has it
    if (!primary.marathi_text && dup.marathi_text) {
      primary.marathi_text = dup.marathi_text;
    }
    if (!primary.marathi_explanation && dup.marathi_explanation) {
      primary.marathi_explanation = dup.marathi_explanation;
    }

    ExamHubService.saveQuestion(primary);

    // Filter out resolved match
    setDuplicates((prev) => prev.filter((m) => m.id !== match.id));
    setSelectedMatch(null);
    showToast('प्रश्न यशस्वीरित्या एकत्र केले (Merged Duplicate)!');
  };

  const handleResolveLinkBilingual = (match: DuplicateQuestionMatch) => {
    const primary = match.primary_question;
    const dup = match.duplicate_question;

    primary.marathi_text = dup.marathi_text || dup.question_text;
    primary.marathi_explanation = dup.marathi_explanation || dup.explanation;

    ExamHubService.saveQuestion(primary);

    setDuplicates((prev) => prev.filter((m) => m.id !== match.id));
    setSelectedMatch(null);
    showToast('इंग्रजी व मराठी व्हर्जन जोडून द्वैभाषिक प्रश्न लिंक केला!');
  };

  const handleResolveDismiss = (match: DuplicateQuestionMatch) => {
    setDuplicates((prev) => prev.filter((m) => m.id !== match.id));
    setSelectedMatch(null);
    showToast('Duplicate ध्वज रद्द केला.');
  };

  const filteredMatches = duplicates.filter((m) => {
    if (activeTab !== 'ALL' && m.duplicate_type !== activeTab) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 space-y-6 max-h-[92vh] overflow-y-auto text-slate-100 shadow-2xl">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Duplicate Question Detection & Resolution Hub
              </h2>
              <p className="text-xs text-slate-400">
                Normalized Hash, Near-Duplicate, आणि Cross-Language (मराठी/English) Duplicate डिटेक्शन
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-slate-500 font-mono">Total Questions Checked</div>
            <div className="text-lg font-bold text-white mt-1">{questions.length} Qs</div>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-slate-500 font-mono">Duplicates Found</div>
            <div className="text-lg font-bold text-amber-400 mt-1">{duplicates.length} Matches</div>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-slate-500 font-mono">Cross-Language Matches</div>
            <div className="text-lg font-bold text-sky-400 mt-1">
              {duplicates.filter((d) => d.duplicate_type === 'CROSS_LANGUAGE_DUPLICATE').length} Matches
            </div>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-slate-500 font-mono">Scan Status</div>
              <div className="text-xs font-bold text-emerald-400 mt-1">
                {isScanning ? 'Scanning...' : 'Scan Complete'}
              </div>
            </div>
            <button
              onClick={runScan}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
              title="Rescan Question Bank"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'ALL' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            सर्व Duplicates ({duplicates.length})
          </button>
          <button
            onClick={() => setActiveTab('EXACT_DUPLICATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'EXACT_DUPLICATE' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Exact 100% Hash Match ({duplicates.filter((d) => d.duplicate_type === 'EXACT_DUPLICATE').length})
          </button>
          <button
            onClick={() => setActiveTab('NEAR_DUPLICATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'NEAR_DUPLICATE' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Near Duplicate &gt;85% ({duplicates.filter((d) => d.duplicate_type === 'NEAR_DUPLICATE').length})
          </button>
          <button
            onClick={() => setActiveTab('CROSS_LANGUAGE_DUPLICATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'CROSS_LANGUAGE_DUPLICATE' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Cross-Language (मराठी/Eng) ({duplicates.filter((d) => d.duplicate_type === 'CROSS_LANGUAGE_DUPLICATE').length})
          </button>
        </div>

        {/* Duplicate Scanner Content Grid */}
        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">कोणतेही Duplicate प्रश्न सापडले नाहीत!</h4>
            <p className="text-xs text-slate-400">सर्व प्रश्न स्वतंत्र व युनिक आहेत.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List Sidebar */}
            <div className="lg:col-span-1 space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedMatch?.id === m.id
                      ? 'bg-slate-800 border-sky-500 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        m.duplicate_type === 'EXACT_DUPLICATE'
                          ? 'bg-rose-500/20 text-rose-400'
                          : m.duplicate_type === 'CROSS_LANGUAGE_DUPLICATE'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {m.duplicate_type.replace('_DUPLICATE', '')}
                    </span>
                    <span className="font-bold text-emerald-400">{m.similarity_score}% Match</span>
                  </div>
                  <div className="text-xs font-semibold text-white line-clamp-2">
                    {m.primary_question.question_text}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Subject: {m.primary_question.subject}
                  </div>
                </div>
              ))}
            </div>

            {/* Side-by-side Inspection Pane */}
            {selectedMatch && (
              <div className="lg:col-span-2 space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-sky-400 font-mono">
                      Match Details ({selectedMatch.similarity_score}% Similarity)
                    </span>
                    <div className="text-[11px] text-slate-400">
                      Reason: {selectedMatch.matched_reasons.join(' • ')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResolveMerge(selectedMatch)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs flex items-center space-x-1"
                    >
                      <Merge className="w-3.5 h-3.5" />
                      <span>Merge Questions</span>
                    </button>
                    {selectedMatch.duplicate_type === 'CROSS_LANGUAGE_DUPLICATE' && (
                      <button
                        onClick={() => handleResolveLinkBilingual(selectedMatch)}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center space-x-1"
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>Link Bilingual</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleResolveDismiss(selectedMatch)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                {/* Question A vs Question B Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Primary Question A */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 border-b border-slate-800 pb-1">
                      <span>Primary Question A</span>
                      <span>ID: {selectedMatch.primary_question.id}</span>
                    </div>
                    <div className="font-semibold text-white">{selectedMatch.primary_question.question_text}</div>
                    {selectedMatch.primary_question.marathi_text && (
                      <div className="text-sky-300 text-[11px] bg-sky-950/40 p-2 rounded">
                        मराठी: {selectedMatch.primary_question.marathi_text}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">
                      Exam: {selectedMatch.primary_question.exam_name} ({selectedMatch.primary_question.year})
                    </div>
                  </div>

                  {/* Duplicate Question B */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 border-b border-slate-800 pb-1">
                      <span>Candidate Duplicate B</span>
                      <span>ID: {selectedMatch.duplicate_question.id}</span>
                    </div>
                    <div className="font-semibold text-white">{selectedMatch.duplicate_question.question_text}</div>
                    {selectedMatch.duplicate_question.marathi_text && (
                      <div className="text-sky-300 text-[11px] bg-sky-950/40 p-2 rounded">
                        मराठी: {selectedMatch.duplicate_question.marathi_text}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">
                      Exam: {selectedMatch.duplicate_question.exam_name} ({selectedMatch.duplicate_question.year})
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
