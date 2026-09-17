import { LeaderboardRankEntry, StudentBadgeDef } from '../types';

export class GamificationService {
  static async getLeaderboard(userEmail?: string, userName?: string): Promise<LeaderboardRankEntry[]> {
    try {
      const params = new URLSearchParams();
      if (userEmail) params.append('userEmail', userEmail);
      if (userName) params.append('userName', userName);
      const res = await fetch(`/api/gamification/leaderboard?${params.toString()}`);
      const data = await res.json();
      return data.leaderboard || [];
    } catch (e) {
      console.error('[GamificationService] Error:', e);
      return [];
    }
  }

  static async getBadges(): Promise<StudentBadgeDef[]> {
    try {
      const res = await fetch('/api/gamification/badges');
      const data = await res.json();
      return data.badges || [];
    } catch (e) {
      return [];
    }
  }
}
