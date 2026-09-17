import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Plus,
  ArrowRight,
  BookOpen,
  History,
  FileCheck2,
  ChevronRight,
  TrendingUp,
  HardHat,
  Filter
} from 'lucide-react';
import { StudentProfile, StudentStudyPlan, DailyStudyTask, ExamTargetId } from '../types';
import { EXAM_CATALOGUE, SUBJECTS_LIST } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface StudyPlannerViewProps {
  profile: StudentProfile;
  onPlanUpdated?: () => void;
  setActiveView: (view: string) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  profile,
  onPlanUpdated,
  setActiveView,
}) => {
  const [studyPlan, setStudyPlan] = useState<StudentStudyPlan>(() => StorageService.getStudyPlan(profile));
  const [selectedExamId, setSelectedExamId] = useState<ExamTargetId>(studyPlan.targetExamId || profile.targetExams[0] || 'maha_pwd');
  const [targetDate, setTargetDate] = useState<string>(studyPlan.targetExamDate || '2026-11-20');
  const [dailyHours, setDailyHours] = useState<number>(studyPlan.dailyHours || profile.dailyStudyHours || 4);
  const [activeTab, setActiveTab] = useState<'today' | 'milestones' | 'allocation'>('today');
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [isAdapting, setIsAdapting] = useState<boolean>(false);
  const [adaptSuccessMsg, setAdaptSuccessMsg] = useState<string | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<DailyStudyTask['category']>('practice');
  const [newTaskMinutes, setNewTaskMinutes] = useState(45);
  const [newTaskSubject, setNewTaskSubject] = useState('RCC & Prestressed Concrete');
  const [newTaskTargetCount, setNewTaskTargetCount] = useState(25);
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Calculate days remaining
  const calculateDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysRemaining = calculateDaysRemaining(studyPlan.targetExamDate);

  const completedTasksCount = studyPlan.dailyTasks.filter((t) => t.completed).length;
  const totalTasksCount = studyPlan.dailyTasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const handleToggleTask = (taskId: string) => {
    StorageService.toggleDailyTask(taskId);
    const updated = StorageService.getStudyPlan(profile);
    setStudyPlan(updated);
    if (onPlanUpdated) onPlanUpdated();
  };

  const handleRegeneratePlan = () => {
    const newPlan = StorageService.generateStudyPlan(
      selectedExamId,
      targetDate,
      dailyHours,
      ['Soil Mechanics & Foundation Engg', 'Design of Steel Structures (IS 800:2007)']
    );
    StorageService.saveStudyPlan(newPlan);
    setStudyPlan(newPlan);
    if (onPlanUpdated) onPlanUpdated();
    setAdaptSuccessMsg('New daily study schedule generated from Civil Engineering syllabus!');
    setTimeout(() => setAdaptSuccessMsg(null), 4000);
  };

  const handleAdaptToPerformance = () => {
    setIsAdapting(true);
    setTimeout(() => {
      const adapted = StorageService.adaptStudyPlanToPerformance([
        'Soil Mechanics & Foundation Engg',
        'Design of Steel Structures (IS 800:2007)',
        'Open Channel Flow & Hydraulics'
      ]);
      setStudyPlan(adapted);
      setIsAdapting(false);
      setAdaptSuccessMsg('Plan successfully adapted! Allocated remedial revision & priority practice for weak topics.');
      setTimeout(() => setAdaptSuccessMsg(null), 5000);
      if (onPlanUpdated) onPlanUpdated();
    }, 600);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    StorageService.addCustomDailyTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      allocatedMinutes: Number(newTaskMinutes),
      subjectName: newTaskSubject,
      targetCount: Number(newTaskTargetCount),
      notes: newTaskNotes.trim() || undefined,
    });

    const updated = StorageService.getStudyPlan(profile);
    setStudyPlan(updated);
    setShowAddTaskModal(false);
    setNewTaskTitle('');
    setNewTaskNotes('');
    if (onPlanUpdated) onPlanUpdated();
  };

  const categoryBadges: Record<
    DailyStudyTask['category'],
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    practice: {
      label: 'Core Practice',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      icon: Target,
    },
    revision: {
      label: 'IS Codes / Revision',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: BookOpen,
    },
    pyq: {
      label: 'Official PYQ',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: History,
    },
    mock_test: {
      label: 'CBT Mock / Speed',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: FileCheck2,
    },
    is_codes: {
      label: 'Codal Provisions',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: HardHat,
    },
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="bg-blueprint-dark border border-sky-500/20 text-white rounded-xl p-5 sm:p-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-400/30">
                Syllabus-Aligned Daily Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-400/30">
                Target: {studyPlan.targetExamName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-sky-400" />
              <span>Civil Engineering Study Planner</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Auto-balances daily practice, IS codal revisions, official PYQ solving, and CBT mock drills based on your available study hours and accuracy telemetry.
            </p>
          </div>

          {/* Countdown Card */}
          <div className="bg-slate-900/90 rounded-lg p-4 border border-sky-500/30 sm:min-w-[240px] text-center shadow-inner flex flex-col justify-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Exam Countdown
            </span>
            <div className="text-3xl font-extrabold text-sky-400 font-mono mt-1">
              {daysRemaining} <span className="text-sm font-normal text-slate-300">Days</span>
            </div>
            <span className="text-xs text-slate-400 mt-1">Target Date: {studyPlan.targetExamDate}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {adaptSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adaptSuccessMsg}</span>
          </div>
          <button
            onClick={() => setAdaptSuccessMsg(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Configuration & Adaptation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Target Exam Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Target Civil Exam
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value as ExamTargetId)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-medium"
              >
                {EXAM_CATALOGUE.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.shortName} ({exam.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Exam Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Target Exam Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-medium"
              />
            </div>

            {/* Daily Hours */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Daily Study Budget
              </label>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-medium"
              >
                <option value={2}>2 Hours / Day (Focused)</option>
                <option value={3}>3 Hours / Day</option>
                <option value={4}>4 Hours / Day (Standard Pro)</option>
                <option value={6}>6 Hours / Day (Full-Time)</option>
                <option value={8}>8 Hours / Day (Intensive Officer)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <button
              id="generate-plan-btn"
              onClick={handleRegeneratePlan}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recompute Schedule</span>
            </button>

            <button
              id="adapt-plan-telemetry-btn"
              disabled={isAdapting}
              onClick={handleAdaptToPerformance}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isAdapting ? 'animate-spin' : ''}`} />
              <span>{isAdapting ? 'Analyzing Telemetry...' : 'Adapt to My Weak Topics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Adaptive Telemetry Insights Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-amber-950 block text-sm">
              Adaptive Intelligence Active
            </span>
            <p className="text-amber-800 mt-0.5">
              Based on recent test telemetry, higher revision priority is given to{' '}
              <strong className="font-semibold text-amber-950">Soil Mechanics (61% accuracy)</strong> and{' '}
              <strong className="font-semibold text-amber-950">Steel Structures IS 800 (64% accuracy)</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
            Syllabus Coverage: {studyPlan.syllabusCoveragePercent}%
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('today')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'today'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Today's Execution List</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 font-mono">
              {completedTasksCount}/{totalTasksCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('allocation')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'allocation'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Time Allocation</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'milestones'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Weekly Syllabus Milestones</span>
          </button>
        </div>

        {activeTab === 'today' && (
          <button
            id="add-custom-task-btn"
            onClick={() => setShowAddTaskModal(true)}
            className="mb-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Task</span>
          </button>
        )}
      </div>

      {/* Tab Content 1: Today's Execution List */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Progress Tracker Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-700">Today's Study Plan Completion</span>
              <span className="font-bold text-sky-600 font-mono">
                {completedTasksCount} of {totalTasksCount} Tasks Completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Daily Tasks List */}
          <div className="space-y-3">
            {studyPlan.dailyTasks.map((task) => {
              const badge = categoryBadges[task.category] || categoryBadges.practice;
              const Icon = badge.icon;

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    task.completed
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : task.remedialReason
                      ? 'border-amber-200 bg-amber-50/10 hover:border-amber-300'
                      : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 flex-1">
                    <button
                      id={`toggle-task-${task.id}`}
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-sky-600 transition-colors focus:outline-hidden"
                      aria-label={task.completed ? 'Mark task pending' : 'Mark task completed'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          <span>{badge.label}</span>
                        </span>

                        {task.allocatedMinutes && (
                          <span className="text-[11px] font-mono text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-slate-400" />
                            {task.allocatedMinutes} min
                          </span>
                        )}

                        {task.targetCount && (
                          <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Target: {task.targetCount} MCQs
                          </span>
                        )}

                        {task.remedialReason && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                            <span>Remedial Topic</span>
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-bold ${
                          task.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.notes && (
                        <p className="text-xs text-slate-500 italic">
                          Codal Guidance: {task.notes}
                        </p>
                      )}

                      {task.remedialReason && (
                        <p className="text-xs text-amber-800 font-medium">
                          Reason: {task.remedialReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Direct Action Trigger */}
                  <div className="flex items-center space-x-2 pl-8 sm:pl-0 shrink-0">
                    {task.category === 'practice' && (
                      <button
                        onClick={() => setActiveView('practice')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 flex items-center space-x-1"
                      >
                        <span>Start Practice</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {task.category === 'pyq' && (
                      <button
                        onClick={() => setActiveView('pyqs')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center space-x-1"
                      >
                        <span>Open PYQs</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {task.category === 'mock_test' && (
                      <button
                        onClick={() => setActiveView('mock-tests')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center space-x-1"
                      >
                        <span>Launch CBT</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {task.category === 'revision' && (
                      <button
                        onClick={() => setActiveView('materials')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 flex items-center space-x-1"
                      >
                        <span>Read IS Code</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Daily Time Allocation */}
      {activeTab === 'allocation' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Scientific Time Budget: {dailyHours} Hours ({dailyHours * 60} Minutes Total)
              </h2>
              <p className="text-xs text-slate-500">
                Derived from top-ranking candidates' time distribution for Maharashtra PWD & MPSC Civil Engineering exams.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-sky-800">
                  <span>Core MCQ Practice</span>
                  <span className="font-mono">40% ({Math.round(dailyHours * 60 * 0.4)} min)</span>
                </div>
                <div className="w-full bg-sky-200 rounded-full h-2">
                  <div className="bg-sky-600 h-2 rounded-full w-[40%]" />
                </div>
                <p className="text-xs text-sky-900 leading-relaxed">
                  Formula application and numerical solving across SOM, RCC, Steel and Surveying.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                  <span>IS Codes & Revision</span>
                  <span className="font-mono">25% ({Math.round(dailyHours * 60 * 0.25)} min)</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full w-[25%]" />
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Direct clauses from IS 456, IS 800, IRC 37, CPWD specifications, and mistake notebook review.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>Previous Year Papers</span>
                  <span className="font-mono">20% ({Math.round(dailyHours * 60 * 0.2)} min)</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full w-[20%]" />
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Real question papers from MPSC MES, PWD JE 2019/2023, and SSC JE Civil shifts.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-800">
                  <span>CBT Mock Simulation</span>
                  <span className="font-mono">15% ({Math.round(dailyHours * 60 * 0.15)} min)</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-[15%]" />
                </div>
                <p className="text-xs text-purple-900 leading-relaxed">
                  Timed speed mini-mocks with negative marking, question skipping, and diagnostic reviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Weekly Syllabus Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              5-Week Syllabus Roadmap for {studyPlan.targetExamName}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Step-by-step curriculum milestones leading up to official exam date.
            </p>

            <div className="space-y-3">
              {studyPlan.weeklyMilestones.map((m) => (
                <div
                  key={m.weekNumber}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    m.completed
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        Week {m.weekNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{m.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.subjects.map((subj, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-xs font-mono text-slate-500">
                      Target: <strong>{m.targetQuestions} MCQs</strong>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        m.completed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {m.completed ? 'Mastered' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-sky-600" />
                <span>Add Custom Daily Study Task</span>
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title / Activity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Practice 30 MCQs on Welded Connections IS 800"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium"
                  >
                    <option value="practice">Core Practice</option>
                    <option value="revision">IS Codes / Revision</option>
                    <option value="pyq">Official PYQ</option>
                    <option value="mock_test">CBT Mock</option>
                    <option value="is_codes">Codal Provisions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Allocated Time (min)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  >
                    {SUBJECTS_LIST.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Questions</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newTaskTargetCount}
                    onChange={(e) => setNewTaskTargetCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Codal Guidance / Personal Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on Clause 10.5 effective throat thickness"
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
