import React, { useState } from 'react';
import {
  Bell,
  Flame,
  User,
  Shield,
  ShieldCheck,
  Layers,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Building2,
  Sparkles,
  Lock,
  Key,
  X,
  AlertCircle,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { StudentProfile, NotificationItem, ExamTargetId } from '../../types';
import { EXAM_CATALOGUE } from '../../data/mockData';

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
  onOpenComplianceModal?: () => void;
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
  onOpenComplianceModal,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  // Secret Admin Authentication Modal
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentExamObj = EXAM_CATALOGUE.find((e) => e.id === selectedExam) || EXAM_CATALOGUE[4]; // Maha PWD default

  const handleByMhClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdmin) {
      if (activeView === 'admin') {
        setActiveView('dashboard');
      } else {
        setActiveView('admin');
      }
    } else {
      setAdminPasswordInput('');
      setAuthError(null);
      setShowAdminAuthModal(true);
    }
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Secret passcode is 458498 - strictly kept private and never rendered on screen
    if (adminPasswordInput.trim() === '458498') {
      setIsAdmin(true);
      setShowAdminAuthModal(false);
      setAdminPasswordInput('');
      setAuthError(null);
      setActiveView('admin');
    } else {
      setAuthError('Invalid Admin Passcode. Access restricted.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
    setShowAdminAuthModal(false);
    setActiveView('dashboard');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0F2744] text-white border-b border-sky-950/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand Identity with secret "BY SP" Admin gateway */}
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner cursor-pointer"
                onClick={() => setActiveView('dashboard')}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    onClick={() => setActiveView('dashboard')}
                    className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono cursor-pointer"
                  >
                    ENGINEERING OFFICER
                  </span>
                  
                  {/* BY MH Secret Admin Trigger Badge */}
                  <button
                    id="by-mh-secret-trigger"
                    onClick={handleByMhClick}
                    title={isAdmin ? "Super Admin Active (Click to toggle Console)" : "BY MH"}
                    className={`text-xs px-2.5 py-0.5 rounded font-bold border transition-all cursor-pointer select-none active:scale-95 ${
                      isAdmin
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm animate-pulse'
                        : 'bg-sky-500/20 text-sky-300 border-sky-400/30 hover:bg-sky-500/40 hover:text-white'
                    }`}
                  >
                    BY MH
                  </button>
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
            <div className="flex items-center space-x-2.5 sm:space-x-3.5">
              {/* Play Store Compliance & Policy Modal Trigger */}
              {onOpenComplianceModal && (
                <button
                  id="header-compliance-button"
                  onClick={onOpenComplianceModal}
                  title="Google Play Store Verified, Privacy Policy & Zero Broken Links Audit"
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-400/30 transition-all cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Play Store Verified</span>
                </button>
              )}

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

              {/* Admin Button (Visible only when unlocked) */}
              {isAdmin && (
                <button
                  id="admin-mode-toggle"
                  onClick={() => {
                    if (activeView === 'admin') {
                      setActiveView('dashboard');
                    } else {
                      setActiveView('admin');
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    activeView === 'admin'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{activeView === 'admin' ? 'Exit Admin' : 'Admin Panel'}</span>
                </button>
              )}

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

      {/* Secret Admin Authentication Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-sky-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white relative">
            <button
              onClick={() => setShowAdminAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Administrator Access Gateway</h3>
                <p className="text-xs text-slate-400">Protected Super Admin Console — Engineering Officer BY MH</p>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Enter Admin Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoFocus
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest text-center text-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminAuthModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate & Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
