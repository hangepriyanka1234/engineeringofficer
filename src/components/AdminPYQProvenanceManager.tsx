import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Edit3,
  Clock,
  GitBranch,
  RotateCcw,
  Plus,
  RefreshCw,
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen
} from 'lucide-react';
import {
  PYQItem,
  PYQVerificationStatus,
  ExamTargetId,
  SubjectId
} from '../types';
import { PyqService, PYQQueryParams } from '../services/pyqService';
import { EXAM_CATALOGUE, SUBJECTS_LIST } from '../data/mockData';
import { ExamBadge } from './common/ExamBadge';

interface AdminPYQProvenanceManagerProps {
  onDataModified?: () => void;
}

export const AdminPYQProvenanceManager: React.FC<AdminPYQProvenanceManagerProps> = ({
  onDataModified
}) => {
  const [questions, setQuestions] = useState<PYQItem[]>([]);
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals state
  const [approvingQuestion, setApprovingQuestion] = useState<PYQItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<PYQItem | null>(null);
  const [viewingHistoryQuestion, setViewingHistoryQuestion] = useState<PYQItem | null>(null);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Approval Form State
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [verifiedBy, setVerifiedBy] = useState<string>('Er. S. Patil (Executive Admin & Head Faculty)');
  const [verifiedKeyRef, setVerifiedKeyRef] = useState<string>('');
  const [correctedOption, setCorrectedOption] = useState<number>(0);
  const [isCodeRef, setIsCodeRef] = useState<string>('');

  // Edit Form State
  const [editStem, setEditStem] = useState<string>('');
  const [editOptions, setEditOptions] = useState<string[]>(['', '', '', '']);
  const [editExplanation, setEditExplanation] = useState<string>('');
  const [editChangeSummary, setEditChangeSummary] = useState<string>('');

  // Bulk Import Form State
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await PyqService.getPYQs({
        query: searchQuery,
        status: statusFilter,
        examTargetId: examFilter,
        pageSize: 50
      });
      setQuestions(res.questions);
      setCountsByStatus(res.countsByStatus);
    } catch (err) {
      console.error('Failed to load PYQs for admin review:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, examFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenApproveModal = (q: PYQItem) => {
    setApprovingQuestion(q);
    setApprovalNotes(q.adminApprovalNotes || `Verified against official master answer key.`);
    setVerifiedBy(q.verifiedBy || 'Er. S. Patil (Executive Admin & Head Faculty)');
    setVerifiedKeyRef(q.sourceProvenance.verifiedKeyRef || `Official Key Series ${q.sourceProvenance.officialBookletSeries || 'A'} Q.${q.questionNumber}`);
    setCorrectedOption(q.correctOption);
    setIsCodeRef(q.isCodeReference || '');
  };

  const handleConfirmApproval = async () => {
    if (!approvingQuestion) return;
    try {
      await PyqService.approvePYQ(approvingQuestion.id, {
        verifiedBy,
        adminApprovalNotes: approvalNotes,
        verifiedKeyRef,
        isCodeReference: isCodeRef,
        correctedOption
      });
      setActionSuccessMessage(`Question ${approvingQuestion.id} successfully verified & approved as Official PYQ.`);
      setApprovingQuestion(null);
      loadData();
      if (onDataModified) onDataModified();
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (q: PYQItem) => {
    const reason = prompt('Enter reason for rejecting this question from official PYQ library:', 'Question paper scan ambiguity or unverified source');
    if (!reason) return;
    try {
      await PyqService.rejectPYQ(q.id, reason);
      setActionSuccessMessage(`Question ${q.id} marked as rejected.`);
      loadData();
      if (onDataModified) onDataModified();
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleOpenEditModal = (q: PYQItem) => {
    setEditingQuestion(q);
    setEditStem(q.stem);
    setEditOptions([...q.options]);
    setEditExplanation(q.explanation);
    setEditChangeSummary('Refined technical explanation and IS code clauses.');
  };

  const handleConfirmEdit = async () => {
    if (!editingQuestion) return;
    try {
      await PyqService.updatePYQ(
        editingQuestion.id,
        {
          stem: editStem,
          options: editOptions,
          explanation: editExplanation,
        },
        editChangeSummary || 'Administrative content revision.'
      );
      setActionSuccessMessage(`Question ${editingQuestion.id} updated and version history preserved.`);
      setEditingQuestion(null);
      loadData();
      if (onDataModified) onDataModified();
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Update error: ${err.message}`);
    }
  };

  const handleRollback = async (qId: string, versionStr: string) => {
    if (!confirm(`Are you sure you want to rollback question ${qId} to version ${versionStr}?`)) return;
    try {
      await PyqService.rollbackPYQ(qId, versionStr);
      setActionSuccessMessage(`Question rolled back to version ${versionStr}.`);
      setViewingHistoryQuestion(null);
      loadData();
      if (onDataModified) onDataModified();
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Rollback error: ${err.message}`);
    }
  };

  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const res = await PyqService.importQuestions(items);
      setActionSuccessMessage(`Imported ${res.importedCount} questions into staging queue.`);
      setShowImportModal(false);
      setImportJsonText('');
      loadData();
      if (onDataModified) onDataModified();
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      setImportError(`Invalid JSON format or error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Provenance Policy */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Official PYQ Provenance Audit & Verification Engine
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Strict Quality Gate: Questions remain in <strong>Unverified / Staging</strong> status with clear student warnings until an administrator validates the official question paper scan, conducting body notification, and final revised key.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Import PYQ Batch</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audit Stats Tally */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">TOTAL IN DATABASE</span>
            <span className="text-xl font-bold text-slate-900 font-mono">{countsByStatus.all || 0}</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              OFFICIAL VERIFIED
            </span>
            <span className="text-xl font-bold text-emerald-800 font-mono">
              {countsByStatus.official_verified || 0}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-700 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              AWAITING ADMIN AUDIT
            </span>
            <span className="text-xl font-bold text-amber-800 font-mono">
              {(countsByStatus.under_review || 0) + (countsByStatus.unverified || 0)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-700 block flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              REJECTED / INVALID
            </span>
            <span className="text-xl font-bold text-rose-800 font-mono">{countsByStatus.rejected || 0}</span>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by question stem, topic, IS code, booklet series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Verification Statuses</option>
            <option value="under_review">Awaiting Review / Staged</option>
            <option value="official_verified">Official Verified</option>
            <option value="unverified">Unverified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Exam Cadres</option>
            {EXAM_CATALOGUE.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Review Table / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
            Loading previous year questions for administrative review...
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 text-xs">
            No questions found matching your filter criteria.
          </div>
        ) : (
          questions.map((q) => {
            const isVerified = q.verificationStatus === 'official_verified';
            const isPending = q.verificationStatus === 'under_review' || q.verificationStatus === 'unverified';
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                id={`admin-pyq-${q.id}`}
                className={`bg-white rounded-xl border transition-all ${
                  isVerified
                    ? 'border-slate-200 hover:border-emerald-300'
                    : isPending
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-rose-200 bg-rose-50/10'
                }`}
              >
                <div className="p-4">
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <ExamBadge examId={q.examTargetId} />
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {q.year} · {q.paper}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Q.{q.questionNumber}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isVerified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>OFFICIAL VERIFIED PYQ</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>AWAITING ADMIN AUDIT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>REJECTED</span>
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-slate-400">
                        v{q.versionHistory[q.versionHistory.length - 1]?.version || '1.0'}
                      </span>
                    </div>
                  </div>

                  {/* Stem */}
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {q.stem}
                  </p>

                  {/* Provenance summary badge */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Award className="w-3.5 h-3.5 text-sky-600" />
                      {q.sourceProvenance.conductingBody}
                    </span>
                    {q.sourceProvenance.officialBookletSeries && (
                      <span className="font-mono text-slate-600">
                        Series: {q.sourceProvenance.officialBookletSeries}
                      </span>
                    )}
                    {q.verifiedBy && (
                      <span className="text-emerald-700 font-medium">
                        Auditor: {q.verifiedBy}
                      </span>
                    )}
                    {q.isCodeReference && (
                      <span className="text-sky-700 font-medium">
                        {q.isCodeReference}
                      </span>
                    )}
                  </div>

                  {/* Quick Expand Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 text-xs">
                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctOption;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                                isCorrect
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                                  : 'border-slate-200 bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="font-mono w-5 h-5 rounded-full flex items-center justify-center bg-white border border-slate-200 text-[11px]">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isCorrect && (
                                <span className="text-[10px] uppercase font-bold text-emerald-700 px-1.5 py-0.5 rounded bg-white">
                                  Official Key
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation & Codal Reference */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Official Solution & Codal Verification
                        </span>
                        <p className="text-slate-700 text-xs leading-relaxed">{q.explanation}</p>
                        {q.formula && (
                          <div className="font-mono text-[11px] text-sky-800 bg-sky-50 px-2 py-1 rounded inline-block">
                            Formula: {q.formula}
                          </div>
                        )}
                      </div>

                      {/* Full Provenance Audit Sheet */}
                      <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] space-y-1">
                        <div className="text-sky-400 font-bold uppercase tracking-wider text-[10px]">
                          Master Provenance Audit Record
                        </div>
                        <div><strong>Conducting Body:</strong> {q.sourceProvenance.conductingBody}</div>
                        <div><strong>Official Key Notification:</strong> {q.sourceProvenance.officialKeyNotification || 'Direct Notification Gazette'}</div>
                        <div><strong>Master Key Ref:</strong> {q.sourceProvenance.verifiedKeyRef || 'Verified from candidate response key'}</div>
                        <div><strong>Admin Notes:</strong> {q.adminApprovalNotes || 'Standard verification'}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Hide Full Solution' : 'Inspect Solution & Options'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewingHistoryQuestion(q)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1"
                        title="View Version Changelog"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                        <span>History ({q.versionHistory.length})</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleReject(q)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-medium flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            onClick={() => handleOpenApproveModal(q)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Approve as Official PYQ</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Approve & Promote to Official Verified PYQ */}
      {approvingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Audit & Approve Official PYQ Provenance
                </h3>
              </div>
              <button
                onClick={() => setApprovingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-slate-900">{approvingQuestion.exam} ({approvingQuestion.year})</div>
              <div>{approvingQuestion.stem}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Confirmed Official Answer Key Option
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCorrectedOption(idx)}
                      className={`py-2 rounded-lg font-bold border text-center transition-all ${
                        correctedOption === idx
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Option {String.fromCharCode(65 + idx)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Verified Key Reference & Objection Committee Status
                </label>
                <input
                  type="text"
                  value={verifiedKeyRef}
                  onChange={(e) => setVerifiedKeyRef(e.target.value)}
                  placeholder="e.g. Final Revised Key Question 42 - Option A"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Applicable Indian Standard / IRC Code Clause
                </label>
                <input
                  type="text"
                  value={isCodeRef}
                  onChange={(e) => setIsCodeRef(e.target.value)}
                  placeholder="e.g. IS 456:2000 Cl. 26.5.1.1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Auditor Name & Credentials
                </label>
                <input
                  type="text"
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Administrative Approval Notes (Audited Changelog)
                </label>
                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovingQuestion(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish as Official Verified PYQ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Version History & Audit Trail */}
      {viewingHistoryQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Provenance & Content Version History
                </h3>
              </div>
              <button
                onClick={() => setViewingHistoryQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Question ID: <span className="font-mono font-bold text-slate-800">{viewingHistoryQuestion.id}</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {viewingHistoryQuestion.versionHistory.map((item, vIdx) => (
                <div key={vIdx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      v{item.version}
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.editedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-800">
                    Editor: {item.editorName} <span className="text-[10px] text-slate-500">({item.editorRole})</span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {item.changeSummary}
                  </p>

                  {item.previousValues && vIdx < viewingHistoryQuestion.versionHistory.length - 1 && (
                    <div className="pt-2 mt-2 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => handleRollback(viewingHistoryQuestion.id, item.version)}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback to this snapshot</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingHistoryQuestion(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white font-bold text-xs"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Question */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Edit PYQ Content & Bump Version
                </h3>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Question Problem Stem</label>
                <textarea
                  rows={3}
                  value={editStem}
                  onChange={(e) => setEditStem(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Options (A, B, C, D)</label>
                <div className="space-y-2">
                  {editOptions.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-2">
                      <span className="font-mono w-6 text-center text-slate-500">
                        {String.fromCharCode(65 + oIdx)}:
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...editOptions];
                          updated[oIdx] = e.target.value;
                          setEditOptions(updated);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Codal Solution</label>
                <textarea
                  rows={3}
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Changelog Summary (Saved to Version History)</label>
                <input
                  type="text"
                  value={editChangeSummary}
                  onChange={(e) => setEditChangeSummary(e.target.value)}
                  placeholder="e.g. Corrected typo in option B and updated IS code reference"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEdit}
                className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs"
              >
                Save & Bump Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Import Batch into Staging Queue */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Import New PYQs into Staging Queue
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-500">
              All imported questions are staged as <strong>Unverified / Under Review</strong>. They will never display as Official Verified until an administrator reviews their provenance and approves them.
            </p>

            <form onSubmit={handleImportJson} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">
                  Paste JSON Array of Questions
                </label>
                <textarea
                  rows={8}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`[
  {
    "exam": "Maharashtra PWD JE 2023",
    "examTargetId": "maha_pwd",
    "year": 2023,
    "paper": "Shift 2 CBT",
    "subject": "Fluid Mechanics",
    "subjectId": "fluid_mechanics",
    "topic": "Pipe Flow",
    "questionNumber": 22,
    "stem": "What is the Darcy-Weisbach friction factor for laminar flow in a circular pipe?",
    "options": ["64/Re", "16/Re", "0.079/Re^0.25", "32/Re"],
    "correctOption": 0,
    "explanation": "For laminar flow in pipes, f = 64/Re.",
    "difficulty": "easy"
  }
]`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {importError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {importError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                >
                  Import into Staging Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
