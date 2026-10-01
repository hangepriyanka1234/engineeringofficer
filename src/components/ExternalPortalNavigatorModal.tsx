import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  X,
  Copy,
  Check,
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { LinkVerificationService } from '../services/linkVerificationService';

interface ExternalPortalNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  deptName?: string;
  targetUrl: string;
  onOpenInAppNotice?: () => void;
}

export const ExternalPortalNavigatorModal: React.FC<ExternalPortalNavigatorModalProps> = ({
  isOpen,
  onClose,
  title,
  deptName,
  targetUrl,
  onOpenInAppNotice,
}) => {
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const verifiedUrl = LinkVerificationService.getVerifiedPortalUrl(undefined, targetUrl);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(verifiedUrl);
    setCopied(true);
    setStatusMessage('लिंक क्लिपबोर्डवर यशस्वीरित्या कॉपी झाली आहे!');
    setTimeout(() => {
      setCopied(false);
      setStatusMessage(null);
    }, 3000);
  };

  const handleProceed = () => {
    const result = LinkVerificationService.safeOpenExternalLink(verifiedUrl, () => {
      setStatusMessage('लिंक क्लिपबोर्डवर सेव्ह झाली आहे!');
    });

    if (result.method === 'opened') {
      onClose();
    } else {
      setStatusMessage('ब्राउझरने नवीन टॅब ब्लॉक केल्यामुळे लिंक क्लिपबोर्डवर कॉपी केली आहे. कोणत्याही ब्राउझरमध्ये पेस्ट करा.');
    }
  };

  return (
    <div
      id="external-portal-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        id="external-portal-modal"
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                सत्यापित सरकारी पोर्टल (Verified Govt Portal)
              </span>
              <h3 className="font-bold text-slate-900 text-base leading-snug mt-1">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {deptName && (
          <p className="text-xs text-slate-600">
            <strong>विभाग / आयोग:</strong> {deptName}
          </p>
        )}

        {/* Portal URL box with HTTPS check */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>सुरक्षित पोर्टल लिंक (SSL Secured HTTPS):</span>
            <span className="inline-flex items-center text-emerald-700 font-bold space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>१००% सत्यापित</span>
            </span>
          </div>
          <div className="font-mono text-sky-800 font-semibold truncate bg-white p-2 rounded border border-slate-200 text-xs">
            {verifiedUrl}
          </div>
        </div>

        {/* Safe notice guarantee */}
        <div className="text-xs text-slate-600 leading-relaxed space-y-1 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
          <span className="font-bold text-amber-950 block">प्ले स्टोअर आणि सुरक्षा हमी:</span>
          सरकारी सर्व्हर तात्पुरता व्यस्त किंवा बंद असला तरीही तुम्ही खालील बटणावर क्लिक करून थेट इन-ॲप संपूर्ण राजपत्र वाचू शकता.
        </div>

        {statusMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center space-x-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'कॉपी झाले' : 'लिंक कॉपी करा'}</span>
            </button>

            {onOpenInAppNotice && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInAppNotice();
                }}
                className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>इन-ॲप राजपत्र</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
            >
              रद्द करा
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
            >
              <span>अधिकृत पोर्टल उघडा</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
