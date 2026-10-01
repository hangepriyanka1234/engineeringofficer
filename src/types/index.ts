export type ExamTargetId =
  | 'upsc_ese'
  | 'ssc_je'
  | 'rrb_je'
  | 'mpsc_civil'
  | 'maha_pwd'
  | 'zp_civil'
  | 'bmc_municipal'
  | 'mjp_civil'
  | 'wrd_irrigation'
  | 'rdd_engineering'
  | 'urban_dev_tp'
  | 'housing_infra'
  | 'road_transport'
  | 'state_je_ae'
  | 'psu_central'
  | 'maha_cea'
  | 'mahatransco_civil'
  | string;

export interface ExamCatalogueItem {
  id: ExamTargetId | string;
  name: string;
  shortName: string;
  organization?: string;
  department?: string;
  authority: string;
  level: 'Central' | 'State' | 'Local Body' | 'PSU';
  qualification?: string;
  eligibilityType?: 'Diploma Only' | 'Degree Only' | 'Both Diploma & Degree';
  diplomaEligible?: boolean;
  degreeEligible?: boolean;
  experience?: string;
  ageRules?: string;
  categoryNotes?: string;
  stages?: string[];
  paperPattern?: string;
  subjects?: string[];
  negativeMarking?: string;
  questionCount?: number;
  duration?: string;
  syllabus?: string;
  selectionProcess?: string;
  applicationDates?: string;
  examDate?: string;
  admitCardDate?: string;
  resultDate?: string;
  officialNotificationUrl?: string;
  officialApplicationUrl?: string;
  status?: 'Active' | 'Upcoming' | 'Answer Key Out' | 'Result Declared' | 'Archived';
  lastVerifiedDate?: string;
  adminNotes?: string;
  officialSource?: string;
  officialWebsite?: string;
  districtOrState?: string;
  eligibility?: string;
  frequencyNote?: string;
  iconName?: string;
  activeRecruitmentsCount?: number;
  totalQuestions?: number;
  isActive?: boolean;
  isArchived?: boolean;
  cadre?: string;
  verifiedBy?: string;
  minAge?: number;
  maxAge?: number;
  papers?: ExamPaperConfig[];
  syllabusMappings?: ExamSubjectMappingConfig[];
  questionTypes?: string[];
}

export interface ExamPaperConfig {
  id: string;
  paperNumber: number;
  paperName: string;
  code: string;
  totalMarks: number;
  durationMinutes: number;
  negativeMarking: string;
  negativeMarksPerQuestion?: number;
  marksPerQuestion?: number;
  pattern: 'Objective CBT' | 'Conventional / Written' | 'Mixed';
  questionType: 'standard_mcq' | 'multiple_choice' | 'numerical' | 'assertion_reason' | 'mixed';
  subjectIds: string[];
}

export interface ExamSubjectMappingConfig {
  subjectId: string;
  subjectName: string;
  weightagePercent: number;
  depthLevel: 'diploma_je' | 'degree_ae' | 'advanced_ese';
  inclusionStatus: 'core_compulsory' | 'specialized_heavy' | 'basic_overview' | 'excluded';
  examSpecificNotes?: string;
  pyqFrequencyText?: string;
}

export interface MultiExamAnalysisResult {
  selectedExams: ExamProfile[];
  overlapPercentage: number;
  universalCoreSubjects: {
    subjectId: string;
    subjectName: string;
    averageWeightage: number;
    appearsInExamIds: string[];
    isCodes: string[];
    importance: 'Critical' | 'High' | 'Medium';
    summary: string;
  }[];
  differentialSubjects: {
    examId: string;
    examShortName: string;
    subjectId: string;
    subjectName: string;
    weightage: number;
    depthLevel: string;
    strategicNote: string;
    isUniqueToThisExam: boolean;
  }[];
  patternComparison: {
    examId: string;
    shortName: string;
    totalMarks: number;
    duration: string;
    negativeMarking: string;
    questionCount: number;
    qualification: string;
    diplomaAllowed: boolean;
    degreeAllowed: boolean;
    officialSource: string;
    conductingBody: string;
  }[];
  unifiedStrategy: {
    recommendedCoreRatio: number;
    recommendedDifferentialRatio: number;
    dailyQuestionGoal: number;
    coreDailyQuestions: number;
    diffDailyQuestions: number;
    keyActionItems: string[];
  };
  timelineMilestones: {
    examId: string;
    examShortName: string;
    event: string;
    date: string;
    status: 'Upcoming' | 'Active' | 'Expected';
    daysRemaining?: number;
  }[];
}

export type ExamProfile = ExamCatalogueItem;

export type SubjectId =
  | 'engg_maths'
  | 'engg_mechanics'
  | 'som'
  | 'structural_analysis'
  | 'building_materials'
  | 'concrete_tech'
  | 'rcc_concrete'
  | 'steel_structures'
  | 'soil_mechanics'
  | 'foundation_engg'
  | 'fluid_mechanics'
  | 'hydraulics'
  | 'hydrology'
  | 'irrigation_engg'
  | 'environmental'
  | 'transportation'
  | 'surveying'
  | 'estimating_costing'
  | 'cpm_pert'
  | 'engg_geology'
  | 'general_studies'
  | 'geotechnical'
  | 'hydrology_irrigation'
  | 'town_planning'
  | string;

export type SubjectCategory =
  | 'Engineering Sciences'
  | 'Structural Engineering'
  | 'Geotechnical & Water Resources'
  | 'Infrastructure & Surveying'
  | 'Management & Valuation'
  | 'General Studies & Aptitude';

export interface SubjectItem {
  id: SubjectId;
  name: string;
  code: string;
  weightagePercent: number;
  icon: string;
  description: string;
  topicsCount: number;
  questionCount: number;
  isCodesRelevant: string[];
  category?: SubjectCategory;
  order?: number;
  isActive?: boolean;
}

export interface TopicItem {
  id: string;
  subjectId: SubjectId;
  name: string;
  weightage: 'High' | 'Medium' | 'Low';
  questionCount: number;
}

// Full Data-Driven Syllabus Tree Types
export type TopicRevisionStatus =
  | 'not_started'
  | 'in_progress'
  | 'mastered'
  | 'needs_revision';

// ==========================================
// 7-LEVEL SCALABLE SYLLABUS HIERARCHY
// Exam → Paper → Subject → Unit → Topic → Subtopic → Concept
// ==========================================

// Level 7: Concept
export interface SyllabusConcept {
  id: string;
  subtopicId: string;
  topicId?: string;
  name: string;
  code?: string; // e.g. "CON-RCC-001"
  explanation: string;
  keyFormula?: string;
  isCodeClause?: string; // e.g. "IS 456:2000 Cl. 38.1"
  importance: 'Very High' | 'High' | 'Medium' | 'Low';
  commonTrap?: string;
  order: number;
  tags?: string[];
  lastUpdated?: string;
}

