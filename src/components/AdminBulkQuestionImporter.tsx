import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  Database,
  ArrowRight,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  Eye,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  QuestionBankService,
  ImportPreviewSummary,
  ImportProgress,
  ValidationRowError,
  QuestionRecord
} from '../services/questionBankService';

interface AdminBulkQuestionImporterProps {
  onImportComplete?: () => void;
  onNavigateToRepository?: (filterSubject?: string) => void;
}

export const AdminBulkQuestionImporter: React.FC<AdminBulkQuestionImporterProps> = ({
  onImportComplete,
  onNavigateToRepository,
}) => {
  // Wizard steps: 'upload' -> 'preview' -> 'importing' -> 'completed'
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'completed'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // File & Validation state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewSummary, setPreviewSummary] = useState<ImportPreviewSummary | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'valid' | 'duplicates' | 'errors'>('valid');

  // Import configuration
  const [batchSize, setBatchSize] = useState<number>(500);
  const [defaultVerificationStatus, setDefaultVerificationStatus] = useState<'unverified' | 'under_review' | 'verified'>('unverified');

  // Live import progress
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importReport, setImportReport] = useState<{ importedCount: number; message: string; durationSec: number } | null>(null);
  const pollIntervalRef = useRef<any>(null);

  // Benchmark quick-load state
  const [isGeneratingBenchmark, setIsGeneratingBenchmark] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  // Process and parse file
  const processSelectedFile = async (file: File) => {
    setUploadedFile(file);
    setIsParsing(true);
    setParseError(null);

    try {
      // 1. Client-side parse to JSON
      const { rawData, fileType } = await QuestionBankService.parseFileClientSide(file);
      if (!rawData || rawData.length === 0) {
        throw new Error('The selected file contains no readable rows or headers.');
      }

      // 2. Server-side validation and duplicate fingerprint check
      const summary = await QuestionBankService.validateUploadOnServer(
        rawData,
        file.name,
        fileType,
        'admin@sp-engineering.gov.in'
      );

      setPreviewSummary(summary);
      if (summary.validRowsCount === 0 && summary.invalidRowsCount > 0) {
        setActivePreviewTab('errors');
      } else if (summary.validRowsCount === 0 && summary.duplicateRowsCount > 0) {
        setActivePreviewTab('duplicates');
      } else {
        setActivePreviewTab('valid');
      }
      setStep('preview');
    } catch (err: any) {
      console.error('File parsing failed:', err);
      setParseError(err.message || 'Failed to parse and validate file.');
    } finally {
      setIsParsing(false);
    }
  };

  // Execute Batch Import
  const handleExecuteImport = async () => {
    if (!previewSummary || previewSummary.validRowsCount === 0) return;

    setStep('importing');
    const startTime = Date.now();

    // Start polling for real-time progress
    pollIntervalRef.current = setInterval(async () => {
      if (previewSummary?.importId) {
        const prog = await QuestionBankService.getImportProgress(previewSummary.importId);
        if (prog) {
          setImportProgress(prog);
          if (prog.status === 'COMPLETED' || prog.status === 'FAILED') {
            clearInterval(pollIntervalRef.current);
          }
        }
      }
    }, 300);

    try {
      const result = await QuestionBankService.executeBatchImport(
        previewSummary.importId,
        batchSize,
        {
          overrideVerificationStatus: defaultVerificationStatus,
        }
      );

      clearInterval(pollIntervalRef.current);
      const durationSec = Number(((Date.now() - startTime) / 1000).toFixed(2));
      setImportReport({
        importedCount: result.importedCount,
        message: result.message,
        durationSec,
      });

      setStep('completed');
      if (onImportComplete) onImportComplete();
    } catch (err: any) {
      clearInterval(pollIntervalRef.current);
      setParseError(err.message || 'Batch import failed.');
      setStep('preview');
    }
  };

  // 1-Click 20,000 Benchmark Dataset Loader
  const handleLoad20kBenchmark = async (count = 20000) => {
    setIsGeneratingBenchmark(true);
    setBenchmarkResult(null);
    try {
      const res = await QuestionBankService.load20kBenchmarkDataset(count);
      setBenchmarkResult(`Successfully loaded ${count.toLocaleString()} authentic Civil Engineering questions in ${(res.timeTakenMs / 1000).toFixed(2)}s! Question bank is now at ${res.totalNow.toLocaleString()} total items.`);
      if (onImportComplete) onImportComplete();
    } catch (err: any) {
      setBenchmarkResult(`Error: ${err.message || 'Benchmark dataset generation failed'}`);
    } finally {
      setIsGeneratingBenchmark(false);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 border-b border-sky-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center space-x-1">
                <Database className="w-3 h-3 text-sky-400" />
                <span>Production Batch Engine</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">20,000+ Scalable Q-Bank</span>
            </div>
            <h2 className="text-xl font-extrabold flex items-center space-x-2 text-white">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>Question Bank Bulk Import Wizard</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Upload, validate, deduplicate, and batch-import up to 20,000+ Civil Engineering MCQs, PYQs, and numerical problems with full audit logging and codal reference preservation.
            </p>
          </div>

          {/* Quick Actions & Templates */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => QuestionBankService.downloadCSVTemplate()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center space-x-1.5 backdrop-blur-xs"
            >
              <Download className="w-3.5 h-3.5 text-sky-300" />
              <span>Download CSV Template</span>
            </button>

            <button
              onClick={() => handleLoad20kBenchmark(20000)}
              disabled={isGeneratingBenchmark}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-slate-950 ${isGeneratingBenchmark ? 'animate-spin' : ''}`} />
              <span>{isGeneratingBenchmark ? 'Generating 20k...' : 'Load 20k Dataset Benchmark'}</span>
            </button>
          </div>
        </div>

        {benchmarkResult && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{benchmarkResult}</span>
            </div>
            <button
              onClick={() => onNavigateToRepository && onNavigateToRepository()}
              className="px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-lg font-bold hover:bg-emerald-400 transition-all flex items-center space-x-1"
            >
              <span>View In Repository</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Wizard Progress Steps Indicator */}
        <div className="mt-6 grid grid-cols-4 gap-2 border-t border-white/10 pt-4 text-xs font-medium">
          {[
            { id: 'upload', label: '1. Select File', active: step === 'upload', done: step !== 'upload' },
            { id: 'preview', label: '2. Validate & Preview', active: step === 'preview', done: step === 'importing' || step === 'completed' },
            { id: 'importing', label: '3. Batch Import', active: step === 'importing', done: step === 'completed' },
            { id: 'completed', label: '4. Summary Report', active: step === 'completed', done: false },
          ].map((s) => (
            <div
              key={s.id}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
                s.active
                  ? 'bg-sky-500/30 text-white font-bold border border-sky-400/40'
                  : s.done
                  ? 'text-sky-300 opacity-80'
                  : 'text-slate-500'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  s.active
                    ? 'bg-sky-400 text-slate-950'
                    : s.done
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {s.done ? <CheckCircle2 className="w-3 h-3" /> : s.id === 'upload' ? '1' : s.id === 'preview' ? '2' : s.id === 'importing' ? '3' : '4'}
              </div>
              <span className="truncate">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {/* STEP 1: UPLOAD FILE */}
        {step === 'upload' && (
          <div className="space-y-6">
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
                dragActive
                  ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
                  : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50/60 bg-slate-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-xs">
                {isParsing ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
                ) : (
                  <Upload className="w-8 h-8 text-sky-600" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {isParsing ? 'Parsing & Validating Question Records...' : 'Click to Upload or Drag & Drop File'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Supports <span className="font-semibold text-slate-700">.CSV</span>, <span className="font-semibold text-slate-700">.XLSX / Excel</span>, and <span className="font-semibold text-slate-700">.JSON</span> formats up to 20,000+ questions per file.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 flex items-center space-x-1.5 shadow-2xs">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV / Excel</span>
                </span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 flex items-center space-x-1.5 shadow-2xs">
                  <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>JSON Payload</span>
                </span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 flex items-center space-x-1.5 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>SHA-256 Deduplication</span>
                </span>
              </div>
            </div>

            {parseError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">File Parsing & Validation Error</p>
                  <p>{parseError}</p>
                </div>
              </div>
            )}

            {/* Schema Guide & Column Format Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Expected Column Schema & Field Mapping</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {[
                  { name: 'question_text', req: true, desc: 'Full question statement / problem stem' },
                  { name: 'option_a', req: true, desc: 'Option A (text/formula)' },
                  { name: 'option_b', req: true, desc: 'Option B (text/formula)' },
                  { name: 'option_c', req: false, desc: 'Option C (text/formula)' },
                  { name: 'option_d', req: false, desc: 'Option D (text/formula)' },
                  { name: 'correct_answer', req: true, desc: 'A, B, C, or D (or 0, 1, 2, 3)' },
                  { name: 'subject_id', req: true, desc: 'e.g. rcc_concrete, som, steel' },
                  { name: 'topic_id', req: false, desc: 'Topic slug e.g. flexure, shear' },
                  { name: 'exam_id', req: false, desc: 'maha_pwd, mpsc_civil, ssc_je' },
                  { name: 'exam_year', req: false, desc: 'e.g. 2023, 2022' },
                  { name: 'difficulty', req: false, desc: 'easy, medium, hard' },
                  { name: 'is_code_reference', req: false, desc: 'e.g. IS 456:2000 Cl. 26.5' },
                ].map((col) => (
                  <div key={col.name} className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{col.name}</span>
                      {col.req ? (
                        <span className="text-[10px] px-1 py-0.2 bg-rose-100 text-rose-700 rounded font-semibold">Req</span>
                      ) : (
                        <span className="text-[10px] px-1 py-0.2 bg-slate-100 text-slate-600 rounded">Opt</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{col.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: VALIDATE & PREVIEW */}
        {step === 'preview' && previewSummary && (
          <div className="space-y-6">
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">Total Rows Parsed</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{previewSummary.totalRows.toLocaleString()}</p>
                <span className="text-[11px] text-slate-400">from {previewSummary.fileName}</span>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Valid & Ready</span>
                </span>
                <p className="text-2xl font-black text-emerald-800 mt-1">{previewSummary.validRowsCount.toLocaleString()}</p>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {((previewSummary.validRowsCount / Math.max(1, previewSummary.totalRows)) * 100).toFixed(1)}% pass rate
                </span>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-xs text-amber-700 font-bold flex items-center space-x-1">
                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                  <span>Duplicates Detected</span>
                </span>
                <p className="text-2xl font-black text-amber-800 mt-1">{previewSummary.duplicateRowsCount.toLocaleString()}</p>
                <span className="text-[11px] text-amber-600">Will be safely skipped</span>
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-xs text-rose-700 font-bold flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Rejected / Errors</span>
                </span>
                <p className="text-2xl font-black text-rose-800 mt-1">{previewSummary.invalidRowsCount.toLocaleString()}</p>
                <span className="text-[11px] text-rose-600">Failed validation rules</span>
              </div>
            </div>

            {/* Batch Import Configuration Options */}
            <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-700" />
                <span>Import Execution Settings</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batch Chunk Size (DB Optimization)</label>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-sky-500"
                  >
                    <option value={250}>250 records / batch (High safety)</option>
                    <option value={500}>500 records / batch (Recommended)</option>
                    <option value={1000}>1,000 records / batch (High throughput)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Default PYQ Verification Status</label>
                  <select
                    value={defaultVerificationStatus}
                    onChange={(e) => setDefaultVerificationStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="unverified">Unverified (Requires Admin Review Queue)</option>
                    <option value="under_review">Under Review (Assigned to Faculty)</option>
                    <option value="verified">Verified (Publish Directly to CBT Tests)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  {previewSummary.invalidRowsCount > 0 && (
                    <button
                      onClick={() => QuestionBankService.exportErrorsAsCSV(previewSummary.errors)}
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-rose-700 border border-rose-300 rounded-lg font-bold flex items-center justify-center space-x-1.5 shadow-2xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-600" />
                      <span>Export Rejection Log (.CSV)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inspection Sub Tabs */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 py-2 space-x-2">
                <button
                  onClick={() => setActivePreviewTab('valid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    activePreviewTab === 'valid'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid Sample Preview ({previewSummary.sampleValid.length})</span>
                </button>

                <button
                  onClick={() => setActivePreviewTab('duplicates')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    activePreviewTab === 'duplicates'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicates ({previewSummary.duplicateRowsCount})</span>
                </button>

                <button
                  onClick={() => setActivePreviewTab('errors')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    activePreviewTab === 'errors'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Validation Errors ({previewSummary.invalidRowsCount})</span>
                </button>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto bg-white space-y-3">
                {/* TAB 1: VALID SAMPLE */}
                {activePreviewTab === 'valid' && (
                  <div className="space-y-3">
                    {previewSummary.sampleValid.map((q, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-bold uppercase font-mono">
                              {q.subject_id}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                              {q.difficulty}
                            </span>
                            {q.is_code_reference && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                                {q.is_code_reference}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-emerald-700">Ans: Option {q.correct_answer}</span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 leading-relaxed">{q.question_text}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                          <div className={`p-1.5 rounded border ${q.correct_answer === 'A' ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-white border-slate-200'}`}>
                            <span className="font-bold text-slate-500 mr-1">A.</span> {q.option_a}
                          </div>
                          <div className={`p-1.5 rounded border ${q.correct_answer === 'B' ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-white border-slate-200'}`}>
                            <span className="font-bold text-slate-500 mr-1">B.</span> {q.option_b}
                          </div>
                          {q.option_c && (
                            <div className={`p-1.5 rounded border ${q.correct_answer === 'C' ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-white border-slate-200'}`}>
                              <span className="font-bold text-slate-500 mr-1">C.</span> {q.option_c}
                            </div>
                          )}
                          {q.option_d && (
                            <div className={`p-1.5 rounded border ${q.correct_answer === 'D' ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-white border-slate-200'}`}>
                              <span className="font-bold text-slate-500 mr-1">D.</span> {q.option_d}
                            </div>
                          )}
                        </div>

                        {q.explanation && (
                          <p className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100">
                            <span className="font-semibold text-slate-700">Explanation:</span> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: DUPLICATES */}
                {activePreviewTab === 'duplicates' && (
                  <div className="space-y-2">
                    {previewSummary.sampleDuplicates.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No duplicates found in this file!</p>
                    ) : (
                      previewSummary.sampleDuplicates.map((dup, i) => (
                        <div key={i} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-800">Row #{dup.rowNumber}</span>
                            <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium">
                              {dup.reason}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800">{dup.question.question_text}</p>
                          {dup.existingMatchId && (
                            <span className="text-[10px] text-slate-500 font-mono">Matched Existing ID: {dup.existingMatchId}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 3: ERRORS */}
                {activePreviewTab === 'errors' && (
                  <div className="space-y-2">
                    {previewSummary.errors.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No validation errors detected!</p>
                    ) : (
                      previewSummary.errors.map((err, i) => (
                        <div key={i} className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-rose-800">Row #{err.rowNumber} · Field: <code className="font-mono text-rose-950">{err.field}</code></span>
                            <span className="text-[11px] text-rose-700 font-semibold">{err.message}</span>
                          </div>
                          <pre className="text-[10px] text-slate-600 bg-white p-2 rounded border border-rose-100 overflow-x-auto">
                            {JSON.stringify(err.rawData, null, 2)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setStep('upload');
                  setUploadedFile(null);
                  setPreviewSummary(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
              >
                Choose Different File
              </button>

              <button
                onClick={handleExecuteImport}
                disabled={previewSummary.validRowsCount === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-sky-600 hover:bg-sky-500 text-white shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Confirm & Import {previewSummary.validRowsCount.toLocaleString()} Questions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE IMPORT PROGRESS */}
        {step === 'importing' && (
          <div className="py-10 px-4 max-w-xl mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-sm animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">Executing Scalable Batch Import...</h3>
              <p className="text-xs text-slate-500">
                Chunking questions into atomic {batchSize}-record blocks with SHA-256 duplicate verification and audit logging.
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${importProgress?.progressPercent || 25}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>{importProgress?.processed || 0} / {importProgress?.totalQuestions || previewSummary?.validRowsCount || 0} Records</span>
                <span>{importProgress?.progressPercent || 0}% Complete</span>
              </div>
            </div>

            {/* Metrics Counter */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Batch</span>
                <span className="font-bold text-slate-800 text-sm font-mono">
                  {importProgress?.currentBatch || 1} / {importProgress?.totalBatches || 1}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Imported</span>
                <span className="font-bold text-emerald-600 text-sm font-mono">
                  {importProgress?.imported || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Est. Time Left</span>
                <span className="font-bold text-sky-600 text-sm font-mono">
                  {importProgress?.estimatedRemainingMs ? `${(importProgress.estimatedRemainingMs / 1000).toFixed(1)}s` : 'Calculating...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: COMPLETED SUMMARY REPORT */}
        {step === 'completed' && importReport && (
          <div className="py-6 space-y-6 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Bulk Import Successfully Completed!</h3>
              <p className="text-xs text-slate-500">{importReport.message}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Total Imported</span>
                <span className="text-lg font-black text-emerald-700">{importReport.importedCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Execution Time</span>
                <span className="text-lg font-black text-slate-900">{importReport.durationSec}s</span>
              </div>
              <div>
                <span className="text-slate-400 block">Duplicates Skipped</span>
                <span className="text-lg font-black text-amber-700">{previewSummary?.duplicateRowsCount || 0}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setStep('upload');
                  setUploadedFile(null);
                  setPreviewSummary(null);
                  setImportReport(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Import Another File
              </button>

              <button
                onClick={() => onNavigateToRepository && onNavigateToRepository()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-extrabold bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Open Question Repository</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
