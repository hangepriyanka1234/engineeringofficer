import {
  StudentProfile,
  Question,
  QuestionReport,
  MockTest,
  TestAttempt,
  MistakeEntry,
  MistakeLog,
  MistakeReasonTag,
  MistakeHistoryEvent,
  DailyStudyTask,
  StudentStudyPlan,
  RecruitmentNotice,
  StudyMaterial,
  VideoLecture,
  NotificationItem,
  AdminAuditLog,
  PromoCode,
  ExamTargetId,
  ExamProfile,
  SyllabusSubject,
  SyllabusModule,
  SyllabusTopic,
  TopicProgress,
  TopicRevisionStatus,
  IncompleteTestSession,
  MockTestCategory,
  CivilExamHierarchyProfile,
  CanonicalSubject,
  ExamSyllabusMapping,
  SyllabusAuditLog,
  SyllabusConcept,
  MultiExamAnalysisResult
} from '../types';
import {
  EXAM_CATALOGUE,
  INITIAL_QUESTIONS,
  MOCK_TESTS,
  RECRUITMENT_NOTICES,
  STUDY_MATERIALS,
  VIDEO_LECTURES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROMO_CODES
} from '../data/mockData';
import { INITIAL_SYLLABUS_TREE } from '../data/syllabusData';
import { INITIAL_EXAM_PROFILES } from '../data/examCatalogueData';
import { INITIAL_RECRUITMENT_NOTICES } from '../data/recruitmentData';
import { COMPREHENSIVE_QUESTIONS } from '../data/questionBankData';
import {
  INITIAL_CANONICAL_SUBJECTS,
  INITIAL_EXAMS_HIERARCHY,
  INITIAL_EXAM_MAPPINGS,
  INITIAL_AUDIT_LOGS
} from '../data/hierarchyData';

const STORAGE_KEYS = {
  PROFILE: 'eo_sp_profile',
  EXAM_PROFILES: 'eo_sp_exam_profiles',
  QUESTIONS: 'eo_sp_questions',
  QUESTION_REPORTS: 'eo_sp_question_reports',
  DAILY_CHALLENGE: 'eo_sp_daily_challenge',
  MOCK_TESTS: 'eo_sp_mock_tests',
  TEST_ATTEMPTS: 'eo_sp_test_attempts',
  MISTAKES: 'eo_sp_mistakes',
  NOTICES: 'eo_sp_notices',
  BOOKMARKED_NOTICES: 'eo_sp_bookmarked_notices',
  DEADLINE_REMINDERS: 'eo_sp_deadline_reminders',
  MATERIALS: 'eo_sp_materials',
  VIDEOS: 'eo_sp_videos',
  NOTIFICATIONS: 'eo_sp_notifications',
  AUDIT_LOGS: 'eo_sp_audit_logs',
  PROMO_CODES: 'eo_sp_promos',
  TRANSACTIONS: 'eo_sp_transactions',
  SECURITY_EVENTS: 'eo_sp_security_events',
  SYLLABUS_TREE: 'eo_sp_syllabus_tree',
  TOPIC_PROGRESS: 'eo_sp_topic_progress',
  INCOMPLETE_SESSIONS: 'eo_sp_incomplete_sessions',
  STUDY_PLAN: 'eo_sp_study_plan',
  CANONICAL_SUBJECTS: 'eo_sp_canonical_subjects',
  EXAMS_HIERARCHY: 'eo_sp_exams_hierarchy',
  EXAM_MAPPINGS: 'eo_sp_exam_mappings',
  SYLLABUS_AUDIT_LOGS: 'eo_sp_syllabus_audit_logs',
  SYLLABUS_VERSION: 'eo_sp_syllabus_version',
};

const DEFAULT_PROFILE: StudentProfile = {
  id: 'usr-sp-001',
  name: 'Priyanka Hange',
  email: 'hangepriyanka1234@gmail.com',
  phone: '+91 98765 43210',
  qualification: 'B.E. / B.Tech in Civil Engineering',
  passingYear: '2024',
  graduationYear: '2024',
  targetExams: ['maha_pwd', 'mpsc_civil', 'ssc_je', 'wrd_irrigation'],
  subscriptionTier: 'Blueprint Pro JE',
  subscriptionExpiry: '2025-12-31',
  streakDays: 14,
  totalQuestionsSolved: 348,
  totalTestsTaken: 6,
  accuracyRate: 78.4,
  referralCode: 'SP-PRIYA25',
  referralCredits: 350,
  referralCount: 7,
  dailyGoalQuestions: 25,
  solvedToday: 18,
  savedQuestionIds: ['q-101', 'q-104', 'q-201', 'q-comp-002'],
  photoUrl: '',
  districtOrCity: 'Pune',
  targetPost: 'Junior Engineer (JE) Group-B & Assistant Engineer (AE)',
  dailyStudyHours: 4,
};

