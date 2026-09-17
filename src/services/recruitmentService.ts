import { VerifiedRecruitmentNotice } from '../types';

export class RecruitmentService {
  static async getNotices(category?: string): Promise<VerifiedRecruitmentNotice[]> {
    try {
      const url = category && category !== 'all' ? `/api/recruitment/notices?category=${category}` : '/api/recruitment/notices';
      const res = await fetch(url);
      const data = await res.json();
      return data.notices || [];
    } catch (e) {
      console.error('[RecruitmentService] Error:', e);
      return [];
    }
  }

  static async getNoticeById(id: string): Promise<VerifiedRecruitmentNotice | null> {
    try {
      const res = await fetch(`/api/recruitment/notices/${id}`);
      const data = await res.json();
      return data.notice || null;
    } catch (e) {
      return null;
    }
  }
}
