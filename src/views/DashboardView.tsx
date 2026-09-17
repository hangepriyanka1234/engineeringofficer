import React, { useState } from 'react';
import {
  Building2,
  FileCheck2,
  Target,
  Bot,
  AlertOctagon,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Flame,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
  HardHat,
  FileText,
  Bookmark,
  Calendar,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { StudentProfile, ExamTargetId, Question, MockTest, RecruitmentNotice, MistakeLog, NotificationItem } from '../types';
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
  const activeNotices = notices.filter((n) => n.status === 'Active' || n.status === 'Upcoming');
  const studyPlan = StorageService.getStudyPlan(profile);
  const mistakes = StorageService.getMistakes();
  const notifications = StorageService.getNotifications();

  // Count mistakes due for spaced review today
  const todayStr = new Date().toISOString().split('T')[0];
  const spacedDueToday = mistakes.filter((m) => !m.resolved && m.nextRevisionDate && m.nextRevisionDate <= todayStr).length;

  // AI Coach quick query state
  const [coachInput, setCoachInput] = useState('');
  const [coachResponse, setCoachResponse] = useState<string | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  const goalPercent = Math.min(
    100,
    Math.round((profile.solvedToday / profile.dailyGoalQuestions) * 100)
  );

  const completedPlanTasks = studyPlan.dailyTasks.filter((t) => t.completed).length;
  const totalPlanTasks = studyPlan.dailyTasks.length;

  const handleAskCoach = async (queryText?: string) => {
    const textToSend = queryText || coachInput;
    if (!textToSend.trim()) return;

    setIsCoachLoading(true);
    setCoachResponse(null);
    try {
      const reply = await GeminiService.askCoach(textToSend, currentExam.name, 'Civil Engineering Technical');
      setCoachResponse(reply);
    } catch (e) {
      setCoachResponse('Verify IS 456 Cl. 26.5 for minimum steel and IS 800 Table 3 for slenderness ratio limits.');
    } finally {
      setIsCoachLoading(false);
      setCoachInput('');
    }
  };

  // Weak topics identified by telemetry
  const weakTopics = [
    {
      subjectName: 'Soil Mechanics & Foundation Engg',
      accuracy: 61,
      topic: 'Terzaghi 1D Consolidation & Settlement',
      reason: 'Drainage path calculation & time factor errors',
      isCode: 'IS 2720',
      subjectId: 'geotechnical',
    },
    {
      subjectName: 'Design of Steel Structures',
      accuracy: 64,
      topic: 'Slenderness Ratio Limits & Welded Joints',
      reason: 'Reversal of stress under wind/earthquake (Limit = 350)',
      isCode: 'IS 800:2007',
      subjectId: 'steel',
    },
    {
      subjectName: 'Fluid Mechanics & Hydraulics',
      accuracy: 68,
      topic: 'Specific Energy & Hydraulic Jump',
      reason: 'Froude number transition & head loss in jumps',
      isCode: 'IRC / Standard',
      subjectId: 'fluid',
    },
  ];

  // Curated recommended materials
  const recommendedMaterials = [
    {
      title: 'IS 456:2000 Plain & Reinforced Concrete Quick Handbook',
      code: 'IS 456',
      type: 'Official Standard',
      size: '2.4 MB',
      description: 'Clause 26 detailing, Table 16 nominal cover, Table 20 maximum shear stress.',
    },
    {
      title: 'IS 800:2007 General Construction in Steel Design Charts',
      code: 'IS 800',
      type: 'Design Tables',
      size: '3.1 MB',
      description: 'Table 3 slenderness ratios, Table 5 partial safety factors, weld strength tables.',
    },
    {
      title: 'Strength of Materials (SOM) Formula Handbook',
      code: 'SOM Handbook',
      type: 'Formula Sheet',
      size: '1.8 MB',
      description: 'Bending stress, shear stress distribution, Mohr circle and deflection formulas.',
    },
    {
      title: 'IRC: 37-2018 Flexible Pavement Design Guidelines',
      code: 'IRC 37',
      type: 'Highway Standard',
      size: '4.2 MB',
      description: 'CBR design curves, cumulative standard axles (msa), and fatigue criteria.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Blueprint Header Hero Banner */}
      <div className="rounded-xl bg-blueprint-dark border border-sky-500/20 text-white p-5 sm:p-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-500/5 to-transparent pointer-events-none hidden md:block" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-400/30">
                {profile.qualification}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/30">
                Target: {currentExam.shortName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{profile.subscriptionTier}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Welcome back, Engineer {profile.name.split(' ')[0]}!</span>
              <HardHat className="w-6 h-6 text-sky-400 inline shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your comprehensive Civil Engineering preparation hub for Maharashtra PWD, MPSC MES, SSC JE, WRD, ZP & State Engineering Services.
            </p>
          </div>

          {/* Today's Practice & Daily Target Progress Card */}
          <div className="bg-slate-900/90 rounded-lg p-4 border border-sky-500/30 sm:min-w-[270px] flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium">Today's Practice Target</span>
              <span className="font-bold text-sky-400 font-mono">
                {profile.solvedToday} / {profile.dailyGoalQuestions} MCQs
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-3 border border-slate-700">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5 mr-1 fill-amber-400" />
                {profile.streakDays} Day Streak
              </span>
              <button
                id="hero-quick-practice-btn"
                onClick={() => setActiveView('practice')}
                className="text-sky-300 hover:text-white font-bold flex items-center"
              >
                Solve MCQs <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Streak & Active Study Plan Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Streak & Consistency Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Preparation Streak</h3>
                  <p className="text-[11px] text-slate-500">Continuous daily practice</p>
                </div>
              </div>
              <span className="text-xl font-extrabold text-amber-600 font-mono">
                {profile.streakDays} <span className="text-xs font-medium text-slate-500">Days</span>
              </span>
            </div>

            {/* 7-Day Consistency Tracker */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 mb-2">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
                <span>TODAY</span>
              </div>
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 border border-amber-400/40 flex items-center justify-center text-xs font-bold"
                  >
                    ✓
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 italic">
            "Engineering discipline builds monuments. Keep the streak going!"
          </p>
        </div>

        {/* Active Study Plan Banner Widget */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Today's Active Study Plan</h3>
                  <p className="text-[11px] text-slate-500">
                    Target: {studyPlan.targetExamName} ({studyPlan.dailyHours} Hours Budget)
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-sky-50 text-sky-700 border border-sky-200">
                {completedPlanTasks} / {totalPlanTasks} Tasks Completed
              </span>
            </div>

            {/* Tasks Preview */}
            <div className="space-y-2 mt-3">
              {studyPlan.dailyTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveView('study-planner')}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    task.completed
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-500 line-through'
                      : 'bg-slate-50/70 border-slate-200 hover:border-sky-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className="font-medium truncate">{task.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 pl-2">
                    {task.allocatedMinutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Syllabus Coverage: <strong>{studyPlan.syllabusCoveragePercent}%</strong>
            </span>
            <button
              id="dash-open-planner-btn"
              onClick={() => setActiveView('study-planner')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
            >
              <span>Manage Study Plan & Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Core Quick Action Matrix (Mocks, PYQs, Mistake Notebook, Bookmarks) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* CBT Mock Test */}
        <div
          id="dash-card-mock-tests"
          onClick={() => setActiveView('mock-tests')}
          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              Live CBT
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
            CBT Mock Tests
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mockTests.length} Full & Sectional exams with negative marking.
          </p>
        </div>

        {/* PYQs */}
        <div
          id="dash-card-pyqs"
          onClick={() => setActiveView('pyqs')}
          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
              2015-2024
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
            Official PYQs
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            MPSC MES, Maha PWD, WRD, ZP & SSC JE papers.
          </p>
        </div>

        {/* Mistake Notebook */}
        <div
          id="dash-card-mistakes"
          onClick={() => setActiveView('mistakes')}
          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-rose-400 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono">
              {mistakeCount} Logged
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
            Mistake Notebook
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {spacedDueToday > 0 ? (
              <span className="text-rose-600 font-semibold">{spacedDueToday} Due for Retest Today</span>
            ) : (
              'Auto-logged wrong MCQs with reason tags'
            )}
          </p>
        </div>

        {/* Bookmarks */}
        <div
          id="dash-card-bookmarks"
          onClick={() => setActiveView('practice')}
          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
              {profile.savedQuestionIds.length} Saved
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
            Saved Bookmarks
          </h3>
          <p className="text-xs text-slate-500 mt-1">High-yield standard codal questions for quick recall.</p>
        </div>
      </div>

      {/* 4. Weak Topics & Diagnostic Radar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Telemetry Weak Topics Radar (High Yield Errors)
              </h2>
              <p className="text-xs text-slate-500">
                Identified based on your test attempts. Drill these topics to gain +15-20 marks.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('practice')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center"
          >
            All Subjects <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {weakTopics.map((topic, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/70 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-amber-900 font-mono text-[11px] bg-amber-100 px-2 py-0.5 rounded">
                    {topic.isCode}
                  </span>
                  <span className="text-rose-600 font-mono font-bold">
                    {topic.accuracy}% Accuracy
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{topic.subjectName}</h3>
                <p className="text-xs text-slate-700 font-medium mt-1">{topic.topic}</p>
                <p className="text-[11px] text-slate-500 mt-1">{topic.reason}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-[10px] text-amber-800 font-mono">Priority: HIGH</span>
                <button
                  id={`drill-weak-topic-${idx}`}
                  onClick={() => setActiveView('practice')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
                >
                  <span>Drill Topic</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recruitment Deadlines & Ticker */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-sky-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Upcoming Recruitment Application Deadlines & Exam Dates
              </h2>
              <p className="text-xs text-slate-500">
                Official notifications tracked across Maharashtra State Engineering Services
              </p>
            </div>
          </div>
          <button
            id="view-all-notices-btn"
            onClick={() => setActiveView('notices')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center"
          >
            All 15 Cadres <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeNotices.slice(0, 2).map((notice) => (
            <div
              key={notice.id}
              onClick={() => setActiveView('notices')}
              className="p-4 rounded-lg bg-slate-50 hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                    {notice.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-700">
                    {notice.totalVacancies} Vacancies
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{notice.postName}</h3>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{notice.deptName}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-rose-600">
                  Last Date: {notice.applyEndDate}
                </span>
                <span className="font-medium text-sky-600 flex items-center">
                  Official PDF & Apply <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AI Study Coach (SP AI) & Recommended Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SP AI Study Coach Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Er. SP AI Study Coach</h3>
                  <p className="text-[11px] text-slate-500">Civil Engineering Gemini Specialist</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Active Mentor
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                'Explain IS 456 Cl. 26.5.1',
                'Why limit slenderness to 180?',
                'Derive maximum shear in I-beam',
                'Terzaghi 1D consolidation formula',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskCoach(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors border border-slate-200"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Response Box if available */}
            {coachResponse && (
              <div className="p-3 mb-3 bg-indigo-50/70 rounded-lg border border-indigo-200 text-xs text-slate-800 max-h-40 overflow-y-auto leading-relaxed">
                <p className="font-semibold text-indigo-950 mb-1">Mentor Explanation:</p>
                <div className="whitespace-pre-line">{coachResponse}</div>
              </div>
            )}

            {isCoachLoading && (
              <div className="p-3 mb-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Formulating codal derivation and IS reference...</span>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Ask formula derivation, IS code clause or concept..."
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskCoach()}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
            />
            <button
              id="dash-ask-coach-btn"
              onClick={() => handleAskCoach()}
              disabled={isCoachLoading}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recommended Civil Study Materials */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Recommended Standard References</h3>
                  <p className="text-[11px] text-slate-500">Essential handbooks & IS/IRC codes</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('materials')}
                className="text-xs font-bold text-sky-600 hover:text-sky-800"
              >
                All Materials →
              </button>
            </div>

            <div className="space-y-2.5">
              {recommendedMaterials.map((mat, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveView('materials')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        {mat.code}
                      </span>
                      <h4 className="font-semibold text-slate-900 text-xs truncate">{mat.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{mat.description}</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold shrink-0">
                    Read
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standard Bureau of Indian Standards (BIS) & IRC Compliant</span>
            <button
              onClick={() => setActiveView('materials')}
              className="text-sky-600 font-bold hover:underline"
            >
              Open E-Library
            </button>
          </div>
        </div>
      </div>

      {/* 7. Active Plan & Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Plan Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                MEMBERSHIP TIER
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{profile.subscriptionTier}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Valid until: <strong>{profile.subscriptionExpiry || '2025-12-31'}</strong>
            </p>

            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Unlimited Full-Length CBT Mock Tests</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Leitner Spaced Mistake Retesting Queue</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Official PYQ Archive (2015-2024)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Er. SP AI Study Coach Access</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">Referral Code: {profile.referralCode}</span>
            <button
              id="dash-upgrade-plan-btn"
              onClick={() => setActiveView('plans')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
            >
              Manage / Upgrade
            </button>
          </div>
        </div>

        {/* Notifications & Announcements Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Official Notifications & Updates</h3>
              </div>
              <button
                onClick={() => setActiveView('notifications')}
                className="text-xs font-bold text-sky-600 hover:text-sky-800"
              >
                View All Notifications →
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.actionLink) setActiveView(notif.actionLink);
                  }}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between ${
                    notif.read
                      ? 'bg-slate-50/50 border-slate-200 text-slate-600'
                      : 'bg-sky-50/40 border-sky-200 text-slate-900 font-medium'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{notif.message}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    {notif.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-right">
            Real-time synchronization with MPSC, Maha PWD, and SSC official portals
          </div>
        </div>
      </div>
    </div>
  );
};
