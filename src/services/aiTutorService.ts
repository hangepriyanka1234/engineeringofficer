import {
  AITutorQueryRequest,
  AITutorQueryResponse,
  AICacheStats,
  PregeneratedExplanation,
} from '../types';

export class AITutorService {
  static async askTutor(request: AITutorQueryRequest): Promise<AITutorQueryResponse> {
    try {
      const res = await fetch('/api/ai-tutor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to query AI Tutor');
      }
      return await res.json();
    } catch (error: any) {
      console.error('[AITutorService] Error:', error);
      throw error;
    }
  }

  static async getCacheStats(): Promise<AICacheStats> {
    try {
      const res = await fetch('/api/ai-tutor/cache-stats');
      const data = await res.json();
      return data.stats;
    } catch (e) {
      return {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        hitRatePercent: 0,
        pregeneratedHits: 0,
        activeEntriesCount: 0,
        savedCostEstimatedRupees: 0,
      };
    }
  }

  static async getPregeneratedLibrary(): Promise<PregeneratedExplanation[]> {
    try {
      const res = await fetch('/api/ai-tutor/pregenerated-library');
      const data = await res.json();
      return data.library || [];
    } catch (e) {
      return [];
    }
  }

  static async invalidateCache(pattern?: string): Promise<{ success: boolean; invalidatedCount: number }> {
    try {
      const res = await fetch('/api/ai-tutor/invalidate-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, invalidatedCount: 0 };
    }
  }
}
