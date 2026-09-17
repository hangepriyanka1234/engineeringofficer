import React from 'react';
import {
  LayoutDashboard,
  Target,
  FileCheck2,
  Bot,
  Briefcase,
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
    { id: 'practice', label: 'Practice', icon: Target },
    { id: 'mock-tests', label: 'Mock Test', icon: FileCheck2 },
    { id: 'notices', label: 'Recruit', icon: Briefcase },
    { id: 'ai-coach', label: 'SP Coach', icon: Bot },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            id={`mob-nav-${tab.id}`}
            onClick={() => setActiveView(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors ${
              isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
      <button
        id="mob-nav-more"
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-md text-slate-400 hover:text-slate-200"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-medium">All (15)</span>
      </button>
    </nav>
  );
};
