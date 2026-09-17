import { SitePracticalLesson, SitePracticalCategory } from '../types';

export class SitePracticalService {
  static async getLessons(category?: SitePracticalCategory): Promise<SitePracticalLesson[]> {
    try {
      const url = category ? `/api/site-practical/lessons?category=${category}` : '/api/site-practical/lessons';
      const res = await fetch(url);
      const data = await res.json();
      return data.lessons || [];
    } catch (e) {
      console.error('[SitePracticalService] Error:', e);
      return [];
    }
  }

  static async getLesson(id: string): Promise<SitePracticalLesson | null> {
    try {
      const res = await fetch(`/api/site-practical/lessons/${id}`);
      const data = await res.json();
      return data.lesson || null;
    } catch (e) {
      return null;
    }
  }
}
