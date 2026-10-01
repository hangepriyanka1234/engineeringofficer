import React, { useState, useRef } from 'react';
import {
  BookOpen,
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  FileCode2,
  Sparkles,
  DollarSign,
  Download,
  ExternalLink,
  Layers,
  Save,
  Search,
  HardDrive,
  Copy,
  ChevronDown,
  ChevronUp,
  Shield,
  FileUp,
  Info
} from 'lucide-react';
import { StudyMaterial, SubjectId } from '../types';
import { SUBJECTS_LIST } from '../data/mockData';
import { StorageService } from '../services/storageService';
import { EBookReaderModal } from './EBookReaderModal';

interface AdminEBooksNotesManagerProps {
  materials: StudyMaterial[];
  onDataModified: () => void;
}

export const AdminEBooksNotesManager: React.FC<AdminEBooksNotesManagerProps> = ({
  materials,
  onDataModified,
}) => {
  const [notesList, setNotesList] = useState<StudyMaterial[]>(materials);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showFormatGuide, setShowFormatGuide] = useState<boolean>(true);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);

  // New Note Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSubjectId, setFormSubjectId] = useState<SubjectId>('engg_economics');
  const [formType, setFormType] = useState<StudyMaterial['type']>('ebook');
  const [formAuthor, setFormAuthor] = useState<string>('Er. MH Subject Faculty');
  const [formPages, setFormPages] = useState<number>(45);
  const [formFileSize, setFormFileSize] = useState<string>('4.2 MB');
  const [formIsFree, setFormIsFree] = useState<boolean>(true);
  const [formFileUrl, setFormFileUrl] = useState<string>('');
  const [formHighlights, setFormHighlights] = useState<string>(
    'Time Value of Money आणि चक्रवाढ घटक\nNPV, Benefit-Cost Ratio (BCR) व IRR पद्धती\nघसारा पद्धती (Straight Line, Sinking Fund)\nPWD Schedule of Rates (DSR) दर विश्लेषण'
  );
  const [formChapters, setFormChapters] = useState<
    Array<{ id: string; title: string; page: number; summary: string; content: string; formulas?: string[] }>
  >([
    {
      id: 'ch-1',
      title: 'धडा १: मूलभूत संकल्पना व सूत्रे',
      page: 1,
      summary: 'मुख्य व्याख्या, निकष व परीक्षेत विचारले जाणारे नियम.',
      content: `### १. मूलभूत संकल्पना:\nसिव्हिल इंजिनिअरिंग व MPSC MES परीक्षेसाठी हा विषय अत्यंत उच्च गुण देणारा आहे.\n\n#### महत्त्वाचे मुद्दे:\n- प्रत्येक सूत्राची एकके व मानक व्हॅल्यूज लक्षात ठेवा.\n- PWD नियमावली व IS कोडांनुसार अचूक गणना करा.`,
      formulas: ['F = P(1 + i)^n', 'D = (C - S) / n'],
    },
  ]);

  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    // Format size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFormFileSize(`${sizeInMb} MB`);

    // Create browser local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setFormFileUrl(objectUrl);

    // If title is empty, auto-populate from file name
    if (!formTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFormTitle(cleanName);
    }
  };

  const handleAddChapter = () => {
    const newCh = {
      id: `ch-${Date.now()}`,
      title: `धडा ${formChapters.length + 1}: नवीन प्रकरण`,
      page: (formChapters[formChapters.length - 1]?.page || 1) + 15,
      summary: 'प्रकरणाचा संक्षिप्त सारांश...',
      content: '### प्रकरणातील मुख्य मुद्दे:\nयेथे सविस्तर मजकूर लिहा किंवा नोट्स पेस्ट करा.',
      formulas: [],
    };
    setFormChapters([...formChapters, newCh]);
  };

  const handleRemoveChapter = (index: number) => {
    setFormChapters(formChapters.filter((_, i) => i !== index));
  };

  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('कृपया ई-बुक किंवा नोट्सचे शीर्षक टाका.');
      return;
    }

    const highlightsList = formHighlights
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const newMaterial: StudyMaterial = {
      id: `mat-user-${Date.now()}`,
      title: formTitle.trim(),
      subjectId: formSubjectId,
      type: formType,
      pages: Number(formPages) || 30,
      fileSize: formFileSize || '3.5 MB',
      isFree: formIsFree,
      author: formAuthor.trim() || 'BY MH Faculty',
      downloadCount: 1,
      publishedDate: new Date().toISOString().split('T')[0],
      readTimeMinutes: Math.round((Number(formPages) || 30) * 1.5),
      highlights: highlightsList.length > 0 ? highlightsList : ['परीक्षा उपयुक्त तांत्रिक नोट्स'],
      fileUrl: formFileUrl || undefined,
      chapters: formChapters,
    };

    const updated = [newMaterial, ...notesList];
    setNotesList(updated);
    StorageService.saveMaterials(updated);
    StorageService.addAuditLog('Admin', 'Uploaded E-Book/Notes', `Added "${newMaterial.title}" under ${newMaterial.subjectId}`);
    onDataModified();

    setShowUploadModal(false);
    alert('✅ ई-बुक / ई-नोट्स यशस्वीरित्या प्रकाशित करण्यात आले आहे! सर्व विद्यार्थ्यांना आता हे उपलब्ध होईल.');
  };

  const handleDeleteMaterial = (id: string) => {
    if (!window.confirm('तुम्हाला हे ई-बुक / नोट्स निश्चितपणे काढून टाकायचे आहे का?')) return;
    const updated = notesList.filter((m) => m.id !== id);
    setNotesList(updated);
    StorageService.saveMaterials(updated);
    StorageService.addAuditLog('Admin', 'Deleted E-Book/Notes', `Removed note ID ${id}`);
    onDataModified();
  };

  // Filter notes
  const filteredNotes = notesList.filter((m) => {
    const matchesSubject = selectedSubjectFilter === 'all' || m.subjectId === selectedSubjectFilter;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* HEADER BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0F2744] text-white rounded-2xl p-6 border border-sky-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase">
              STUDY MATERIALS & E-LIBRARY CMS
            </span>
            <span className="text-xs text-sky-400 font-mono">विषयानुसार व्यवस्थापन</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-1 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>ई-बुक्स आणि ई-नोट्स व्यवस्थापक (E-Books & Notes Studio)</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            येथून तुम्ही सिव्हिल इंजिनिअरिंगच्या प्रत्येक विषयासाठी (उदा. अभियांत्रिकी अर्थशास्त्र, SOM, RCC, Geotech, IS Codes, मराठी, GS)
            नवीन PDF फाईल्स किंवा रिच डिजिटल नोट्स अपलोड करू शकता.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>नवीन फाईल किंवा ई-बुक टाका</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EXPLICIT GUIDANCE CARD: "कोणती फाईल टाकायची? (WHICH FILES TO UPLOAD?)" */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-extrabold text-amber-950">
              मार्गदर्शन: ॲपमध्ये कोणती फाईल टाकायची? (Supported File Formats & Instructions)
            </h3>
          </div>
          <button
            onClick={() => setShowFormatGuide(!showFormatGuide)}
            className="text-xs text-amber-800 font-bold hover:underline flex items-center space-x-1"
          >
            <span>{showFormatGuide ? 'लपवा' : 'तपशील पहा'}</span>
            {showFormatGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFormatGuide && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* 1. PDF */}
            <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-1.5 shadow-2xs">
              <div className="font-extrabold text-amber-950 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                <span>१. PDF फाईल (.pdf)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                <strong>सर्वोत्तम पर्याय:</strong> संपूर्ण पुस्तके, हस्तलिखित नोट्सचे स्कॅन, MPSC MES जुन्या प्रश्नपत्रिका, PWD DSR व IS कोड्स.
              </p>
              <div className="text-[10px] text-amber-800 font-mono bg-amber-100/60 p-1.5 rounded">
                💡 थेट तुमच्या फोन/लॅपटॉपवरून सिलेक्ट करा किंवा Google Drive/Cloud ची लिंक पेस्ट करा.
              </div>
            </div>

            {/* 2. Direct Digital Text / Markdown */}
            <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-1.5 shadow-2xs">
              <div className="font-extrabold text-amber-950 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>२. रिच डिजिटल नोट्स</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                <strong>सर्वोत्तम अनुभव:</strong> धड्यांची सूत्रे, रिव्हिजन पॉईंट्स आणि मराठी/इंग्रजी टेक्स्ट-टू-स्पीच ऑडिओ वाचनासाठी.
              </p>
              <div className="text-[10px] text-emerald-800 font-mono bg-emerald-100/60 p-1.5 rounded">
                💡 ॲपच्या 'खतरनाक' डिजिटल रीडरमध्ये सेपिया, डार्क मोड व ऑडिओ आपोआप चालू होतो.
              </div>
            </div>

            {/* 3. Word / Document */}
            <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-1.5 shadow-2xs">
              <div className="font-extrabold text-amber-950 flex items-center space-x-1.5">
                <HardDrive className="w-4 h-4 text-sky-600" />
                <span>३. वर्ड / डॉक्स (.docx)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                क्लासरूम नोट्स किंवा टाईप केलेले लेक्चर्स. तुम्ही वर्ड फाईल सिलेक्ट करू शकता किंवा PDF मध्ये सेव्ह करून टाकू शकता.
              </p>
              <div className="text-[10px] text-sky-800 font-mono bg-sky-100/60 p-1.5 rounded">
                💡 वर्डमधून PDF एक्सपोर्ट करून टाकल्यास पानांची मांडणी अत्यंत आकर्षक दिसते.
              </div>
            </div>

            {/* 4. Images / Charts */}
            <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-1.5 shadow-2xs">
              <div className="font-extrabold text-amber-950 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>४. चार्ट्स व नकाशे (.jpg/.png)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                BBS (Bar Bending Schedule) चार्ट्स, Soil Mechanics फेज डायग्राम्स, Mohr's सर्कल आणि IS कोड तक्ते.
              </p>
              <div className="text-[10px] text-indigo-800 font-mono bg-indigo-100/60 p-1.5 rounded">
                💡 स्पष्ट व हाय-रिझोल्युशन प्रतिमा थेट अपलोड करा.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FILTERS & SEARCH BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Subject Filter (Includes engg_economics prominently) */}
        <div className="flex items-center space-x-2">
          <label htmlFor="admin-notes-subject-filter" className="text-xs font-bold text-slate-600">विषय:</label>
          <select
            id="admin-notes-subject-filter"
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">सर्व विषय ({notesList.length} फाईल्स)</option>
            <option value="engg_economics">⚡ अभियांत्रिकी अर्थशास्त्र (Engineering Economics)</option>
            <option value="economics_gs">⚡ अर्थशास्त्र व भारतीय अर्थव्यवस्था (GS Economics)</option>
            {SUBJECTS_LIST.filter((s) => s.id !== 'engg_economics' && s.id !== 'economics_gs').map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="पुस्तकाचे नाव किंवा लेखकाचे नाव शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NOTES LIST TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>सध्या उपलब्ध ई-बुक्स व ई-नोट्स ({filteredNotes.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {notesList.filter((n) => n.subjectId === 'engg_economics' || n.subjectId === 'economics_gs').length} अर्थशास्त्र नोट्स समाविष्ट
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredNotes.map((mat) => {
            const subject = SUBJECTS_LIST.find((s) => s.id === mat.subjectId);
            const isEconomics = mat.subjectId === 'engg_economics' || mat.subjectId === 'economics_gs';

            return (
              <div
                key={mat.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isEconomics
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-sky-100 text-sky-800 border-sky-300'
                      }`}
                    >
                      {subject?.name || mat.subjectId}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {mat.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mat.pages} पाने · {mat.fileSize}
                    </span>
                    {mat.fileUrl && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        PDF अटॅच
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {mat.title}
                  </h4>

                  <div className="text-xs text-slate-500 flex items-center space-x-2">
                    <span>लेखक: {mat.author || 'BY MH Faculty'}</span>
                    <span>•</span>
                    <span>वाचले: {mat.downloadCount.toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      {mat.chapters?.length || 1} डिजिटल धडे
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Live Reader Preview Button */}
                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    title="खतरनाक प्रिव्ह्यू पहा (Live Reader)"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>वाचा / प्रिव्ह्यू</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteMaterial(mat.id)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                    title="काढून टाका"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* UPLOAD / CREATE MODAL */}
      {/* ------------------------------------------------------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-[#0F2744] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>नवीन ई-बुक किंवा नोट्स फाईल जोडा (Publish New E-Book)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  सर्व विषयांसाठी (विशेषतः अर्थशास्त्र) सविस्तर नोट्स किंवा PDF फाईल अपलोड करा.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewNote} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  विषय निवडा (SUBJECT) *
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value as SubjectId)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 bg-white p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <optgroup label="🌟 अर्थशास्त्र (Economics - MPSC MES & Civil)">
                    <option value="engg_economics">
                      अभियांत्रिकी अर्थशास्त्र व प्रकल्प वित्तीय व्यवस्थापन (Engineering Economics & Project Finance)
                    </option>
                    <option value="economics_gs">
                      अर्थशास्त्र व भारतीय अर्थव्यवस्था (GS Economics, Public Finance, Budget & RBI)
                    </option>
                  </optgroup>
                  <optgroup label="🏗️ सिव्हिल इंजिनिअरिंग तांत्रिक विषय (Technical Subjects)">
                    {SUBJECTS_LIST.filter((s) => s.id !== 'engg_economics' && s.id !== 'economics_gs').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ई-बुक किंवा नोट्सचे पूर्ण नाव (TITLE) *
                </label>
                <input
                  type="text"
                  placeholder="उदा. अभियांत्रिकी अर्थशास्त्र व व्हॅल्यूएशन संपूर्ण हँडबुक..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-medium focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              {/* Document Type & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    दस्तऐवज प्रकार (TYPE)
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 font-medium"
                  >
                    <option value="ebook">ई-बुक (Full E-Book)</option>
                    <option value="topper_handwritten_notes">टॉपर हस्तलिखित नोट्स (Handwritten)</option>
                    <option value="formula_sheet">सूत्र संग्रह (Formula Sheet)</option>
                    <option value="is_code_summary">IS / PWD कोड्स (Codal Digest)</option>
                    <option value="short_notes">रिव्हिजन शॉर्ट नोट्स</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    फॅकल्टी / लेखक नाव (AUTHOR)
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              {/* File Upload Box (Local Device or Cloud URL) */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLocalFileChange}
                  accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <FileUp className="w-8 h-8 text-sky-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  {uploadedFileName ? (
                    <span className="text-emerald-700 flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>निवडलेली फाईल: {uploadedFileName} ({formFileSize})</span>
                    </span>
                  ) : (
                    <span>तुमच्या डिव्हाइसवरून PDF, Word किंवा नोट्स फाईल निवडा</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  {uploadedFileName ? 'दुसरी फाईल निवडा' : 'ब्राऊझ करा (Select File)'}
                </button>
                <div className="text-[10px] text-slate-500">
                  किंवा खाली थेट Google Drive / Cloud लिंक पेस्ट करा:
                </div>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... किंवा Cloud PDF URL"
                  value={formFileUrl}
                  onChange={(e) => setFormFileUrl(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              {/* Pages & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    एकूण पाने (PAGES)
                  </label>
                  <input
                    type="number"
                    value={formPages}
                    onChange={(e) => setFormPages(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    फाईल साईझ (SIZE)
                  </label>
                  <input
                    type="text"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  मुख्य परीक्षा वैशिष्ट्ये / मुद्दे (HIGHLIGHTS - प्रति ओळ १ मुद्दा)
                </label>
                <textarea
                  rows={3}
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-medium"
                />
              </div>

              {/* Chapters Builder */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    डिजिटल धडे / अनुक्रमणिका ({formChapters.length} Chapters)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddChapter}
                    className="px-2.5 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>धडा जोडा</span>
                  </button>
                </div>

                {formChapters.map((ch, cIdx) => (
                  <div key={ch.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">धडा {cIdx + 1}</span>
                      {formChapters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChapter(cIdx)}
                          className="text-rose-600 hover:underline text-[11px]"
                        >
                          काढून टाका
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="धड्याचे नाव..."
                        value={ch.title}
                        onChange={(e) => {
                          const updated = [...formChapters];
                          updated[cIdx].title = e.target.value;
                          setFormChapters(updated);
                        }}
                        className="col-span-2 p-1.5 border rounded bg-white font-bold"
                        required
                      />
                      <input
                        type="number"
                        placeholder="पान क्र."
                        value={ch.page}
                        onChange={(e) => {
                          const updated = [...formChapters];
                          updated[cIdx].page = Number(e.target.value);
                          setFormChapters(updated);
                        }}
                        className="p-1.5 border rounded bg-white font-mono"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="धड्यातील सविस्तर मजकूर किंवा मुख्य सूत्रे पेस्ट करा..."
                      value={ch.content}
                      onChange={(e) => {
                        const updated = [...formChapters];
                        updated[cIdx].content = e.target.value;
                        setFormChapters(updated);
                      }}
                      className="w-full p-2 border rounded bg-white text-xs font-mono"
                    />
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>ई-बुक प्रकाशित करा (Publish to App)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LIVE READER PREVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {previewMaterial && (
        <EBookReaderModal
          material={previewMaterial}
          isOpen={Boolean(previewMaterial)}
          onClose={() => setPreviewMaterial(null)}
        />
      )}
    </div>
  );
};
