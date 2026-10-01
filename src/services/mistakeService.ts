import {
  SmartMistakeRecord,
  ErrorCategoryConfig,
  SmartErrorCategoryId,
  ConfidenceLevel,
  MistakeTriggerReason,
  Question,
} from '../types';

export const MistakeService = {
  async getMistakes(userEmail = 'student@engineeringofficer.in'): Promise<SmartMistakeRecord[]> {
    try {
      const res = await fetch(`/api/mistakes?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      return data.mistakes || [];
    } catch (err) {
      console.error('Failed to fetch mistakes from server:', err);
      return [];
    }
  },

  async logOrUpdateMistake(params: {
    userEmail?: string;
    questionId: string;
    studentAnswer: number | string | null;
    correctOption?: number;
    correctAnswer?: number | string;
    explanation?: string;
    conceptName?: string;
    errorCategory?: SmartErrorCategoryId | string;
    personalNote?: string;
    confidenceLevel?: ConfidenceLevel;
    trigger?: MistakeTriggerReason;
    timeSpentSeconds?: number;
    customQuestion?: Question;
  }): Promise<SmartMistakeRecord | null> {
    try {
      const res = await fetch('/api/mistakes/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return data.record || null;
    } catch (err) {
      console.error('Failed to log mistake:', err);
      return null;
    }
  },

  async updatePersonalNote(id: string, note: string, userEmail = 'student@engineeringofficer.in'): Promise<SmartMistakeRecord | null> {
    try {
      const res = await fetch(`/api/mistakes/${id}/note`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, userEmail }),
      });
      const data = await res.json();
      return data.record || null;
    } catch (err) {
      console.error('Failed to update note:', err);
      return null;
    }
  },

  async updateCategory(id: string, category: string, userEmail = 'student@engineeringofficer.in'): Promise<SmartMistakeRecord | null> {
    try {
      const res = await fetch(`/api/mistakes/${id}/category`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, userEmail }),
      });
      const data = await res.json();
      return data.record || null;
    } catch (err) {
      console.error('Failed to update category:', err);
      return null;
    }
  },

  async toggleMastery(id: string, userEmail = 'student@engineeringofficer.in'): Promise<SmartMistakeRecord | null> {
    try {
      const res = await fetch(`/api/mistakes/${id}/toggle-mastery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });
      const data = await res.json();
      return data.record || null;
    } catch (err) {
      console.error('Failed to toggle mastery:', err);
      return null;
    }
  },

  async deleteMistake(id: string, userEmail = 'student@engineeringofficer.in'): Promise<boolean> {
    try {
      const res = await fetch(`/api/mistakes/${id}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.error('Failed to delete mistake:', err);
      return false;
    }
  },

  async getErrorCategories(): Promise<ErrorCategoryConfig[]> {
    try {
      const res = await fetch('/api/mistakes/categories');
      const data = await res.json();
      return data.categories || [];
    } catch (err) {
      console.error('Failed to fetch error categories:', err);
      return [];
    }
  },

  async addCustomCategory(cat: Omit<ErrorCategoryConfig, 'isSystem'>): Promise<ErrorCategoryConfig | null> {
    try {
      const res = await fetch('/api/admin/mistakes/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      const data = await res.json();
      return data.category || null;
    } catch (err) {
      console.error('Failed to add category:', err);
      return null;
    }
  },
};
