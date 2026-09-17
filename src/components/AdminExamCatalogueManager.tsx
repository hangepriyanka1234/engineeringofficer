import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Search,
  Building2,
  Calendar,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Power,
  X,
  FileText,
  Clock,
  Briefcase,
  Copy,
  Archive,
  ArchiveRestore
} from 'lucide-react';
import { ExamProfile, ExamTargetId } from '../types';
import { ExamBadge } from './common/ExamBadge';
import { StorageService } from '../services/storageService';

interface AdminExamCatalogueManagerProps {
  onDataModified: () => void;
}

export const AdminExamCatalogueManager: React.FC<AdminExamCatalogueManagerProps> = ({ onDataModified }) => {
  const [profiles, setProfiles] = useState<ExamProfile[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Form fields
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [authority, setAuthority] = useState('');
  const [level, setLevel] = useState<'Central' | 'State' | 'Local Body' | 'PSU'>('State');
  const [qualification, setQualification] = useState('Diploma in Civil Engineering / B.E. / B.Tech Civil');
  const [eligibilityType, setEligibilityType] = useState<'Diploma Only' | 'Degree Only' | 'Both Diploma & Degree'>('Both Diploma & Degree');
  const [diplomaEligible, setDiplomaEligible] = useState(true);
  const [degreeEligible, setDegreeEligible] = useState(true);
  const [experience, setExperience] = useState('Nil / Freshers Eligible');
  const [ageRules, setAgeRules] = useState('18 - 38 Years (Relaxation: OBC 3 yrs, SC/ST 5 yrs)');
  const [categoryNotes, setCategoryNotes] = useState('Horizontal reservation for Women 30%, Sports 5%, Ex-Servicemen 15%');
  const [stages, setStages] = useState('Stage 1: CBT Written Test, Stage 2: Document Verification');
  const [paperPattern, setPaperPattern] = useState('100 Questions, 200 Marks (60 Technical Civil, 40 Non-Tech)');
  const [subjects, setSubjects] = useState('Building Materials, SOM, RCC, Surveying, Highway, GS, Reasoning');
  const [negativeMarking, setNegativeMarking] = useState('0.25 marks per incorrect answer');
  const [questionCount, setQuestionCount] = useState<number>(100);
  const [duration, setDuration] = useState('120 Minutes');
  const [syllabus, setSyllabus] = useState('Detailed Civil Engineering syllabus aligned with SP Master Curriculum.');
  const [selectionProcess, setSelectionProcess] = useState('Direct recruitment based on CBT merit list followed by DV.');
  const [applicationDates, setApplicationDates] = useState('Annual / Regular Notification');
  const [examDate, setExamDate] = useState('Refer official calendar');
  const [admitCardDate, setAdmitCardDate] = useState('7 days prior to exam');
  const [resultDate, setResultDate] = useState('Within 45 days');
  const [officialNotificationUrl, setOfficialNotificationUrl] = useState('https://mpsc.gov.in');
  const [officialApplicationUrl, setOfficialApplicationUrl] = useState('https://mpsc.gov.in');
  const [status, setStatus] = useState<'Active' | 'Upcoming' | 'Past'>('Active');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadProfiles(showArchived);
  }, [showArchived]);

  const loadProfiles = (includeArchived: boolean = showArchived) => {
    const list = StorageService.getExamProfiles(includeArchived);
    setProfiles(list);
  };

  const handleOpenAdd = () => {
    setEditingProfileId(null);
    setId(`exam_custom_${Date.now()}`);
    setName('');
    setShortName('');
    setOrganization('');
    setDepartment('');
    setAuthority('');
    setLevel('State');
    setQualification('Diploma in Civil Engineering or B.E./B.Tech in Civil Engineering');
    setEligibilityType('Both Diploma & Degree');
    setDiplomaEligible(true);
    setDegreeEligible(true);
    setExperience('Nil / Freshers Eligible');
    setAgeRules('18 - 38 Years (Relaxation: OBC 3 yrs, SC/ST 5 yrs)');
    setCategoryNotes('Horizontal reservation for Women 30%, Sports 5%, Ex-Servicemen 15%');
    setStages('Stage 1: CBT Written Test, Stage 2: Document Verification');
    setPaperPattern('100 Questions, 200 Marks (60 Technical Civil, 40 Non-Tech)');
    setSubjects('Building Materials, SOM, RCC, Surveying, Highway, GS, Reasoning');
    setNegativeMarking('0.25 marks per incorrect answer');
    setQuestionCount(100);
    setDuration('120 Minutes');
    setSyllabus('Detailed Civil Engineering syllabus aligned with SP Master Curriculum.');
    setSelectionProcess('Direct recruitment based on CBT merit list followed by DV.');
    setApplicationDates('Annual Notification');
    setExamDate('Refer official calendar');
    setAdmitCardDate('7 days prior to exam');
    setResultDate('Within 45 days');
    setOfficialNotificationUrl('https://mpsc.gov.in');
    setOfficialApplicationUrl('https://mpsc.gov.in');
    setStatus('Active');
    setAdminNotes('Configured by Super Admin for candidate preparation tracking.');
    setShowModal(true);
  };

  const handleOpenEdit = (p: ExamProfile) => {
    setEditingProfileId(p.id);
    setId(p.id);
    setName(p.name);
    setShortName(p.shortName);
    setOrganization(p.organization || '');
    setDepartment(p.department || '');
    setAuthority(p.authority);
    setLevel(p.level);
    setQualification(p.qualification || '');
    setEligibilityType(p.eligibilityType || 'Both Diploma & Degree');
    setDiplomaEligible(p.diplomaEligible !== false);
    setDegreeEligible(p.degreeEligible !== false);
    setExperience(p.experience || '');
    setAgeRules(p.ageRules || '');
    setCategoryNotes(p.categoryNotes || '');
    setStages(p.stages ? p.stages.join(', ') : '');
    setPaperPattern(p.paperPattern || '');
    setSubjects(p.subjects ? p.subjects.join(', ') : '');
    setNegativeMarking(p.negativeMarking || '');
    setQuestionCount(p.questionCount || 100);
    setDuration(p.duration || '120 Minutes');
    setSyllabus(p.syllabus || '');
    setSelectionProcess(p.selectionProcess || '');
    setApplicationDates(p.applicationDates || '');
    setExamDate(p.examDate || '');
    setAdmitCardDate(p.admitCardDate || '');
    setResultDate(p.resultDate || '');
    setOfficialNotificationUrl(p.officialNotificationUrl || '');
    setOfficialApplicationUrl(p.officialApplicationUrl || '');
    setStatus(p.status || 'Active');
    setAdminNotes(p.adminNotes || '');
    setShowModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const profilePayload: ExamProfile = {
      id: editingProfileId ? editingProfileId : id.trim().toLowerCase().replace(/\s+/g, '_'),
      name,
      shortName,
      organization,
      department,
      authority,
      level,
      qualification,
      eligibilityType,
      diplomaEligible,
      degreeEligible,
      experience,
      ageRules,
      categoryNotes,
      stages: stages.split(',').map((s) => s.trim()).filter(Boolean),
      paperPattern,
      subjects: subjects.split(',').map((s) => s.trim()).filter(Boolean),
      negativeMarking,
      questionCount: Number(questionCount),
      duration,
      syllabus,
      selectionProcess,
      applicationDates,
      examDate,
      admitCardDate,
      resultDate,
      officialNotificationUrl,
      officialApplicationUrl,
      status,
      isActive: true,
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      adminNotes,
    };

    if (editingProfileId) {
      StorageService.updateExamProfile(profilePayload);
    } else {
      StorageService.addExamProfile(profilePayload);
    }

    setShowModal(false);
    loadProfiles();
    onDataModified();
  };

  const handleToggleActive = (profileId: string) => {
    StorageService.toggleExamProfileActive(profileId);
    loadProfiles();
    onDataModified();
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this Exam Profile? Candidates will no longer be able to select it as a primary target.')) {
      StorageService.deleteExamProfile(profileId);
      loadProfiles(showArchived);
      onDataModified();
    }
  };

  const handleCloneProfile = (p: ExamProfile) => {
    const newId = prompt('Enter a unique ID for the cloned profile:', `${p.id}_copy_${Date.now().toString().slice(-4)}`);
    if (!newId) return;
    const newName = prompt('Enter the full name for this cloned profile:', `${p.name} (Cloned Recruitment)`);
    if (!newName) return;
    StorageService.cloneExamProfile(p.id, newId, newName);
    loadProfiles(showArchived);
    onDataModified();
  };

  const handleArchiveProfile = (p: ExamProfile) => {
    if (confirm(`Archive ${p.shortName}? It will be hidden from active selection until restored.`)) {
      StorageService.archiveExamProfile(p.id);
      loadProfiles(showArchived);
      onDataModified();
    }
  };

  const handleRestoreProfile = (p: ExamProfile) => {
    StorageService.restoreExamProfile(p.id);
    loadProfiles(showArchived);
    onDataModified();
  };

  const filtered = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      p.authority.toLowerCase().includes(q);
    const matchesLevel = levelFilter === 'all' || p.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              EXAM CATALOGUE CMS
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {profiles.length} Profiles Configured
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <span>Configurable Exam & Post Profiles</span>
          </h2>
          <p className="text-xs text-slate-500">
            Define recruitment frameworks, schemes, eligibility rules, and official links for all Civil Engineering posts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Exam Profile</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search exam name or authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-medium">Show Archived</span>
          </label>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 text-[11px] font-mono">LEVEL:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="Filter exams by administrative level"
              className="text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1 text-slate-700"
            >
              <option value="all">All Levels ({profiles.length})</option>
              <option value="Central">Central (UPSC, SSC, RRB)</option>
              <option value="State">State (MPSC, PWD, WRD, MJP)</option>
              <option value="Local Body">Local Body (ZP, BMC, PMC)</option>
              <option value="PSU">PSU / Infra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profiles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((profile) => {
          const isActive = profile.isActive !== false;

          return (
            <div
              key={profile.id}
              className={`p-5 rounded-xl border transition-all space-y-3 bg-white ${
                isActive ? 'border-slate-200 shadow-xs' : 'border-slate-200/60 opacity-60 bg-slate-50'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-50 text-sky-800 border border-sky-200">
                      {profile.shortName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {profile.level}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                    {profile.isArchived && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Archived
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1.5 leading-snug">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center mt-0.5">
                    <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{profile.authority}</span>
                    {profile.department && <span className="ml-1 text-slate-400">({profile.department})</span>}
                  </p>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleCloneProfile(profile)}
                    title="Clone Exam Profile (Duplicate Scheme)"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-50"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {profile.isArchived ? (
                    <button
                      onClick={() => handleRestoreProfile(profile)}
                      title="Restore Exam Profile to Active Catalogue"
                      className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    >
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleArchiveProfile(profile)}
                      title="Archive Exam Profile"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleActive(profile.id)}
                    title={isActive ? 'Deactivate Exam' : 'Activate Exam'}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 ${
                      isActive
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'border-slate-300 text-slate-500 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(profile)}
                    title="Edit Profile"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    title="Delete Profile"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-slate-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Eligibility & Scheme pills */}
              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-900">Allowed:</span>
                  <span className="px-2 py-0.2 bg-white rounded border border-slate-200 font-mono text-[10px] text-sky-800">
                    {profile.eligibilityType || 'Both Diploma & Degree'}
                  </span>
                  {profile.diplomaEligible !== false && (
                    <span className="text-[10px] text-emerald-700 font-medium">✓ Diploma</span>
                  )}
                  {profile.degreeEligible !== false && (
                    <span className="text-[10px] text-indigo-700 font-medium">✓ Degree</span>
                  )}
                </div>

                <p className="line-clamp-2 text-[11px] text-slate-600">
                  <strong className="text-slate-800">Paper Scheme:</strong>{' '}
                  {profile.paperPattern || 'Standard Objective MCQ examination.'}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  <span>Questions: {profile.questionCount || 100} MCQs</span>
                  <span>Negative: {profile.negativeMarking || '0.25'}</span>
                  <span>Duration: {profile.duration || '120m'}</span>
                </div>
              </div>

              {/* Official Links Footnote */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400 font-mono">
                  Last Verified: {profile.lastVerifiedDate || 'Official Source'}
                </span>

                {profile.officialNotificationUrl && (
                  <a
                    href={profile.officialNotificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:text-sky-800 font-semibold flex items-center space-x-1"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold">
                  {editingProfileId ? `Edit Exam Profile: ${name}` : 'Configure New Exam / Post Profile'}
                </h3>
                <p className="text-xs text-slate-300">
                  Configure post eligibility, paper scheme, marking rules, and official links. Changes persist dynamically.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Primary Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Full Examination / Post Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maharashtra PWD Junior Engineer (Civil) Examination"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Short Name / Code *</label>
                  <input
                    type="text"
                    required
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. MAHA PWD JE"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Organization, Authority, Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Conducting Authority *</label>
                  <input
                    type="text"
                    required
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    placeholder="e.g. Maharashtra PWD / TCS / IBPS"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Government Level *</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="State">State Government</option>
                    <option value="Central">Central Government</option>
                    <option value="Local Body">Local Body / ZP / Municipal</option>
                    <option value="PSU">PSU / Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Public Works Department"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Eligibility & Qualifications */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Eligibility Stream</label>
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
                    <label className="font-semibold text-slate-700 block mb-1">Experience Rule</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. Freshers eligible / Nil"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Qualification Details *</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="Diploma in Civil Engg or B.E./B.Tech in Civil Engg"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Age Limits & Relaxations</label>
                    <input
                      type="text"
                      value={ageRules}
                      onChange={(e) => setAgeRules(e.target.value)}
                      placeholder="18 - 38 Years (OBC +3, SC/ST +5)"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category & Parallel Quotas</label>
                    <input
                      type="text"
                      value={categoryNotes}
                      onChange={(e) => setCategoryNotes(e.target.value)}
                      placeholder="Women 30%, Sports 5%, Ex-Servicemen 15%"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Paper Pattern & Scheme */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Paper Pattern & Structure</label>
                  <input
                    type="text"
                    value={paperPattern}
                    onChange={(e) => setPaperPattern(e.target.value)}
                    placeholder="100 MCQs, 200 Marks (60 Civil Engg, 40 Non-Tech)"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Total Question Count</label>
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
                    <label className="font-semibold text-slate-700 block mb-1">Negative Marking Rule</label>
                    <input
                      type="text"
                      value={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.value)}
                      placeholder="0.25 marks per wrong answer"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Examination Stages (comma separated)</label>
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
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    placeholder="Building Materials, SOM, RCC, Surveying, Reasoning"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Official Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Portal URL</label>
                  <input
                    type="url"
                    value={officialNotificationUrl}
                    onChange={(e) => setOfficialNotificationUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Application URL</label>
                  <input
                    type="url"
                    value={officialApplicationUrl}
                    onChange={(e) => setOfficialApplicationUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Admin Faculty Notes</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Strategic guidance and past trend analysis for this specific exam..."
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
                  <span>{editingProfileId ? 'Update Exam Profile' : 'Save Exam Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
