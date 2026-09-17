import React, { useState } from 'react';
import {
  Video,
  Play,
  Clock,
  User,
  BookOpen,
  Filter,
  CheckCircle,
  HardHat
} from 'lucide-react';
import { VideoLecture } from '../types';
import { VIDEO_LECTURES, SUBJECTS_LIST } from '../data/mockData';

export const VideosView: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<VideoLecture | null>(null);

  const filteredVideos = VIDEO_LECTURES.filter(
    (v) => selectedSubject === 'all' || v.subjectId === selectedSubject
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Video className="w-5 h-5 text-sky-600" />
              <span>Civil Engineering Video Masterclasses & Marathons</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Recorded and live marathon sessions on IS codes, numerical derivations, and previous year paper analysis.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filter video masterclasses by subject"
              className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Subjects</option>
              {SUBJECTS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Player Simulation Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/30 rounded-xl max-w-3xl w-full text-white p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <HardHat className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-sm text-sky-300">SP ACADEMY MASTERCLASS</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            {/* Video Player Display */}
            <div className="w-full aspect-video bg-black rounded-lg border border-slate-800 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
              <p className="font-bold text-white text-base mt-4">{activeVideo.title}</p>
              <p className="text-xs text-sky-400 mt-1">Faculty: {activeVideo.facultyName} · Duration: {activeVideo.duration}</p>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed">
              This masterclass covers core conceptual proofs, IS codal provisions, and exam-oriented problem-solving shortcuts.
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="bg-white rounded-xl border border-slate-200 hover:border-sky-400 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-sky-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-white border border-white/10">
                  {video.duration}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-sky-700">{video.facultyName}</span>
                  <span className="font-mono">{video.views.toLocaleString()} views</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-sky-600 transition-colors">
                  {video.title}
                </h3>
              </div>
            </div>

            <div className="p-4 pt-0">
              <span className="text-xs text-sky-600 font-bold flex items-center">
                Watch Lecture →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
