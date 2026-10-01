import React, { useState, useEffect } from 'react';
import {
  Bell,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Vibrate,
  Sparkles,
  Send,
  Clock,
  Layers,
  ExternalLink
} from 'lucide-react';
import { PushNotificationService, PushNotificationPreferences } from '../services/pushNotificationService';

export const AndroidNotificationBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSupported, setIsSupported] = useState(true);
  const [prefs, setPrefs] = useState<PushNotificationPreferences>(PushNotificationService.getPreferences());
  const [lastSentTime, setLastSentTime] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const supported = PushNotificationService.isSupported();
    setIsSupported(supported);
    if (supported) {
      setPermission(PushNotificationService.getPermissionState());
      PushNotificationService.init();
    } else {
      setPermission('unsupported');
    }
  }, []);

  const handleRequestPermission = async () => {
    const res = await PushNotificationService.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      showToast('✓ मोबाईल नोटिफिकेशन परवानगी यशस्वीरित्या मिळाली!');
      // Trigger instant welcome notification so user sees it right away
      await PushNotificationService.sendSystemNotification({
        title: 'Engineering Officer BY MH',
        body: '🎉 अभिनंदन! आता सर्व परीक्षा जाहिराती, मॉक टेस्ट व अभ्यास अपडेट्स थेट तुमच्या मोबाईल स्क्रीनवर मिळतील.',
        url: '/#notifications',
        tag: 'eo-welcome-push',
      });
      setLastSentTime(new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }));
    } else if (res === 'denied') {
      showToast('⚠️ नोटिफिकेशन परवानगी नाकारली गेली आहे. कृपया ब्राऊझर सेटिंग्जमधून सुरू करा.');
    }
  };

  const handleSendTest = async (preset: 'exam_ad' | 'mock_live' | 'daily_quiz' | 'study_reminder' | 'rank_update') => {
    setIsTesting(true);
    const success = await PushNotificationService.sendPresetNotification(preset);
    setIsTesting(false);
    if (success) {
      setLastSentTime(new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }));
      showToast('⚡ वरून नोटिफिकेशन आले! मोबाईल स्टेटस बार किंवा लॉक स्क्रीन तपासा.');
    } else {
      if (permission !== 'granted') {
        handleRequestPermission();
      } else {
        showToast('⚠️ नोटिफिकेशन पाठवताना त्रुटी आली. कृपया परवानगी तपासा.');
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const togglePref = (key: keyof PushNotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    PushNotificationService.savePreferences(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Banner Top Highlight */}
      <div className="bg-gradient-to-r from-[#0F2744] via-[#1E3A8A] to-[#0284C7] p-4 sm:p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Android मोबाईल सिस्टीम पुश नोटिफिकेशन</h2>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live System
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-0.5">
                स्क्रीन लॉक असताना किंवा ॲप बंद असताना थेट मोबाईल स्क्रीनच्या वरून (Heads-Up) नोटिफिकेशन येईल.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2 self-start sm:self-center">
            {permission === 'granted' ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>फोनवर सुरू आहे (Active)</span>
              </span>
            ) : permission === 'denied' ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-rose-300" />
                <span>परवानगी बंद आहे (Blocked)</span>
              </span>
            ) : (
              <button
                onClick={handleRequestPermission}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Bell className="w-4 h-4 animate-bounce" />
                <span>🔔 १-टॅप मध्ये सुरू करा</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Visual Preview of the Native Android Notification (matching the screenshot) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>मोबाईल स्क्रीनवर हे नोटिफिकेशन असे दिसेल (Live Simulation):</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Android 14/15 Preview</span>
          </div>

          {/* Android Notification Card Recreation */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start space-x-3">
              {/* App Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2744] to-[#0284C7] p-1.5 flex items-center justify-center shrink-0 shadow-xs border border-sky-400/30">
                <img src="/icon.svg" alt="EO" className="w-full h-full object-contain" />
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-xs font-bold text-slate-900 truncate">Engineering Officer BY MH</span>
                    <span className="text-[10px] text-slate-400">• आताच</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {lastSentTime || '11:43 am'}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  MPSC Civil Engineering 2026: अधिकृत जाहिरात प्रसिद्ध!
                </div>
                <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                  450 जागांसाठी परीक्षा अर्ज सुरू झाले आहेत. सराव प्रश्नपत्रिका, पात्रता निकष आणि पूर्ण अभ्यासक्रम पाहण्यासाठी त्वरित टॅप करा...
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-sky-700 font-bold flex items-center space-x-1">
                <span>टॅप करून ॲप उघडा</span>
                <span>➔</span>
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                Heads-Up & Lock Screen Alert
              </span>
            </div>
          </div>
        </div>

        {/* Live Test Trigger Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Send className="w-3.5 h-3.5 text-sky-600" />
              <span>प्रत्यक्ष चाचणी घ्या (Test Live Notification Right Now):</span>
            </h3>
            {permission !== 'granted' && (
              <span className="text-[11px] text-amber-600 font-medium">
                (पहिली परवानगी द्या)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleSendTest('exam_ad')}
              disabled={isTesting}
              className="p-3 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer active:scale-98"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 group-hover:text-sky-700">
                <span className="text-base">📢</span>
                <span>MPSC भरती जाहिरात</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                450 जागांची अधिकृत जाहिरात अलर्ट
              </p>
              <div className="text-[10px] text-sky-600 font-bold mt-2 flex items-center space-x-1">
                <span>टेस्ट करा</span>
                <span>➔</span>
              </div>
            </button>

            <button
              onClick={() => handleSendTest('mock_live')}
              disabled={isTesting}
              className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer active:scale-98"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                <span className="text-base">🎯</span>
                <span>CBT मॉक टेस्ट LIVE</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                राज्यस्तरीय रँक टेस्ट सुरू अलर्ट
              </p>
              <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center space-x-1">
                <span>टेस्ट करा</span>
                <span>➔</span>
              </div>
            </button>

            <button
              onClick={() => handleSendTest('daily_quiz')}
              disabled={isTesting}
              className="p-3 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer active:scale-98"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 group-hover:text-amber-700">
                <span className="text-base">📝</span>
                <span>दैनिक सराव आव्हान</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                RCC व Soil चे 15 प्रश्न सोडवा
              </p>
              <div className="text-[10px] text-amber-600 font-bold mt-2 flex items-center space-x-1">
                <span>टेस्ट करा</span>
                <span>➔</span>
              </div>
            </button>

            <button
              onClick={() => handleSendTest('study_reminder')}
              disabled={isTesting}
              className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer active:scale-98"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 group-hover:text-purple-700">
                <span className="text-base">⏱️</span>
                <span>अभ्यास स्मरणपत्र</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                आजचे लक्ष्य पूर्ण करण्याचे रिमाइंडर
              </p>
              <div className="text-[10px] text-purple-600 font-bold mt-2 flex items-center space-x-1">
                <span>टेस्ट करा</span>
                <span>➔</span>
              </div>
            </button>
          </div>
        </div>

        {/* Preferences Toggle Settings */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => togglePref('sound')}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 cursor-pointer transition-all ${
                prefs.sound
                  ? 'bg-sky-50 border-sky-300 text-sky-800'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              {prefs.sound ? <Volume2 className="w-3.5 h-3.5 text-sky-600" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>आवाज (Notification Sound)</span>
            </button>

            <button
              onClick={() => togglePref('vibration')}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 cursor-pointer transition-all ${
                prefs.vibration
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              <Vibrate className="w-3.5 h-3.5 text-emerald-600" />
              <span>व्हायब्रेशन (Vibration)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>दैनिक स्मरण वेळ: सकाळी ०९:०० वा.</span>
          </div>
        </div>

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="p-3 bg-slate-900 text-white text-xs font-semibold rounded-xl text-center shadow-lg animate-fade-in flex items-center justify-center space-x-2">
            <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
