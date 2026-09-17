import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Briefcase,
  Target,
  FileCheck2,
  FileText,
  Users,
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Search,
  Layers,
  HardHat,
  Database,
  Lock,
  Download,
  BookOpen
} from 'lucide-react';
import {
  RecruitmentNotice,
  Question,
  MockTest,
  StudyMaterial,
  ExamTargetId,
  SubjectId
} from '../types';
import { EXAM_CATALOGUE, SUBJECTS_LIST } from '../data/mockData';
import { StorageService } from '../services/storageService';
import { AdminSyllabusManager } from '../components/AdminSyllabusManager';
import { AdminRecruitmentCMS } from '../components/AdminRecruitmentCMS';
import { AdminExamCatalogueManager } from '../components/AdminExamCatalogueManager';
import { AdminQuestionBankManager } from '../components/AdminQuestionBankManager';
import { AdminPYQProvenanceManager } from '../components/AdminPYQProvenanceManager';
import { AdminMockTestManager } from '../components/AdminMockTestManager';
import { AdminDatabaseOptimizer } from '../components/AdminDatabaseOptimizer';
import { AdminAIGatewayManager } from '../components/AdminAIGatewayManager';
import { AdminStorageMediaManager } from '../components/AdminStorageMediaManager';
import { AdminStudentsAuditManager } from '../components/AdminStudentsAuditManager';
import { AdminReleaseGateAudit } from '../components/AdminReleaseGateAudit';
import { AdminPaymentDashboard } from '../components/AdminPaymentDashboard';
import { AdminSupabaseConnector } from '../components/AdminSupabaseConnector';
import { Sparkles, HardDrive, UserCheck, CheckCircle, Activity, DollarSign } from 'lucide-react';

