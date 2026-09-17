import React, { useState, useEffect } from 'react';
import {
  Calculator,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  HelpCircle,
  TrendingUp,
  Cpu,
  Compass,
  Building2,
  HardHat,
  Search,
  Check,
  X,
  FileCheck,
} from 'lucide-react';
import {
  CivilCalculatorDef,
  CalculatorExecutionResult,
  CalculatorNumericalTest,
} from '../types';
import { CalculatorService } from '../services/calculatorService';

export const CalculatorSuiteView: React.FC = () => {
  const [calculators, setCalculators] = useState<CivilCalculatorDef[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCalcId, setSelectedCalcId] = useState<string>('calc-stress-strain');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Input states for active calculator
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<CalculatorExecutionResult | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);

  // Automated Numerical Test Suite State
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [runningTests, setRunningTests] = useState<boolean>(false);
  const [testSuiteData, setTestSuiteData] = useState<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: CalculatorNumericalTest[];
  } | null>(null);

  const categories = [
    { id: 'all', label: 'All 12 Calculators' },
    { id: 'stress_strain', label: 'SOM & Mechanics' },
    { id: 'beams', label: 'Structural Beams' },
    { id: 'concrete', label: 'Concrete & Mix Design' },
    { id: 'reinforcement', label: 'RCC & Bar Bending' },
    { id: 'earthwork', label: 'Earthwork & Surveying' },
    { id: 'hydraulics', label: 'Hydraulics & Fluids' },
    { id: 'soil', label: 'Geotechnical Soil' },
    { id: 'highway', label: 'Highway & SSD' },
    { id: 'estimation', label: 'Quantity Estimation' },
    { id: 'units', label: 'Unit Conversions' },
  ];

  // Fetch all calculators on mount
  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      const list = await CalculatorService.getCalculators();
      setCalculators(list);
      if (list.length > 0) {
        const initial = list.find((c) => c.id === 'calc-stress-strain') || list[0];
        setSelectedCalcId(initial.id);
        setInputs(initial.defaultValues);
        // initial execution
        const res = await CalculatorService.execute(initial.id, initial.defaultValues);
        setExecutionResult(res);
      }
      setLoading(false);
    };
    fetchList();
  }, []);

  // When selected calculator changes
  const handleSelectCalculator = async (calc: CivilCalculatorDef) => {
    setSelectedCalcId(calc.id);
    setInputs(calc.defaultValues);
    setCalculating(true);
    const res = await CalculatorService.execute(calc.id, calc.defaultValues);
    setExecutionResult(res);
    setCalculating(false);
  };

  // When inputs change -> re-calculate
  const handleInputChange = async (key: string, value: any) => {
    const updated = { ...inputs, [key]: value };
    setInputs(updated);
    setCalculating(true);
    const res = await CalculatorService.execute(selectedCalcId, updated);
    setExecutionResult(res);
    setCalculating(false);
  };

  // Run automated tests
  const handleRunNumericalTestSuite = async () => {
    setTestModalOpen(true);
    setRunningTests(true);
    const data = await CalculatorService.runNumericalTests();
    setTestSuiteData(data);
    setRunningTests(false);
  };

  const activeCalc = calculators.find((c) => c.id === selectedCalcId);

  const filteredCalculators = calculators.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              12 Engineering Suites & Automated Verification Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Civil Engineering Calculator Suite
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Standard civil computation modules calibrated to Indian Standard codes (IS 456, IS 800, IRC 73, IS 2720).
              Featuring live parameter tuning, step-by-step mathematical proofs, and diagnostic limit warnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-run-calc-tests"
              onClick={handleRunNumericalTestSuite}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Run Numerical Verification Tests
            </button>
          </div>
        </div>
      </div>

      {/* Category Chips & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Selector Sidebar + Active Calculator Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of 12 Calculators */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
            Engineering Calculators ({filteredCalculators.length})
          </div>

          <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
            {filteredCalculators.map((c) => {
              const isSelected = c.id === selectedCalcId;
              return (
                <button
                  key={c.id}
                  id={`calc-btn-${c.id}`}
                  onClick={() => handleSelectCalculator(c)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col space-y-1 ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-semibold">
                      {c.categoryName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {c.testCases.length} Tests
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {c.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {c.shortDesc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Studio Area */}
        <div className="lg:col-span-8 space-y-6">
          {activeCalc ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Active Calculator Header */}
              <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[11px] font-bold font-mono">
                    {activeCalc.categoryName}
                  </span>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {activeCalc.isCodeStandard}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {activeCalc.name}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activeCalc.shortDesc}
                </p>

                {/* Primary Formula Box */}
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-sky-300">
                  {activeCalc.primaryFormula}
                </div>
              </div>

              {/* Input Controls Grid */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Input Parameters:</span>
                  <button
                    onClick={() => {
                      setInputs(activeCalc.defaultValues);
                      CalculatorService.execute(activeCalc.id, activeCalc.defaultValues).then(
                        setExecutionResult
                      );
                    }}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCalc.inputs.map((inp) => (
                    <div key={inp.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                        <span>{inp.label}</span>
                        {inp.unit && <span className="font-mono text-slate-400">[{inp.unit}]</span>}
                      </label>

                      {inp.type === 'select' ? (
                        <select
                          value={inputs[inp.key] ?? inp.defaultValue}
                          onChange={(e) => handleInputChange(inp.key, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
                        >
                          {inp.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={inputs[inp.key] ?? inp.defaultValue}
                          min={inp.min}
                          max={inp.max}
                          step={inp.step || 'any'}
                          onChange={(e) => handleInputChange(inp.key, Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Outputs & Results */}
              {executionResult && (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Computed Outputs:</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Calculated in {executionResult.executionTimeMs} ms
                    </span>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {executionResult.outputs.map((out) => (
                      <div
                        key={out.key}
                        className={`p-3.5 rounded-xl border ${
                          out.highlight
                            ? 'bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border-sky-400 dark:border-sky-700 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {out.label}
                        </div>
                        <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                          {out.formatted}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Validation Errors */}
                  {executionResult.validationErrors.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <X className="w-4 h-4 text-rose-600" />
                        Input Validation Error:
                      </div>
                      {executionResult.validationErrors.map((err, idx) => (
                        <div key={idx}>&bull; {err}</div>
                      ))}
                    </div>
                  )}

                  {/* Code Standard Warnings */}
                  {executionResult.warnings.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Code Limit & Permissible Warning:
                      </div>
                      {executionResult.warnings.map((warn, idx) => (
                        <div key={idx}>&bull; {warn}</div>
                      ))}
                    </div>
                  )}

                  {/* Step-by-Step Mathematical Proof */}
                  {executionResult.calculationSteps.length > 0 && (
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-xs font-bold font-mono text-sky-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        Step-by-Step Mathematical Derivation & Proof:
                      </div>
                      <div className="space-y-1.5 font-mono text-xs text-slate-300">
                        {executionResult.calculationSteps.map((st, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {st}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Educational Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Educational Scope Disclaimer: </strong> This calculator suite is developed specifically for Civil Engineering competitive exam preparation (Maha PWD, WRD, GATE, ESE, SSC JE). For real-world structural design, always verify with latest Indian Standard codes and structural blueprints.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a calculator to begin.
            </div>
          )}
        </div>
      </div>

      {/* Automated Numerical Test Runner Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Automated Numerical Test Suite Results
                </h3>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {runningTests ? (
              <div className="py-12 text-center text-slate-400">
                <RotateCcw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-3" />
                <p className="text-sm">Running verified numerical calculations across all 12 suites...</p>
              </div>
            ) : testSuiteData ? (
              <div className="space-y-4">
                {/* Score Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                    <div className="text-xs text-slate-500">Total Test Cases</div>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      {testSuiteData.totalTests}
                    </div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="text-xs text-emerald-600">Passed Tests</div>
                    <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      {testSuiteData.passedTests}
                    </div>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                    <div className="text-xs text-rose-600">Failed / Discrepancies</div>
                    <div className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300">
                      {testSuiteData.failedTests}
                    </div>
                  </div>
                </div>

                {/* Test details list */}
                <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
                  {testSuiteData.results.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs space-y-1 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {t.testName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          ID: {t.calculatorId} &bull; Tolerance: {(t.tolerance * 100).toFixed(1)}%
                        </div>
                      </div>

                      <div className="shrink-0">
                        {t.status === 'passed' ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold font-mono flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            PASSED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold font-mono flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            FAILED
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl"
              >
                Close Verification Suite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
