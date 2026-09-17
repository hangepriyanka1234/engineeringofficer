import React, { useState, useEffect } from 'react';
import {
  HardHat,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  ShieldAlert,
  Search,
  BookOpen,
  Scale,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { SitePracticalLesson, SitePracticalCategory } from '../types';
import { SitePracticalService } from '../services/sitePracticalService';

interface SitePracticalViewProps {
  onOpenPractice?: (topic: string) => void;
}

export const SitePracticalView: React.FC<SitePracticalViewProps> = ({ onOpenPractice }) => {
  const [lessons, setLessons] = useState<SitePracticalLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<SitePracticalLesson | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'procedure' | 'checkpoints' | 'mistakes' | 'viva' | 'mcqs'>('procedure');
  const [loading, setLoading] = useState(true);

  // Selected MCQ state for testing
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [showMcqExplanations, setShowMcqExplanations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadLessons();
  }, [selectedCategory]);

  const loadLessons = async () => {
    setLoading(true);
    const data = await SitePracticalService.getLessons(selectedCategory === 'all' ? undefined : (selectedCategory as SitePracticalCategory));
    setLessons(data);
    if (data.length > 0 && !selectedLesson) {
      setSelectedLesson(data[0]);
    }
    setLoading(false);
  };

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'concrete_testing', label: 'Concrete Testing' },
    { id: 'reinforcement_bbs', label: 'Reinforcement & BBS' },
    { id: 'surveying_instruments', label: 'Surveying & TS' },
    { id: 'highways_pavements', label: 'Highway Construction' },
    { id: 'foundations_columns', label: 'Foundations & Columns' },
  ];

  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.isCodeReference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 text-white shadow-lg border border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-xs font-semibold text-amber-200">
              <HardHat className="w-3.5 h-3.5 text-amber-300" />
              <span>Executive Site Engineer Practical Mode • IS/IRC Field Standards</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Site Execution, Field Tests & BBS Lab</h1>
            <p className="text-amber-100 text-sm max-w-2xl">
              Bridge the gap between textbook theory and real civil engineering construction. Step-by-step test procedures, IS Code tolerance limits, viva voce prep, and common site blunders.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10">
            <Award className="w-8 h-8 text-amber-300" />
            <div>
              <div className="text-xs text-amber-200 uppercase font-semibold">Field Quality Ready</div>
              <div className="text-lg font-bold text-white">15 Modules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Lesson Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Category Filter & Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search test, IS code or procedure..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lesson Cards List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredLessons.map((lesson) => {
              const isSelected = selectedLesson?.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setActiveTab('procedure');
                    setMcqAnswers({});
                    setShowMcqExplanations({});
                  }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1.5">
                        {lesson.categoryLabel}
                      </span>
                      <h3 className={`text-sm font-semibold leading-snug ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{lesson.objective}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-amber-400/90">{lesson.isCodeReference}</span>
                    <span className="text-slate-500">{lesson.vivaVoceQuestions.length} Viva Qs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Lesson Detail (8 cols) */}
        <div className="lg:col-span-8">
          {selectedLesson ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Top Banner */}
              <div className="p-6 bg-gradient-to-b from-slate-800/80 to-slate-900 border-b border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {selectedLesson.categoryLabel}
                  </span>
                  <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-lg text-slate-300 border border-slate-700">
                    IS/IRC: {selectedLesson.isCodeReference}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{selectedLesson.title}</h2>
                <p className="text-sm text-slate-300">{selectedLesson.objective}</p>

                {/* Practical Tip Callout */}
                <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200">
                    <strong className="text-amber-300 font-semibold">Chief Engineer Field Tip: </strong>
                    {selectedLesson.practicalTip}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-900/90 px-4 overflow-x-auto">
                {[
                  { id: 'procedure', label: 'Field Procedure & Apparatus', icon: BookOpen },
                  { id: 'checkpoints', label: 'Quality Checkpoints', icon: CheckCircle2 },
                  { id: 'mistakes', label: 'Site Blunders & Safety', icon: AlertTriangle },
                  { id: 'viva', label: 'Interview Viva Voce', icon: HelpCircle },
                  { id: 'mcqs', label: 'Exam MCQs', icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                        isActive
                          ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6 space-y-6">
                {activeTab === 'procedure' && (
                  <div className="space-y-6">
                    {/* Apparatus & Materials */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        <span>Required Tools, Instruments & Materials</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedLesson.equipmentAndMaterials.map((eq, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs text-slate-200">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{eq}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step-by-Step Field Method */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Standard Field Procedure (Step-by-Step)</span>
                      </h4>
                      <div className="space-y-2.5">
                        {selectedLesson.fieldProcedure.map((step, idx) => (
                          <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-200 leading-relaxed">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observations & Calculations */}
                    <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        {selectedLesson.observationsAndCalculations.title}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {selectedLesson.observationsAndCalculations.steps.map((st, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                      {selectedLesson.observationsAndCalculations.sampleCalculation && (
                        <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
                          {selectedLesson.observationsAndCalculations.sampleCalculation}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'checkpoints' && (
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-2">
                      Mandatory Quality & Codal Inspection Checkpoints
                    </h4>
                    <div className="space-y-3">
                      {selectedLesson.qualityCheckpoints.map((qc) => (
                        <div key={qc.id} className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-white">{qc.checkItem}</span>
                            {qc.mandatory && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                MANDATORY
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/60">
                            <span>Standard Limit: <strong className="text-amber-300">{qc.toleranceOrStandard}</strong></span>
                            <span className="font-mono text-slate-400">{qc.isCodeClause}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'mistakes' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-bold text-rose-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Common Site Blunders & Failures</span>
                      </h4>
                      <div className="space-y-3">
                        {selectedLesson.commonSiteMistakes.map((m, i) => (
                          <div key={i} className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-2">
                            <div className="font-bold text-sm text-rose-300">❌ {m.mistakeTitle}</div>
                            <div className="text-xs text-slate-300"><strong className="text-rose-400">Consequence:</strong> {m.consequence}</div>
                            <div className="text-xs text-emerald-300 pt-1.5 border-t border-rose-900/40">
                              <strong>Correct Field Method:</strong> {m.correctAction}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Site Safety & Personal Protective Equipment (PPE)</span>
                      </h4>
                      <div className="space-y-2">
                        {selectedLesson.safetyPrecautions.map((safe, i) => (
                          <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-800/40 rounded-lg border border-slate-700 text-xs text-slate-300">
                            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span>{safe}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'viva' && (
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-sky-400 mb-2">
                      Official PWD / WRD / BMC Interview Viva Voce Questions
                    </h4>
                    <div className="space-y-3">
                      {selectedLesson.vivaVoceQuestions.map((v, i) => (
                        <div key={i} className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                          <div className="text-sm font-bold text-white flex items-start gap-2">
                            <span className="text-sky-400">Q{i + 1}.</span>
                            <span>{v.question}</span>
                          </div>
                          <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                            <strong className="text-emerald-400">Model Answer: </strong>
                            {v.answer}
                          </div>
                          {v.interviewerTip && (
                            <div className="text-[11px] text-amber-300 font-medium pl-2 border-l-2 border-amber-500">
                              💡 Examiner's Focus: {v.interviewerTip}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'mcqs' && (
                  <div className="space-y-6">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">
                      Competitive Examination Questions Related to this Field Test
                    </h4>
                    <div className="space-y-4">
                      {selectedLesson.relatedExamMcqs.map((mcq, qIdx) => {
                        const selectedOpt = mcqAnswers[qIdx];
                        const isRevealed = showMcqExplanations[qIdx];

                        return (
                          <div key={qIdx} className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
                            <div className="text-sm font-semibold text-white">
                              {qIdx + 1}. {mcq.question}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {mcq.options.map((opt, optIdx) => {
                                const isOptionSelected = selectedOpt === optIdx;
                                const isCorrect = optIdx === mcq.correctIndex;
                                let btnClass = 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-750';

                                if (isRevealed) {
                                  if (isCorrect) {
                                    btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                                  } else if (isOptionSelected) {
                                    btnClass = 'bg-rose-950/80 border-rose-500 text-rose-200';
                                  }
                                } else if (isOptionSelected) {
                                  btnClass = 'bg-amber-600/30 border-amber-500 text-amber-200 font-semibold';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => {
                                      setMcqAnswers({ ...mcqAnswers, [qIdx]: optIdx });
                                      setShowMcqExplanations({ ...showMcqExplanations, [qIdx]: true });
                                    }}
                                    className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnClass}`}
                                  >
                                    <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                    {isRevealed && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                  </button>
                                );
                              })}
                            </div>

                            {isRevealed && (
                              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                                <strong className="text-amber-400">IS Code Explanation: </strong>
                                {mcq.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Select a site engineer module from the list to view field details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
