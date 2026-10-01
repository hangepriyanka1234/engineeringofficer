import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Pause,
  Clock,
  User,
  BookOpen,
  Filter,
  CheckCircle,
  HardHat,
  X,
  Volume2,
  VolumeX,
  FastForward,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Share2,
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { VideoLecture } from '../types';
import { VIDEO_LECTURES, SUBJECTS_LIST } from '../data/mockData';

export const VideosView: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<VideoLecture | null>(null);

  // Video Player Interactive States
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSeconds, setCurrentSeconds] = useState(320); // 5m 20s
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [bookmarkedNotes, setBookmarkedNotes] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredVideos = VIDEO_LECTURES.filter(
    (v) => selectedSubject === 'all' || v.subjectId === selectedSubject
  );

  const sampleChapters = [
    { title: '१. संकल्पना व प्राथमिक ओळख (Introduction & Basics)', startSec: 0, timeStr: '00:00' },
    { title: '२. महत्त्वाच्या व्याख्या व सूत्रे (Core Formulas & Derivations)', startSec: 420, timeStr: '07:00' },
    { title: '३. IS कोड तरतुदी व निकष (IS Code Clauses & Specifications)', startSec: 1080, timeStr: '18:00' },
    { title: '४. MPSC व PWD मागील वर्षांचे प्रश्न (Official PYQ Analysis)', startSec: 2160, timeStr: '36:00' },
    { title: '५. परीक्षेतील शॉर्ट ट्रिक्स व रिव्हिजन (Exam Speed Shortcuts)', startSec: 3600, timeStr: '60:00' }
  ];

  // Playback timer ticker simulation
  useEffect(() => {
    let interval: any = null;
    if (activeVideo && isPlaying) {
      interval = setInterval(() => {
        setCurrentSeconds((prev) => prev + Math.round(playbackSpeed));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeVideo, isPlaying, playbackSpeed]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleBookmark = (topic: string) => {
    if (bookmarkedNotes.includes(topic)) {
      setBookmarkedNotes(bookmarkedNotes.filter((t) => t !== topic));
      setToastMessage('नोट्समधील सेव्ह काढले');
    } else {
      setBookmarkedNotes([...bookmarkedNotes, topic]);
      setToastMessage('महत्त्वाचा मुद्दा बुकमार्क झाला!');
    }
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                EXECUTIVE CIVIL MASTERCLASS
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% In-App Interactive Player
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <Video className="w-6 h-6 text-sky-600" />
              <span>व्हिडिओ मास्टरक्लासेस आणि मॅरेथॉन लेक्चर्स</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              IS 456, IS 800, SOM आणि सर्व्हेइंगवरील संकल्पनात्मक मॅरेथॉन सेशन्स. कोणतीही जाहिरात किंवा ब्रोकन लिंक नाही.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filter video masterclasses by subject"
              className="text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">सर्व विषय (All Subjects)</option>
              {SUBJECTS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active High-Fidelity Video Masterclass Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full text-white overflow-hidden shadow-2xl flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Top Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <HardHat className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-sm text-white truncate">{activeVideo.title}</h3>
                  <p className="text-[11px] text-sky-400">
                    {activeVideo.instructor || activeVideo.facultyName || 'Er. SP Sir (Ex-Executive Engineer)'} · {activeVideo.duration}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Display Screen */}
            <div className="relative aspect-video bg-black flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden">
              {/* Top Watermark */}
              <div className="flex items-center justify-between text-xs text-white/70 font-mono">
                <span className="bg-slate-950/70 px-2.5 py-1 rounded border border-white/10">
                  ENGINEERING OFFICER BY MH — LECTURE STUDIO
                </span>
                <span className="bg-rose-600/80 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase text-white animate-pulse">
                  HD MASTERCLASS
                </span>
              </div>

              {/* Center Lecture Visual Board */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto">
                <div
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-white" />
                  ) : (
                    <Play className="w-8 h-8 fill-white ml-1" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base sm:text-lg">
                    {sampleChapters[activeChapterIndex].title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeVideo.instructor || 'Er. SP Sir'} · संकल्पनात्मक विश्लेषण व महत्त्वाच्या क्लॉज नोट्स
                  </p>
                </div>
              </div>

              {/* Bottom Player Controls Overlay */}
              <div className="space-y-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 rounded-xl border border-white/5">
                {/* Timeline Progress Scrubber */}
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-slate-300 w-12">{formatTime(currentSeconds)}</span>
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      setCurrentSeconds(Math.round(ratio * 5400));
                    }}
                    className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden cursor-pointer relative"
                  >
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.min(100, (currentSeconds / 5400) * 100)}%` }}
                    />
                  </div>
                  <span className="text-slate-400 w-12 text-right">{activeVideo.duration}</span>
                </div>

                {/* Buttons Row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-3 text-xs">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1 text-white hover:text-sky-400"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>

                    <button
                      onClick={() => setCurrentSeconds(Math.max(0, currentSeconds - 10))}
                      className="p-1 text-slate-400 hover:text-white"
                      title="10s Back"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                      1080p Full HD
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    {/* Playback Speed Switcher */}
                    <div className="flex items-center space-x-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                      {[1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            playbackSpeed === spd
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content Tabs & Chapters */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chapters List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>व्हिडिओ प्रकरणे (Timestamps & Chapters)</span>
                  </h4>
                  <div className="space-y-1.5">
                    {sampleChapters.map((chap, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveChapterIndex(idx);
                          setCurrentSeconds(chap.startSec);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          activeChapterIndex === idx
                            ? 'bg-sky-600/30 border-sky-400/50 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate pr-2">{chap.title}</span>
                        <span className="font-mono text-[11px] text-sky-400 shrink-0">{chap.timeStr}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Codal Concepts */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>महत्त्वाचे तांत्रिक मुद्दे व IS कोड तरतुदी</span>
                  </h4>
                  <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
                    {activeVideo.keyConcepts && activeVideo.keyConcepts.length > 0 ? (
                      activeVideo.keyConcepts.map((concept, cIdx) => (
                        <div key={cIdx} className="flex items-start justify-between gap-2 text-slate-300">
                          <div className="flex items-start space-x-2">
                            <span className="text-sky-400 font-bold">•</span>
                            <span className="leading-relaxed">{concept}</span>
                          </div>
                          <button
                            onClick={() => handleToggleBookmark(concept)}
                            className="p-1 text-slate-500 hover:text-amber-400 shrink-0"
                            title="Save Note"
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                bookmarkedNotes.includes(concept) ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">IS 456 आणि SOM वरील मुख्य मुद्दे समाविष्ट आहेत.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                SP Academy Civil Masterclass Series · Total Views:{' '}
                {(activeVideo.viewsCount || activeVideo.views || 25000).toLocaleString()}
              </span>
              <button
                onClick={() => setActiveVideo(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => {
          const instructorName = video.instructor || video.facultyName || 'Er. SP Sir (Ex-Executive Engineer)';
          const views = video.viewsCount || video.views || 24000;

          return (
            <div
              key={video.id}
              onClick={() => {
                setActiveVideo(video);
                setCurrentSeconds(120);
                setIsPlaying(true);
              }}
              className="bg-white rounded-2xl border border-slate-200 hover:border-sky-400 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-white border border-white/20">
                    {video.duration}
                  </span>
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600/90 text-white shadow-xs">
                    MASTERCLASS
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-sky-700 truncate max-w-[180px]">
                      {instructorName}
                    </span>
                    <span className="font-mono">{views.toLocaleString()} विद्यार्थी</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-sky-600 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className="text-xs text-sky-700 font-bold flex items-center space-x-1">
                  <span>लेक्चर पहा (Watch In-App)</span>
                  <Play className="w-3 h-3 fill-current ml-1" />
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  मोफत उपलब्ध
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
