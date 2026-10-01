import { CivilFormula } from '../types';

export const FormulaService = {
  async getFormulas(params?: {
    query?: string;
    subjectId?: string;
    topicId?: string;
    userEmail?: string;
  }): Promise<CivilFormula[]> {
    try {
      const q = new URLSearchParams();
      if (params?.query) q.set('query', params.query);
      if (params?.subjectId) q.set('subjectId', params.subjectId);
      if (params?.topicId) q.set('topicId', params.topicId);
      if (params?.userEmail) q.set('userEmail', params.userEmail);

      const res = await fetch(`/api/formulas?${q.toString()}`);
      const data = await res.json();
      return data.formulas || [];
    } catch (err) {
      console.error('Failed to fetch formulas:', err);
      return [];
    }
  },

  async getFormulaOfTheDay(): Promise<{ formula: CivilFormula; dayKey: string } | null> {
    try {
      const res = await fetch('/api/formulas/formula-of-the-day');
      const data = await res.json();
      if (data.success && data.formula) {
        return { formula: data.formula, dayKey: data.dayKey };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch Formula of the Day:', err);
      return null;
    }
  },

  async toggleFavorite(formulaId: string, userEmail = 'student@engineeringofficer.in'): Promise<boolean> {
    try {
      const res = await fetch(`/api/formulas/${formulaId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });
      const data = await res.json();
      return !!data.isFavorite;
    } catch (err) {
      console.error('Failed to toggle favorite formula:', err);
      return false;
    }
  },

  async addFormula(formula: Omit<CivilFormula, 'id' | 'createdAt' | 'updatedAt' | 'version'>, author = 'Admin'): Promise<CivilFormula | null> {
    try {
      const res = await fetch('/api/admin/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula, author }),
      });
      const data = await res.json();
      return data.formula || null;
    } catch (err) {
      console.error('Failed to add formula:', err);
      return null;
    }
  },

  async updateFormula(
    id: string,
    updates: Partial<CivilFormula>,
    changelog: string,
    author = 'Admin'
  ): Promise<CivilFormula | null> {
    try {
      const res = await fetch(`/api/admin/formulas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, changelog, author }),
      });
      const data = await res.json();
      return data.formula || null;
    } catch (err) {
      console.error('Failed to update formula:', err);
      return null;
    }
  },
};
