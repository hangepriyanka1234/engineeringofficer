import React, { useState, useRef } from 'react';
import {
  User,
  GraduationCap,
  Award,
  Flame,
  Target,
  CheckCircle2,
  Save,
  HardHat,
  Share2,
  Download,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Briefcase,
  Copy,
  Check,
  Camera,
  Trash2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { StudentProfile, ExamTargetId } from '../types';
import { EXAM_CATALOGUE } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface ProfileViewProps {
  profile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  setActiveView?: (view: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onProfileUpdated,
  setActiveView,
}) => {
  // Form State
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || '+91 98230 45678');
  const [qualification, setQualification] = useState(profile.qualification);
  const [graduationYear, setGraduationYear] = useState<number>(profile.graduationYear || 2024);
  const [districtOrCity, setDistrictOrCity] = useState<string>(profile.districtOrCity || 'Pune');
  const [targetPost, setTargetPost] = useState<string>(profile.targetPost || 'Junior Engineer (JE) Group-B');
  const [dailyHours, setDailyHours] = useState<number>(profile.dailyStudyHours || 4);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoalQuestions);
  const [targetExams, setTargetExams] = useState<ExamTargetId[]>(profile.targetExams);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(profile.photoUrl);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(profile.referralCode || 'SP-PRIYA25');
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StorageService.updateProfile({
      name,
      email,
      phone,
      qualification,
      graduationYear: Number(graduationYear),
      districtOrCity,
      targetPost,
      dailyStudyHours: Number(dailyHours),
      dailyGoalQuestions: Number(dailyGoal),
      targetExams,
      photoUrl,
    });
    onProfileUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const toggleTargetExam = (id: ExamTargetId | string) => {
    if (targetExams.includes(id as ExamTargetId)) {
      setTargetExams(targetExams.filter((e) => e !== id));
    } else {
      setTargetExams([...targetExams, id as ExamTargetId]);
    }
  };

  const maharashtraDistricts = [
    'Pune',
    'Mumbai City',
    'Mumbai Suburban',
    'Nagpur',
    'Chhatrapati Sambhajinagar',
    'Nashik',
    'Kolhapur',
    'Solapur',
    'Thane',
    'Amravati',
    'Nanded',
    'Jalgaon',
    'Sangli',
    'Satara',
    'Latur',
    'Dhule',
    'Ahmednagar',
    'Other District / State',
  ];

  return (
    <div className="space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Photo Avatar with Upload Overlay */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-blueprint-dark text-sky-400 border-2 border-sky-500/40 flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <HardHat className="w-8 h-8" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                title="Upload Profile Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold font-mono">
                  {profile.subscriptionTier}
                </span>
                {profile.targetPost && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                    {profile.targetPost}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {profile.qualification} (Passout: {profile.graduationYear || 2024}) · {profile.districtOrCity || 'Maharashtra'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-mono block">STREAK</span>
              <span className="font-bold text-amber-500 text-sm flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 mr-0.5 fill-amber-500" />
                {profile.streakDays} Days
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-mono block">SOLVED</span>
              <span className="font-bold text-slate-900 text-sm font-mono">
                {profile.totalQuestionsSolved} MCQs
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-mono block">ACCURACY</span>
              <span className="font-bold text-emerald-600 text-sm font-mono">
                {profile.accuracyRate || 74.5}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Engineer Profile & Preparation Targets updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="font-bold text-slate-900 text-base">
            Civil Engineering Aspirant Credentials & Target Post
          </h2>
          <p className="text-xs text-slate-500">
            Personalize your study recommendations, mock test cut-off comparisons, and recruit notifications.
          </p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Candidate Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              required
            />
          </div>

          {/* Mobile Phone */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Mobile Contact (+91)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono"
            />
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Engineering Qualification
            </label>
            <select
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium"
            >
              <option value="Diploma in Civil Engineering">Diploma in Civil Engineering</option>
              <option value="B.E. / B.Tech in Civil Engineering">B.E. / B.Tech in Civil Engineering</option>
              <option value="Diploma + B.E. (Direct Second Year)">Diploma + B.E. (Direct Second Year)</option>
              <option value="M.E. / M.Tech in Structural Engineering">M.E. / M.Tech in Structural Engineering</option>
              <option value="M.E. / M.Tech in Water Resources / Environmental">M.E. / M.Tech in Water Resources / Environmental</option>
            </select>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Graduation / Passout Year</label>
            <select
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono"
            >
              {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* District / City */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              District / City (Home Cadre)
            </label>
            <select
              value={districtOrCity}
              onChange={(e) => setDistrictOrCity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            >
              {maharashtraDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Target Post */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Primary Target Post</label>
            <select
              value={targetPost}
              onChange={(e) => setTargetPost(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium"
            >
              <option value="Junior Engineer (JE) Group-B (Civil)">Junior Engineer (JE) Group-B (Civil)</option>
              <option value="Assistant Engineer (AE) Group-A (MPSC MES)">Assistant Engineer (AE) Group-A (MPSC MES)</option>
              <option value="Sub-Divisional Officer (SDO) / Sectional Engineer">Sub-Divisional Officer (SDO) / Sectional Engineer</option>
              <option value="Municipal Corporation Sub-Engineer / AE">Municipal Corporation Sub-Engineer / AE</option>
              <option value="RRB / SSC Senior Section Engineer (SSE)">RRB / SSC Senior Section Engineer (SSE)</option>
            </select>
          </div>

          {/* Daily Study Hours */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Daily Study Commitment</label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium"
            >
              <option value={2}>2 Hours / Day</option>
              <option value={3}>3 Hours / Day</option>
              <option value={4}>4 Hours / Day (Recommended)</option>
              <option value={6}>6 Hours / Day (Full-Time)</option>
              <option value={8}>8 Hours / Day (Intensive Officer)</option>
            </select>
          </div>

          {/* Daily Goal Questions */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Daily Target Questions</label>
            <input
              type="number"
              min={10}
              max={200}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono"
            />
          </div>
        </div>

        {/* Preferred Civil Engineering Exams */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-slate-900 font-bold text-xs">
                Target Civil Engineering Recruitment Examinations (Multi-Select)
              </label>
              <p className="text-[11px] text-slate-500">
                Choose all upcoming examinations you are preparing for in 2026-2027.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('exam-ecosystem')}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-lg border border-sky-200 flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
            >
              <span>Multi-Target Synergy Engine</span>
              <span className="text-[10px]">→</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {EXAM_CATALOGUE.map((exam) => {
              const isSelected = targetExams.includes(exam.id as ExamTargetId);
              return (
                <div
                  key={exam.id}
                  onClick={() => toggleTargetExam(exam.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 text-sky-950 font-semibold'
                      : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] shrink-0 ${
                      isSelected ? 'bg-sky-600 text-white' : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && '✓'}
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900">{exam.shortName}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{exam.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            id="save-profile-btn"
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Target Changes</span>
          </button>
        </div>
      </form>

      {/* Active Plans & Referral Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Plan Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                CURRENT SUBSCRIPTION
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{profile.subscriptionTier}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Valid through: <strong>{profile.subscriptionExpiry || '2025-12-31'}</strong>
            </p>

            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <p>✓ All 12 Full-Length Maharashtra PWD & MPSC MES Mock Tests</p>
              <p>✓ Complete 9-Tag Mistake Notebook with Leitner Retest Queue</p>
              <p>✓ Adaptive Study Planner with Syllabus Milestones</p>
              <p>✓ Official PYQ Archive (2015-2024)</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Plan ID: SP-ENG-PRO-2025</span>
            <button
              onClick={() => setActiveView && setActiveView('plans')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800"
            >
              Upgrade / Change Tier →
            </button>
          </div>
        </div>

        {/* Referral Code & Count */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                REFERRAL REWARDS
              </span>
              <span className="text-xs font-bold text-sky-600">
                {profile.referralCount || 7} Candidates Joined
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Invite Fellow Aspirants</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Share your referral code. Each colleague who subscribes earns you ₹50 mock test credits!
            </p>

            {/* Referral Code Box */}
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">YOUR CODE</span>
                <span className="font-mono font-extrabold text-sm text-slate-900">
                  {profile.referralCode || 'SP-PRIYA25'}
                </span>
              </div>
              <button
                id="copy-referral-btn"
                type="button"
                onClick={handleCopyReferral}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                {copiedReferral ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Credits Earned: ₹350</span>
            <span className="text-emerald-700 font-bold">1 Free CBT Mock Unlocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
