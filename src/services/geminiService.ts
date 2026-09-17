export interface AICoachResponse {
  reply: string;
}

export interface QuestionExplorationResponse {
  explanation: string;
}

export interface DiagnosticResponse {
  plan: string;
}

export class GeminiService {
  static async askCoach(
    message: string,
    targetExam?: string,
    subject?: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, targetExam, subject }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: AICoachResponse = await response.json();
      return data.reply;
    } catch (error: any) {
      console.warn('AI Coach server call failed, providing offline engineering fallback', error);
      return `### 📐 Er. SP Civil Engineering Study Coach Response

Regarding **${subject || 'Civil Engineering'}** for **${targetExam || 'State AE/JE & SSC JE'}**:

1. **Fundamental Engineering Principle**:
   Always verify the limit state design principles under IS 456:2000 (Clause 38 for flexure and Clause 40 for shear) and IS 800:2007 (Table 3 for slenderness ratio).

2. **Standard Calculation Formula**:
   - For simply supported beams with point load $W$: Maximum Moment $M = \\frac{WL}{4}$
   - Section Modulus $Z = \\frac{bd^2}{6}$
   - Extreme fiber stress $\\sigma_{max} = \\frac{M}{Z} = \\frac{3WL}{2bd^2}$

3. **High-Yield Memory Tip for CBT Exams**:
   Remember that for Fe 415 steel, the limiting depth of neutral axis is $x_{u,max} = 0.48d$, and limiting moment capacity is $M_{u,lim} = 0.138 f_{ck} b d^2$.

*Connect with our active mentor desk in Contact/Support if you need live derivation assistance.*`;
    }
  }

  static async getQuestionDeepAnalysis(
    questionText: string,
    options: string[],
    correctOption: number,
    subjectName: string,
    isCodeReference?: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/gemini/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText,
          options,
          correctOption,
          subjectName,
          isCodeReference,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: QuestionExplorationResponse = await response.json();
      return data.explanation;
    } catch (error) {
      console.warn('Deep explanation offline fallback', error);
      return `### 📘 Technical Analysis & IS Code Reference
**Subject**: ${subjectName}
**Reference Code**: ${isCodeReference || 'IS 456:2000 / IS 800:2007'}

**Correct Option (${String.fromCharCode(65 + correctOption)})**: ${options[correctOption]}

**Engineering Rationale**:
- The value strictly complies with standard codal provisions.
- Always cross-reference the minimum reinforcement and slenderness tables during preliminary exam revision.`;
    }
  }

  static async getDiagnosticPlan(
    accuracyRate: number,
    targetExams: string[],
    weakSubjects: string[],
    totalSolved: number,
    testsTaken: number
  ): Promise<string> {
    try {
      const response = await fetch('/api/gemini/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accuracyRate,
          targetExams,
          weakSubjects,
          totalSolved,
          testsTaken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: DiagnosticResponse = await response.json();
      return data.plan;
    } catch (error) {
      return `### 🎯 Er. SP Personalized 4-Week Civil Study Roadmap

**Target Exams**: ${targetExams.join(', ')}
**Current Accuracy**: ${accuracyRate}% (${totalSolved} questions solved across ${testsTaken} CBT Mocks)

#### Week 1: High Weightage Structural & Materials Mastery
- **Focus**: RCC (IS 456:2000 Cl. 26, 38, 40) + Building Materials (Cement clinkers & Concrete mix design IS 10262).
- **Daily Target**: 40 MCQs + 1 hour theory notes revision.

#### Week 2: SOM & Steel Design Formulations
- **Focus**: SFD/BMD standard cases, Euler column formulas, IS 800:2007 Table 3 slenderness limits.
- **Daily Target**: 45 MCQs with special attention to numerical calculations.

#### Week 3: Hydraulics, Geotechnical & Transportation
- **Focus**: Soil phase relationships ($Se=wG$), Terzaghi bearing capacity, IRC:73 super-elevation standards.
- **Daily Target**: 50 MCQs + 1 Full Length Mock Test on weekend.

#### Week 4: PYQs Marathon & Mistake Notebook Revision
- **Focus**: Re-test all flagged mistakes, solve previous 5 years papers of PWD & SSC JE in simulated CBT environment.`;
    }
  }
}
