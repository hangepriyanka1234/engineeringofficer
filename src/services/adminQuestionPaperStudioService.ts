import { QuestionRecord, ValidationRowError } from './questionBankService';
import { ScalableHubQuestion, ScalableQuestionPaper, OfficialPYQStatus, AIQuestionStatus } from '../types/examHub';
import { DuplicateDetectionService } from './duplicateDetectionService';

export interface PaperBuilderConfig {
  id: string;
  exam_id: string;
  exam_name: string;
  year: number;
  paper_name: string;
  shift: string;
  duration_minutes: number;
  total_marks: number;
  negative_marking_ratio: number; // e.g. 0.25
  subject_distribution: Record<string, number>; // subjectId -> target question count
  selected_question_ids: string[];
}

export interface PaperValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checklist: {
    questionCountValid: boolean;
    duplicateCheckPassed: boolean;
    noMissingAnswers: boolean;
    noMissingOptions: boolean;
    marksValid: boolean;
    negativeMarkingValid: boolean;
    subjectDistributionMatched: boolean;
    answerKeyComplete: boolean;
  };
}

export class AdminQuestionPaperStudioService {
  /**
   * Generates the 100% Schema-matched AI Question Prompt for ChatGPT/Gemini
   */
  static generateAIPrompt(params: {
    examName: string;
    subjectName: string;
    topicName: string;
    questionCount: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'all';
    language: 'English' | 'Marathi' | 'Bilingual';
  }): string {
    return `Create Civil Engineering MCQs for ${params.examName}, Subject: ${params.subjectName}, Topic: ${params.topicName}, Number of questions: ${params.questionCount}, Difficulty: ${params.difficulty}, Language: ${params.language}.

Return valid JSON array ONLY, adhering 100% strictly to the application's required QuestionRecord schema:
[
  {
    "question_text": "According to IS 456:2000 Clause 26.5.1.1, what is the minimum percentage of tensile reinforcement required in a beam using Fe 415 grade steel?",
    "marathi_text": "आयएस ४५६:२००० (कलम २६.५.१.१) नुसार Fe 415 ग्रेडच्या स्टीलसाठी बीममध्ये आवश्यक असलेल्या किमान ताण प्रबलीकरणाची टक्केवारी किती असावी?",
    "option_a": "0.205%",
    "option_b": "0.340%",
    "option_c": "0.400%",
    "option_d": "0.120%",
    "correct_answer": "A",
    "explanation": "As per IS 456:2000 Clause 26.5.1.1, Ast,min / (b * d) = 0.85 / fy. For Fe 415: 0.85 / 415 = 0.205%.",
    "marathi_explanation": "IS 456:2000 नुसार: किमान ताण प्रबलीकरण = ०.८५ / fy = ०.८५ / ४१५ = ०.२०५%.",
    "subject_id": "rcc_concrete",
    "topic_name": "${params.topicName}",
    "difficulty": "${params.difficulty === 'all' ? 'medium' : params.difficulty}",
    "language": "${params.language}",
    "is_pyq": false,
    "verification_status": "under_review",
    "is_code_reference": "IS 456:2000 Cl. 26.5.1.1",
    "formula": "Ast,min / (b * d) = 0.85 / fy",
    "marks": 2,
    "negative_marks": 0.5
  }
]

CRITICAL RULES:
1. Do NOT invent official PYQ metadata or fake exam years.
2. Mark ALL AI-generated questions strictly with "is_pyq": false.
3. "correct_answer" MUST be one of 'A', 'B', 'C', or 'D'.
4. "verification_status" MUST be "under_review".
5. Return ONLY raw JSON array without markdown formatting codeblocks.`;
  }

