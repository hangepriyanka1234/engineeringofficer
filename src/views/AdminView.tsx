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
  BookOpen,
  Github,
  Sparkles,
  HardDrive,
  UserCheck,
  CheckCircle,
  Activity,
  DollarSign,
  Smartphone,
  Flame
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
import { AdminGitHubPlayStoreManager } from '../components/AdminGitHubPlayStoreManager';
import { AdminFirebaseManager } from '../components/AdminFirebaseManager';
import { AdminEBooksNotesManager } from '../components/AdminEBooksNotesManager';
import { QuestionPaperStudio } from '../components/admin/QuestionPaperStudio';

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
    | 'question-paper-studio'
    | 'github-playstore'
    | 'firebase'
    | 'supabase-realtime'
    | 'payments'
    | 'ebooks-notes'
    | 'questions'
    | 'pyqs'
    | 'notices'
    | 'exam-catalogue'
    | 'syllabus'
    | 'mocks'
    | 'database'
    | 'ai-gateway'
    | 'storage'
    | 'students-audit'
    | 'release-gate'
    | 'security'
  >('question-paper-studio');

  const securityLogs = StorageService.getSecurityLogs();

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="bg-[#0F2744] text-white rounded-xl border border-sky-500/30 p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase">
              SUPER ADMIN CONSOLE (BY MH)
            </span>
            <span className="text-xs text-sky-400 font-mono">v1.0 Production</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Engineering Officer BY MH — Platform Control Center</span>
          </h1>
          <p className="text-xs text-slate-300">
            Control GitHub Sync & Play Store .AAB builds, Firebase Architecture & Storage, Supabase 24/7 Keep-Alive, ₹299 Razorpay monetization, and 23 Technical & Non-Technical Subject Banks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-lg border border-sky-500/20">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-200">
              {questions.length} MCQs · {notices.length} Notices
            </span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'question-paper-studio', label: '★ QUESTION PAPER STUDIO', icon: Sparkles, count: 'STUDIO' },
          { id: 'github-playstore', label: 'GitHub & Play Store (.AAB)', icon: Github, count: 'Play Store' },
          { id: 'firebase', label: 'Firebase Architecture & Usage', icon: Flame, count: 'Cloud Active' },
          { id: 'supabase-realtime', label: 'Supabase Real-Time & Keep-Alive', icon: Database, count: '24/7 Active' },
          { id: 'payments', label: 'Razorpay & ₹299 Plans', icon: DollarSign, count: 'Live' },
          { id: 'ebooks-notes', label: 'E-Books & Notes Studio (अर्थशास्त्र & All)', icon: BookOpen, count: materials.length },
          { id: 'questions', label: 'Question Bank CRUD (All Subjects)', icon: Target, count: questions.length },
          { id: 'pyqs', label: 'PYQ Papers & Provenance (2011-2024)', icon: ShieldCheck, count: '2011-24' },
          { id: 'notices', label: 'Recruitment Notices CMS', icon: Briefcase, count: notices.length },
          { id: 'exam-catalogue', label: 'Exam Profiles (CEA, JE, AE)', icon: Layers, count: 14 },
          { id: 'syllabus', label: 'Syllabus Tree (23 Tech & Non-Tech Subjects)', icon: BookOpen, count: 23 },
          { id: 'mocks', label: 'CBT Mock Tests', icon: FileCheck2, count: mockTests.length },
          { id: 'database', label: 'DB & Quota Optimizer', icon: Database, count: '2k Users' },
          { id: 'ai-gateway', label: 'AI Gateway & Costs', icon: Sparkles, count: 'INR Cap' },
          { id: 'storage', label: 'Storage & Media', icon: HardDrive, count: 'Signed' },
          { id: 'students-audit', label: 'Students & Audit Logs', icon: UserCheck, count: 'Super' },
          { id: 'release-gate', label: 'Release Gate & Load Test', icon: Activity, count: 'Pass' },
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
                  ? 'border-sky-600 text-sky-600 bg-white shadow-xs'
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

      {/* Premier Tab: Question Paper Studio */}
      {activeTab === 'question-paper-studio' && (
        <QuestionPaperStudio onDataModified={onDataModified} />
      )}

      {/* Tab 1: GitHub & Google Play Store (.AAB) Manager */}
      {activeTab === 'github-playstore' && (
        <AdminGitHubPlayStoreManager />
      )}

      {/* Tab 2: Firebase Architecture & Service Usage Inspector */}
      {activeTab === 'firebase' && (
        <AdminFirebaseManager />
      )}

      {/* Tab 3: Supabase Real-Time Monitor & Keep-Alive */}
      {activeTab === 'supabase-realtime' && (
        <AdminSupabaseConnector />
      )}

      {/* Tab 4: Monetization & Razorpay Plans */}
      {activeTab === 'payments' && (
        <AdminPaymentDashboard />
      )}

      {/* Tab: E-Books & E-Notes Studio (अर्थशास्त्र & All Subjects) */}
      {activeTab === 'ebooks-notes' && (
        <AdminEBooksNotesManager materials={materials} onDataModified={onDataModified} />
      )}

      {/* Tab 5: Question Bank (All Subjects, Technical + Non-Technical, CEA & Engineering) */}
      {activeTab === 'questions' && (
        <AdminQuestionBankManager onDataModified={onDataModified} />
      )}

      {/* Tab 6: Official PYQ Provenance & Approval Queue */}
      {activeTab === 'pyqs' && (
        <AdminPYQProvenanceManager onDataModified={onDataModified} />
      )}

      {/* Tab 7: Recruitment Notices CMS */}
      {activeTab === 'notices' && (
        <AdminRecruitmentCMS onDataModified={onDataModified} />
      )}

      {/* Tab 8: Exam Catalogue & Post Profiles */}
      {activeTab === 'exam-catalogue' && (
        <AdminExamCatalogueManager onDataModified={onDataModified} />
      )}

      {/* Tab 9: Syllabus Tree Controller */}
      {activeTab === 'syllabus' && (
        <AdminSyllabusManager onDataModified={onDataModified} />
      )}

      {/* Tab 10: CBT Mock Tests */}
      {activeTab === 'mocks' && (
        <AdminMockTestManager actorEmail="admin@sp-engineering.gov.in" />
      )}

      {/* Tab 11: DB & Quota Optimizer */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <AdminSupabaseConnector />
          <AdminDatabaseOptimizer />
        </div>
      )}

      {/* Tab 12: AI Gateway & Cost Control */}
      {activeTab === 'ai-gateway' && (
        <AdminAIGatewayManager />
      )}

      {/* Tab 13: Storage & Media Engine */}
      {activeTab === 'storage' && (
        <AdminStorageMediaManager />
      )}

      {/* Tab 14: Students Management & Super Admin Audit */}
      {activeTab === 'students-audit' && (
        <AdminStudentsAuditManager />
      )}

      {/* Tab 15: Release Gate Audit & Load Testing */}
      {activeTab === 'release-gate' && (
        <AdminReleaseGateAudit />
      )}

      {/* Tab 16: Anti-Fraud & Security Logs */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Security, Tamper Detection & Fraud Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User / Actor</th>
                  <th className="p-3">Security Event</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {securityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      No suspicious activity detected. Platform integrity verified.
                    </td>
                  </tr>
                ) : (
                  securityLogs.map((log: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="p-3 font-medium text-slate-800">{log.userId}</td>
                      <td className="p-3 font-semibold text-rose-600">{log.event}</td>
                      <td className="p-3 text-slate-600">{log.details}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                          High
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
