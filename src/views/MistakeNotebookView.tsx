import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Filter,
  Trash2,
  RotateCcw,
  Edit3,
  BookOpen,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Clock,
  Search,
  Check,
  X,
  History,
  Tag,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';
import { MistakeLog, MistakeReasonTag, ExamTargetId } from '../types';
import { SUBJECTS_LIST, EXAM_CATALOGUE } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface MistakeNotebookViewProps {
  mistakes: MistakeLog[];
  onMistakesUpdated: () => void;
  setActiveView?: (view: string) => void;
}

export const MistakeNotebookView: React.FC<MistakeNotebookViewProps> = ({
  mistakes,
  onMistakesUpdated,
  setActiveView,
}) => {
  // Filter States
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'mastered' | 'spaced_due'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing Note State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  // Expanded History Card IDs
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([]);

  // Retest Modal State
  const [isRetesting, setIsRetesting] = useState<boolean>(false);
  const [retestIndex, setRetestIndex] = useState<number>(0);
  const [retestSelectedOption, setRetestSelectedOption] = useState<number | null>(null);
  const [retestSubmitted, setRetestSubmitted] = useState<boolean>(false);
  const [retestScore, setRetestScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const todayStr = new Date().toISOString().split('T')[0];

  // The 9 official tags required by specification
  const officialTags: { id: MistakeReasonTag; label: string; color: string; desc: string }[] = [
    { id: 'concept_gap', label: 'Concept Gap', color: 'bg-amber-100 text-amber-900 border-amber-300', desc: 'Fundamental engineering principle misunderstood' },
    { id: 'formula_error', label: 'Formula Error', color: 'bg-rose-100 text-rose-900 border-rose-300', desc: 'Incorrect mathematical or empirical equation recalled' },
    { id: 'calculation_error', label: 'Calculation Error', color: 'bg-red-100 text-red-900 border-red-300', desc: 'Arithmetic, multiplication, or sign slip' },
    { id: 'unit_error', label: 'Unit Error', color: 'bg-orange-100 text-orange-900 border-orange-300', desc: 'Conversion error between mm/m, kN/N, or MPa/kPa' },
    { id: 'misread', label: 'Misread', color: 'bg-purple-100 text-purple-900 border-purple-300', desc: 'Overlooked NOT, EXCEPT, or condition in statement' },
    { id: 'guess', label: 'Guess', color: 'bg-slate-100 text-slate-800 border-slate-300', desc: 'Unsure, speculative, or randomized selection' },
    { id: 'time_pressure', label: 'Time Pressure', color: 'bg-yellow-100 text-yellow-900 border-yellow-300', desc: 'Rushed response during CBT countdown timer' },
    { id: 'code_standard_confusion', label: 'Code/Standard Confusion', color: 'bg-indigo-100 text-indigo-900 border-indigo-300', desc: 'Confused IS 456, IS 800, IRC, or CPWD clauses' },
    { id: 'factual_recall', label: 'Factual Recall', color: 'bg-blue-100 text-blue-900 border-blue-300', desc: 'Forgot specific standard value, year, or constant' },
  ];

  const getTagInfo = (tag: MistakeReasonTag) => {
    // Check direct match or aliases
    if (tag === 'conceptual_gap') return officialTags[0];
    if (tag === 'missed_is_code') return officialTags[7];
    if (tag === 'silly_mistake') return officialTags[2];
    if (tag === 'misread_question') return officialTags[4];
    return officialTags.find((t) => t.id === tag) || officialTags[0];
  };

  // Filter application
  const filteredMistakes = mistakes.filter((m) => {
    // Status filter
    if (statusFilter === 'active' && m.resolved) return false;
    if (statusFilter === 'mastered' && !m.resolved) return false;
    if (statusFilter === 'spaced_due') {
      if (m.resolved) return false;
      if (!m.nextRevisionDate || m.nextRevisionDate > todayStr) return false;
    }

    // Tag filter
    if (tagFilter !== 'all') {
      if (m.reasonTag !== tagFilter && m.mistakeReason !== tagFilter) return false;
    }

    // Subject filter
    if (subjectFilter !== 'all' && m.question.subjectId !== subjectFilter) {
      return false;
    }

    // Exam filter
    if (examFilter !== 'all') {
      if (m.question.examCategory && m.question.examCategory !== examFilter) {
        return false;
      }
    }

    // Date filter
    if (dateFilter !== 'all') {
      const itemDate = new Date(m.dateLogged || m.loggedAt || todayStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dateFilter === 'today' && diffDays > 0) return false;
      if (dateFilter === 'last7' && diffDays > 7) return false;
      if (dateFilter === 'last30' && diffDays > 30) return false;
    }

    // Keyword Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = m.question.text.toLowerCase().includes(q);
      const matchExplanation = (m.question.explanation || '').toLowerCase().includes(q);
      const matchNotes = (m.userNotes || '').toLowerCase().includes(q);
      const matchTopic = (m.question.topicName || '').toLowerCase().includes(q);
      if (!matchText && !matchExplanation && !matchNotes && !matchTopic) return false;
    }

    return true;
  });

  const activeCount = mistakes.filter((m) => !m.resolved).length;
  const masteredCount = mistakes.filter((m) => m.resolved).length;
  const spacedDueCount = mistakes.filter((m) => !m.resolved && m.nextRevisionDate && m.nextRevisionDate <= todayStr).length;

  const handleToggleMastered = (id: string) => {
    StorageService.toggleMistakeMastered(id);
    onMistakesUpdated();
  };

  const handleSaveNote = (id: string) => {
    StorageService.updateMistakeNote(id, noteText);
    setEditingNoteId(null);
    setNoteText('');
    onMistakesUpdated();
  };

  const handleChangeTag = (id: string, newTag: MistakeReasonTag) => {
    StorageService.updateMistakeTag(id, newTag);
    onMistakesUpdated();
  };

  const toggleHistory = (id: string) => {
    setExpandedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Retest Modal Handlers
  const handleStartRetest = () => {
    if (filteredMistakes.length === 0) return;
    setRetestIndex(0);
    setRetestSelectedOption(null);
    setRetestSubmitted(false);
    setRetestScore({ correct: 0, total: 0 });
    setIsRetesting(true);
  };

  const currentRetestItem = filteredMistakes[retestIndex];

  const handleRetestSubmitAnswer = () => {
    if (retestSelectedOption === null || !currentRetestItem) return;

    const isCorrect = retestSelectedOption === currentRetestItem.question.correctOption;
    StorageService.recordMistakeRetest(currentRetestItem.id, retestSelectedOption, isCorrect);
    setRetestSubmitted(true);
    setRetestScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    onMistakesUpdated();
  };

  const handleRetestNext = () => {
    if (retestIndex + 1 < filteredMistakes.length) {
      setRetestIndex(retestIndex + 1);
      setRetestSelectedOption(null);
      setRetestSubmitted(false);
    } else {
      setIsRetesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                ACTIVE CIVIL ERROR LOG
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {mistakes.length} Total Saved · {activeCount} Unresolved · {masteredCount} Mastered
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <span>Civil Engineering Mistake Notebook & Spaced Retest Queue</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Auto-archives every wrong answer from Practice & CBT Mocks. Categorized into 9 engineering error types with Leitner spaced repetition.
            </p>
          </div>

          {/* Retest Action Button */}
          <div className="flex items-center space-x-2">
            <button
              id="retest-mistakes-btn"
              onClick={handleStartRetest}
              disabled={filteredMistakes.length === 0}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center space-x-2 transition-colors shadow-xs"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Retest Mistakes ({filteredMistakes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status & Spaced Revision Queue Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-75">All Questions</span>
          <span className="text-lg font-extrabold font-mono">{mistakes.length}</span>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'active'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-75">Active Errors</span>
          <span className="text-lg font-extrabold font-mono">{activeCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('spaced_due')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'spaced_due'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold block opacity-75">Spaced Due Today</span>
            {spacedDueCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <span className="text-lg font-extrabold font-mono">{spacedDueCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('mastered')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'mastered'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-75">Mastered & Resolved</span>
          <span className="text-lg font-extrabold font-mono">{masteredCount}</span>
        </button>
      </div>

      {/* Multi-Dimensional Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search topic or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-slate-800"
            />
          </div>

          {/* Reason Tag Filter */}
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 font-medium"
          >
            <option value="all">All 9 Error Tags</option>
            {officialTags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Civil Subjects</option>
            {SUBJECTS_LIST.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {/* Exam Filter */}
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Exam Cadres</option>
            {EXAM_CATALOGUE.map((e) => (
              <option key={e.id} value={e.id}>
                {e.shortName}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Dates</option>
            <option value="today">Logged Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
          </select>
        </div>

        {/* Quick Tag Pills Row */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 self-center mr-1">Tags:</span>
          {officialTags.map((t) => {
            const isSelected = tagFilter === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTagFilter(isSelected ? 'all' : t.id)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mistake Cards List */}
      <div className="space-y-4">
        {filteredMistakes.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Mistakes Match Filter Criteria!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Any incorrect questions from CBT Mock Tests and Practice sessions will be logged here for spaced retesting.
            </p>
          </div>
        ) : (
          filteredMistakes.map((item) => {
            const subject = SUBJECTS_LIST.find((s) => s.id === item.question.subjectId);
            const tagInfo = getTagInfo(item.reasonTag || item.mistakeReason);
            const isHistoryExpanded = expandedHistoryIds.includes(item.id);
            const stage = item.spacedIntervalStage || 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-5 shadow-xs space-y-3.5 transition-all ${
                  item.resolved
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      {subject?.code || 'CIVIL'}
                    </span>

                    {/* Tag Dropdown Selector */}
                    <div className="relative inline-block">
                      <select
                        value={item.reasonTag || item.mistakeReason}
                        onChange={(e) => handleChangeTag(item.id, e.target.value as MistakeReasonTag)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${tagInfo.color}`}
                        title="Click to change error tag"
                      >
                        {officialTags.map((ot) => (
                          <option key={ot.id} value={ot.id}>
                            {ot.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Spaced Interval Stage Badge */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Leitner Stage: {stage}/4
                    </span>

                    {item.nextRevisionDate && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Next: {item.nextRevisionDate}
                      </span>
                    )}
                  </div>

                  {/* Mastered / Resolved Toggle Button */}
                  <button
                    id={`toggle-mastered-${item.id}`}
                    onClick={() => handleToggleMastered(item.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-colors ${
                      item.resolved
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${item.resolved ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{item.resolved ? 'Mastered' : 'Mark Mastered'}</span>
                  </button>
                </div>

                {/* Question Statement */}
                <p className="font-semibold text-slate-900 text-sm leading-relaxed">
                  {item.question.text}
                </p>

                {/* Candidate Selection vs Correct Option */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-950">
                    <span className="font-bold block text-[10px] text-rose-700 uppercase mb-0.5">
                      Your Attempted Option:
                    </span>
                    <span className="font-medium">
                      {String.fromCharCode(65 + item.selectedOption)}: {item.question.options[item.selectedOption]}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <span className="font-bold block text-[10px] text-emerald-700 uppercase mb-0.5">
                      Correct Standard Key:
                    </span>
                    <span className="font-medium">
                      {String.fromCharCode(65 + item.correctOption)}: {item.question.options[item.correctOption]}
                    </span>
                  </div>
                </div>

                {/* Explanation / IS Codal Rationale */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">IS Codal Rationale:</strong>
                  {item.question.explanation}
                </div>

                {/* User Notes Section */}
                <div className="pt-2 border-t border-slate-100 text-xs">
                  {editingNoteId === item.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add personal memory trap, shortcut or codal note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                      <button
                        onClick={() => handleSaveNote(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="italic">
                        {item.userNotes ? `Personal Note: "${item.userNotes}"` : 'No personal trap note added.'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setNoteText(item.userNotes || '');
                        }}
                        className="text-sky-600 hover:text-sky-800 font-medium flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{item.userNotes ? 'Edit Note' : 'Add Note'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* History Accordion Toggle */}
                {item.history && item.history.length > 0 && (
                  <div className="pt-1">
                    <button
                      onClick={() => toggleHistory(item.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1"
                    >
                      <History className="w-3 h-3" />
                      <span>
                        Attempt & Revision History ({item.history.length} Events)
                      </span>
                      {isHistoryExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {/* Expanded History Timeline */}
                    {isHistoryExpanded && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-[11px]">
                        {item.history.map((evt, hIdx) => (
                          <div key={hIdx} className="flex items-start justify-between text-slate-600">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-slate-400">{evt.date}</span>
                              <span className="font-bold text-slate-800 uppercase text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200">
                                {evt.action}
                              </span>
                              <span>{evt.notes || (evt.isCorrect ? 'Correct in retest' : 'Incorrect')}</span>
                            </div>
                            {evt.isCorrect !== undefined && (
                              <span
                                className={`font-bold font-mono text-[10px] ${
                                  evt.isCorrect ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {evt.isCorrect ? 'PASSED' : 'FAILED'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Retest Mistakes Interactive Modal */}
      {isRetesting && currentRetestItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-xs font-bold font-mono">
                  MISTAKE RETEST DRILL
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Question {retestIndex + 1} of {filteredMistakes.length}
                </span>
              </div>
              <button
                onClick={() => setIsRetesting(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕ Exit Retest
              </button>
            </div>

            {/* Retest Question Statement */}
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono">
                {currentRetestItem.question.subjectId.toUpperCase()}
              </span>
              <p className="font-bold text-slate-900 text-base mt-2">
                {currentRetestItem.question.text}
              </p>
            </div>

            {/* Options Selector */}
            <div className="space-y-2.5">
              {currentRetestItem.question.options.map((opt, optIdx) => {
                const isSelected = retestSelectedOption === optIdx;
                const isCorrectKey = optIdx === currentRetestItem.question.correctOption;

                let btnStyle = 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800';
                if (retestSubmitted) {
                  if (isCorrectKey) {
                    btnStyle = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                  } else {
                    btnStyle = 'border-slate-200 opacity-50';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-sky-500 bg-sky-50 text-sky-950 font-bold';
                }

                return (
                  <button
                    key={optIdx}
                    disabled={retestSubmitted}
                    onClick={() => setRetestSelectedOption(optIdx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm flex items-center space-x-3 transition-all ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 font-mono font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback / Explanation upon Submit */}
            {retestSubmitted && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  retestSelectedOption === currentRetestItem.question.correctOption
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <strong className="block text-sm font-bold mb-1">
                  {retestSelectedOption === currentRetestItem.question.correctOption
                    ? '✓ Correct! Leitner Spaced Interval Advanced.'
                    : '✗ Incorrect. Interval reset to Day 1 review.'}
                </strong>
                <p>
                  <strong>IS Codal Rationale: </strong>
                  {currentRetestItem.question.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-mono">
                Current Score: {retestScore.correct} / {retestScore.total}
              </span>

              {!retestSubmitted ? (
                <button
                  id="retest-submit-answer-btn"
                  onClick={handleRetestSubmitAnswer}
                  disabled={retestSelectedOption === null}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  id="retest-next-question-btn"
                  onClick={handleRetestNext}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1"
                >
                  <span>
                    {retestIndex + 1 < filteredMistakes.length ? 'Next Question →' : 'Finish Retest'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
