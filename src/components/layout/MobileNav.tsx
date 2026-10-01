import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Target,
  FileText,
  User,
  Menu
} from 'lucide-react';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenMore: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  setActiveView,
  onOpenMore,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'exam-ecosystem', label: 'Exams', icon: Building2 },
    { id: 'practice', label: 'Practice', icon: Target },
    { id: 'pyqs', label: 'Papers', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-1 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            id={`mob-nav-${tab.id}`}
            onClick={() => setActiveView(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors ${
              isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
      <button
        id="mob-nav-more"
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-md text-slate-400 hover:text-slate-200 font-medium"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  );
};