interface AdminViewProps {
  notices: RecruitmentNotice[];
  questions: Question[];
  mockTests: MockTest[];
  materials: StudyMaterial[];
  onDataModified: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  notices,
  questions,
  mockTests,
  materials,
  onDataModified,
}) => {
  const [activeTab, setActiveTab] = useState<
    'payments' | 'notices' | 'exam-catalogue' | 'syllabus' | 'questions' | 'pyqs' | 'mocks' | 'database' | 'ai-gateway' | 'storage' | 'students-audit' | 'release-gate' | 'security'
  >('payments');

  // Form states for adding Recruitment Notice
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [noticePostName, setNoticePostName] = useState('');
  const [noticeDeptName, setNoticeDeptName] = useState('');
  const [noticeAdvtNumber, setNoticeAdvtNumber] = useState('');
  const [noticeExamTarget, setNoticeExamTarget] = useState<ExamTargetId>('maha_pwd');
  const [noticeVacancies, setNoticeVacancies] = useState<number>(500);
  const [noticeEligibility, setNoticeEligibility] = useState('Diploma / Degree in Civil Engineering');
  const [noticeStatus, setNoticeStatus] = useState<'Active' | 'Upcoming' | 'Answer Key Out' | 'Result Declared'>('Active');
  const [noticeEndDate, setNoticeEndDate] = useState('2026-10-31');

  // Form states for adding Question
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [qText, setQText] = useState('');
  const [qSubjectId, setQSubjectId] = useState<SubjectId>('rcc');
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectOption, setQCorrectOption] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState('');
  const [qIsCode, setQIsCode] = useState('IS 456:2000');

  // Add Notice Handler
  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotice: RecruitmentNotice = {
      id: `notice-admin-${Date.now()}`,
      examTargetId: noticeExamTarget,
      postName: noticePostName,
      deptName: noticeDeptName,
      advtNumber: noticeAdvtNumber,
      totalVacancies: Number(noticeVacancies),
      eligibility: noticeEligibility,
      ageLimit: '18 - 38 Years',
      applyStartDate: '2026-09-01',
      applyEndDate: noticeEndDate,
      examDate: 'Tentative Dec 2026',
      status: noticeStatus,
      pdfNotificationUrl: '#',
      applyUrl: 'https://mahapwd.gov.in',
    };

    StorageService.addNotice(newNotice);
    onDataModified();
    setShowAddNoticeModal(false);
    alert('Recruitment notice added successfully!');
  };

  // Add Question Handler
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: Question = {
      id: `q-admin-${Date.now()}`,
      subjectId: qSubjectId,
      examTargetIds: ['maha_pwd', 'ssc_je'],
      text: qText,
      options: qOptions,
      correctOption: qCorrectOption,
      explanation: qExplanation,
      difficulty: qDifficulty,
      questionType: 'theoretical',
      isCodeReference: qIsCode,
    };

    StorageService.addQuestion(newQ);
    onDataModified();
    setShowAddQuestionModal(false);
    alert('New Civil Engineering MCQ added to question bank!');
  };

  const securityLogs = StorageService.getSecurityLogs();

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="bg-[#0F2744] text-white rounded-xl border border-sky-500/30 p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase">
              SUPER ADMIN CONSOLE
            </span>
            <span className="text-xs text-sky-400 font-mono">v1.0 Production</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Engineering Officer BY SP — Platform Control Center</span>
          </h1>
          <p className="text-xs text-slate-300">
            Manage official recruitment notices, question banks, CBT mock test configurations, and student security telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-lg border border-sky-500/20">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono text-slate-200">
            {questions.length} MCQs · {notices.length} Notices
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'payments', label: 'Monetization & Razorpay Plans', icon: DollarSign, count: 'Live' },
          { id: 'notices', label: 'Recruitment Notices CMS', icon: Briefcase, count: notices.length },
          { id: 'exam-catalogue', label: 'Exam & Post Profiles', icon: Layers, count: 12 },
          { id: 'syllabus', label: 'Syllabus Tree (21 Subjects)', icon: BookOpen, count: 21 },
          { id: 'questions', label: 'Question Bank CRUD', icon: Target, count: questions.length },
          { id: 'pyqs', label: 'PYQ Provenance & Audit Queue', icon: ShieldCheck, count: 'Audit' },
          { id: 'mocks', label: 'CBT Mock Tests', icon: FileCheck2, count: mockTests.length },
          { id: 'database', label: 'DB & Quota Optimizer (P29)', icon: Database, count: '2k Users' },
          { id: 'ai-gateway', label: 'AI Gateway & Costs (P30)', icon: Sparkles, count: 'INR Cap' },
          { id: 'storage', label: 'Storage & Media (P31)', icon: HardDrive, count: 'Signed' },
          { id: 'students-audit', label: 'Students & Audit Logs (P32)', icon: UserCheck, count: 'Super' },
          { id: 'release-gate', label: 'Release Gate & Load Test (P33)', icon: Activity, count: 'Pass' },
          { id: 'security', label: 'Anti-Fraud & Security Logs', icon: ShieldAlert, count: securityLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-sky-600 text-sky-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: Monetization & Razorpay */}
      {activeTab === 'payments' && (
        <AdminPaymentDashboard />
      )}

      {/* Tab Content: Recruitment Notices CMS */}
      {activeTab === 'notices' && (
        <AdminRecruitmentCMS onDataModified={onDataModified} />
      )}

      {/* Tab Content: Exam Catalogue & Post Profiles */}
      {activeTab === 'exam-catalogue' && (
        <AdminExamCatalogueManager onDataModified={onDataModified} />
      )}

      {/* Tab Content: Question Bank */}
      {activeTab === 'questions' && (
        <AdminQuestionBankManager onDataModified={onDataModified} />
      )}

      {/* Tab Content: Official PYQ Provenance & Approval Queue */}
      {activeTab === 'pyqs' && (
        <AdminPYQProvenanceManager onDataModified={onDataModified} />
      )}

      {/* Tab Content: Syllabus Tree Controller */}
      {activeTab === 'syllabus' && (
        <AdminSyllabusManager onDataModified={onDataModified} />
      )}

      {/* Tab Content: CBT Mock Tests */}
      {activeTab === 'mocks' && (
        <AdminMockTestManager actorEmail="admin@sp-engineering.gov.in" />
      )}

      {/* Tab Content: Part 29 DB & Quota Optimizer */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <AdminSupabaseConnector />
          <AdminDatabaseOptimizer />
        </div>
      )}


      {/* Tab Content: Part 30 AI Gateway & Cost Control */}
      {activeTab === 'ai-gateway' && (
        <AdminAIGatewayManager />
      )}

      {/* Tab Content: Part 31 Storage & Protected Media */}
      {activeTab === 'storage' && (
        <AdminStorageMediaManager />
      )}

      {/* Tab Content: Part 32 Students & Audit Logs */}
      {activeTab === 'students-audit' && (
        <AdminStudentsAuditManager />
      )}

      {/* Tab Content: Part 33 Production Release Gate & Load Testing */}
      {activeTab === 'release-gate' && (
        <AdminReleaseGateAudit />
      )}

      {/* Tab Content: Security & Anti-Fraud Logs */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>Real-Time CBT Anti-Fraud & Tab-Switch Audit Logs</span>
            </div>
            <p className="text-xs text-slate-500">
              Captures window blurs, unauthorized copy attempts, and multi-device sessions during live CBT mock examinations.
            </p>

            <div className="space-y-2 pt-2">
              {securityLogs.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">No fraud events recorded. System is secure.</div>
              ) : (
                securityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-rose-600">[{log.eventType}] </span>
                      <span className="text-slate-800">{log.details}</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-300">
            <h3 className="font-bold text-slate-900 text-base">Add Official Recruitment Notice</h3>
            <form onSubmit={handleSaveNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Post Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Engineer (Civil) - Group B Non-Gazetted"
                  value={noticePostName}
                  onChange={(e) => setNoticePostName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Public Works Department (PWD) Maharashtra"
                  value={noticeDeptName}
                  onChange={(e) => setNoticeDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advertisement No.</label>
                  <input
                    type="text"
                    required
                    placeholder="Advt 04/2026"
                    value={noticeAdvtNumber}
                    onChange={(e) => setNoticeAdvtNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Vacancies</label>
                  <input
                    type="number"
                    required
                    value={noticeVacancies}
                    onChange={(e) => setNoticeVacancies(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold"
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">Add Civil Engineering MCQ</h3>
            <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Statement</label>
                <textarea
                  required
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter objective question with technical units..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={qSubjectId}
                    onChange={(e) => setQSubjectId(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    {SUBJECTS_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IS / IRC Code Clause</label>
                  <input
                    type="text"
                    placeholder="e.g. IS 456:2000 Cl. 26.5"
                    value={qIsCode}
                    onChange={(e) => setQIsCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Options (A to D)</label>
                {qOptions.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="font-bold w-4 text-slate-600">{String.fromCharCode(65 + i)}:</span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + i)} text`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...qOptions];
                        copy[i] = e.target.value;
                        setQOptions(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                    <input
                      type="radio"
                      name="correctOption"
                      checked={qCorrectOption === i}
                      onChange={() => setQCorrectOption(i)}
                      title="Mark as correct answer"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Explanation & Calculation Proof</label>
                <textarea
                  required
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explain standard formula, codal limit, and step-by-step substitution..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
