import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  BookOpen,
  Target,
  ExternalLink,
  Tag,
  CheckCircle
} from 'lucide-react';
import { VisualDiagram, DiagramHotspot, DiagramCategory } from '../types';
import { DiagramService } from '../services/diagramService';

interface VisualLearningViewProps {
  onOpenFormula?: (formulaId: string) => void;
  onOpenPractice?: (topic: string) => void;
}

export const VisualLearningView: React.FC<VisualLearningViewProps> = ({
  onOpenFormula,
  onOpenPractice,
}) => {
  const [diagrams, setDiagrams] = useState<VisualDiagram[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<VisualDiagram | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<DiagramHotspot | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDiagrams();
  }, [selectedCategory]);

  const loadDiagrams = async () => {
    setLoading(true);
    const data = await DiagramService.getDiagrams(selectedCategory === 'all' ? undefined : (selectedCategory as DiagramCategory));
    setDiagrams(data);
    if (data.length > 0 && !selectedDiagram) {
      setSelectedDiagram(data[0]);
      if (data[0].hotspots.length > 0) {
        setSelectedHotspot(data[0].hotspots[0]);
      }
    }
    setLoading(false);
  };

  const renderSvgModel = (type: VisualDiagram['svgType']) => {
    switch (type) {
      case 'rcc_stress_block':
        return (
          <svg viewBox="0 0 600 360" className="w-full h-full select-none">
            <defs>
              <linearGradient id="concreteGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="stressGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Beam Cross Section */}
            <rect x="40" y="40" width="120" height="260" fill="url(#concreteGrad)" stroke="#94a3b8" strokeWidth="2" rx="4" />
            <text x="100" y="30" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">Beam Width b</text>
            <text x="25" y="170" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold" transform="rotate(-90 25 170)">Depth d</text>

            {/* Rebar Circles */}
            <circle cx="65" cy="270" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="100" cy="270" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="135" cy="270" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <text x="100" y="295" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">Tensile Steel Ast</text>

            {/* Neutral Axis Line */}
            <line x1="20" y1="160" x2="560" y2="160" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" />
            <text x="50" y="152" fill="#38bdf8" fontSize="11" fontWeight="bold">Neutral Axis (N.A.)</text>

            {/* Strain Diagram */}
            <line x1="220" y1="40" x2="220" y2="280" stroke="#64748b" strokeWidth="2" />
            {/* Strain Profile Line */}
            <line x1="260" y1="40" x2="180" y2="270" stroke="#38bdf8" strokeWidth="3" />
            <text x="265" y="45" fill="#38bdf8" fontSize="11" fontWeight="bold">ε_cu = 0.0035</text>
            <text x="175" y="285" fill="#f87171" fontSize="10" fontWeight="bold">ε_st ≥ 0.87fy/Es + 0.002</text>

            {/* Stress Block Profile */}
            {/* Rectangular top (3/7 xu = 50px) */}
            <rect x="360" y="40" width="140" height="50" fill="url(#stressGrad)" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Parabolic bottom (4/7 xu = 70px) */}
            <path d="M 360,90 C 450,90 490,130 500,160 L 360,160 Z" fill="url(#stressGrad)" stroke="#f59e0b" strokeWidth="1.5" />
            
            {/* Stress Labels */}
            <text x="430" y="30" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold">0.446 f_ck</text>
            
            {/* Compressive Resultant Arrow */}
            <line x1="420" y1="90" x2="520" y2="90" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow)" />
            <text x="525" y="94" fill="#34d399" fontSize="11" fontWeight="bold">C = 0.36 fck b xu</text>

            {/* Tensile Resultant Arrow */}
            <line x1="360" y1="270" x2="480" y2="270" stroke="#ef4444" strokeWidth="3" />
            <text x="490" y="274" fill="#f87171" fontSize="11" fontWeight="bold">T = 0.87 fy Ast</text>

            {/* Lever Arm Line */}
            <line x1="330" y1="90" x2="330" y2="270" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4 4" />
            <text x="320" y="185" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="bold" transform="rotate(-90 320 185)">z = d - 0.42 xu</text>
          </svg>
        );

      case 'soil_phase':
        return (
          <svg viewBox="0 0 600 360" className="w-full h-full select-none">
            {/* Air phase */}
            <rect x="180" y="40" width="240" height="60" fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2" />
            <text x="300" y="75" textAnchor="middle" fill="#7dd3fc" fontSize="14" fontWeight="bold">AIR (Va, Wa = 0)</text>

            {/* Water phase */}
            <rect x="180" y="100" width="240" height="90" fill="#0284c7" fillOpacity="0.45" stroke="#0284c7" strokeWidth="2" />
            <text x="300" y="150" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold">WATER (Vw, Ww)</text>

            {/* Solid phase */}
            <rect x="180" y="190" width="240" height="130" fill="#b45309" fillOpacity="0.6" stroke="#d97706" strokeWidth="2" />
            <text x="300" y="260" textAnchor="middle" fill="#fcd34d" fontSize="14" fontWeight="bold">SOIL SOLIDS (Vs, Ws)</text>

            {/* Volume side */}
            <line x1="140" y1="40" x2="140" y2="320" stroke="#94a3b8" strokeWidth="2" />
            <text x="90" y="180" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="bold" transform="rotate(-90 90 180)">Total Volume V</text>
            <text x="130" y="75" textAnchor="end" fill="#7dd3fc" fontSize="11">Va</text>
            <text x="130" y="150" textAnchor="end" fill="#38bdf8" fontSize="11">Vw</text>
            <text x="130" y="260" textAnchor="end" fill="#fcd34d" fontSize="11">Vs</text>

            {/* Weight side */}
            <line x1="460" y1="40" x2="460" y2="320" stroke="#94a3b8" strokeWidth="2" />
            <text x="510" y="180" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="bold" transform="rotate(90 510 180)">Total Weight W</text>
            <text x="475" y="75" textAnchor="start" fill="#94a3b8" fontSize="11">Wa = 0</text>
            <text x="475" y="150" textAnchor="start" fill="#38bdf8" fontSize="11">Ww</text>
            <text x="475" y="260" textAnchor="start" fill="#fcd34d" fontSize="11">Ws</text>
          </svg>
        );

      case 'mohr_circle':
        return (
          <svg viewBox="0 0 600 360" className="w-full h-full select-none">
            {/* Axes */}
            <line x1="40" y1="180" x2="560" y2="180" stroke="#64748b" strokeWidth="2" />
            <line x1="300" y1="20" x2="300" y2="340" stroke="#64748b" strokeWidth="2" />
            <text x="550" y="170" fill="#94a3b8" fontSize="12" fontWeight="bold">σ (Normal)</text>
            <text x="310" y="35" fill="#94a3b8" fontSize="12" fontWeight="bold">τ (Shear)</text>

            {/* Circle */}
            <circle cx="340" cy="180" r="110" fill="#6366f1" fillOpacity="0.15" stroke="#818cf8" strokeWidth="2.5" />

            {/* Center Point */}
            <circle cx="340" cy="180" r="5" fill="#f59e0b" />
            <text x="340" y="200" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">C (σ_avg, 0)</text>

            {/* Principal Stresses */}
            <circle cx="450" cy="180" r="5" fill="#10b981" />
            <text x="460" y="170" fill="#34d399" fontSize="12" fontWeight="bold">σ_1 (Major)</text>

            <circle cx="230" cy="180" r="5" fill="#ef4444" />
            <text x="210" y="170" textAnchor="end" fill="#f87171" fontSize="12" fontWeight="bold">σ_2 (Minor)</text>

            {/* Max Shear Stress */}
            <line x1="340" y1="180" x2="340" y2="70" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="340" cy="70" r="5" fill="#f43f5e" />
            <text x="350" y="75" fill="#fb7185" fontSize="11" fontWeight="bold">τ_max = Radius R</text>
          </svg>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            Interactive Visual Model Ready
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-sky-900 to-slate-900 rounded-2xl p-6 text-white border border-sky-700/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Engineering Diagrams & Hotspot Exploration</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Visual Civil Engineering Lab</h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Understand complex stress distributions, soil phase relationships, Mohr's circle, and highway cross-sections through interactive labeled diagrams.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Diagram Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs uppercase font-bold text-sky-400 mb-3 tracking-wider">
              Select Engineering Diagram
            </h3>
            <div className="space-y-2">
              {diagrams.map((diag) => {
                const isSelected = selectedDiagram?.id === diag.id;
                return (
                  <div
                    key={diag.id}
                    onClick={() => {
                      setSelectedDiagram(diag);
                      setSelectedHotspot(diag.hotspots[0] || null);
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-sky-500/80 shadow-md ring-1 ring-sky-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-sky-400">
                        {diag.categoryName}
                      </span>
                      {diag.isCodeReference && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {diag.isCodeReference}
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-semibold mt-1 ${isSelected ? 'text-sky-300' : 'text-white'}`}>
                      {diag.title}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Diagram Canvas & Hotspot Detail (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedDiagram && (
            <>
              {/* Interactive Diagram Canvas */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedDiagram.title}</h2>
                    <p className="text-xs text-slate-400">{selectedDiagram.caption}</p>
                  </div>
                  {selectedDiagram.isCodeReference && (
                    <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-lg text-amber-300 border border-slate-700">
                      {selectedDiagram.isCodeReference}
                    </span>
                  )}
                </div>

                {/* SVG Container with Hotspots */}
                <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center justify-center min-h-[380px] overflow-hidden">
                  <div
                    style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
                    className="w-full max-w-[600px] h-[360px] relative"
                  >
                    {renderSvgModel(selectedDiagram.svgType)}

                    {/* Interactive Hotspot Pins */}
                    {selectedDiagram.hotspots.map((hs, index) => {
                      const isSelected = selectedHotspot?.id === hs.id;
                      return (
                        <button
                          key={hs.id}
                          onClick={() => setSelectedHotspot(hs)}
                          style={{ left: `${hs.xPercent}%`, top: `${hs.yPercent}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-lg ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 scale-125 z-20 animate-pulse'
                              : 'bg-sky-500 text-white hover:bg-sky-400 hover:scale-110 z-10'
                          }`}
                          title={hs.label}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Click numbered hotspot pins to inspect parameters</span>
                  <span>Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Selected Hotspot Explanation Card */}
              {selectedHotspot && (
                <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                        Hotspot Focus
                      </span>
                      <h3 className="text-base font-bold text-white">{selectedHotspot.label}</h3>
                    </div>
                    {selectedHotspot.codeReference && (
                      <span className="text-xs font-mono text-amber-400 bg-slate-800 px-2.5 py-1 rounded">
                        {selectedHotspot.codeReference}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedHotspot.description}
                  </p>

                  {selectedHotspot.formulaRelation && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
                      <strong>Mathematical Formulation: </strong>
                      {selectedHotspot.formulaRelation}
                    </div>
                  )}

                  {selectedDiagram.linkedFormulaId && onOpenFormula && (
                    <div className="pt-2 flex gap-3">
                      <button
                        onClick={() => onOpenFormula(selectedDiagram.linkedFormulaId!)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600/30 text-sky-300 border border-sky-500/40 hover:bg-sky-600/50 flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Open Formula in Live Formula Lab</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Key Takeaways */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
                  High-Yield Exam Takeaways
                </h4>
                <div className="space-y-2">
                  {selectedDiagram.keyTakeaways.map((takeaway, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
