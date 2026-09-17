import {
  PYQItem,
  PYQAnalyticsData,
  PYQTopicMappingItem,
  PYQVerificationStatus
} from '../types';

export interface PYQQueryParams {
  query?: string;
  examTargetId?: string;
  year?: number | string;
  subjectId?: string;
  topic?: string;
  difficulty?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sanitizeKeys?: boolean;
}

export interface PYQFetchResult {
  questions: PYQItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  countsByStatus: Record<string, number>;
}

export const PyqService = {
  // Fetch filtered & paginated PYQs
  async getPYQs(params: PYQQueryParams = {}): Promise<PYQFetchResult> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.examTargetId && params.examTargetId !== 'all') searchParams.set('examTargetId', params.examTargetId);
    if (params.year && params.year !== 'all') searchParams.set('year', String(params.year));
    if (params.subjectId && params.subjectId !== 'all') searchParams.set('subjectId', params.subjectId);
    if (params.topic && params.topic !== 'all') searchParams.set('topic', params.topic);
    if (params.difficulty && params.difficulty !== 'all') searchParams.set('difficulty', params.difficulty);
    if (params.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params.sanitizeKeys) searchParams.set('sanitizeKeys', 'true');

    const res = await fetch(`/api/pyqs?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch PYQs: ${res.statusText}`);
    }
    return res.json();
  },

  // Get deep PYQ Analytics
  async getAnalytics(params?: { examTargetId?: string; year?: number }): Promise<PYQAnalyticsData> {
    const searchParams = new URLSearchParams();
    if (params?.examTargetId && params.examTargetId !== 'all') searchParams.set('examTargetId', params.examTargetId);
    if (params?.year) searchParams.set('year', String(params.year));

    const res = await fetch(`/api/pyqs/analytics?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to load analytics: ${res.statusText}`);
    }
    return res.json();
  },

  // Get Hierarchical Topic Mapping
  async getTopicMapping(params?: { examTargetId?: string; year?: number }): Promise<PYQTopicMappingItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.examTargetId && params.examTargetId !== 'all') searchParams.set('examTargetId', params.examTargetId);
    if (params?.year) searchParams.set('year', String(params.year));

    const res = await fetch(`/api/pyqs/topic-mapping?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to load topic mapping: ${res.statusText}`);
    }
    return res.json();
  },

  // Get single PYQ by ID
  async getPYQById(id: string): Promise<PYQItem> {
    const res = await fetch(`/api/pyqs/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch PYQ: ${res.statusText}`);
    }
    return res.json();
  },

  // Stage / Import questions (sets to unverified)
  async importQuestions(items: Partial<PYQItem>[], actorEmail?: string): Promise<{ importedCount: number; stagedIds: string[] }> {
    const res = await fetch('/api/pyqs/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, actorEmail: actorEmail || 'superadmin@engineeringofficer.in' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to import questions');
    }
    return res.json();
  },

  // Admin approves a PYQ as official verified
  async approvePYQ(
    id: string,
    approvalData: {
      verifiedBy: string;
      adminApprovalNotes: string;
      verifiedKeyRef?: string;
      officialBookletSeries?: string;
      isCodeReference?: string;
      correctedStem?: string;
      correctedOptions?: string[];
      correctedOption?: number;
      correctedExplanation?: string;
    },
    actorEmail?: string
  ): Promise<{ success: boolean; message: string; pyq: PYQItem }> {
    const res = await fetch(`/api/pyqs/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalData, actorEmail: actorEmail || 'superadmin@engineeringofficer.in' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve PYQ');
    }
    return res.json();
  },

  // Admin rejects a PYQ
  async rejectPYQ(id: string, reason: string, actorEmail?: string): Promise<{ success: boolean; message: string; pyq: PYQItem }> {
    const res = await fetch(`/api/pyqs/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, actorEmail: actorEmail || 'superadmin@engineeringofficer.in' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reject PYQ');
    }
    return res.json();
  },

  // Admin updates PYQ and bumps version
  async updatePYQ(
    id: string,
    updates: Partial<PYQItem>,
    changeSummary: string,
    actorEmail?: string
  ): Promise<{ success: boolean; message: string; pyq: PYQItem }> {
    const res = await fetch(`/api/pyqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates, changeSummary, actorEmail: actorEmail || 'superadmin@engineeringofficer.in' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update PYQ');
    }
    return res.json();
  },

  // Admin rolls back version
  async rollbackPYQ(id: string, targetVersion: string, actorEmail?: string): Promise<{ success: boolean; message: string; pyq: PYQItem }> {
    const res = await fetch(`/api/pyqs/${id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetVersion, actorEmail: actorEmail || 'superadmin@engineeringofficer.in' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to rollback PYQ');
    }
    return res.json();
  },
};
