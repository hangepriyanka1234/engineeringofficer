import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  FileCode2,
  Calculator,
  RotateCcw,
  User,
  Check,
  Copy,
  Layers,
  HardHat,
  Globe2,
  Database,
  ShieldCheck,
  Trash2,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  StudentProfile,
  ExamTargetId,
  AILanguage,
  AITutorQueryType,
  AITutorNumericalSolution,
  AICacheStats,
  PregeneratedExplanation
} from '../types';
import { EXAM_CATALOGUE, SUBJECTS_LIST } from '../data/mockData';
import { AITutorService } from '../services/aiTutorService';

interface AICoachViewProps {
  profile: StudentProfile;
  selectedExam: ExamTargetId;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  isCodeReference?: string;
  numericalSolution?: AITutorNumericalSolution;
  cached?: boolean;
  pregenerated?: boolean;
  officialNotice?: string;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ profile, selectedExam }) => {
  const currentExam = EXAM_CATALOGUE.find((e) => e.id === selectedExam) || EXAM_CATALOGUE[4];

  const [inputMessage, setInputMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('RCC & Prestressed Concrete');
  const [selectedLanguage, setSelectedLanguage] = useState<AILanguage>((profile.preferredLanguage as any) || 'en');
  const [queryType, setQueryType] = useState<AITutorQueryType>('concept');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'library' | 'cacheStats'>('chat');

  // Quota & Cache Stats
  const [remainingQuota, setRemainingQuota] = useState<number>(10);
  const [quotaLimit, setQuotaLimit] = useState<number>(10);
  const [cacheStats, setCacheStats] = useState<AICacheStats | null>(null);
  const [pregeneratedList, setPregeneratedList] = useState<PregeneratedExplanation[]>([]);
  const [libSearch, setLibSearch] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'coach',
      text: `### 👷 Namaste Engineer ${profile.name.split(' ')[0]}!
I am **Er. SP**, your dedicated Civil Engineering AI Tutor on **Engineering Officer BY SP**.

I provide mathematically verified, codal-grounded answers in **English, Marathi (मराठी), and Hindi (हिंदी)** for:
- **IS/IRC Codes**: IS 456 (RCC), IS 800 (Steel), IS 1893 (Earthquake), IS 2720 (Soil), IRC 73 (Highways).
- **Numerical Problems**: Formula, Substitutions, Unit checks, Step-by-step Proof, and Sanity check.
- **Target Exam Roadmaps**: Focus topics for **${currentExam.name}**.

*Select a quick topic below or type your question!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    loadTelemetry();
  }, []);

  const loadTelemetry = async () => {
    const [stats, library] = await Promise.all([
      AITutorService.getCacheStats(),
      AITutorService.getPregeneratedLibrary(),
    ]);
    setCacheStats(stats);
    setPregeneratedList(library);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await AITutorService.askTutor({
        query,
        queryType,
        subjectName: selectedSubject,
        language: selectedLanguage,
        userEmail: profile.email,
        userTier: profile.subscriptionTier,
      });

      setRemainingQuota(response.remainingQuota);
      setQuotaLimit(response.quotaLimit);

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCodeReference: response.isCodeReference,
        numericalSolution: response.numericalSolution,
        cached: response.cached,
        pregenerated: response.pregenerated,
        officialNotice: response.officialFactNotice,
      };

      setMessages((prev) => [...prev, coachMsg]);
      // Refresh cache stats
      loadTelemetry();
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-err-${Date.now()}`,
          sender: 'coach',
          text: `⚠️ Gateway error: ${err.message || 'Unable to connect to AI Tutor.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { title: 'Limiting Depth of Neutral Axis (xu,max/d)', code: 'IS 456 Cl 38.1' },
    { title: 'Slump Cone Test Workability Ranges', code: 'IS 1199 & IS 456' },
    { title: 'Soil Phase Relationship Se = wG derivation', code: 'IS 2720' },
    { title: 'IS 800:2007 Max Slenderness Ratio Table 3', code: 'IS 800 Table 3' },
    { title: 'Calculate Lever Arm for Fe 415 Beam (d = 400mm)', code: 'Numerical' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white border border-sky-700/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
              <Bot className="w-3.5 h-3.5" />
              <span>Multilingual AI Civil Engineering Tutor • Grounded in IS/IRC Standards</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Er. SP — AI Engineering Tutor</h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Ask conceptual doubts, numerical derivations, and IS Code interpretations in English, Marathi, or Hindi with zero hallucination.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/30 p-3 rounded-xl backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Daily AI Quota</div>
              <div className="text-sm font-bold text-white font-mono">
                {remainingQuota} / {quotaLimit} Left Today
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 rounded-xl p-1 gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'chat' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Live AI Tutor Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'library' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Verified IS Code Explanations ({pregeneratedList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('cacheStats')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'cacheStats' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>AI Cache & Savings Telemetry</span>
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Stream (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Control Bar: Language & Query Type */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-sky-400" />
                <span className="text-slate-400">Response Language:</span>
                <div className="flex gap-1">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'mr', label: 'मराठी' },
                    { id: 'hi', label: 'हिंदी' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLanguage(l.id as AILanguage)}
                      className={`px-2 py-1 rounded font-medium transition-colors ${
                        selectedLanguage === l.id
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Query Mode:</span>
                <select
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value as AITutorQueryType)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="concept">Concept & Theory</option>
                  <option value="numerical">Numerical Calculation</option>
                  <option value="mcq">MCQ Analysis</option>
                  <option value="comparison">Codal Comparison</option>
                  <option value="revision">Quick Revision</option>
                </select>
              </div>
            </div>

            {/* Chat History Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-[480px] max-h-[580px] overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-indigo-600 text-white shadow-md'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-tr-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {/* Badges for AI responses */}
                      {!isUser && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
                          <div className="flex items-center gap-1.5">
                            {msg.cached && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {msg.pregenerated ? 'Verified IS Library' : 'Cached Instant'}
                              </span>
                            )}
                            {msg.isCodeReference && (
                              <span className="font-mono text-[10px] text-amber-300 bg-slate-900 px-2 py-0.5 rounded">
                                {msg.isCodeReference}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="text-slate-400 hover:text-white"
                            title="Copy Answer"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap font-sans text-xs">{msg.text}</div>

                      {/* Structured Numerical Breakdown if present */}
                      {msg.numericalSolution && (
                        <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-700 font-mono text-[11px] space-y-2 text-emerald-300">
                          <div className="font-bold text-amber-400">Numerical Proof & Sanity Check:</div>
                          <div><strong>Formula:</strong> {msg.numericalSolution.formula}</div>
                          <div><strong>Substitutions:</strong> {msg.numericalSolution.substitutions}</div>
                          <div className="space-y-1 pt-1 border-t border-slate-800">
                            {msg.numericalSolution.stepByStepDerivation.map((s, idx) => (
                              <div key={idx} className="text-slate-300">{s}</div>
                            ))}
                          </div>
                          <div className="pt-1 text-sky-400 font-bold">
                            Final Answer: {msg.numericalSolution.finalAnswer} ({msg.numericalSolution.units})
                          </div>
                          <div className="text-[10px] text-amber-200/90 italic pt-1 border-t border-slate-800">
                            Sanity Check: {msg.numericalSolution.sanityCheck}
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 text-right font-mono mt-1">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700 w-fit">
                  <Bot className="w-4 h-4 text-sky-400 animate-spin" />
                  <span className="text-xs text-slate-300">Er. SP is solving & checking IS Code clauses...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask any Civil Engineering question, formula derivation or IS Code clause..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Quick Prompts & Context (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Subject Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Engineering Subject Context</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              >
                {SUBJECTS_LIST.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* High-Yield Fast Prompts */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Instant High-Yield Topics</span>
              </h3>
              <div className="space-y-2">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.title)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 hover:border-sky-500 text-xs text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span>{qp.title}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {qp.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-generated Library Tab */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={libSearch}
              onChange={(e) => setLibSearch(e.target.value)}
              placeholder="Search pre-verified IS Code concepts..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="space-y-4">
            {pregeneratedList
              .filter(p => p.questionOrConcept.toLowerCase().includes(libSearch.toLowerCase()))
              .map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                      {item.subjectName}
                    </span>
                    <span className="font-mono text-xs text-amber-300 bg-slate-800 px-2.5 py-1 rounded">
                      {item.isCodeReference}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{item.questionOrConcept}</h3>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {item.explanationEn}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>Verified By: <strong className="text-white">{item.verifiedBy}</strong></span>
                    <span>{item.viewCount} Aspirant Views</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Cache Stats Tab */}
      {activeTab === 'cacheStats' && cacheStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 uppercase font-semibold">Total Queries</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{cacheStats.totalRequests}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-emerald-400 uppercase font-semibold">Cache Hit Rate</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{cacheStats.hitRatePercent}%</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-sky-400 uppercase font-semibold">Verified Hits</div>
              <div className="text-2xl font-bold text-sky-400 font-mono mt-1">{cacheStats.pregeneratedHits}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-amber-400 uppercase font-semibold">API Cost Saved</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">₹ {cacheStats.savedCostEstimatedRupees.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
