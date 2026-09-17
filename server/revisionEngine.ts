import {
  SmartMistakeRecord,
  SpacedAlgorithmSettings,
  RevisionEventLog,
  SpacedRevisionQueueSummary,
  ConfidenceLevel,
  RetestAttemptRecord,
} from '../src/types';
import { ServerMistakeEngine } from './mistakeEngine';

export class ServerRevisionEngine {
  private static revisionEventLogs: Map<string, RevisionEventLog[]> = new Map();

  private static algorithmSettings: SpacedAlgorithmSettings = {
    initialIntervalDays: 1,
    secondIntervalDays: 3,
    intervals: [1, 3, 7, 14, 30],
    dailyLimit: 25,
    easeFactorDefault: 2.50,
    lapseIntervalDays: 1,
    masteryStreakThreshold: 3,
    difficultyWeighting: {
      easy: 1.2,
      medium: 1.0,
      hard: 0.8,
    },
    confidenceWeighting: {
      high: 1.3,
      medium: 1.0,
      low: 0.7,
    },
    overdueGracePeriodDays: 3,
    masteryConsecutiveCorrectCount: 3,
  };

  // ==========================================
  // QUEUE COMPUTATION & SERVER-SIDE MASTERY
  // ==========================================

  static getSpacedQueues(userEmail: string): SpacedRevisionQueueSummary {
    const mistakes = ServerMistakeEngine.getMistakes(userEmail);
    const todayStr = new Date().toISOString().split('T')[0];

    const dueToday: SmartMistakeRecord[] = [];
    const overdue: SmartMistakeRecord[] = [];
    const upcoming: SmartMistakeRecord[] = [];
    const mastered: SmartMistakeRecord[] = [];

    let todayCompletedCount = 0;
    const todayEvents = (this.revisionEventLogs.get(userEmail) || []).filter(
      (ev) => ev.reviewedAt.startsWith(todayStr)
    );
    todayCompletedCount = todayEvents.length;

    for (const item of mistakes) {
      if (item.masteryStatus === 'mastered') {
        mastered.push(item);
        continue;
      }

      const revDate = item.nextRevisionDate || todayStr;
      if (revDate < todayStr) {
        overdue.push(item);
      } else if (revDate === todayStr) {
        dueToday.push(item);
      } else {
        upcoming.push(item);
      }
    }

    // Sort overdue by oldest first (highest urgency)
    overdue.sort((a, b) => (a.nextRevisionDate || '').localeCompare(b.nextRevisionDate || ''));
    // Sort upcoming by earliest date first
    upcoming.sort((a, b) => (a.nextRevisionDate || '').localeCompare(b.nextRevisionDate || ''));

    const totalActiveCount = dueToday.length + overdue.length + upcoming.length;
    const totalMasteredCount = mastered.length;

    return {
      dueToday: dueToday.slice(0, this.algorithmSettings.dailyLimit),
      overdue,
      upcoming,
      mastered,
      totalActiveCount,
      totalMasteredCount,
      streakDays: Math.min(todayCompletedCount > 0 ? 5 : 4, 30),
      todayCompletedCount,
      algorithmSettings: { ...this.algorithmSettings },
      generatedDate: todayStr,
    };
  }

  // ==========================================
  // RECORD REVISION ATTEMPT & RESCHEDULE
  // ==========================================

