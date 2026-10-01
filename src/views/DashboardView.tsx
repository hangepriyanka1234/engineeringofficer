import React, { useState } from 'react';
import {
  Building2,
  FileText,
  Target,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Bell,
  User,
  HardHat,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  Layers,
  Search,
  CheckCircle2,
  Send,
  X,
  HelpCircle,
  Zap,
  Compass,
  Cpu
} from 'lucide-react';
import { StudentProfile, ExamTargetId, MockTest, RecruitmentNotice } from '../types';
import { EXAM_CATALOGUE, SUBJECTS_LIST } from '../data/mockData';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';

interface DashboardViewProps {
  profile: StudentProfile;
  selectedExam: ExamTargetId;
  setSelectedExam: (id: ExamTargetId) => void;
  setActiveView: (view: string) => void;
  mockTests: MockTest[];
  notices: RecruitmentNotice[];
  mistakeCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  selectedExam,
  setSelectedExam,
  setActiveView,
  mockTests,
  notices,
  mistakeCount,
}) => {
  const currentExam = EXAM_CATALOGUE.find((e) => e.id === selectedExam) || EXAM_CATALOGUE[4];
  const notifications = StorageService.getNotifications();
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // AI Assistant Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Unfinished Practice state mock/check
  const hasUnfinishedPractice = profile.solvedToday > 0;
  const recentSubject = SUBJECTS_LIST[0]; // RCC / Limit State Design

  // Previous Year Papers categories for horizontal scroll
  const pyqCategories = [
    { id: 'ssc-je', title: 'SSC JE', subtitle: 'Junior Engineer Papers', count: '48 Papers', examId: 'ssc-je' as ExamTargetId },
    { id: 'mpsc-mes', title: 'MPSC AE/JE', subtitle: 'Maharashtra Engg Services', count: '36 Papers', examId: 'mpsc-mes' as ExamTargetId },
    { id: 'pwd', title: 'PWD', subtitle: 'Public Works Dept AE/JE', count: '28 Papers', examId: 'maha-pwd' as ExamTargetId },
    { id: 'rrb-je', title: 'RRB JE', subtitle: 'Railway Recruitment Board', count: '32 Papers', examId: 'rrb-je' as ExamTargetId },
    { id: 'wrd-zp', title: 'WRD & ZP', subtitle: 'Water Resources & Zilla Parishad', count: '42 Papers', examId: 'wrd-je' as ExamTargetId },
  ];

  // Practice by Subject list (Civil Engineering subjects as requested)
  const civilSubjects = [
    { id: 'som', name: 'Strength of Materials', topics: 18, mcqs: 850, icon: '💪' },
    { id: 'rcc', name: 'RCC & Reinforced Concrete', topics: 22, mcqs: 1100, icon: '🏗️' },
    { id: 'steel', name: 'Steel Structures', topics: 16, mcqs: 720, icon: '🔩' },
    { id: 'soil', name: 'Soil Mechanics', topics: 20, mcqs: 980, icon: '⛏️' },
    { id: 'fluid', name: 'Fluid Mechanics', topics: 15, mcqs: 800, icon: '🌊' },
    { id: 'hydraulics', name: 'Hydraulics & Open Channel', topics: 14, mcqs: 650, icon: '🚰' },
    { id: 'environmental', name: 'Environmental Engineering', topics: 18, mcqs: 890, icon: '🌱' },
    { id: 'transportation', name: 'Transportation Engineering', topics: 16, mcqs: 780, icon: '🛣️' },
    { id: 'surveying', name: 'Surveying', topics: 15, mcqs: 920, icon: '📐' },
    { id: 'mechanics', name: 'Engineering Mechanics', topics: 12, mcqs: 610, icon: '⚙️' },
    { id: 'estimation', name: 'Estimation & Costing', topics: 14, mcqs: 740, icon: '📊' },
    { id: 'geotechnical', name: 'Geotechnical Engineering', topics: 19, mcqs: 950, icon: '⛰️' },
  ];

  // Mock Test Samples
  const featuredMockTests = [
    {
      id: 'full-cbt-1',
      title: 'Full Length CBT Mock Test - 01',
      category: 'Full Length Mock Tests',
      duration: '120 Mins',
      questions: '100 Qs',
      marks: '200 Marks',
      target: currentExam.shortName,
      difficulty: 'Exam Pattern',
    },
    {
      id: 'subj-test-rcc',
      title: 'RCC & Steel Design Special Test',
      category: 'Subject Tests',
      duration: '60 Mins',
      questions: '50 Qs',
      marks: '100 Marks',
      target: 'Civil Technical',
      difficulty: 'Moderate',
    },
    {
      id: 'topic-test-som',
      title: 'Bending Stress & Shear Force Rapid Test',
      category: 'Topic Tests',
      duration: '30 Mins',
      questions: '25 Qs',
      marks: '50 Marks',
      target: 'SOM Mastery',
      difficulty: 'Speed Test',
    },
  ];

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const res = await GeminiService.askCoach(
        aiQuery,
        currentExam.name,
        'Civil Engineering Technical & Practice'
      );
      setAiResponse(res);
    } catch (err) {
      setAiResponse(
        'As per IS 456:2000 Cl. 26.5.1.1, the minimum reinforcement in slabs is 0.15% of total cross-sectional area for mild steel and 0.12% for HYSD bars.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 text-slate-800 font-sans">
      {/* 1. PROFESSIONAL HEADER */}
      <header className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
            <HardHat className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
              ENGINEERING OFFICER
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Civil Engineering Prep Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications Button */}
          <button
            id="home-notifications-btn"
            onClick={() => setActiveView('notices')}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {/* Profile Avatar */}
          <button
            id="home-profile-avatar-btn"
            onClick={() => setActiveView('profile')}
            className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold border border-slate-700 hover:opacity-90 transition-opacity"
            aria-label="Profile"
          >
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'E'}
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Engineering Exam Preparation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Practice Civil Engineering questions, Previous Year Papers and CBT Mock Tests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              id="hero-start-practice-btn"
              onClick={() => setActiveView('practice')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>START PRACTICE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="hero-explore-exams-btn"
              onClick={() => setActiveView('exam-ecosystem')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              EXPLORE EXAMS
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAIN ACTION GRID */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: EXAMS */}
        <button
          id="action-card-exams"
          onClick={() => setActiveView('exam-ecosystem')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              EXAMS
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">All Engineering Exams</p>
          </div>
        </button>

        {/* Card 2: PREVIOUS PAPERS */}
        <button
          id="action-card-papers"
          onClick={() => setActiveView('pyqs')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              PREVIOUS PAPERS
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Year-wise Question Papers</p>
          </div>
        </button>

        {/* Card 3: PRACTICE */}
        <button
          id="action-card-practice"
          onClick={() => setActiveView('practice')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              PRACTICE
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Subject & Topic MCQs</p>
          </div>
        </button>

        {/* Card 4: MOCK TESTS */}
        <button
          id="action-card-mock-tests"
          onClick={() => setActiveView('mock-tests')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              MOCK TESTS
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Full CBT Tests</p>
          </div>
        </button>
      </section>

      {/* 4. CONTINUE PRACTICE SECTION */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        {hasUnfinishedPractice ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Continue Practice
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {recentSubject.name} — Limit State Design
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                25 Questions · {profile.solvedToday > 0 ? profile.solvedToday : 8} Attempted
              </p>
            </div>

            <button
              id="continue-practice-btn"
              onClick={() => setActiveView('practice')}
              className="px-4 py-2 bg-blue-900 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 sm:self-center cursor-pointer"
            >
              <span>CONTINUE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Start Your First Practice</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a Civil Engineering subject and solve topic-wise MCQs.
              </p>
            </div>
            <button
              id="start-first-practice-btn"
              onClick={() => setActiveView('practice')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              START PRACTICE →
            </button>
          </div>
        )}
      </section>

      {/* 5. PREVIOUS YEAR PAPERS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-bold text-base text-slate-900">Previous Year Papers</h2>
          <button
            id="pyq-view-all-btn"
            onClick={() => setActiveView('pyqs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-0.5"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal scroll section */}
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
          {pyqCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedExam(cat.examId);
                setActiveView('pyqs');
              }}
              className="min-w-[180px] sm:min-w-[200px] bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between shrink-0"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {cat.count}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{cat.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.subtitle}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-bold">
                <span>Explore Papers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PRACTICE BY SUBJECT */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-bold text-base text-slate-900">Practice By Subject</h2>
          <span className="text-xs text-slate-500">12 Civil Subjects</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {civilSubjects.map((sub) => (
            <div
              key={sub.id}
              onClick={() => setActiveView('practice')}
              className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="text-xl mb-2">{sub.icon}</div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {sub.name}
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                {sub.topics} Topics · {sub.mcqs}+ MCQs
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. MOCK TEST SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-bold text-base text-slate-900">Mock Tests</h2>
          <button
            id="mock-tests-view-all-btn"
            onClick={() => setActiveView('mock-tests')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-0.5"
          >
            <span>VIEW ALL MOCKS</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {featuredMockTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 transition-all"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {test.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900">{test.title}</h3>
                <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium pt-0.5">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{test.duration}</span>
                  </span>
                  <span>·</span>
                  <span>{test.questions}</span>
                  <span>·</span>
                  <span>{test.marks}</span>
                </div>
              </div>

              <button
                id={`attempt-mock-${test.id}`}
                onClick={() => setActiveView('mock-tests')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer text-center"
              >
                ATTEMPT TEST
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 8. AI SECTION */}
      <section className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              AI Engineering Study Assistant
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Generate practice questions, explanations and revision help.
          </p>
        </div>

        <button
          id="ask-ai-bottom-btn"
          onClick={() => setShowAIModal(true)}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ASK AI</span>
        </button>
      </section>

      {/* AI Assistant Quick Query Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 shadow-xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-blue-900">
                <Sparkles className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900">AI Engineering Assistant</h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Ask any Civil Engineering question, IS Code clause (IS 456, IS 800, IRC), or topic explanation.
            </p>

            <form onSubmit={handleAskAI} className="space-y-3">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. Explain minimum shear reinforcement formula in IS 456..."
                className="w-full h-24 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isAiLoading || !aiQuery.trim()}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isAiLoading ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Ask Assistant</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {aiResponse && (
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-slate-800 max-h-48 overflow-y-auto leading-relaxed">
                <p className="font-bold text-blue-900 mb-1">AI Solution:</p>
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
