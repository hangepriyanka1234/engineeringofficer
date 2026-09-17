import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileCode,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  BookOpen,
  Eye,
  Check,
  X,
  History,
  Archive,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Zap,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { Question, QuestionReport, SubjectId, QuestionType } from '../types';
import { StorageService } from '../services/storageService';
import { SUBJECTS_LIST, EXAM_CATALOGUE } from '../data/mockData';
import {
  QuestionBankService,
  QuestionRecord,
  QuestionVersionRecord
} from '../services/questionBankService';
import { AdminBulkQuestionImporter } from './AdminBulkQuestionImporter';
import { AdminAIExplanationQueue } from './AdminAIExplanationQueue';
import { AdminImportHistoryModal } from './AdminImportHistoryModal';

interface AdminQuestionBankManagerProps {
  onDataModified?: () => void;
}

export const AdminQuestionBankManager: React.FC<AdminQuestionBankManagerProps> = ({
  onDataModified,
}) => {
  // Navigation Subtabs
  const [activeSubTab, setActiveSubTab] = useState<'repository' | 'bulk-import' | 'ai-queue' | 'reports'>('repository');

  // Server-side paginated state for 20,000+ questions
  const [serverQuestions, setServerQuestions] = useState<QuestionRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    verifiedCount: 0,
    pyqCount: 0,
    unverifiedCount: 0,
    archivedCount: 0,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [selectedIsPyq, setSelectedIsPyq] = useState<string>('all'); // 'all' | 'true' | 'false'
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Multi-Selection for Bulk Actions
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBulkCategorizeModal, setShowBulkCategorizeModal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<{ question: QuestionRecord; versions: QuestionVersionRecord[] } | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRecord | null>(null);

  // Bulk Categorize Form
  const [bulkSubject, setBulkSubject] = useState<string>('');
  const [bulkExam, setBulkExam] = useState<string>('');
  const [bulkDifficulty, setBulkDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');

  // Add / Edit Form states
  const [formSubjectId, setFormSubjectId] = useState<string>('rcc_concrete');
  const [formTopic, setFormTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formType, setFormType] = useState<string>('standard_mcq');
  const [formStem, setFormStem] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<string>('A');
  const [formExplanation, setFormExplanation] = useState('');
  const [formCodeRef, setFormCodeRef] = useState('');
  const [formFormula, setFormFormula] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formExamId, setFormExamId] = useState('maha_pwd');
  const [formYear, setFormYear] = useState<number>(2024);
  const [formIsPyq, setFormIsPyq] = useState<boolean>(true);
  const [formVerificationStatus, setFormVerificationStatus] = useState<'unverified' | 'under_review' | 'verified' | 'rejected'>('verified');
  const [formChangeReason, setFormChangeReason] = useState('');

  // Legacy Reports state
  const [reports, setReports] = useState<QuestionReport[]>(() => StorageService.getQuestionReports());
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Load Questions from Server with Pagination & Filters
  const loadQuestions = useCallback(async () => {
    setIsLoadingQuestions(true);
    try {
      const data = await QuestionBankService.getQuestions({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        subjectId: selectedSubject,
        examId: selectedExam,
        difficulty: selectedDifficulty,
        verificationStatus: selectedVerification,
        isPyq: selectedIsPyq === 'all' ? undefined : selectedIsPyq === 'true',
        isArchived: showArchived ? true : false,
        selectiveColumns: true,
      });

      setServerQuestions(data.questions as QuestionRecord[]);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedSubject, selectedExam, selectedDifficulty, selectedVerification, selectedIsPyq, showArchived]);

  useEffect(() => {
    if (activeSubTab === 'repository') {
      loadQuestions();
    }
  }, [loadQuestions, activeSubTab]);

  // Handle Multi-Select
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedQuestionIds(serverQuestions.map((q) => q.id));
    } else {
      setSelectedQuestionIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Operations Handlers
  const handleBulkArchive = async (archive = true) => {
    if (selectedQuestionIds.length === 0) return;
    if (confirm(`Are you sure you want to ${archive ? 'archive' : 'restore'} ${selectedQuestionIds.length} questions?`)) {
      await QuestionBankService.bulkArchive(selectedQuestionIds, archive);
      setSelectedQuestionIds([]);
      loadQuestions();
      if (onDataModified) onDataModified();
    }
  };

  const handleBulkVerify = async (status: 'unverified' | 'under_review' | 'verified' | 'rejected') => {
    if (selectedQuestionIds.length === 0) return;
    await QuestionBankService.bulkVerify(selectedQuestionIds, status);
    setSelectedQuestionIds([]);
    loadQuestions();
    if (onDataModified) onDataModified();
  };

  const handleBulkCategorizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) return;
    await QuestionBankService.bulkCategorize(selectedQuestionIds, {
      subject_id: bulkSubject || undefined,
      exam_id: bulkExam || undefined,
      difficulty: bulkDifficulty || undefined,
    });
    setShowBulkCategorizeModal(false);
    setSelectedQuestionIds([]);
    loadQuestions();
    if (onDataModified) onDataModified();
  };

  const handleBulkDelete = async () => {
    if (selectedQuestionIds.length === 0) return;
    if (confirm(`CRITICAL: Permanently delete ${selectedQuestionIds.length} questions from the Supabase database?`)) {
      await QuestionBankService.bulkDelete(selectedQuestionIds);
      setSelectedQuestionIds([]);
      loadQuestions();
      if (onDataModified) onDataModified();
    }
  };

  // Single Question Actions
  const handleOpenDetail = async (q: QuestionRecord) => {
    try {
      const data = await QuestionBankService.getQuestionById(q.id);
      setViewingQuestion(data);
    } catch {
      setViewingQuestion({ question: q, versions: [] });
    }
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormSubjectId('rcc_concrete');
    setFormTopic('');
    setFormDifficulty('medium');
    setFormType('standard_mcq');
    setFormStem('');
    setFormOptionA('');
    setFormOptionB('');
    setFormOptionC('');
    setFormOptionD('');
    setFormCorrectAnswer('A');
    setFormExplanation('');
    setFormCodeRef('');
    setFormFormula('');
    setFormUnit('');
    setFormExamId('maha_pwd');
    setFormYear(2024);
    setFormIsPyq(true);
    setFormVerificationStatus('verified');
    setFormChangeReason('');
    setShowAddModal(true);
  };

  const handleOpenEdit = async (q: QuestionRecord) => {
    try {
      const full = await QuestionBankService.getQuestionById(q.id);
      const target = full.question || q;
      setEditingQuestion(target);
      setFormSubjectId(target.subject_id);
      setFormTopic(target.topic_id || '');
      setFormDifficulty(target.difficulty);
      setFormType(target.question_type);
      setFormStem(target.question_text);
      setFormOptionA(target.option_a);
      setFormOptionB(target.option_b);
      setFormOptionC(target.option_c || '');
      setFormOptionD(target.option_d || '');
      setFormCorrectAnswer(String(target.correct_answer || 'A'));
      setFormExplanation(target.explanation || '');
      setFormCodeRef(target.is_code_reference || '');
      setFormFormula(target.formula || '');
      setFormUnit(target.unit || '');
      setFormExamId(target.exam_id || 'maha_pwd');
      setFormYear(target.exam_year || 2024);
      setFormIsPyq(target.is_pyq);
      setFormVerificationStatus(target.verification_status);
      setFormChangeReason('');
      setShowAddModal(true);
    } catch {
      // Fallback
      setEditingQuestion(q);
      setShowAddModal(true);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<QuestionRecord> = {
      question_text: formStem,
      option_a: formOptionA,
      option_b: formOptionB,
      option_c: formOptionC,
      option_d: formOptionD,
      correct_answer: formCorrectAnswer,
      explanation: formExplanation,
      subject_id: formSubjectId,
      topic_id: formTopic || 'general',
      difficulty: formDifficulty,
      question_type: formType as any,
      exam_id: formExamId,
      exam_year: formYear,
      is_pyq: formIsPyq,
      verification_status: formVerificationStatus,
      is_code_reference: formCodeRef,
      formula: formFormula,
      unit: formUnit,
    };

    if (editingQuestion) {
      await QuestionBankService.updateQuestion(editingQuestion.id, payload, formChangeReason || 'Administrative update');
    } else {
      await QuestionBankService.createQuestion(payload);
    }

    setShowAddModal(false);
    loadQuestions();
    if (onDataModified) onDataModified();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('repository')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'repository'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>20,000+ Question Bank ({stats.totalQuestions > 0 ? stats.totalQuestions.toLocaleString() : totalCount.toLocaleString()})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bulk-import')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'bulk-import'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import Wizard</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai-queue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'ai-queue'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Solution Queue</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'reports'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>User Reports ({reports.filter((r) => r.status === 'pending').length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center space-x-1"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Audit Logs</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center space-x-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Question</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: QUESTION REPOSITORY */}
      {activeSubTab === 'repository' && (
        <div className="space-y-4">
          {/* Quick Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium">Total Repository</span>
              <p className="text-xl font-black text-slate-900">{stats.totalQuestions.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[11px] text-emerald-700 font-bold">Verified Status</span>
              <p className="text-xl font-black text-emerald-800">{stats.verifiedCount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
              <span className="text-[11px] text-sky-700 font-bold">Official PYQs</span>
              <p className="text-xl font-black text-sky-800">{stats.pyqCount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[11px] text-amber-700 font-bold">Needs Audit</span>
              <p className="text-xl font-black text-amber-800">{stats.unverifiedCount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-600 font-medium">Archived Items</span>
              <p className="text-xl font-black text-slate-700">{stats.archivedCount.toLocaleString()}</p>
            </div>
          </div>

          {/* Faceted Filter Toolbar */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              {/* Search */}
              <div className="col-span-1 sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search question stem, IS code, formula..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 text-xs font-medium"
                />
              </div>

              {/* Subject Filter (21 Subjects) */}
              <div>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-xs"
                >
                  <option value="all">All 21 Subjects</option>
                  {SUBJECTS_LIST.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Target */}
              <div>
                <select
                  value={selectedExam}
                  onChange={(e) => {
                    setSelectedExam(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-xs"
                >
                  <option value="all">All Exam Targets</option>
                  {EXAM_CATALOGUE.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-xs"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy (Diploma/JE)</option>
                  <option value="medium">Medium (Standard AE)</option>
                  <option value="hard">Hard (Advanced ESE)</option>
                </select>
              </div>

              {/* Verification Status */}
              <div>
                <select
                  value={selectedVerification}
                  onChange={(e) => {
                    setSelectedVerification(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified</option>
                  <option value="under_review">Under Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Sub-Filters & Archive Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => {
                      setShowArchived(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Show Archived Questions</span>
                </label>

                <div className="flex items-center space-x-1 text-slate-500">
                  <span>Type:</span>
                  <button
                    onClick={() => { setSelectedIsPyq('all'); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded font-semibold ${selectedIsPyq === 'all' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setSelectedIsPyq('true'); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded font-semibold ${selectedIsPyq === 'true' ? 'bg-sky-100 text-sky-800' : 'hover:bg-slate-100'}`}
                  >
                    PYQs Only
                  </button>
                  <button
                    onClick={() => { setSelectedIsPyq('false'); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded font-semibold ${selectedIsPyq === 'false' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-slate-100'}`}
                  >
                    Practice MCQs
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-500">
                <span>Page Size:</span>
                {[25, 50, 100].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setPageSize(sz);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded font-bold ${
                      pageSize === sz ? 'bg-sky-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bulk Action Bar (when items selected) */}
          {selectedQuestionIds.length > 0 && (
            <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-fade-in text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-amber-400">{selectedQuestionIds.length} questions selected</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleBulkVerify('verified')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </button>

                <button
                  onClick={() => setShowBulkCategorizeModal(true)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Categorize</span>
                </button>

                <button
                  onClick={() => handleBulkArchive(!showArchived)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center space-x-1"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{showArchived ? 'Restore' : 'Archive'}</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedQuestionIds([])}
                  className="px-2 py-1.5 text-slate-400 hover:text-white"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Questions Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 select-none">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          serverQuestions.length > 0 &&
                          selectedQuestionIds.length === serverQuestions.length
                        }
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                    </th>
                    <th className="p-3">Question Statement & Codal Standard</th>
                    <th className="p-3 w-32">Subject</th>
                    <th className="p-3 w-28">Exam Target</th>
                    <th className="p-3 w-20">Difficulty</th>
                    <th className="p-3 w-24">Status</th>
                    <th className="p-3 w-28 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-normal">
                  {isLoadingQuestions ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                        <span>Querying Question Repository...</span>
                      </td>
                    </tr>
                  ) : serverQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">No questions match current filters.</p>
                        <p className="text-[11px]">Try clearing search keywords or subject filters, or run a Bulk Import.</p>
                      </td>
                    </tr>
                  ) : (
                    serverQuestions.map((q) => {
                      const isSelected = selectedQuestionIds.includes(q.id);
                      return (
                        <tr
                          key={q.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-sky-50/60' : ''
                          }`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(q.id)}
                              className="rounded text-sky-600 focus:ring-sky-500"
                            />
                          </td>

                          <td className="p-3 space-y-1 max-w-lg">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <span className="font-mono text-[10px] text-slate-400 font-semibold">{q.id}</span>
                              {q.is_pyq && (
                                <span className="px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded text-[10px] font-bold">
                                  PYQ {q.exam_year || ''}
                                </span>
                              )}
                              {q.is_code_reference && (
                                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold font-mono">
                                  {q.is_code_reference}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">v{q.version}</span>
                            </div>

                            <p
                              onClick={() => handleOpenDetail(q)}
                              className="font-medium text-slate-900 line-clamp-2 hover:text-sky-600 cursor-pointer"
                            >
                              {q.question_text}
                            </p>

                            <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                              <span>Ans: <strong className="text-emerald-700">Option {q.correct_answer}</strong></span>
                              <span className="truncate">Opt A: {q.option_a?.substring(0, 30)}...</span>
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[11px] font-semibold uppercase">
                              {q.subject_id}
                            </span>
                          </td>

                          <td className="p-3 text-slate-700 font-medium">
                            {q.exam_id || 'All State'}
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                q.difficulty === 'easy'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : q.difficulty === 'hard'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit ${
                                q.verification_status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : q.verification_status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : q.verification_status === 'under_review'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {q.verification_status === 'verified' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-600" />
                              )}
                              <span>{q.verification_status}</span>
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleOpenDetail(q)}
                                title="Inspect & Versions"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(q)}
                                title="Edit Question"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                Showing <strong className="text-slate-900">{serverQuestions.length}</strong> of <strong className="text-slate-900">{totalCount.toLocaleString()}</strong> questions (Page {currentPage} of {totalPages})
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoadingQuestions}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold disabled:opacity-40 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="px-3 py-1.5 font-bold font-mono text-slate-800 bg-white border border-slate-300 rounded-lg">
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isLoadingQuestions}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold disabled:opacity-40 flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: BULK IMPORT WIZARD */}
      {activeSubTab === 'bulk-import' && (
        <AdminBulkQuestionImporter
          onImportComplete={() => {
            loadQuestions();
            if (onDataModified) onDataModified();
          }}
          onNavigateToRepository={(subject) => {
            if (subject) setSelectedSubject(subject);
            setActiveSubTab('repository');
          }}
        />
      )}

      {/* SUBTAB 3: AI EXPLANATION GENERATOR QUEUE */}
      {activeSubTab === 'ai-queue' && (
        <AdminAIExplanationQueue
          onExplanationApproved={() => {
            loadQuestions();
            if (onDataModified) onDataModified();
          }}
        />
      )}

      {/* SUBTAB 4: USER REPORTS & RESOLUTION */}
      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Student Reported Question Inconsistencies</span>
            </h3>

            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No student reports submitted.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Report #{rep.id} · Q-ID: {rep.questionId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-slate-800 font-semibold">{rep.questionStem}</p>
                    <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                      <strong>Issue:</strong> {rep.comment}
                    </p>

                    {rep.status === 'pending' && (
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => {
                            StorageService.resolveQuestionReport(rep.id, 'Verified and updated as per latest IS/IRC clause.');
                            setReports(StorageService.getQuestionReports());
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUESTION DETAIL & VERSION AUDIT DRAWER / MODAL */}
      {viewingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Question Record & Version History</h3>
                  <span className="text-[11px] font-mono text-slate-400">{viewingQuestion.question.id} · v{viewingQuestion.question.version}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingQuestion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Problem Statement</span>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {viewingQuestion.question.question_text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2.5 rounded-lg border ${viewingQuestion.question.correct_answer === 'A' ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-500 mr-1 font-bold">A.</span> {viewingQuestion.question.option_a}
                </div>
                <div className={`p-2.5 rounded-lg border ${viewingQuestion.question.correct_answer === 'B' ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-500 mr-1 font-bold">B.</span> {viewingQuestion.question.option_b}
                </div>
                {viewingQuestion.question.option_c && (
                  <div className={`p-2.5 rounded-lg border ${viewingQuestion.question.correct_answer === 'C' ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-500 mr-1 font-bold">C.</span> {viewingQuestion.question.option_c}
                  </div>
                )}
                {viewingQuestion.question.option_d && (
                  <div className={`p-2.5 rounded-lg border ${viewingQuestion.question.correct_answer === 'D' ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-500 mr-1 font-bold">D.</span> {viewingQuestion.question.option_d}
                  </div>
                )}
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900">Official Solution & Derivation:</span>
                <p className="text-slate-800 leading-relaxed font-serif">
                  {viewingQuestion.question.explanation || 'No detailed explanation attached.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Subject</span>
                  <span className="font-bold text-slate-800">{viewingQuestion.question.subject_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Codal Reference</span>
                  <span className="font-bold text-amber-800">{viewingQuestion.question.is_code_reference || 'Standard IS'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Verification</span>
                  <span className="font-bold text-emerald-700">{viewingQuestion.question.verification_status}</span>
                </div>
              </div>

              {/* Version History Audit Log */}
              {viewingQuestion.versions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                    <History className="w-3 h-3 text-slate-500" />
                    <span>Revision History ({viewingQuestion.versions.length} revisions)</span>
                  </span>
                  <div className="space-y-2">
                    {viewingQuestion.versions.map((v) => (
                      <div key={v.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">Version #{v.version_number} by {v.changed_by.split('@')[0]}</span>
                          <span className="text-slate-400">{new Date(v.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600">Reason: {v.change_reason || 'Manual modification'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const q = viewingQuestion.question;
                  setViewingQuestion(null);
                  handleOpenEdit(q);
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
              >
                Edit Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT QUESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>{editingQuestion ? 'Edit Question & Record Version' : 'Add New Civil Engineering MCQ'}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    {SUBJECTS_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="easy">Easy (JE Diploma)</option>
                    <option value="medium">Medium (AE Degree)</option>
                    <option value="hard">Hard (Advanced ESE)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Verification Status</label>
                  <select
                    value={formVerificationStatus}
                    onChange={(e) => setFormVerificationStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="verified">Verified (Active in Mock Tests)</option>
                    <option value="unverified">Unverified</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Question Statement / Problem Stem *</label>
                <textarea
                  required
                  rows={3}
                  value={formStem}
                  onChange={(e) => setFormStem(e.target.value)}
                  placeholder="Enter clear, unambiguous Civil Engineering problem statement..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Option A *</label>
                  <input
                    required
                    type="text"
                    value={formOptionA}
                    onChange={(e) => setFormOptionA(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Option B *</label>
                  <input
                    required
                    type="text"
                    value={formOptionB}
                    onChange={(e) => setFormOptionB(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Option C</label>
                  <input
                    type="text"
                    value={formOptionC}
                    onChange={(e) => setFormOptionC(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Option D</label>
                  <input
                    type="text"
                    value={formOptionD}
                    onChange={(e) => setFormOptionD(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correct Answer *</label>
                  <select
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-400 rounded-lg font-bold text-emerald-800"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">IS / IRC Code Clause</label>
                  <input
                    type="text"
                    value={formCodeRef}
                    onChange={(e) => setFormCodeRef(e.target.value)}
                    placeholder="e.g. IS 456:2000 Cl. 26.5.1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exam Target</label>
                  <select
                    value={formExamId}
                    onChange={(e) => setFormExamId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    {EXAM_CATALOGUE.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Technical Explanation & Derivation</label>
                <textarea
                  rows={3}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Provide step-by-step mathematical reasoning and codal justification..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 text-xs font-medium"
                />
              </div>

              {editingQuestion && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason for Revision (Audit Log)</label>
                  <input
                    type="text"
                    value={formChangeReason}
                    onChange={(e) => setFormChangeReason(e.target.value)}
                    placeholder="e.g. Updated formula as per Amendment 4 to IS 456"
                    className="w-full px-3 py-2 bg-amber-50/60 border border-amber-300 rounded-lg text-xs"
                  />
                </div>
              )}

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-xs"
                >
                  {editingQuestion ? 'Save Revision' : 'Add to Question Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CATEGORIZE MODAL */}
      {showBulkCategorizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <span>Bulk Categorize {selectedQuestionIds.length} Questions</span>
              </h3>
              <button
                onClick={() => setShowBulkCategorizeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkCategorizeSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Change Subject</label>
                <select
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="">(Keep Existing Subject)</option>
                  {SUBJECTS_LIST.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Change Exam Target</label>
                <select
                  value={bulkExam}
                  onChange={(e) => setBulkExam(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="">(Keep Existing Exam)</option>
                  {EXAM_CATALOGUE.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Change Difficulty</label>
                <select
                  value={bulkDifficulty}
                  onChange={(e) => setBulkDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="">(Keep Existing Difficulty)</option>
                  <option value="easy">Easy (Diploma)</option>
                  <option value="medium">Medium (Degree AE)</option>
                  <option value="hard">Hard (Advanced)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBulkCategorizeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-white shadow-xs"
                >
                  Apply to {selectedQuestionIds.length} Items
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT AUDIT HISTORY MODAL */}
      <AdminImportHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};