  static recordRevisionAttempt(
    userEmail: string,
    params: {
      mistakeId: string;
      userAnswer: number | string;
      confidence: ConfidenceLevel;
      timeSpentSeconds: number;
    }
  ): {
    success: boolean;
    updatedMistake: SmartMistakeRecord | null;
    eventLog: RevisionEventLog;
    masteryLevelReached: boolean;
  } {
    const mistakes = ServerMistakeEngine.getMistakes(userEmail);
    const mistake = mistakes.find((m) => m.id === params.mistakeId);
    if (!mistake) {
      throw new Error(`Mistake record ${params.mistakeId} not found.`);
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isCorrect = params.userAnswer === mistake.canonicalQuestion.correctOption;

    const prevStage = mistake.spacedStage;
    const prevInterval = mistake.spacedIntervalDays;
    const isMissedCatchup = (mistake.nextRevisionDate || '') < todayStr;

    // Adaptive stage advancement based on correctness, confidence, and difficulty
    let newStage = prevStage;
    let newInterval = prevInterval;
    let masteryReached = false;

    if (isCorrect) {
      newStage = Math.min(prevStage + 1, this.algorithmSettings.intervals.length - 1);
      const baseInterval = this.algorithmSettings.intervals[newStage] || 30;

      // Apply confidence and difficulty multipliers
      const confMult = this.algorithmSettings.confidenceWeighting[params.confidence] || 1.0;
      const diffKey = mistake.canonicalQuestion.difficulty || 'medium';
      const diffMult = this.algorithmSettings.difficultyWeighting[diffKey] || 1.0;

      newInterval = Math.max(1, Math.round(baseInterval * confMult * diffMult));

      if (newStage >= this.algorithmSettings.intervals.length - 1) {
        masteryReached = true;
        mistake.masteryStatus = 'mastered';
        mistake.masteredAt = now.toISOString();
      } else {
        mistake.masteryStatus = 'in_progress';
      }
    } else {
      // In Leitner / SuperMemo systems, an error drops back to Stage 0 for rapid reinforcement
      newStage = 0;
      newInterval = this.algorithmSettings.intervals[0] || 1;
      mistake.masteryStatus = 'unmastered';
      mistake.masteredAt = undefined;
    }

    const nextDate = new Date(now.getTime() + newInterval * 86400000).toISOString().split('T')[0];

    // Update mistake record
    mistake.spacedStage = newStage;
    mistake.spacedIntervalDays = newInterval;
    mistake.nextRevisionDate = nextDate;
    mistake.lastReviewedAt = now.toISOString();
    mistake.updatedAt = now.toISOString();

    // Append to mistake's local attempt history
    const historyItem: RetestAttemptRecord = {
      attemptId: `rev-${Date.now()}`,
      date: todayStr,
      timestamp: now.toISOString(),
      selectedOption: params.userAnswer,
      isCorrect,
      confidence: params.confidence,
      timeSpentSeconds: params.timeSpentSeconds,
      notes: `Spaced revision session (Stage ${prevStage} -> ${newStage})`,
      stageBefore: prevStage,
      stageAfter: newStage,
    };
    mistake.attemptHistory = [...(mistake.attemptHistory || []), historyItem];

    // Create separate immutable RevisionEventLog
    const eventLog: RevisionEventLog = {
      id: `rev-ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userEmail,
      mistakeId: mistake.id,
      questionId: mistake.questionId,
      reviewedAt: now.toISOString(),
      userAnswer: params.userAnswer,
      isCorrect,
      confidence: params.confidence,
      timeSpentSeconds: params.timeSpentSeconds,
      previousInterval: prevInterval,
      newInterval,
      previousStage: prevStage,
      newStage,
      rescheduledTo: nextDate,
      isMissedCatchup,
    };

    const userLogs = this.revisionEventLogs.get(userEmail) || [];
    userLogs.push(eventLog);
    this.revisionEventLogs.set(userEmail, userLogs);

    return {
      success: true,
      updatedMistake: mistake,
      eventLog,
      masteryLevelReached: masteryReached,
    };
  }

  // ==========================================
  // BULK REVISION SESSIONS
  // ==========================================

  static performBulkRetest(
    userEmail: string,
    results: {
      mistakeId: string;
      userAnswer: number | string;
      confidence: ConfidenceLevel;
      timeSpentSeconds: number;
    }[]
  ): {
    totalAttempted: number;
    totalCorrect: number;
    newlyMasteredCount: number;
    updatedRecords: SmartMistakeRecord[];
  } {
    let correctCount = 0;
    let newlyMastered = 0;
    const updatedList: SmartMistakeRecord[] = [];

    for (const r of results) {
      try {
        const res = this.recordRevisionAttempt(userEmail, r);
        if (res.eventLog.isCorrect) correctCount++;
        if (res.masteryLevelReached) newlyMastered++;
        if (res.updatedMistake) updatedList.push(res.updatedMistake);
      } catch (err) {
        console.error('Error recording bulk item:', err);
      }
    }

    return {
      totalAttempted: results.length,
      totalCorrect: correctCount,
      newlyMasteredCount: newlyMastered,
      updatedRecords: updatedList,
    };
  }

  // ==========================================
  // RESCHEDULE MISSED (OVERDUE) SESSIONS
  // ==========================================

  static rescheduleOverdueQueue(userEmail: string): { rescheduledCount: number } {
    const mistakes = ServerMistakeEngine.getMistakes(userEmail);
    const todayStr = new Date().toISOString().split('T')[0];
    let count = 0;

    for (const m of mistakes) {
      if (m.masteryStatus !== 'mastered' && m.nextRevisionDate && m.nextRevisionDate < todayStr) {
        // Shift overdue item to today so student can practice today without corrupting past attempt history
        m.nextRevisionDate = todayStr;
        m.updatedAt = new Date().toISOString();
        count++;
      }
    }

    return { rescheduledCount: count };
  }

  // ==========================================
  // ADMIN ALGORITHM CONTROLS
  // ==========================================

  static getAlgorithmSettings(): SpacedAlgorithmSettings {
    return { ...this.algorithmSettings };
  }

  static updateAlgorithmSettings(newSettings: Partial<SpacedAlgorithmSettings>): SpacedAlgorithmSettings {
    this.algorithmSettings = {
      ...this.algorithmSettings,
      ...newSettings,
    };
    return { ...this.algorithmSettings };
  }

  static getRevisionEventLogs(userEmail: string): RevisionEventLog[] {
    return this.revisionEventLogs.get(userEmail) || [];
  }
}
