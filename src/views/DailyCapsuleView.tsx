import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  HardHat,
  Bell,
  Check,
  RotateCcw,
  ArrowRight,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { DailyCapsuleItem, InAppNotification } from '../types';
import { CapsuleService } from '../services/capsuleService';

interface DailyCapsuleViewProps {
  userEmail?: string;
  onOpenFormula?: (formulaId: string) => void;
  onOpenPractice?: (topic: string) => void;
}

export const DailyCapsuleView: React.FC<DailyCapsuleViewProps> = ({
  userEmail,
  onOpenFormula,
  onOpenPractice,
}) => {
  const [capsule, setCapsule] = useState<DailyCapsuleItem | null>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userEmail]);

  const loadData = async () => {
    setLoading(true);
    const [capData, notifData] = await Promise.all([
      CapsuleService.getTodayCapsule(),
      CapsuleService.getNotifications(userEmail),
    ]);
    setCapsule(capData);
    setNotifications(notifData);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    const updated = await CapsuleService.markAsRead(id, userEmail);
    setNotifications(updated);
  };

  if (loading || !capsule) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading today's Civil Capsule...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white border border-teal-700/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily High-Yield Civil Engineering Capsule • {capsule.dateStr}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Today's Civil Engineering Capsule</h1>
            <p className="text-teal-100 text-sm max-w-2xl">
              1 Concept, 1 IS-Code Formula, 3 High-Yield MCQs, 1 PYQ Breakdown, and 1 Practical Field Tip updated daily at 06:00 AM.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10">
            <Flame className="w-7 h-7 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-teal-200 uppercase font-semibold">Daily Streak</div>
              <div className="text-lg font-bold text-white">Active (Day 11)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Capsule Core (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Concept of the Day */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                1. Concept of the Day ({capsule.conceptSubject})
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{capsule.conceptTitle}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{capsule.conceptBody}</p>

            {capsule.formulaSnapshot && (
              <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-amber-300">{capsule.formulaSnapshot.title}</span>
                  <span className="font-mono text-slate-500">{capsule.formulaSnapshot.isCode}</span>
                </div>
                <div className="font-mono text-emerald-400 text-sm font-bold">
                  {capsule.formulaSnapshot.expression}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: 3 Daily High-Yield MCQs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>2. Daily 3 High-Yield MCQs</span>
            </h3>

            <div className="space-y-4">
              {capsule.mcqs.map((mcq, idx) => {
                const selectedOpt = selectedAnswers[mcq.id];
                const isRevealed = showExplanations[mcq.id];

                return (
                  <div key={mcq.id} className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-3">
                    <div className="text-sm font-semibold text-white">
                      Q{idx + 1}. {mcq.question}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mcq.options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        const isCorrect = optIdx === mcq.correctIndex;
                        let btnClass = 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-750';

                        if (isRevealed) {
                          if (isCorrect) btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                          else if (isChosen) btnClass = 'bg-rose-950/80 border-rose-500 text-rose-200';
                        } else if (isChosen) {
                          btnClass = 'bg-amber-600/30 border-amber-500 text-amber-200 font-semibold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setSelectedAnswers({ ...selectedAnswers, [mcq.id]: optIdx });
                              setShowExplanations({ ...showExplanations, [mcq.id]: true });
                            }}
                            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnClass}`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {isRevealed && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>

                    {isRevealed && (
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                        <strong className="text-amber-400">Explanation & IS Code ({mcq.isCode}): </strong>
                        {mcq.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: PYQ Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                3. Previous Year Question Highlight ({capsule.pyqHighlight.examName})
              </span>
            </div>
            <div className="text-sm font-semibold text-white">
              {capsule.pyqHighlight.question}
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
              <strong className="text-emerald-400">Solution: </strong>
              {capsule.pyqHighlight.solution}
            </div>
          </div>

          {/* Section 4: Site Engineer Tip */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-3">
            <HardHat className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <strong className="text-amber-300 font-semibold">Site Quality Tip of the Day: </strong>
              {capsule.siteEngineerTip}
            </div>
          </div>
        </div>

        {/* Right Notification & Exam Alerts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">In-App Notifications</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {notifications.filter(n => !n.read).length} Unread
              </span>
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    notif.read
                      ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                      : 'bg-slate-800/90 border-slate-700 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-white">{notif.title}</div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{notif.message}</p>
                  <div className="text-[10px] text-slate-500 mt-2 font-mono">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
