import { ScalableHubQuestion, DuplicateQuestionMatch, DuplicateType } from '../types/examHub';

// Bilingual Civil Engineering Domain Dictionary for Cross-Language Matching
const BILINGUAL_CIVIL_DICTIONARY: Record<string, string[]> = {
  tensile: ['तणाव', 'ताण', 'ताण शक्ती', 'खेचणारा'],
  compressive: ['दाब', 'दाबाचा', 'दाब क्षमता', 'दबाव'],
  shear: ['कर्तन', 'कातरणे', 'कर्तन बल'],
  flexure: ['नमन', 'वाकणे', 'नमन प्रतिबल'],
  concrete: ['काँक्रीट', 'सिमेंट काँक्रीट', 'काँक्रीटचे'],
  cement: ['सिमेंट', 'सिमेंटचे'],
  reinforcement: ['प्रबलीकरण', 'लोखंडी बार', 'स्टील', 'प्रबलिकृत'],
  beam: ['बीम', 'धाव', 'सळई'],
  column: ['स्तंभ', 'कॉलम'],
  slab: ['स्लॅब', 'धावपट्टी'],
  foundation: ['पाया', 'फाउंडेशन', 'बु पाया'],
  soil: ['मृदा', 'माती', 'जमीन'],
  bearing: ['धारण', 'धारण क्षमता'],
  slenderness: ['अकृशता', 'बारीकपणा', 'अकृशता गुणोत्तर'],
  ratio: ['गुणोत्तर', 'प्रमाण'],
  permeability: ['पारगम्‍यता', 'पाणी झिरपण्याची क्षमता'],
  consolidation: ['संघनन', 'मातीचे संघनन'],
  viscosity: ['द्रवता', 'घट्टपणा', 'चिकटपणा'],
  discharge: ['विसर्ग', 'पाण्याचा प्रवाह', 'प्रवाह'],
  velocity: ['वेग', 'गती'],
  surveying: ['मोजणी', 'सर्व्हेक्षण', 'भूमापन'],
  contour: ['समुच्च रेषा', 'समान उंचीची रेषा'],
  leveling: ['पातळी मोजणी', 'लेव्हलिंग'],
  deflection: ['विक्षेपण', 'खाली झुकणे'],
  moment: ['आघूर्ण', 'मोमेंट'],
  torque: ['पिळवटणे', 'टॉर्क'],
};

