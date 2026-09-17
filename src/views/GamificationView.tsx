import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  ShieldCheck,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HardHat,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { LeaderboardRankEntry, StudentBadgeDef, StudentProfile } from '../types';
import { GamificationService } from '../services/gamificationService';

interface GamificationViewProps {
  profile: StudentProfile;
}

export const GamificationView: React.FC<GamificationViewProps> = ({ profile }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRankEntry[]>([]);
  const [badges, setBadges] = useState<StudentBadgeDef[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile.email, isAnonymous]);

  const loadData = async () => {
    setLoading(true);
    const [boardData, badgeData] = await Promise.all([
      GamificationService.getLeaderboard(isAnonymous ? '' : profile.email, profile.name),
      GamificationService.getBadges(),
    ]);
    setLeaderboard(boardData);
    setBadges(badgeData);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 rounded-2xl p-6 text-white border border-amber-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-amber-200 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>State-Wide Civil Engineering Aspirant Rankings</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Rankings, Streaks & Engineering Badges</h1>
            <p className="text-amber-100 text-sm max-w-2xl">
              Server-verified CBT test submissions, daily problem streaks, and IS Code mastery badges. Anti-cheat protected.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/30 text-amber-200 hover:bg-amber-500/50 flex items-center gap-1.5 font-medium transition-colors"
            >
              {isAnonymous ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isAnonymous ? 'Public Mode: Masked' : 'Public Mode: Shown'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 rounded-xl p-1 gap-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>State Leaderboard</span>
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Engineering Badges ({badges.filter(b => b.isUnlocked).length}/{badges.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'leaderboard' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="w-16">Rank</div>
            <div className="flex-1">Aspirant</div>
            <div className="w-24 text-center">Streak</div>
            <div className="w-24 text-center">Accuracy</div>
            <div className="w-24 text-right">Points</div>
          </div>

          <div className="divide-y divide-slate-800">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`p-4 flex items-center justify-between transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-amber-500/10 border-l-4 border-amber-500 font-semibold'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="w-16 flex items-center gap-1.5 font-bold">
                  {entry.rank === 1 && <span className="text-xl">🥇</span>}
                  {entry.rank === 2 && <span className="text-xl">🥈</span>}
                  {entry.rank === 3 && <span className="text-xl">🥉</span>}
                  {entry.rank > 3 && <span className="text-sm text-slate-400">#{entry.rank}</span>}
                </div>

                <div className="flex-1">
                  <div className="text-sm text-white font-semibold flex items-center gap-2">
                    <span>{entry.studentName}</span>
                    {entry.isCurrentUser && (
                      <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{entry.studentEmailMasked} • {entry.tier}</div>
                </div>

                <div className="w-24 text-center flex items-center justify-center gap-1 text-xs text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{entry.streakDays}d</span>
                </div>

                <div className="w-24 text-center text-xs text-emerald-400 font-bold">
                  {entry.accuracyPercent}%
                </div>

                <div className="w-24 text-right text-sm font-bold text-white font-mono">
                  {entry.points.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all ${
                badge.isUnlocked
                  ? 'bg-slate-900 border-amber-500/60 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${badge.isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                  {badge.isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                {badge.isUnlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    UNLOCKED
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    {badge.progressPercent}% Complete
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-white mb-1">{badge.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{badge.description}</p>

              {!badge.isUnlocked && (
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
