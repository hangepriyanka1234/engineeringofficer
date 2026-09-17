import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  History,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Layers,
  Bot,
  RefreshCw,
  Download,
  Filter,
  Search,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Zap,
  Calendar,
  Sparkles,
  Info,
  Check,
  ExternalLink,
  SlidersHorizontal,
  BookmarkCheck,
  BrainCircuit,
  Gauge
} from 'lucide-react';
import {
  StudentProfile,
  TestAttempt,
  CompleteStudentAnalytics,
  SubjectPerformanceMetric,
  TopicPerformanceMetric,
  DifficultyPerformanceMetric,
  WeaknessDiagnosticItem
} from '../types';
import { AnalyticsService } from '../services/analyticsService';
import { GeminiService } from '../services/geminiService';

interface AnalyticsViewProps {
  profile: StudentProfile;
  testAttempts: TestAttempt[];
  onStartPractice?: (subjectId?: string, topicId?: string) => void;
  onNavigateToMistakes?: () => void;
  onNavigateToMockTests?: () => void;
}

type AnalyticsTab = 'overview' | 'subjects' | 'topics' | 'difficulties' | 'weaknesses' | 'mocks' | 'revision';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  testAttempts,
  onStartPractice,
  onNavigateToMistakes,
  onNavigateToMockTests,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [analyticsData, setAnalyticsData] = useState<CompleteStudentAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Selected mock attempt for detailed telemetry review
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  
  // Subject & topic filters
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<string>('all');
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>('');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  // AI Diagnostic Generation
  const [aiDiagnostic, setAiDiagnostic] = useState<string | null>(null);
  const [loadingDiagnostic, setLoadingDiagnostic] = useState<boolean>(false);

  // Remedial drill modal or notification state
  const [remedialDrillLaunched, setRemedialDrillLaunched] = useState<string | null>(null);

  // Load materialized analytics from server
  const loadAnalytics = async (forceRefresh: boolean = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = forceRefresh
        ? await AnalyticsService.refreshCache(profile.email)
        : await AnalyticsService.getStudentAnalytics(profile.email);
      
      setAnalyticsData(data);
      if (data.mockHistory.length > 0 && !selectedAttemptId) {
        setSelectedAttemptId(data.mockHistory[0].id);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [profile.email]);

  const handleGenerateAiDiagnostic = async () => {
    if (!analyticsData) return;
    setLoadingDiagnostic(true);
    
    const weakList = analyticsData.weaknesses.map(w => `${w.topicName} (${w.subjectName})`);
    const plan = await GeminiService.getDiagnosticPlan(
      analyticsData.overview.overallAccuracy,
      profile.targetExams,
      weakList,
      analyticsData.overview.totalAttempted,
      analyticsData.overview.totalTestsTaken
    );
    setAiDiagnostic(plan);
    setLoadingDiagnostic(false);
  };

  const handleExportReport = () => {
    if (!analyticsData) return;
    AnalyticsService.exportDiagnosticReport(analyticsData, profile.name);
  };

  const handleLaunchDrill = (weakness: WeaknessDiagnosticItem) => {
    setRemedialDrillLaunched(weakness.topicName);
    if (onStartPractice) {
      onStartPractice(weakness.subjectId, weakness.topicId);
    }
  };

  if (loading && !analyticsData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <h2 className="text-base font-bold text-slate-800">Loading Student Analytics & Telemetry Engine</h2>
        <p className="text-xs text-slate-500 max-w-md">
          Fetching materialized performance summary tables, cognitive metrics, and empirical weakness diagnostics...
        </p>
      </div>
    );
  }

  const data = analyticsData!;
  const overview = data.overview;
  const selectedAttempt = data.mockHistory.find(a => a.id === selectedAttemptId) || (data.mockHistory.length > 0 ? data.mockHistory[0] : null);

  // Subject categories list for filtering
  const subjectCategories = ['all', ...Array.from(new Set(data.subjects.map(s => s.category)))];

  const filteredSubjects = data.subjects.filter(s => {
    if (subjectCategoryFilter === 'all') return true;
    return s.category === subjectCategoryFilter;
  });

  const filteredTopics = data.topics.filter(t => {
    if (!topicSearchQuery) return true;
    const q = topicSearchQuery.toLowerCase();
    return t.topicName.toLowerCase().includes(q) || t.subjectName.toLowerCase().includes(q) || (t.isCodeReference && t.isCodeReference.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 flex items-center space-x-1">
                <BrainCircuit className="w-3.5 h-3.5 mr-1" />
                RESULTS & PERFORMANCE TELEMETRY
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {overview.totalAttempted} MCQs Logged
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {overview.totalTestsTaken} CBT Mock{overview.totalTestsTaken !== 1 ? 's' : ''} Evaluated
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-sky-600 shrink-0" />
              <span>Diagnostic Analytics & Speed Benchmarks</span>
            </h1>
            
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Real-time analytical telemetry tracking accuracy, question pacing distributions, subject/topic mastery indices, and empirical weakness diagnostics based on measured historical data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              id="refresh-analytics-btn"
              onClick={() => loadAnalytics(true)}
              disabled={refreshing}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
              title="Refresh Materialized Summary"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            <button
              id="export-diagnostic-report-btn"
              onClick={handleExportReport}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Report</span>
            </button>

            <button
              id="generate-ai-diagnostic-btn"
              onClick={handleGenerateAiDiagnostic}
              disabled={loadingDiagnostic}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>{loadingDiagnostic ? 'Analyzing...' : 'AI Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto border-t border-slate-100 mt-5 pt-3 -mx-2 px-2 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Pace', icon: Gauge },
            { id: 'subjects', label: 'Subject Mastery', icon: Layers },
            { id: 'topics', label: 'Topic Breakdown', icon: BookOpen },
            { id: 'difficulties', label: 'Difficulty Matrix', icon: SlidersHorizontal },
            { id: 'weaknesses', label: 'Weakness Detector', icon: AlertTriangle, badge: data.weaknesses.length },
            { id: 'mocks', label: 'CBT Mock History', icon: History, badge: data.mockHistory.length },
            { id: 'revision', label: 'Revision & Streak', icon: Flame },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`analytics-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as AnalyticsTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Diagnostic Plan Box */}
      {aiDiagnostic && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-indigo-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400 font-mono font-bold text-xs">
              <Bot className="w-4 h-4" />
              <span>AI DIAGNOSTIC REMEDIAL ACTION PLAN</span>
            </div>
            <button
              onClick={() => setAiDiagnostic(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
            {aiDiagnostic}
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW & PACE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Overall Accuracy */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Overall Accuracy</span>
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {overview.overallAccuracy}%
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {overview.totalCorrect} Correct / {overview.totalAttempted} Attempted
              </div>
            </div>

            {/* Negative Marking Penalty Loss */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Negative Marks Loss</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">
                -{overview.cumulativeNegativeLoss.toFixed(2)} M
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across {overview.totalWrong} wrong answers
              </div>
            </div>

            {/* Average Time Per Question & Pace */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Avg Answer Speed</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {overview.avgTimePerQuestionSeconds}s <span className="text-xs text-slate-400 font-normal">/ Q</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                Target: ≤ 60s for 100Q / 120min CBT
              </div>
            </div>

            {/* Verified Percentile */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Verified Percentile</span>
                <Award className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {overview.verifiedPercentile}%
              </div>
              <div className="text-[11px] text-indigo-600 font-medium mt-1">
                Top tier against active civil cohort
              </div>
            </div>
          </div>

          {/* Question Attempt Outcomes: Correct vs Wrong vs Skipped */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cumulative Attempt Distribution & Accuracy Split</span>
            </h3>

            {/* Visual multi-segmented bar */}
            <div className="w-full bg-slate-100 rounded-xl h-4 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${(overview.totalCorrect / (overview.totalAttempted + overview.totalSkipped)) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Correct: ${overview.totalCorrect}`}
              />
              <div
                style={{ width: `${(overview.totalWrong / (overview.totalAttempted + overview.totalSkipped)) * 100}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Wrong: ${overview.totalWrong}`}
              />
              <div
                style={{ width: `${(overview.totalSkipped / (overview.totalAttempted + overview.totalSkipped)) * 100}%` }}
                className="bg-slate-300 h-full transition-all"
                title={`Skipped / Unanswered: ${overview.totalSkipped}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <div className="text-xs font-semibold text-emerald-800">Correct Answers</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{overview.totalCorrect}</div>
                <div className="text-[10px] text-emerald-600 font-mono">
                  {((overview.totalCorrect / overview.totalAttempted) * 100).toFixed(1)}% of attempted
                </div>
              </div>

              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
                <div className="text-xs font-semibold text-rose-800">Wrong (Penalized)</div>
                <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">{overview.totalWrong}</div>
                <div className="text-[10px] text-rose-600 font-mono">
                  {((overview.totalWrong / overview.totalAttempted) * 100).toFixed(1)}% of attempted
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-semibold text-slate-700">Skipped / Unattempted</div>
                <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">{overview.totalSkipped}</div>
                <div className="text-[10px] text-slate-500 font-mono">Zero negative penalty</div>
              </div>
            </div>
          </div>

          {/* Speed & Pacing Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Time Per Question & Pacing Telemetry</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribution of answering speed across all attempted questions.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                Avg: {overview.avgTimePerQuestionSeconds}s / Q
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>Fast Pace (&lt; 35s)</span>
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700">{overview.fastPacedCount} Questions</div>
                <p className="text-[11px] text-emerald-700 leading-tight">
                  High-yield factual recall, direct IS code values, & formula definitions.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-sky-800">
                  <span>Optimum Pace (35s – 75s)</span>
                  <Target className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="text-xl font-bold font-mono text-sky-700">{overview.optimumPacedCount} Questions</div>
                <p className="text-[11px] text-sky-700 leading-tight">
                  Standard application questions, beam diagrams, and single-step numericals.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                  <span>Overtime (&gt; 75s)</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xl font-bold font-mono text-amber-700">{overview.overtimePacedCount} Questions</div>
                <p className="text-[11px] text-amber-700 leading-tight">
                  Multi-step calculations (soil bearing capacity, steel compression design).
                </p>
              </div>
            </div>
          </div>

          {/* 30-Day Activity Calendar & Consistency Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>30-Day Preparation Streak & Daily Consistency</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily question volume and accuracy tracking over the last month.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block font-mono">{overview.currentStreak} Day Active Streak</span>
                  <span className="text-[10px] text-slate-400">Longest: {overview.longestStreak} days</span>
                </div>
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Heat Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5 pt-2">
              {data.dailyActivity.map((day, dIdx) => {
                let heatClass = 'bg-slate-100 text-slate-400';
                if (day.questionsSolved >= 35) heatClass = 'bg-emerald-600 text-white font-bold';
                else if (day.questionsSolved >= 20) heatClass = 'bg-emerald-400 text-white font-bold';
                else if (day.questionsSolved > 0) heatClass = 'bg-emerald-200 text-emerald-900 font-semibold';

                return (
                  <div
                    key={dIdx}
                    className={`p-2 rounded-lg text-center transition-transform hover:scale-105 cursor-pointer ${heatClass}`}
                    title={`${day.date} (${day.dayOfWeek}): ${day.questionsSolved} Qs solved, ${day.accuracy}% accuracy, ${day.minutesSpent} mins`}
                  >
                    <div className="text-[9px] font-mono leading-none opacity-80">{day.dayOfWeek}</div>
                    <div className="text-xs font-mono font-bold mt-1">{day.questionsSolved}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-100 inline-block" />
                <span>0 Qs</span>
                <span className="w-2.5 h-2.5 rounded bg-emerald-200 inline-block ml-2" />
                <span>1–19 Qs</span>
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block ml-2" />
                <span>20–34 Qs</span>
                <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block ml-2" />
                <span>35+ Qs</span>
              </span>
              <span className="font-mono font-semibold text-slate-700">Consistency Index: {overview.consistencyScore}/100</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECT MASTERY MATRIX */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Civil Engineering Subject Mastery Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive performance, accuracy, and codal standard tracking across all civil engineering verticals.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {subjectCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSubjectCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      subjectCategoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Subjects' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject List Cards */}
            <div className="space-y-3">
              {filteredSubjects.map((subj) => {
                const isExpanded = expandedSubjectId === subj.subjectId;
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (subj.masteryLevel === 'Proficient') badgeClass = 'bg-sky-50 text-sky-700 border-sky-200';
                if (subj.masteryLevel === 'Developing') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                if (subj.masteryLevel === 'Critical Focus') badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <div
                    key={subj.subjectId}
                    className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {subj.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                            {subj.masteryLevel.toUpperCase()}
                          </span>
                          {subj.sampleSufficiency === 'sufficient' && (
                            <span className="text-[10px] text-emerald-600 flex items-center font-medium">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" />
                              High Sample (N={subj.attempted})
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{subj.subjectName}</h4>
                      </div>

                      <div className="flex items-center space-x-3 text-right">
                        <div>
                          <div className="text-xl font-mono font-extrabold text-slate-900">{subj.accuracy}%</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {subj.correct}/{subj.attempted} Correct
                          </div>
                        </div>

                        {onStartPractice && (
                          <button
                            onClick={() => onStartPractice(subj.subjectId)}
                            className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs transition-colors flex items-center space-x-1"
                          >
                            <span>Practice</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          subj.accuracy >= 80
                            ? 'bg-emerald-500'
                            : subj.accuracy >= 65
                            ? 'bg-sky-500'
                            : subj.accuracy >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${subj.accuracy}%` }}
                      />
                    </div>

                    {/* Sub-metrics: Speed, Negative marks, IS Codes */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center font-mono">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Pace: {subj.avgSpeedSeconds}s/Q
                        </span>
                        <span className="flex items-center font-mono text-rose-600">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          Penalty: -{subj.negativeMarkLoss}M
                        </span>
                      </div>

                      {subj.isCodesRelevant.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-[11px] text-slate-400">Codes:</span>
                          {subj.isCodesRelevant.slice(0, 3).map((code, cIdx) => (
                            <span key={cIdx} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOPIC BREAKDOWN */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Granular Topic Performance & Codal Focus
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect question accuracy, answer pace, and PYQ frequency across key syllabus topics.
                </p>
              </div>

              {/* Search filter */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topic or IS code..."
                  value={topicSearchQuery}
                  onChange={(e) => setTopicSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Topic / Syllabus Unit</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-center">Attempted</th>
                    <th className="p-3 text-center">Accuracy</th>
                    <th className="p-3 text-center">Speed</th>
                    <th className="p-3">IS Code / Standard</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredTopics.map((topic) => {
                    let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (topic.masteryStatus === 'proficient') statusColor = 'bg-sky-50 text-sky-700 border-sky-200';
                    if (topic.masteryStatus === 'developing') statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    if (topic.masteryStatus === 'weak') statusColor = 'bg-rose-50 text-rose-700 border-rose-200';

                    return (
                      <tr key={topic.topicId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-sans font-semibold text-slate-900 max-w-xs">
                          {topic.topicName}
                          {topic.pyqFrequency && (
                            <span className="text-[10px] text-indigo-600 block font-normal font-sans">
                              {topic.pyqFrequency}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 font-sans whitespace-nowrap">{topic.subjectName}</td>
                        <td className="p-3 text-center text-slate-800 font-bold">
                          {topic.correct} / {topic.attempted}
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={topic.accuracy >= 75 ? 'text-emerald-700' : topic.accuracy >= 60 ? 'text-amber-700' : 'text-rose-600'}>
                            {topic.accuracy}%
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-600">
                          {topic.avgSpeedSeconds}s
                        </td>
                        <td className="p-3 text-slate-700 font-sans">
                          {topic.isCodeReference ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-mono border border-slate-200">
                              {topic.isCodeReference}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColor}`}>
                            {topic.masteryStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIFFICULTY PERFORMANCE MATRIX */}
      {activeTab === 'difficulties' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Cognitive Depth & Difficulty Tier Performance
              </h3>
              <p className="text-xs text-slate-500">
                Performance breakdown across Easy (Direct recall), Medium (Standard IS codal application), and Hard (Complex multi-step numericals).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.difficulties.map((diff) => {
                let borderTheme = 'border-emerald-200 bg-emerald-50/30';
                let iconColor = 'text-emerald-600';
                if (diff.difficulty === 'medium') {
                  borderTheme = 'border-sky-200 bg-sky-50/30';
                  iconColor = 'text-sky-600';
                } else if (diff.difficulty === 'hard') {
                  borderTheme = 'border-rose-200 bg-rose-50/30';
                  iconColor = 'text-rose-600';
                }

                return (
                  <div key={diff.difficulty} className={`rounded-2xl border p-5 space-y-4 ${borderTheme}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wide text-slate-700">
                        {diff.difficulty} Tier
                      </span>
                      <SlidersHorizontal className={`w-4 h-4 ${iconColor}`} />
                    </div>

                    <div>
                      <div className="text-3xl font-extrabold font-mono text-slate-900">{diff.accuracy}%</div>
                      <div className="text-xs text-slate-600 mt-1 font-semibold">{diff.label}</div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200/60 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-sans">Attempted:</span>
                        <span className="font-bold text-slate-800">{diff.attempted} Questions</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-sans">Correct / Wrong:</span>
                        <span className="font-bold text-slate-800">
                          <span className="text-emerald-600">+{diff.correct}</span> / <span className="text-rose-600">-{diff.wrong}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-sans">Avg Speed:</span>
                        <span className="font-bold text-slate-800">{diff.avgSpeedSeconds}s / Q</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-sans">Cohort Benchmark:</span>
                        <span className="font-bold text-slate-600">{diff.benchmarkAccuracy}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Diagnostic takeaway */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
              <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <span className="font-bold block text-slate-900">Cognitive Depth Diagnostic Summary</span>
                <p>
                  Your Level 1 recall accuracy is in the 90th percentile, demonstrating solid foundational definitions.
                  Focus remaining practice on Level 2 & 3 multi-step calculation problems to minimize negative mark deductions in competitive CBT papers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WEAKNESS DETECTOR (Strict separation of Measured Stats vs Recommendations) */}
      {activeTab === 'weaknesses' && (
        <div className="space-y-6">
          {/* Statutory and Diagnostic Grounding Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-xs text-amber-900 flex items-start space-x-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 block">
                Empirical Weakness Diagnosis & Statistical Sample Criteria
              </span>
              <p>
                Diagnostics in this panel are computed exclusively when sufficient historical attempts (N ≥ 5 questions) demonstrate an accuracy gap below 60%.
                <strong> Measured statistics</strong> are strictly separated from <strong>Actionable Recommendations</strong>.
              </p>
              <p className="text-[11px] text-amber-800 italic mt-1">
                Notice: Diagnostics represent observed trends in simulated practice and mock tests. They do not constitute a prediction or guarantee of examination pass or fail outcome.
              </p>
            </div>
          </div>

          {/* Remedial Drill Confirmation Banner */}
          {remedialDrillLaunched && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>
                  Drill launched for: <strong>{remedialDrillLaunched}</strong>. Practice session initialized.
                </span>
              </div>
              <button
                onClick={() => setRemedialDrillLaunched(null)}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Weakness Cards Grid */}
          <div className="space-y-5">
            {data.weaknesses.map((weakness) => {
              const stats = weakness.measuredStats;
              const reco = weakness.recommendations;

              return (
                <div
                  key={weakness.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-slate-50/80 p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                          reco.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {reco.priority} Priority Focus
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {weakness.confidence} (N = {weakness.sampleSize})
                        </span>
                        {weakness.isDataSufficient && (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                            Data Grounded
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{weakness.topicName}</h4>
                      <div className="text-xs text-slate-500 font-semibold">{weakness.subjectName}</div>
                    </div>

                    <button
                      id={`launch-drill-${weakness.id}`}
                      onClick={() => handleLaunchDrill(weakness)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Launch {reco.suggestedDrillQuestionCount}Q Drill</span>
                    </button>
                  </div>

                  {/* Body: Two distinct panels (Measured Statistics vs Recommendations) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    {/* PANEL A: MEASURED STATISTICS (strictly empirical numbers) */}
                    <div className="p-5 space-y-4 bg-white">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <BarChart3 className="w-4 h-4 text-sky-600" />
                        <span>1. Measured Empirical Statistics</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[11px] text-slate-500 block">Observed Accuracy</span>
                          <span className="text-xl font-bold font-mono text-rose-600">{stats.accuracy}%</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{stats.wrongCount} Wrong of {stats.totalQuestions}</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[11px] text-slate-500 block">Negative Mark Loss</span>
                          <span className="text-xl font-bold font-mono text-rose-600">-{stats.negativeLoss} M</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Penalized score</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[11px] text-slate-500 block">Avg Time Spent</span>
                          <span className="text-xl font-bold font-mono text-slate-800">{stats.avgTimeSeconds}s</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Per attempted question</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[11px] text-slate-500 block">Frequent Error Pattern</span>
                          <span className="text-xs font-bold font-mono text-indigo-700 capitalize mt-1 block">
                            {stats.dominantErrorTag.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Recent attempts streak */}
                      <div className="pt-2">
                        <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Recent 5 Question Outcomes:</span>
                        <div className="flex items-center space-x-1.5">
                          {stats.recentAttemptsStreak.map((out, oIdx) => (
                            <span
                              key={oIdx}
                              className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                                out === 'correct'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {out === 'correct' ? '✓ Correct' : '✗ Wrong'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PANEL B: ACTIONABLE RECOMMENDATIONS (remedial roadmap) */}
                    <div className="p-5 space-y-4 bg-slate-50/50">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span>2. Remedial Action Recommendations</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                        {reco.actionSummary}
                      </div>

                      {/* Remedial Steps Checklist */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 block">Recommended Action Sequence:</span>
                        <ul className="space-y-1.5">
                          {reco.remedialSteps.map((step, sIdx) => (
                            <li key={sIdx} className="text-xs text-slate-600 flex items-start space-x-2">
                              <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {weakness.isCodeClause && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Target Standard Clause:</span>
                          <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {weakness.isCodeClause}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: CBT MOCK HISTORY & TELEMETRY */}
      {activeTab === 'mocks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <History className="w-4 h-4 text-sky-600" />
                  <span>CBT Mock Test Attempts & Server-Verified Records</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select an attempt below to view detailed section breakdown, question timing, and verified HMAC signature.
                </p>
              </div>
              {onNavigateToMockTests && (
                <button
                  onClick={onNavigateToMockTests}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors"
                >
                  Take CBT Mock Test
                </button>
              )}
            </div>

            {data.mockHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No mock test attempts recorded yet. Take a full-length CBT test to populate your timeline.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Test Title</th>
                      <th className="p-3 text-center">Score</th>
                      <th className="p-3 text-center">Accuracy</th>
                      <th className="p-3 text-center">Neg. Loss</th>
                      <th className="p-3 text-center">Speed</th>
                      <th className="p-3 text-center">Cohort Percentile</th>
                      <th className="p-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {data.mockHistory.map((att) => {
                      const isSelected = att.id === selectedAttemptId;
                      return (
                        <tr
                          key={att.id}
                          onClick={() => setSelectedAttemptId(att.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-sky-50/80 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3 text-slate-600 whitespace-nowrap">{att.date}</td>
                          <td className="p-3 font-sans font-semibold text-slate-900 max-w-xs truncate">
                            {att.testTitle}
                          </td>
                          <td className="p-3 text-center text-sky-700 font-bold">
                            {att.score} / {att.totalMarks}
                          </td>
                          <td className="p-3 text-center text-emerald-700 font-bold">
                            {att.accuracy}%
                          </td>
                          <td className="p-3 text-center text-rose-600">
                            -{att.negativeMarkLoss !== undefined ? att.negativeMarkLoss : '0.00'}
                          </td>
                          <td className="p-3 text-center text-slate-700">
                            {att.avgTimePerQuestionSeconds || 45}s/Q
                          </td>
                          <td className="p-3 text-center text-amber-700 font-bold">
                            {att.percentile}%
                            {att.cohortRank && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                Rank #{att.cohortRank}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {att.serverVerified ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-sans">Local</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Selected Attempt Detailed Inspector */}
            {selectedAttempt && (
              <div className="pt-4 border-t border-slate-200 bg-slate-50/70 p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-sm text-slate-900">Attempt Inspection: {selectedAttempt.testTitle}</span>
                  </div>
                  {selectedAttempt.verificationSignature && (
                    <span className="text-[10px] font-mono text-slate-500">
                      Sig: {selectedAttempt.verificationSignature}
                    </span>
                  )}
                </div>

                {/* Section breakdown cards */}
                {selectedAttempt.sectionBreakdown && Object.keys(selectedAttempt.sectionBreakdown).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Section Breakdown:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.values(selectedAttempt.sectionBreakdown).map((secValue: any, sIdx: number) => (
                        <div key={sIdx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="font-semibold text-slate-800 block text-xs truncate">{secValue.name}</span>
                          <div className="flex items-center justify-between mt-2 text-xs font-mono">
                            <span className="text-slate-500">Att: {secValue.attempted}/{secValue.total}</span>
                            <span className="text-emerald-600 font-bold">+{secValue.correct}</span>
                            <span className="text-rose-600">-{secValue.wrong}</span>
                            <span className="font-bold text-slate-900">{secValue.score.toFixed(1)} M</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subject breakdown cards */}
                {selectedAttempt.subjectBreakdown && Object.keys(selectedAttempt.subjectBreakdown).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Subject Scores in This Mock:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {Object.entries(selectedAttempt.subjectBreakdown).map(([sKey, sVal]: [string, any], sbIdx: number) => (
                        <div key={sbIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                          <span className="text-[10px] font-mono text-slate-500 block truncate">{sKey}</span>
                          <div className="flex items-center justify-between font-mono mt-1">
                            <span className="font-bold text-emerald-700">{sVal.correct}/{sVal.total}</span>
                            <span className="font-bold text-slate-800">{sVal.score ? `${sVal.score}M` : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: REVISION & CONSISTENCY */}
      {activeTab === 'revision' && (
        <div className="space-y-6">
          {/* Mistake Notebook Resolution Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                  <span>Mistake Notebook & Spaced Repetition Mastery</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Track resolved versus active errors and spaced interval review schedules.
                </p>
              </div>
              {onNavigateToMistakes && (
                <button
                  onClick={onNavigateToMistakes}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors"
                >
                  Open Mistake Notebook
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Logged Errors</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {data.revision.totalLoggedMistakes}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs text-emerald-800 block">Mastered / Resolved</span>
                <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                  {data.revision.resolvedMistakes}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                <span className="text-xs text-rose-800 block">Active Review Queue</span>
                <span className="text-2xl font-bold font-mono text-rose-700 mt-1 block">
                  {data.revision.activeMistakes}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs text-amber-800 block">Due for Spaced Review</span>
                <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block">
                  {data.revision.dueForSpacedReview}
                </span>
              </div>
            </div>

            {/* Error pattern breakdown */}
            {data.revision.reasonBreakdown.length > 0 && (
              <div className="space-y-2 pt-3">
                <span className="text-xs font-bold text-slate-800 block">Root-Cause Error Classification:</span>
                <div className="space-y-2">
                  {data.revision.reasonBreakdown.map((r, rIdx) => (
                    <div key={rIdx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{r.label}</span>
                        <span className="font-mono text-slate-500 font-bold">{r.count} ({r.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${r.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
