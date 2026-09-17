import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Layers,
  Award,
  ChevronRight,
  ChevronDown,
  FileCode2,
  FileText,
  Target,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Play,
  Download,
  Filter,
  Sparkles,
  Calculator,
  Compass,
  Building,
  HelpCircle,
  RefreshCw,
  Eye,
  Info,
  GitCompare,
  History,
  Shield,
  Plus,
  Edit2,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Tag,
  Scale,
  Check,
  CheckCircle,
  FileCheck2,
  X
} from 'lucide-react';
import {
  SyllabusSubject,
  SyllabusModule,
  SyllabusTopic,
  TopicProgress,
  TopicRevisionStatus,
  SubjectCategory,
  ExamTargetId,
  CivilExamHierarchyProfile,
  ExamPaper,
  CanonicalSubject,
  CanonicalUnit,
  CanonicalTopic,
  SyllabusSubtopic,
  SyllabusConcept,
  ExamSyllabusMapping,
  SyllabusAuditLog
} from '../types';
import { StorageService } from '../services/storageService';
import { EXAM_CATALOGUE } from '../data/mockData';

interface SubjectsViewProps {
  onSelectSubjectPractice: (subjectId: string, topicId?: string) => void;
  initialExam?: ExamTargetId;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  onSelectSubjectPractice,
  initialExam
}) => {
  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'comparison' | 'audit'>('hierarchy');

  // Hierarchy Data States
  const [exams, setExams] = useState<CivilExamHierarchyProfile[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExam || 'maha_pwd');
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [canonicalSubjects, setCanonicalSubjects] = useState<CanonicalSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('rcc');
  const [examMappings, setExamMappings] = useState<ExamSyllabusMapping[]>([]);
  const [auditLogs, setAuditLogs] = useState<SyllabusAuditLog[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('2026.1');

  // Interactive Exploration States
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({ 'rcc-u1': true, 'rcc-u2': true });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({ 'rcc-u1-t1': true, 'rcc-u2-t1': true });
  const [selectedConcept, setSelectedConcept] = useState<SyllabusConcept | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, TopicProgress>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Syllabus Comparison States
  const [compareExamA, setCompareExamA] = useState<string>('maha_pwd');
  const [compareExamB, setCompareExamB] = useState<string>('ssc_je');

  // Admin Modal States
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [editingConcept, setEditingConcept] = useState<Partial<SyllabusConcept> | null>(null);
  const [targetSubtopicId, setTargetSubtopicId] = useState<string>('');
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<Partial<ExamSyllabusMapping> | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newVersionInput, setNewVersionInput] = useState('');
  const [releaseNotesInput, setReleaseNotesInput] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadHierarchyData();
  }, []);

  const loadHierarchyData = async () => {
    // Try to load from server API first, fallback to StorageService
    try {
      const res = await fetch('/api/syllabus/hierarchy');
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || StorageService.getExamsHierarchy());
        setCanonicalSubjects(data.subjects || StorageService.getCanonicalSubjects());
        setExamMappings(data.mappings || StorageService.getExamMappings());
        setCurrentVersion(data.version || StorageService.getSyllabusVersion());
      } else {
        fallbackToLocalStorage();
      }
    } catch (e) {
      fallbackToLocalStorage();
    }

    const logs = StorageService.getSyllabusAuditLogs();
    setAuditLogs(logs);
    setProgressMap(StorageService.getTopicProgressMap());
  };

  const fallbackToLocalStorage = () => {
    const ex = StorageService.getExamsHierarchy();
    const subs = StorageService.getCanonicalSubjects();
    const maps = StorageService.getExamMappings();
    const ver = StorageService.getSyllabusVersion();
    setExams(ex);
    setCanonicalSubjects(subs);
    setExamMappings(maps);
    setCurrentVersion(ver);
  };

  // Find currently selected exam
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Set default paper when exam changes
  useEffect(() => {
    if (currentExam && currentExam.papers.length > 0) {
      if (!selectedPaperId || !currentExam.papers.some((p) => p.id === selectedPaperId)) {
        setSelectedPaperId(currentExam.papers[0].id);
      }
    }
  }, [selectedExamId, currentExam]);

  // Currently selected paper
  const currentPaper = currentExam?.papers.find((p) => p.id === selectedPaperId) || currentExam?.papers[0];

  // Subjects applicable to this paper
  const paperSubjectIds = currentPaper?.subjectIds || [];
  const activeSubjects = canonicalSubjects.filter((s) => paperSubjectIds.includes(s.id));

  // Current selected subject
  const currentSubject = activeSubjects.find((s) => s.id === selectedSubjectId) || activeSubjects[0] || canonicalSubjects[0];

  // Find mapping for current subject in current exam & paper
  const currentSubjectMapping = examMappings.find(
    (m) => m.examId === currentExam?.id && m.subjectId === currentSubject?.id
  ) || {
    id: `default-${currentSubject?.id}`,
    examId: currentExam?.id || 'maha_pwd',
    paperId: currentPaper?.id || 'pwd-p1',
    subjectId: currentSubject?.id || 'rcc',
    inclusionStatus: 'core_compulsory',
    examWeightagePercent: 15,
    depthLevel: 'diploma_je',
    examSpecificNotes: 'Standard civil engineering technical syllabus coverage.',
    pyqFrequencyText: '10-15 questions per exam session',
    lastAuditedDate: '2026-03-01'
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleConceptClick = (concept: SyllabusConcept) => {
    setSelectedConcept(concept);
  };

  const handleStatusChange = (conceptId: string, status: TopicRevisionStatus) => {
    StorageService.setTopicRevisionStatus(conceptId, status);
    setProgressMap(StorageService.getTopicProgressMap());
  };

  const handleSaveConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConcept) return;

    try {
      // Send to server API
      const res = await fetch('/api/syllabus/concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: {
            ...editingConcept,
            subtopicId: targetSubtopicId || editingConcept.subtopicId,
          },
          actorEmail: 'admin.sp@engineeringofficer.in',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Also save to local storage
        StorageService.upsertConcept(data.concept);
      } else {
        StorageService.upsertConcept({
          ...editingConcept,
          subtopicId: targetSubtopicId || editingConcept.subtopicId,
        });
      }
    } catch {
      StorageService.upsertConcept({
        ...editingConcept,
        subtopicId: targetSubtopicId || editingConcept.subtopicId,
      });
    }

    setShowConceptModal(false);
    setEditingConcept(null);
    loadHierarchyData();
    showToast('Concept saved and audit trail updated.');
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMapping) return;

    try {
      const res = await fetch('/api/syllabus/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapping: editingMapping,
          actorEmail: 'admin.sp@engineeringofficer.in',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        StorageService.updateExamMapping(data.mapping);
      } else {
        StorageService.updateExamMapping(editingMapping);
      }
    } catch {
      StorageService.updateExamMapping(editingMapping);
    }

    setShowMappingModal(false);
    setEditingMapping(null);
    loadHierarchyData();
    showToast('Exam syllabus mapping updated successfully.');
  };

  const handlePublishVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionInput.trim()) return;

    try {
      const res = await fetch('/api/syllabus/version/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newVersion: newVersionInput.trim(),
          releaseNotes: releaseNotesInput.trim() || 'Scheduled civil syllabus audit',
          actorEmail: 'admin.sp@engineeringofficer.in',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        StorageService.publishSyllabusVersion(data.version, releaseNotesInput);
        setCurrentVersion(data.version);
      } else {
        StorageService.publishSyllabusVersion(newVersionInput.trim(), releaseNotesInput);
        setCurrentVersion(newVersionInput.trim());
      }
    } catch {
      StorageService.publishSyllabusVersion(newVersionInput.trim(), releaseNotesInput);
      setCurrentVersion(newVersionInput.trim());
    }

    setShowPublishModal(false);
    setNewVersionInput('');
    setReleaseNotesInput('');
    loadHierarchyData();
    showToast(`Published Civil Engineering Syllabus ${newVersionInput}`);
  };

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500/50">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                7-Tier Scalable Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Syllabus v{currentVersion}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Auditable & Mapped
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Civil Engineering Syllabus & Taxonomy
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Exam → Paper → Subject → Unit → Topic → Subtopic → Concept. Rigorous codal mappings with IS 456, IS 800, IRC, and CPWD standards customized across State & National examinations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'hierarchy'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              7-Tier Hierarchy
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'comparison'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              Compare Syllabi
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              Audit Trail ({auditLogs.length})
            </button>
          </div>
        </div>

        {/* Level 1 & 2: Exam and Paper Selection Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Level 1: Exam Selector */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tier 1: Select Examination Cadre ({exams.length} Civil Boards)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {exams.map((ex) => {
                  const isSelected = ex.id === selectedExamId;
                  return (
                    <button
                      key={ex.id}
                      onClick={() => {
                        setSelectedExamId(ex.id);
                        if (ex.papers.length > 0) {
                          setSelectedPaperId(ex.papers[0].id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {ex.shortName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Version Publish Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPublishModal(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Publish Revision
              </button>
            </div>
          </div>

          {/* Level 2: Paper Selector Bar */}
          {currentExam && (
            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                  Tier 2: Exam Papers:
                </span>
                {currentExam.papers.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => setSelectedPaperId(paper.id)}
                    className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                      selectedPaperId === paper.id
                        ? 'bg-blue-500 text-white font-semibold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {paper.paperName} ({paper.totalMarks} Marks)
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span>Body: <strong className="text-slate-200">{currentExam.conductingBody}</strong></span>
                <span>•</span>
                <span>Negative: <strong className="text-amber-400">{currentPaper?.negativeMarking || '1/4th'}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 7-TIER SYLLABUS HIERARCHY EXPLORER */}
      {/* ========================================================================= */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tier 3 Subjects Navigation (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Tier 3: Canonical Subjects
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  {activeSubjects.length} in this Paper
                </span>
              </div>

              {/* Subject Search */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subject, IS code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Subject List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {activeSubjects
                  .filter((s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((subj) => {
                    const isSelected = subj.id === currentSubject?.id;
                    const mapping = examMappings.find((m) => m.examId === currentExam?.id && m.subjectId === subj.id);
                    const weightage = mapping?.examWeightagePercent || 12;

                    return (
                      <div
                        key={subj.id}
                        onClick={() => setSelectedSubjectId(subj.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                              {subj.code}
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                              {subj.name}
                            </h3>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            weightage >= 20
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {weightage}% Wt.
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {subj.standardISCodes.slice(0, 2).map((code) => (
                            <span key={code} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded">
                              {code}
                            </span>
                          ))}
                          <span className="text-[10px] text-slate-500 ml-auto font-medium">
                            {subj.units.length} Units
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Add New Subject / Edit Mapping Shortcut */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setEditingMapping(currentSubjectMapping);
                    setShowMappingModal(true);
                  }}
                  className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Edit {currentSubject?.shortName} Exam Weightage
                </button>
              </div>
            </div>

            {/* Exam-Specific Mapping Telemetry Box */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-700" />
                  Exam-Specific Mapping Rule
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold uppercase text-[10px]">
                  {currentSubjectMapping.depthLevel.replace('_', ' ')}
                </span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                <strong>Focus Note:</strong> {currentSubjectMapping.examSpecificNotes}
              </p>
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-amber-900 text-[11px]">
                <span>Frequency: <strong>{currentSubjectMapping.pyqFrequencyText}</strong></span>
                <span className="text-amber-700 text-[10px]">Audited: {currentSubjectMapping.lastAuditedDate}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tiers 4, 5, 6, 7 (Units → Topics → Subtopics → Concepts) (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Subject Overview Card */}
            {currentSubject && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-mono font-bold rounded">
                        {currentSubject.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {currentSubject.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {currentSubject.name}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {currentSubject.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectSubjectPractice(currentSubject.id)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Practice MCQs ({currentSubject.shortName})
                    </button>
                  </div>
                </div>

                {/* Standard Codal References */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <FileCode2 className="w-3.5 h-3.5 text-slate-600" />
                    Standard Codal Provisions:
                  </span>
                  {currentSubject.standardISCodes.map((code) => (
                    <span key={code} className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-xs rounded border border-slate-200 font-semibold">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Units & Topics Accordion Hierarchy */}
            <div className="space-y-3">
              {currentSubject?.units.map((unit) => {
                const isUnitExpanded = expandedUnits[unit.id] ?? true;

                return (
                  <div key={unit.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Unit Header (Tier 4) */}
                    <div
                      onClick={() => toggleUnit(unit.id)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-between border-b border-slate-200/80"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          U{unit.unitNumber}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                            Tier 4: Unit {unit.unitNumber}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">
                            {unit.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">
                          {unit.topics.length} Topics
                        </span>
                        {isUnitExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Unit Topics (Tier 5) */}
                    {isUnitExpanded && (
                      <div className="p-4 space-y-4">
                        {unit.topics.map((topic) => {
                          const isTopicExpanded = expandedTopics[topic.id] ?? true;

                          return (
                            <div key={topic.id} className="border border-slate-200 rounded-xl overflow-hidden">
                              {/* Topic Header (Tier 5) */}
                              <div
                                onClick={() => toggleTopic(topic.id)}
                                className="p-3 bg-white hover:bg-slate-50/50 cursor-pointer flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                    Topic
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-800">
                                    {topic.title}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                    {topic.importance}
                                  </span>
                                  {isTopicExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                              </div>

                              {/* Topic Details & Subtopics (Tier 6 & 7) */}
                              {isTopicExpanded && (
                                <div className="p-3 bg-slate-50/50 border-t border-slate-100 space-y-3">
                                  {/* Subtopics Accordion */}
                                  {topic.subtopics.map((subtopic) => (
                                    <div key={subtopic.id} className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                                          <h5 className="text-xs font-bold text-slate-800">
                                            Tier 6 Subtopic: {subtopic.title}
                                          </h5>
                                        </div>

                                        <button
                                          onClick={() => {
                                            setTargetSubtopicId(subtopic.id);
                                            setEditingConcept({
                                              subtopicId: subtopic.id,
                                              name: '',
                                              explanation: '',
                                              importance: 'High',
                                            });
                                            setShowConceptModal(true);
                                          }}
                                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" />
                                          Add Concept
                                        </button>
                                      </div>

                                      {/* Tier 7: Concepts Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                        {subtopic.concepts.map((concept) => {
                                          const status = progressMap[concept.id]?.status || 'not_started';

                                          return (
                                            <div
                                              key={concept.id}
                                              onClick={() => handleConceptClick(concept)}
                                              className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-xs bg-slate-50/30 cursor-pointer transition-all text-left"
                                            >
                                              <div className="flex items-start justify-between gap-1">
                                                <span className="font-mono text-[9px] font-bold text-blue-600">
                                                  {concept.code || 'CONCEPT'}
                                                </span>
                                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                                                  status === 'mastered'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : status === 'in_progress'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                  {status === 'mastered' ? 'Mastered' : status === 'in_progress' ? 'Studying' : 'New'}
                                                </span>
                                              </div>

                                              <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                                                {concept.name}
                                              </p>

                                              {concept.isCodeClause && (
                                                <p className="text-[10px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                                                  {concept.isCodeClause}
                                                </p>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPARE SYLLABI ACROSS EXAMINATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-blue-600" />
              Comparative Syllabus Engine
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Civil Engineering recruitment boards feature differing syllabus weightages, codal depths, and paper patterns. Compare two examinations side-by-side to target your study hours efficiently.
            </p>
          </div>

          {/* Exam Selection for Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Examination A (Benchmark):
              </label>
              <select
                value={compareExamA}
                onChange={(e) => setCompareExamA(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.conductingBody})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Examination B (Comparison Target):
              </label>
              <select
                value={compareExamB}
                onChange={(e) => setCompareExamB(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.conductingBody})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="p-3">Civil Engineering Subject</th>
                  <th className="p-3 bg-blue-50/50">
                    {exams.find((e) => e.id === compareExamA)?.shortName || 'Exam A'} Weightage & Focus
                  </th>
                  <th className="p-3 bg-emerald-50/50">
                    {exams.find((e) => e.id === compareExamB)?.shortName || 'Exam B'} Weightage & Focus
                  </th>
                  <th className="p-3">Strategic Difference & Recommendations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {canonicalSubjects.map((subj) => {
                  const mapA = examMappings.find((m) => m.examId === compareExamA && m.subjectId === subj.id);
                  const mapB = examMappings.find((m) => m.examId === compareExamB && m.subjectId === subj.id);

                  const weightA = mapA?.examWeightagePercent || 12;
                  const weightB = mapB?.examWeightagePercent || 12;
                  const diff = weightB - weightA;

                  return (
                    <tr key={subj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-500">{subj.code}</span>
                          <span>{subj.name}</span>
                        </div>
                      </td>
                      <td className="p-3 bg-blue-50/20">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-900 text-sm">{weightA}%</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-semibold">
                            {mapA?.depthLevel || 'Diploma JE'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {mapA?.examSpecificNotes || 'Standard codal coverage'}
                        </p>
                      </td>
                      <td className="p-3 bg-emerald-50/20">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-900 text-sm">{weightB}%</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                            {mapB?.depthLevel || 'Diploma JE'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {mapB?.examSpecificNotes || 'Standard codal coverage'}
                        </p>
                      </td>
                      <td className="p-3">
                        {diff > 0 ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            +{diff}% higher priority in {exams.find((e) => e.id === compareExamB)?.shortName}.
                          </span>
                        ) : diff < 0 ? (
                          <span className="text-slate-600 font-semibold">
                            {diff}% lower weightage. Standard formula revision sufficient.
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">
                            Identical weightage. Reusable study material.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT TRAIL & VERSION HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Auditable Syllabus Revision Log
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Every modification to Civil Engineering subjects, units, formulas, codal clauses, and exam weightages is cryptographically recorded with actor identity and timestamp.
              </p>
            </div>

            <button
              onClick={() => setShowPublishModal(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Publish New Version
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      log.action === 'PUBLISH_VERSION'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.action === 'MAPPING_UPDATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-mono text-slate-500 font-medium">
                      v{log.version}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {log.entityName}
                    </span>
                  </div>

                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {log.changeSummary}
                </p>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Author: <strong className="text-slate-700">{log.actor}</strong></span>
                  <span>Target: <strong className="text-slate-700">{log.entityType} ({log.entityId})</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONCEPT DETAIL MODAL (Deep Learning Drawer) */}
      {/* ========================================================================= */}
      {selectedConcept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                    {selectedConcept.code || 'CONCEPT'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-semibold">
                    {selectedConcept.importance} Yield
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedConcept.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConcept(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Explanation */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Engineering Concept Breakdown:
              </h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                {selectedConcept.explanation}
              </p>
            </div>

            {/* Mathematical Formula */}
            {selectedConcept.keyFormula && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  Key Formula / Expression:
                </h4>
                <div className="p-3 bg-blue-950 text-blue-200 rounded-xl font-mono text-xs border border-blue-900 shadow-inner">
                  {selectedConcept.keyFormula}
                </div>
              </div>
            )}

            {/* IS Code Clause Reference */}
            {selectedConcept.isCodeClause && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-emerald-600" />
                  Standard Codal Provision:
                </h4>
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-semibold border border-emerald-200">
                  {selectedConcept.isCodeClause}
                </div>
              </div>
            )}

            {/* Common Trap Alert */}
            {selectedConcept.commonTrap && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Exam Trap & Distractor Warning:
                </h4>
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 leading-relaxed">
                  {selectedConcept.commonTrap}
                </div>
              </div>
            )}

            {/* Mastery Status Selector */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">My Mastery Status:</span>
                {(['not_started', 'in_progress', 'mastered'] as TopicRevisionStatus[]).map((st) => {
                  const currentStatus = progressMap[selectedConcept.id]?.status || 'not_started';
                  const isCurrent = currentStatus === st;

                  return (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedConcept.id, st)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'mastered' ? 'Mastered' : st === 'in_progress' ? 'Studying' : 'Not Started'}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setSelectedConcept(null);
                  onSelectSubjectPractice(currentSubject?.id || 'rcc');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Practice Topic MCQs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN: ADD/EDIT CONCEPT MODAL */}
      {/* ========================================================================= */}
      {showConceptModal && editingConcept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveConcept}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Create / Edit Civil Concept (Audited)
              </h3>
              <button
                type="button"
                onClick={() => setShowConceptModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Concept Name *</label>
              <input
                type="text"
                required
                value={editingConcept.name || ''}
                onChange={(e) => setEditingConcept({ ...editingConcept, name: e.target.value })}
                placeholder="e.g. Limiting Neutral Axis Depth Ratio"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Technical Explanation *</label>
              <textarea
                required
                rows={3}
                value={editingConcept.explanation || ''}
                onChange={(e) => setEditingConcept({ ...editingConcept, explanation: e.target.value })}
                placeholder="Explain the civil engineering derivation, assumptions and physical behavior..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Formula</label>
                <input
                  type="text"
                  value={editingConcept.keyFormula || ''}
                  onChange={(e) => setEditingConcept({ ...editingConcept, keyFormula: e.target.value })}
                  placeholder="e.g. xu,max/d = 700 / (1100 + 0.87*fy)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">IS Code Clause</label>
                <input
                  type="text"
                  value={editingConcept.isCodeClause || ''}
                  onChange={(e) => setEditingConcept({ ...editingConcept, isCodeClause: e.target.value })}
                  placeholder="e.g. IS 456:2000 Cl. 38.1"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Common Exam Trap / Pitfall</label>
              <input
                type="text"
                value={editingConcept.commonTrap || ''}
                onChange={(e) => setEditingConcept({ ...editingConcept, commonTrap: e.target.value })}
                placeholder="e.g. Fe 500 value is 0.46d, not 0.48d"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConceptModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm"
              >
                Save Concept
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN: EDIT EXAM MAPPING MODAL */}
      {/* ========================================================================= */}
      {showMappingModal && editingMapping && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMapping}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Configure Exam-Specific Mapping
              </h3>
              <button
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Exam Weightage (%)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={editingMapping.examWeightagePercent || 15}
                  onChange={(e) => setEditingMapping({ ...editingMapping, examWeightagePercent: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Depth Standard</label>
                <select
                  value={editingMapping.depthLevel || 'diploma_je'}
                  onChange={(e) => setEditingMapping({ ...editingMapping, depthLevel: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="diploma_je">Diploma JE Standard</option>
                  <option value="degree_ae">Degree AE / MES Standard</option>
                  <option value="advanced_ese">Advanced UPSC ESE Standard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Exam-Specific Notes / Trends</label>
              <textarea
                rows={3}
                value={editingMapping.examSpecificNotes || ''}
                onChange={(e) => setEditingMapping({ ...editingMapping, examSpecificNotes: e.target.value })}
                placeholder="e.g. In WRD CBT, 40% numerical questions on Spillway profiles..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PYQ Frequency Text</label>
              <input
                type="text"
                value={editingMapping.pyqFrequencyText || ''}
                onChange={(e) => setEditingMapping({ ...editingMapping, pyqFrequencyText: e.target.value })}
                placeholder="e.g. 15-18 Questions per paper"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm"
              >
                Save Mapping
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN: PUBLISH VERSION MODAL */}
      {/* ========================================================================= */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handlePublishVersion}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Publish Civil Syllabus Revision
              </h3>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Version Tag *</label>
              <input
                type="text"
                required
                value={newVersionInput}
                onChange={(e) => setNewVersionInput(e.target.value)}
                placeholder="e.g. 2026.2"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Current active version: <strong>{currentVersion}</strong>
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Release Notes / Changerecord *</label>
              <textarea
                required
                rows={3}
                value={releaseNotesInput}
                onChange={(e) => setReleaseNotesInput(e.target.value)}
                placeholder="Detail changes made e.g. Updated IRC 37 pavement design criteria and PWD JE weightage..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                Publish & Audit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