// Level 6: Subtopic
export interface SyllabusSubtopic {
  id: string;
  topicId: string;
  title: string;
  order: number;
  concepts: SyllabusConcept[];
  pyqNotes?: string;
}

// Level 5: Topic
export interface CanonicalTopic {
  id: string;
  unitId: string;
  title: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  importance: 'Very High' | 'High' | 'Medium' | 'Low';
  subtopics: SyllabusSubtopic[];
  keyFormulas?: string[];
  isCodes?: string[];
  pyqFrequency?: string;
  estimatedHours?: number;
  questionCount?: number;
}

// Level 4: Unit
export interface CanonicalUnit {
  id: string;
  subjectId: string;
  title: string;
  unitNumber: number;
  order: number;
  description?: string;
  topics: CanonicalTopic[];
}

// Level 3: Subject
export interface CanonicalSubject {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  category: SubjectCategory;
  standardISCodes: string[];
  order: number;
  description: string;
  units: CanonicalUnit[];
}

// Level 2: Paper
export interface ExamPaper {
  id: string;
  examId: string;
  paperNumber: number;
  paperName: string; // e.g. "Paper-I: Civil Engineering Technical (Objective)"
  code: string;
  totalMarks: number;
  durationMinutes: number;
  negativeMarking: string;
  pattern: 'Objective CBT' | 'Conventional / Written' | 'Mixed';
  subjectIds: string[]; // references CanonicalSubject
}

// Level 1: Exam
export interface CivilExamHierarchyProfile {
  id: string; // e.g. 'ese_civil', 'ssc_je', 'rrb_je', 'mpsc_mes', 'maha_pwd', 'zp_civil', 'bmc_sub_engg', 'mjp_civil', 'wrd_civil', 'urban_rural_dev'
  name: string;
  shortName: string;
  conductingBody: string;
  cadre: string;
  category: 'National' | 'Maharashtra State' | 'Local Body / Municipal' | 'Irrigation / PSU';
  papers: ExamPaper[];
  syllabusVersion: string;
  officialNotificationCode?: string;
}

// Exam-Specific Syllabus Mapping (Reuse across exams with exam-specific depth & weightage)
export interface ExamSyllabusMapping {
  id: string;
  examId: string;
  paperId: string;
  subjectId: string;
  unitId?: string;
  topicId?: string;
  inclusionStatus: 'core_compulsory' | 'specialized_heavy' | 'basic_overview' | 'excluded';
  examWeightagePercent: number;
  depthLevel: 'diploma_je' | 'degree_ae' | 'advanced_ese';
  examSpecificNotes: string;
  pyqFrequencyText: string;
  lastAuditedDate: string;
}

// Auditing & Version Management
export interface SyllabusAuditLog {
  id: string;
  timestamp: string;
  version: string;
  actor: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'MAPPING_UPDATE' | 'PUBLISH_VERSION' | 'ROLLBACK';
  entityType: 'Exam' | 'Paper' | 'Subject' | 'Unit' | 'Topic' | 'Subtopic' | 'Concept' | 'Mapping';
  entityId: string;
  entityName: string;
  changeSummary: string;
  previousValue?: string;
  newValue?: string;
}

export interface SyllabusVersionMeta {
  version: string;
  publishedAt: string;
  publishedBy: string;
  notes: string;
  active: boolean;
}

export interface SyllabusTopic {
  id: string;
  subjectId: string;
  moduleId?: string;
  title: string;
  subtopics: string[];
  examTargetIds: ExamTargetId[];
  difficulty: 'easy' | 'medium' | 'hard';
  importance: 'Very High' | 'High' | 'Medium' | 'Low';
  order: number;
  isActive: boolean;
  questionCount: number;
  keyFormulas?: string[];
  isCodes?: string[];
  pyqFrequency?: string; // e.g. "Every Shift (1-2 Qs)"
}

export interface SyllabusModule {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  isActive: boolean;
  topics: SyllabusTopic[];
}

export interface SyllabusSubject {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  category: SubjectCategory;
  order: number;
  isActive: boolean;
  description: string;
  icon: string;
  isCodesRelevant: string[];
  weightagePercent: number;
  examTargetIds: ExamTargetId[];
  modules: SyllabusModule[];
}

export interface TopicProgress {
  topicId: string;
  status: TopicRevisionStatus;
  questionsAttempted: number;
  questionsCorrect: number;
  notes?: string;
  lastRevisedDate?: string;
  isBookmarked?: boolean;
}

export type QuestionType =
  | 'standard_mcq'
  | 'numerical'
  | 'assertion_reason'
  | 'match_the_following'
  | 'statement_based'
  | 'diagram_based'
  | 'is_code_clause'
  | 'formula'
  | 'theoretical';

export type PracticeMode =
  | 'topic'
  | 'subject'
  | 'exam_specific'
  | 'mixed'
  | 'weak_topic'
  | 'revision'
  | 'pyq'
  | 'incorrect_only'
  | 'bookmarked'
  | 'daily_challenge'
  | 'Topic'
  | 'Subject'
  | 'Exam-specific'
  | 'Mixed'
  | 'Weak-topic'
  | 'Revision'
  | 'PYQ'
  | 'Incorrect-only'
  | 'Bookmarked'
  | 'Daily Challenge';

export interface QuestionReport {
  id: string;
  questionId: string;
  questionStem: string;
  category: 'wrong_answer' | 'ambiguity' | 'outdated_code' | 'typo' | 'explanation_issue';
  comment: string;
  userEmail?: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminResolution?: string;
}

export interface QuestionTranslation {
  stem: string;
  options: string[];
  explanation?: string;
  notes?: string;
  isOfficial?: boolean;
}

export interface QuestionProvenance {
  source: string; // e.g., 'MPSC MES 2022 Paper-I Q.42', 'SSC JE 2023', 'IS 456:2000'
  examName?: string;
  conductingBody?: string; // 'MPSC', 'SSC', 'RRB', 'Maha PWD', 'UPSC', 'WRD', 'BMC', 'ZP'
  paper?: string;
  year?: number;
  questionNumber?: number | string;
  officialNotificationRef?: string;
  verifiedFromOfficialKey: boolean;
}

export interface QuestionVersionMetadata {
  version: string;
  lastReviewedAt: string;
  reviewer: string;
  reviewerCredentials?: string;
  status: 'draft' | 'reviewed' | 'approved' | 'published';
  changelog?: string;
}

