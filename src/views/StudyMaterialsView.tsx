import React, { useState } from 'react';
import {
  FileText,
  Download,
  BookOpen,
  FileCode2,
  CheckCircle,
  Eye,
  X,
  Sparkles,
  Lock
} from 'lucide-react';
import { StudyMaterial, StudentProfile } from '../types';
import { STUDY_MATERIALS, SUBJECTS_LIST } from '../data/mockData';

interface StudyMaterialsViewProps {
  materials: StudyMaterial[];
  profile: StudentProfile;
  onUpgradePlan: () => void;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  materials,
  profile,
  onUpgradePlan,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeModalMaterial, setActiveModalMaterial] = useState<StudyMaterial | null>(null);

  const filteredMaterials = materials.filter(
    (m) => selectedType === 'all' || m.type === selectedType
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <span>Civil Engineering Study Materials & IS Code Handbooks</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              High-yield revision notes, formula cheat sheets, and IS 456 / IS 800 codal clause summaries.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter study materials by type"
              className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Document Types</option>
              <option value="is_code_summary">IS / IRC Code Summaries</option>
              <option value="formula_sheet">Formula Sheets</option>
              <option value="short_notes">Short Revision Notes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.map((mat) => {
          const subject = SUBJECTS_LIST.find((s) => s.id === mat.subjectId);
          const isLocked = !mat.isFree && profile.subscriptionTier === 'Free Starter';

          return (
            <div
              key={mat.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    {subject?.code || 'CE'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {mat.pages} Pages · {mat.fileSize}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {mat.title}
                </h3>

                {/* Highlights List */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
                    Key Exam Clauses Covered:
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {mat.highlights.slice(0, 3).map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start space-x-1.5">
                        <span className="text-sky-600 font-bold">•</span>
                        <span className="line-clamp-1">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {mat.downloadCount.toLocaleString()} downloads
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveModalMaterial(mat)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick Preview</span>
                  </button>

                  {isLocked ? (
                    <button
                      onClick={onUpgradePlan}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1 shadow-xs"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Unlock Pro</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => alert(`Downloading ${mat.title}...`)}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 shadow-xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* In-App PDF Preview Modal */}
      {activeModalMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">{activeModalMaterial.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalMaterial(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blueprint-dark text-slate-200 p-4 rounded-lg font-mono text-xs space-y-3">
              <div className="text-sky-400 font-bold border-b border-slate-700 pb-1">
                ENGINEERING OFFICER BY SP — REFERENCE EXCERPT
              </div>
              <ul className="space-y-2">
                {activeModalMaterial.highlights.map((h, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-sky-400 font-bold">[{i + 1}]</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              Full {activeModalMaterial.pages}-page compiled edition contains detailed numerical derivations, IS standard reference clauses, diagrammatic illustrations, and previous year exam questions asked in Maharashtra PWD, SSC JE, and MPSC.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setActiveModalMaterial(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  alert(`Downloading ${activeModalMaterial.title}...`);
                  setActiveModalMaterial(null);
                }}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Complete PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
