import * as XLSX from 'xlsx';

export interface QuestionRecord {
  id: string;
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string | number;
  explanation: string;
  subject_id: string;
  subject_name?: string;
  topic_id?: string;
  topic_name?: string;
  subtopic_id?: string;
  exam_id?: string;
  exam_year?: number;
  question_type: 'standard_mcq' | 'numerical' | 'multiple_choice' | 'assertion_reason' | 'match_the_following' | 'statement_based';
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'English' | 'Marathi' | 'Hindi' | 'Bilingual';
  is_pyq: boolean;
  source?: string;
  source_url?: string;
  verification_status: 'unverified' | 'under_review' | 'verified' | 'rejected';
  image_url?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  text_hash: string;
  is_code_reference?: string;
  formula?: string;
  unit?: string;
  marks?: number;
  negative_marks?: number;
  reviewer?: string;
}

export interface QuestionVersionRecord {
  id: string;
  question_id: string;
  version_number: number;
  question_text: string;
  correct_answer: string | number;
  explanation: string;
  changed_by: string;
  change_reason?: string;
  snapshot_json: any;
  created_at: string;
}

export interface ImportHistoryRecord {
  id: string;
  import_id: string;
  admin_id: string;
  admin_email: string;
  file_name: string;
  file_type: 'csv' | 'xlsx' | 'json';
  upload_time: string;
  total_rows: number;
  imported_count: number;
  duplicate_count: number;
  rejected_count: number;
  failed_count: number;
  status: 'PENDING' | 'VALIDATING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PARTIALLY_COMPLETED';
  duration_ms: number;
  error_log_json?: Array<{ row: number; error: string; data?: any }>;
  created_at: string;
}

export interface ValidationRowError {
  rowNumber: number;
  field: string;
  message: string;
  rawData: any;
}

export interface ImportPreviewSummary {
  importId: string;
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'json';
  totalRows: number;
  validRowsCount: number;
  duplicateRowsCount: number;
  invalidRowsCount: number;
  readyToImportCount: number;
  sampleValid: QuestionRecord[];
  sampleDuplicates: Array<{ rowNumber: number; reason: string; question: Partial<QuestionRecord>; existingMatchId?: string }>;
  errors: ValidationRowError[];
}

export interface ImportProgress {
  importId: string;
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  fileName: string;
  totalQuestions: number;
  processed: number;
  imported: number;
  skipped: number;
  duplicates: number;
  errors: number;
  currentBatch: number;
  totalBatches: number;
  batchSize: number;
  progressPercent: number;
  startTime: number;
  elapsedTimeMs: number;
  estimatedRemainingMs: number;
  errorLogs: Array<{ row: number; message: string }>;
}

export interface AIExplanationJob {
  id: string;
  question_id: string;
  question_text: string;
  subject_id: string;
  status: 'pending' | 'generating' | 'generated' | 'approved' | 'rejected';
  generated_explanation?: string;
  model_used?: string;
  cost_inr?: number;
  prompt_tokens?: number;
  response_tokens?: number;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export class QuestionBankService {
  /**
   * Client-side file reader supporting CSV, XLSX, and JSON
   */
  static async parseFileClientSide(file: File): Promise<{ rawData: any[]; fileType: 'csv' | 'xlsx' | 'json' }> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'json') {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rawData = Array.isArray(parsed) ? parsed : [parsed];
      return { rawData, fileType: 'json' };
    }