export interface PracticeSessionConfig {
  sessionId?: string;
  mode: PracticeMode;
  subjectId?: string;
  topicId?: string;
  subtopic?: string;
  examTargetId?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  language?: 'English' | 'Marathi' | 'Hindi' | 'all';
  limit?: number;
  pageSize?: number;
  instantFeedback: boolean; // false = Exam Simulation Mode
  timed: boolean;
  timeLimitMinutes?: number;
  perQuestionTimerSeconds?: number;
}

export interface PracticeEvaluationResult {
  sessionId?: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  timeSpentSeconds: number;
  averageTimePerQuestion: number;
  subjectBreakdown: Record<string, { attempted: number; correct: number; total: number; score: number }>;
  results: {
    questionId: string;
    userAnswer: number | string | null;
    correctOption: number;
    correctAnswer: number | string;
    isCorrect: boolean;
    marksAwarded: number;
    explanation: string;
    isCodeReference?: string;
    formula?: string;
    whyOtherOptionsAreWrong?: Record<string, string> | string[];
    commonTraps?: string;
    calculationSteps?: string[];
  }[];
}

export interface Question {
  id: string;
  questionId?: string; // Standard alias for id
  examTags?: string[]; // e.g. ['MPSC MES 2023', 'Maha PWD JE', 'SSC JE']
  examTargetIds: ExamTargetId[];
  subjectId: SubjectId;
  subject?: string;
  chapter?: string;
  topic?: string;
  topicId?: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: QuestionType;
  stem?: string; // The primary problem statement
  text: string; // Backwards-compatible alias for stem
  options: string[]; // Options array (A, B, C, D)
  correctAnswer?: number | string; // Correct option index (0-3) or numerical value/string
  correctOption: number; // Backwards-compatible numeric index (0-3)
  explanation: string;
  whyOtherOptionsAreWrong?: Record<string, string> | string[]; // Detailed breakdown why each distractor is wrong
  commonTraps?: string; // Common exam pitfall / trick
  formula?: string;
  formulaUsed?: string;
  unit?: string; // Physical unit e.g. 'kN/m', 'N/mm²', 'mm', 'MPa'
  source?: string; // Official paper, book, or board reference
  reference?: string; // Source/reference
  year?: number;
  exam?: string;
  language?: 'English' | 'Marathi' | 'Hindi' | 'Bilingual';
  imageDiagram?: string; // Diagram/image URL or SVG code
  diagramSvg?: string; // Inline SVG markup for crisp rendering
  marks?: number; // Default 2 or 1
  negativeMarks?: number; // e.g. 0.5 or 0.25
  status?: 'draft' | 'reviewed' | 'approved' | 'published' | 'archived';
  reviewer?: string; // e.g. 'Prof. S. Patil (M.Tech Structural, SP Faculty)'
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
  // Codal metadata - strictly authentic standard references
  isCodeReference?: string; // e.g. 'IS 456:2000 Cl. 26.5.1.1'
  codeVersion?: string; // e.g. 'IS 456:2000 (Reaffirmed 2021)'

  // Multilingual, Provenance & Version Control (Production Grade)
  translations?: {
    mr?: QuestionTranslation;
    hi?: QuestionTranslation;
    [lang: string]: QuestionTranslation | undefined;
  };
  provenance?: QuestionProvenance;
  versionMetadata?: QuestionVersionMetadata;
  isStripped?: boolean; // When true, answer key and explanation were withheld by server (exam-simulation mode)

  // Specialized Question Type Data
  numericalTolerance?: number; // Tolerance for NAT questions (e.g. ±0.05)
  numericalRange?: { min: number; max: number };
  assertion?: string; // For Assertion-Reason questions
  reason?: string; // For Assertion-Reason questions
  matchList1?: { label: string; text: string }[]; // For Match-the-following
  matchList2?: { label: string; text: string }[]; // For Match-the-following
  statements?: string[]; // For Statement-based questions (1, 2, 3...)
  calculationSteps?: string[];
  previousExamTags?: string[];
}

export type MockTestCategory =
  | 'full_ese'
  | 'ssc_je_full'
  | 'rrb_je_full'
  | 'mpsc_mes_full'
  | 'maha_pwd_full'
  | 'zp_local_full'
  | 'bmc_corp_full'
  | 'mjp_wrd_full'
  | 'custom_admin'
  | 'subject_test'
  | 'chapter_test'
  | 'mini_test'
  | 'pyq_replica';

export type NegativeMarkingScheme = 'none' | 'one_third' | 'one_fourth' | 'custom';

export interface TestSection {
  id: string;
  name: string;
  description?: string;
  questionIds: string[];
  durationMinutes?: number; // Optional section timing
  marksPerQuestion?: number;
  negativeMarksPerQuestion?: number;
}

export interface IncompleteTestSession {
  testId: string;
  testTitle: string;
  startedAt: string;
  serverSessionId?: string;
  timeRemainingSeconds: number;
  answers: Record<string, number | string | null>;
  markedForReview: Record<string, boolean>;
  currentQuestionIdx: number;
  currentSectionId?: string;
  tabSwitchWarnings: number;
  lastUpdated: string;
}

export interface BenchmarkCohort {
  testId: string;
  totalCandidates: number;
  averageScore: number;
  medianScore: number;
  highestScore: number;
  passingPercentage: number;
  scoreDistribution: {
    percentile: number;
    minScore: number;
  }[];
}

export type MockTestType = 'full_length' | 'sectional' | 'subject' | 'topic' | 'custom';

export interface MockAttemptPolicy {
  maxAttempts?: number;
  allowRetakes?: boolean;
  cooldownHours?: number;
  randomizeQuestions?: boolean;
  shuffleOptions?: boolean;
  allowSectionSwitching?: boolean;
  allowReview?: boolean;
}

export interface MockSectionRules {
  enforceSectionOrder?: boolean;
  enforceSectionTimeLimit?: boolean;
  lockSubmittedSections?: boolean;
  allowSectionSwitching?: boolean;
}