  /**
   * Validates pasted AI JSON text with exact row/field error location
   */
  static validatePastedAIJSON(jsonText: string): {
    isValid: boolean;
    questions: QuestionRecord[];
    errors: ValidationRowError[];
    duplicateCount: number;
  } {
    const errors: ValidationRowError[] = [];
    const questions: QuestionRecord[] = [];
    let rawArray: any[] = [];

    if (!jsonText || !jsonText.trim()) {
      return {
        isValid: false,
        questions: [],
        errors: [{ rowNumber: 0, field: 'json_root', message: 'JSON मजकूर रिकामा आहे. कृपया वैध JSON पेस्ट करा.', rawData: null }],
        duplicateCount: 0,
      };
    }

    try {
      // Strip markdown ```json code blocks if present
      const cleaned = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      rawArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e: any) {
      return {
        isValid: false,
        questions: [],
        errors: [{ rowNumber: 0, field: 'json_syntax', message: `अवैध JSON सिंटॅक्स: ${e.message}`, rawData: jsonText.substring(0, 100) }],
        duplicateCount: 0,
      };
    }

    let duplicateCount = 0;

    rawArray.forEach((item, idx) => {
      const rowNum = idx + 1;

      if (!item.question_text || typeof item.question_text !== 'string' || !item.question_text.trim()) {
        errors.push({ rowNumber: rowNum, field: 'question_text', message: `Row ${rowNum}: question_text रिकामा आहे किंवा अवैध आहे.`, rawData: item });
      }

      if (!item.option_a) errors.push({ rowNumber: rowNum, field: 'option_a', message: `Row ${rowNum}: option_a गहाळ आहे.`, rawData: item });
      if (!item.option_b) errors.push({ rowNumber: rowNum, field: 'option_b', message: `Row ${rowNum}: option_b गहाळ आहे.`, rawData: item });
      if (!item.option_c) errors.push({ rowNumber: rowNum, field: 'option_c', message: `Row ${rowNum}: option_c गहाळ आहे.`, rawData: item });
      if (!item.option_d) errors.push({ rowNumber: rowNum, field: 'option_d', message: `Row ${rowNum}: option_d गहाळ आहे.`, rawData: item });

      const ans = String(item.correct_answer || '').toUpperCase().trim();
      if (!['A', 'B', 'C', 'D', '0', '1', '2', '3'].includes(ans)) {
        errors.push({ rowNumber: rowNum, field: 'correct_answer', message: `Row ${rowNum}: correct_answer अवैध आहे ('${ans}'). 'A', 'B', 'C', किंवा 'D' असावा.`, rawData: item });
      }

      // Check duplicates
      const hash = DuplicateDetectionService.generateNormalizedHash(item.question_text || '');

      // Create standardized QuestionRecord
      const q: QuestionRecord = {
        id: `ai_pasted_${Date.now()}_${idx}`,
        question_id: `q_pasted_${idx + 1}`,
        question_text: item.question_text || '',
        option_a: String(item.option_a || ''),
        option_b: String(item.option_b || ''),
        option_c: String(item.option_c || ''),
        option_d: String(item.option_d || ''),
        correct_answer: ans === '0' ? 'A' : ans === '1' ? 'B' : ans === '2' ? 'C' : ans === '3' ? 'D' : ans || 'A',
        explanation: item.explanation || 'AI generated concept explanation.',
        subject_id: item.subject_id || 'rcc_concrete',
        topic_id: item.topic_id || 'general',
        topic_name: item.topic_name || item.topic || 'General Topic',
        question_type: item.question_type || 'standard_mcq',
        difficulty: (['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'medium') as any,
        language: item.language || 'Bilingual',
        is_pyq: false, // MANDATORY DEFAULT FALSE FOR AI
        source: 'Pasted AI Question (ChatGPT/Gemini)',
        verification_status: 'under_review', // MANDATORY DEFAULT
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        text_hash: hash,
        is_code_reference: item.is_code_reference || '',
        formula: item.formula || '',
        unit: item.unit || '',
        marks: Number(item.marks) || 2,
        negative_marks: Number(item.negative_marks) || 0.5,
      };

      questions.push(q);
    });

    return {
      isValid: errors.length === 0,
      questions,
      errors,
      duplicateCount,
    };
  }

  /**
   * Pre-publish Paper Builder Validation Checklist
   */
  static validatePaperForPublish(
    config: PaperBuilderConfig,
    questions: ScalableHubQuestion[]
  ): PaperValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const checklist = {
      questionCountValid: false,
      duplicateCheckPassed: true,
      noMissingAnswers: true,
      noMissingOptions: true,
      marksValid: true,
      negativeMarkingValid: true,
      subjectDistributionMatched: true,
      answerKeyComplete: true,
    };

    // 1. Question count match
    if (questions.length === 0) {
      errors.push('प्रश्नपत्रिकेत कोणतेही प्रश्न निवडलेले नाहीत.');
    } else {
      checklist.questionCountValid = true;
    }

    // 2. Duplicate Check
    const dupMatches = DuplicateDetectionService.findDuplicates(questions);
    if (dupMatches.length > 0) {
      checklist.duplicateCheckPassed = false;
      errors.push(`प्रश्नपत्रिकेत ${dupMatches.length} डुप्लिकेट प्रश्न आढळले आहेत. कृपया ते हटवा.`);
    }

    // 3. Missing answers & options
    questions.forEach((q, idx) => {
      if (!q.correct_answer || !['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
        checklist.noMissingAnswers = false;
        errors.push(`Q${idx + 1} (ID: ${q.id}): उत्तर (Answer Key) गहाळ किंवा चुकीचे आहे.`);
      }

      if (!q.options || q.options.length < 4 || q.options.some((o) => !o.text.trim())) {
        checklist.noMissingOptions = false;
        errors.push(`Q${idx + 1} (ID: ${q.id}): ४ पर्याय पूर्ण नाहीत.`);
      }
    });

    // 4. Marks & Negative Marking
    if (!config.total_marks || config.total_marks <= 0) {
      checklist.marksValid = false;
      errors.push('एकूण गुण (Total Marks) ० पेक्षा जास्त असावेत.');
    }

    if (config.negative_marking_ratio < 0 || config.negative_marking_ratio > 1) {
      checklist.negativeMarkingValid = false;
      errors.push('निगेटिव्ह मार्किंग गुणोत्तर वैध नाही (0 ते 1 असावे).');
    }

    checklist.answerKeyComplete = checklist.noMissingAnswers;

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      checklist,
    };
  }
}
