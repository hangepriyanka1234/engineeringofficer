import React, { useState } from 'react';
import { X, Sparkles, Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';
import { MockTest, ExamTargetId, SubjectId, NegativeMarkingScheme } from '../../types';
import { StorageService } from '../../services/storageService';

interface CustomTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCreated: (test: MockTest) => void;
  selectedExam: ExamTargetId;
}

export const CustomTestModal: React.FC<CustomTestModalProps> = ({
  isOpen,
  onClose,
  onTestCreated,
  selectedExam,
}) => {
  const [title, setTitle] = useState('');
  const [targetExam, setTargetExam] = useState<ExamTargetId>(selectedExam);
  const [mockCategory, setMockCategory] = useState<MockTest['mockCategory']>('custom_admin');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [negativeScheme, setNegativeScheme] = useState<NegativeMarkingScheme>('one_fourth');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<'Standard' | 'Advanced' | 'PYQ Replica'>('Standard');

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const allQuestions = StorageService.getQuestions();
    let eligible = allQuestions;

    if (selectedSubject !== 'all') {
      eligible = eligible.filter((q) => q.subjectId === selectedSubject);
    }

    if (eligible.length === 0) {
      eligible = allQuestions;
    }

    // Shuffle and pick
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    const pickedIds = picked.map((q) => q.id);

    // Negative marking ratio
    let negativeRatio = 0.25;
    if (negativeScheme === 'none') negativeRatio = 0.0;
    else if (negativeScheme === 'one_third') negativeRatio = 0.3333;
    else if (negativeScheme === 'one_fourth') negativeRatio = 0.25;

    const marksPerQ = 2;
    const totalMarks = pickedIds.length * marksPerQ;
    const passingScore = Math.round(totalMarks * 0.5);

    const newTest: MockTest = {
      id: `custom-${Date.now()}`,
      title: title.trim() || `Custom Civil Diagnostic Mock (${pickedIds.length} Qs)`,
      examTargetId: targetExam,
      mockCategory: mockCategory,
      mockType: 'custom',
      subjectId: selectedSubject !== 'all' ? (selectedSubject as SubjectId) : undefined,
      durationMinutes,
      totalMarks,
      negativeMarking: negativeRatio,
      negativeMarkingScheme: negativeScheme,
      passingScore,
      questionIds: pickedIds,
      sections: [
        {
          id: 'sec-custom-1',
          name: 'Custom Curated Section',
          questionIds: pickedIds,
          marksPerQuestion: marksPerQ,
          negativeMarksPerQuestion: marksPerQ * negativeRatio,
        },
      ],
      hasSectionTiming: false,
      randomizeQuestions: true,
      difficulty,
      isFree: true,
      requiredTier: 'Free Starter',
      totalAttempts: 1,
      avgScore: Math.round(totalMarks * 0.6),
      createdAt: new Date().toISOString().split('T')[0],
      attemptPolicy: {
        maxAttempts: 5,
        allowRetakes: true,
        cooldownHours: 0,
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
      instructions: [
        `Custom generated test with ${pickedIds.length} questions.`,
        `Negative marking: ${
          negativeScheme === 'none'
            ? 'None (0%)'
            : negativeScheme === 'one_third'
            ? '1/3rd penalty'
            : '1/4th penalty (25%)'
        }.`,
        `Total duration: ${durationMinutes} minutes.`,
      ],
    };

    // Also sync to server test engine in background
    fetch('/api/admin/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTest),
    }).catch((err) => console.warn('Server sync of custom test delayed:', err));

    StorageService.addMockTest(newTest);
    onTestCreated(newTest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Custom Mock Test Generator</h3>
              <p className="text-xs text-slate-500">Configure custom duration, questions & marking rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {/* Test Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Test Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. My SOM & RCC Weekend Speed Drill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Target Exam */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam Cadre</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value as ExamTargetId)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="maha_pwd">Maharashtra PWD JE</option>
                <option value="mpsc_civil">MPSC MES Civil</option>
                <option value="ssc_je">SSC JE (Civil)</option>
                <option value="wrd_irrigation">WRD Jalsampada</option>
                <option value="zp_civil">Zilla Parishad (ZP)</option>
                <option value="bmc_municipal">BMC Municipal</option>
                <option value="rrb_je">RRB JE</option>
                <option value="upsc_ese">UPSC ESE</option>
              </select>
            </div>

            {/* Test Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mock Type</label>
              <select
                value={mockCategory}
                onChange={(e) => setMockCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="custom_admin">Custom Admin / Diagnostic</option>
                <option value="subject_test">Subject Test</option>
                <option value="chapter_test">Chapter Test</option>
                <option value="mini_test">Mini Test / Speed Sprint</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Scope</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="all">All Civil Subjects (Mixed)</option>
                <option value="rcc_concrete">RCC & Concrete Tech</option>
                <option value="som">Strength of Materials</option>
                <option value="soil_mechanics">Soil Mechanics & Geo</option>
                <option value="fluid_mechanics">Fluid Mechanics & OCF</option>
                <option value="building_materials">Building Materials</option>
                <option value="steel_structures">Design of Steel</option>
                <option value="surveying">Surveying & Levelling</option>
                <option value="environmental">Environmental Engg</option>
                <option value="transportation">Highway & Transport</option>
                <option value="hydrology_irrigation">Hydrology & Irrigation</option>
              </select>
            </div>

            {/* Negative Marking Rule */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Negative Marking</label>
              <select
                value={negativeScheme}
                onChange={(e) => setNegativeScheme(e.target.value as NegativeMarkingScheme)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="one_fourth">1/4th (25%) — SSC JE, PWD</option>
                <option value="one_third">1/3rd (33.3%) — ESE, RRB</option>
                <option value="none">No Negative (0%) — ZP, Qualifying</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Question Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Questions: <span className="text-sky-600 font-bold">{questionCount}</span>
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration: <span className="text-sky-600 font-bold">{durationMinutes} Mins</span>
              </label>
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate & Launch Test</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