    if (extension === 'xlsx' || extension === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet);
      return { rawData, fileType: 'xlsx' };
    }

    // Default to CSV
    const text = await file.text();
    const workbook = XLSX.read(text, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);
    return { rawData, fileType: 'csv' };
  }

  /**
   * Submit raw parsed items to server for deep validation, duplicate hashing, and error categorization
   */
  static async validateUploadOnServer(
    rawData: any[],
    fileName: string,
    fileType: 'csv' | 'xlsx' | 'json',
    adminEmail = 'admin@sp-engineering.gov.in'
  ): Promise<ImportPreviewSummary> {
    const response = await fetch('/api/admin/questions/import/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawData, fileName, fileType, adminEmail }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Validation failed' }));
      throw new Error(err.error || 'Server validation failed');
    }

    const data = await response.json();
    return data.summary;
  }

  /**
   * Execute batch import
   */
  static async executeBatchImport(
    importId: string,
    batchSize = 500,
    options?: { overrideVerificationStatus?: 'unverified' | 'under_review' | 'verified'; defaultTags?: string }
  ): Promise<{ success: boolean; importedCount: number; message: string }> {
    const response = await fetch('/api/admin/questions/import/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        importId,
        batchSize,
        adminEmail: 'admin@sp-engineering.gov.in',
        ...options,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Import execution failed' }));
      throw new Error(err.error || 'Import execution failed');
    }

    return await response.json();
  }

  /**
   * Poll live import progress
   */
  static async getImportProgress(importId: string): Promise<ImportProgress | null> {
    try {
      const response = await fetch(`/api/admin/questions/import/progress/${importId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.progress || null;
    } catch {
      return null;
    }
  }

  /**
   * Query questions with pagination and filters
   */
  static async getQuestions(params: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    topicId?: string;
    examId?: string;
    examYear?: number;
    difficulty?: string;
    language?: string;
    isPyq?: boolean;
    verificationStatus?: string;
    isArchived?: boolean;
    questionType?: string;
    selectiveColumns?: boolean;
  }): Promise<{
    questions: QuestionRecord[];
    totalCount: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
    stats: {
      totalQuestions: number;
      verifiedCount: number;
      pyqCount: number;
      unverifiedCount: number;
      archivedCount: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.subjectId && params.subjectId !== 'all') query.set('subjectId', params.subjectId);
    if (params.topicId && params.topicId !== 'all') query.set('topicId', params.topicId);
    if (params.examId && params.examId !== 'all') query.set('examId', params.examId);
    if (params.examYear) query.set('examYear', String(params.examYear));
    if (params.difficulty && params.difficulty !== 'all') query.set('difficulty', params.difficulty);
    if (params.language && params.language !== 'all') query.set('language', params.language);
    if (params.isPyq !== undefined) query.set('isPyq', String(params.isPyq));
    if (params.verificationStatus && params.verificationStatus !== 'all') query.set('verificationStatus', params.verificationStatus);
    if (params.isArchived !== undefined) query.set('isArchived', String(params.isArchived));
    if (params.questionType && params.questionType !== 'all') query.set('questionType', params.questionType);
    if (params.selectiveColumns) query.set('selectiveColumns', 'true');

    const response = await fetch(`/api/admin/questions?${query.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to load questions from Question Bank');
    }
    return await response.json();
  }

  /**
   * Get single question with version history
   */
  static async getQuestionById(id: string): Promise<{ question: QuestionRecord; versions: QuestionVersionRecord[] }> {
    const response = await fetch(`/api/admin/questions/${id}`);
    if (!response.ok) {
      throw new Error('Question not found');
    }
    return await response.json();
  }

  /**
   * Create single question
   */
  static async createQuestion(question: Partial<QuestionRecord>): Promise<QuestionRecord> {
    const response = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, adminEmail: 'admin@sp-engineering.gov.in' }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Creation failed' }));
      throw new Error(err.error || 'Failed to create question');
    }

    const data = await response.json();
    return data.question;
  }

  /**
   * Update question with versioning
   */
  static async updateQuestion(id: string, updates: Partial<QuestionRecord>, changeReason?: string): Promise<QuestionRecord> {
    const response = await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates, adminEmail: 'admin@sp-engineering.gov.in', changeReason }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(err.error || 'Failed to update question');
    }

    const data = await response.json();
    return data.question;
  }

  /**
   * Bulk Archive / Restore
   */
  static async bulkArchive(questionIds: string[], archive = true): Promise<number> {
    const response = await fetch('/api/admin/questions/bulk/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds, archive }),
    });
    const data = await response.json();
    return data.modifiedCount || 0;
  }

  /**
   * Bulk Verify
   */
  static async bulkVerify(questionIds: string[], status: 'unverified' | 'under_review' | 'verified' | 'rejected'): Promise<number> {
    const response = await fetch('/api/admin/questions/bulk/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds, status }),
    });
    const data = await response.json();
    return data.modifiedCount || 0;
  }

  /**
   * Bulk Categorize
   */
  static async bulkCategorize(
    questionIds: string[],
    updates: { subject_id?: string; exam_id?: string; difficulty?: 'easy' | 'medium' | 'hard' }
  ): Promise<number> {
    const response = await fetch('/api/admin/questions/bulk/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds, updates }),
    });
    const data = await response.json();
    return data.modifiedCount || 0;
  }

  /**
   * Bulk Delete (requires super-admin secret)
   */
  static async bulkDelete(questionIds: string[]): Promise<number> {
    const response = await fetch('/api/admin/questions/bulk/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds, secretKey: 'SUPER_ADMIN_CONFIRMED' }),
    });
    const data = await response.json();
    return data.deletedCount || 0;
  }

  /**
   * Get past import history
   */
  static async getImportHistories(): Promise<ImportHistoryRecord[]> {
    const response = await fetch('/api/admin/questions/import/history');
    if (!response.ok) return [];
    const data = await response.json();
    return data.histories || [];
  }

  /**
   * AI Explanation queue
   */
  static async getAIExplanationQueue(): Promise<QuestionRecord[]> {
    const response = await fetch('/api/admin/questions/ai-explanation/queue');
    if (!response.ok) return [];
    const data = await response.json();
    return data.queue || [];
  }

  static async generateAIExplanations(questionIds: string[]): Promise<AIExplanationJob[]> {
    const response = await fetch('/api/admin/questions/ai-explanation/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds }),
    });
    const data = await response.json();
    return data.generated || [];
  }

  static async approveAIExplanation(jobId: string, approvedExplanation: string): Promise<boolean> {
    const response = await fetch('/api/admin/questions/ai-explanation/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, approvedExplanation }),
    });
    return response.ok;
  }

  /**
   * Load / Generate 20,000+ benchmark dataset on server
   */
  static async load20kBenchmarkDataset(count = 20000): Promise<{ totalNow: number; timeTakenMs: number }> {
    const response = await fetch('/api/admin/questions/sample-dataset/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });
    if (!response.ok) {
      throw new Error('Benchmark generation failed');
    }
    return await response.json();
  }

  /**
   * Generates downloadable CSV template
   */
  static downloadCSVTemplate() {
    const headers = [
      'question_text',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'correct_answer',
      'subject_id',
      'topic_id',
      'exam_id',
      'exam_year',
      'difficulty',
      'language',
      'is_pyq',
      'explanation',
      'is_code_reference',
      'formula',
      'unit',
      'source'
    ];

    const sampleRow = [
      'According to IS 456:2000 (Clause 26.5.1.1), what is the minimum tensile reinforcement required in a beam using Fe 415?',
      '0.205%',
      '0.340%',
      '0.400%',
      '0.120%',
      'A',
      'rcc_concrete',
      'flexure_detailing',
      'mpsc_civil',
      '2023',
      'easy',
      'English',
      'TRUE',
      'As per IS 456:2000 Cl. 26.5.1.1 Ast,min / bd = 0.85/fy = 0.85/415 = 0.205%.',
      'IS 456:2000 Cl. 26.5.1.1',
      'Ast,min / bd = 0.85 / fy',
      '%',
      'MPSC MES 2022 Paper-I'
    ];

    const csvContent = [
      headers.join(','),
      sampleRow.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'engineering_officer_question_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export validation errors as CSV
   */
  static exportErrorsAsCSV(errors: ValidationRowError[], fileName = 'import_rejections.csv') {
    const headers = ['Row Number', 'Field', 'Error Message', 'Raw Data Snippet'];
    const rows = errors.map((e) => [
      e.rowNumber,
      `"${e.field}"`,
      `"${e.message.replace(/"/g, '""')}"`,
      `"${JSON.stringify(e.rawData).replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
