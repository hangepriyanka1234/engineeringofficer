import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  Search,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Filter
} from 'lucide-react';
import { AdminOperationsService, ManagedStudent, AdminAuditLog } from '../services/adminOperationsService';

export const AdminStudentsAuditManager: React.FC = () => {
  const [students, setStudents] = useState<ManagedStudent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Sub-tab: 'students' vs 'audit'
  const [subTab, setSubTab] = useState<'students' | 'audit'>('students');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    student?: ManagedStudent;
    secret: string;
    error?: string;
    loading?: boolean;
  }>({ open: false, secret: '' });

  useEffect(() => {
    loadData();
  }, [search, tierFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, logs] = await Promise.all([
        AdminOperationsService.getStudents(search, tierFilter),
        AdminOperationsService.getAuditLogs(),
      ]);
      setStudents(s);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin students & audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = async (email: string, newTier: 'free' | 'pro' | 'master') => {
    try {
      await AdminOperationsService.updateStudentTier(email, newTier, 'admin@enggbysp.com', 'super_admin');
      await loadData();
    } catch (err) {
      console.error('Failed to update student tier', err);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteModal.student) return;
    setDeleteModal((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const res = await AdminOperationsService.deleteStudent(
        deleteModal.student.email,
        'admin@enggbysp.com',
        'super_admin',
        deleteModal.secret
      );

      if (res.success) {
        setDeleteModal({ open: false, secret: '' });
        await loadData();
      } else {
        setDeleteModal((prev) => ({ ...prev, loading: false, error: res.message }));
      }
    } catch (err: any) {
      setDeleteModal((prev) => ({ ...prev, loading: false, error: err.message || 'Operation failed' }));
    }
  };

  const exportStudentsCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Tier', 'Questions Solved', 'Accuracy %', 'Joined Date', 'Status'];
    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      s.email,
      s.tier,
      s.totalQuestionsSolved,
      s.accuracyPercent,
      s.joinedAt,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Sub navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubTab('students')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'students' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Registered Students ({students.length})
          </button>
          <button
            onClick={() => setSubTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'audit' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Audit Trail Logs ({auditLogs.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {subTab === 'students' && (
            <button
              onClick={exportStudentsCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {subTab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free Aspirant</option>
                <option value="pro">Blueprint Pro</option>
                <option value="master">Officer Master</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Plan Tier</th>
                  <th className="p-3">Solved</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Role Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-900">{std.name}</td>
                    <td className="p-3 font-mono text-slate-600">{std.email}</td>
                    <td className="p-3">
                      <select
                        value={std.tier}
                        onChange={(e) => handleTierChange(std.email, e.target.value as any)}
                        className={`px-2 py-1 rounded text-xs font-bold border ${
                          std.tier === 'master'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : std.tier === 'pro'
                            ? 'bg-sky-50 text-sky-800 border-sky-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="free">FREE</option>
                        <option value="pro">PRO</option>
                        <option value="master">MASTER</option>
                      </select>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{std.totalQuestionsSolved}</td>
                    <td className="p-3 font-mono font-semibold text-emerald-700">{std.accuracyPercent}%</td>
                    <td className="p-3">
                      {std.isSuperAdmin ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          SUPER ADMIN (PROTECTED)
                        </span>
                      ) : std.isAdmin ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">STUDENT</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!std.isAdmin && !std.isSuperAdmin && (
                        <button
                          onClick={() => setDeleteModal({ open: true, student: std, secret: '' })}
                          className="px-2.5 py-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-600" />
              <span>Immutable Administrative Mutation Audit Trail</span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor Email</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-sans font-medium text-slate-800">{log.actorEmail}</td>
                    <td className="p-3 font-bold text-sky-700">{log.action}</td>
                    <td className="p-3 text-slate-600">[{log.targetType}] {log.targetId}</td>
                    <td className="p-3 font-sans text-slate-700">{log.details}</td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Protected Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.student && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-300">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-sm">Protected Student Account Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to permanently delete <strong>{deleteModal.student.name}</strong> ({deleteModal.student.email}).
              This will remove their mistake notebook, test attempts, and study analytics.
            </p>

            {deleteModal.error && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {deleteModal.error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Type secret token <code className="text-rose-600 bg-slate-100 px-1 py-0.5 rounded">CONFIRM_DELETE_STUDENT_2026</code> to confirm:
              </label>
              <input
                type="text"
                value={deleteModal.secret}
                onChange={(e) => setDeleteModal({ ...deleteModal, secret: e.target.value })}
                placeholder="CONFIRM_DELETE_STUDENT_2026"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, secret: '' })}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.loading || deleteModal.secret !== 'CONFIRM_DELETE_STUDENT_2026'}
                onClick={handleDeleteStudent}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                {deleteModal.loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Deletion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
