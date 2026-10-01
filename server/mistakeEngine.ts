import {
  SmartMistakeRecord,
  SmartErrorCategoryId,
  ErrorCategoryConfig,
  MistakeTriggerReason,
  ConfidenceLevel,
  MasteryState,
  RetestAttemptRecord,
  CanonicalQuestionSummary,
  Question,
} from '../src/types';
import { MASTER_CIVIL_QUESTIONS } from './practiceEngine';

export class ServerMistakeEngine {
  private static userMistakes: Map<string, SmartMistakeRecord[]> = new Map();
  private static errorCategories: ErrorCategoryConfig[] = [
    {
      id: 'conceptual_confusion',
      label: 'Conceptual Confusion',
      description: 'Fundamental civil engineering theory, equilibrium, or physical law misunderstood.',
      color: '#d97706',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      iconName: 'BrainCircuit',
      isSystem: true,
      active: true,
      suggestedAction: 'Review standard textbook derivations & video lecture chapters.',
    },
    {
      id: 'factual_recall',
      label: 'Factual / Codal Recall',
      description: 'Forgot specific standard value, IS Code table constant, or empirical coefficient.',
      color: '#2563eb',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      iconName: 'BookOpenCheck',
      isSystem: true,
      active: true,
      suggestedAction: 'Add to daily IS Code summary flashcard deck (IS 456 / IS 800 / IRC).',
    },
    {
      id: 'calculation_error',
      label: 'Calculation Slip',
      description: 'Arithmetic error, algebraic slip, rounding inaccuracy, or decimal point error.',
      color: '#dc2626',
      badgeClass: 'bg-red-100 text-red-900 border-red-300',
      iconName: 'Calculator',
      isSystem: true,
      active: true,
      suggestedAction: 'Practice with Engineering Calculator suite and write intermediate steps.',
    },
    {
      id: 'unit_error',
      label: 'Unit Conversion Error',
      description: 'Mismatched units (e.g. mixed mm with m, kN with N, or MPa with kPa).',
      color: '#ea580c',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
      iconName: 'Ruler',
      isSystem: true,
      active: true,
      suggestedAction: 'Always write SI units beside every numerical variable in scratch work.',
    },
    {
      id: 'formula_selection',
      label: 'Formula Selection Mistake',
      description: 'Selected wrong equation for specific boundary conditions or cross-sections.',
      color: '#e11d48',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      iconName: 'Sigma',
      isSystem: true,
      active: true,
      suggestedAction: 'Check Formula Lab for applicability limits & boundary assumptions.',
    },
    {
      id: 'reading_error',
      label: 'Question Reading Error',
      description: 'Overlooked NOT, EXCEPT, INCORRECT, minimum vs maximum, or unit in problem stem.',
      color: '#9333ea',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
      iconName: 'Eye',
      isSystem: true,
      active: true,
      suggestedAction: 'Circle key qualifying words before checking options during CBT.',
    },
    {
      id: 'careless_mistake',
      label: 'Careless / Silly Mistake',
      description: 'Marked wrong option index or made a lapse despite knowing the correct solution.',
      color: '#059669',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      iconName: 'AlertCircle',
      isSystem: true,
      active: true,
      suggestedAction: 'Double-check final option index before hitting save & next.',
    },
    {
      id: 'code_standard_confusion',
      label: 'Code / Standard Confusion',
      description: 'Confused clauses between IS 456, IS 800, IS 1343, IRC 73, and CPWD manuals.',
      color: '#4f46e5',
      badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      iconName: 'FileSpreadsheet',
      isSystem: true,
      active: true,
      suggestedAction: 'Review Civil Codal Comparison chart in Study Materials.',
    },
    {
      id: 'time_pressure',
      label: 'Time Pressure / Guess',
      description: 'Rushed or guessed under CBT countdown timer constraints without thorough derivation.',
      color: '#ca8a04',
      badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      iconName: 'Timer',
      isSystem: true,
      active: true,
      suggestedAction: 'Use 2-pass exam attempt strategy; flag and return to lengthy questions.',
    },
  ];

  static initialize() {
    if (this.userMistakes.size === 0) {
      this.seedInitialStudentMistakes('gitevijay123@gmail.com');
      this.seedInitialStudentMistakes('default@student.sp');
    }
  }

  private static toCanonicalSummary(q: Question): CanonicalQuestionSummary {
    return {
      id: q.id || q.questionId || 'unknown',
      text: q.text || q.stem || '',
      options: q.options || [],
      correctOption: q.correctOption ?? 0,
      correctAnswer: q.correctAnswer ?? q.options?.[q.correctOption ?? 0] ?? '',
      explanation: q.explanation || '',
      subjectId: q.subjectId,
      subjectName: q.subject || q.subjectId,
      topicId: q.topicId,
      topicName: q.topic || q.chapter || 'Civil Concept',
      difficulty: q.difficulty || 'medium',
      isCodeReference: q.isCodeReference,
      formula: q.formula || q.formulaUsed,
      unit: q.unit,
      examTags: q.examTags,
      examTargetIds: q.examTargetIds,
    };
  }

