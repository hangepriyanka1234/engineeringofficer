import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronRight,
  Target,
  FileCode2,
  Search,
  Sparkles,
  History,
  Scale,
  SlidersHorizontal,
  GitCompare,
  Check,
  X
} from 'lucide-react';
import {
  SyllabusSubject,
  SyllabusModule,
  SyllabusTopic,
  SubjectCategory,
  ExamTargetId,
  CivilExamHierarchyProfile,
  CanonicalSubject,
  ExamSyllabusMapping,
  SyllabusAuditLog,
  SyllabusConcept
} from '../types';
import { StorageService } from '../services/storageService';
import { EXAM_CATALOGUE } from '../data/mockData';

interface AdminSyllabusManagerProps {
  onDataModified: () => void;
}

const CATEGORIES: SubjectCategory[] = [
  'Engineering Sciences',
  'Structural Engineering',
  'Geotechnical & Water Resources',
  'Infrastructure & Surveying',
  'Management & Valuation',
  'General Studies & Aptitude',
];

export const AdminSyllabusManager: React.FC<AdminSyllabusManagerProps> = ({ onDataModified }) => {
  const [adminTab, setAdminTab] = useState<'7tier' | 'classic'>('7tier');

  // 7-Tier Scalable State
  const [exams, setExams] = useState<CivilExamHierarchyProfile[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('maha_pwd');
  const [canonicalSubjects, setCanonicalSubjects] = useState<CanonicalSubject[]>([]);
  const [examMappings, setExamMappings] = useState<ExamSyllabusMapping[]>([]);
  const [auditLogs, setAuditLogs] = useState<SyllabusAuditLog[]>([]);
  const [syllabusVersion, setSyllabusVersion] = useState<string>('2026.1');
  const [editingMapping, setEditingMapping] = useState<ExamSyllabusMapping | null>(null);

  // Classic Tree State
  const [tree, setTree] = useState<SyllabusSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('som');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Editor States
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SyllabusSubject | null>(null);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>('');
  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);

  // Subject Form State
  const [sCode, setSCode] = useState('');
  const [sName, setSName] = useState('');
  const [sCategory, setSCategory] = useState<SubjectCategory>('Structural Engineering');
  const [sWeightage, setSWeightage] = useState<number>(10);
  const [sDesc, setSDesc] = useState('');
  const [sIsCodes, setSIsCodes] = useState('');

  // Topic Form State
  const [tTitle, setTTitle] = useState('');
  const [tSubtopics, setTSubtopics] = useState('');
  const [tDifficulty, setTDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tImportance, setTImportance] = useState<'Very High' | 'High' | 'Medium' | 'Low'>('High');
  const [tQuestionCount, setTQuestionCount] = useState<number>(45);
  const [tExams, setTExams] = useState<ExamTargetId[]>(['maha_pwd', 'ssc_je', 'mpsc_civil']);
  const [tFormulas, setTFormulas] = useState('');
  const [tPyqFreq, setTPyqFreq] = useState('');

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = () => {
    const data = StorageService.getSyllabusTree();
    setTree(data);
    if (data.length > 0 && !data.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(data[0].id);
    }

    // Load 7-Tier hierarchy data
    setExams(StorageService.getExamsHierarchy());
    setCanonicalSubjects(StorageService.getCanonicalSubjects());
    setExamMappings(StorageService.getExamMappings());
    setAuditLogs(StorageService.getSyllabusAuditLogs());
    setSyllabusVersion(StorageService.getSyllabusVersion());
  };

  const handleUpdateMappingField = (
    mappingId: string,
    field: keyof ExamSyllabusMapping,
    value: any
  ) => {
    const maps = StorageService.getExamMappings();
    const target = maps.find((m) => m.id === mappingId);
    if (target) {
      (target as any)[field] = value;
      StorageService.updateExamMapping(target, 'admin@engineeringofficer.in');
      loadTree();
      onDataModified();
    }
  };

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSCode('CE-NEW');
    setSName('');
    setSCategory('Structural Engineering');
    setSWeightage(8);
    setSDesc('');
    setSIsCodes('');
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (subj: SyllabusSubject) => {
    setEditingSubject(subj);
    setSCode(subj.code);
    setSName(subj.name);
    setSCategory(subj.category);
    setSWeightage(subj.weightagePercent);
    setSDesc(subj.description);
    setSIsCodes(subj.isCodesRelevant.join(', '));
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const codesArray = sIsCodes
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    if (editingSubject) {
      const updated: SyllabusSubject = {
        ...editingSubject,
        code: sCode,
        name: sName,
        category: sCategory,
        weightagePercent: sWeightage,
        description: sDesc,
        isCodesRelevant: codesArray,
      };
      StorageService.updateSubject(updated);
    } else {
      const newSubjectId = `subj_${Date.now()}`;
      const newSubject: SyllabusSubject = {
        id: newSubjectId,
        code: sCode,
        name: sName,
        category: sCategory,
        order: tree.length + 1,
        isActive: true,
        weightagePercent: sWeightage,
        description: sDesc,
        icon: 'BookOpen',
        isCodesRelevant: codesArray,
        examTargetIds: ['maha_pwd', 'ssc_je', 'mpsc_civil', 'upsc_ese'],
        modules: [
          {
            id: `mod_${Date.now()}_1`,
            subjectId: newSubjectId,
            title: 'Unit 1: Fundamentals & Core Concepts',
            order: 1,
            isActive: true,
            topics: [],
          },
        ],
      };
      StorageService.addSubject(newSubject);
      setSelectedSubjectId(newSubjectId);
    }

    setShowSubjectModal(false);
    loadTree();
    onDataModified();
  };

  const handleToggleSubjectActive = (subjectId: string) => {
    StorageService.toggleSubjectActive(subjectId);
    loadTree();
    onDataModified();
  };

  const handleReorderSubject = (subjectId: string, direction: 'up' | 'down') => {
    StorageService.reorderSubject(subjectId, direction);
    loadTree();
    onDataModified();
  };

  // Topic Handlers
  const handleOpenAddTopic = (moduleId: string) => {
    setEditingTopic(null);
    setTargetModuleId(moduleId);
    setTTitle('');
    setTSubtopics('');
    setTDifficulty('medium');
    setTImportance('High');
    setTQuestionCount(40);
    setTExams(['maha_pwd', 'ssc_je', 'mpsc_civil']);
    setTFormulas('');
    setTPyqFreq('Frequent in State & Central exams');
    setShowTopicModal(true);
  };

  const handleOpenEditTopic = (moduleId: string, topic: SyllabusTopic) => {
    setEditingTopic(topic);
    setTargetModuleId(moduleId);
    setTTitle(topic.title);
    setTSubtopics(topic.subtopics.join('\n'));
    setTDifficulty(topic.difficulty);
    setTImportance(topic.importance);
    setTQuestionCount(topic.questionCount);
    setTExams(topic.examTargetIds);
    setTFormulas((topic.keyFormulas || []).join('\n'));
    setTPyqFreq(topic.pyqFrequency || '');
    setShowTopicModal(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const subtopicsList = tSubtopics
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const formulasList = tFormulas
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingTopic) {
      const updated: SyllabusTopic = {
        ...editingTopic,
        title: tTitle,
        subtopics: subtopicsList,
        difficulty: tDifficulty,
        importance: tImportance,
        questionCount: tQuestionCount,
        examTargetIds: tExams,
        keyFormulas: formulasList,
        pyqFrequency: tPyqFreq,
      };
      StorageService.updateTopic(selectedSubjectId, targetModuleId, updated);
    } else {
      const newTopic: SyllabusTopic = {
        id: `top_${Date.now()}`,
        subjectId: selectedSubjectId,
        moduleId: targetModuleId,
        title: tTitle,
        subtopics: subtopicsList,
        difficulty: tDifficulty,
        importance: tImportance,
        order: 99,
        isActive: true,
        questionCount: tQuestionCount,
        examTargetIds: tExams,
        keyFormulas: formulasList,
        pyqFrequency: tPyqFreq,
      };
      StorageService.addTopic(selectedSubjectId, targetModuleId, newTopic);
    }

    setShowTopicModal(false);
    loadTree();
    onDataModified();
  };

  const handleToggleTopic = (topicId: string) => {
    StorageService.toggleTopicActive(selectedSubjectId, topicId);
    loadTree();
    onDataModified();
  };

  const handleReorderTopic = (moduleId: string, topicId: string, dir: 'up' | 'down') => {
    StorageService.reorderTopic(selectedSubjectId, moduleId, topicId, dir);
    loadTree();
    onDataModified();
  };

  const handleAddModule = () => {
    const title = window.prompt('Enter new Module / Unit title:');
    if (!title?.trim()) return;

    const currentSub = tree.find((s) => s.id === selectedSubjectId);
    if (!currentSub) return;

    const newModule: SyllabusModule = {
      id: `mod_${Date.now()}`,
      subjectId: selectedSubjectId,
      title: title.trim(),
      order: currentSub.modules.length + 1,
      isActive: true,
      topics: [],
    };

    currentSub.modules.push(newModule);
    StorageService.updateSubject(currentSub);
    loadTree();
    onDataModified();
  };

  const currentSubject = tree.find((s) => s.id === selectedSubjectId) || tree[0];

  const filteredSubjects = tree.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Architecture Mode Selector */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="text-sm font-bold">Civil Syllabus Architectural Engine</h4>
            <p className="text-[11px] text-slate-400">
              Exam → Paper → Subject → Unit → Topic → Subtopic → Concept (Audited v{syllabusVersion})
            </p>
          </div>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setAdminTab('7tier')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              adminTab === '7tier'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            7-Tier Hierarchy & Mappings
          </button>
          <button
            onClick={() => setAdminTab('classic')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              adminTab === 'classic'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Classic 21-Discipline Tree
          </button>
        </div>
      </div>

      {adminTab === '7tier' ? (
        /* 7-TIER ARCHITECTURE & EXAM MAPPINGS ADMIN CONSOLE */
        <div className="space-y-5">
          {/* Exam Selection Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Recruitment Exam Cadre for Mapping & Weightages:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {exams.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExamId(ex.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedExamId === ex.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {ex.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Mappings Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Exam-Specific Syllabus Mappings: {exams.find((e) => e.id === selectedExamId)?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subjects and topics are canonical; their weightages, depth standards and PYQ patterns differ strictly per exam board.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Audited Version {syllabusVersion}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-3">Canonical Subject</th>
                    <th className="p-3">Inclusion Status</th>
                    <th className="p-3">Exam Weightage (%)</th>
                    <th className="p-3">Standard Depth</th>
                    <th className="p-3">Exam Notes & Trend</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {canonicalSubjects.map((subj) => {
                    const mapping = examMappings.find((m) => m.examId === selectedExamId && m.subjectId === subj.id);
                    const isEditing = editingMapping?.id === mapping?.id;

                    return (
                      <tr key={subj.id} className="hover:bg-slate-50/60">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{subj.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{subj.code} · {subj.units.length} Units</div>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            mapping?.inclusionStatus === 'core_compulsory'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {mapping?.inclusionStatus || 'core_compulsory'}
                          </span>
                        </td>

                        <td className="p-3 font-mono font-bold text-blue-600 text-sm">
                          {isEditing ? (
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={editingMapping?.examWeightagePercent || 10}
                              onChange={(e) => setEditingMapping({ ...editingMapping!, examWeightagePercent: Number(e.target.value) })}
                              className="w-16 p-1 border rounded font-bold"
                            />
                          ) : (
                            `${mapping?.examWeightagePercent || 12}%`
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editingMapping?.depthLevel || 'diploma_je'}
                              onChange={(e) => setEditingMapping({ ...editingMapping!, depthLevel: e.target.value as any })}
                              className="p-1 border rounded text-xs"
                            >
                              <option value="diploma_je">Diploma JE</option>
                              <option value="degree_ae">Degree AE</option>
                              <option value="advanced_ese">Advanced ESE</option>
                            </select>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {mapping?.depthLevel || 'diploma_je'}
                            </span>
                          )}
                        </td>

                        <td className="p-3 max-w-xs text-slate-600">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingMapping?.examSpecificNotes || ''}
                              onChange={(e) => setEditingMapping({ ...editingMapping!, examSpecificNotes: e.target.value })}
                              className="w-full p-1 border rounded text-xs"
                            />
                          ) : (
                            <span className="line-clamp-2">{mapping?.examSpecificNotes || 'Standard codal coverage'}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (editingMapping) {
                                    StorageService.updateExamMapping(editingMapping, 'admin@engineeringofficer.in');
                                    setEditingMapping(null);
                                    loadTree();
                                    onDataModified();
                                  }
                                }}
                                className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingMapping(null)}
                                className="p-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingMapping(mapping || {
                                id: `map-${Date.now()}`,
                                examId: selectedExamId,
                                paperId: 'default',
                                subjectId: subj.id,
                                inclusionStatus: 'core_compulsory',
                                examWeightagePercent: 12,
                                depthLevel: 'diploma_je',
                                examSpecificNotes: 'Standard coverage',
                                pyqFrequencyText: 'Regular questions',
                                lastAuditedDate: new Date().toISOString().split('T')[0]
                              })}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail Quick View */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Latest 5 Cryptographic Audit Records
            </h4>
            <div className="space-y-2">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">[{log.action}] {log.entityName}: </span>
                    <span className="text-slate-600">{log.changeSummary}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px] whitespace-nowrap ml-4">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* CLASSIC 21-SUBJECT CONTROLLER */
        <>
      {/* Top Banner & Subject Level Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Civil Engineering Syllabus Architecture Controller</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full data-driven syllabus tree. Add, edit, reorder, activate or deactivate any of the 21 disciplines and topics in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all subjects & topics back to default 21 Civil Engineering taxonomy?')) {
                StorageService.resetSyllabusToDefault();
                loadTree();
                onDataModified();
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tree</span>
          </button>
          <button
            onClick={handleOpenAddSubject}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center space-x-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Subjects List with Order & Active Toggles */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3.5 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5 max-h-[650px] overflow-y-auto pr-1 divide-y divide-slate-100">
            {filteredSubjects.map((s, idx) => {
              const isSelected = s.id === selectedSubjectId;
              return (
                <div
                  key={s.id}
                  className={`pt-1.5 flex items-center justify-between p-2 rounded-lg transition-all ${
                    isSelected ? 'bg-sky-50 border border-sky-300 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    onClick={() => setSelectedSubjectId(s.id)}
                    className="flex-1 text-left flex items-center space-x-2"
                  >
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        s.isActive ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-400 line-through'
                      }`}
                    >
                      {s.code}
                    </span>
                    <span className={`text-xs ${s.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                      {s.name}
                    </span>
                  </button>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleReorderSubject(s.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorderSubject(s.id, 'down')}
                      disabled={idx === filteredSubjects.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleSubjectActive(s.id)}
                      className={`p-1 ${s.isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                      title={s.isActive ? 'Active Subject (Click to disable)' : 'Inactive Subject (Click to activate)'}
                    >
                      {s.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenEditSubject(s)}
                      className="p-1 text-sky-600 hover:text-sky-800"
                      title="Edit Subject"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Subject Hierarchy & Topic Engine */}
        <div className="lg:col-span-8 space-y-4">
          {currentSubject && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              {/* Subject Information Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                      {currentSubject.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Category: {currentSubject.category}
                    </span>
                    <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ~{currentSubject.weightagePercent}% Exam Weight
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{currentSubject.name}</h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddModule}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Module</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditSubject(currentSubject)}
                    className="px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                </div>
              </div>

              {/* Modules & Topics */}
              <div className="space-y-4">
                {currentSubject.modules.map((mod) => (
                  <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-bold text-slate-900">{mod.title}</span>
                        <span className="text-[10px] text-slate-500">({mod.topics.length} topics)</span>
                      </div>
                      <button
                        onClick={() => handleOpenAddTopic(mod.id)}
                        className="px-2.5 py-1 text-xs font-bold text-sky-700 bg-white hover:bg-sky-50 border border-slate-300 rounded-md flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Topic</span>
                      </button>
                    </div>

                    {/* Topics under module */}
                    <div className="p-2 divide-y divide-slate-100 space-y-1">
                      {mod.topics.length === 0 ? (
                        <p className="text-xs text-slate-400 p-3 italic">No topics added to this unit yet.</p>
                      ) : (
                        mod.topics.map((t, tidx) => (
                          <div
                            key={t.id}
                            className={`p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg ${
                              t.isActive ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-slate-900">{t.title}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                    t.importance === 'Very High'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {t.importance}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {t.questionCount} MCQs
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {t.subtopics.join(', ')}
                              </p>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                onClick={() => handleReorderTopic(mod.id, t.id, 'up')}
                                disabled={tidx === 0}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move Topic Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReorderTopic(mod.id, t.id, 'down')}
                                disabled={tidx === mod.topics.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move Topic Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleTopic(t.id)}
                                className={`p-1 ${t.isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                                title="Toggle Topic Active"
                              >
                                {t.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleOpenEditTopic(mod.id, t)}
                                className="p-1 text-sky-600 hover:text-sky-800"
                                title="Edit Topic"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subject Create / Edit Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-sm">
              {editingSubject ? 'Edit Subject Details' : 'Add New Civil Engineering Subject'}
            </h3>
            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CE-SOM"
                    value={sCode}
                    onChange={(e) => setSCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={30}
                    value={sWeightage}
                    onChange={(e) => setSWeightage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strength of Materials (SOM)"
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={sCategory}
                  onChange={(e) => setSCategory(e.target.value as SubjectCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={sDesc}
                  onChange={(e) => setSDesc(e.target.value)}
                  placeholder="Summary of syllabus scope and core topics..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Relevant IS / IRC Codes (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="IS 456:2000, IS 800:2007, SP 16"
                  value={sIsCodes}
                  onChange={(e) => setSIsCodes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Create / Edit Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-sm">
              {editingTopic ? 'Edit Topic' : 'Add New Topic to Unit'}
            </h3>
            <form onSubmit={handleSaveTopic} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohr’s Circle & Principal Stresses"
                  value={tTitle}
                  onChange={(e) => setTTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={tDifficulty}
                    onChange={(e) => setTDifficulty(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Importance</label>
                  <select
                    value={tImportance}
                    onChange={(e) => setTImportance(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300"
                  >
                    <option value="Very High">Very High</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MCQ Count</label>
                  <input
                    type="number"
                    value={tQuestionCount}
                    onChange={(e) => setTQuestionCount(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subtopics (One per line)
                </label>
                <textarea
                  rows={3}
                  value={tSubtopics}
                  onChange={(e) => setTSubtopics(e.target.value)}
                  placeholder="Transformation of Plane Stress&#10;Major & Minor Principal Stresses&#10;Radius and Center of Mohr Circle"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Key Formulas / High-Yield Equations (One per line)
                </label>
                <textarea
                  rows={2}
                  value={tFormulas}
                  onChange={(e) => setTFormulas(e.target.value)}
                  placeholder="σ1,2 = (σx + σy)/2 ± √[((σx - σy)/2)^2 + τxy^2]&#10;τ_max = (σ1 - σ2)/2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PYQ Frequency Note</label>
                <input
                  type="text"
                  placeholder="e.g. 1-2 questions in every PWD / SSC shift"
                  value={tPyqFreq}
                  onChange={(e) => setTPyqFreq(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Exams</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {EXAM_CATALOGUE.map((exam) => (
                    <label key={exam.id} className="flex items-center space-x-1.5 text-[11px]">
                      <input
                        type="checkbox"
                        checked={tExams.includes(exam.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTExams([...tExams, exam.id]);
                          } else {
                            setTExams(tExams.filter((id) => id !== exam.id));
                          }
                        }}
                      />
                      <span>{exam.shortName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
