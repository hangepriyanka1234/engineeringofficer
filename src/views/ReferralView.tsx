import React, { useState, useEffect } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Users,
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { StudentProfile, ReferralStudentStatus } from '../types';
import { PaymentReferralService } from '../services/paymentReferralService';

interface ReferralViewProps {
  profile: StudentProfile;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ profile }) => {
  const [referralStatus, setReferralStatus] = useState<ReferralStudentStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferral();
  }, [profile.email]);

  const loadReferral = async () => {
    setLoading(true);
    const data = await PaymentReferralService.getReferralStatus(profile.email, profile.name);
    setReferralStatus(data);
    setLoading(false);
  };

  const copyLink = () => {
    if (referralStatus) {
      navigator.clipboard.writeText(referralStatus.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !referralStatus) {
    return <div className="p-12 text-center text-slate-400">Loading Referral Station...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-800 via-purple-900 to-slate-900 rounded-2xl p-6 text-white border border-purple-700/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
              <Gift className="w-3.5 h-3.5" />
              <span>Invite Fellow Civil Engineers • Anti-Fraud Secured</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Referral Rewards & Bonus Pro Access</h1>
            <p className="text-purple-200 text-sm max-w-2xl">
              Gift your friends 10% discount on CBT Test Series & Pro Packs. You earn <strong>+7 Days of Pro Access</strong> & <strong>50 Bonus AI Credits</strong> per verified active peer.
            </p>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-white/10 text-center">
            <div className="text-xs text-purple-200 uppercase font-semibold">Total Pro Days Earned</div>
            <div className="text-2xl font-bold text-white font-mono">+{referralStatus.subscriptionDaysEarned} Days</div>
          </div>
        </div>
      </div>

      {/* Invite Code Share Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-purple-400" />
          <span>Your Unique Referral Link & Code</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={referralStatus.inviteLink}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-purple-300 font-mono focus:outline-none"
          />
          <button
            onClick={copyLink}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link!' : 'Copy Invite Link'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Referral Code: <strong className="text-white font-mono">{referralStatus.referralCode}</strong></span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Fraud Risk Score: {referralStatus.fraudMetrics.riskScore}/100 (Safe & Verified)</span>
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Invited</div>
          <div className="text-2xl font-bold text-white">{referralStatus.totalReferralsCount} Friends</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="text-xs text-emerald-400 uppercase font-semibold">Verified Active</div>
          <div className="text-2xl font-bold text-emerald-400">{referralStatus.verifiedReferralsCount} Peers</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="text-xs text-purple-400 uppercase font-semibold">AI Credits Earned</div>
          <div className="text-2xl font-bold text-purple-400">+{referralStatus.totalBonusCreditsEarned} Credits</div>
        </div>
      </div>

      {/* Recent Referral Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-850 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Referral Activity Log
        </div>
        <div className="divide-y divide-slate-800">
          {referralStatus.recentReferrals.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">{item.referredNameMasked}</div>
                <div className="text-xs text-slate-500">Joined on {item.joinedDate}</div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  item.status === 'verified_active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {item.rewardAwarded}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
