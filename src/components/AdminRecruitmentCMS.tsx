import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Search,
  Building2,
  Calendar,
  Users,
  AlertTriangle,
  Send,
  Upload,
  ExternalLink,
  ShieldCheck,
  Archive,
  Eye,
  X,
  FileText,
  Clock,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { RecruitmentNotice, ExamTargetId } from '../types';
import { ExamBadge } from './common/ExamBadge';
import { StorageService } from '../services/storageService';
import { RecruitmentDetailModal } from './RecruitmentDetailModal';

interface AdminRecruitmentCMSProps {
  onDataModified: () => void;
}

export const AdminRecruitmentCMS: React.FC<AdminRecruitmentCMSProps> = ({ onDataModified }) => {
  const [notices, setNotices] = useState<RecruitmentNotice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Form states
  const [showModal, setShowModal] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [previewNotice, setPreviewNotice] = useState<RecruitmentNotice | null>(null);

  // Form fields
  const [postName, setPostName] = useState('');
  const [deptName, setDeptName] = useState('');
  const [examTargetId, setExamTargetId] = useState<ExamTargetId | string>('maha_pwd');
  const [advtNumber, setAdvtNumber] = useState('');
  const [totalVacancies, setTotalVacancies] = useState<number>(100);
  const [eligibility, setEligibility] = useState('');
  const [eligibilityType, setEligibilityType] = useState<'Diploma Only' | 'Degree Only' | 'Both Diploma & Degree'>('Both Diploma & Degree');
  const [diplomaEligible, setDiplomaEligible] = useState(true);
  const [degreeEligible, setDegreeEligible] = useState(true);
  const [experience, setExperience] = useState('Not required for freshers');
  const [ageLimit, setAgeLimit] = useState('18 to 38 Years (Age relaxation as per Govt rules)');
  const [ageRules, setAgeRules] = useState('OBC: +3 years, SC/ST: +5 years, Divyang: +10 years');
  const [categoryNotes, setCategoryNotes] = useState('Parallel reservation applicable for Women, Sports, and Ex-Servicemen.');
  const [salaryScale, setSalaryScale] = useState('Pay Matrix Level S-14: ₹38,600 - 1,22,800');
  const [paperPattern, setPaperPattern] = useState('Online CBT: 100 Questions, 200 Marks. (60 Qs Civil Engg, 40 Qs Non-Tech)');
  const [negativeMarking, setNegativeMarking] = useState('0.25 marks per wrong answer');
  const [questionCount, setQuestionCount] = useState<number>(100);
  const [duration, setDuration] = useState('120 Minutes (2 Hours)');
  const [stages, setStages] = useState('Stage 1: Computer Based Examination, Stage 2: Document Verification');
  const [subjectsCovered, setSubjectsCovered] = useState('Building Materials, SOM, RCC, Surveying, Highway, General Studies, Marathi, Reasoning');
  const [applyStartDate, setApplyStartDate] = useState('2026-09-01');
  const [applyEndDate, setApplyEndDate] = useState('2026-10-31');
  const [examDate, setExamDate] = useState('Tentative December 2026');
  const [admitCardDate, setAdmitCardDate] = useState('7 days before exam');
  const [resultDate, setResultDate] = useState('45 days after exam');
  const [officialSource, setOfficialSource] = useState('Official Government Portal');
  const [pdfNotificationUrl, setPdfNotificationUrl] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [status, setStatus] = useState<'Active' | 'Upcoming' | 'Answer Key Out' | 'Result Declared' | 'Archived'>('Active');
  const [districtOrState, setDistrictOrState] = useState('Maharashtra State');
  const [adminNotes, setAdminNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = () => {
    const list = StorageService.getRecruitmentNotices();
    setNotices(list);
  };

  const handleOpenAddModal = () => {
    setEditingNoticeId(null);
    setPostName('');
    setDeptName('');
    setExamTargetId('maha_pwd');
    setAdvtNumber('');
    setTotalVacancies(100);
    setEligibility('Diploma in Civil Engineering or B.E./B.Tech in Civil Engineering from a recognized institute.');
    setEligibilityType('Both Diploma & Degree');
    setDiplomaEligible(true);
    setDegreeEligible(true);
    setExperience('Freshers eligible (0 years experience required for Junior Engineer level)');
    setAgeLimit('18 to 38 Years (Age relaxation as per Govt rules)');
    setAgeRules('OBC: +3 years, SC/ST: +5 years, PwD: +10 years');
    setCategoryNotes('Parallel reservation applicable for Women (30%), Sports (5%), Ex-Servicemen (15%).');
    setSalaryScale('Pay Matrix Level S-14: ₹38,600 - 1,22,800');
    setPaperPattern('Online CBT: 100 Questions, 200 Marks. (60 Qs Civil Engg, 40 Qs Non-Tech)');
    setNegativeMarking('0.25 marks deducted per incorrect answer');
    setQuestionCount(100);
    setDuration('120 Minutes (2 Hours)');
    setStages('Stage 1: Computer Based Examination, Stage 2: Document Verification');
    setSubjectsCovered('Building Materials, SOM, RCC, Surveying, Highway Engg, General Studies, Reasoning');
    setApplyStartDate(new Date().toISOString().split('T')[0]);
    setApplyEndDate('2026-11-30');
    setExamDate('Tentative December 2026');
    setAdmitCardDate('7 days prior to examination');
    setResultDate('Within 45 days of CBT');
    setOfficialSource('https://mahapwd.gov.in / Official State Gazette');
    setPdfNotificationUrl('https://mahapwd.gov.in/notifications/pwd_je_2026.pdf');
    setApplyUrl('https://mahapwd.gov.in/careers');
    setStatus('Active');
    setDistrictOrState('Maharashtra State');
    setAdminNotes('Special focus on Building Materials, IS 456 RCC code provisions, and Maharashtra PWD Specifications.');
    setUploadedFileName('');
    setShowModal(true);
  };

  const handleOpenEditModal = (notice: RecruitmentNotice) => {
    setEditingNoticeId(notice.id);
    setPostName(notice.postName);
    setDeptName(notice.deptName);
    setExamTargetId(notice.examTargetId);
    setAdvtNumber(notice.advtNumber || notice.advertisementNumber || '');
    setTotalVacancies(notice.totalVacancies);
    setEligibility(Array.isArray(notice.eligibility) ? notice.eligibility.join(', ') : notice.eligibility);
    setEligibilityType(notice.eligibilityType || 'Both Diploma & Degree');
    setDiplomaEligible(notice.diplomaEligible !== false);
    setDegreeEligible(notice.degreeEligible !== false);
    setExperience(notice.experience || '');
    setAgeLimit(notice.ageLimit || '');
    setAgeRules(notice.ageRules || '');
    setCategoryNotes(notice.categoryNotes || '');
    setSalaryScale(notice.salaryScale || '');
    setPaperPattern(notice.paperPattern || '');
    setNegativeMarking(notice.negativeMarking || '');
    setQuestionCount(notice.questionCount || 100);
    setDuration(notice.duration || '120 Minutes');
    setStages(notice.stages ? notice.stages.join(', ') : '');
    setSubjectsCovered(notice.subjectsCovered ? notice.subjectsCovered.join(', ') : '');
    setApplyStartDate(notice.applyStartDate || '');
    setApplyEndDate(notice.applyEndDate || '');
    setExamDate(notice.examDate || notice.examDateEstimated || '');
    setAdmitCardDate(notice.admitCardDate || '');
    setResultDate(notice.resultDate || '');
    setOfficialSource(notice.officialSource || '');
    setPdfNotificationUrl(notice.officialPdfUrl || notice.pdfNotificationUrl || '');
    setApplyUrl(notice.applyOnlineUrl || notice.applyUrl || '');
    setStatus(notice.status);
    setDistrictOrState(notice.districtOrState || 'Maharashtra State');
    setAdminNotes(notice.adminNotes || notice.notes || '');
    setUploadedFileName('');
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      // Simulate file upload URL or data URL
      const mockUrl = URL.createObjectURL(file);
      setPdfNotificationUrl(mockUrl);
    }
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();

    if (!officialSource.trim()) {
      alert('Official Source is mandatory for every published recruitment notice. Never publish without verified official source.');
      return;
    }

    const noticePayload: RecruitmentNotice = {
      id: editingNoticeId || `notice-${Date.now()}`,
      examTargetId: examTargetId as any,
      postName,
      deptName,
      advtNumber,
      advertisementNumber: advtNumber,
      totalVacancies: Number(totalVacancies),
      eligibility,
      eligibilityType,
      diplomaEligible,
      degreeEligible,
      experience,
      ageLimit,
      ageRules,
      categoryNotes,
      salaryScale,
      paperPattern,
      negativeMarking,
      questionCount: Number(questionCount),
      duration,
      stages: stages.split(',').map((s) => s.trim()).filter(Boolean),
      subjectsCovered: subjectsCovered.split(',').map((s) => s.trim()).filter(Boolean),
      applyStartDate,
      applyEndDate,
      examDate,
      examDateEstimated: examDate,
      admitCardDate,
      resultDate,
      officialSource,
      officialPdfUrl: pdfNotificationUrl,
      pdfNotificationUrl,
      officialNotificationUrl: pdfNotificationUrl,
      applyUrl,
      applyOnlineUrl: applyUrl,
      status,
      districtOrState,
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      verifiedByAdmin: true,
      notes: adminNotes,
      adminNotes,
      isArchived: status === 'Archived',
    };

    if (editingNoticeId) {
      StorageService.updateRecruitmentNotice(noticePayload);
    } else {
      StorageService.addRecruitmentNotice(noticePayload);
    }

    setShowModal(false);
    loadNotices();
    onDataModified();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recruitment notice permanently?')) {
      StorageService.deleteRecruitmentNotice(id);
      loadNotices();
      onDataModified();
    }
  };

  const handleToggleArchive = (id: string) => {
    StorageService.toggleArchiveRecruitmentNotice(id);
    loadNotices();
    onDataModified();
  };

  const handleBroadcastAlert = (notice: RecruitmentNotice) => {
    if (confirm(`Broadcast push notification to ALL students for "${notice.postName}"?`)) {
      StorageService.broadcastNoticeAlert(notice);
      alert(`Push notification successfully sent to all candidate inboxes!`);
      onDataModified();
    }
  };

  const filtered = notices.filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      n.postName.toLowerCase().includes(q) ||
      n.deptName.toLowerCase().includes(q) ||
      (n.advtNumber && n.advtNumber.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              RECRUITMENT CMS
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {notices.length} Total Notices Configured
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-sky-600" />
            <span>Recruitment Notices & Official Circulars CMS</span>
          </h2>
          <p className="text-xs text-slate-500">
            Create, edit, schedule, verify, and broadcast authentic Civil Engineering vacancy notices.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices by post, dept, advt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-500 text-[11px] font-mono">STATUS:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter notices by status"
            className="text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1 text-slate-700"
          >
            <option value="all">All ({notices.length})</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Answer Key Out">Answer Key Out</option>
            <option value="Result Declared">Result Declared</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Post & Department</th>
                <th className="py-3 px-3">Exam Cadre</th>
                <th className="py-3 px-3">Vacancies</th>
                <th className="py-3 px-3">Apply End Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Official Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((notice) => (
                <tr key={notice.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{notice.postName}</div>
                    <div className="text-slate-500 text-[11px] flex items-center space-x-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{notice.deptName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-slate-400">
                        {notice.advtNumber || notice.advertisementNumber || 'Notice'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <ExamBadge examId={notice.examTargetId} />
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {notice.totalVacancies.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {notice.applyEndDate || 'Check Notice'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        notice.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : notice.status === 'Upcoming'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : notice.status === 'Archived'
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-sky-50 text-sky-700 border-sky-300'
                      }`}
                    >
                      {notice.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1 text-[11px] text-slate-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono text-[10px]">
                        {notice.lastVerifiedDate || 'Verified'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {notice.officialSource || 'Govt Portal'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setPreviewNotice(notice)}
                        title="Preview Notice Modal"
                        className="p-1 text-slate-400 hover:text-sky-600 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleBroadcastAlert(notice)}
                        title="Broadcast push notification to all students"
                        className="p-1 text-slate-400 hover:text-amber-600 rounded"
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleArchive(notice.id)}
                        title={notice.isArchived ? 'Restore to Live' : 'Archive Notice'}
                        className={`p-1 rounded ${
                          notice.isArchived ? 'text-amber-600' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(notice)}
                        title="Edit Notice"
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(notice.id)}
                        title="Delete Notice"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold">
                  {editingNoticeId ? 'Edit Recruitment Notice' : 'Publish New Verified Recruitment Notice'}
                </h3>
                <p className="text-xs text-slate-300">
                  Fill verified official details. Official source & last verified date are tracked for audit compliance.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Mandatory Official Source Notice */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Quality Directive:</strong> Never fabricate vacancies, dates, or eligibility. All notices must be verified against the official gazette or department bulletin.
                </span>
              </div>

              {/* Primary Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Post Name *</label>
                  <input
                    type="text"
                    required
                    value={postName}
                    onChange={(e) => setPostName(e.target.value)}
                    placeholder="e.g. Junior Engineer (Civil) Group B (Non-Gazetted)"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department / Organization *</label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Maharashtra Public Works Department (PWD)"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Cadre, Advt, Vacancies */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Exam Cadre *</label>
                  <select
                    value={examTargetId}
                    onChange={(e) => setExamTargetId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="maha_pwd">Maha PWD Civil JE / CEA</option>
                    <option value="mpsc_civil">MPSC Civil (MES / Group A & B)</option>
                    <option value="ssc_je">SSC JE (Civil)</option>
                    <option value="rrb_je">RRB JE (Civil)</option>
                    <option value="upsc_ese">UPSC ESE / IES (Civil)</option>
                    <option value="wrd_irrigation">Water Resources Dept (WRD)</option>
                    <option value="zp_civil">ZP Junior Engineer (Civil)</option>
                    <option value="bmc_je">BMC / Municipal Corp JE</option>
                    <option value="pmc_je">PMC / PCMC Civil Engineer</option>
                    <option value="mjp_je">Maharashtra Jeevan Pradhikaran (MJP)</option>
                    <option value="maha_housing">MHADA / CIDCO Housing</option>
                    <option value="other_civil">Other Civil Govt Post</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Advertisement No. *</label>
                  <input
                    type="text"
                    required
                    value={advtNumber}
                    onChange={(e) => setAdvtNumber(e.target.value)}
                    placeholder="e.g. Advt 03/2026 or Notification 12/PWD"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Vacancies *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalVacancies}
                    onChange={(e) => setTotalVacancies(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Eligibility & Qualifications */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Eligibility Category</label>
                    <select
                      value={eligibilityType}
                      onChange={(e) => setEligibilityType(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Both Diploma & Degree">Both Diploma & Degree</option>
                      <option value="Diploma Only">Diploma Only</option>
                      <option value="Degree Only">Degree Only</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4 pt-5">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={diplomaEligible}
                        onChange={(e) => setDiplomaEligible(e.target.checked)}
                        className="rounded text-sky-600"
                      />
                      <span className="text-slate-700">Diploma Eligible</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={degreeEligible}
                        onChange={(e) => setDegreeEligible(e.target.checked)}
                        className="rounded text-sky-600"
                      />
                      <span className="text-slate-700">Degree Eligible</span>
                    </label>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Location / Cadre</label>
                    <input
                      type="text"
                      value={districtOrState}
                      onChange={(e) => setDistrictOrState(e.target.value)}
                      placeholder="e.g. Maharashtra State (36 Districts)"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Eligibility Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    placeholder="Specific qualification clause from official notice"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Experience Requirement</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. Freshers eligible / 2 years field experience"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Salary Scale</label>
                    <input
                      type="text"
                      value={salaryScale}
                      onChange={(e) => setSalaryScale(e.target.value)}
                      placeholder="e.g. Level S-14: ₹38,600 - 1,22,800"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Age & Reservation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age Limit *</label>
                  <input
                    type="text"
                    required
                    value={ageLimit}
                    onChange={(e) => setAgeLimit(e.target.value)}
                    placeholder="e.g. 18 to 38 Years (as on cut-off date)"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age Rules & Relaxations</label>
                  <input
                    type="text"
                    value={ageRules}
                    onChange={(e) => setAgeRules(e.target.value)}
                    placeholder="e.g. OBC: +3 yrs, SC/ST: +5 yrs"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category & Parallel Quotas</label>
                  <input
                    type="text"
                    value={categoryNotes}
                    onChange={(e) => setCategoryNotes(e.target.value)}
                    placeholder="e.g. Women 30%, Sports 5%, Ex-Servicemen 15%"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Examination Pattern & Scheme */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Paper Pattern & Scheme</label>
                  <input
                    type="text"
                    value={paperPattern}
                    onChange={(e) => setPaperPattern(e.target.value)}
                    placeholder="e.g. 100 MCQs, 200 Marks. (60 Civil Engg, 40 Non-Tech)"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Total Questions</label>
                    <input
                      type="number"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 120 Minutes"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Negative Marking</label>
                    <input
                      type="text"
                      value={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.value)}
                      placeholder="e.g. 0.25 marks per wrong answer"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stages (comma separated)</label>
                  <input
                    type="text"
                    value={stages}
                    onChange={(e) => setStages(e.target.value)}
                    placeholder="Stage 1: CBT, Stage 2: Document Verification"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subjects Covered (comma separated)</label>
                  <input
                    type="text"
                    value={subjectsCovered}
                    onChange={(e) => setSubjectsCovered(e.target.value)}
                    placeholder="Building Materials, SOM, RCC, Surveying, Reasoning"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Dates & Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Apply Start Date</label>
                  <input
                    type="date"
                    value={applyStartDate}
                    onChange={(e) => setApplyStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Apply End Date *</label>
                  <input
                    type="date"
                    required
                    value={applyEndDate}
                    onChange={(e) => setApplyEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Exam Date / Note</label>
                  <input
                    type="text"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    placeholder="e.g. Tentative Dec 2026"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Notice Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Active">Active (Apply Now)</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Answer Key Out">Answer Key Out</option>
                    <option value="Result Declared">Result Declared</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Official Source & Links & Upload */}
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 space-y-3">
                <div>
                  <label className="font-semibold text-sky-950 block mb-1">
                    Official Source (Mandatory) *
                  </label>
                  <input
                    type="text"
                    required
                    value={officialSource}
                    onChange={(e) => setOfficialSource(e.target.value)}
                    placeholder="e.g. https://mahapwd.gov.in or MPSC Official Gazette"
                    className="w-full p-2 border border-sky-300 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Official Application Portal URL</label>
                    <input
                      type="url"
                      value={applyUrl}
                      onChange={(e) => setApplyUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Official PDF URL / Upload</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={pdfNotificationUrl}
                        onChange={(e) => setPdfNotificationUrl(e.target.value)}
                        placeholder="https://... / notification.pdf"
                        className="flex-1 p-2 border border-slate-300 rounded-lg bg-white"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center space-x-1 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                        <span>Upload PDF</span>
                      </button>
                    </div>
                    {uploadedFileName && (
                      <span className="text-[10px] text-emerald-700 mt-1 block">
                        Uploaded file: {uploadedFileName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Notes & Coaching Advice */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  SP Faculty Preparation Guidance & Strategic Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Key guidance, high weightage topics, or past cutoff insights for students..."
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center space-x-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingNoticeId ? 'Update Notice' : 'Publish Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewNotice && (
        <RecruitmentDetailModal
          notice={previewNotice}
          isOpen={Boolean(previewNotice)}
          onClose={() => setPreviewNotice(null)}
          isBookmarked={false}
          onToggleBookmark={() => {}}
          hasDeadlineReminder={false}
          onToggleReminder={() => {}}
        />
      )}
    </div>
  );
};
