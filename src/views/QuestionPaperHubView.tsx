import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  FileCheck2,
  Calendar,
  Layers,
  Award,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitCompare,
  Plus,
  BookOpen,
  GraduationCap,
  History,
  Info
} from 'lucide-react';
import {
  ScalableExamCatalogueItem,
  ScalableQuestionPaper,
  ScalableHubQuestion,
  ExamCategoryType,
} from '../types/examHub';
import { ExamHubService } from '../services/examHubService';
import { AdminExamCatalogueManager } from '../components/AdminExamCatalogueManager';
import { AdminDuplicateDetectorModal } from '../components/AdminDuplicateDetectorModal';
import { CBTExamModal } from '../components/CBTExamModal';

interface QuestionPaperHubViewProps {
  isAdmin?: boolean;
  userEmail?: string;
  onNavigateToAdmin?: () => void;
}

export const QuestionPaperHubView: React.FC<QuestionPaperHubViewProps> = ({
  isAdmin = false,
  userEmail = 'student@sp-engineering.gov.in',
  onNavigateToAdmin,
}) => {
  // Navigation & Filtering State
  const [selectedCategory, setSelectedCategory] = useState<ExamCategoryType | 'ALL'>('ALL');
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [questionFilterMode, setQuestionFilterMode] = useState<'ALL' | 'PYQ_ONLY' | 'AI_ONLY'>('ALL');

  // Modals State
  const [showAdminCatalogue, setShowAdminCatalogue] = useState<boolean>(false);
  const [showDuplicateDetector, setShowDuplicateDetector] = useState<boolean>(false);
  const [selectedPaperForCBT, setSelectedPaperForCBT] = useState<ScalableQuestionPaper | null>(null);

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

  const exams = ExamHubService.getExams(selectedCategory, searchQuery);
  const papers = ExamHubService.getQuestionPapers(selectedExamId, selectedYear, selectedCategory);
  const sampleQuestions = ExamHubService.getQuestions({
    examId: selectedExamId,
    isPyqOnly: questionFilterMode === 'PYQ_ONLY',
    aiQuestionsOnly: questionFilterMode === 'AI_ONLY',
    search: searchQuery,
  });

  const handleStartCBT = (paper: ScalableQuestionPaper) => {
    setSelectedPaperForCBT(paper);
  };

  return (
    <div className="space-y-6 text-slate-800 pb-12">
      {/* Hero Header */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-sky-500/10 blur-3xl rounded-full -mr-16 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-mono font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Engineering Exam & Question Paper Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Civil Engineering Exam Catalogue & Question Paper Repository
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              भारतातील मध्यवर्ती, महाराष्ट्र शासन, PSU, रेल्वे व महानगरपालिकांच्या सर्व सिव्हिल इंजिनिअरिंग परीक्षांची प्रश्नपत्रिका उतरवा, सराव करा व TCS iON पद्धतीनुसार CBT टेस्ट द्या.
            </p>
          </div>

          {/* Admin Tools Quick Trigger */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAdminCatalogue(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Exam Manager</span>
              </button>
              <button
                onClick={() => setShowDuplicateDetector(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center space-x-2"
              >
                <GitCompare className="w-4 h-4" />
                <span>Duplicate Scanner</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 8 Exam Category Selector */}
      <div className="space-y-3">
        <div className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
          Exam Categories (परीक्षेचे वर्ग)
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedExamId('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === 'ALL'
                ? 'bg-sky-500 text-white shadow-sky-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            सर्व परीक्षा (All Categories)
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedExamId('ALL');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-sky-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Mode Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="परीक्षेचे नाव, वर्ष किंवा विषय शोधा (उदा. MPSC AE 2023, SSC JE, BMC Sub Eng)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Official PYQ vs AI Question Mode Filter */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setQuestionFilterMode('ALL')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              questionFilterMode === 'ALL' ? 'bg-white text-slate-800 shadow' : 'text-slate-600'
            }`}
          >
            सर्व प्रश्न
          </button>
          <button
            onClick={() => setQuestionFilterMode('PYQ_ONLY')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              questionFilterMode === 'PYQ_ONLY' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            🏛️ Official PYQ
          </button>
          <button
            onClick={() => setQuestionFilterMode('AI_ONLY')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              questionFilterMode === 'AI_ONLY' ? 'bg-purple-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            🤖 AI Practice
          </button>
        </div>
      </div>

      {/* Exam Catalogue Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-sky-600" />
            <span>Active Exam Catalogues ({exams.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setSelectedExamId(ex.id === selectedExamId ? 'ALL' : ex.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                selectedExamId === ex.id
                  ? 'bg-sky-50/90 border-sky-400 shadow-md ring-2 ring-sky-400/40'
                  : 'bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                    {ex.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{ex.exam_name}</h3>
                  <div className="text-[11px] font-semibold text-sky-600 font-mono">{ex.short_name}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {ex.active_recruitments_count || 120}+ Posts
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div><strong>Authority:</strong> {ex.authority}</div>
                <div><strong>Pattern:</strong> {ex.exam_pattern}</div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1 font-mono">
                  <span>Marks: {ex.marks}</span>
                  <span>Duration: {ex.duration}m</span>
                  <span>Neg: {ex.negative_marking}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={ex.official_website}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sky-600 font-semibold hover:underline flex items-center space-x-1 text-[11px]"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[11px] font-bold text-slate-700">
                  {selectedExamId === ex.id ? 'Selected' : 'Select Paper'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Paper Repository (Hierarchy Explorer) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <span>Official Question Papers & CBT Test Series</span>
            </h2>
            <p className="text-xs text-slate-500">
              Exam → Year → Paper → Shift नुसार वर्गीकरण केलेल्या अधिकृत प्रश्नपत्रिका
            </p>
          </div>
        </div>

        {papers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">कोणतीही प्रश्नपत्रिका आढळली नाही</h4>
            <p className="text-xs text-slate-500">कृपया फिल्टर किंवा शोध शब्द बदलून पहा.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {papers.map((p) => (
              <div
                key={p.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                        {p.year}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        🏛️ Official PYQ Paper
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{p.paper_name}</h3>
                    <div className="text-xs text-slate-600 font-medium">
                      {p.exam_name} • {p.shift}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono">
                  <div>
                    <div className="text-slate-400 text-[10px]">Questions</div>
                    <div className="font-bold text-slate-800">{p.total_questions} Qs</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Total Marks</div>
                    <div className="font-bold text-slate-800">{p.total_marks} Marks</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Duration</div>
                    <div className="font-bold text-slate-800">{p.duration_minutes} Mins</div>
                  </div>
                </div>

                {/* Sections breakdown */}
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider font-mono">
                    Sections Hierarchy:
                  </div>
                  {p.sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-2 rounded bg-slate-50 text-slate-700 text-[11px] flex justify-between items-center"
                    >
                      <span className="font-medium">{sec.section_name}</span>
                      <span className="font-mono font-bold text-sky-600">{sec.question_count} Qs</span>
                    </div>
                  ))}
                </div>

                {/* Attempt Status & Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {p.user_best_score !== undefined ? (
                      <div className="text-xs">
                        <span className="text-slate-500">Best Score: </span>
                        <strong className="text-emerald-600 font-mono">{p.user_best_score} Marks ({p.user_accuracy}%)</strong>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Not attempted yet</div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartCBT(p)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start CBT Exam</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questions Preview Feed (With Strict PYQ vs AI Badges) */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <span>Question Bank Explorer ({sampleQuestions.length} Questions)</span>
          </h2>
          <div className="text-xs font-mono text-slate-500">
            Official Key Verified & AI Concept Drills
          </div>
        </div>

        <div className="space-y-4">
          {sampleQuestions.map((q) => (
            <div
              key={q.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3 text-xs"
            >
              {/* Question Header & Strict Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  {q.is_pyq ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>🏛️ Official PYQ ({q.year})</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px] flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>🤖 AI Practice Question (AI जनरेटेड)</span>
                    </span>
                  )}
                  <span className="text-slate-500 font-mono text-[11px]">{q.subject}</span>
                </div>
                <span className="font-mono text-slate-400 text-[10px]">ID: {q.id}</span>
              </div>

              {/* Problem Text */}
              <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                {q.question_text}
              </div>

              {/* Marathi Bilingual Version */}
              {q.marathi_text && (
                <div className="p-2.5 bg-sky-50 rounded-xl text-sky-900 text-xs">
                  <strong>मराठी: </strong>{q.marathi_text}
                </div>
              )}

              {/* Options Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-2 rounded-lg border text-xs flex items-center space-x-2 ${
                      opt.id === q.correct_answer
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono flex items-center justify-center font-bold text-[10px]">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>

              {/* Provenance & Solution */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-slate-700 text-[11px]">
                <div><strong className="text-sky-700">Source / Provenance:</strong> {q.source}</div>
                <div><strong className="text-emerald-700">Explanation:</strong> {q.explanation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAdminCatalogue && (
        <AdminExamCatalogueManager onClose={() => setShowAdminCatalogue(false)} />
      )}

      {showDuplicateDetector && (
        <AdminDuplicateDetectorModal onClose={() => setShowDuplicateDetector(false)} />
      )}

      {selectedPaperForCBT && (
        <CBTExamModal
          paper={selectedPaperForCBT}
          questions={ExamHubService.getQuestions({ paperId: selectedPaperForCBT.id })}
          userEmail={userEmail}
          onClose={() => setSelectedPaperForCBT(null)}
        />
      )}
    </div>
  );
};
