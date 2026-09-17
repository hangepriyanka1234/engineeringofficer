import React, { useState, useEffect } from 'react';
import {
  Layers,
  Target,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Clock,
  FileText,
  Building2,
  Check,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { ExamProfile, StudentProfile, MultiExamAnalysisResult, ExamTargetId } from '../types';
import { StorageService } from '../services/storageService';
import { ExamBadge } from '../components/common/ExamBadge';

interface ExamEcosystemViewProps {
  studentProfile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onSelectPrimaryExam: (examId: ExamTargetId) => void;
  onNavigateToPractice?: (subjectId?: string) => void;
}

export const ExamEcosystemView: React.FC<ExamEcosystemViewProps> = ({
  studentProfile,
  onUpdateProfile,
  onSelectPrimaryExam,
  onNavigateToPractice
}) => {
  const [allProfiles, setAllProfiles] = useState<ExamProfile[]>([]);
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>(
    studentProfile.targetExams && studentProfile.targetExams.length > 0
      ? studentProfile.targetExams
      : ['maha_pwd', 'ssc_je']
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'diploma' | 'degree'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'core' | 'differential' | 'comparison' | 'strategy'>('overview');
  const [analysis, setAnalysis] = useState<MultiExamAnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    runAnalysis(selectedExamIds);
  }, [selectedExamIds]);

  const loadProfiles = () => {
    const list = StorageService.getExamProfiles();
    setAllProfiles(list);
  };

  const runAnalysis = async (examIds: string[]) => {
    setIsLoadingAnalysis(true);
    try {
      const res = await StorageService.analyzeMultiTargetPreparation(examIds, studentProfile.qualification);
      setAnalysis(res);
    } catch (e) {
      console.error('Failed to run multi-exam analysis', e);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const toggleExamSelection = (id: string) => {
    let next: string[];
    if (selectedExamIds.includes(id)) {
      if (selectedExamIds.length === 1) return; // Must have at least 1 target
      next = selectedExamIds.filter((e) => e !== id);
    } else {
      next = [...selectedExamIds, id];
    }
    setSelectedExamIds(next);
  };

  const handleApplyPreset = (presetIds: string[]) => {
    setSelectedExamIds(presetIds);
  };

  const handleSaveToProfile = () => {
    const primary = selectedExamIds.includes(studentProfile.primaryTargetExam)
      ? studentProfile.primaryTargetExam
      : (selectedExamIds[0] as ExamTargetId);

    const updated: StudentProfile = {
      ...studentProfile,
      targetExams: selectedExamIds as ExamTargetId[],
      primaryTargetExam: primary
    };

    onUpdateProfile(updated);
    StorageService.saveProfile(updated);
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3000);
  };

  // Filter profiles for selector
  const filteredProfiles = allProfiles.filter((p) => {
    if (levelFilter !== 'all' && p.level !== levelFilter) return false;
    if (eligibilityFilter === 'diploma' && !p.diplomaEligible) return false;
    if (eligibilityFilter === 'degree' && !p.degreeEligible) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.shortName.toLowerCase().includes(q) ||
        p.authority.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-sky-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Multi-Exam Ecosystem Engine</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-300">Active Targets:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs">
                {selectedExamIds.length} Examinations Selected
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Target Exam Ecosystem & Multi-Board Preparation Engine
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Target UPSC ESE, SSC JE, RRB JE, MPSC Civil, Maha PWD, WRD, ZP, and Municipal Corporation examinations simultaneously.
              Our algorithmic engine merges common core engineering preparation while isolating exam-specific technical and non-technical differentiators.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Quick Board Presets:</span>
            <button
              onClick={() => handleApplyPreset(['maha_pwd', 'zp_civil', 'wrd_irrigation', 'bmc_municipal'])}
              className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-medium transition-colors"
            >
              Maharashtra State & Municipal JE (4 Exams)
            </button>
            <button
              onClick={() => handleApplyPreset(['ssc_je', 'maha_pwd', 'zp_civil', 'wrd_irrigation', 'rrb_je'])}
              className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-medium transition-colors"
            >
              All-India Diploma Universal Pack (5 Exams)
            </button>
            <button
              onClick={() => handleApplyPreset(['upsc_ese', 'mpsc_civil', 'bmc_municipal', 'maha_pwd'])}
              className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-medium transition-colors"
            >
              Degree Executive AE/AEE Pack (4 Exams)
            </button>
          </div>
        </div>
      </div>

      {/* Target Exam Multi-Selector Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Target className="w-5 h-5 text-sky-600" />
              <span>Configurable Examination Selector</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select all recruitment examinations you plan to appear for in 2026-2027.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveToProfile}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sync with My Study Profile</span>
            </button>
          </div>
        </div>

        {savedSuccessMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully updated student profile with {selectedExamIds.length} target examinations. Active dashboard adapted!</span>
          </div>
        )}

        {/* Filters and search */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search exams by board, post, authority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 px-2">Level:</span>
            {['all', 'Central', 'State', 'Local Body'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                  levelFilter === lvl
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 px-2">Eligibility:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'diploma', label: 'Diploma' },
              { id: 'degree', label: 'Degree' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEligibilityFilter(f.id as any)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  eligibilityFilter === f.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Cards Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredProfiles.map((profile) => {
            const isSelected = selectedExamIds.includes(profile.id);
            const isPrimary = studentProfile.primaryTargetExam === profile.id;

            return (
              <div
                key={profile.id}
                onClick={() => toggleExamSelection(profile.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">
                      {profile.shortName}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      profile.level === 'Central'
                        ? 'bg-purple-100 text-purple-700'
                        : profile.level === 'State'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {profile.level}
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {profile.name}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{profile.duration || '120 Mins'}</span>
                  </div>
                  <div>
                    {profile.diplomaEligible && profile.degreeEligible ? (
                      <span className="text-emerald-700 font-medium">Diploma & Degree</span>
                    ) : profile.diplomaEligible ? (
                      <span className="text-blue-700 font-medium">Diploma Only</span>
                    ) : (
                      <span className="text-amber-700 font-medium">Degree Only</span>
                    )}
                  </div>
                </div>

                {isPrimary && (
                  <div className="mt-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                    <span>★ Primary Target</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis Engine Section */}
      {analysis && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Engine Header / Gauge */}
          <div className="p-6 bg-slate-50/70 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-md">
                    Algorithmic Analysis
                  </span>
                  <span className="text-xs text-slate-500">
                    Comparing {analysis.selectedExams.length} Selected Examinations
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Multi-Target Preparation Synergy Matrix
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  The SP engine analyzed the syllabus, paper patterns, marks, and IS codes across your selected exams.
                  Follow the unified study split below to avoid duplicated effort.
                </p>
              </div>

              {/* Overlap Percentage Card */}
              <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-sky-600 stroke-current"
                      strokeWidth="3.5"
                      strokeDasharray={`${analysis.overlapPercentage}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-base font-extrabold text-slate-900">
                      {analysis.overlapPercentage}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900">Common Syllabus Core</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {analysis.universalCoreSubjects.length} Universal Subjects Shared
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm inline-block">
                    High Preparation Synergy
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200">
              {[
                { id: 'overview', label: 'Preparation Overview', icon: BookOpen },
                { id: 'core', label: `Universal Core (${analysis.universalCoreSubjects.length})`, icon: CheckCircle2 },
                { id: 'differential', label: `Exam Differentiators (${analysis.differentialSubjects.length})`, icon: AlertTriangle },
                { id: 'comparison', label: 'Board Pattern Matrix', icon: Layers },
                { id: 'strategy', label: 'Unified Daily Strategy', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                      isActive
                        ? 'border-sky-600 text-sky-600 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Strategic Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-sky-800 tracking-wider">
                      Universal Core Recommendation
                    </span>
                    <span className="text-2xl font-black text-sky-900">
                      {analysis.unifiedStrategy.recommendedCoreRatio}%
                    </span>
                  </div>
                  <h4 className="mt-1 font-bold text-sm text-slate-900">
                    Master Once — Qualify in All {analysis.selectedExams.length} Boards
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Dedicate {analysis.unifiedStrategy.recommendedCoreRatio}% of your daily time to RCC (IS 456), Building Materials, SOM, Surveying, and Soil Mechanics.
                    A high score in this universal matrix automatically qualifies you across all selected exams.
                  </p>
                  <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-sky-700">
                    <span>Daily Goal: {analysis.unifiedStrategy.coreDailyQuestions} Core Questions</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-amber-800 tracking-wider">
                      Exam-Specific Differentiators
                    </span>
                    <span className="text-2xl font-black text-amber-900">
                      {analysis.unifiedStrategy.recommendedDifferentialRatio}%
                    </span>
                  </div>
                  <h4 className="mt-1 font-bold text-sm text-slate-900">
                    Board-Specific High-Weightage Modules
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Dedicate {analysis.unifiedStrategy.recommendedDifferentialRatio}% of study to board-specific requirements (e.g. WRD Canal Hydraulics, BMC Municipal Environmental & DCR, PWD Red Book DSR, RRB Railway Track Engg).
                  </p>
                  <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-amber-800">
                    <span>Daily Goal: {analysis.unifiedStrategy.diffDailyQuestions} Specific Questions</span>
                  </div>
                </div>
              </div>

              {/* Key Action Guidance Items */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Strategic Directives for Selected Examination Combination</span>
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {analysis.unifiedStrategy.keyActionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start space-x-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Countdowns */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2 mb-3">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Synchronized Multi-Exam Timeline</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {analysis.timelineMilestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all"
                    >
                      <div className="text-[11px] font-bold text-sky-700">{milestone.examShortName}</div>
                      <div className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">
                        {milestone.event}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{milestone.date}</span>
                        {milestone.daysRemaining !== undefined && (
                          <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm">
                            {milestone.daysRemaining} days left
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Universal Core Subjects */}
          {activeTab === 'core' && (
            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start space-x-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Universal Core Rule:</strong> These {analysis.universalCoreSubjects.length} subjects appear with heavy weightage in every single board you selected.
                  Every hour spent here contributes directly to all your target exams simultaneously.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {analysis.universalCoreSubjects.map((core) => (
                  <div
                    key={core.subjectId}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900">{core.subjectName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ~{core.averageWeightage}% Average Weightage
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{core.summary}</p>
                      </div>

                      {onNavigateToPractice && (
                        <button
                          onClick={() => onNavigateToPractice(core.subjectId)}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-lg border border-sky-200 flex items-center space-x-1 self-start sm:self-center transition-colors"
                        >
                          <span>Practice Subject</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">Key IS Codes & Handbooks:</span>
                      {core.isCodes.map((code, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded-md font-semibold"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Differential & Exam-Specific */}
          {activeTab === 'differential' && (
            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Board-Specific Differentiators:</strong> These modules carry unique significance for specific recruitment bodies.
                  Prepare them in specialized weekend blocks so you do not dilute your core technical speed.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.differentialSubjects.map((diff, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-colors shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {diff.examShortName}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {diff.weightage}% Weightage
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{diff.subjectName}</h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {diff.strategicNote}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Depth Level:</span>
                      <span className="font-semibold text-slate-700 capitalize">
                        {diff.depthLevel.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Board Pattern Matrix */}
          {activeTab === 'comparison' && (
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3 rounded-l-lg">Examination & Cadre</th>
                    <th className="p-3">Conducting Authority</th>
                    <th className="p-3">Questions & Marks</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Negative Marking</th>
                    <th className="p-3">Diploma Allowed</th>
                    <th className="p-3 rounded-r-lg">Official Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {analysis.patternComparison.map((comp) => (
                    <tr key={comp.examId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{comp.shortName}</td>
                      <td className="p-3 text-slate-600">{comp.conductingBody}</td>
                      <td className="p-3 text-slate-700">
                        {comp.questionCount} Qs ({comp.totalMarks} Marks)
                      </td>
                      <td className="p-3 text-slate-700">{comp.duration}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            comp.negativeMarking.toLowerCase().includes('nil') ||
                            comp.negativeMarking.toLowerCase().includes('no')
                              ? 'bg-emerald-100 text-emerald-800'
                              : comp.negativeMarking.includes('1/3') || comp.negativeMarking.includes('0.33')
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {comp.negativeMarking}
                        </span>
                      </td>
                      <td className="p-3">
                        {comp.diplomaAllowed ? (
                          <span className="text-emerald-700 font-bold">✓ Yes</span>
                        ) : (
                          <span className="text-rose-700 font-bold">✕ Degree Only</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {comp.officialSource}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 5: Unified Strategy */}
          {activeTab === 'strategy' && (
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                  <span>Daily Question & Revision Allocator</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-2xl font-black text-slate-900">
                      {analysis.unifiedStrategy.dailyQuestionGoal}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Total Daily MCQs Target</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-sky-200 shadow-2xs">
                    <div className="text-2xl font-black text-sky-600">
                      {analysis.unifiedStrategy.coreDailyQuestions}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Universal Core MCQs (IS 456, SOM, Geo)</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-amber-200 shadow-2xs">
                    <div className="text-2xl font-black text-amber-600">
                      {analysis.unifiedStrategy.diffDailyQuestions}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Differential MCQs (WRD, BMC, PWD DSR)</div>
                  </div>
                </div>
              </div>

              {/* Er. SP Mentorship Note */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-sky-900 to-indigo-900 text-white space-y-2 shadow-sm">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Faculty Master Advice from Er. S. Patil</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  "One Strong Civil Engineering Foundation Qualifies You in Any Exam"
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Civil engineering recruitment exams share 80%+ identical technical principles. A beam in PWD follows the exact same limit state equations (Cl. 38.1 of IS 456) as a beam in SSC JE or UPSC ESE.
                  Do not buy 5 different books. Master the Universal Core once with our 7-tier syllabus, and calibrate your test-taking speed to each board's negative marking rule.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