  private static seedInitialStudentMistakes(userEmail: string) {
    const questions = MASTER_CIVIL_QUESTIONS;
    if (!questions || questions.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const initialMistakes: SmartMistakeRecord[] = [
      {
        id: `mstk-${userEmail}-1`,
        userEmail,
        questionId: questions[0].id,
        canonicalQuestion: this.toCanonicalSummary(questions[0]),
        studentAnswer: 3, // Selected 0.120% instead of 0.205%
        correctAnswer: 0,
        explanation: questions[0].explanation,
        conceptName: 'Minimum Tension Reinforcement in Beams (IS 456 Cl. 26.5.1.1)',
        errorCategory: 'factual_recall',
        personalNote: 'Confused beam minimum Ast (0.85/fy = 0.205%) with slab minimum shrinkage steel (0.12% for HYSD).',
        confidenceLevel: 'medium',
        loggedTrigger: 'wrong_answer',
        attemptHistory: [
          {
            attemptId: 'att-1',
            date: todayStr,
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            selectedOption: 3,
            isCorrect: false,
            confidence: 'medium',
            timeSpentSeconds: 42,
            notes: 'Initial CBT Mock Test attempt',
            stageBefore: 0,
            stageAfter: 0,
          },
        ],
        masteryStatus: 'unmastered',
        spacedIntervalDays: 1,
        spacedStage: 0,
        nextRevisionDate: todayStr,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: `mstk-${userEmail}-2`,
        userEmail,
        questionId: questions[1]?.id || 'q-ce-102',
        canonicalQuestion: this.toCanonicalSummary(questions[1] || questions[0]),
        studentAnswer: 1,
        correctAnswer: 2,
        explanation: questions[1]?.explanation || 'Effective length for column with one end fixed and other hinged = L / sqrt(2) = 0.707L (Recommended design value = 0.80L per IS 456 Table 28).',
        conceptName: 'Effective Length of Compression Members (IS 456 Table 28)',
        errorCategory: 'conceptual_confusion',
        personalNote: 'Need to memorize theoretical (0.7L) vs recommended design value (0.8L) from IS 456 Table 28.',
        confidenceLevel: 'low',
        loggedTrigger: 'wrong_answer',
        attemptHistory: [
          {
            attemptId: 'att-2',
            date: todayStr,
            timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
            selectedOption: 1,
            isCorrect: false,
            confidence: 'low',
            timeSpentSeconds: 58,
            notes: 'MPSC PYQ Practice Session',
            stageBefore: 0,
            stageAfter: 0,
          },
        ],
        masteryStatus: 'in_progress',
        spacedIntervalDays: 3,
        spacedStage: 1,
        nextRevisionDate: todayStr,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: `mstk-${userEmail}-3`,
        userEmail,
        questionId: questions[2]?.id || 'q-ce-103',
        canonicalQuestion: this.toCanonicalSummary(questions[2] || questions[0]),
        studentAnswer: 0,
        correctAnswer: 2,
        explanation: questions[2]?.explanation || 'Stopping Sight Distance (SSD) on level road: SSD = vt + v^2/(254f).',
        conceptName: 'Stopping Sight Distance & Reaction Time (IRC 73)',
        errorCategory: 'calculation_error',
        personalNote: 'Forgot speed was given in km/h, multiplied directly instead of using 0.278v or 254 in denominator.',
        confidenceLevel: 'high',
        loggedTrigger: 'wrong_answer',
        attemptHistory: [
          {
            attemptId: 'att-3',
            date: todayStr,
            timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
            selectedOption: 0,
            isCorrect: false,
            confidence: 'high',
            timeSpentSeconds: 74,
            notes: 'Unit conversion slip during numerical step',
            stageBefore: 0,
            stageAfter: 0,
          },
        ],
        masteryStatus: 'unmastered',
        spacedIntervalDays: 1,
        spacedStage: 0,
        nextRevisionDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // Overdue!
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: `mstk-${userEmail}-4`,
        userEmail,
        questionId: questions[3]?.id || 'q-ce-104',
        canonicalQuestion: this.toCanonicalSummary(questions[3] || questions[0]),
        studentAnswer: 2,
        correctAnswer: 2,
        explanation: questions[3]?.explanation || 'Slenderness ratio for steel tension member with reversal due to wind/earthquake = 350 (IS 800:2007 Table 3).',
        conceptName: 'Permissible Slenderness Ratio (IS 800:2007 Table 3)',
        errorCategory: 'code_standard_confusion',
        personalNote: 'Bookmarked for rapid revision before Maha PWD JE.',
        confidenceLevel: 'low',
        loggedTrigger: 'bookmarked',
        attemptHistory: [],
        masteryStatus: 'unmastered',
        spacedIntervalDays: 1,
        spacedStage: 0,
        nextRevisionDate: todayStr,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    this.userMistakes.set(userEmail, initialMistakes);
  }

  // ==========================================
  // RETRIEVAL & QUERYING
  // ==========================================

  static getMistakes(userEmail: string): SmartMistakeRecord[] {
    this.initialize();
    if (!this.userMistakes.has(userEmail)) {
      this.seedInitialStudentMistakes(userEmail);
    }
    return this.userMistakes.get(userEmail) || [];
  }

  static getMistakeById(userEmail: string, id: string): SmartMistakeRecord | undefined {
    const list = this.getMistakes(userEmail);
    return list.find((m) => m.id === id);
  }

  // ==========================================
  // SMART LOGGING & RECORDING (NO REDUNDANT DUPLICATION)
  // ==========================================

  static logOrUpdateMistake(
    userEmail: string,
    params: {
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
    }
  ): SmartMistakeRecord {
    this.initialize();
    const mistakes = this.getMistakes(userEmail);
    const existingIndex = mistakes.findIndex((m) => m.questionId === params.questionId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Find canonical question from bank if available
    let canonical: CanonicalQuestionSummary;
    if (params.customQuestion) {
      canonical = this.toCanonicalSummary(params.customQuestion);
    } else {
      const qInMaster = MASTER_CIVIL_QUESTIONS.find((q) => q.id === params.questionId || q.questionId === params.questionId);
      if (qInMaster) {
        canonical = this.toCanonicalSummary(qInMaster);
      } else {
        canonical = {
          id: params.questionId,
          text: 'Civil Engineering Practice Problem',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOption: params.correctOption ?? 0,
          correctAnswer: params.correctAnswer ?? 'Option A',
          explanation: params.explanation || 'Official explanation from Engineering Officer BY SP.',
          subjectId: 'rcc_concrete',
          subjectName: 'Civil Engineering',
          difficulty: 'medium',
        };
      }
    }

    const trigger = params.trigger || 'wrong_answer';
    const confidence = params.confidenceLevel || 'medium';
    const category = params.errorCategory || 'conceptual_confusion';

    if (existingIndex >= 0) {
      // Update existing record without duplicating canonical question
      const existing = mistakes[existingIndex];
      const isCorrect = params.studentAnswer === canonical.correctOption;

      const newHistoryEvent: RetestAttemptRecord = {
        attemptId: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: todayStr,
        timestamp: now.toISOString(),
        selectedOption: params.studentAnswer ?? 'skipped',
        isCorrect,
        confidence,
        timeSpentSeconds: params.timeSpentSeconds || 30,
        notes: params.personalNote || `Logged via ${trigger}`,
        stageBefore: existing.spacedStage,
        stageAfter: isCorrect ? Math.min(existing.spacedStage + 1, 4) : 0,
      };

      const updatedHistory = [...(existing.attemptHistory || []), newHistoryEvent];

      // Update Spaced Repetition Stage
      let newStage = existing.spacedStage;
      let newInterval = existing.spacedIntervalDays;
      let newMastery = existing.masteryStatus;
      let masteredAt = existing.masteredAt;

      if (isCorrect) {
        newStage = Math.min(existing.spacedStage + 1, 4);
        const intervals = [1, 3, 7, 14, 30];
        newInterval = intervals[newStage] || 30;
        if (newStage >= 4) {
          newMastery = 'mastered';
          masteredAt = now.toISOString();
        } else {
          newMastery = 'in_progress';
        }
      } else {
        // Reset to Stage 0 on wrong attempt
        newStage = 0;
        newInterval = 1;
        newMastery = 'unmastered';
      }

      const nextRev = new Date(now.getTime() + newInterval * 86400000).toISOString().split('T')[0];

      const updated: SmartMistakeRecord = {
        ...existing,
        canonicalQuestion: canonical,
        studentAnswer: params.studentAnswer,
        correctAnswer: canonical.correctAnswer || params.correctAnswer || '',
        explanation: params.explanation || canonical.explanation,
        conceptName: params.conceptName || canonical.topicName || existing.conceptName,
        errorCategory: category,
        personalNote: params.personalNote !== undefined ? params.personalNote : existing.personalNote,
        confidenceLevel: confidence,
        loggedTrigger: trigger,
        attemptHistory: updatedHistory,
        masteryStatus: newMastery,
        masteredAt,
        spacedIntervalDays: newInterval,
        spacedStage: newStage,
        nextRevisionDate: nextRev,
        lastReviewedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      mistakes[existingIndex] = updated;
      this.userMistakes.set(userEmail, mistakes);
      return updated;
    }

    // Create fresh record
    const newId = `mstk-${userEmail}-${Date.now()}`;
    const isCorrect = params.studentAnswer === canonical.correctOption;

    const initialHistory: RetestAttemptRecord[] = params.studentAnswer !== null
      ? [
          {
            attemptId: `att-${Date.now()}`,
            date: todayStr,
            timestamp: now.toISOString(),
            selectedOption: params.studentAnswer,
            isCorrect,
            confidence,
            timeSpentSeconds: params.timeSpentSeconds || 30,
            notes: `Logged via ${trigger}`,
            stageBefore: 0,
            stageAfter: isCorrect ? 1 : 0,
          },
        ]
      : [];

    const newRecord: SmartMistakeRecord = {
      id: newId,
      userEmail,
      questionId: params.questionId,
      canonicalQuestion: canonical,
      studentAnswer: params.studentAnswer,
      correctAnswer: canonical.correctAnswer || params.correctAnswer || '',
      explanation: params.explanation || canonical.explanation,
      conceptName: params.conceptName || canonical.topicName || 'Core Civil Engineering Concept',
      errorCategory: category,
      personalNote: params.personalNote || '',
      confidenceLevel: confidence,
      loggedTrigger: trigger,
      attemptHistory: initialHistory,
      masteryStatus: 'unmastered',
      spacedIntervalDays: 1,
      spacedStage: 0,
      nextRevisionDate: todayStr,
      lastReviewedAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    mistakes.unshift(newRecord);
    this.userMistakes.set(userEmail, mistakes);
    return newRecord;
  }

  // ==========================================
  // NOTE & CATEGORY EDITING
  // ==========================================

  static updatePersonalNote(userEmail: string, mistakeId: string, note: string): SmartMistakeRecord | null {
    const mistakes = this.getMistakes(userEmail);
    const item = mistakes.find((m) => m.id === mistakeId);
    if (!item) return null;

    item.personalNote = note;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  static updateErrorCategory(userEmail: string, mistakeId: string, category: string): SmartMistakeRecord | null {
    const mistakes = this.getMistakes(userEmail);
    const item = mistakes.find((m) => m.id === mistakeId);
    if (!item) return null;

    item.errorCategory = category;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  static toggleMasteryStatus(userEmail: string, mistakeId: string): SmartMistakeRecord | null {
    const mistakes = this.getMistakes(userEmail);
    const item = mistakes.find((m) => m.id === mistakeId);
    if (!item) return null;

    if (item.masteryStatus === 'mastered') {
      item.masteryStatus = 'unmastered';
      item.spacedStage = 0;
      item.spacedIntervalDays = 1;
      item.nextRevisionDate = new Date().toISOString().split('T')[0];
      item.masteredAt = undefined;
    } else {
      item.masteryStatus = 'mastered';
      item.spacedStage = 4;
      item.spacedIntervalDays = 30;
      item.masteredAt = new Date().toISOString();
    }
    item.updatedAt = new Date().toISOString();
    return item;
  }

  static deleteMistake(userEmail: string, mistakeId: string): boolean {
    const mistakes = this.getMistakes(userEmail);
    const filtered = mistakes.filter((m) => m.id !== mistakeId);
    if (filtered.length === mistakes.length) return false;
    this.userMistakes.set(userEmail, filtered);
    return true;
  }

  // ==========================================
  // ERROR CATEGORIES CONFIGURATION (ADMIN CRUD)
  // ==========================================

  static getErrorCategories(): ErrorCategoryConfig[] {
    return this.errorCategories;
  }

  static addErrorCategory(category: Omit<ErrorCategoryConfig, 'isSystem'>): ErrorCategoryConfig {
    const newCat: ErrorCategoryConfig = {
      ...category,
      isSystem: false,
    };
    this.errorCategories.push(newCat);
    return newCat;
  }

  static updateErrorCategoryConfig(id: string, updates: Partial<ErrorCategoryConfig>): ErrorCategoryConfig | null {
    const cat = this.errorCategories.find((c) => c.id === id);
    if (!cat) return null;
    Object.assign(cat, updates);
    return cat;
  }

  static deleteErrorCategory(id: string): boolean {
    const index = this.errorCategories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    if (this.errorCategories[index].isSystem) {
      throw new Error('System standard error categories cannot be deleted.');
    }
    this.errorCategories.splice(index, 1);
    return true;
  }
}
