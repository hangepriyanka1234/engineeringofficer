/**
 * Engineering Exam & Question Paper Hub Types
 * Civil Engineering Competitive Examinations Platform
 */

export type ExamCategoryType =
  | 'Central Government'
  | 'Maharashtra Government'
  | 'Other State Government'
  | 'PSU / Technical Recruitment'
  | 'Railway / Infrastructure'
  | 'Municipal / Local Government'
  | 'GATE / Higher Technical Exams'
  | 'Other Engineering Recruitment';

export type ExamActiveStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'ARCHIVED' | 'UPCOMING';

export interface ScalableExamCatalogueItem {
  id: string; // e.g. 'mpsc_civil_ae', 'ssc_je_civil', 'gate_civil_2025'
  exam_name: string;
  short_name: string;
  authority: string; // e.g. 'MPSC', 'SSC', 'UPSC', 'RRB', 'BMC'
  department: string; // e.g. 'Public Works Department', 'Irrigation & WRD', 'Urban Development'
  category: ExamCategoryType;
  state_or_central: 'Central' | 'Maharashtra' | 'Other State' | 'PSU' | 'Municipal';
  qualification: 'Diploma' | 'Degree' | 'Both';
  diploma_eligible: boolean;
  degree_eligible: boolean;
  official_website: string;
  official_notification_url: string;
  exam_pattern: string;
  duration: number; // Duration in minutes e.g. 120 or 180
  marks: number; // Total marks e.g. 200 or 300
  negative_marking: string; // e.g. '0.25 (1/4th)', '0.333 (1/3rd)', '0 (None)'
  subjects: string[]; // Subject names or IDs
  syllabus: string; // Syllabus topics summary
  active_status: ExamActiveStatus;
  last_verified_date: string;
  is_archived?: boolean;
  active_recruitments_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Hierarchical Structure: Exam -> Year -> Paper -> Shift -> Section -> Subject -> Topic -> Questions
export interface QuestionPaperSection {
  id: string;
  section_name: string; // e.g., 'Section 1: Technical (SOM/RCC/Soil)', 'Section 2: General Knowledge & Aptitude'
  description?: string;
  question_count: number;
  marks_per_question: number;
  negative_marks_per_question: number;
}

export interface ScalableQuestionPaper {
  id: string; // e.g., 'mpsc_ae_2023_paper1_shift1'
  exam_id: string;
  exam_name: string;
  short_name: string;
  category: ExamCategoryType;
  year: number; // e.g., 2023
  paper_name: string; // e.g., 'Paper-I Technical Objective'
  shift: string; // e.g., 'Shift 1 (Morning)'
  sections: QuestionPaperSection[];
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  negative_marking_ratio: number; // e.g., 0.25
  is_official_pyq: boolean;
  source: string;
  source_url?: string;
  verification_status: 'UNVERIFIED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  attempts_count?: number;
  avg_score?: number;
  user_best_score?: number;
  user_accuracy?: number;
  user_completion_status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  last_attempted_at?: string;
}

export type OfficialPYQStatus = 'UNVERIFIED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
export type AIQuestionStatus = 'GENERATED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';

export interface QuestionOptionItem {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  marathi_text?: string;
}

export interface ScalableHubQuestion {
  id: string; // Unique ID
  question_text: string;
  marathi_text?: string;
  options: QuestionOptionItem[];
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  marathi_explanation?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question_type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL';
  exam_id: string;
  exam_name: string;
  year: number;
  paper_name: string;
  shift: string;
  section_id?: string;
  section_name?: string;
  marks: number;
  negative_marks: number;
  source: string;
  source_url?: string;
  provenance_metadata?: {
    uploader_email?: string;
    scanner_batch_id?: string;
    verified_by?: string;
    key_reference_clause?: string;
    is_code_reference?: string;
    copyright_note?: string;
  };
  verification_status: OfficialPYQStatus | AIQuestionStatus;
  is_pyq: boolean; // TRUE for official PYQ, FALSE for AI Question
  ai_status?: AIQuestionStatus; // Only populated if is_pyq === false
  pyq_status?: OfficialPYQStatus; // Only populated if is_pyq === true
  normalized_text_hash: string;
  created_at: string;
  updated_at: string;
  version: number;
}

// Duplicate Question Detection Types
export type DuplicateType = 'EXACT_DUPLICATE' | 'NEAR_DUPLICATE' | 'CROSS_LANGUAGE_DUPLICATE';

export interface DuplicateQuestionMatch {
  id: string;
  primary_question_id: string;
  duplicate_question_id: string;
  similarity_score: number; // 0 to 100%
  duplicate_type: DuplicateType;
  primary_question: ScalableHubQuestion;
  duplicate_question: ScalableHubQuestion;
  matched_reasons: string[];
  detected_at: string;
  resolution_status: 'PENDING' | 'MERGED' | 'LINKED_BILINGUAL' | 'KEPT_BOTH' | 'REJECTED';
}

export interface CBTUserAnswerState {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  status: 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED_FOR_REVIEW';
  timeSpentSeconds: number;
  visitCount: number;
}

export interface CBTExamSubmissionResult {
  paperId: string;
  paperTitle: string;
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
  rank?: number;
  percentile?: number;
  questionBreakdown: {
    question: ScalableHubQuestion;
    userSelectedOption: 'A' | 'B' | 'C' | 'D' | null;
    isCorrect: boolean;
    marksAwarded: number;
    timeSpentSeconds: number;
  }[];
  submittedAt: string;
}