export interface MockTest {
  id: string;
  title: string;
  examTargetId: ExamTargetId;
  mockCategory?: MockTestCategory;
  mockType?: MockTestType;
  subjectId?: SubjectId;
  topicId?: string;
  topicName?: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: number; // Ratio e.g. 0.25 (25%), 0.333 (33.3%), 0 (no negative)
  negativeMarkingScheme?: NegativeMarkingScheme;
  marksPerQuestion?: number;
  negativeMarksPerQuestion?: number;
  passingScore: number;
  questionIds: string[];
  sections?: TestSection[];
  hasSectionTiming?: boolean;
  randomizeQuestions?: boolean;
  attemptPolicy?: MockAttemptPolicy;
  sectionRules?: MockSectionRules;
  difficulty: 'Standard' | 'Advanced' | 'PYQ Replica';
  isFree: boolean;
  requiredTier?: 'Free Starter' | 'Blueprint Pro JE' | 'Officer Master AE/IES';
  totalAttempts: number;
  avgScore: number;
  createdAt: string;
  instructions: string[];
  cohortBenchmark?: BenchmarkCohort;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  examTargetId: ExamTargetId;
  date: string;
  durationSpentSeconds: number;
  avgTimePerQuestionSeconds?: number;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  totalMarks: number;
  negativeMarkLoss?: number;
  accuracy: number;
  percentile: number;
  cohortRank?: number;
  cohortTotal?: number;
  serverVerified?: boolean;
  verificationSignature?: string;
  userAnswers: Record<string, number | string | null>;
  subjectBreakdown: Record<string, { correct: number; total: number; wrong?: number; score?: number }>;
  topicBreakdown?: Record<string, { correct: number; total: number }>;
  difficultyBreakdown?: Record<string, { correct: number; wrong: number; total: number }>;
  sectionBreakdown?: Record<string, { name: string; attempted: number; correct: number; wrong: number; score: number; total: number }>;
  flaggedQuestionIds: string[];
}

export interface PYQPaper {
  id: string;
  examTargetId: ExamTargetId;
  title: string;
  year: number;
  shift?: string;
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  pdfUrl?: string;
  hasCbtMode: boolean;
  questionIds: string[];
  conductingBody?: string;
  officialBookletSeries?: string[];
  officialGazetteNotice?: string;
  cutoffScore?: number;
  categoryCutoffs?: {
    open: number;
    obc: number;
    ews: number;
    sc: number;
    st: number;
    female: number;
  };
  negativeMarkRatio?: number;
  marksPerQuestion?: number;
  subjectBreakdown?: { subject: string; count: number }[];
  officialInstructions?: string[];
  keyHighlights?: string[];
  isLatestPattern?: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subjectId: SubjectId;
  type: 'formula_sheet' | 'is_code_summary' | 'short_notes' | 'standard_chart' | 'ebook' | 'topper_handwritten_notes' | 'mindmap';
  pages: number;
  fileSize: string;
  isFree: boolean;
  highlights: string[];
  downloadCount: number;
  publishedDate: string;
  contentMarkdown?: string;
  author?: string;
  fileUrl?: string;
  readTimeMinutes?: number;
  chapters?: {
    id: string;
    title: string;
    page: number;
    summary: string;
    content?: string;
    formulas?: string[];
  }[];
}

export interface RecruitmentNotice {
  id: string;
  examTargetId: ExamTargetId | string;
  deptName: string;
  postName: string;
  organization?: string;
  advtNumber?: string;
  advertisementNumber?: string;
  totalVacancies: number;
  eligibility: string | string[];
  eligibilityType?: 'Diploma Only' | 'Degree Only' | 'Both Diploma & Degree';
  diplomaEligible?: boolean;
  degreeEligible?: boolean;
  experience?: string;
  ageLimit: string;
  ageRules?: string;
  categoryNotes?: string;
  stages?: string[];
  paperPattern?: string;
  subjectsCovered?: string[];
  negativeMarking?: string;
  questionCount?: number;
  duration?: string;
  syllabusSummary?: string;
  selectionProcess?: string;
  applyStartDate?: string;
  applyEndDate?: string;
  examDate?: string;
  examDateEstimated?: string;
  admitCardDate?: string;
  resultDate?: string;
  officialNotificationUrl?: string;
  pdfNotificationUrl?: string;
  officialPdfUrl?: string;
  applyUrl?: string;
  applyOnlineUrl?: string;
  officialSource?: string; // Official source
  status: 'Active' | 'Upcoming' | 'Answer Key Out' | 'Result Declared' | 'Archived';
  salaryScale?: string;
  lastVerifiedDate?: string;
  verifiedByAdmin?: boolean;
  notes?: string;
  adminNotes?: string;
  districtOrState?: string;
  isArchived?: boolean;
}

export interface VideoLecture {
  id: string;
  title: string;
  subjectId: SubjectId;
  instructor?: string;
  facultyName?: string;
  duration: string;
  embedUrl: string;
  thumbnailUrl: string;
  isFree: boolean;
  viewsCount?: number;
  views?: number;
  keyConcepts?: string[];
}

export type MistakeReasonTag =
  | 'concept_gap'
  | 'formula_error'
  | 'calculation_error'
  | 'unit_error'
  | 'misread'
  | 'guess'
  | 'time_pressure'
  | 'code_standard_confusion'
  | 'factual_recall'
  // Backwards-compatibility aliases
  | 'conceptual_gap'
  | 'missed_is_code'
  | 'silly_mistake'
  | 'misread_question';

export interface MistakeHistoryEvent {
  date: string;
  action: 'logged' | 'reviewed' | 'retested' | 'mastered' | 'unmastered' | 'note_updated' | 'tag_updated';
  selectedOption?: number;
  isCorrect?: boolean;
  notes?: string;
}

export interface MistakeEntry {
  id: string;
  questionId: string;
  question: Question;
  selectedOption: number;
  correctOption: number;
  mistakeReason: MistakeReasonTag;
  reasonTag: MistakeReasonTag;
  userNotes: string;
  dateLogged: string;
  loggedAt?: string;
  resolved: boolean; // Mastered flag
  masteredAt?: string;
  reviewCount: number;
  nextRevisionDate?: string; // YYYY-MM-DD for spaced revision queue
  spacedIntervalStage?: number; // 0=new (1 day), 1=3 days, 2=7 days, 3=14 days, 4=30 days
  history?: MistakeHistoryEvent[];
}

export type MistakeLog = MistakeEntry;

export interface DailyStudyTask {
  id: string;
  title: string;
  category: 'practice' | 'revision' | 'pyq' | 'mock_test' | 'is_codes';
  allocatedMinutes: number;
  subjectId?: SubjectId;
  subjectName?: string;
  topicName?: string;
  targetCount?: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  remedialReason?: string;
}

