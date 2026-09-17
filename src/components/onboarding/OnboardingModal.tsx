import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Globe2,
  Award,
  ArrowRight,
  HardHat,
  Sparkles
} from 'lucide-react';
import { StudentProfile, ExamTargetId, AILanguage } from '../../types';
import { EXAM_CATALOGUE } from '../../data/mockData';

interface OnboardingModalProps {
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updated: Partial<StudentProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedExams, setSelectedExams] = useState<ExamTargetId[]>(profile.targetExams || ['maha_pwd']);
  const [dailyHours, setDailyHours] = useState<number>(profile.dailyStudyHours || 4);
  const [language, setLanguage] = useState<AILanguage>((profile.preferredLanguage as any) || 'en');
  const [targetYear, setTargetYear] = useState<string>('2026');

  if (!isOpen) return null;

  const toggleExam = (id: ExamTargetId) => {
    if (selectedExams.includes(id)) {
      if (selectedExams.length > 1) {
        setSelectedExams(selectedExams.filter((e) => e !== id));
      }
    } else {
      setSelectedExams([...selectedExams, id]);
    }
  };

  const handleFinish = () => {
    onSaveProfile({
      targetExams: selectedExams,
      dailyStudyHours: dailyHours,
      preferredLanguage: language,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 p-6 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Personalized Setup • Step {step} of 3
            </span>
            <span className="text-xs text-slate-400">Engineering Officer BY SP</span>
          </div>
          <h2 className="text-xl font-bold mt-2">
            {step === 1 && 'Select Your Target Civil Engineering Examinations'}
            {step === 2 && 'Set Your Daily Study Budget & Language'}
            {step === 3 && 'Tailored Study Strategy Prepared!'}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Choose the exams you are targeting for 2026/2027. We adapt your daily capsules, test syllabus weights, and PYQs accordingly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {EXAM_CATALOGUE.map((exam) => {
                  const isChecked = selectedExams.includes(exam.id as ExamTargetId);
                  return (
                    <div
                      key={exam.id}
                      onClick={() => toggleExam(exam.id as ExamTargetId)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        isChecked
                          ? 'bg-sky-950/60 border-sky-500 text-sky-200 shadow'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold leading-tight">{exam.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{exam.department}</div>
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isChecked ? 'bg-sky-500 text-white' : 'border border-slate-600'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Daily Hours Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>Daily Study Commitment</span>
                  </span>
                  <span className="font-bold text-sky-400 text-sm font-mono">{dailyHours} Hours / Day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 hr (Working Pro)</span>
                  <span>4 hrs (Balanced)</span>
                  <span>10 hrs (Full-Time Aspirant)</span>
                </div>
              </div>

              {/* Language Preference */}
              <div className="space-y-2">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-sky-400" />
                  <span>AI Tutor & Question Language</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'mr', label: 'मराठी (Marathi)' },
                    { id: 'hi', label: 'हिंदी (Hindi)' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id as AILanguage)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        language === lang.id
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Your Study Ecosystem is Configured!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Selected {selectedExams.length} target exams with a {dailyHours}-hour daily adaptive study plan in {language.toUpperCase()}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="text-xs font-bold px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 shadow"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="text-xs font-bold px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow"
            >
              Start Studying
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
