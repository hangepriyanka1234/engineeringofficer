import React from 'react';
import {
  LayoutDashboard,
  Target,
  FileCheck2,
  History,
  BookOpen,
  FileText,
  Briefcase,
  Bot,
  AlertOctagon,
  BarChart3,
  Video,
  User,
  CreditCard,
  Bell,
  Headphones,
  Shield,
  Award,
  HardHat,
  Compass,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Calculator,
  Cpu,
  Layers,
  Sparkles,
  Trophy,
  Gift
} from 'lucide-react';
import { StudentProfile } from '../../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  profile: StudentProfile;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  profile,
  isAdmin,
  setIsAdmin,
}) => {
  const studentNavItems = [
    { id: 'dashboard', label: 'Home / Dashboard', icon: LayoutDashboard, badge: undefined },
    { id: 'daily-capsule', label: 'Daily Civil Capsule', icon: Sparkles, badge: 'Daily' },
    { id: 'exam-ecosystem', label: 'Target Exam Engine', icon: Compass, badge: 'Multi-Exam' },
    { id: 'study-planner', label: 'Study Planner & Tasks', icon: Calendar, badge: 'Adaptive' },
    { id: 'practice', label: 'Practice Questions', icon: Target, badge: '8k+' },
    { id: 'mock-tests', label: 'CBT Mock Tests', icon: FileCheck2, badge: 'Live' },
    { id: 'site-practical', label: 'Site Engineer Lab & BBS', icon: HardHat, badge: 'IS Field' },
    { id: 'visual-learning', label: 'Visual Diagrams Lab', icon: Layers, badge: 'Hotspots' },
    { id: 'formula-lab', label: 'Civil Formula Lab', icon: BookOpen, badge: 'IS Codes' },
    { id: 'calculators', label: 'Engineering Calculators', icon: Calculator, badge: '12 Suites' },
    { id: 'ai-coach', label: 'AI Tutor (Er. SP AI)', icon: Bot, badge: 'Multilingual' },
    { id: 'mistakes', label: 'Mistake Notebook', icon: AlertOctagon, badge: 'Smart' },
    { id: 'spaced-revision', label: 'Spaced Repetition', icon: RotateCcw, badge: 'SM-2' },
    { id: 'gamification', label: 'State Rankings & Badges', icon: Trophy, badge: 'Leaderboard' },
    { id: 'pyqs', label: 'Previous Year Papers', icon: History, badge: '2015-24' },
    { id: 'notices', label: 'Current Recruitment', icon: Briefcase, badge: 'Official' },
    { id: 'materials', label: 'Study Materials & IS Codes', icon: FileText, badge: 'IS 456' },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3, badge: undefined },
    { id: 'referrals', label: 'Refer & Earn Pro', icon: Gift, badge: '+7 Days' },
    { id: 'plans', label: 'Plans & Upgrades', icon: CreditCard, badge: 'Pro' },
    { id: 'profile', label: 'Profile & Targets', icon: User, badge: undefined },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800/80 min-h-[calc(100vh-4rem)]">
      {/* Upper Navigation */}
      <div className="py-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {/* User Status Card */}
        <div className="mb-3 px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs">
              <div className="font-semibold text-white truncate max-w-[120px]">{profile.name}</div>
              <div className="text-[10px] text-sky-400 font-mono">{profile.subscriptionTier}</div>
            </div>
          </div>
          <button
            onClick={() => setActiveView('plans')}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 transition-colors"
          >
            Upgrade
          </button>
        </div>

        {/* Section Header */}
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Core Civil Modules
        </div>

        {/* Navigation list */}
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                if (isAdmin) setIsAdmin(false);
                setActiveView(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600/90 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-sky-400 border border-sky-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Brand accreditation */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <HardHat className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="leading-tight">
            <span className="font-bold text-slate-200">SP Engineering Academy</span>
            <p className="text-[10px] text-slate-400">Govt Civil Officer Guidance</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