export interface StudentStudyPlan {
  id: string;
  targetExamId: ExamTargetId;
  targetExamName: string;
  targetExamDate: string; // YYYY-MM-DD
  startDate: string;
  dailyHours: number; // e.g. 4 hours
  timeAllocation: {
    practicePercent: number; // e.g. 40%
    revisionPercent: number; // e.g. 25%
    pyqPercent: number; // e.g. 20%
    mockPercent: number; // e.g. 15%
  };
  adaptiveFocusSubjects: {
    subjectName: string;
    subjectId: string;
    reason: string;
    priorityMultiplier: number;
  }[];
  dailyTasks: DailyStudyTask[];
  weeklyMilestones: {
    weekNumber: number;
    title: string;
    subjects: string[];
    targetQuestions: number;
    completed: boolean;
  }[];
  syllabusCoveragePercent: number;
  lastAdaptedAt?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  passingYear?: string;
  graduationYear?: string | number;
  targetExams: ExamTargetId[];
  subscriptionTier: 'Free Starter' | 'Blueprint Pro JE' | 'Officer Master AE/IES';
  subscriptionExpiry?: string;
  streakDays: number;
  totalQuestionsSolved: number;
  totalTestsTaken: number;
  accuracyRate: number;
  referralCode: string;
  referralCredits: number;
  referralCount?: number;
  dailyGoalQuestions: number;
  solvedToday: number;
  savedQuestionIds: string[];
  photoUrl?: string;
  districtOrCity?: string;
  targetPost?: string;
  dailyStudyHours?: number;
  studyPlan?: StudentStudyPlan;
}

export interface PlanItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  durationMonths: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  targetAudience: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'recruitment' | 'mock_test' | 'test_series' | 'exam_alert' | 'system' | 'offer' | 'reminder';
  date: string;
  targetExam?: ExamTargetId;
  read: boolean;
  actionLink?: string;
  link?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  module: string;
  details: string;
}

export interface PromoCode {
  code: string;
  discountPercentage: number;
  maxDiscount: number;
  expiryDate: string;
  usageCount: number;
  active: boolean;
}

// ==========================================
// PART 10 — PYQ LIBRARY & PROVENANCE SYSTEM TYPES
// ==========================================

export type PYQVerificationStatus =
  | 'official_verified'
  | 'unverified'
  | 'under_review'
  | 'rejected';

export interface PYQSourceProvenance {
  conductingBody: string; // e.g. 'MPSC', 'Maharashtra PWD', 'SSC', 'RRB', 'WRD', 'BMC', 'ZP', 'UPSC'
  officialBookletSeries?: string; // e.g. 'Series A', 'Shift 1 Master Booklet'
  officialKeyNotification?: string; // e.g. 'Advt 012/2022 Final Key Dt 14-Nov-2022'
  shift?: string; // e.g. 'Morning Shift (10:00 AM - 12:00 PM)'
  masterPaperPdfUrl?: string; // URL / link to official master PDF
  sourceUrl?: string;
  rawScanPage?: number;
  verifiedKeyRef?: string; // e.g. 'Final Revised Key Question 42 - Option A'
  uploadedBy?: string;
  uploadedAt: string;
}

export interface PYQVersionHistoryItem {
  version: string; // e.g. '1.0', '1.1'
  editedAt: string;
  editorName: string;
  editorRole: 'admin' | 'reviewer' | 'contributor' | 'system';
  changeSummary: string;
  previousValues?: {
    stem?: string;
    options?: string[];
    correctOption?: number;
    explanation?: string;
    verificationStatus?: PYQVerificationStatus;
  };
}

export interface PYQRelatedConcept {
  id: string; // e.g. 'CON-RCC-001'
  name: string; // e.g. 'Minimum Tension Reinforcement in Beams'
  isCodeClause?: string; // e.g. 'IS 456:2000 Cl. 26.5.1.1'
  formula?: string; // e.g. 'Ast,min / bd = 0.85 / fy'
}

export interface PYQItem {
  id: string;
  exam: string; // e.g. 'MPSC Civil Engineering Services (MES)'
  examTargetId: ExamTargetId; // e.g. 'mpsc_civil'
  year: number; // e.g. 2022
  paper: string; // e.g. 'Paper-I' or 'Shift 1 CBT'
  subject: string; // e.g. 'RCC & Prestressed Concrete'
  subjectId: SubjectId; // e.g. 'rcc_concrete'
  topic: string; // e.g. 'Limit State of Flexure'
  topicId?: string;
  subtopic?: string;
  questionNumber: number | string; // e.g. 42 or 'Q.42'
  sourceProvenance: PYQSourceProvenance;
  verificationStatus: PYQVerificationStatus;
  verifiedBy?: string; // e.g. 'Er. S. Patil (Executive Admin)'
  verifiedAt?: string;
  adminApprovalNotes?: string;
  stem: string;
  options: string[];
  correctOption: number;
  correctAnswer?: number | string;
  explanation: string;
  whyOtherOptionsAreWrong?: Record<string, string> | string[];
  commonTraps?: string;
  formula?: string;
  unit?: string;
  isCodeReference?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relatedConcepts: PYQRelatedConcept[];
  versionHistory: PYQVersionHistoryItem[];
  isStripped?: boolean;
  tags?: string[];
  translations?: {
    mr?: { stem: string; options: string[]; explanation?: string };
    hi?: { stem: string; options: string[]; explanation?: string };
  };
  accuracyStats?: {
    totalAttempts: number;
    correctAttempts: number;
    accuracyRate: number;
  };
}

export interface PYQTopicMappingItem {
  subjectId: string;
  subjectName: string;
  topic: string;
  totalQuestions: number;
  verifiedCount: number;
  examDistribution: Record<string, number>;
  yearDistribution: Record<string, number>;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  sampleQuestionIds: string[];
}

export interface PYQAnalyticsData {
  totalQuestions: number;
  verifiedCount: number;
  unverifiedCount: number;
  underReviewCount: number;
  rejectedCount: number;
  examWiseCount: Record<string, number>;
  yearWiseCount: Record<string, number>;
  subjectWiseCount: Record<string, number>;
  difficultySplit: {
    easy: number;
    medium: number;
    hard: number;
  };
  topRepeatedConcepts: {
    conceptName: string;
    isCode?: string;
    occurrenceCount: number;
    exams: string[];
  }[];
  recentVerifications: {
    questionId: string;
    exam: string;
    year: number;
    verifiedBy: string;
    verifiedAt: string;
  }[];
}

// ==========================================
// PART 12 — RESULTS, PERFORMANCE ANALYTICS & DIAGNOSTICS TYPES
// ==========================================

export interface AnalyticsOverviewStats {
  totalAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  overallAccuracy: number;
  totalTestsTaken: number;
  totalTimeSpentMinutes: number;
  avgTimePerQuestionSeconds: number;
  fastPacedCount: number; // < 35s
  optimumPacedCount: number; // 35-75s
  overtimePacedCount: number; // > 75s
  cumulativeNegativeLoss: number;
  verifiedPercentile: number;
  syllabusCoveragePercent: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number; // 0-100 index based on regularity
}

