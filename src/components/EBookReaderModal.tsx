import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Printer,
  Download,
  Share2,
  Sparkles,
  FileText,
  CheckCircle2,
  List,
  Eye,
  Settings,
  Sun,
  Moon,
  Coffee,
  ZoomIn,
  ZoomOut,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { StudyMaterial } from '../types';

interface EBookReaderModalProps {
  material: StudyMaterial;
  isOpen: boolean;
  onClose: () => void;
  onUpgradePlan?: () => void;
}

export const EBookReaderModal: React.FC<EBookReaderModalProps> = ({
  material,
  isOpen,
  onClose,
  onUpgradePlan,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'paper' | 'sepia' | 'dark'>('paper');
  const [fontSize, setFontSize] = useState<number>(16); // px
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>({});
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [inModalToast, setInModalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setInModalToast(msg);
    setTimeout(() => setInModalToast(null), 3000);
  };

  // Audio Text-to-Speech (TTS)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Restore completed chapters & bookmark from localStorage
  useEffect(() => {
    if (!material) return;
    try {
      const savedCompleted = localStorage.getItem(`read_progress_${material.id}`);
      if (savedCompleted) {
        setCompletedChapters(JSON.parse(savedCompleted));
      }
      const savedBookmark = localStorage.getItem(`bookmark_${material.id}`);
      if (savedBookmark) {
        setIsBookmarked(JSON.parse(savedBookmark));
      }
    } catch {}
  }, [material]);

  // Clean up audio on close or unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  if (!isOpen || !material) return null;

  const chapters = material.chapters && material.chapters.length > 0
    ? material.chapters
    : [
        {
          id: 'ch-default-1',
          title: material.title,
          page: 1,
          summary: material.highlights?.[0] || 'मुख्य तांत्रिक व सैद्धांतिक संकल्पना',
          content: material.contentMarkdown || material.highlights?.join('\n\n• ') || 'विस्तृत नोट्स लवकरच उपलब्ध होत आहेत.',
          formulas: ['Standard Codal Provisions & Guidelines'],
        },
      ];

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  const toggleChapterComplete = (chId: string) => {
    const updated = { ...completedChapters, [chId]: !completedChapters[chId] };
    setCompletedChapters(updated);
    try {
      localStorage.setItem(`read_progress_${material.id}`, JSON.stringify(updated));
    } catch {}
  };

  const toggleBookmark = () => {
    const nextVal = !isBookmarked;
    setIsBookmarked(nextVal);
    try {
      localStorage.setItem(`bookmark_${material.id}`, JSON.stringify(nextVal));
    } catch {}
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Audio Reader Implementation
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      showToast('तुमच्या ब्राऊझरमध्ये ऑडिओ वाचन (Text-to-Speech) सपोर्ट उपलब्ध नाही.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare text to read
    const textToRead = `${currentChapter.title}. ${currentChapter.summary}. ${currentChapter.content?.replace(/[#*`_]/g, '') || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = audioSpeed;

    // Detect language: Marathi if Marathi characters present, else Hindi or English
    const hasMarathi = /[\u0900-\u097F]/.test(textToRead);
    const voices = window.speechSynthesis.getVoices();
    if (hasMarathi) {
      const mrVoice = voices.find((v) => v.lang.startsWith('mr') || v.lang.startsWith('hi'));
      if (mrVoice) utterance.voice = mrVoice;
      utterance.lang = mrVoice?.lang || 'hi-IN';
    } else {
      const enVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = enVoice?.lang || 'en-IN';
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const cycleAudioSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.85];
    const currIdx = speeds.indexOf(audioSpeed);
    const nextSpeed = speeds[(currIdx + 1) % speeds.length];
    setAudioSpeed(nextSpeed);

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setTimeout(handleToggleAudio, 100);
    }
  };

  const handlePrintOrDownload = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Color schemes for reader themes
  const themeClasses = {
    paper: 'bg-[#FBFBFA] text-[#1F2937]',
    sepia: 'bg-[#F4ECD8] text-[#433422]',
    dark: 'bg-[#12161A] text-[#E5E7EB]',
  };

  const themeHeaderClasses = {
    paper: 'bg-white border-b border-stone-200 text-slate-800',
    sepia: 'bg-[#EAE0C8] border-b border-[#D8C9AA] text-[#3D2F1E]',
    dark: 'bg-[#1A2026] border-b border-slate-800 text-slate-200',
  };

  const themeSidebarClasses = {
    paper: 'bg-[#F3F4F6] border-r border-stone-200 text-slate-700',
    sepia: 'bg-[#E6DBBE] border-r border-[#D8C9AA] text-[#3D2F1E]',
    dark: 'bg-[#161B22] border-r border-slate-800 text-slate-300',
  };

  const themeCardClasses = {
    paper: 'bg-white border border-stone-200 shadow-xs',
    sepia: 'bg-[#FCF7ED] border border-[#D8C9AA] shadow-xs',
    dark: 'bg-[#1E252E] border border-slate-700/80 shadow-xs',
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP CONTROL BAR */}
      {/* ------------------------------------------------------------- */}
      <header className={`px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 transition-colors duration-200 shadow-xs z-10 ${themeHeaderClasses[theme]}`}>
        {/* Left: Book Meta & Sidebar Toggle */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg border border-slate-300/80 hover:bg-black/5 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
            title="अनुक्रमणिका टॉगल करा"
          >
            <List className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">अनुक्रमणिका ({chapters.length})</span>
          </button>

          <div className="truncate">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                {material.type === 'ebook' ? 'ई-बुक (E-BOOK)' : 'ई-नोट्स (E-NOTES)'}
              </span>
              <h2 className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-[340px] md:max-w-[460px]">
                {material.title}
              </h2>
            </div>
            <p className="text-[11px] opacity-75 truncate hidden sm:block">
              {material.author || 'BY MH Faculty'} · {material.pages} पाने · वाचायचा वेळ ~{material.readTimeMinutes || 30} मि.
            </p>
          </div>
        </div>

        {/* Center / Right: Reader Controls (Font, Theme, Audio, Fullscreen, Close) */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
          {/* Audio Player Controls */}
          <div className="flex items-center bg-black/5 rounded-lg p-0.5 border border-black/10">
            <button
              onClick={handleToggleAudio}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                isPlayingAudio
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'hover:bg-black/10 text-slate-700'
              }`}
              title="मराठी/इंग्रजी टेक्स्ट-टू-स्पीच ऑडिओ"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">थांबवा</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">ऑडिओ ऐका</span>
                </>
              )}
            </button>
            {isPlayingAudio && (
              <button
                onClick={cycleAudioSpeed}
                className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded hover:bg-black/10 text-slate-700"
                title="वाचनाचा वेग बदला"
              >
                {audioSpeed}x
              </button>
            )}
          </div>

          {/* Theme Selector */}
          <div className="flex items-center bg-black/5 rounded-lg p-0.5 border border-black/10 text-xs">
            <button
              onClick={() => setTheme('paper')}
              className={`p-1.5 rounded transition-all ${theme === 'paper' ? 'bg-white shadow-xs text-sky-700 font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="क्लीन कागद थीम (Paper White)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded transition-all ${theme === 'sepia' ? 'bg-[#FCF7ED] shadow-xs text-amber-800 font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="डोळ्यांना आरामदायी सेपिया थीम (Warm Sepia)"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-700" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded transition-all ${theme === 'dark' ? 'bg-slate-800 text-white shadow-xs font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="रात्र वाचन मोड (Dark OLED)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Resizing */}
          <div className="hidden sm:flex items-center bg-black/5 rounded-lg p-0.5 border border-black/10">
            <button
              onClick={() => setFontSize(Math.max(13, fontSize - 1))}
              className="p-1 hover:bg-black/10 rounded text-xs font-bold"
              title="फॉन्ट लहान करा"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 font-semibold">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="p-1 hover:bg-black/10 rounded text-xs font-bold"
              title="फॉन्ट मोठा करा"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'border-black/10 hover:bg-black/5 opacity-80'
            }`}
            title="बुकमार्क जतन करा"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Print / Download PDF */}
          <button
            onClick={handlePrintOrDownload}
            className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition-colors hidden sm:flex items-center text-xs font-semibold"
            title="PDF डाउनलोड / प्रिंट"
          >
            <Download className="w-4 h-4 text-sky-600" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition-colors hidden md:block"
            title="फुलस्क्रीन मोड"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200"
            title="वाचन बंद करा"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEWPORT: SIDEBAR + CONTENT CANVAS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: Table of Contents & Search */}
        {isSidebarOpen && (
          <aside
            className={`w-72 sm:w-80 flex-shrink-0 flex flex-col justify-between transition-all duration-200 overflow-y-auto ${themeSidebarClasses[theme]}`}
          >
            <div className="p-3.5 space-y-3">
              {/* Search inside Book */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50" />
                <input
                  type="text"
                  placeholder="धड्यातील शब्द शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-black/15 bg-white/70 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Chapter Listing */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 font-mono flex items-center justify-between">
                  <span>अनुक्रमणिका (CHAPTERS)</span>
                  <span>{Object.keys(completedChapters).length}/{chapters.length} पूर्ण</span>
                </div>

                <div className="space-y-1 mt-1">
                  {chapters.map((ch, idx) => {
                    const isCurrent = idx === currentChapterIndex;
                    const isDone = completedChapters[ch.id];
                    const matchesSearch = !searchQuery || ch.title.toLowerCase().includes(searchQuery.toLowerCase()) || ch.summary.toLowerCase().includes(searchQuery.toLowerCase());

                    if (!matchesSearch) return null;

                    return (
                      <div
                        key={ch.id}
                        className={`group rounded-lg p-2.5 cursor-pointer text-xs transition-all flex items-start space-x-2.5 border ${
                          isCurrent
                            ? 'bg-sky-500/15 border-sky-400 font-bold shadow-xs'
                            : 'border-transparent hover:bg-black/5 opacity-90'
                        }`}
                        onClick={() => {
                          setCurrentChapterIndex(idx);
                          contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChapterComplete(ch.id);
                          }}
                          className="mt-0.5 flex-shrink-0"
                          title="वाचून पूर्ण झाले असे खूण करा"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 transition-colors ${
                              isDone ? 'text-emerald-600 fill-emerald-100' : 'opacity-40 hover:opacity-80'
                            }`}
                          />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono opacity-60">
                              पान {ch.page}
                            </span>
                            {ch.formulas && ch.formulas.length > 0 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                {ch.formulas.length} सूत्रे
                              </span>
                            )}
                          </div>
                          <div className="font-semibold line-clamp-2 mt-0.5 leading-snug">
                            {ch.title}
                          </div>
                          <p className="text-[11px] opacity-75 line-clamp-1 mt-0.5 font-normal">
                            {ch.summary}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Bottom Book Info Card */}
            <div className="p-3 border-t border-black/10 text-[11px] space-y-1.5 opacity-80 bg-black/5">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span>एकूण पाने: {material.pages}</span>
                <span>आकार: {material.fileSize}</span>
              </div>
              <div className="text-[10px] flex items-center space-x-1 text-emerald-700 font-semibold">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Verified by BY MH Civil Expert Faculty</span>
              </div>
            </div>
          </aside>
        )}

        {/* RIGHT CANVAS: Interactive Document Reader */}
        <main
          ref={contentContainerRef}
          className={`flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 transition-colors duration-200 ${themeClasses[theme]}`}
        >
          <div className="max-w-3xl mx-auto space-y-6 pb-24">
            {/* Top Chapter Breadcrumb & Page Indicator */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3 text-xs opacity-75">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold">धडा {currentChapterIndex + 1} / {chapters.length}</span>
                <span>•</span>
                <span className="font-mono">पान {currentChapter.page}</span>
              </div>
              <div className="flex items-center space-x-2">
                {completedChapters[currentChapter.id] ? (
                  <span className="text-emerald-600 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>वाचून पूर्ण</span>
                  </span>
                ) : (
                  <button
                    onClick={() => toggleChapterComplete(currentChapter.id)}
                    className="text-sky-600 hover:underline font-medium"
                  >
                    पूर्ण म्हणून खूण करा
                  </button>
                )}
              </div>
            </div>

            {/* Chapter Header Banner */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
                {currentChapter.title}
              </h1>
              <div className="p-3 rounded-lg bg-black/5 border border-black/10 text-xs sm:text-sm font-medium leading-relaxed opacity-90">
                <span className="font-bold block text-[10px] uppercase font-mono tracking-wider opacity-60">
                  प्रकरणाचा सारांश (SUMMARY):
                </span>
                {currentChapter.summary}
              </div>
            </div>

            {/* Formulas Showcase Card (If available) */}
            {currentChapter.formulas && currentChapter.formulas.length > 0 && (
              <div className={`p-4 rounded-xl ${themeCardClasses[theme]} border-l-4 border-l-amber-500 space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-600 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>परीक्षेसाठी अत्यंत महत्त्वाची सूत्रे (KEY FORMULAS):</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-60">MPSC MES / PWD Top Yield</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {currentChapter.formulas.map((form, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-2.5 rounded-lg bg-black/5 font-mono text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-400 border border-black/10 select-all"
                    >
                      {form}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Chapter Content Body */}
            <article
              className="prose prose-slate max-w-none leading-relaxed transition-all space-y-4"
              style={{ fontSize: `${fontSize}px` }}
            >
              {currentChapter.content ? (
                <div className="space-y-4 whitespace-pre-line font-sans">
                  {currentChapter.content.split('\n\n').map((para, pIdx) => {
                    // Check if it's a heading
                    if (para.startsWith('### ')) {
                      return (
                        <h3 key={pIdx} className="text-lg font-bold text-sky-800 dark:text-sky-300 mt-4 border-b border-black/10 pb-1">
                          {para.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (para.startsWith('#### ')) {
                      return (
                        <h4 key={pIdx} className="text-base font-bold text-slate-800 dark:text-slate-200 mt-3">
                          {para.replace('#### ', '')}
                        </h4>
                      );
                    }
                    if (para.startsWith('> ')) {
                      return (
                        <blockquote
                          key={pIdx}
                          className="p-3 my-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium"
                        >
                          {para.replace('> ', '')}
                        </blockquote>
                      );
                    }
                    return (
                      <p key={pIdx} className="opacity-90 leading-relaxed">
                        {para}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="italic opacity-60 text-center py-12">
                  या धड्याचे विस्तृत डिजिटल हस्तलिखित लवकरच अपडेट केले जाईल.
                </p>
              )}
            </article>

            {/* Highlights Checklist */}
            {material.highlights && material.highlights.length > 0 && (
              <div className={`p-4 rounded-xl ${themeCardClasses[theme]} space-y-2 mt-8`}>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-sky-600 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>या पुस्तकातील मुख्य परीक्षा वैशिष्ट्ये (HIGHLIGHTS):</span>
                </h4>
                <ul className="text-xs space-y-1.5 pt-1">
                  {material.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-start space-x-2">
                      <span className="text-sky-500 font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* External File Open (if has fileUrl) */}
            {material.fileUrl && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sky-950 text-xs sm:text-sm">
                    मूळ PDF दस्तऐवज उपलब्ध आहे
                  </div>
                  <div className="text-[11px] text-sky-700">
                    तुम्ही हे संपूर्ण ई-बुक थेट तुमच्या डिव्हाइसवर ऑफलाइन वाचू शकता.
                  </div>
                </div>
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>PDF उघडा</span>
                </a>
              </div>
            )}

            {/* Bottom Floating Navigation: Prev / Next Chapter */}
            <div className="pt-8 border-t border-black/10 flex items-center justify-between gap-4">
              <button
                disabled={currentChapterIndex === 0}
                onClick={() => {
                  setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1));
                  contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                  currentChapterIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-black/10'
                    : 'border-black/20 hover:bg-black/5 shadow-xs'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>मागील धडा</span>
              </button>

              <div className="text-center">
                <span className="text-[10px] font-mono font-bold opacity-60 block">प्रगती</span>
                <span className="text-xs font-bold">
                  {Math.round(((currentChapterIndex + 1) / chapters.length) * 100)}% वाचून पूर्ण
                </span>
              </div>

              {currentChapterIndex < chapters.length - 1 ? (
                <button
                  onClick={() => {
                    toggleChapterComplete(currentChapter.id);
                    setCurrentChapterIndex(currentChapterIndex + 1);
                    contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>पुढील धडा</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    toggleChapterComplete(currentChapter.id);
                    showToast('अभिनंदन! तुम्ही हे संपूर्ण ई-बुक यशस्वीरित्या वाचून पूर्ण केले आहे. 🏆');
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>संपूर्ण ई-बुक समाप्त!</span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* In-Modal Feedback Toast */}
      {inModalToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{inModalToast}</span>
        </div>
      )}
    </div>
  );
};
