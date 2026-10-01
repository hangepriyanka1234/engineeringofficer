import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Archive,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  GraduationCap,
  Clock,
  Award,
  Trash2,
  X,
  Save,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ScalableExamCatalogueItem, ExamCategoryType, ExamActiveStatus } from '../types/examHub';
import { ExamHubService } from '../services/examHubService';

interface AdminExamCatalogueManagerProps {
  onClose?: () => void;
}

export const AdminExamCatalogueManager: React.FC<AdminExamCatalogueManagerProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategoryType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [exams, setExams] = useState<ScalableExamCatalogueItem[]>(ExamHubService.getExams());
  const [editingExam, setEditingExam] = useState<Partial<ScalableExamCatalogueItem> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categories: ExamCategoryType[] = [
    'Central Government',
    'Maharashtra Government',
    'Other State Government',
    'PSU / Technical Recruitment',
    'Railway / Infrastructure',
    'Municipal / Local Government',
    'GATE / Higher Technical Exams',
    'Other Engineering Recruitment',
  ];

  const refreshList = () => {
    setExams(ExamHubService.getExams(selectedCategory, searchQuery));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateNew = () => {
    setEditingExam({
      id: `exam_${Date.now()}`,
      exam_name: '',
      short_name: '',
      authority: '',
      department: '',
      category: 'Maharashtra Government',
      state_or_central: 'Maharashtra',
      qualification: 'Both',
      diploma_eligible: true,
      degree_eligible: true,
      official_website: 'https://mpsc.gov.in',
      official_notification_url: 'https://mpsc.gov.in',
      exam_pattern: 'Objective CBT Exam (100 Qs / 200 Marks)',
      duration: 120,
      marks: 200,
      negative_marking: '0.25 (1/4th)',
      subjects: ['SOM', 'RCC', 'Steel', 'Soil Mechanics', 'Fluid Mechanics', 'Surveying'],
      syllabus: 'Standard Civil Engineering Technical Syllabus',
      active_status: 'ACTIVE',
      last_verified_date: new Date().toISOString().split('T')[0],
      active_recruitments_count: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (exam: ScalableExamCatalogueItem) => {
    setEditingExam({ ...exam });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingExam?.exam_name || !editingExam?.short_name || !editingExam?.authority) {
      alert('कृपया परीक्षेचे नाव, Short Name आणि अधिकृत प्राधिकरणाची नाव प्रविष्ट करा.');
      return;
    }

    ExamHubService.saveExam(editingExam as ScalableExamCatalogueItem);
    showToast('परीक्षा कॅटलॉग यशस्वीरित्या जतन केली!');
    setShowModal(false);
    refreshList();
  };

  const handleToggleArchive = (id: string) => {
    ExamHubService.toggleArchiveExam(id);
    showToast('परीक्षा स्थिती अपडेट केली.');
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (confirm('ही परीक्षा कॅटलॉग मधून कायमची हटवायची आहे का?')) {
      ExamHubService.deleteExam(id);
      showToast('परीक्षा हटवली.');
      refreshList();
    }
  };

  const filteredExams = exams.filter((e) => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.exam_name.toLowerCase().includes(q) ||
        e.short_name.toLowerCase().includes(q) ||
        e.authority.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Admin Exam Catalogue Control Panel</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Scalable Civil Engineering Exam Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            भारतातील सर्व ८ प्रवर्गांतील इंजिनिअरिंग परीक्षांचे डायनॅमिक व्यवस्थापन व अपडेट
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>नवीन परीक्षा जोडा (Add Exam)</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            सर्व परीक्षा (All 8 Categories)
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="परीक्षा शोधा (उदा. MPSC Civil, SSC JE, BMC Sub Engineer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Exam Table / List */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono font-semibold uppercase">
            <tr>
              <th className="p-3">Exam / Department</th>
              <th className="p-3">Category</th>
              <th className="p-3">Eligibility</th>
              <th className="p-3">Pattern & Marks</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredExams.map((ex) => (
              <tr key={ex.id} className="hover:bg-slate-900/60 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-white text-sm">{ex.exam_name}</div>
                  <div className="text-[11px] text-sky-400 font-mono">
                    {ex.short_name} • {ex.authority}
                  </div>
                  <div className="text-[10px] text-slate-500">{ex.department}</div>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {ex.category}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{ex.qualification}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Diploma: {ex.diploma_eligible ? '✅' : '❌'} | Degree: {ex.degree_eligible ? '✅' : '❌'}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-semibold">{ex.marks} Marks • {ex.duration} Mins</div>
                  <div className="text-[10px] text-slate-400">Neg: {ex.negative_marking}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ex.active_status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : ex.active_status === 'ARCHIVED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {ex.active_status}
                  </span>
                  <div className="text-[9px] text-slate-500 mt-1">Verified: {ex.last_verified_date}</div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(ex)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400"
                      title="Edit Exam"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(ex.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                      title={ex.active_status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ex.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-400"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Exam Modal */}
      {showModal && editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingExam.id?.startsWith('exam_') ? 'नवीन परीक्षा जोडा' : 'परीक्षा एडिट करा'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Exam Full Name *</label>
                <input
                  type="text"
                  value={editingExam.exam_name || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, exam_name: e.target.value })}
                  placeholder="उदा. MPSC Civil Engineering Services"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Short Name *</label>
                <input
                  type="text"
                  value={editingExam.short_name || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, short_name: e.target.value })}
                  placeholder="उदा. MPSC Civil AE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Conducting Authority *</label>
                <input
                  type="text"
                  value={editingExam.authority || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, authority: e.target.value })}
                  placeholder="उदा. Maharashtra Public Service Commission"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={editingExam.department || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, department: e.target.value })}
                  placeholder="उदा. Public Works Department (PWD)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Exam Category</label>
                <select
                  value={editingExam.category}
                  onChange={(e) => setEditingExam({ ...editingExam, category: e.target.value as ExamCategoryType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Qualification Eligibility</label>
                <select
                  value={editingExam.qualification}
                  onChange={(e) => {
                    const q = e.target.value as 'Diploma' | 'Degree' | 'Both';
                    setEditingExam({
                      ...editingExam,
                      qualification: q,
                      diploma_eligible: q === 'Diploma' || q === 'Both',
                      degree_eligible: q === 'Degree' || q === 'Both',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  <option value="Both">Diploma & Degree Both</option>
                  <option value="Diploma">Diploma Only</option>
                  <option value="Degree">Degree Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Total Marks & Duration (Mins)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={editingExam.marks || 200}
                    onChange={(e) => setEditingExam({ ...editingExam, marks: Number(e.target.value) })}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    placeholder="Marks"
                  />
                  <input
                    type="number"
                    value={editingExam.duration || 120}
                    onChange={(e) => setEditingExam({ ...editingExam, duration: Number(e.target.value) })}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    placeholder="Mins"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Negative Marking Ratio</label>
                <input
                  type="text"
                  value={editingExam.negative_marking || '0.25 (1/4th)'}
                  onChange={(e) => setEditingExam({ ...editingExam, negative_marking: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Official Website URL</label>
                <input
                  type="text"
                  value={editingExam.official_website || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, official_website: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Exam Pattern & Syllabus Summary</label>
                <textarea
                  value={editingExam.exam_pattern || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, exam_pattern: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                रद्द करा
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