export interface SubjectPerformanceMetric {
  subjectId: SubjectId;
  subjectName: string;
  category: SubjectCategory;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  avgSpeedSeconds: number;
  masteryLevel: 'Mastered' | 'Proficient' | 'Developing' | 'Critical Focus';
  negativeMarkLoss: number;
  sampleSufficiency: 'sufficient' | 'moderate' | 'insufficient';
  isCodesRelevant: string[];
  recentTrend: 'improving' | 'stable' | 'declining';
  totalQuestionsInBank: number;
}

export interface TopicPerformanceMetric {
  topicId: string;
  topicName: string;
  subjectId: SubjectId;
  subjectName: string;
  unitName?: string;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  avgSpeedSeconds: number;
  sampleSufficiency: 'sufficient' | 'moderate' | 'insufficient';
  masteryStatus: 'mastered' | 'proficient' | 'developing' | 'weak';
  isCodeReference?: string;
  pyqFrequency?: string;
}

export interface DifficultyPerformanceMetric {
  difficulty: 'easy' | 'medium' | 'hard';
  label: string;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  avgSpeedSeconds: number;
  benchmarkAccuracy: number;
}

export interface MeasuredWeaknessStats {
  accuracy: number; // empirical accuracy %
  totalQuestions: number; // N sample size
  wrongCount: number;
  negativeLoss: number;
  avgTimeSeconds: number;
  dominantErrorTag: string;
  errorTagFrequencies: Record<string, number>;
  recentAttemptsStreak: ('correct' | 'wrong')[];
}

export interface WeaknessRecommendationPlan {
  priority: 'Urgent' | 'High' | 'Medium';
  actionSummary: string;
  suggestedDrillQuestionCount: number;
  studyMaterialRef?: string;
  isCodeReference?: string;
  recommendedVideoId?: string;
  remedialSteps: string[];
}

export interface WeaknessDiagnosticItem {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: SubjectId;
  subjectName: string;
  isCodeClause?: string;
  confidence: 'High Confidence' | 'Moderate Confidence' | 'Initial Indicator';
  sampleSize: number;
  isDataSufficient: boolean; // True if sampleSize >= 5
  measuredStats: MeasuredWeaknessStats; // STRICTLY SEPARATE: Measured Statistics
  recommendations: WeaknessRecommendationPlan; // STRICTLY SEPARATE: Remedial Action Plan
}

export interface RevisionProgressStats {
  totalLoggedMistakes: number;
  resolvedMistakes: number;
  activeMistakes: number;
  dueForSpacedReview: number;
  masteryRatePercent: number;
  reasonBreakdown: { tag: MistakeReasonTag; label: string; count: number; percentage: number }[];
  spacedIntervalDistribution: { stage: number; label: string; count: number }[];
}

export interface StreakDailyLog {
  date: string;
  dayOfWeek: string;
  questionsSolved: number;
  accuracy: number;
  minutesSpent: number;
  testsCompleted: number;
  goalMet: boolean;
}

export interface CompleteStudentAnalytics {
  overview: AnalyticsOverviewStats;
  subjects: SubjectPerformanceMetric[];
  topics: TopicPerformanceMetric[];
  difficulties: DifficultyPerformanceMetric[];
  weaknesses: WeaknessDiagnosticItem[];
  revision: RevisionProgressStats;
  dailyActivity: StreakDailyLog[];
  mockHistory: TestAttempt[];
  generatedAt: string;
  isMaterializedCached: boolean;
}

// ==========================================
// PART 13 — SMART MISTAKE NOTEBOOK TYPES
// ==========================================

export type SmartErrorCategoryId =
  | 'conceptual_confusion'
  | 'factual_recall'
  | 'calculation_error'
  | 'unit_error'
  | 'formula_selection'
  | 'reading_error'
  | 'careless_mistake'
  | 'code_standard_confusion'
  | 'time_pressure';

export interface ErrorCategoryConfig {
  id: SmartErrorCategoryId | string;
  label: string;
  description: string;
  color: string;
  badgeClass: string;
  iconName?: string;
  isSystem: boolean;
  active: boolean;
  suggestedAction: string;
}

export type MistakeTriggerReason =
  | 'wrong_answer'
  | 'skipped'
  | 'bookmarked'
  | 'low_confidence'
  | 'manual_entry';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type MasteryState = 'unmastered' | 'in_progress' | 'mastered';

export interface RetestAttemptRecord {
  attemptId: string;
  date: string;
  timestamp: string;
  selectedOption: number | string;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  timeSpentSeconds: number;
  notes?: string;
  stageBefore: number;
  stageAfter: number;
}

export interface CanonicalQuestionSummary {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  correctAnswer?: number | string;
  explanation: string;
  subjectId: SubjectId;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCodeReference?: string;
  formula?: string;
  unit?: string;
  examTags?: string[];
  examTargetIds?: ExamTargetId[];
}

