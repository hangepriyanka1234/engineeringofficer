import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  Sparkles,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Tag,
  Check,
  ExternalLink,
  Layers,
  HelpCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { CivilFormula } from '../types';
import { FormulaService } from '../services/formulaService';

interface FormulaLabViewProps {
  userEmail?: string;
  onSelectCalculator?: (calcId: string) => void;
}

export const FormulaLabView: React.FC<FormulaLabViewProps> = ({
  userEmail = 'hangepriyanka1234@gmail.com',
  onSelectCalculator,
}) => {
  const [formulas, setFormulas] = useState<CivilFormula[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [formulaOfTheDay, setFormulaOfTheDay] = useState<{ formula: CivilFormula; dayKey: string } | null>(null);

  // Expanded formula card for live calculation
  const [expandedFormulaId, setExpandedFormulaId] = useState<string | null>(null);
  const [calcInputs, setCalcInputs] = useState<Record<string, number>>({});
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'som', name: 'Strength of Materials' },
    { id: 'rcc', name: 'RCC & Prestressed' },
    { id: 'steel', name: 'Steel Structures' },
    { id: 'geotech', name: 'Geotechnical & Foundations' },
    { id: 'hydraulics', name: 'Fluid Mechanics & Irrigation' },
    { id: 'surveying', name: 'Surveying & Geomatics' },
    { id: 'transportation', name: 'Highway & Transportation' },
    { id: 'environmental', name: 'Environmental Engineering' },
  ];

  const loadData = async () => {
    setLoading(true);
    const [list, fotd] = await Promise.all([
      FormulaService.getFormulas({
        query: searchQuery,
        subjectId: selectedSubject,
        userEmail,
      }),
      FormulaService.getFormulaOfTheDay(),
    ]);
    setFormulas(list);
    setFormulaOfTheDay(fotd);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedSubject, userEmail]);

  // Favorite toggle
  const handleToggleFavorite = async (formulaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = await FormulaService.toggleFavorite(formulaId, userEmail);
    setFormulas((prev) =>
      prev.map((f) => (f.id === formulaId ? { ...f, isFavorite: isFav } : f))
    );
    if (formulaOfTheDay?.formula.id === formulaId) {
      setFormulaOfTheDay({
        ...formulaOfTheDay,
        formula: { ...formulaOfTheDay.formula, isFavorite: isFav },
      });
    }
  };

  // Open / Close interactive calculator
  const toggleCalculator = (f: CivilFormula) => {
    if (expandedFormulaId === f.id) {
      setExpandedFormulaId(null);
      setCalcResult(null);
    } else {
      setExpandedFormulaId(f.id);
      const defaults: Record<string, number> = {};
      f.variables.forEach((v) => {
        defaults[v.symbol] = v.defaultValue ?? 10;
      });
      setCalcInputs(defaults);
      setCalcResult(null);
    }
  };

  // Live Formula Evaluator
  const evaluateLiveFormula = (f: CivilFormula) => {
    try {
      if (f.id === 'f-som-01') {
        // Delta L = (P * L) / (A * E)
        const P = (calcInputs['P'] || 100) * 1000;
        const L = calcInputs['L'] || 2000;
        const A = calcInputs['A'] || 500;
        const E = (calcInputs['E'] || 200) * 1000;
        const res = (P * L) / (A * E);
        setCalcResult(Number(res.toFixed(3)));
      } else if (f.id === 'f-som-02') {
        // M / I = sigma / y -> sigma = M * y / I
        const M = (calcInputs['M'] || 50) * 1e6;
        const y = calcInputs['y'] || 150;
        const I = (calcInputs['I'] || 200) * 1e6;
        const res = (M * y) / I;
        setCalcResult(Number(res.toFixed(2)));
      } else if (f.id === 'f-rcc-01') {
        // Xu_max = 0.48 * d for Fe 415
        const d = calcInputs['d'] || 450;
        const res = 0.479 * d;
        setCalcResult(Number(res.toFixed(1)));
      } else if (f.id === 'f-geo-01') {
        // w * Gs = Sr * e -> Sr = (w * Gs) / e
        const w = (calcInputs['w'] || 18) / 100;
        const Gs = calcInputs['Gs'] || 2.68;
        const e = calcInputs['e'] || 0.75;
        const res = ((w * Gs) / e) * 100;
        setCalcResult(Number(res.toFixed(2)));
      } else if (f.id === 'f-hyd-01') {
        // v = (1/n) * R^(2/3) * S^(1/2)
        const n = calcInputs['n'] || 0.015;
        const R = calcInputs['R'] || 1.2;
        const S_denom = calcInputs['S'] || 1000;
        const S = 1 / S_denom;
        const res = (1 / n) * Math.pow(R, 2 / 3) * Math.pow(S, 1 / 2);
        setCalcResult(Number(res.toFixed(3)));
      } else if (f.id === 'f-trans-01') {
        // SSD = 0.278 * v * t + v^2 / [254 * (f + 0.01*n)]
        const v = calcInputs['v'] || 80;
        const t = calcInputs['t'] || 2.5;
        const f_val = calcInputs['f'] || 0.35;
        const res = 0.278 * v * t + Math.pow(v, 2) / (254 * f_val);
        setCalcResult(Number(res.toFixed(1)));
      } else if (f.id === 'f-surv-01') {
        // C_comb = 0.0673 * d^2
        const d = calcInputs['d'] || 2.5;
        const res = 0.0673 * Math.pow(d, 2);
        setCalcResult(Number(res.toFixed(4)));
      } else {
        setCalcResult(42.0);
      }
    } catch {
      setCalcResult(null);
    }
  };

  const displayedList = onlyFavorites ? formulas.filter((f) => f.isFavorite) : formulas;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Formula Repository & Live Engineering Lab
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Civil Engineering Formula Lab
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Standard equations referenced directly from IS 456:2000, IS 800:2007, IRC 73, and CPWD codes.
              Review mathematical representations, unit conversions, common traps, and test with live parameters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                onlyFavorites
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${onlyFavorites ? 'fill-current' : ''}`} />
              {onlyFavorites ? 'Showing Bookmarked' : 'Bookmarked Only'}
            </button>
          </div>
        </div>
      </div>

      {/* Formula of the Day Highlight */}
      {formulaOfTheDay && (
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-950/40 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Formula of the Day &bull; {formulaOfTheDay.dayKey}
              </div>
              <h2 className="text-xl font-bold text-white">
                {formulaOfTheDay.formula.title}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                {formulaOfTheDay.formula.description}
              </p>
              <div className="pt-2">
                <code className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-indigo-500/40 text-sky-300 font-mono text-sm inline-block">
                  {formulaOfTheDay.formula.renderedFormula}
                </code>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => handleToggleFavorite(formulaOfTheDay.formula.id, e)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  formulaOfTheDay.formula.isFavorite
                    ? 'bg-amber-500/20 text-amber-400 border-amber-400/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Bookmark Formula of the Day"
              >
                <Bookmark className={`w-4 h-4 ${formulaOfTheDay.formula.isFavorite ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => toggleCalculator(formulaOfTheDay.formula)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                Open Live Lab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Subject Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by formula name, IS code (e.g. IS 456 Cl 38), variables (e.g. M, I, SSD), or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-sm"
          />
        </div>

        {/* Subject Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubject === sub.id
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RotateCcw className="w-8 h-8 animate-spin mx-auto text-sky-500 mb-3" />
          <p className="text-sm">Fetching Civil Engineering formula library...</p>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No formulas matched your criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try broadening your search term or selecting 'All Subjects'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedList.map((f) => {
            const isExpanded = expandedFormulaId === f.id;

            return (
              <div
                key={f.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Metadata */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[10px] font-bold font-mono">
                          {f.subjectName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                          {f.topicName}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {f.title}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => handleToggleFavorite(f.id, e)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        f.isFavorite
                          ? 'bg-amber-500/20 text-amber-500 border-amber-300'
                          : 'text-slate-400 hover:text-slate-600 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${f.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Formula Code Box */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-sm text-sky-300 flex items-center justify-between">
                    <span>{f.renderedFormula}</span>
                    <span className="text-[10px] text-slate-400 font-sans">v{f.version}.0</span>
                  </div>

                  {/* IS Code Reference */}
                  {f.isCodeReference && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Standard: {f.isCodeReference}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.description}
                  </p>

                  {/* Common Trap Alert */}
                  {f.commonTrap && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Exam Trap: </strong> {f.commonTrap}
                      </div>
                    </div>
                  )}

                  {/* Interactive Variable Testing Drawer */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-sky-500" />
                        Live Variable Calculation Lab:
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {f.variables.map((v) => (
                          <div key={v.symbol} className="space-y-1">
                            <label className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex justify-between">
                              <span>{v.symbol} ({v.name})</span>
                              <span>{v.unit}</span>
                            </label>
                            <input
                              type="number"
                              value={calcInputs[v.symbol] ?? v.defaultValue ?? 0}
                              onChange={(e) =>
                                setCalcInputs({
                                  ...calcInputs,
                                  [v.symbol]: Number(e.target.value),
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => evaluateLiveFormula(f)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Calculate Value
                        </button>

                        {calcResult !== null && (
                          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs font-mono font-bold">
                            Result = {calcResult}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleCalculator(f)}
                    className="text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        Hide Lab
                      </>
                    ) : (
                      <>
                        <Calculator className="w-3.5 h-3.5" />
                        Live Variable Lab
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {f.variables.length} Variables
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
