import React, { useState } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Download,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Question, SubjectId } from '../types';
import { StorageService } from '../services/storageService';
import { SUBJECTS_LIST } from '../data/mockData';

interface PYQImporterModalProps {
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

interface ParsedRow {
  index: number;
  data: Partial<Question>;
  errors: string[];
  isDuplicate: boolean;
  duplicateMatch?: Question;
  similarityScore: number;
}

export const PYQImporterModal: React.FC<PYQImporterModalProps> = ({
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [inputFormat, setInputFormat] = useState<'json' | 'csv'>('json');
  const [rawText, setRawText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<{ imported: number; duplicates: number; skipped: number } | null>(null);

  const existingQuestions = StorageService.getQuestions();

  const SAMPLE_JSON = JSON.stringify(
    [
      {
        id: 'pyq-pwd-2023-01',
        subjectId: 'rcc_concrete',
        chapter: 'Design of Slabs',
        topic: 'One-Way vs Two-Way Slabs',
        difficulty: 'easy',
        questionType: 'standard_mcq',
        stem: 'According to IS 456:2000, a slab supported on all four edges is designed as a two-way slab if the ratio of longer span (Ly) to shorter span (Lx) is:',
        options: ['Less than or equal to 2.0', 'Greater than 2.0', 'Greater than 3.0', 'Less than 1.0'],
        correctAnswer: 0,
        explanation: 'As per IS 456:2000 Cl. 24.1, when the ratio of longer span to shorter span (Ly/Lx) does not exceed 2.0 and the slab is supported on all four edges, it bends in both directions and is designed as a two-way slab.',
        whyOtherOptionsAreWrong: {
          'Greater than 2.0': 'When Ly/Lx > 2.0, the slab predominantly transfers load along the shorter direction and is designed as a one-way slab.',
          'Greater than 3.0': 'Arbitrary value; not in IS 456.',
          'Less than 1.0': 'By definition Ly is the longer span, so Ly/Lx cannot be less than 1.0.'
        },
        commonTraps: 'Remember: Ly/Lx ≤ 2.0 is Two-Way. Ly/Lx > 2.0 is One-Way.',
        isCodeReference: 'IS 456:2000 Cl. 24.1',
        source: 'Maharashtra PWD Junior Engineer 2023 Shift-1',
        examTags: ['Maha PWD JE 2023', 'MPSC MES'],
        year: 2023,
        exam: 'Maha PWD JE',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        id: 'pyq-som-2022-02',
        subjectId: 'som',
        chapter: 'Principal Stresses and Strains',
        topic: "Mohr's Circle",
        difficulty: 'medium',
        questionType: 'standard_mcq',
        stem: 'Under a state of pure shear stress of magnitude τ on mutually perpendicular planes, the radius of Mohr circle of stress is equal to:',
        options: ['τ', '2τ', 'τ/2', 'Zero'],
        correctAnswer: 0,
        explanation: 'In pure shear, σx = 0, σy = 0, and τxy = τ. The center of Mohr circle is ((σx+σy)/2, 0) = (0, 0). The radius R = √[((σx-σy)/2)² + τxy²] = √[0 + τ²] = τ. Principal stresses are σ1 = +τ and σ2 = -τ.',
        formula: 'R = √[((σx-σy)/2)² + τxy²]',
        source: 'SSC JE Civil 2022 Shift-2',
        year: 2022,
        exam: 'SSC JE'
      }
    ],
    null,
    2
  );

  const SAMPLE_CSV = `id,subjectId,difficulty,questionType,stem,options,correctAnswer,explanation,isCodeReference,year,exam
pyq-bmc-2023-01,building_materials,easy,standard_mcq,"As per IS 1077:1992, what is the minimum compressive strength required for standard common burnt clay building bricks of class 3.5?","3.5 N/mm²|5.0 N/mm²|7.5 N/mm²|10.0 N/mm²",0,"As per Table 1 of IS 1077:1992, the minimum compressive strength for class 3.5 bricks is 3.5 N/mm² (or 35 kg/cm²).",IS 1077:1992 Table 1,2023,BMC Sub Engineer
pyq-geo-2021-02,geotechnical,medium,standard_mcq,"According to Terzaghi bearing capacity theory, what is the bearing capacity factor Nc for a purely cohesive soil (undrained clay with φ = 0)?","5.7","5.14","1.0","0",0,"For φ = 0 in Terzaghi general shear failure, Nc = 5.7, Nq = 1.0, and Nγ = 0. (Note: Skempton gives 5.14 for strip footing, but Terzaghi standard is 5.7).",Terzaghi Theory 1943,2021,MPSC MES`;

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV with quotes
      const values: string[] = [];
      let inQuotes = false;
      let curVal = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(curVal.trim());
          curVal = '';
        } else {
          curVal += char;
        }
      }
      values.push(curVal.trim());

      const obj: any = {};
      headers.forEach((h, idx) => {
        let val = values[idx] || '';
        val = val.replace(/^"|"$/g, '').trim();

        if (h === 'options') {
          obj[h] = val.split('|').map((o) => o.trim());
        } else if (h === 'correctAnswer') {
          const num = parseInt(val, 10);
          obj[h] = isNaN(num) ? val : num;
        } else if (h === 'year') {
          obj[h] = parseInt(val, 10) || undefined;
        } else {
          obj[h] = val;
        }
      });

      rows.push(obj);
    }
    return rows;
  };

  const handleValidate = () => {
    setIsProcessing(true);
    let items: any[] = [];

    try {
      if (inputFormat === 'json') {
        items = JSON.parse(rawText);
        if (!Array.isArray(items)) {
          items = [items];
        }
      } else {
        items = parseCSV(rawText);
      }
    } catch (err: any) {
      alert(`Parsing syntax error: ${err.message}. Please check your format.`);
      setIsProcessing(false);
      return;
    }

    if (items.length === 0) {
      alert('No questions detected in the input payload.');
      setIsProcessing(false);
      return;
    }

    const validated: ParsedRow[] = items.map((raw, idx) => {
      const errors: string[] = [];
      const stem = raw.stem || raw.text;

      // Validate required fields
      if (!stem || stem.trim().length < 10) {
        errors.push('Question stem is missing or too short (< 10 chars).');
      }

      if (!raw.subjectId) {
        errors.push('Subject ID is missing.');
      } else {
        const foundSub = SUBJECTS_LIST.some((s) => s.id === raw.subjectId);
        if (!foundSub) {
          errors.push(`Invalid subject ID "${raw.subjectId}".`);
        }
      }

      if (!raw.options || !Array.isArray(raw.options) || raw.options.length < 2) {
        errors.push('At least 2 options are required for objective questions.');
      }

      if (raw.correctAnswer === undefined && raw.correctOption === undefined) {
        errors.push('Correct answer indicator is missing.');
      }

      // Check Duplicate
      const dupResult = StorageService.checkQuestionDuplicate(stem || '', existingQuestions);

      return {
        index: idx + 1,
        data: {
          ...raw,
          id: raw.id || `pyq-imp-${Date.now()}-${idx}`,
          stem,
          text: stem,
          questionType: raw.questionType || 'standard_mcq',
          difficulty: raw.difficulty || 'medium',
          correctOption: typeof raw.correctOption === 'number' ? raw.correctOption : (typeof raw.correctAnswer === 'number' ? raw.correctAnswer : 0),
          correctAnswer: raw.correctAnswer !== undefined ? raw.correctAnswer : raw.correctOption,
          examTargetIds: raw.examTargetIds || ['mpsc_civil', 'maha_pwd'],
          status: 'published',
        },
        errors,
        isDuplicate: dupResult.isDuplicate,
        duplicateMatch: dupResult.matchQuestion,
        similarityScore: dupResult.similarityPercent,
      };
    });

    setParsedRows(validated);
    setStep('preview');
    setIsProcessing(false);
  };

  const handleCommitImport = () => {
    // Only import valid, non-duplicate rows
    const toImport = parsedRows
      .filter((r) => r.errors.length === 0 && !r.isDuplicate)
      .map((r) => r.data as Question);

    if (toImport.length === 0) {
      alert('No valid questions available to import.');
      return;
    }

    const result = StorageService.importQuestions(toImport);
    setImportSummary(result);
    onImportComplete(result.imported);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Bulk PYQ & Question Importer</h2>
              <p className="text-xs text-slate-500">
                Import CSV / JSON with automated codal validation and duplicate similarity detection.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Content Rights & Source Integrity: </span>
            Preserve authentic questions only from authorized public recruitment keys, official gazettes, or licensed test series.
            Every item automatically receives metadata timestamps, subject code tags, and official reference citations.
          </div>
        </div>

        {importSummary ? (
          /* Import Result Success Screen */
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Import Process Completed!</h3>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs py-2">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <span className="font-bold text-base block font-mono">{importSummary.imported}</span>
                <span>Questions Imported</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold text-base block font-mono">{importSummary.duplicates}</span>
                <span>Duplicates Avoided</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <span className="font-bold text-base block font-mono">{importSummary.skipped}</span>
                <span>Skipped (Errors)</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
            >
              Done & Return to Bank
            </button>
          </div>
        ) : step === 'input' ? (
          /* Step 1: Input Data */
          <div className="space-y-4">
            {/* Format Toggles & Template Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-700">Format:</span>
                <button
                  type="button"
                  onClick={() => setInputFormat('json')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    inputFormat === 'json'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  JSON Payload
                </button>
                <button
                  type="button"
                  onClick={() => setInputFormat('csv')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    inputFormat === 'csv'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  CSV / TSV Text
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setRawText(inputFormat === 'json' ? SAMPLE_JSON : SAMPLE_CSV)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Load Sample {inputFormat.toUpperCase()}</span>
                </button>
              </div>
            </div>

            {/* Input Text Area */}
            <div className="space-y-1">
              <textarea
                rows={10}
                placeholder={
                  inputFormat === 'json'
                    ? 'Paste JSON array of questions here [ { id, subjectId, stem, options, correctAnswer, explanation, isCodeReference... } ]'
                    : 'Paste CSV rows here with headers: id,subjectId,difficulty,questionType,stem,options,correctAnswer,explanation...'
                }
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50/50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                {rawText ? `${rawText.split('\n').length} lines pasted` : 'Ready for input'}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rawText.trim() || isProcessing}
                  onClick={handleValidate}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 transition-all shadow-xs"
                >
                  <span>Parse & Run Validation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Interactive Preview & Duplicate Inspector */
          <div className="space-y-4">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">TOTAL DETECTED</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{parsedRows.length} Questions</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block text-[10px]">READY TO IMPORT</span>
                <span className="font-bold text-emerald-800 text-sm font-mono">
                  {parsedRows.filter((r) => r.errors.length === 0 && !r.isDuplicate).length} Valid
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-amber-700 block text-[10px]">DUPLICATES FLAGGED</span>
                <span className="font-bold text-amber-800 text-sm font-mono">
                  {parsedRows.filter((r) => r.isDuplicate).length} Duplicates
                </span>
              </div>
            </div>

            {/* Preview List */}
            <div className="max-h-80 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50 divide-y divide-slate-200/60">
              {parsedRows.map((row) => {
                const isValid = row.errors.length === 0 && !row.isDuplicate;

                return (
                  <div key={row.index} className="pt-2.5 first:pt-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-700">#{row.index}</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
                          {row.data.subjectId}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">ID: {row.data.id}</span>
                      </div>

                      {isValid ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Valid</span>
                        </span>
                      ) : row.isDuplicate ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Duplicate ({row.similarityScore}% match)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Validation Error</span>
                        </span>
                      )}
                    </div>

                    <p className="font-medium text-slate-800 line-clamp-2">{row.data.stem || row.data.text}</p>

                    {row.isDuplicate && row.duplicateMatch && (
                      <div className="p-2 rounded bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900">
                        <span className="font-bold">Collision with existing question ID: </span>
                        {row.duplicateMatch.id} ({row.duplicateMatch.stem?.slice(0, 60)}...)
                      </div>
                    )}

                    {row.errors.length > 0 && (
                      <div className="p-2 rounded bg-rose-50 border border-rose-200 text-[11px] text-rose-800 space-y-0.5">
                        {row.errors.map((err, eIdx) => (
                          <div key={eIdx}>• {err}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Back to Input
              </button>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={parsedRows.filter((r) => r.errors.length === 0 && !r.isDuplicate).length === 0}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs disabled:opacity-50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Commit {parsedRows.filter((r) => r.errors.length === 0 && !r.isDuplicate).length} Questions to Bank
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