export interface SmartMistakeRecord {
  id: string;
  userEmail: string;
  questionId: string;
  // Canonical reference to avoid heavy data duplication
  canonicalQuestion: CanonicalQuestionSummary;
  studentAnswer: number | string | null;
  correctAnswer: number | string;
  explanation: string;
  conceptName: string;
  errorCategory: SmartErrorCategoryId | string;
  personalNote: string;
  confidenceLevel: ConfidenceLevel;
  loggedTrigger: MistakeTriggerReason;
  attemptHistory: RetestAttemptRecord[];
  masteryStatus: MasteryState;
  masteredAt?: string;
  // Spaced repetition metadata
  spacedIntervalDays: number;
  spacedStage: number; // 0=1d, 1=3d, 2=7d, 3=14d, 4=30d
  nextRevisionDate: string; // YYYY-MM-DD
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PART 14 — SPACED REVISION ENGINE TYPES
// ==========================================

export type RevisionQueueBucket = 'due_today' | 'overdue' | 'upcoming' | 'mastered';

export interface SpacedAlgorithmSettings {
  intervals: number[]; // e.g. [1, 3, 7, 14, 30]
  dailyLimit: number; // max questions scheduled per day (default 25)
  difficultyWeighting: {
    easy: number; // multiplier e.g. 1.3
    medium: number; // multiplier e.g. 1.0
    hard: number; // multiplier e.g. 0.7
  };
  confidenceWeighting: {
    high: number; // 1.4
    medium: number; // 1.0
    low: number; // 0.6
  };
  overdueGracePeriodDays: number;
  masteryConsecutiveCorrectCount: number; // e.g. 3 consecutive correct to reach Mastered
}

export interface SpacedAlgorithmSettings {
  initialIntervalDays: number; // e.g. 1
  secondIntervalDays: number; // e.g. 3
  intervals: number[]; // e.g. [1, 3, 7, 14, 30]
  dailyLimit: number; // max questions scheduled per day (default 25)
  easeFactorDefault?: number; // 2.50
  lapseIntervalDays?: number; // 1
  masteryStreakThreshold?: number; // 3
  difficultyWeighting: {
    easy: number; // multiplier e.g. 1.3
    medium: number; // multiplier e.g. 1.0
    hard: number; // multiplier e.g. 0.7
  };
  confidenceWeighting: {
    high: number; // 1.4
    medium: number; // 1.0
    low: number; // 0.6
  };
  overdueGracePeriodDays: number;
  masteryConsecutiveCorrectCount: number; // e.g. 3 consecutive correct to reach Mastered
}

export interface SpacedQueueGroup {
  dueToday: SmartMistakeRecord[];
  overdue: SmartMistakeRecord[];
  upcoming: SmartMistakeRecord[];
  mastered: SmartMistakeRecord[];
  totalInQueue: number;
}

export interface SpacedRevisionAttemptResult {
  updatedRecord: SmartMistakeRecord;
  attemptResult: {
    isCorrect: boolean;
    previousStage: number;
    newStage: number;
    newIntervalDays: number;
    newEaseFactor: number;
    nextReviewDate: string;
    masteryStatus: string;
  };
}

export interface RevisionEventLog {
  id: string;
  userEmail: string;
  mistakeId: string;
  questionId: string;
  reviewedAt: string;
  userAnswer: number | string;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  timeSpentSeconds: number;
  previousInterval: number;
  newInterval: number;
  previousStage: number;
  newStage: number;
  rescheduledTo: string;
  isMissedCatchup: boolean;
}

export interface SpacedRevisionQueueSummary {
  dueToday: SmartMistakeRecord[];
  overdue: SmartMistakeRecord[];
  upcoming: SmartMistakeRecord[];
  mastered: SmartMistakeRecord[];
  totalActiveCount: number;
  totalMasteredCount: number;
  streakDays: number;
  todayCompletedCount: number;
  algorithmSettings: SpacedAlgorithmSettings;
  generatedDate: string;
}

// ==========================================
// PART 15 — CIVIL ENGINEERING FORMULA LAB TYPES
// ==========================================

export interface FormulaVariable {
  symbol: string;
  name: string;
  unit: string;
  dimension?: string;
  description?: string;
  defaultValue?: number;
}

export interface FormulaWorkedExample {
  problem: string;
  givenData: Record<string, string>;
  solutionSteps: string[];
  finalAnswer: string;
}

export interface FormulaVersionItem {
  version: string;
  updatedAt: string;
  author: string;
  changelog: string;
}

export interface CivilFormula {
  id: string;
  name: string;
  title?: string;
  subjectId: SubjectId | string;
  subjectName: string;
  topicId: string;
  topicName: string;
  category: string;
  description?: string;
  expression: string;
  expressionLatex: string;
  renderedFormula?: string;
  variables: FormulaVariable[];
  siUnits: string;
  assumptions: string[];
  applicability: string[];
  workedExample?: FormulaWorkedExample;
  commonMistakes?: string[];
  commonTrap?: string;
  relatedMcqIds?: string[];
  relatedPyqNotes?: string[];
  isCodeReference?: string;
  isCodeClause?: string;
  version: string | number;
  versionHistory?: FormulaVersionItem[];
  isFavorite?: boolean;
  lastViewedAt?: string;
  isVerified?: boolean;
  verifiedBy?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormulaOfTheDay {
  date: string;
  formula: CivilFormula;
  examHighYieldTip: string;
  didYouKnowFact: string;
}

// ==========================================
// PART 16 — ENGINEERING CALCULATOR SUITE TYPES
// ==========================================

export type CalculatorCategory =
  | 'units'
  | 'area_volume'
  | 'stress_strain'
  | 'beams'
  | 'concrete'
  | 'reinforcement'
  | 'earthwork'
  | 'surveying'
  | 'hydraulics'
  | 'soil'
  | 'highway'
  | 'estimation';

export interface CalculatorInputSpec {
  key: string;
  label: string;
  unit: string;
  defaultValue: number | string;
  type: 'number' | 'select' | 'text';
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

export interface CalculatorResultOutput {
  key: string;
  label: string;
  value: number | string;
  unit: string;
  formatted: string;
  highlight?: boolean;
}

export interface CalculatorExecutionResult {
  outputs: CalculatorResultOutput[];
  formulaUsed: string;
  calculationSteps: string[];
  assumptions: string[];
  validationErrors: string[];
  warnings: string[];
  executionTimeMs: number;
}

export interface CalculatorNumericalTest {
  id: string;
  calculatorId: string;
  testName: string;
  inputs: Record<string, any>;
  expectedOutputs: Record<string, number | string>;
  tolerance: number; // e.g. 0.01 (1%)
  status?: 'passed' | 'failed' | 'untested';
  actualOutputs?: Record<string, any>;
  discrepancyMessage?: string;
}

export interface CivilCalculatorDef {
  id: string;
  name: string;
  category: CalculatorCategory;
  categoryName: string;
  shortDesc: string;
  isCodeStandard?: string;
  inputs: CalculatorInputSpec[];
  defaultValues: Record<string, any>;
  assumptions: string[];
  primaryFormula: string;
  testCases: CalculatorNumericalTest[];
}

// ==========================================
// PART 17 & 18 — AI CIVIL TUTOR & CACHE TYPES
// ==========================================

export type AILanguage = 'en' | 'mr' | 'hi';
export type AITutorQueryType = 'concept' | 'numerical' | 'mcq' | 'comparison' | 'revision' | 'general';

export interface AITutorNumericalSolution {
  formula: string;
  substitutions: string;
  units: string;
  stepByStepDerivation: string[];
  finalAnswer: string;
  sanityCheck: string;
}

export interface AITutorQueryRequest {
  query: string;
  queryType?: AITutorQueryType;
  subjectName?: string;
  language?: AILanguage;
  userEmail?: string;
  userTier?: string;
  mcqContext?: {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    userSelectedOption?: number;
    isCodeReference?: string;
  };
}

export interface AITutorQueryResponse {
  answer: string;
  language: AILanguage;
  queryType: AITutorQueryType;
  isCodeReference?: string;
  numericalSolution?: AITutorNumericalSolution;
  cached: boolean;
  pregenerated: boolean;
  sourcesVerified: boolean;
  officialFactNotice?: string;
  remainingQuota: number;
  quotaLimit: number;
  responseTimeMs: number;
}

export interface PregeneratedExplanation {
  id: string;
  canonicalKey: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  questionOrConcept: string;
  explanationEn: string;
  explanationMr?: string;
  explanationHi?: string;
  isCodeReference?: string;
  numericalBreakdown?: AITutorNumericalSolution;
  verifiedBy: string;
  approvedAt: string;
  viewCount: number;
}

export interface AICacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRatePercent: number;
  pregeneratedHits: number;
  activeEntriesCount: number;
  savedCostEstimatedRupees: number;
}

// ==========================================
// PART 20 — SITE ENGINEER PRACTICAL MODE TYPES
// ==========================================

export type SitePracticalCategory =
  | 'concrete_testing'
  | 'reinforcement_bbs'
  | 'foundations_columns'
  | 'beams_slabs_formwork'
  | 'masonry_plaster'
  | 'waterproofing'
  | 'surveying_instruments'
  | 'highways_pavements'
  | 'geotechnical_field'
  | 'quality_safety_billing';

export interface SiteQualityCheckpoint {
  id: string;
  checkItem: string;
  toleranceOrStandard: string;
  isCodeClause: string;
  mandatory: boolean;
}

export interface SiteMistakeWarning {
  mistakeTitle: string;
  consequence: string;
  correctAction: string;
}

export interface SiteVivaQuestion {
  question: string;
  answer: string;
  interviewerTip?: string;
}

export interface SitePracticalLesson {
  id: string;
  title: string;
  category: SitePracticalCategory;
  categoryLabel: string;
  objective: string;
  isCodeReference: string;
  equipmentAndMaterials: string[];
  fieldProcedure: string[];
  observationsAndCalculations: {
    title: string;
    steps: string[];
    sampleCalculation?: string;
  };
  qualityCheckpoints: SiteQualityCheckpoint[];
  commonSiteMistakes: SiteMistakeWarning[];
  vivaVoceQuestions: SiteVivaQuestion[];
  relatedExamMcqs: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  practicalTip: string;
  safetyPrecautions: string[];
}

// ==========================================
// PART 21 — VISUAL LEARNING & DIAGRAMS TYPES
// ==========================================

export type DiagramCategory =
  | 'soil_mechanics'
  | 'rcc_structures'
  | 'structural_mechanics'
  | 'surveying_geomatics'
  | 'fluid_mechanics'
  | 'transportation_cross_sections'
  | 'construction_details';

export interface DiagramHotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  label: string;
  codeReference?: string;
  description: string;
  formulaRelation?: string;
}

export interface VisualDiagram {
  id: string;
  title: string;
  category: DiagramCategory;
  categoryName: string;
  subjectName: string;
  caption: string;
  accessibilityText: string;
  isCodeReference?: string;
  svgType: 'soil_phase' | 'rcc_stress_block' | 'mohr_circle' | 'leveling_staff' | 'total_station' | 'highway_cross_section' | 'sfd_bmd' | 'venturimeter' | 'bbs_hook' | 'footing_section';
  hotspots: DiagramHotspot[];
  linkedFormulaId?: string;
  linkedMcqTopic?: string;
  keyTakeaways: string[];
}

// ==========================================
// PART 22 — DAILY CIVIL CAPSULE & NOTIFICATIONS
// ==========================================

export interface DailyCapsuleItem {
  id: string;
  dateStr: string;
  conceptTitle: string;
  conceptSubject: string;
  conceptBody: string;
  formulaId?: string;
  formulaSnapshot?: {
    title: string;
    expression: string;
    isCode: string;
  };
  mcqs: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    isCode: string;
  }[];
  pyqHighlight: {
    examName: string;
    year: number;
    question: string;
    options: string[];
    correctIndex: number;
    solution: string;
  };
  numericalChallenge: {
    problemStatement: string;
    formula: string;
    answer: string;
    steps: string[];
  };
  siteEngineerTip: string;
  examAlertNote: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  category: 'exam_alert' | 'study_reminder' | 'streak_milestone' | 'revision_due' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// ==========================================
// PART 23 — RECRUITMENT NOTIFICATION TYPES
// ==========================================

export interface VerifiedRecruitmentNotice {
  id: string;
  title: string;
  authority: string;
  examCategory: 'maha_pwd' | 'maha_wrd' | 'maha_zp' | 'municipal' | 'mjp' | 'ssc_je' | 'rrb_je' | 'upsc_ese' | 'other_state';
  categoryLabel: string;
  postName: string;
  totalVacanciesVerified: number | null;
  vacanciesCategoryBreakdown?: Record<string, number>;
  notificationDate: string;
  applicationStartDate: string;
  applicationEndDate: string;
  examDatesEstimated: string;
  officialNotificationPdfUrl: string;
  officialPortalUrl: string;
  educationalEligibility: string;
  ageLimit: string;
  applicationFee: string;
  payScale: string;
  isVerified: boolean;
  verifiedByAdmin: string;
  verificationTimestamp: string;
  status: 'active' | 'upcoming' | 'closed' | 'archived';
  keyHighlights: string[];
}

// ==========================================
// PART 24 — GAMIFICATION & LEADERBOARD TYPES
// ==========================================

export interface LeaderboardRankEntry {
  rank: number;
  studentName: string;
  studentEmailMasked: string;
  isCurrentUser: boolean;
  points: number;
  testsCompleted: number;
  accuracyPercent: number;
  streakDays: number;
  avatarSeed: string;
  tier: string;
}

export interface StudentBadgeDef {
  id: string;
  title: string;
  category: 'accuracy' | 'consistency' | 'is_codes' | 'site_pro' | 'speed' | 'milestone';
  description: string;
  iconName: string;
  unlockedAt?: string;
  progressPercent: number;
  isUnlocked: boolean;
}

// ==========================================
// PART 26 & 27 — PAYMENTS & REFERRAL ANTI-FRAUD
// ==========================================

export interface EntitlementPlanItem {
  id: string;
  name: string;
  priceRupees: number;
  discountPriceRupees: number;
  durationMonths: number;
  badge?: string;
  features: string[];
  productType: 'mcq_bank' | 'test_series' | 'video_library' | 'all_in_one';
  popular?: boolean;
}

export interface ReferralFraudMetrics {
  riskScore: number; // 0 - 100
  ipVelocityCount: number;
  deviceHashMatches: number;
  selfReferralAttempted: boolean;
  accountAgeHours: number;
  flaggedForReview: boolean;
  reviewStatus: 'approved' | 'pending' | 'rejected';
}

export interface ReferralStudentStatus {
  referralCode: string;
  inviteLink: string;
  totalReferralsCount: number;
  verifiedReferralsCount: number;
  pendingReferralsCount: number;
  totalBonusCreditsEarned: number;
  subscriptionDaysEarned: number;
  fraudMetrics: ReferralFraudMetrics;
  recentReferrals: {
    referredNameMasked: string;
    joinedDate: string;
    status: 'joined' | 'verified_active' | 'under_review';
    rewardAwarded: string;
  }[];
}



