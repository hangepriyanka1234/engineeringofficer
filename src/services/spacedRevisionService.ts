import {
  SpacedQueueGroup,
  SpacedRevisionAttemptResult,
  SpacedAlgorithmSettings,
  ConfidenceLevel,
} from '../types';

export const SpacedRevisionService = {
  async getQueues(userEmail = 'gitevijay123@gmail.com'): Promise<SpacedQueueGroup | null> {
    try {
      const res = await fetch(`/api/revision/queues?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        return {
          dueToday: data.dueToday || [],
          overdue: data.overdue || [],
          upcoming: data.upcoming || [],
          mastered: data.mastered || [],
          totalInQueue: data.totalInQueue || 0,
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to get revision queues:', err);
      return null;
    }
  },

  async submitAttempt(params: {
    userEmail?: string;
    mistakeRecordId: string;
    selectedAnswer: number | string | null;
    isCorrect: boolean;
    confidence: ConfidenceLevel;
    timeSpentSeconds?: number;
    errorCategoryIfWrong?: string;
  }): Promise<SpacedRevisionAttemptResult | null> {
    try {
      const res = await fetch('/api/revision/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Failed to submit revision attempt:', err);
      return null;
    }
  },

  async bulkRetest(
    results: Array<{
      mistakeRecordId: string;
      selectedAnswer: number | string | null;
      isCorrect: boolean;
      confidence: ConfidenceLevel;
      timeSpentSeconds?: number;
    }>,
    userEmail = 'gitevijay123@gmail.com'
  ) {
    try {
      const res = await fetch('/api/revision/bulk-retest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, results }),
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to perform bulk retest:', err);
      return null;
    }
  },

  async rescheduleOverdue(userEmail = 'gitevijay123@gmail.com') {
    try {
      const res = await fetch('/api/revision/reschedule-overdue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to reschedule overdue items:', err);
      return null;
    }
  },

  async getSettings(): Promise<SpacedAlgorithmSettings | null> {
    try {
      const res = await fetch('/api/admin/revision/settings');
      const data = await res.json();
      return data.settings || null;
    } catch (err) {
      console.error('Failed to fetch spaced settings:', err);
      return null;
    }
  },

  async updateSettings(settings: Partial<SpacedAlgorithmSettings>): Promise<SpacedAlgorithmSettings | null> {
    try {
      const res = await fetch('/api/admin/revision/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      return data.settings || null;
    } catch (err) {
      console.error('Failed to update spaced settings:', err);
      return null;
    }
  },
};
