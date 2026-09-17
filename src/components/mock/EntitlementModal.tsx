import React from 'react';
import { Lock, Sparkles, Check, X, ShieldAlert } from 'lucide-react';
import { MockTest } from '../../types';

interface EntitlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  test: MockTest | null;
  userTier: string;
}

export const EntitlementModal: React.FC<EntitlementModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  test,
  userTier,
}) => {
  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              PREMIUM MOCK TEST
            </span>
            <h3 className="font-bold text-slate-900 text-lg mt-2">{test.title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              This test requires <span className="font-bold text-slate-800">{test.requiredTier || 'Blueprint Pro JE'}</span> entitlement. Your current tier is <span className="font-semibold text-sky-600">{userTier}</span>.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 text-left border border-slate-200 space-y-2 text-xs">
            <div className="font-semibold text-slate-800">Plan Benefits Unlocked:</div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full-length 120-minute CBT simulations with official marking schemes</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Authentic peer cohort rank & percentile comparison</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Server-authoritative score certification with cryptographic signature</span>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onUpgrade();
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