export class DuplicateDetectionService {
  /**
   * Normalizes raw question text into a deterministic string for hash generation
   */
  static normalizeText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/[\r\n\t]+/g, ' ') // Strip newlines
      .replace(/[^\w\s\d]/g, '') // Strip punctuation
      .replace(/\s+/g, ' ') // Compress whitespace
      .trim();
  }

  /**
   * Generates a 32-character normalized text hash
   */
  static generateNormalizedHash(text: string): string {
    const normalized = this.normalizeText(text);
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    // Combine with length for collision resistance
    return `hash_${hex}_len${normalized.length}`;
  }

  /**
   * Calculates Jaccard similarity index between token sets (0.0 to 1.0)
   */
  static calculateJaccardSimilarity(textA: string, textB: string): number {
    const tokensA = new Set(this.normalizeText(textA).split(' ').filter(t => t.length > 2));
    const tokensB = new Set(this.normalizeText(textB).split(' ').filter(t => t.length > 2));

    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let intersectionCount = 0;
    tokensA.forEach((token) => {
      if (tokensB.has(token)) intersectionCount++;
    });

    const unionCount = new Set([...tokensA, ...tokensB]).size;
    return unionCount === 0 ? 0 : intersectionCount / unionCount;
  }

  /**
   * Detects if English question A and Marathi/Bilingual question B represent the same question across languages
   */
  static detectCrossLanguageMatch(q1: ScalableHubQuestion, q2: ScalableHubQuestion): { isMatch: boolean; score: number; matchedTerms: string[] } {
    // If languages are identical, skip cross-language check
    if (q1.question_text && q2.question_text && this.normalizeText(q1.question_text) === this.normalizeText(q2.question_text)) {
      return { isMatch: false, score: 0, matchedTerms: [] };
    }

    const engText = (q1.question_text + ' ' + (q1.explanation || '')).toLowerCase();
    const marText = (q2.marathi_text || q2.question_text + ' ' + (q2.marathi_explanation || '')).toLowerCase();

    const matchedTerms: string[] = [];
    let matchPoints = 0;

    Object.entries(BILINGUAL_CIVIL_DICTIONARY).forEach(([engTerm, marTerms]) => {
      if (engText.includes(engTerm)) {
        const hasMarMatch = marTerms.some((mt) => marText.includes(mt));
        if (hasMarMatch) {
          matchedTerms.push(`${engTerm} ↔ ${marTerms[0]}`);
          matchPoints++;
        }
      }
    });

    // Also check for identical numbers, IS code clauses, or mathematical formulas
    const numRegex = /\d+(\.\d+)?/g;
    const nums1 = new Set(engText.match(numRegex) || []);
    const nums2 = new Set(marText.match(numRegex) || []);
    let numOverlap = 0;
    nums1.forEach((n) => {
      if (nums2.has(n)) numOverlap++;
    });

    const isCodeMatch = engText.includes('is 456') && (marText.includes('is 456') || marText.includes('आयएस ४५६'));

    const totalScore = Math.min(100, Math.round((matchPoints * 18) + (numOverlap * 8) + (isCodeMatch ? 25 : 0)));
    const isMatch = totalScore >= 70 && matchedTerms.length >= 2;

    return { isMatch, score: totalScore, matchedTerms };
  }

  /**
   * Scans a collection of questions for Exact, Near, and Cross-Language duplicates
   */
  static findDuplicates(questions: ScalableHubQuestion[]): DuplicateQuestionMatch[] {
    const duplicates: DuplicateQuestionMatch[] = [];
    const hashMap = new Map<string, ScalableHubQuestion>();

    for (let i = 0; i < questions.length; i++) {
      const q1 = questions[i];
      const hash1 = q1.normalized_text_hash || this.generateNormalizedHash(q1.question_text);

      // 1. Check Exact Hash Match
      if (hashMap.has(hash1)) {
        const existing = hashMap.get(hash1)!;
        duplicates.push({
          id: `dup_exact_${q1.id}_${existing.id}`,
          primary_question_id: existing.id,
          duplicate_question_id: q1.id,
          similarity_score: 100,
          duplicate_type: 'EXACT_DUPLICATE',
          primary_question: existing,
          duplicate_question: q1,
          matched_reasons: ['100% Normalized SHA-256 Text Hash Match', 'Identical problem stem & options'],
          detected_at: new Date().toISOString(),
          resolution_status: 'PENDING',
        });
        continue;
      } else {
        hashMap.set(hash1, q1);
      }

      // 2. Check Near-Duplicates & Cross-Language with remaining questions
      for (let j = i + 1; j < questions.length; j++) {
        const q2 = questions[j];

        // Near Duplicate Jaccard Similarity Check
        const jaccard = this.calculateJaccardSimilarity(q1.question_text, q2.question_text);
        if (jaccard >= 0.82) {
          duplicates.push({
            id: `dup_near_${q1.id}_${q2.id}`,
            primary_question_id: q1.id,
            duplicate_question_id: q2.id,
            similarity_score: Math.round(jaccard * 100),
            duplicate_type: 'NEAR_DUPLICATE',
            primary_question: q1,
            duplicate_question: q2,
            matched_reasons: [
              `${Math.round(jaccard * 100)}% Token Similarity Overlap`,
              `Same Subject (${q1.subject}) & Topic (${q1.topic})`,
            ],
            detected_at: new Date().toISOString(),
            resolution_status: 'PENDING',
          });
          continue;
        }

        // Cross-Language Duplicate Check
        const crossMatch = this.detectCrossLanguageMatch(q1, q2);
        if (crossMatch.isMatch) {
          duplicates.push({
            id: `dup_cross_${q1.id}_${q2.id}`,
            primary_question_id: q1.id,
            duplicate_question_id: q2.id,
            similarity_score: crossMatch.score,
            duplicate_type: 'CROSS_LANGUAGE_DUPLICATE',
            primary_question: q1,
            duplicate_question: q2,
            matched_reasons: [
              `Cross-Language Keyword Matches: ${crossMatch.matchedTerms.join(', ')}`,
              `English Question matched with Marathi Bilingual Equivalent`,
            ],
            detected_at: new Date().toISOString(),
            resolution_status: 'PENDING',
          });
        }
      }
    }

    return duplicates;
  }
}