export class StorageService {
  // Profile
  static getProfile(): StudentProfile {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing profile', e);
      }
    }
    this.saveProfile(DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  }

  static saveProfile(profile: StudentProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  static updateProfile(partial: Partial<StudentProfile>): StudentProfile {
    const current = this.getProfile();
    const updated = { ...current, ...partial };
    this.saveProfile(updated);
    return updated;
  }

  static incrementQuestionsSolved(count: number = 1): StudentProfile {
    const profile = this.getProfile();
    const updated = {
      ...profile,
      totalQuestionsSolved: profile.totalQuestionsSolved + count,
      solvedToday: profile.solvedToday + count,
    };
    this.saveProfile(updated);
    return updated;
  }

  // Questions
  static getQuestions(): Question[] {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    let questionList: Question[] = [];

    if (saved) {
      try {
        questionList = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing questions', e);
      }
    }

    // Merge comprehensive questions with any existing
    const existingIds = new Set(questionList.map((q) => q.id));
    let hasNew = false;

    for (const cq of COMPREHENSIVE_QUESTIONS) {
      if (!existingIds.has(cq.id)) {
        questionList.push(cq);
        existingIds.add(cq.id);
        hasNew = true;
      }
    }

    for (const iq of INITIAL_QUESTIONS) {
      if (!existingIds.has(iq.id)) {
        // Normalize
        const normalized: Question = {
          ...iq,
          questionId: iq.id,
          stem: iq.text,
          correctAnswer: iq.correctOption,
          status: 'published',
          marks: 2,
          negativeMarks: 0.5,
          language: 'English',
          timestamps: {
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-08-01T00:00:00Z',
          }
        };
        questionList.push(normalized);
        existingIds.add(iq.id);
        hasNew = true;
      }
    }

    // Normalize all questions so both stem/text and correctAnswer/correctOption exist
    questionList = questionList.map((q) => ({
      ...q,
      stem: q.stem || q.text,
      text: q.text || q.stem,
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption,
      correctOption: typeof q.correctOption === 'number' ? q.correctOption : (typeof q.correctAnswer === 'number' ? q.correctAnswer : 0),
      status: q.status || 'published',
      marks: q.marks ?? 2,
      negativeMarks: q.negativeMarks ?? 0.5,
      language: q.language || 'English',
    }));

    if (hasNew || !saved) {
      this.saveQuestions(questionList);
    }
    return questionList;
  }

  static saveQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  static addQuestion(question: Question): void {
    const questions = this.getQuestions();
    const normalized: Question = {
      ...question,
      id: question.id || `q-user-${Date.now()}`,
      stem: question.stem || question.text,
      text: question.text || question.stem,
      correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : question.correctOption,
      correctOption: typeof question.correctOption === 'number' ? question.correctOption : (typeof question.correctAnswer === 'number' ? question.correctAnswer : 0),
      timestamps: question.timestamps || {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    questions.unshift(normalized);
    this.saveQuestions(questions);
    this.addAuditLog('Admin', 'Created Question', `Added question ${normalized.id} for subject ${normalized.subjectId}`);
  }

  static updateQuestion(question: Question): void {
    const questions = this.getQuestions().map((q) => (q.id === question.id ? {
      ...question,
      stem: question.stem || question.text,
      text: question.text || question.stem,
      timestamps: {
        createdAt: q.timestamps?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } : q));
    this.saveQuestions(questions);
    this.addAuditLog('Admin', 'Updated Question', `Modified question ${question.id}`);
  }

  static deleteQuestion(id: string): void {
    const questions = this.getQuestions().filter((q) => q.id !== id);
    this.saveQuestions(questions);
    this.addAuditLog('Admin', 'Deleted Question', `Removed question ${id}`);
  }

  // Question Duplicate Detection Helper
  static checkQuestionDuplicate(stem: string, existingQuestions: Question[]): { isDuplicate: boolean; matchQuestion?: Question; similarityPercent: number } {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    const targetWords = new Set(normalize(stem).split(/\s+/).filter(w => w.length > 3));
    if (targetWords.size === 0) return { isDuplicate: false, similarityPercent: 0 };

    let highestSim = 0;
    let bestMatch: Question | undefined;

    for (const q of existingQuestions) {
      const qWords = new Set(normalize(q.stem || q.text).split(/\s+/).filter(w => w.length > 3));
      if (qWords.size === 0) continue;

      let intersection = 0;
      targetWords.forEach(w => {
        if (qWords.has(w)) intersection++;
      });

      const union = new Set([...targetWords, ...qWords]).size;
      const jaccard = union > 0 ? (intersection / union) * 100 : 0;

      if (jaccard > highestSim) {
        highestSim = jaccard;
        bestMatch = q;
      }
    }

    return {
      isDuplicate: highestSim >= 65, // >65% word overlap flags as duplicate
      matchQuestion: bestMatch,
      similarityPercent: Math.round(highestSim)
    };
  }

  // Bulk Import Questions with Validation and Duplicate Detection
  static importQuestions(newQuestions: Question[]): { imported: number; duplicates: number; skipped: number } {
    const currentQuestions = this.getQuestions();
    const existingIds = new Set(currentQuestions.map(q => q.id));
    let imported = 0;
    let duplicates = 0;
    let skipped = 0;

    const toAdd: Question[] = [];

    for (const nq of newQuestions) {
      const stem = nq.stem || nq.text;
      if (!stem || !nq.subjectId || !nq.options || nq.options.length < 2) {
        skipped++;
        continue;
      }

      // Check ID duplicate
      if (existingIds.has(nq.id)) {
        duplicates++;
        continue;
      }

      // Check Stem text duplicate
      const dupCheck = this.checkQuestionDuplicate(stem, currentQuestions);
      if (dupCheck.isDuplicate) {
        duplicates++;
        continue;
      }

      const normalized: Question = {
        ...nq,
        id: nq.id || `q-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        stem: stem,
        text: stem,
        correctAnswer: nq.correctAnswer !== undefined ? nq.correctAnswer : nq.correctOption,
        correctOption: typeof nq.correctOption === 'number' ? nq.correctOption : (typeof nq.correctAnswer === 'number' ? nq.correctAnswer : 0),
        status: nq.status || 'published',
        timestamps: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      };

      toAdd.push(normalized);
      existingIds.add(normalized.id);
      imported++;
    }

    if (toAdd.length > 0) {
      const merged = [...toAdd, ...currentQuestions];
      this.saveQuestions(merged);
      this.addAuditLog('Admin', 'Bulk Question Import', `Imported ${imported} questions (${duplicates} duplicates avoided, ${skipped} skipped).`);
    }

    return { imported, duplicates, skipped };
  }

  // Question Reporting
  static getQuestionReports(): QuestionReport[] {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTION_REPORTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing question reports', e);
      }
    }
    // Seed initial report for testing/demo
    const initialReports: QuestionReport[] = [
      {
        id: 'rep-001',
        questionId: 'q-ce-101',
        questionStem: 'According to IS 456:2000 (Clause 26.5.1.1), what is the minimum percentage of tensile reinforcement...',
        category: 'explanation_issue',
        comment: 'Please clarify whether this formula applies to Fe 550 or only up to Fe 415/Fe 500.',
        userEmail: 'candidate.civil@gmail.com',
        reportedAt: '2024-08-20T14:30:00Z',
        status: 'pending',
      }
    ];
    this.saveQuestionReports(initialReports);
    return initialReports;
  }

  static saveQuestionReports(reports: QuestionReport[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTION_REPORTS, JSON.stringify(reports));
  }

  static reportQuestion(data: {
    questionId: string;
    questionStem: string;
    category: QuestionReport['category'];
    comment: string;
    userEmail?: string;
  }): QuestionReport {
    const reports = this.getQuestionReports();
    const newReport: QuestionReport = {
      id: `rep-${Date.now()}`,
      ...data,
      reportedAt: new Date().toISOString(),
      status: 'pending',
    };
    reports.unshift(newReport);
    this.saveQuestionReports(reports);
    this.addAuditLog('User', 'Reported Question', `Report logged for ${data.questionId} (${data.category})`);
    return newReport;
  }

  static resolveQuestionReport(reportId: string, resolution: string): void {
    const reports = this.getQuestionReports().map((r) =>
      r.id === reportId ? { ...r, status: 'resolved' as const, adminResolution: resolution } : r
    );
    this.saveQuestionReports(reports);
    this.addAuditLog('Admin', 'Resolved Question Report', `Report ${reportId} resolved: ${resolution}`);
  }

  static dismissQuestionReport(reportId: string): void {
    const reports = this.getQuestionReports().map((r) =>
      r.id === reportId ? { ...r, status: 'dismissed' as const } : r
    );
    this.saveQuestionReports(reports);
    this.addAuditLog('Admin', 'Dismissed Question Report', `Report ${reportId} dismissed`);
  }

  // Daily Challenge
  static getDailyChallengeStatus(): { completed: boolean; score: number; date: string } {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing daily challenge status', e);
      }
    }
    return { completed: false, score: 0, date: today };
  }

  static recordDailyChallengeAttempt(score: number, total: number): void {
    const today = new Date().toISOString().split('T')[0];
    const data = { completed: true, score, date: today, total };
    localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE, JSON.stringify(data));

    // Increment profile streak & questions count
    const profile = this.getProfile();
    const updated = {
      ...profile,
      solvedToday: profile.solvedToday + total,
      totalQuestionsSolved: profile.totalQuestionsSolved + total,
    };
    this.saveProfile(updated);
  }

  // Mock Tests
  static getMockTests(): MockTest[] {
    const saved = localStorage.getItem(STORAGE_KEYS.MOCK_TESTS);
    let tests: MockTest[] = [];
    if (saved) {
      try {
        tests = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing mock tests', e);
      }
    }

    // Ensure all 13 canonical default mock tests are included
    const existingIds = new Set(tests.map(t => t.id));
    let hasNew = false;
    for (const dt of MOCK_TESTS) {
      if (!existingIds.has(dt.id)) {
        tests.push(dt);
        existingIds.add(dt.id);
        hasNew = true;
      }
    }

    if (hasNew || !saved) {
      this.saveMockTests(tests);
    }
    return tests;
  }

  static saveMockTests(tests: MockTest[]): void {
    localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(tests));
  }

  static addMockTest(test: MockTest): void {
    const tests = this.getMockTests();
    tests.unshift(test);
    this.saveMockTests(tests);
    this.addAuditLog('Admin', 'Created Mock Test', `Added mock test: ${test.title}`);
  }

  // Incomplete Test Sessions (Safe Resume & Auto-Save)
  static getAllIncompleteSessions(): Record<string, IncompleteTestSession> {
    const saved = localStorage.getItem(STORAGE_KEYS.INCOMPLETE_SESSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing incomplete sessions', e);
      }
    }
    return {};
  }

  static saveIncompleteSession(session: IncompleteTestSession): void {
    const sessions = this.getAllIncompleteSessions();
    sessions[session.testId] = session;
    localStorage.setItem(STORAGE_KEYS.INCOMPLETE_SESSIONS, JSON.stringify(sessions));
  }

  static getIncompleteSession(testId?: string): IncompleteTestSession | null {
    const sessions = this.getAllIncompleteSessions();
    if (testId) {
      return sessions[testId] || null;
    }
    // Return most recently updated active session
    const list = Object.values(sessions);
    if (list.length === 0) return null;
    list.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    return list[0];
  }

  static clearIncompleteSession(testId: string): void {
    const sessions = this.getAllIncompleteSessions();
    if (sessions[testId]) {
      delete sessions[testId];
      localStorage.setItem(STORAGE_KEYS.INCOMPLETE_SESSIONS, JSON.stringify(sessions));
    }
  }

  // Test Attempts
  static getTestAttempts(): TestAttempt[] {
    const saved = localStorage.getItem(STORAGE_KEYS.TEST_ATTEMPTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing test attempts', e);
      }
    }

    const defaultAttempts: TestAttempt[] = [
      {
        id: 'att-pwd-full-01',
        testId: 'mock-maha-pwd-full-1',
        testTitle: 'Maharashtra PWD JE (Civil) Full Length Exam 01',
        examTargetId: 'maha_pwd',
        date: '2025-02-28',
        durationSpentSeconds: 6480,
        avgTimePerQuestionSeconds: 65,
        totalQuestions: 100,
        attemptedQuestions: 94,
        correctAnswers: 76,
        wrongAnswers: 18,
        unanswered: 6,
        score: 147.5,
        totalMarks: 200,
        negativeMarkLoss: 4.5,
        accuracy: 80.9,
        percentile: 92.4,
        cohortRank: 42,
        cohortTotal: 550,
        serverVerified: true,
        verificationSignature: 'HMAC_SHA256_VERIFIED_51829',
        userAnswers: {},
        subjectBreakdown: {
          rcc_concrete: { correct: 18, wrong: 2, total: 20, score: 35.5 },
          som: { correct: 16, wrong: 2, total: 18, score: 31.5 },
          soil_mechanics: { correct: 10, wrong: 6, total: 16, score: 18.5 },
          steel_structures: { correct: 8, wrong: 5, total: 14, score: 14.75 },
          building_materials: { correct: 14, wrong: 1, total: 16, score: 27.75 },
          surveying: { correct: 10, wrong: 2, total: 12, score: 19.5 },
        },
        difficultyBreakdown: {
          easy: { correct: 36, wrong: 2, total: 38 },
          medium: { correct: 30, wrong: 10, total: 42 },
          hard: { correct: 10, wrong: 6, total: 16 },
        },
        sectionBreakdown: {
          'sec-1': { name: 'Technical Civil (140M)', attempted: 68, correct: 56, wrong: 12, score: 109.0, total: 70 },
          'sec-2': { name: 'General Studies & Marathi (60M)', attempted: 26, correct: 20, wrong: 6, score: 38.5, total: 30 },
        },
        flaggedQuestionIds: ['q-102', 'q-106'],
      },
      {
        id: 'att-rcc-sectional-01',
        testId: 'mock-rcc-sectional-1',
        testTitle: 'RCC & Prestressed Concrete Specialized Sectional',
        examTargetId: 'mpsc_civil',
        date: '2025-02-22',
        durationSpentSeconds: 2700,
        avgTimePerQuestionSeconds: 54,
        totalQuestions: 50,
        attemptedQuestions: 48,
        correctAnswers: 41,
        wrongAnswers: 7,
        unanswered: 2,
        score: 79.25,
        totalMarks: 100,
        negativeMarkLoss: 1.75,
        accuracy: 85.4,
        percentile: 94.8,
        cohortRank: 24,
        cohortTotal: 460,
        serverVerified: true,
        verificationSignature: 'HMAC_SHA256_VERIFIED_39811',
        userAnswers: {},
        subjectBreakdown: {
          rcc_concrete: { correct: 41, wrong: 7, total: 48, score: 79.25 },
        },
        difficultyBreakdown: {
          easy: { correct: 18, wrong: 0, total: 18 },
          medium: { correct: 18, wrong: 4, total: 24 },
          hard: { correct: 5, wrong: 3, total: 8 },
        },
        flaggedQuestionIds: ['q-103'],
      },
    ];

    try {
      localStorage.setItem(STORAGE_KEYS.TEST_ATTEMPTS, JSON.stringify(defaultAttempts));
    } catch (e) {}

    return defaultAttempts;
  }

  static deleteTestAttempt(attemptId: string): void {
    const attempts = this.getTestAttempts().filter(a => a.id !== attemptId);
    localStorage.setItem(STORAGE_KEYS.TEST_ATTEMPTS, JSON.stringify(attempts));
  }

  static saveTestAttempt(attempt: TestAttempt): void {
    const attempts = this.getTestAttempts();
    attempts.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.TEST_ATTEMPTS, JSON.stringify(attempts));

    // Update profile stats
    const profile = this.getProfile();
    const totalAttempted = profile.totalQuestionsSolved + attempt.attemptedQuestions;
    const totalTests = profile.totalTestsTaken + 1;
    const prevCorrect = Math.round((profile.accuracyRate / 100) * profile.totalQuestionsSolved);
    const newCorrect = prevCorrect + attempt.correctAnswers;
    const newAccuracy = totalAttempted > 0 ? Number(((newCorrect / totalAttempted) * 100).toFixed(1)) : 0;

    this.updateProfile({
      totalQuestionsSolved: totalAttempted,
      totalTestsTaken: totalTests,
      accuracyRate: newAccuracy,
      solvedToday: profile.solvedToday + attempt.attemptedQuestions,
    });
  }

  // Mistake Notebook
  static getMistakes(): MistakeLog[] {
    const saved = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing mistakes', e);
      }
    }

    // Seed realistic initial mistakes with genuine Civil Engineering questions across key tags
    const allQuestions = this.getQuestions();
    const today = new Date().toISOString().split('T')[0];

    // Pick a few representative questions for seeding
    const rccQ = allQuestions.find(q => q.subjectId === 'rcc') || allQuestions[0];
    const steelQ = allQuestions.find(q => q.subjectId === 'steel') || allQuestions[1] || allQuestions[0];
    const somQ = allQuestions.find(q => q.subjectId === 'som') || allQuestions[2] || allQuestions[0];
    const geoQ = allQuestions.find(q => q.subjectId === 'geotechnical') || allQuestions[3] || allQuestions[0];

    const seeded: MistakeLog[] = [
      {
        id: 'mst-seed-001',
        questionId: rccQ.id,
        question: rccQ,
        selectedOption: (rccQ.correctOption + 1) % 4,
        correctOption: rccQ.correctOption,
        mistakeReason: 'formula_error',
        reasonTag: 'formula_error',
        userNotes: 'Confused minimum tension reinforcement formula (0.85 bd / fy) with 0.87 factor. Cross-check IS 456 Cl. 26.5.1.',
        dateLogged: today,
        loggedAt: today,
        resolved: false,
        reviewCount: 2,
        nextRevisionDate: today, // Due today!
        spacedIntervalStage: 1,
        history: [
          {
            date: today,
            action: 'logged',
            selectedOption: (rccQ.correctOption + 1) % 4,
            isCorrect: false,
            notes: 'Initial error during Mock Test CBT-1'
          },
          {
            date: today,
            action: 'tag_updated',
            notes: 'Tagged as Formula Error'
          }
        ]
      },
      {
        id: 'mst-seed-002',
        questionId: steelQ.id,
        question: steelQ,
        selectedOption: (steelQ.correctOption + 2) % 4,
        correctOption: steelQ.correctOption,
        mistakeReason: 'code_standard_confusion',
        reasonTag: 'code_standard_confusion',
        userNotes: 'Forgot IS 800 Table 3 limit of 350 for tension member subject to reversal of stress due to wind/earthquake.',
        dateLogged: today,
        loggedAt: today,
        resolved: false,
        reviewCount: 1,
        nextRevisionDate: today, // Due today!
        spacedIntervalStage: 0,
        history: [
          {
            date: today,
            action: 'logged',
            selectedOption: (steelQ.correctOption + 2) % 4,
            isCorrect: false,
            notes: 'Failed during Steel Structures practice'
          }
        ]
      },
      {
        id: 'mst-seed-003',
        questionId: geoQ.id,
        question: geoQ,
        selectedOption: (geoQ.correctOption + 1) % 4,
        correctOption: geoQ.correctOption,
        mistakeReason: 'concept_gap',
        reasonTag: 'concept_gap',
        userNotes: 'Overlooked double drainage condition in consolidation time factor: drainage path d = H/2, not total thickness H.',
        dateLogged: today,
        loggedAt: today,
        resolved: false,
        reviewCount: 1,
        nextRevisionDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        spacedIntervalStage: 0,
        history: [
          {
            date: today,
            action: 'logged',
            selectedOption: (geoQ.correctOption + 1) % 4,
            isCorrect: false,
            notes: 'Missed in Geotechnical diagnostic test'
          }
        ]
      },
      {
        id: 'mst-seed-004',
        questionId: somQ.id,
        question: somQ,
        selectedOption: somQ.correctOption,
        correctOption: somQ.correctOption,
        mistakeReason: 'calculation_error',
        reasonTag: 'calculation_error',
        userNotes: 'Calculation error on shear stress parabola at neutral axis. Re-derived and successfully solved.',
        dateLogged: today,
        loggedAt: today,
        resolved: true, // Mastered item
        masteredAt: today,
        reviewCount: 3,
        spacedIntervalStage: 3,
        history: [
          {
            date: today,
            action: 'logged',
            selectedOption: (somQ.correctOption + 1) % 4,
            isCorrect: false,
            notes: 'Calculation slip in SOM practice'
          },
          {
            date: today,
            action: 'retested',
            selectedOption: somQ.correctOption,
            isCorrect: true,
            notes: 'Retest solved cleanly'
          },
          {
            date: today,
            action: 'mastered',
            notes: 'Marked mastered after revision'
          }
        ]
      }
    ];

    this.saveMistakes(seeded);
    return seeded;
  }

  static saveMistakes(mistakes: MistakeLog[]): void {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  }

  static recordMistake(
    question: Question,
    selectedOption: number,
    correctOption: number,
    reason: MistakeReasonTag = 'concept_gap',
    notes: string = ''
  ): void {
    const mistakes = this.getMistakes();
    const existingIndex = mistakes.findIndex((m) => m.questionId === question.id);
    const today = new Date().toISOString().split('T')[0];

    if (existingIndex >= 0) {
      const existing = mistakes[existingIndex];
      existing.reviewCount = (existing.reviewCount || 1) + 1;
      existing.selectedOption = selectedOption;
      existing.dateLogged = today;
      existing.loggedAt = today;
      existing.reasonTag = reason;
      existing.mistakeReason = reason;
      existing.resolved = false;
      existing.spacedIntervalStage = 0;
      existing.nextRevisionDate = today;
      if (!existing.history) existing.history = [];
      existing.history.push({
        date: today,
        action: 'logged',
        selectedOption,
        isCorrect: false,
        notes: notes || 'Logged error from test session'
      });
    } else {
      mistakes.unshift({
        id: `mst-${Date.now()}`,
        questionId: question.id,
        question,
        selectedOption,
        correctOption,
        mistakeReason: reason,
        reasonTag: reason,
        userNotes: notes,
        dateLogged: today,
        loggedAt: today,
        resolved: false,
        reviewCount: 1,
        spacedIntervalStage: 0,
        nextRevisionDate: today,
        history: [
          {
            date: today,
            action: 'logged',
            selectedOption,
            isCorrect: false,
            notes: notes || 'Auto-archived from practice session'
          }
        ]
      });
    }
    this.saveMistakes(mistakes);
  }

  static resolveMistake(id: string): void {
    this.toggleMistakeMastered(id);
  }

  static toggleMistakeMastered(id: string): MistakeLog | undefined {
    const mistakes = this.getMistakes();
    const index = mistakes.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    const m = mistakes[index];
    const today = new Date().toISOString().split('T')[0];
    const newStatus = !m.resolved;
    m.resolved = newStatus;
    m.masteredAt = newStatus ? today : undefined;

    if (!m.history) m.history = [];
    m.history.push({
      date: today,
      action: newStatus ? 'mastered' : 'unmastered',
      notes: newStatus ? 'Marked mastered by candidate' : 'Moved back to active revision'
    });

    this.saveMistakes(mistakes);
    return m;
  }

  static recordMistakeRetest(
    id: string,
    selectedOption: number,
    isCorrect: boolean
  ): { mistake: MistakeLog; nextStage: number } | undefined {
    const mistakes = this.getMistakes();
    const index = mistakes.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    const m = mistakes[index];
    const today = new Date().toISOString().split('T')[0];
    m.reviewCount = (m.reviewCount || 1) + 1;

    if (!m.history) m.history = [];
    m.history.push({
      date: today,
      action: 'retested',
      selectedOption,
      isCorrect,
      notes: isCorrect ? 'Answered correctly during Retest Drill' : 'Incorrect in Retest Drill'
    });

    const currentStage = m.spacedIntervalStage || 0;
    if (isCorrect) {
      const nextStage = currentStage + 1;
      m.spacedIntervalStage = nextStage;
      // Spaced interval: stage 1 = 3 days, stage 2 = 7 days, stage 3 = 14 days, stage 4 = 30 days
      const days = nextStage === 1 ? 3 : nextStage === 2 ? 7 : nextStage === 3 ? 14 : 30;
      const nextD = new Date();
      nextD.setDate(nextD.getDate() + days);
      m.nextRevisionDate = nextD.toISOString().split('T')[0];

      if (nextStage >= 3) {
        m.resolved = true;
        m.masteredAt = today;
      }
    } else {
      m.spacedIntervalStage = 0;
      m.resolved = false;
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      m.nextRevisionDate = tmrw.toISOString().split('T')[0];
    }

    this.saveMistakes(mistakes);
    return { mistake: m, nextStage: m.spacedIntervalStage };
  }

  static updateMistakeNote(id: string, notes: string, reason?: MistakeReasonTag): void {
    const mistakes = this.getMistakes();
    const index = mistakes.findIndex((m) => m.id === id);
    if (index === -1) return;

    const m = mistakes[index];
    const today = new Date().toISOString().split('T')[0];
    m.userNotes = notes;
    if (reason) {
      m.mistakeReason = reason;
      m.reasonTag = reason;
    }

    if (!m.history) m.history = [];
    m.history.push({
      date: today,
      action: 'note_updated',
      notes: `Note updated: "${notes}"`
    });

    this.saveMistakes(mistakes);
  }

  static updateMistakeTag(id: string, reason: MistakeReasonTag): void {
    const mistakes = this.getMistakes();
    const index = mistakes.findIndex((m) => m.id === id);
    if (index === -1) return;

    const m = mistakes[index];
    const today = new Date().toISOString().split('T')[0];
    m.mistakeReason = reason;
    m.reasonTag = reason;

    if (!m.history) m.history = [];
    m.history.push({
      date: today,
      action: 'tag_updated',
      notes: `Reason tag updated to: ${reason}`
    });

    this.saveMistakes(mistakes);
  }

  static deleteMistake(id: string): void {
    const mistakes = this.getMistakes().filter((m) => m.id !== id);
    this.saveMistakes(mistakes);
  }

  // ==================== STUDY PLANNER ENGINE ====================
  static getStudyPlan(profile?: StudentProfile): StudentStudyPlan {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDY_PLAN);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing study plan', e);
      }
    }
    const prof = profile || this.getProfile();
    const defaultPlan = this.generateStudyPlan(
      prof.targetExams[0] || 'maha_pwd',
      '2026-11-20',
      prof.dailyStudyHours || 4
    );
    this.saveStudyPlan(defaultPlan);
    return defaultPlan;
  }

  static saveStudyPlan(plan: StudentStudyPlan): void {
    localStorage.setItem(STORAGE_KEYS.STUDY_PLAN, JSON.stringify(plan));
  }

  static generateStudyPlan(
    targetExamId: ExamTargetId,
    targetDate: string,
    dailyHours: number = 4,
    weakSubjects: string[] = ['Soil Mechanics & Foundation Engg', 'Design of Steel Structures (IS 800:2007)']
  ): StudentStudyPlan {
    const exam = EXAM_CATALOGUE.find((e) => e.id === targetExamId) || EXAM_CATALOGUE[4];
    const today = new Date().toISOString().split('T')[0];

    const totalMinutes = dailyHours * 60;
    const practiceMin = Math.round(totalMinutes * 0.4);
    const revisionMin = Math.round(totalMinutes * 0.25);
    const pyqMin = Math.round(totalMinutes * 0.2);
    const mockMin = Math.round(totalMinutes * 0.15);

    const dailyTasks: DailyStudyTask[] = [
      {
        id: `task-1`,
        title: 'Practice 25 MCQs: IS 456 Limit State Shear & Torsion Design',
        category: 'practice',
        allocatedMinutes: practiceMin,
        subjectId: 'rcc',
        subjectName: 'RCC & Prestressed Concrete',
        topicName: 'Shear Reinforcement (Cl. 40)',
        targetCount: 25,
        completed: true,
        completedAt: today,
        notes: 'Focus on maximum shear stress limits in Table 20',
      },
      {
        id: `task-2`,
        title: 'Remedial Revision: Soil Consolidation & Terzaghi 1D Theory',
        category: 'revision',
        allocatedMinutes: revisionMin,
        subjectId: 'geotechnical',
        subjectName: 'Soil Mechanics & Foundation Engg',
        topicName: 'Consolidation & Settlement',
        targetCount: 15,
        completed: false,
        remedialReason: 'Accuracy is currently 61% (Telemetry Weak Subject)',
        notes: 'Revise log-time and square root of time curve methods',
      },
      {
        id: `task-3`,
        title: 'Solve Maharashtra PWD JE 2023 Shift-1 PYQ (Technical Section)',
        category: 'pyq',
        allocatedMinutes: pyqMin,
        subjectId: 'som',
        subjectName: 'Multiple Core Subjects',
        targetCount: 30,
        completed: false,
        notes: 'Solve under timed speed: target 40s per question',
      },
      {
        id: `task-4`,
        title: 'Speed Drill / Mini Mock: Steel Structures IS 800 Connections',
        category: 'mock_test',
        allocatedMinutes: mockMin,
        subjectId: 'steel',
        subjectName: 'Design of Steel Structures',
        targetCount: 15,
        completed: false,
        remedialReason: 'Low accuracy in welded vs bolted joints',
      },
    ];

    const milestones = [
      {
        weekNumber: 1,
        title: 'Structural Core Mastery: SOM & IS 456 RCC',
        subjects: ['SOM', 'RCC & Prestressed Concrete'],
        targetQuestions: 350,
        completed: true,
      },
      {
        weekNumber: 2,
        title: 'Geotechnical & Steel Standard Provisions',
        subjects: ['Soil Mechanics', 'Design of Steel Structures (IS 800)'],
        targetQuestions: 350,
        completed: false,
      },
      {
        weekNumber: 3,
        title: 'Hydraulics, WRD Irrigation & Environmental Tech',
        subjects: ['Fluid Mechanics', 'Hydrology & Water Resources', 'Environmental Engg'],
        targetQuestions: 300,
        completed: false,
      },
      {
        weekNumber: 4,
        title: 'Transportation (IRC Standards) & Advanced Surveying',
        subjects: ['Highway Engg', 'Surveying & Levelling', 'CPM / PERT'],
        targetQuestions: 300,
        completed: false,
      },
      {
        weekNumber: 5,
        title: 'Intensive Full-Length CBT Mock Series & PYQ Marathons',
        subjects: ['Full Civil Engineering Technical Syllabus'],
        targetQuestions: 500,
        completed: false,
      },
    ];

    return {
      id: `plan-${Date.now()}`,
      targetExamId,
      targetExamName: exam.name,
      targetExamDate: targetDate,
      startDate: today,
      dailyHours,
      timeAllocation: {
        practicePercent: 40,
        revisionPercent: 25,
        pyqPercent: 20,
        mockPercent: 15,
      },
      adaptiveFocusSubjects: weakSubjects.map((s) => ({
        subjectName: s,
        subjectId: s.toLowerCase().includes('soil') ? 'geotechnical' : 'steel',
        reason: 'Cohort accuracy <70% — prioritized in daily revision queue',
        priorityMultiplier: 1.4,
      })),
      dailyTasks,
      weeklyMilestones: milestones,
      syllabusCoveragePercent: 48,
      lastAdaptedAt: today,
    };
  }

  static toggleDailyTask(taskId: string): DailyStudyTask | undefined {
    const plan = this.getStudyPlan();
    const task = plan.dailyTasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString().split('T')[0] : undefined;

    if (task.completed && task.targetCount) {
      this.incrementQuestionsSolved(task.targetCount);
    }

    this.saveStudyPlan(plan);
    return task;
  }

  static addCustomDailyTask(task: Omit<DailyStudyTask, 'id' | 'completed'>): DailyStudyTask {
    const plan = this.getStudyPlan();
    const newTask: DailyStudyTask = {
      ...task,
      id: `task-custom-${Date.now()}`,
      completed: false,
    };
    plan.dailyTasks.push(newTask);
    this.saveStudyPlan(plan);
    return newTask;
  }

  static adaptStudyPlanToPerformance(weakSubjects: string[]): StudentStudyPlan {
    const plan = this.getStudyPlan();
    const today = new Date().toISOString().split('T')[0];

    plan.adaptiveFocusSubjects = weakSubjects.map((s) => ({
      subjectName: s,
      subjectId: s.toLowerCase().includes('soil') ? 'geotechnical' : 'steel',
      reason: 'Adaptive telemetry: Low accuracy detected in CBT attempts',
      priorityMultiplier: 1.5,
    }));

    // Inject remedial task if not already present
    const hasRemedial = plan.dailyTasks.some((t) => t.remedialReason);
    if (!hasRemedial && weakSubjects.length > 0) {
      plan.dailyTasks.splice(1, 0, {
        id: `task-remedial-${Date.now()}`,
        title: `Adaptive Remedial Drill: ${weakSubjects[0]}`,
        category: 'revision',
        allocatedMinutes: 45,
        subjectName: weakSubjects[0],
        targetCount: 20,
        completed: false,
        remedialReason: 'Auto-scheduled by AI Study Planner based on accuracy telemetry',
        notes: 'Target conceptual definitions and IS Code codal provisions',
      });
    }

    plan.lastAdaptedAt = today;
    this.saveStudyPlan(plan);
    return plan;
  }

  // Exam Catalogue & Profiles
  static getExamProfiles(includeArchived: boolean = false): ExamProfile[] {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAM_PROFILES);
    let list: ExamProfile[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing exam profiles', e);
        list = INITIAL_EXAM_PROFILES;
      }
    } else {
      list = INITIAL_EXAM_PROFILES;
      this.saveExamProfiles(list);
    }
    if (!includeArchived) {
      return list.filter((p) => !p.isArchived);
    }
    return list;
  }

  static saveExamProfiles(profiles: ExamProfile[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAM_PROFILES, JSON.stringify(profiles));
  }

  static addExamProfile(profile: ExamProfile): void {
    const profiles = this.getExamProfiles(true);
    profiles.push(profile);
    this.saveExamProfiles(profiles);
    this.addAuditLog('Admin', 'Added Exam Profile', `${profile.name} (${profile.shortName})`, 'Exam Catalogue');
    
    // Sync to backend if available
    try {
      fetch('/api/exam-engine/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, actorEmail: 'admin@engineeringofficer.in' })
      }).catch(() => {});
    } catch {}
  }

  static updateExamProfile(updated: ExamProfile): void {
    const profiles = this.getExamProfiles(true).map((p) => (p.id === updated.id ? updated : p));
    this.saveExamProfiles(profiles);
    this.addAuditLog('Admin', 'Updated Exam Profile', `${updated.name}`, 'Exam Catalogue');

    // Sync to backend if available
    try {
      fetch(`/api/exam-engine/profiles/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: updated, actorEmail: 'admin@engineeringofficer.in' })
      }).catch(() => {});
    } catch {}
  }

  static cloneExamProfile(sourceId: string, newId: string, newName: string): ExamProfile | undefined {
    const profiles = this.getExamProfiles(true);
    const source = profiles.find((p) => p.id === sourceId);
    if (!source) return undefined;

    const cloned: ExamProfile = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: newName,
      shortName: `${source.shortName} (Copy)`,
      status: 'Active',
      isArchived: false,
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      adminNotes: `Cloned from ${source.name} on ${new Date().toLocaleDateString()}`
    };

    profiles.push(cloned);
    this.saveExamProfiles(profiles);
    this.addAuditLog('Admin', 'Cloned Exam Profile', `Created ${newName} from ${source.shortName}`, 'Exam Catalogue');

    // Sync to backend
    try {
      fetch(`/api/exam-engine/profiles/${sourceId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newId, newName, actorEmail: 'admin@engineeringofficer.in' })
      }).catch(() => {});
    } catch {}

    return cloned;
  }

  static archiveExamProfile(id: string): void {
    const profiles = this.getExamProfiles(true);
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      profile.isArchived = true;
      profile.status = 'Archived';
      this.saveExamProfiles(profiles);
      this.addAuditLog('Admin', 'Archived Exam Profile', `${profile.shortName} moved to archive`, 'Exam Catalogue');

      try {
        fetch(`/api/exam-engine/profiles/${id}/archive`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actorEmail: 'admin@engineeringofficer.in' })
        }).catch(() => {});
      } catch {}
    }
  }

  static restoreExamProfile(id: string): void {
    const profiles = this.getExamProfiles(true);
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      profile.isArchived = false;
      profile.status = 'Active';
      this.saveExamProfiles(profiles);
      this.addAuditLog('Admin', 'Restored Exam Profile', `${profile.shortName} restored from archive`, 'Exam Catalogue');

      try {
        fetch(`/api/exam-engine/profiles/${id}/restore`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actorEmail: 'admin@engineeringofficer.in' })
        }).catch(() => {});
      } catch {}
    }
  }

  static deleteExamProfile(id: string): void {
    const profiles = this.getExamProfiles(true).filter((p) => p.id !== id);
    this.saveExamProfiles(profiles);
    this.addAuditLog('Admin', 'Deleted Exam Profile', `Profile ID: ${id}`, 'Exam Catalogue');

    try {
      fetch(`/api/exam-engine/profiles/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}
  }

  static toggleExamProfileActive(id: string): void {
    const profiles = this.getExamProfiles(true);
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      profile.isActive = profile.isActive !== undefined ? !profile.isActive : false;
      this.saveExamProfiles(profiles);
      this.addAuditLog(
        'Admin',
        'Toggled Exam Profile Status',
        `${profile.shortName} status set to ${profile.isActive ? 'Active' : 'Inactive'}`,
        'Exam Catalogue'
      );
    }
  }

  // Multi-Target Exam Preparation Analyzer
  static async analyzeMultiTargetPreparation(examIds: string[], qualification?: string): Promise<MultiExamAnalysisResult> {
    try {
      const response = await fetch('/api/exam-engine/multi-target-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examIds, candidateQualification: qualification })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend multi-target analysis unavailable, using local calculation', e);
    }

    // Client-side fallback analyzer
    const allProfiles = this.getExamProfiles(true);
    const selectedExams = allProfiles.filter((p) => examIds.includes(p.id));
    const targetExams = selectedExams.length > 0 ? selectedExams : allProfiles.slice(0, 2);

    const universalCoreSubjects = [
      {
        subjectId: 'building_materials',
        subjectName: 'Building Materials & Concrete Technology',
        averageWeightage: 18,
        appearsInExamIds: targetExams.map((e) => e.id),
        isCodes: ['IS 456:2000', 'IS 383', 'IS 10262'],
        importance: 'Critical' as const,
        summary: 'Essential foundational module across all exams with 16-20% weightage.'
      },
      {
        subjectId: 'rcc',
        subjectName: 'Design of Concrete & Prestressed Structures',
        averageWeightage: 16,
        appearsInExamIds: targetExams.map((e) => e.id),
        isCodes: ['IS 456:2000 Cl. 38', 'IS 1343:2012'],
        importance: 'Critical' as const,
        summary: 'Consistent high-scoring section in both Diploma and Degree level exams.'
      },
      {
        subjectId: 'surveying',
        subjectName: 'Surveying & Levelling',
        averageWeightage: 15,
        appearsInExamIds: targetExams.map((e) => e.id),
        isCodes: ['Standard Survey Practices'],
        importance: 'Critical' as const,
        summary: 'Direct formula and calculation questions on Levelling, Contouring, and Earthwork.'
      },
      {
        subjectId: 'som',
        subjectName: 'Strength of Materials & Mechanics',
        averageWeightage: 14,
        appearsInExamIds: targetExams.map((e) => e.id),
        isCodes: ['Standard Engineering Mechanics'],
        importance: 'Critical' as const,
        summary: 'Core engineering mechanics, SFD/BMD, and stress transformations.'
      },
      {
        subjectId: 'geotechnical',
        subjectName: 'Soil Mechanics & Foundation Engineering',
        averageWeightage: 13,
        appearsInExamIds: targetExams.map((e) => e.id),
        isCodes: ['IS 2720', 'IS 6403'],
        importance: 'High' as const,
        summary: 'Soil classification, Terzaghi consolidation, and bearing capacity.'
      }
    ];

    const differentialSubjects = targetExams.map((ex) => ({
      examId: ex.id,
      examShortName: ex.shortName,
      subjectId: 'specialized_module',
      subjectName: ex.id.includes('wrd') ? 'Hydraulics & Canal Design (Lacey/Kennedy)' : (ex.id.includes('bmc') ? 'Municipal Environmental & Bye-Laws' : `${ex.shortName} Board-Specific Specs`),
      weightage: 22,
      depthLevel: ex.qualification?.includes('Degree') ? 'degree_ae' : 'diploma_je',
      strategicNote: `Dedicated focus module carrying unique importance for ${ex.shortName}.`,
      isUniqueToThisExam: true
    }));

    return {
      selectedExams: targetExams,
      overlapPercentage: 82,
      universalCoreSubjects,
      differentialSubjects,
      patternComparison: targetExams.map((e) => ({
        examId: e.id,
        shortName: e.shortName,
        totalMarks: 200,
        duration: e.duration || '120 Minutes',
        negativeMarking: e.negativeMarking || '0.25 marks',
        questionCount: e.questionCount || 100,
        qualification: e.qualification || 'Diploma / B.E. Civil',
        diplomaAllowed: e.diplomaEligible ?? true,
        degreeAllowed: e.degreeEligible ?? true,
        officialSource: e.officialSource || 'Official Gazette',
        conductingBody: e.authority || 'Exam Board'
      })),
      unifiedStrategy: {
        recommendedCoreRatio: 75,
        recommendedDifferentialRatio: 25,
        dailyQuestionGoal: 60,
        coreDailyQuestions: 45,
        diffDailyQuestions: 15,
        keyActionItems: [
          `Focus 75% of your study hours on shared core subjects (Building Materials, RCC, Surveying, SOM) to score simultaneously in all ${targetExams.length} targets.`,
          `Dedicate 25% of practice time specifically to board-specific requirements.`,
          `Track negative marking calibration across your target exams.`
        ]
      },
      timelineMilestones: targetExams.map((e) => ({
        examId: e.id,
        examShortName: e.shortName,
        event: `${e.shortName} Examination`,
        date: e.examDate || 'Tentative 2026',
        status: 'Upcoming' as const
      }))
    };
  }

  // Recruitment Notices CMS
  static getNotices(): RecruitmentNotice[] {
    return this.getRecruitmentNotices();
  }

  static getRecruitmentNotices(): RecruitmentNotice[] {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing notices', e);
      }
    }
    this.saveRecruitmentNotices(INITIAL_RECRUITMENT_NOTICES);
    return INITIAL_RECRUITMENT_NOTICES;
  }

  static saveRecruitmentNotices(notices: RecruitmentNotice[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
  }

  static addNotice(notice: RecruitmentNotice): void {
    this.addRecruitmentNotice(notice);
  }

  static addRecruitmentNotice(notice: RecruitmentNotice): void {
    const notices = this.getRecruitmentNotices();
    notices.unshift(notice);
    this.saveRecruitmentNotices(notices);
    this.addAuditLog(
      'Admin',
      'Published Recruitment Notice',
      `${notice.deptName} - ${notice.postName} (${notice.totalVacancies} posts) | Advt: ${notice.advtNumber}`,
      'Recruitment CMS'
    );
  }

  static updateRecruitmentNotice(notice: RecruitmentNotice): void {
    const notices = this.getRecruitmentNotices().map((n) => (n.id === notice.id ? notice : n));
    this.saveRecruitmentNotices(notices);
    this.addAuditLog(
      'Admin',
      'Updated Notice',
      `${notice.postName} status set to ${notice.status} | Verified: ${notice.lastVerifiedDate || 'Today'}`,
      'Recruitment CMS'
    );
  }

  static deleteRecruitmentNotice(id: string): void {
    const notices = this.getRecruitmentNotices().filter((n) => n.id !== id);
    this.saveRecruitmentNotices(notices);
    this.addAuditLog('Admin', 'Deleted Notice', `Notice ID: ${id}`, 'Recruitment CMS');
  }

  static toggleArchiveRecruitmentNotice(id: string): void {
    const notices = this.getRecruitmentNotices();
    const notice = notices.find((n) => n.id === id);
    if (notice) {
      notice.isArchived = !notice.isArchived;
      if (notice.isArchived) {
        notice.status = 'Archived';
      } else if (notice.status === 'Archived') {
        notice.status = 'Active';
      }
      this.saveRecruitmentNotices(notices);
      this.addAuditLog(
        'Admin',
        'Toggle Archive Notice',
        `${notice.postName} archived state: ${notice.isArchived}`,
        'Recruitment CMS'
      );
    }
  }

  static broadcastNoticeAlert(notice: RecruitmentNotice): void {
    const notifs = this.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif-rec-${Date.now()}`,
      title: `Official Notice: ${notice.postName}`,
      message: `${notice.deptName} announced ${notice.totalVacancies} vacancies. Apply before ${notice.applyEndDate || 'deadline'}. Verify from official notification.`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type: 'recruitment',
      link: notice.officialNotificationUrl || notice.applyUrl,
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs);
    this.addAuditLog(
      'Admin',
      'Broadcast Push Notification',
      `Sent alert to all candidates for ${notice.postName}`,
      'Recruitment CMS'
    );
  }

  // Student Bookmarks & Reminders
  static getBookmarkedNoticeIds(): string[] {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKED_NOTICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing bookmarks', e);
      }
    }
    return [];
  }

  static toggleBookmarkNotice(noticeId: string): boolean {
    const bookmarks = this.getBookmarkedNoticeIds();
    const index = bookmarks.indexOf(noticeId);
    let isBookmarked = false;
    if (index === -1) {
      bookmarks.push(noticeId);
      isBookmarked = true;
    } else {
      bookmarks.splice(index, 1);
      isBookmarked = false;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKED_NOTICES, JSON.stringify(bookmarks));
    return isBookmarked;
  }

  static getDeadlineReminderIds(): string[] {
    const saved = localStorage.getItem(STORAGE_KEYS.DEADLINE_REMINDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing reminders', e);
      }
    }
    return [];
  }

  static toggleDeadlineReminder(noticeId: string, noticeTitle?: string): boolean {
    const reminders = this.getDeadlineReminderIds();
    const index = reminders.indexOf(noticeId);
    let hasReminder = false;
    if (index === -1) {
      reminders.push(noticeId);
      hasReminder = true;
      if (noticeTitle) {
        this.addNotification({
          id: `reminder-${Date.now()}`,
          title: `Deadline Alert Set: ${noticeTitle}`,
          message: `You will be alerted before the application window closes. Check official source regularly.`,
          date: new Date().toISOString().split('T')[0],
          read: false,
          type: 'reminder',
        });
      }
    } else {
      reminders.splice(index, 1);
      hasReminder = false;
    }
    localStorage.setItem(STORAGE_KEYS.DEADLINE_REMINDERS, JSON.stringify(reminders));
    return hasReminder;
  }

  // Study Materials
  static getStudyMaterials(): StudyMaterial[] {
    return this.getMaterials();
  }

  static getMaterials(): StudyMaterial[] {
    const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing materials', e);
      }
    }
    this.saveMaterials(STUDY_MATERIALS);
    return STUDY_MATERIALS;
  }

  static saveMaterials(materials: StudyMaterial[]): void {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }

  // Videos
  static getVideos(): VideoLecture[] {
    const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing videos', e);
      }
    }
    this.saveVideos(VIDEO_LECTURES);
    return VIDEO_LECTURES;
  }

  static saveVideos(videos: VideoLecture[]): void {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  }

  // Notifications
  static getNotifications(): NotificationItem[] {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing notifications', e);
      }
    }
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    return INITIAL_NOTIFICATIONS;
  }

  static saveNotifications(notifications: NotificationItem[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  static markNotificationRead(id: string): void {
    const notifs = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(notifs);
  }

  static markAllNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.saveNotifications(notifs);
  }

  static addNotification(notif: NotificationItem): void {
    const notifs = this.getNotifications();
    notifs.unshift(notif);
    this.saveNotifications(notifs);
  }

  // Audit & Security Logs
  static getAuditLogs(): AdminAuditLog[] {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing audit logs', e);
      }
    }
    return [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        adminUser: 'SP Admin (Super Admin)',
        action: 'System Initialized',
        module: 'System Settings',
        details: 'Engineering Officer BY SP platform initialized with Civil Engineering catalogue.',
      },
    ];
  }

  static addAuditLog(adminUser: string, action: string, details: string, module: string = 'Admin Console'): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUser,
      action,
      module,
      details,
    });
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
  }

  static logAdminAction(action: string, module: string, details: string): void {
    this.addAuditLog('SP Admin (Super Admin)', action, details, module);
  }

  // Promo Codes
  static getPromoCodes(): PromoCode[] {
    const saved = localStorage.getItem(STORAGE_KEYS.PROMO_CODES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing promos', e);
      }
    }
    return INITIAL_PROMO_CODES;
  }

  static validatePromoCode(code: string): { valid: boolean; discountPercent: number; message: string } {
    const promo = this.getPromoCodes().find(
      (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.active
    );
    if (!promo) {
      return { valid: false, discountPercent: 0, message: 'Invalid or expired coupon code.' };
    }
    return {
      valid: true,
      discountPercent: promo.discountPercentage,
      message: `Success! ${promo.discountPercentage}% discount applied.`,
    };
  }

  // Security / Anti-Fraud Events
  static logSecurityEvent(type: string, details: string): void {
    const events = this.getSecurityLogs();
    events.unshift({
      id: `sec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType: type,
      details,
    });
    localStorage.setItem(STORAGE_KEYS.SECURITY_EVENTS, JSON.stringify(events.slice(0, 50)));
  }

  static getSecurityLogs(): Array<{ id: string; timestamp: string; eventType: string; details: string }> {
    const saved = localStorage.getItem(STORAGE_KEYS.SECURITY_EVENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'sec-init-1',
        timestamp: '10:14:02 AM',
        eventType: 'SESSION_VERIFIED',
        details: 'Candidate single-device session integrity validated.',
      },
    ];
  }

  // ==========================================
  // SYLLABUS TREE ENGINE & TOPIC PROGRESS
  // ==========================================

  static getSyllabusTree(): SyllabusSubject[] {
    const saved = localStorage.getItem(STORAGE_KEYS.SYLLABUS_TREE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing syllabus tree:', e);
      }
    }
    return INITIAL_SYLLABUS_TREE;
  }

  static saveSyllabusTree(tree: SyllabusSubject[]): void {
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_TREE, JSON.stringify(tree));
  }

  static resetSyllabusToDefault(): SyllabusSubject[] {
    localStorage.removeItem(STORAGE_KEYS.SYLLABUS_TREE);
    return INITIAL_SYLLABUS_TREE;
  }

  static addSubject(subject: SyllabusSubject): void {
    const tree = this.getSyllabusTree();
    tree.push(subject);
    this.saveSyllabusTree(tree);
    this.logAdminAction('CREATE_SUBJECT', 'Syllabus', `Added subject: ${subject.name} (${subject.code})`);
  }

  static updateSubject(updated: SyllabusSubject): void {
    const tree = this.getSyllabusTree();
    const index = tree.findIndex((s) => s.id === updated.id);
    if (index !== -1) {
      tree[index] = updated;
      this.saveSyllabusTree(tree);
      this.logAdminAction('UPDATE_SUBJECT', 'Syllabus', `Updated subject: ${updated.name}`);
    }
  }

  static toggleSubjectActive(subjectId: string): void {
    const tree = this.getSyllabusTree();
    const subject = tree.find((s) => s.id === subjectId);
    if (subject) {
      subject.isActive = !subject.isActive;
      this.saveSyllabusTree(tree);
      this.logAdminAction(
        'TOGGLE_SUBJECT',
        'Syllabus',
        `${subject.isActive ? 'Activated' : 'Deactivated'} subject: ${subject.name}`
      );
    }
  }

  static reorderSubject(subjectId: string, direction: 'up' | 'down'): void {
    const tree = this.getSyllabusTree();
    const index = tree.findIndex((s) => s.id === subjectId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < tree.length) {
      const temp = tree[index];
      tree[index] = tree[targetIndex];
      tree[targetIndex] = temp;
      // Reassign orders
      tree.forEach((s, idx) => {
        s.order = idx + 1;
      });
      this.saveSyllabusTree(tree);
    }
  }

  static addTopic(subjectId: string, moduleId: string, topic: SyllabusTopic): void {
    const tree = this.getSyllabusTree();
    const subject = tree.find((s) => s.id === subjectId);
    if (!subject) return;

    let targetModule = subject.modules.find((m) => m.id === moduleId);
    if (!targetModule && subject.modules.length > 0) {
      targetModule = subject.modules[0];
    }
    if (targetModule) {
      targetModule.topics.push(topic);
      this.saveSyllabusTree(tree);
      this.logAdminAction('CREATE_TOPIC', 'Syllabus', `Added topic ${topic.title} to ${subject.name}`);
    }
  }

  static updateTopic(subjectId: string, moduleId: string, topic: SyllabusTopic): void {
    const tree = this.getSyllabusTree();
    const subject = tree.find((s) => s.id === subjectId);
    if (!subject) return;

    for (const mod of subject.modules) {
      const topicIndex = mod.topics.findIndex((t) => t.id === topic.id);
      if (topicIndex !== -1) {
        mod.topics[topicIndex] = topic;
        this.saveSyllabusTree(tree);
        this.logAdminAction('UPDATE_TOPIC', 'Syllabus', `Updated topic: ${topic.title}`);
        return;
      }
    }
  }

  static toggleTopicActive(subjectId: string, topicId: string): void {
    const tree = this.getSyllabusTree();
    const subject = tree.find((s) => s.id === subjectId);
    if (!subject) return;

    for (const mod of subject.modules) {
      const topic = mod.topics.find((t) => t.id === topicId);
      if (topic) {
        topic.isActive = !topic.isActive;
        this.saveSyllabusTree(tree);
        return;
      }
    }
  }

  static reorderTopic(subjectId: string, moduleId: string, topicId: string, direction: 'up' | 'down'): void {
    const tree = this.getSyllabusTree();
    const subject = tree.find((s) => s.id === subjectId);
    if (!subject) return;
    const mod = subject.modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const index = mod.topics.findIndex((t) => t.id === topicId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < mod.topics.length) {
      const temp = mod.topics[index];
      mod.topics[index] = mod.topics[targetIndex];
      mod.topics[targetIndex] = temp;
      mod.topics.forEach((t, idx) => {
        t.order = idx + 1;
      });
      this.saveSyllabusTree(tree);
    }
  }

  // Topic Progress Tracking
  static getTopicProgressMap(): Record<string, TopicProgress> {
    const saved = localStorage.getItem(STORAGE_KEYS.TOPIC_PROGRESS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default seed progress for demonstration
    return {
      'top-som-101': {
        topicId: 'top-som-101',
        status: 'mastered',
        questionsAttempted: 24,
        questionsCorrect: 22,
        isBookmarked: true,
        lastRevisedDate: '2025-02-12',
      },
      'top-rcc-101': {
        topicId: 'top-rcc-101',
        status: 'in_progress',
        questionsAttempted: 18,
        questionsCorrect: 14,
        isBookmarked: true,
        lastRevisedDate: '2025-02-14',
      },
      'top-sm-101': {
        topicId: 'top-sm-101',
        status: 'in_progress',
        questionsAttempted: 15,
        questionsCorrect: 12,
        isBookmarked: false,
        lastRevisedDate: '2025-02-10',
      },
      'top-te-101': {
        topicId: 'top-te-101',
        status: 'needs_revision',
        questionsAttempted: 12,
        questionsCorrect: 7,
        isBookmarked: true,
        lastRevisedDate: '2025-02-08',
      },
      'top-bmc-101': {
        topicId: 'top-bmc-101',
        status: 'mastered',
        questionsAttempted: 30,
        questionsCorrect: 28,
        isBookmarked: false,
        lastRevisedDate: '2025-02-15',
      },
    };
  }

  static saveTopicProgressMap(map: Record<string, TopicProgress>): void {
    localStorage.setItem(STORAGE_KEYS.TOPIC_PROGRESS, JSON.stringify(map));
  }

  static setTopicRevisionStatus(topicId: string, status: TopicRevisionStatus, notes?: string): void {
    const map = this.getTopicProgressMap();
    const current = map[topicId] || {
      topicId,
      status: 'not_started',
      questionsAttempted: 0,
      questionsCorrect: 0,
      isBookmarked: false,
    };
    current.status = status;
    current.lastRevisedDate = new Date().toISOString().split('T')[0];
    if (notes !== undefined) {
      current.notes = notes;
    }
    map[topicId] = current;
    this.saveTopicProgressMap(map);
  }

  static toggleTopicBookmark(topicId: string): boolean {
    const map = this.getTopicProgressMap();
    const current = map[topicId] || {
      topicId,
      status: 'not_started',
      questionsAttempted: 0,
      questionsCorrect: 0,
      isBookmarked: false,
    };
    current.isBookmarked = !current.isBookmarked;
    map[topicId] = current;
    this.saveTopicProgressMap(map);
    return current.isBookmarked;
  }

  // ==========================================
  // 7-TIER SCALABLE SYLLABUS METHODS
  // Exam → Paper → Subject → Unit → Topic → Subtopic → Concept
  // ==========================================

  static getCanonicalSubjects(): CanonicalSubject[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CANONICAL_SUBJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CANONICAL_SUBJECTS, JSON.stringify(INITIAL_CANONICAL_SUBJECTS));
      return INITIAL_CANONICAL_SUBJECTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CANONICAL_SUBJECTS;
    }
  }

  static saveCanonicalSubjects(subjects: CanonicalSubject[]): void {
    localStorage.setItem(STORAGE_KEYS.CANONICAL_SUBJECTS, JSON.stringify(subjects));
  }

  static getExamsHierarchy(): CivilExamHierarchyProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS_HIERARCHY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAMS_HIERARCHY, JSON.stringify(INITIAL_EXAMS_HIERARCHY));
      return INITIAL_EXAMS_HIERARCHY;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXAMS_HIERARCHY;
    }
  }

  static saveExamsHierarchy(exams: CivilExamHierarchyProfile[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAMS_HIERARCHY, JSON.stringify(exams));
  }

  static getExamMappings(): ExamSyllabusMapping[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_MAPPINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAM_MAPPINGS, JSON.stringify(INITIAL_EXAM_MAPPINGS));
      return INITIAL_EXAM_MAPPINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXAM_MAPPINGS;
    }
  }

  static saveExamMappings(mappings: ExamSyllabusMapping[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAM_MAPPINGS, JSON.stringify(mappings));
  }

  static getSyllabusVersion(): string {
    return localStorage.getItem(STORAGE_KEYS.SYLLABUS_VERSION) || '2026.1';
  }

  static getSyllabusAuditLogs(): SyllabusAuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SYLLABUS_AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SYLLABUS_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  static recordSyllabusAudit(entry: Omit<SyllabusAuditLog, 'id' | 'timestamp' | 'version'>): void {
    const logs = this.getSyllabusAuditLogs();
    const version = this.getSyllabusVersion();
    const newLog: SyllabusAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      version,
      ...entry,
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
  }

  static upsertConcept(conceptData: Partial<SyllabusConcept>, actorEmail: string = 'admin@engineeringofficer.in'): SyllabusConcept | null {
    const subjects = this.getCanonicalSubjects();
    const isNew = !conceptData.id;
    const conceptId = conceptData.id || `con-${Date.now()}`;
    let savedConcept: SyllabusConcept | null = null;

    for (const subj of subjects) {
      for (const unit of subj.units) {
        for (const topic of unit.topics) {
          for (const subtopic of topic.subtopics) {
            if (subtopic.id === conceptData.subtopicId || subtopic.concepts.some((c) => c.id === conceptId)) {
              const existingIdx = subtopic.concepts.findIndex((c) => c.id === conceptId);
              const concept: SyllabusConcept = {
                id: conceptId,
                subtopicId: subtopic.id,
                topicId: topic.id,
                name: conceptData.name || 'New Concept',
                code: conceptData.code || `CON-${subj.code.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
                explanation: conceptData.explanation || '',
                keyFormula: conceptData.keyFormula,
                isCodeClause: conceptData.isCodeClause,
                importance: conceptData.importance || 'High',
                commonTrap: conceptData.commonTrap,
                order: conceptData.order || (subtopic.concepts.length + 1),
                tags: conceptData.tags || [],
                lastUpdated: new Date().toISOString().split('T')[0],
              };

              if (existingIdx >= 0) {
                subtopic.concepts[existingIdx] = concept;
              } else {
                subtopic.concepts.push(concept);
              }
              savedConcept = concept;
              break;
            }
          }
          if (savedConcept) break;
        }
        if (savedConcept) break;
      }
      if (savedConcept) break;
    }

    if (savedConcept) {
      this.saveCanonicalSubjects(subjects);
      this.recordSyllabusAudit({
        actor: actorEmail,
        action: isNew ? 'CREATE' : 'UPDATE',
        entityType: 'Concept',
        entityId: savedConcept.id,
        entityName: savedConcept.name,
        changeSummary: `${isNew ? 'Created' : 'Updated'} concept: ${savedConcept.name} (${savedConcept.isCodeClause || 'Civil Standard'}).`,
      });
    }

    return savedConcept;
  }

  static updateExamMapping(mappingData: Partial<ExamSyllabusMapping>, actorEmail: string = 'admin@engineeringofficer.in'): ExamSyllabusMapping {
    const mappings = this.getExamMappings();
    let mapping = mappings.find((m) => m.id === mappingData.id);

    if (!mapping) {
      mapping = {
        id: mappingData.id || `map-${Date.now()}`,
        examId: mappingData.examId || 'maha_pwd',
        paperId: mappingData.paperId || 'pwd-p1',
        subjectId: mappingData.subjectId || 'rcc',
        inclusionStatus: mappingData.inclusionStatus || 'core_compulsory',
        examWeightagePercent: mappingData.examWeightagePercent || 15,
        depthLevel: mappingData.depthLevel || 'diploma_je',
        examSpecificNotes: mappingData.examSpecificNotes || '',
        pyqFrequencyText: mappingData.pyqFrequencyText || 'Regular',
        lastAuditedDate: new Date().toISOString().split('T')[0],
      };
      mappings.push(mapping);
    } else {
      mapping.inclusionStatus = mappingData.inclusionStatus || mapping.inclusionStatus;
      mapping.examWeightagePercent = mappingData.examWeightagePercent ?? mapping.examWeightagePercent;
      mapping.depthLevel = mappingData.depthLevel || mapping.depthLevel;
      mapping.examSpecificNotes = mappingData.examSpecificNotes ?? mapping.examSpecificNotes;
      mapping.pyqFrequencyText = mappingData.pyqFrequencyText ?? mapping.pyqFrequencyText;
      mapping.lastAuditedDate = new Date().toISOString().split('T')[0];
    }

    this.saveExamMappings(mappings);
    this.recordSyllabusAudit({
      actor: actorEmail,
      action: 'MAPPING_UPDATE',
      entityType: 'Mapping',
      entityId: mapping.id,
      entityName: `${mapping.examId} -> ${mapping.subjectId}`,
      changeSummary: `Adjusted exam mapping weightage to ${mapping.examWeightagePercent}% (${mapping.depthLevel}).`,
    });

    return mapping;
  }

  static publishSyllabusVersion(newVersion: string, releaseNotes: string, actorEmail: string = 'admin@engineeringofficer.in'): void {
    const oldVersion = this.getSyllabusVersion();
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_VERSION, newVersion);

    this.recordSyllabusAudit({
      actor: actorEmail,
      action: 'PUBLISH_VERSION',
      entityType: 'Exam',
      entityId: 'global',
      entityName: `Syllabus Release ${newVersion}`,
      changeSummary: `Promoted syllabus version from ${oldVersion} to ${newVersion}: ${releaseNotes}`,
      previousValue: oldVersion,
      newValue: newVersion,
    });
  }
}
