import {
  Question,
  PracticeMode,
  PracticeSessionConfig,
  PracticeEvaluationResult,
  ExamTargetId
} from '../types';
import { StorageService } from './storageService';

export interface BatchQuestionsResponse {
  questions: Question[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
  cached?: boolean;
}

export interface VerificationResponse {
  isCorrect: boolean;
  correctOption: number;
  correctAnswer: number | string;
  marksAwarded: number;
  negativeMarks: number;
  explanation: string;
  formula?: string;
  isCodeReference?: string;
  whyOtherOptionsAreWrong?: Record<string, string> | string[];
  commonTraps?: string;
  calculationSteps?: string[];
}

export class PracticeService {
  private static localBatchCache = new Map<string, { data: BatchQuestionsResponse; timestamp: number }>();
  private static CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes local cache

  /**
   * Fetch paginated batch of questions from server practice engine
   */
  static async getBatchedQuestions(params: {
    mode: PracticeMode;
    subjectId?: string;
    topic?: string;
    examTargetId?: string;
    difficulty?: string;
    language?: string;
    page?: number;
    pageSize?: number;
    simulationMode?: boolean;
  }): Promise<BatchQuestionsResponse> {
    const {
      mode,
      subjectId = 'all',
      topic = 'all',
      examTargetId = 'all',
      difficulty = 'all',
      language = 'all',
      page = 1,
      pageSize = 15,
      simulationMode = false
    } = params;

    const cacheKey = `batch_${mode}_${subjectId}_${topic}_${examTargetId}_${difficulty}_${language}_p${page}_s${pageSize}_sim${simulationMode}`;
    const cached = this.localBatchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const queryParams = new URLSearchParams({
        mode,
        subjectId,
        topic,
        examTargetId,
        difficulty,
        language,
        page: String(page),
        pageSize: String(pageSize),
        simulationMode: simulationMode ? 'true' : 'false',
      });

      const response = await fetch(`/api/practice/questions?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result: BatchQuestionsResponse = await response.json();

      // Store in client batch cache
      this.localBatchCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (err) {
      console.warn('[PracticeService] Falling back to local storage questions:', err);
      // Resilient fallback to local storage
      let allQuestions = StorageService.getQuestions();

      if (subjectId !== 'all') {
        allQuestions = allQuestions.filter((q) => q.subjectId === subjectId);
      }
      if (difficulty !== 'all') {
        allQuestions = allQuestions.filter((q) => q.difficulty === difficulty);
      }
      if (examTargetId !== 'all') {
        allQuestions = allQuestions.filter((q) =>
          q.examTargetIds?.includes(examTargetId as ExamTargetId)
        );
      }

      if (simulationMode) {
        allQuestions = allQuestions.map((q) => ({
          ...q,
          correctOption: -1,
          correctAnswer: undefined,
          explanation: 'Answer key hidden during simulation.',
          isStripped: true
        }));
      }

      const totalCount = allQuestions.length;
      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paged = allQuestions.slice(startIndex, startIndex + pageSize);

      return {
        questions: paged,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasMore: startIndex + pageSize < totalCount,
        },
        cached: true,
      };
    }
  }

  /**
   * Start a practice session
   */
  static async startSession(config: PracticeSessionConfig): Promise<{
    sessionId: string;
    startTime: string;
    questionsCount: number;
    questions: Question[];
  }> {
    try {
      const res = await fetch('/api/practice/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('Failed to start server practice session');
      return await res.json();
    } catch (err) {
      console.warn('[PracticeService] Local fallback for session start:', err);
      const batch = await this.getBatchedQuestions({
        mode: config.mode,
        subjectId: config.subjectId,
        topic: config.topicId,
        examTargetId: config.examTargetId,
        difficulty: config.difficulty,
        language: config.language,
        page: 1,
        pageSize: config.limit || 20,
        simulationMode: !config.instantFeedback,
      });

      return {
        sessionId: `local_ps_${Date.now()}`,
        startTime: new Date().toISOString(),
        questionsCount: batch.questions.length,
        questions: batch.questions,
      };
    }
  }

  /**
   * Instant verification for single question
   */
  static async verifySingleAnswer(
    questionId: string,
    userAnswer: number | string,
    language = 'en'
  ): Promise<VerificationResponse> {
    try {
      const res = await fetch('/api/practice/verify-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, userAnswer, language }),
      });

      if (!res.ok) throw new Error('Verification failed');
      return await res.json();
    } catch (err) {
      console.warn('[PracticeService] Fallback local verification:', err);
      const q = StorageService.getQuestions().find((item) => item.id === questionId);
      const isCorrect = q ? Number(userAnswer) === q.correctOption : false;
      return {
        isCorrect,
        correctOption: q ? q.correctOption : 0,
        correctAnswer: q?.correctAnswer !== undefined ? q.correctAnswer : (q?.correctOption ?? 0),
        marksAwarded: isCorrect ? (q?.marks || 2) : -(q?.negativeMarks || 0.5),
        negativeMarks: q?.negativeMarks || 0.5,
        explanation: q?.explanation || 'Solution recorded locally.',
        formula: q?.formula,
        isCodeReference: q?.isCodeReference,
        whyOtherOptionsAreWrong: q?.whyOtherOptionsAreWrong,
        commonTraps: q?.commonTraps,
        calculationSteps: q?.calculationSteps
      };
    }
  }

  /**
   * Authoritative submission of practice session
   */
  static async submitSession(payload: {
    sessionId?: string;
    answers: Record<string, number | string>;
    timeSpentSeconds?: number;
    targetExamId?: string;
  }): Promise<PracticeEvaluationResult> {
    try {
      const res = await fetch('/api/practice/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Submission failed');
      return await res.json();
    } catch (err) {
      console.warn('[PracticeService] Fallback local submission:', err);
      const allQ = StorageService.getQuestions();
      const qMap = new Map(allQ.map((q) => [q.id, q]));

      let totalScore = 0;
      let maxScore = 0;
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;
      const subjectBreakdown: Record<string, { attempted: number; correct: number; total: number; score: number }> = {};
      const results: PracticeEvaluationResult['results'] = [];

      for (const [qId, ans] of Object.entries(payload.answers)) {
        const q = qMap.get(qId);
        if (!q) continue;

        const marks = q.marks || 2;
        const neg = q.negativeMarks || 0.5;
        maxScore += marks;

        if (!subjectBreakdown[q.subjectId]) {
          subjectBreakdown[q.subjectId] = { attempted: 0, correct: 0, total: 0, score: 0 };
        }
        subjectBreakdown[q.subjectId].total += 1;

        if (ans === undefined || ans === null || ans === '') {
          unattempted++;
          results.push({
            questionId: q.id,
            userAnswer: null,
            correctOption: q.correctOption,
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption,
            isCorrect: false,
            marksAwarded: 0,
            explanation: q.explanation,
            isCodeReference: q.isCodeReference,
            formula: q.formula,
            whyOtherOptionsAreWrong: q.whyOtherOptionsAreWrong,
            commonTraps: q.commonTraps,
            calculationSteps: q.calculationSteps,
          });
        } else {
          subjectBreakdown[q.subjectId].attempted += 1;
          const isRight = Number(ans) === q.correctOption;
          if (isRight) {
            correct++;
            totalScore += marks;
            subjectBreakdown[q.subjectId].correct += 1;
            subjectBreakdown[q.subjectId].score += marks;
          } else {
            incorrect++;
            totalScore -= neg;
            subjectBreakdown[q.subjectId].score -= neg;
          }

          results.push({
            questionId: q.id,
            userAnswer: ans,
            correctOption: q.correctOption,
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption,
            isCorrect: isRight,
            marksAwarded: isRight ? marks : -neg,
            explanation: q.explanation,
            isCodeReference: q.isCodeReference,
            formula: q.formula,
            whyOtherOptionsAreWrong: q.whyOtherOptionsAreWrong,
            commonTraps: q.commonTraps,
            calculationSteps: q.calculationSteps,
          });
        }
      }

      const attempted = correct + incorrect;
      const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
      const percentage = maxScore > 0 ? (Math.max(0, totalScore) / maxScore) * 100 : 0;

      return {
        sessionId: payload.sessionId,
        totalQuestions: Object.keys(payload.answers).length,
        attemptedQuestions: attempted,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        unattemptedQuestions: unattempted,
        totalScore: Number(totalScore.toFixed(2)),
        maxScore,
        percentage: Number(percentage.toFixed(1)),
        accuracy: Number(accuracy.toFixed(1)),
        timeSpentSeconds: payload.timeSpentSeconds || 0,
        averageTimePerQuestion: Object.keys(payload.answers).length > 0 ? Math.round((payload.timeSpentSeconds || 0) / Object.keys(payload.answers).length) : 0,
        subjectBreakdown,
        results,
      };
    }
  }

  /**
   * Invalidate local batch cache
   */
  static clearCache() {
    this.localBatchCache.clear();
  }
}
