import React, { useState } from 'react';
import {
  Bell,
  Flame,
  User,
  Shield,
  Layers,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Building2,
  Sparkles
} from 'lucide-react';
import { StudentProfile, NotificationItem, ExamTargetId } from '../../types';
import { EXAM_CATALOGUE } from '../../data/mockData';
import { StorageService } from '../../services/storageService';

interface HeaderProps {
  profile: StudentProfile;
  activeView: string;
  setActiveView: (view: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  selectedExam: ExamTargetId;
  setSelectedExam: (examId: ExamTargetId) => void;
  notifications: NotificationItem[];
  onNotificationRead: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeView,
  setActiveView,
  isAdmin,
  setIsAdmin,
  selectedExam,
  setSelectedExam,
  notifications,
  onNotificationRead,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentExamObj = EXAM_CATALOGUE.find((e) => e.id === selectedExam) || EXAM_CATALOGUE[4]; // Maha PWD default

  return (
    <header className="sticky top-0 z-30 bg-[#0F2744] text-white border-b border-sky-950/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono">
                  ENGINEERING OFFICER
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                  BY SP
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                Civil Engineering Competitive Exam Prep (Diploma & Degree)
              </p>
            </div>
          </div>

          {/* Center Target Exam Selector */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <button
                id="header-exam-selector"
                onClick={() => setShowExamDropdown(!showExamDropdown)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-xs text-sky-200 border border-sky-500/20 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-medium text-slate-300">Targeting:</span>
                <span className="font-bold text-white max-w-[160px] truncate">{currentExamObj.shortName}</span>
                {profile.targetExams && profile.targetExams.length > 1 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
                    +{profile.targetExams.length - 1}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showExamDropdown && (
                <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-sky-500/30 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-800">
                    <span className="text-[11px] uppercase tracking-wider text-sky-400 font-bold">
                      Select Primary Exam
                    </span>
                    <button
                      onClick={() => {
                        setShowExamDropdown(false);
                        setActiveView('exam-ecosystem');
                      }}
                      className="text-[10px] text-amber-300 hover:text-amber-200 font-bold flex items-center space-x-1"
                    >
                      <span>Multi-Exam Engine →</span>
                    </button>
                  </div>
                  {EXAM_CATALOGUE.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setSelectedExam(exam.id);
                        setShowExamDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-sky-950/60 transition-colors ${
                        selectedExam === exam.id ? 'bg-sky-900/50 text-sky-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium">{exam.shortName}</div>
                        <div className="text-[10px] text-slate-400">{exam.level} · {exam.eligibility.split('/')[0]}</div>
                      </div>
                      {selectedExam === exam.id && <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowExamDropdown(false);
                        setActiveView('exam-ecosystem');
                      }}
                      className="w-full py-1.5 px-2 bg-sky-950/80 hover:bg-sky-900 text-sky-300 text-[11px] font-bold rounded border border-sky-500/30 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Configure Multi-Target Preparation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Daily Streak Indicator */}
            <div
              title={`${profile.streakDays} Day Study Streak!`}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-400 text-xs font-bold"
            >
              <Flame className="w-4 h-4 text-amber-500 animate-pulse fill-amber-500/20" />
              <span>{profile.streakDays}d</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="header-notification-bell"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-sky-500/30 rounded-lg shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800">
                    <div className="font-bold text-sm text-white flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-sky-400" />
                      <span>Exam & Recruitment Alerts</span>
                    </div>
                    <span className="text-xs text-sky-400 cursor-pointer" onClick={() => setActiveView('notifications')}>
                      View all
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onNotificationRead(n.id);
                            if (n.actionLink) setActiveView(n.actionLink);
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-sky-950/30 border-l-2 border-sky-400' : ''
                          }`}
                        >
                          <div className="font-semibold text-white flex items-center justify-between">
                            <span className="truncate pr-2">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Switcher / Mode Toggle */}
            <button
              id="admin-mode-toggle"
              onClick={() => {
                const nextState = !isAdmin;
                setIsAdmin(nextState);
                if (nextState) {
                  setActiveView('admin');
                } else {
                  setActiveView('dashboard');
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isAdmin
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-800/80 text-sky-300 border-sky-500/20 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Admin Console' : 'Admin'}</span>
            </button>

            {/* Profile Avatar / Quick Link */}
            <button
              id="header-profile-button"
              onClick={() => setActiveView('profile')}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {profile.name.charAt(0)}
              </div>
              <span className="text-xs font-medium hidden md:inline text-slate-200">{profile.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
