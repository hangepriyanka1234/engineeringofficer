import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Clock,
  Award,
  Layers,
  Shuffle,
  ShieldAlert,
  CheckCircle2,
  X,
  Search,
  Filter,
  Save,
  AlertTriangle,
  FileText,
  Sliders,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { mockTestService } from '../services/mockTestService';
import { MockTest, ExamTargetId, SubjectId, TestSection } from '../types';
import { EXAM_CATALOGUE as EXAM_TARGETS, SUBJECTS_LIST as SUBJECTS } from '../data/mockData';

interface AdminMockTestManagerProps {
  actorEmail?: string;
}

export const AdminMockTestManager: React.FC<AdminMockTestManagerProps> = ({
  actorEmail = 'admin@sp-engineering.gov.in',
}) => {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<MockTest>>({
    title: '',
    examTargetId: 'maha_pwd',
    mockCategory: 'full_length' as any,
    mockType: 'full_length',
    subjectId: undefined,
    topicName: '',
    durationMinutes: 120,
    totalMarks: 200,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 100,
    difficulty: 'Standard',
    isFree: true,
    requiredTier: 'Free Starter',
    randomizeQuestions: true,
    hasSectionTiming: false,
    instructions: [
      'Standard Civil Engineering CBT Examination rules apply.',
      'Paper carries negative marking for incorrect attempts.',
      'Auto-submits when countdown timer expires.',
    ],
    attemptPolicy: {
      maxAttempts: 3,
      allowRetakes: true,
      cooldownHours: 24,
      randomizeQuestions: true,
      shuffleOptions: false,
      allowSectionSwitching: true,
      allowReview: true,
    },
    sectionRules: {
      enforceSectionOrder: false,
      enforceSectionTimeLimit: false,
      lockSubmittedSections: false,
      allowSectionSwitching: true,
    },
    sections: [
      {
        id: 'sec-1',
        name: 'Technical Section',
        questionIds: ['q-101', 'q-102', 'q-103', 'q-104'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
    ],
    questionIds: ['q-101', 'q-102', 'q-103', 'q-104'],
  });

  // Question Picker State
  const [isQuestionPickerOpen, setIsQuestionPickerOpen] = useState<boolean>(false);
  const [targetSectionIdx, setTargetSectionIdx] = useState<number>(0);
  const [questionPool, setQuestionPool] = useState<any[]>([]);
  const [poolSubjectFilter, setPoolSubjectFilter] = useState<string>('all');
  const [poolSearch, setPoolSearch] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await mockTestService.getAdminTests();
      setTests(data);
    } catch (err: any) {
      showNotification('Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionPool = async () => {
    try {
      const pool = await mockTestService.getQuestionsPool();
      setQuestionPool(pool);
    } catch (err) {
      console.error('Failed to load question pool:', err);
    }
  };

  useEffect(() => {
    loadTests();
    loadQuestionPool();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingTestId(null);
    setFormData({
      title: '',
      examTargetId: 'maha_pwd',
      mockCategory: 'full_length' as any,
      mockType: 'full_length',
      subjectId: undefined,
      topicName: '',
      durationMinutes: 120,
      totalMarks: 200,
      negativeMarking: 0.25,
      negativeMarkingScheme: 'one_fourth',
      passingScore: 100,
      difficulty: 'Standard',
      isFree: true,
      requiredTier: 'Free Starter',
      randomizeQuestions: true,
      hasSectionTiming: false,
      instructions: [
        'Standard Civil Engineering CBT Examination rules apply.',
        'Negative deduction applies per incorrect response.',
        'Questions can be flagged for review during examination.',
      ],
      attemptPolicy: {
        maxAttempts: 3,
        allowRetakes: true,
        cooldownHours: 24,
        randomizeQuestions: true,
        shuffleOptions: false,
        allowSectionSwitching: true,
        allowReview: true,
      },
      sectionRules: {
        enforceSectionOrder: false,
        enforceSectionTimeLimit: false,
        lockSubmittedSections: false,
        allowSectionSwitching: true,
      },
      sections: [
        {
          id: 'sec-1',
          name: 'Section 1: Technical Core',
          questionIds: ['q-101', 'q-102', 'q-103', 'q-104'],
          marksPerQuestion: 2,
          negativeMarksPerQuestion: 0.5,
        },
      ],
      questionIds: ['q-101', 'q-102', 'q-103', 'q-104'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (test: MockTest) => {
    setEditingTestId(test.id);
    setFormData({
      ...test,
      mockType: (test.mockType || test.mockCategory || 'full_length') as any,
      attemptPolicy: test.attemptPolicy || {
        maxAttempts: 3,
        allowRetakes: true,
        cooldownHours: 24,
        randomizeQuestions: true,
        allowSectionSwitching: true,
        allowReview: true,
      },
      sectionRules: test.sectionRules || {
        enforceSectionOrder: false,
        enforceSectionTimeLimit: false,
        lockSubmittedSections: false,
        allowSectionSwitching: true,
      },
      sections: test.sections && test.sections.length > 0 ? test.sections : [
        {
          id: 'sec-main',
          name: 'Main Section',
          questionIds: test.questionIds,
          marksPerQuestion: 2,
          negativeMarksPerQuestion: 0.5,
        }
      ]
    });
    setIsModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showNotification('Please enter a valid title for the mock test', 'error');
      return;
    }

    setSaving(true);
    try {
      // Synchronize overall questionIds from all sections
      const aggregatedQIds = Array.from(
        new Set((formData.sections || []).flatMap((sec) => sec.questionIds))
      );

      const payload = {
        ...formData,
        questionIds: aggregatedQIds.length > 0 ? aggregatedQIds : formData.questionIds,
      };

      if (editingTestId) {
        await mockTestService.adminUpdateTest(editingTestId, payload);
        showNotification('Mock test configuration updated successfully', 'success');
      } else {
        await mockTestService.adminCreateTest(payload);
        showNotification('New mock test configured and published to live catalog', 'success');
      }
      setIsModalOpen(false);
      loadTests();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save test', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (testId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete mock test "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await mockTestService.adminDeleteTest(testId);
      showNotification('Mock test removed from catalog', 'success');
      loadTests();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete test', 'error');
    }
  };

  const handleCloneTest = async (testId: string) => {
    try {
      await mockTestService.adminCloneTest(testId);
      showNotification('Test duplicated successfully with new ID', 'success');
      loadTests();
    } catch (err: any) {
      showNotification(err.message || 'Failed to clone test', 'error');
    }
  };

  // Section handling inside modal
  const handleAddSection = () => {
    const newSecNum = (formData.sections?.length || 0) + 1;
    const newSection: TestSection = {
      id: `sec-${Date.now()}`,
      name: `Section ${newSecNum}: Core Topics`,
      questionIds: ['q-101'],
      durationMinutes: 30,
      marksPerQuestion: 2,
      negativeMarksPerQuestion: 0.5,
    };
    setFormData((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));
  };

  const handleRemoveSection = (secIdx: number) => {
    if ((formData.sections?.length || 0) <= 1) {
      showNotification('Test must contain at least one section', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((_, idx) => idx !== secIdx),
    }));
  };

  const handleUpdateSection = (secIdx: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.sections || [])];
      updated[secIdx] = { ...updated[secIdx], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  // Question Picker logic
  const openQuestionPickerForSection = (secIdx: number) => {
    setTargetSectionIdx(secIdx);
    setIsQuestionPickerOpen(true);
  };

  const toggleQuestionForSection = (questionId: string) => {
    setFormData((prev) => {
      const sections = [...(prev.sections || [])];
      const targetSec = sections[targetSectionIdx];
      if (!targetSec) return prev;

      const qList = targetSec.questionIds || [];
      const exists = qList.includes(questionId);

      const updatedQList = exists
        ? qList.filter((id) => id !== questionId)
        : [...qList, questionId];

      sections[targetSectionIdx] = {
        ...targetSec,
        questionIds: updatedQList,
      };

      return {
        ...prev,
        sections,
        questionIds: Array.from(new Set(sections.flatMap((s) => s.questionIds))),
      };
    });
  };

  // Filtered tests
  const filteredTests = tests.filter((t) => {
    if (activeTypeFilter !== 'all' && (t.mockType || t.mockCategory) !== activeTypeFilter) {
      return false;
    }
    if (selectedExamFilter !== 'all' && t.examTargetId !== selectedExamFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.instructions.some((ins) => ins.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">
              CBT Mock Test Configuration Engine
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure duration, marks, negative marking, section rules, question selection, randomization, and attempt policies.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Mock Test
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Mock Types' },
            { id: 'full_length', label: 'Full-Length CBTs' },
            { id: 'sectional', label: 'Sectional Mocks' },
            { id: 'subject', label: 'Subject Tests' },
            { id: 'topic', label: 'Topic Tests' },
            { id: 'custom', label: 'Custom Mocks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTypeFilter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tests by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Exam Targets</option>
              {EXAM_TARGETS.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tests Catalog Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading mock test definitions from server...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-base font-semibold text-slate-700">No Mock Tests Found</p>
          <p className="text-sm text-slate-400 mt-1">Try changing your filters or create a new mock test above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => {
            const exam = EXAM_TARGETS.find((e) => e.id === test.examTargetId);
            const totalQuestionsCount = (test.questionIds || []).length;
            const sectionsCount = (test.sections || []).length;

            return (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {test.mockType || test.mockCategory || 'Full Length'}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                        test.isFree
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {test.isFree ? 'Free Starter' : test.requiredTier}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 mb-1">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{exam?.name || test.examTargetId}</p>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg text-xs text-slate-600 mb-4">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.durationMinutes} Mins</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{totalQuestionsCount} Qs ({sectionsCount} Secs)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                      <span>-{test.negativeMarking * 100}% Negative</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[11px] text-slate-500 mb-3">
                    {test.randomizeQuestions && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        <Shuffle className="w-2.5 h-2.5 mr-1" /> Shuffled
                      </span>
                    )}
                    {test.hasSectionTiming && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        <Clock className="w-2.5 h-2.5 mr-1" /> Section Timed
                      </span>
                    )}
                    {test.sectionRules?.lockSubmittedSections && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                        Section Locked
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{test.totalAttempts || 0}</span> attempts
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCloneTest(test.id)}
                      title="Clone Test"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(test)}
                      title="Edit Configuration"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id, test.title)}
                      title="Delete Mock Test"
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingTestId ? 'Edit Mock Test Configuration' : 'Configure New Civil Engineering Mock Test'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveTest} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* SECTION 1: Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Basic Information & Exam Scope
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mock Test Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Maha PWD JE Civil All-State Full CBT Simulation — Test 02"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mock Category / Type *
                    </label>
                    <select
                      value={formData.mockType || 'full_length'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mockType: e.target.value as any,
                          mockCategory: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="full_length">Full-Length CBT Mock</option>
                      <option value="sectional">Sectional Mock Test</option>
                      <option value="subject">Subject Mastery Test</option>
                      <option value="topic">Topic-Wise Test</option>
                      <option value="custom">Custom Student/Admin Mock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Examination *
                    </label>
                    <select
                      value={formData.examTargetId || 'maha_pwd'}
                      onChange={(e) =>
                        setFormData({ ...formData, examTargetId: e.target.value as ExamTargetId })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {EXAM_TARGETS.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.name} ({target.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty || 'Standard'}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Standard">Standard Exam Pattern</option>
                      <option value="Advanced">Advanced (High Difficulty)</option>
                      <option value="PYQ Replica">PYQ Replica Pattern</option>
                    </select>
                  </div>
                </div>

                {(formData.mockType === 'subject' || formData.mockType === 'topic') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Specific Subject
                      </label>
                      <select
                        value={formData.subjectId || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, subjectId: e.target.value as SubjectId })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      >
                        <option value="">Select Subject...</option>
                        {SUBJECTS.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Topic Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.topicName || ''}
                        onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
                        placeholder="e.g. Limit State of Flexure & IS 456 Cl. 26"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Duration, Marks & Negative Marking */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Timing, Marks & Negative Deduction Rules
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={360}
                      value={formData.durationMinutes || 120}
                      onChange={(e) =>
                        setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Marks *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={1000}
                      value={formData.totalMarks || 200}
                      onChange={(e) =>
                        setFormData({ ...formData, totalMarks: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Passing Marks *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={formData.totalMarks || 200}
                      value={formData.passingScore || 100}
                      onChange={(e) =>
                        setFormData({ ...formData, passingScore: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Negative Marking Scheme *
                    </label>
                    <select
                      value={formData.negativeMarkingScheme || 'one_fourth'}
                      onChange={(e) => {
                        const scheme = e.target.value as any;
                        let ratio = 0.25;
                        if (scheme === 'none') ratio = 0;
                        if (scheme === 'one_third') ratio = 0.3333;
                        if (scheme === 'one_fourth') ratio = 0.25;
                        setFormData({
                          ...formData,
                          negativeMarkingScheme: scheme,
                          negativeMarking: ratio,
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="none">No Negative Marking (0%)</option>
                      <option value="one_fourth">1/4th Negative (25%)</option>
                      <option value="one_third">1/3rd Negative (33.3%)</option>
                      <option value="custom">Custom Deduction Ratio</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Sections & Section Rules */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      3. Section Rules & Question Assignment
                    </h4>
                    <p className="text-xs text-slate-500">
                      Define multi-section tests with custom question allocations and section rules.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="inline-flex items-center px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Section
                  </button>
                </div>

                {/* Section Rules Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSectionTiming || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasSectionTiming: e.target.checked,
                          sectionRules: {
                            ...formData.sectionRules,
                            enforceSectionTimeLimit: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 font-medium">Enable Sectional Timing</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sectionRules?.enforceSectionOrder || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sectionRules: {
                            ...formData.sectionRules,
                            enforceSectionOrder: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 font-medium">Enforce Section Order</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sectionRules?.lockSubmittedSections || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sectionRules: {
                            ...formData.sectionRules,
                            lockSubmittedSections: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 font-medium">Lock Submitted Sections</span>
                  </label>
                </div>

                {/* Individual Sections List */}
                <div className="space-y-3">
                  {(formData.sections || []).map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Section #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(idx)}
                          className="text-slate-400 hover:text-rose-600 text-xs font-medium"
                        >
                          Remove Section
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Section Name
                          </label>
                          <input
                            type="text"
                            value={sec.name}
                            onChange={(e) => handleUpdateSection(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>

                        {formData.hasSectionTiming && (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Section Time (Minutes)
                            </label>
                            <input
                              type="number"
                              value={sec.durationMinutes || 30}
                              onChange={(e) =>
                                handleUpdateSection(idx, 'durationMinutes', Number(e.target.value))
                              }
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Marks / Q
                          </label>
                          <input
                            type="number"
                            value={sec.marksPerQuestion || 2}
                            onChange={(e) =>
                              handleUpdateSection(idx, 'marksPerQuestion', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-600">
                          <span className="font-bold text-slate-900">
                            {sec.questionIds?.length || 0}
                          </span>{' '}
                          Questions selected in this section
                        </div>
                        <button
                          type="button"
                          onClick={() => openQuestionPickerForSection(idx)}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-semibold transition"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1" />
                          Select Questions from Bank ({sec.questionIds?.length || 0})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Randomization & Attempt Policy */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  4. Randomization & Attempt Policy
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Attempts Allowed
                    </label>
                    <select
                      value={formData.attemptPolicy?.maxAttempts || 3}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attemptPolicy: {
                            ...formData.attemptPolicy,
                            maxAttempts: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value={1}>1 Single Attempt Only (Strict Mock)</option>
                      <option value={2}>2 Attempts</option>
                      <option value={3}>3 Attempts (Standard)</option>
                      <option value={5}>5 Attempts</option>
                      <option value={999}>Unlimited Attempts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Retake Cooldown (Hours)
                    </label>
                    <input
                      type="number"
                      value={formData.attemptPolicy?.cooldownHours || 24}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attemptPolicy: {
                            ...formData.attemptPolicy,
                            cooldownHours: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Required Access Tier
                    </label>
                    <select
                      value={formData.requiredTier || 'Free Starter'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiredTier: e.target.value as any,
                          isFree: e.target.value === 'Free Starter',
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="Free Starter">Free Starter (Open Access)</option>
                      <option value="Blueprint Pro JE">Blueprint Pro JE</option>
                      <option value="Officer Master AE/IES">Officer Master AE/IES</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.randomizeQuestions ?? true}
                      onChange={(e) =>
                        setFormData({ ...formData, randomizeQuestions: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Randomize question order for each candidate</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.attemptPolicy?.shuffleOptions ?? false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attemptPolicy: {
                            ...formData.attemptPolicy,
                            shuffleOptions: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Shuffle options (A, B, C, D) per question</span>
                  </label>
                </div>
              </div>

              {/* Security notice */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start space-x-2.5 text-xs text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Server-Side Authoritative Security:</span> Correct answers and
                  explanations are never dispatched to the candidate’s browser during an active test session.
                  Results are verified and signed server-side with HMAC to prevent client-side manipulation.
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : editingTestId ? 'Update Mock Test' : 'Publish Mock Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION PICKER MODAL */}
      {isQuestionPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Question Bank Selection — Section #
                  {targetSectionIdx + 1}
                </h4>
                <p className="text-xs text-slate-500">
                  Select questions from the Civil Master Question Bank for this section.
                </p>
              </div>
              <button
                onClick={() => setIsQuestionPickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter in picker */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-white">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions by topic, code, or keywords..."
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <select
                value={poolSubjectFilter}
                onChange={(e) => setPoolSubjectFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-xs"
              >
                <option value="all">All Subjects</option>
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Question List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {questionPool
                .filter((q) => {
                  if (poolSubjectFilter !== 'all' && q.subjectId !== poolSubjectFilter) return false;
                  if (poolSearch.trim()) {
                    const str = poolSearch.toLowerCase();
                    return (
                      q.stem.toLowerCase().includes(str) ||
                      (q.topic && q.topic.toLowerCase().includes(str)) ||
                      (q.isCodeReference && q.isCodeReference.toLowerCase().includes(str))
                    );
                  }
                  return true;
                })
                .map((q) => {
                  const targetSec = (formData.sections || [])[targetSectionIdx];
                  const isSelected = targetSec?.questionIds?.includes(q.id);

                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionForSection(q.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-start space-x-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-slate-700 capitalize">
                            {q.subjectId?.replace('_', ' ')}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{q.topic || 'General'}</span>
                          {q.isCodeReference && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[10px] font-mono">
                              {q.isCodeReference}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-900 font-medium">{q.stem}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Picker Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                {(formData.sections || [])[targetSectionIdx]?.questionIds?.length || 0} questions selected
              </span>
              <button
                onClick={() => setIsQuestionPickerOpen(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Done Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
