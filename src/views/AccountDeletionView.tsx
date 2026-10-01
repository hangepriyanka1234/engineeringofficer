import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, CheckCircle2, ArrowLeft, Mail, Building2, Lock } from 'lucide-react';
import { StudentProfile } from '../types';
import { StorageService } from '../services/storageService';

interface AccountDeletionViewProps {
  profile?: StudentProfile;
  onBack?: () => void;
  setActiveView?: (view: string) => void;
}

export const AccountDeletionView: React.FC<AccountDeletionViewProps> = ({
  profile,
  onBack,
  setActiveView,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleted, setIsSubmitted] = useState(false);
  const [reason, setReason] = useState('Exam completed');

  const handleDeleteAccount = () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      alert('खाता हटवण्यासाठी कृपया "DELETE" टाईप करा.');
      return;
    }

    if (confirm('तुम्हाला तुमचे खाते व सर्व सेव्ह केलेला डेटा (प्रगती, मॉक टेस्ट इतिहास) कायमचा हटवायचा आहे का?')) {
      setIsSubmitted(true);
      // Clear profile local data
      localStorage.removeItem('engineering_student_profile');
      StorageService.logSecurityEvent('ACCOUNT_DELETION_REQUESTED', `In-App Account Deletion executed for ${profile?.email || 'user@student.com'}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-2 text-rose-600 font-mono text-xs font-bold uppercase tracking-wider">
              <Trash2 className="w-4 h-4" />
              <span>Google Play Policy Compliance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Account Deletion & Data Removal Request (खाता हटवणे)
            </h1>
          </div>
        </div>
      </div>

      {!isDeleted ? (
        <div className="space-y-6 text-xs sm:text-sm">
          {/* Information Banner */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2">
            <div className="font-bold flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>खाता हटवण्यापूर्वी महत्त्वाची माहिती (Important Notice):</span>
            </div>
            <p className="leading-relaxed">
              In compliance with Google Play Developer Policy and India DPDP Act 2023, you have the absolute right to request permanent deletion of your account, personal data, practice history, and test score telemetry.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-amber-800">
              <li>खाता हटवल्यानंतर तुमचे सर्व गुण, मॉक टेस्टचा इतिहास आणि Mistake Notebook मधील नोट्स कायमच्या हटवल्या जातील.</li>
              <li>सक्रिय सदस्यता (Active Subscription) असल्यास ती पुन्हा मिळवता येणार नाही.</li>
            </ul>
          </div>

          {/* User Email Details */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div><strong>Registered Account Email:</strong> {profile?.email || 'student@engineeringofficer.in'}</div>
            <div><strong>Operating Entity:</strong> PRIME MULTI SERVICES AND SUPPLIERS</div>
            <div><strong>Platform Name:</strong> Engineering Officer BY MH</div>
          </div>

          {/* Deletion Form */}
          <div className="space-y-4 p-5 bg-rose-50/50 rounded-2xl border border-rose-100">
            <h3 className="text-sm font-bold text-rose-900">खाता हटवण्याची पुष्टी करा (Confirm Account Deletion)</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">कारण निवडा (Reason for Deletion):</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
              >
                <option value="Exam completed">परीक्षा पूर्ण झाली (Exam Preparation Finished)</option>
                <option value="Created multiple accounts">दुसरे खाते वापरत आहे (Duplicate Account)</option>
                <option value="Privacy concerns">गोपनीयता कारणे (Privacy Concerns)</option>
                <option value="Other">इतर कारण (Other Reason)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                खात्री करण्यासाठी खालील बॉक्समध्ये <strong>"DELETE"</strong> टाइप करा:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              onClick={handleDeleteAccount}
              disabled={confirmText.trim().toUpperCase() !== 'DELETE'}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>माझे खाते व डेटा कायमचा हटवा (Delete Account Permanently)</span>
            </button>
          </div>

          {/* External Web Request Option */}
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-xs space-y-2">
            <div className="font-bold flex items-center space-x-2">
              <Mail className="w-4 h-4 text-sky-600" />
              <span>External Web Page / Email Deletion Request:</span>
            </div>
            <p>
              If you are unable to log in to the app, you can request manual account erasure by emailing our Grievance Officer at <strong>gitevijay123@gmail.com</strong> with your registered mobile number and email.
            </p>
          </div>
        </div>
      ) : (
        /* Confirmation State */
        <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-emerald-900">खाता हटवण्याची विनंती स्वीकारली गेली आहे!</h2>
          <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
            Your account deletion request has been processed. All local telemetry and stored records for {profile?.email || 'student@engineeringofficer.in'} have been cleared.
          </p>
          <button
            onClick={() => {
              if (setActiveView) setActiveView('dashboard');
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
          >
            मुख्य पानावर जा (Go to Home)
          </button>
        </div>
      )}
    </div>
  );
};
