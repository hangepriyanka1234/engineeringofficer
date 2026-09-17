import { MockTest, TestAttempt } from '../types';

export interface StartSessionResponse {
  serverSessionId: string;
  serverStartTime: string;
  testId: string;
  title: string;
  examTargetId: string;
  mockCategory: string;
  mockType: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: number;
  negativeMarkingScheme: string;
  passingScore: number;
  questionIds: string[];
  questions: any[];
  sections: any[];
  hasSectionTiming?: boolean;
  sectionRules?: any;
  attemptPolicy?: any;
  instructions: string[];
}

export interface AutosaveResponse {
  success: boolean;
  savedAt: string;
  totalAnswered: number;
  totalMarked: number;
  error?: string;
}

export interface SubmitTestResponse {
  result: {
    score: number;
    totalMarks: number;
    negativeMarkLoss: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
    attemptedQuestions: number;
    totalQuestions: number;
    accuracy: number;
    percentile: number;
    cohortRank: number;
    cohortTotal: number;
    hasComparisonDataset: boolean;
    avgTimePerQuestionSeconds: number;
    durationSpentSeconds: number;
    passingScore: number;
    passed: boolean;
    subjectBreakdown: Record<string, any>;
    topicBreakdown: Record<string, any>;
    difficultyBreakdown: Record<string, any>;
    sectionBreakdown: Record<string, any>;
    serverVerified: boolean;
    verificationSignature: string;
    timestamp: string;
  };
  unlockedQuestions?: any[];
}

class MockTestService {
  private static instance: MockTestService;

  private constructor() {}

  public static getInstance(): MockTestService {
    if (!MockTestService.instance) {
      MockTestService.instance = new MockTestService();
    }
    return MockTestService.instance;
  }

  // Get tests with filtering
  async getTests(filter?: {
    mockType?: string;
    examTargetId?: string;
    subjectId?: string;
    isFree?: boolean;
    search?: string;
  }): Promise<MockTest[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.mockType && filter.mockType !== 'all') params.append('mockType', filter.mockType);
      if (filter?.examTargetId && filter.examTargetId !== 'all') params.append('examTargetId', filter.examTargetId);
      if (filter?.subjectId && filter.subjectId !== 'all') params.append('subjectId', filter.subjectId);
      if (filter?.isFree !== undefined) params.append('isFree', String(filter.isFree));
      if (filter?.search) params.append('search', filter.search);

      const res = await fetch(`/api/tests?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.tests || [];
    } catch (err) {
      console.warn('[MockTestService] Falling back to local tests cache:', err);
      return [];
    }
  }

  // Get single test
  async getTest(testId: string): Promise<MockTest | null> {
    try {
      const res = await fetch(`/api/tests/${testId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.test || null;
    } catch (err) {
      console.error('[MockTestService] Error fetching test:', err);
      return null;
    }
  }

  // Start test session (Server strips correct answers!)
  async startSession(
    testId: string,
    userTier: string = 'Free Starter',
    userEmail: string = 'student@example.com'
  ): Promise<StartSessionResponse> {
    const res = await fetch(`/api/tests/${testId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userTier, userEmail }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Failed to start test session (HTTP ${res.status})`);
    }

    return await res.json();
  }

  // Batched Autosave
  async autosave(
    testId: string,
    payload: {
      serverSessionId: string;
      answers: Record<string, any>;
      markedForReview: Record<string, boolean>;
      currentQuestionIdx?: number;
      currentSectionId?: string;
      timeRemainingSeconds?: number;
    }
  ): Promise<AutosaveResponse> {
    const res = await fetch(`/api/tests/${testId}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return {
        success: false,
        savedAt: new Date().toISOString(),
        totalAnswered: Object.keys(payload.answers).length,
        totalMarked: Object.keys(payload.markedForReview).filter((k) => payload.markedForReview[k]).length,
        error: 'Network sync delayed',
      };
    }

    return await res.json();
  }

  // Recover in-progress session
  async getSession(sessionId: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/tests/session/${sessionId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.session || null;
    } catch {
      return null;
    }
  }

  // Submit test for authoritative evaluation
  async submitTest(
    testId: string,
    payload: {
      serverSessionId?: string;
      userAnswers: Record<string, any>;
      clientDurationSeconds: number;
      userTier?: string;
      userEmail?: string;
    }
  ): Promise<SubmitTestResponse> {
    const res = await fetch(`/api/tests/${testId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Failed to submit test (HTTP ${res.status})`);
    }

    return await res.json();
  }

  // Get attempts history
  async getAttemptsHistory(userEmail?: string, testId?: string): Promise<TestAttempt[]> {
    try {
      const params = new URLSearchParams();
      if (userEmail) params.append('userEmail', userEmail);
      if (testId) params.append('testId', testId);

      const res = await fetch(`/api/tests/attempts/history?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load attempts');
      const data = await res.json();
      return data.attempts || [];
    } catch (err) {
      console.warn('[MockTestService] Could not fetch attempts:', err);
      return [];
    }
  }

  // Admin APIs
  async getAdminTests(): Promise<MockTest[]> {
    const res = await fetch('/api/admin/tests');
    if (!res.ok) throw new Error('Failed to load admin tests');
    const data = await res.json();
    return data.tests || [];
  }

  async getQuestionsPool(filter?: { subjectId?: string; difficulty?: string; search?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filter?.subjectId) params.append('subjectId', filter.subjectId);
    if (filter?.difficulty) params.append('difficulty', filter.difficulty);
    if (filter?.search) params.append('search', filter.search);

    const res = await fetch(`/api/admin/tests/questions-pool?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load questions pool');
    const data = await res.json();
    return data.questions || [];
  }

  async adminCreateTest(testData: Partial<MockTest>): Promise<MockTest> {
    const res = await fetch('/api/admin/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create test');
    }
    const data = await res.json();
    return data.test;
  }

  async adminUpdateTest(testId: string, updates: Partial<MockTest>): Promise<MockTest> {
    const res = await fetch(`/api/admin/tests/${testId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update test');
    }
    const data = await res.json();
    return data.test;
  }

  async adminDeleteTest(testId: string): Promise<boolean> {
    const res = await fetch(`/api/admin/tests/${testId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete test');
    return true;
  }

  async adminCloneTest(testId: string): Promise<MockTest> {
    const res = await fetch(`/api/admin/tests/${testId}/clone`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to clone test');
    const data = await res.json();
    return data.test;
  }
}

export const mockTestService = MockTestService.getInstance();
