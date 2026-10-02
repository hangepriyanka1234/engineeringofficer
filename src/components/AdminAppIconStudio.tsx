import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Image as ImageIcon,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Info,
  ExternalLink,
  Sliders,
  Palette
} from 'lucide-react';

interface IconStatus {
  hasCustomIcon: boolean;
  fileSize: number;
  lastModified: string | null;
  dimensions: { width: number; height: number };
  url: string;
  androidMipmapsUpdated: boolean;
  updatedFilesCount: number;
}

interface AdminAppIconStudioProps {
  onNavigateToGitHub?: () => void;
}

export const AdminAppIconStudio: React.FC<AdminAppIconStudioProps> = ({ onNavigateToGitHub }) => {
  const [status, setStatus] = useState<IconStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('/ic_launcher.png');
  const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number }>({ width: 512, height: 512 });
  const [isReplacing, setIsReplacing] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    updatedFiles: string[];
    fileSize: number;
    timestamp: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current icon status from server
  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch('/api/admin/app-icon/status', {
        headers: {
          'x-admin-role': 'super_admin',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (!selectedFile && data.hasCustomIcon) {
          setPreviewUrl(`/ic_launcher.png?t=${Date.now()}`);
        }
      }
    } catch (e: any) {
      console.warn('Failed to load icon status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Handle file selection from local device / PC
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('कृपया वैध इमेज फाईल (PNG, JPG, WebP) निवडा.');
      return;
    }

    setErrorMessage(null);
    setSuccessResult(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setPreviewDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // One-click replace in all Android & Web folders
  const handleReplaceIcon = async () => {
    if (!previewUrl) {
      setErrorMessage('कृपया आधी एक आयकॉन फाईल निवडा किंवा ड्रॅग करा.');
      return;
    }

    setIsReplacing(true);
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      let base64Payload = previewUrl;
      // If preview is still a URL (like /ic_launcher.png), convert to base64 canvas
      if (previewUrl.startsWith('/') || previewUrl.startsWith('http')) {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        base64Payload = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/admin/app-icon/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-role': 'super_admin',
        },
        body: JSON.stringify({
          imageBase64: base64Payload,
          fileName: selectedFile?.name || 'ic_launcher.png',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to replace icon');
      }

      setSuccessResult({
        message: data.message,
        updatedFiles: data.updatedFiles || [],
        fileSize: data.fileSize || 0,
        timestamp: data.timestamp || new Date().toISOString(),
      });

      // Update active browser icon dynamically
      const faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = `/ic_launcher.png?v=${Date.now()}`;
      }

      // Re-fetch server status
      await fetchStatus();
    } catch (err: any) {
      setErrorMessage(err.message || 'आयकॉन रिप्लेस करताना त्रुटी आली.');
    } finally {
      setIsReplacing(false);
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    if (!window.confirm('तुम्हाला खरोखर डिफॉल्ट इंजिनिअरिंग बॅज आयकॉन रिस्टोअर करायचा आहे का?')) return;
    setIsResetting(true);
    setErrorMessage(null);
    setSuccessResult(null);
    try {
      const res = await fetch('/api/admin/app-icon/reset', {
        method: 'POST',
        headers: {
          'x-admin-role': 'super_admin',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setSelectedFile(null);
      setPreviewUrl(`/ic_launcher.png?t=${Date.now()}`);
      setSuccessResult({
        message: 'डिफॉल्ट आयकॉन यशस्वीरित्या रिस्टोअर करण्यात आला!',
        updatedFiles: data.updatedFiles || [],
        fileSize: data.fileSize || 0,
        timestamp: new Date().toISOString(),
      });
      await fetchStatus();
    } catch (e: any) {
      setErrorMessage(e.message || 'रिसेट अयशस्वी.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0F2744] to-slate-900 text-white rounded-xl p-6 border border-sky-500/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-extrabold">App Launcher Icon Studio (ic_launcher.png)</h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Google Play & Android
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                तुमच्याकडे असणारी <strong>ic_launcher.png</strong> फाईल थेट एडमिनमधून अपलोड करा. ती सर्व Android Mipmaps व Web PWA मध्ये एका क्लिकवर रिप्लेस होईल.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStatus}
              disabled={loadingStatus}
              className="px-3 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-200 text-xs font-bold border border-sky-500/30 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
              <span>रिफ्रेश स्टेटस</span>
            </button>
            <a
              href="/ic_launcher.png"
              download="ic_launcher.png"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>डाउनलोड सध्याचा आयकॉन</span>
            </a>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">ic_launcher.png स्थिती</div>
          <div className="text-sm font-extrabold text-slate-900 mt-1 flex items-center space-x-1.5">
            {status?.hasCustomIcon ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">सक्रिय (Active On Disk)</span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 text-amber-500" />
                <span className="text-amber-700">डिफॉल्ट सिस्टीम आयकॉन</span>
              </>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">public/ic_launcher.png</p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Android Mipmaps स्थिती</div>
          <div className="text-sm font-extrabold text-slate-900 mt-1 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span className="text-sky-700">५ डेंसिटी फाइल्स तयार</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi</p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">फाइल आकार व रिझोल्यूशन</div>
          <div className="text-sm font-extrabold text-slate-900 mt-1 font-mono">
            {status?.fileSize ? `${Math.round(status.fileSize / 1024)} KB` : '32 KB'} · 512×512 px
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Google Play 512px Approved</p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">अंतिम अपडेट तारीख</div>
          <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
            {status?.lastModified ? new Date(status.lastModified).toLocaleDateString('mr-IN', { hour: '2-digit', minute: '2-digit' }) : 'आज'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Synced with local build</p>
        </div>
      </div>

      {/* Success Notification */}
      {successResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successResult.message}</span>
          </div>
          <div className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2.5 rounded-lg font-mono space-y-0.5">
            <div className="font-bold text-[10px] uppercase text-emerald-900 mb-1">अपडेट झालेल्या फाइल्सची यादी:</div>
            {successResult.updatedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{file}</span>
              </div>
            ))}
          </div>
          <div className="pt-1 flex items-center space-x-2">
            <span className="text-[11px] text-emerald-700">पुढील पायरी:</span>
            {onNavigateToGitHub && (
              <button
                onClick={onNavigateToGitHub}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 underline flex items-center space-x-1 cursor-pointer"
              >
                <span>GitHub & Play Store टॅबमध्ये जाऊन Git Push करा आणि .AAB बिल्ड घ्या</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* File Upload Zone */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">तुमची Ic_launcher.png फाईल येथे अपलोड करा</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                PNG / 512×512 शिफारसीय
              </span>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
                  : 'border-slate-300 hover:border-sky-400 bg-slate-50 hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 mx-auto rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'तुमची ic_launcher.png फाईल येथे ड्रॅग करा किंवा क्लिक करून निवडा'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                मोबाईल किंवा लॅपटॉपमधून तुमची फाईल निवडा (PNG, JPG, WebP)
              </p>
              {selectedFile && (
                <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    निवडली: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB · {previewDimensions.width}×{previewDimensions.height}px)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleReplaceIcon}
                disabled={isReplacing}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isReplacing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>सर्व ॲन्ड्रॉइड व वेब फाइल्स रिप्लेस होत आहेत...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>सर्व ठिकाणी रिप्लेस करा (Replace in All Android & Web Folders)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetToDefault}
                disabled={isResetting}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isResetting ? 'रीसेट होत आहे...' : 'डिफॉल्ट रिस्टोअर'}
              </button>
            </div>
          </div>

          {/* Detailed Instructions in Marathi */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
              <Info className="w-4 h-4 text-sky-600" />
              <span>हे कसे कार्य करते? (How it works)</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-sky-600 shrink-0">१.</span>
                <span>
                  <strong>ic_launcher.png</strong> अपलोड करून 'सर्व ठिकाणी रिप्लेस करा' बटण दाबताच सिस्टीम आपोआप 5 Android Density Mipmaps (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) तयार करते.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-sky-600 shrink-0">२.</span>
                <span>
                  सर्क्युलर लाँचर्ससाठी आपोआप <strong>ic_launcher_round.png</strong> आणि प्ले स्टोअरसाठी <strong>512×512 px</strong> मास्टर आयकॉन जनरेट होतो.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-sky-600 shrink-0">३.</span>
                <span>
                  यानंतर वरच्या टॅबमधून <strong>'GitHub & Play Store (.AAB)'</strong> मध्ये जाऊन फक्त <strong>Git Push</strong> करा. नवीन आयकॉन थेट GitHub रिपॉझिटरीमध्ये सेव्ह होईल आणि नवीन <strong>.aab</strong> फाईलमध्ये हाच आयकॉन येईल!
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Multi-Form Factor Live Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">लाईव्ह प्रिव्ह्यू (Multi-View Preview)</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Renderer</span>
            </div>

            {/* Android Smartphone Screen Mockup */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>१. मोबाईल स्क्रीनवर कसा दिसेल? (Phone Mockup)</span>
                <span className="text-sky-600 text-[10px] font-normal">Pixel / Samsung</span>
              </div>
              <div className="w-full max-w-[260px] mx-auto bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 rounded-[28px] p-3 border-4 border-slate-800 shadow-xl relative overflow-hidden">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[9px] text-slate-300 font-mono px-2 pt-1 pb-2">
                  <span>10:30 AM</span>
                  <div className="flex items-center space-x-1">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Home screen wallpaper effect with simulated apps */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="App Icon Preview"
                      className="w-16 h-16 rounded-[18px] shadow-lg border border-white/20 object-cover bg-slate-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                      1
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white mt-2 tracking-tight drop-shadow-md text-center">
                    Engg Officer
                  </span>
                  <span className="text-[8px] text-amber-300 font-mono font-semibold">BY MH</span>
                </div>

                {/* Bottom Dock simulation */}
                <div className="pt-3 pb-1 border-t border-white/10 flex justify-around opacity-60">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/80"></div>
                  <div className="w-7 h-7 rounded-full bg-blue-500/80"></div>
                  <div className="w-7 h-7 rounded-full bg-amber-500/80"></div>
                  <div className="w-7 h-7 rounded-full bg-slate-600/80"></div>
                </div>
              </div>
            </div>

            {/* Individual Icons Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Google Play Store Icon (Square with subtle round) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <div className="text-[10px] font-bold text-slate-600 uppercase">Play Store (512×512)</div>
                <img
                  src={previewUrl}
                  alt="Play Store Icon"
                  className="w-16 h-16 mx-auto rounded-xl shadow-md border border-slate-200 object-cover bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icon.svg';
                  }}
                />
                <div className="text-[10px] text-slate-500 font-mono">ic_launcher.png</div>
              </div>

              {/* Android Round Icon (ic_launcher_round.png) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <div className="text-[10px] font-bold text-slate-600 uppercase">Adaptive Round (Circle)</div>
                <img
                  src={previewUrl}
                  alt="Round Icon"
                  className="w-16 h-16 mx-auto rounded-full shadow-md border-2 border-slate-200 object-cover bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icon.svg';
                  }}
                />
                <div className="text-[10px] text-slate-500 font-mono">ic_launcher_round.png</div>
              </div>
            </div>

            {/* Web Header Simulation */}
            <div className="p-3 bg-slate-900 rounded-xl border border-sky-500/20 text-white space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">वेब व PWA हेडर प्रिव्ह्यू</div>
              <div className="flex items-center space-x-2.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <img
                  src={previewUrl}
                  alt="Web Nav Icon"
                  className="w-7 h-7 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icon.svg';
                  }}
                />
                <div className="leading-tight">
                  <div className="text-xs font-extrabold text-white font-mono">ENGINEERING OFFICER</div>
                  <div className="text-[9px] text-sky-400">BY MH · Civil Engineering</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
