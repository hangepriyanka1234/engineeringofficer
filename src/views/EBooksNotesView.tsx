import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  Sparkles,
  FileText,
  Shield,
  Layers,
  CheckCircle2,
  DollarSign,
  Lock,
  ArrowRight,
  BookMarked,
  Volume2,
  PlusCircle,
  ExternalLink,
  Flame,
  Award,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { StudyMaterial, StudentProfile } from '../types';
import { SUBJECTS_LIST } from '../data/mockData';
import { EBookReaderModal } from '../components/EBookReaderModal';

interface EBooksNotesViewProps {
  materials: StudyMaterial[];
  profile: StudentProfile;
  isAdmin?: boolean;
  onNavigateToAdmin?: () => void;
  onUpgradePlan?: () => void;
}

export const EBooksNotesView: React.FC<EBooksNotesViewProps> = ({
  materials,
  profile,
  isAdmin = false,
  onNavigateToAdmin,
  onUpgradePlan,
}) => {
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalMaterial, setActiveModalMaterial] = useState<StudyMaterial | null>(null);

  // Grouped Categories
  const categories = [
    { id: 'all', label: 'सर्व विषय (All Subjects)', icon: BookOpen, count: materials.length },
    { id: 'economics', label: '⚡ अर्थशास्त्र (Engg & GS Economics)', icon: DollarSign, badge: 'विशेष / High-Yield', isSpecial: true },
    { id: 'structural', label: 'स्ट्रक्चरल (SOM, RCC, Steel)', icon: Layers },
    { id: 'geotech_water', label: 'जिओटेक व जलसंपदा (Soil, Hydrology, FM)', icon: Shield },
    { id: 'infra_survey', label: 'महामार्ग, पर्यावरण व मोजणी (Highway, Env, Survey)', icon: GraduationCap },
    { id: 'management', label: 'दर विश्लेषण व व्यवस्थापन (Estimating, CPM)', icon: FileText },
    { id: 'non_tech', label: 'अतांत्रिक (मराठी, इंग्रजी, GS, बुद्धिमत्ता)', icon: Award },
  ];

  // Map category to subjects
  const isSubjectInSelectedCategory = (subId: string, catId: string): boolean => {
    if (catId === 'all') return true;
    if (catId === 'economics') {
      return subId === 'engg_economics' || subId === 'economics_gs';
    }
    if (catId === 'structural') {
      return ['som', 'structural_analysis', 'rcc_concrete', 'steel_structures', 'building_materials', 'concrete_tech'].includes(subId);
    }
    if (catId === 'geotech_water') {
      return ['geotechnical', 'soil_mechanics', 'fluid_mechanics', 'hydrology_irrigation', 'hydrology'].includes(subId);
    }
    if (catId === 'infra_survey') {
      return ['transportation', 'environmental', 'surveying', 'town_planning'].includes(subId);
    }
    if (catId === 'management') {
      return ['estimating_costing', 'cpm_pert', 'engg_economics'].includes(subId);
    }
    if (catId === 'non_tech') {
      return ['marathi_grammar', 'english_grammar', 'general_studies', 'general_intelligence', 'economics_gs', 'environment_ecology', 'indian_polity'].includes(subId);
    }
    return true;
  };

  // Filter materials
  const filteredMaterials = materials.filter((mat) => {
    const matchesCategory = isSubjectInSelectedCategory(mat.subjectId, selectedSubjectCategory);
    const matchesSubject = selectedSubjectId === 'all' || mat.subjectId === selectedSubjectId;
    const matchesType = selectedType === 'all' || mat.type === selectedType;
    const matchesSearch =
      !searchQuery ||
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.highlights?.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mat.author?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSubject && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ----------------------------------------------------------------- */}
      {/* HERO BANNER & SEARCH */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#0F2744] via-[#16365C] to-[#0A1A2F] text-white rounded-2xl border border-sky-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>BY MH DIGITAL LIBRARY & E-NOTES</span>
              </span>
              <span className="text-xs text-sky-300 font-mono">Audio-Enabled Reader</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              सिव्हिल इंजिनिअरिंग व MPSC MES ई-बुक्स आणि ई-नोट्स
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              प्रत्येक विषयानुसार स्वतंत्र वर्गवारी (अभियांत्रिकी अर्थशास्त्र, SOM, RCC, Geotech, IS Codes, मराठी व GS).
              नेत्रसुखद सेपिया व डार्क थीम, टेक्स्ट-टू-स्पीच ऑडिओ वाचन आणि संपूर्ण सूत्र संग्रह!
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-300">
              <div className="flex items-center space-x-1.5 bg-slate-900/60 px-3 py-1 rounded-lg border border-sky-400/20">
                <BookMarked className="w-3.5 h-3.5 text-sky-400" />
                <span>{materials.length} डिजिटल बुक्स व नोट्स</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900/60 px-3 py-1 rounded-lg border border-emerald-400/20 text-emerald-300">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>मराठी/इंग्रजी ऑडिओ सक्षम</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900/60 px-3 py-1 rounded-lg border border-amber-400/20 text-amber-300">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>अर्थशास्त्र विशेष कव्हरेज</span>
              </div>
            </div>
          </div>

          {/* Admin Upload Quick Action */}
          {isAdmin && onNavigateToAdmin && (
            <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-400/30 text-center space-y-2 flex-shrink-0">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">
                सुपर ॲडमिन कंट्रोल
              </div>
              <button
                onClick={onNavigateToAdmin}
                className="w-full px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>नवीन ई-बुक / नोट्स फाईल टाका</span>
              </button>
              <div className="text-[10px] text-slate-400">
                PDF, Word, Markdown किंवा इमेज फाईल अपलोड करा
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SEARCH & TYPE FILTERS */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Live Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="ई-बुकचे नाव, लेखक, IS कोड किंवा विषय शोधा (उदा. अर्थशास्त्र, SOM, RCC, घसारा)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        {/* Document Type Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="दस्तऐवज प्रकार निवडा"
            className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">सर्व दस्तऐवज प्रकार (All Types)</option>
            <option value="ebook">ई-पुस्तके (Full E-Books)</option>
            <option value="topper_handwritten_notes">टॉपर हस्तलिखित नोट्स (Handwritten)</option>
            <option value="formula_sheet">सूत्र संग्रह (Formula Sheets)</option>
            <option value="is_code_summary">IS / PWD कोड्स (Codal Handbooks)</option>
            <option value="short_notes">रिव्हिजन शॉर्ट नोट्स (Revision Notes)</option>
          </select>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SUBJECT CATEGORY TABS (Prominently Featuring Economics / अर्थशास्त्र) */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
          विषयानुसार विभाजन (SUBJECT CATEGORIES):
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedSubjectCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedSubjectCategory(cat.id);
                  setSelectedSubjectId('all');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all border ${
                  isActive
                    ? cat.isSpecial
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-extrabold scale-102'
                      : 'bg-sky-600 text-white border-sky-700 shadow-md'
                    : cat.isSpecial
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-extrabold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-current' : cat.isSpecial ? 'text-amber-600' : 'text-sky-600'}`} />
                <span>{cat.label}</span>
                {cat.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-black/20 text-current' : 'bg-amber-200 text-amber-900'}`}>
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SUB-SUBJECT PILLS (When a specific category is picked) */}
      {/* ----------------------------------------------------------------- */}
      {selectedSubjectCategory === 'economics' && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-200 text-amber-900 font-bold">
              <DollarSign className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-amber-950">
                महाराष्ट्र अभियांत्रिकी सेवा (MES) व PWD/WRD अर्थशास्त्र विभाग:
              </span>
              <p className="text-[11px] text-amber-800">
                सिव्हिल इंजिनिअरिंग तांत्रिक प्रकल्प वित्तीय नियोजन (Time Value of Money, NPV, BCR, Depreciation, DSR) व MPSC GS अर्थव्यवस्था दोन्ही समाविष्ट.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                selectedSubjectId === 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-white text-amber-900 border-amber-300'
              }`}
            >
              दोन्ही अर्थशास्त्र
            </button>
            <button
              onClick={() => setSelectedSubjectId('engg_economics')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                selectedSubjectId === 'engg_economics'
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-white text-amber-900 border-amber-300'
              }`}
            >
              तांत्रिक अभियांत्रिकी अर्थशास्त्र
            </button>
            <button
              onClick={() => setSelectedSubjectId('economics_gs')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                selectedSubjectId === 'economics_gs'
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-white text-amber-900 border-amber-300'
              }`}
            >
              GS भारतीय अर्थव्यवस्था
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* BOOKS & NOTES GRID */}
      {/* ----------------------------------------------------------------- */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">कोणतेही ई-बुक सापडले नाही</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            निवडलेल्या फिल्टर किंवा सर्चनुसार सध्या कोणतीही फाईल उपलब्ध नाही. फिल्टर रीसेट करा किंवा सर्च शब्द बदला.
          </p>
          <button
            onClick={() => {
              setSelectedSubjectCategory('all');
              setSelectedSubjectId('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
          >
            सर्व फिल्टर्स रीसेट करा
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => {
            const subject = SUBJECTS_LIST.find((s) => s.id === mat.subjectId);
            const isEconomics = mat.subjectId === 'engg_economics' || mat.subjectId === 'economics_gs';
            const isLocked = !mat.isFree && profile.subscriptionTier === 'Free Starter';
            const chaptersCount = mat.chapters?.length || 1;

            return (
              <div
                key={mat.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isEconomics
                    ? 'border-amber-300 ring-1 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Book Spine / Header Top Strip */}
                <div
                  className={`p-4 border-b flex items-start justify-between gap-2 ${
                    isEconomics
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                      : 'bg-gradient-to-r from-slate-50 to-sky-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isEconomics
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-sky-100 text-sky-800 border-sky-300'
                      }`}
                    >
                      {subject?.code || 'CE'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {mat.type === 'ebook'
                        ? 'संपूर्ण ई-बुक'
                        : mat.type === 'topper_handwritten_notes'
                        ? 'हस्तलिखित नोट्स'
                        : mat.type === 'formula_sheet'
                        ? 'सूत्र संग्रह'
                        : 'IS कोड गाभा'}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500">
                    {mat.pages} पाने · {mat.fileSize}
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {mat.title}
                    </h3>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">लेखक: {mat.author || 'BY MH Faculty'}</span>
                      <span>•</span>
                      <span>~{mat.readTimeMinutes || 45} मि. वाचन</span>
                    </div>

                    {/* Highlights / Key Clauses */}
                    {mat.highlights && mat.highlights.length > 0 && (
                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono flex items-center justify-between">
                          <span>परीक्षेसाठी महत्त्वाचे मुद्दे:</span>
                          <span className="text-sky-600">{chaptersCount} धडे</span>
                        </span>
                        <ul className="text-xs text-slate-700 space-y-1">
                          {mat.highlights.slice(0, 3).map((h, hIdx) => (
                            <li key={hIdx} className="flex items-start space-x-1.5 line-clamp-1">
                              <span className="text-sky-600 font-bold">•</span>
                              <span className="truncate">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta & Buttons */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{mat.downloadCount.toLocaleString()} विद्यार्थ्यांनी वाचले</span>
                      <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>१००% परीक्षा उपयुक्त</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      {/* Read Button */}
                      <button
                        onClick={() => {
                          if (isLocked) {
                            if (onUpgradePlan) onUpgradePlan();
                            return;
                          }
                          setActiveModalMaterial(mat);
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all ${
                          isLocked
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                            : isEconomics
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                            <span>प्लॅन अनलॉक करा</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>थेट डिजिटल वाचा (Reader)</span>
                          </>
                        )}
                      </button>

                      {/* In-App Reader / Offline PDF Button */}
                      <button
                        onClick={() => {
                          if (isLocked) {
                            if (onUpgradePlan) onUpgradePlan();
                            return;
                          }
                          setActiveModalMaterial(mat);
                        }}
                        className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                        title="इन-ॲप डिजिटल वाचन"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* THE PRO READER MODAL */}
      {/* ----------------------------------------------------------------- */}
      {activeModalMaterial && (
        <EBookReaderModal
          material={activeModalMaterial}
          isOpen={Boolean(activeModalMaterial)}
          onClose={() => setActiveModalMaterial(null)}
          onUpgradePlan={onUpgradePlan}
        />
      )}
    </div>
  );
};
