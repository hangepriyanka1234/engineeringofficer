import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  ExamTargetId,
  Question,
  MockTest,
  RecruitmentNotice,
  StudyMaterial,
  MistakeLog,
  NotificationItem,
  TestAttempt
} from './types';
import { StorageService } from './services/storageService';
import { mockTestService } from './services/mockTestService';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { DashboardView } from './views/DashboardView';
import { PracticeView } from './views/PracticeView';
import { MockTestsView } from './views/MockTestsView';
import { PYQsView } from './views/PYQsView';
import { SubjectsView } from './views/SubjectsView';
import { StudyMaterialsView } from './views/StudyMaterialsView';
import { EBooksNotesView } from './views/EBooksNotesView';
import { CurrentRecruitmentView } from './views/CurrentRecruitmentView';
import { AICoachView } from './views/AICoachView';
import { MistakeNotebookView } from './views/MistakeNotebookView';
import { SpacedRevisionView } from './views/SpacedRevisionView';
import { FormulaLabView } from './views/FormulaLabView';
import { CalculatorSuiteView } from './views/CalculatorSuiteView';
import { AnalyticsView } from './views/AnalyticsView';
import { VideosView } from './views/VideosView';
import { ProfileView } from './views/ProfileView';
import { PlansPaymentsView } from './views/PlansPaymentsView';
import { NotificationsView } from './views/NotificationsView';
import { ContactSupportView } from './views/ContactSupportView';
import { TermsConditionsView } from './views/TermsConditionsView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { RefundPolicyView } from './views/RefundPolicyView';
import { ShippingPolicyView } from './views/ShippingPolicyView';
import { AccountDeletionView } from './views/AccountDeletionView';
import { AdminView } from './views/AdminView';
import { StudyPlannerView } from './views/StudyPlannerView';
import { ExamEcosystemView } from './views/ExamEcosystemView';
import { SitePracticalView } from './views/SitePracticalView';
import { VisualLearningView } from './views/VisualLearningView';
import { DailyCapsuleView } from './views/DailyCapsuleView';
import { GamificationView } from './views/GamificationView';
import { ReferralView } from './views/ReferralView';
import { QuestionPaperHubView } from './views/QuestionPaperHubView';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { PlayStoreComplianceModal } from './components/PlayStoreComplianceModal';
import { X, Layers, Building2, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(StorageService.getProfile());
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<ExamTargetId>('maha_pwd');

  // Application Data States
  const [questions, setQuestions] = useState<Question[]>(StorageService.getQuestions());
  const [mockTests, setMockTests] = useState<MockTest[]>(StorageService.getMockTests());
  const [notices, setNotices] = useState<RecruitmentNotice[]>(StorageService.getNotices());
  const [materials, setMaterials] = useState<StudyMaterial[]>(StorageService.getStudyMaterials());
  const [mistakes, setMistakes] = useState<MistakeLog[]>(StorageService.getMistakes());
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageService.getNotifications());
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(StorageService.getTestAttempts());
  const [selectedPracticeSubject, setSelectedPracticeSubject] = useState<string>('all');

  // Mobile "More" Menu Modal
  const [showMobileMore, setShowMobileMore] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showComplianceModal, setShowComplianceModal] = useState<boolean>(false);

  // Sync state helpers
  const refreshData = () => {
    setProfile(StorageService.getProfile());
    setQuestions(StorageService.getQuestions());
    setNotices(StorageService.getNotices());
    setMaterials(StorageService.getStudyMaterials());
    setMistakes(StorageService.getMistakes());
    setNotifications(StorageService.getNotifications());
    setTestAttempts(StorageService.getTestAttempts());
    
    // Sync mock tests from server engine
    mockTestService.getTests().then((serverTests) => {
      if (serverTests && serverTests.length > 0) {
        setMockTests(serverTests);
      } else {
        setMockTests(StorageService.getMockTests());
      }
    }).catch(() => {
      setMockTests(StorageService.getMockTests());
    });
  };

  useEffect(() => {
    refreshData();

    // Direct URL pathname, query, and hash navigation for separate legal pages & deep links
    const syncRouteFromUrl = () => {
      const pathname = window.location.pathname.replace(/^\//, '').toLowerCase().trim();
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      const searchParams = new URLSearchParams(window.location.search);
      const queryView = (searchParams.get('view') || searchParams.get('page') || '').toLowerCase().trim();

      const candidate = pathname || hash || queryView;

      if (!candidate) return;

      if (candidate.includes('privacy')) {
        setActiveView('privacy-policy');
      } else if (candidate.includes('delete-account') || candidate.includes('account-deletion')) {
        setActiveView('account-deletion');
      } else if (candidate.includes('terms')) {
        setActiveView('terms-conditions');
      } else if (candidate.includes('refund') || candidate.includes('cancellation')) {
        setActiveView('refund-policy');
      } else if (candidate.includes('shipping')) {
        setActiveView('shipping-policy');
      } else if (candidate.includes('contact') || candidate.includes('support')) {
        setActiveView('contact');
      } else if (candidate.includes('compliance') || candidate.includes('playstore') || candidate === 'legal') {
        setShowComplianceModal(true);
      } else if (candidate === 'practice') {
        setActiveView('practice');
      } else if (candidate === 'pyqs' || candidate === 'question-papers') {
        setActiveView('pyqs');
      } else if (candidate === 'mock-tests' || candidate === 'mocks') {
        setActiveView('mock-tests');
      } else if (candidate === 'exams' || candidate === 'exam-ecosystem') {
        setActiveView('exam-ecosystem');
      } else if (candidate === 'profile') {
        setActiveView('profile');
      } else if (candidate === 'admin') {
        setActiveView('admin');
      } else if (hash) {
        setActiveView(hash);
      }
    };
    syncRouteFromUrl();
    window.addEventListener('hashchange', syncRouteFromUrl);
    window.addEventListener('popstate', syncRouteFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncRouteFromUrl);
      window.removeEventListener('popstate', syncRouteFromUrl);
    };
  }, []);

  const handleNotificationRead = (id: string) => {
    StorageService.markNotificationRead(id);
    setNotifications(StorageService.getNotifications());
  };

  const handleMarkAllNotificationsRead = () => {
    StorageService.markAllNotificationsRead();
    setNotifications(StorageService.getNotifications());
  };

  const handleQuestionSolved = () => {
    const updated = StorageService.incrementQuestionsSolved();
    setProfile(updated);
  };

  const handleAttemptSaved = () => {
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        profile={profile}
        activeView={activeView}
        setActiveView={setActiveView}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        selectedExam={selectedExam}
        setSelectedExam={setSelectedExam}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
        onOpenComplianceModal={() => setShowComplianceModal(true)}
      />

      {/* Main Workspace with Sidebar & View Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            profile={profile}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            onOpenComplianceModal={() => setShowComplianceModal(true)}
          />
        </div>

        {/* Dynamic Center Stage View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {activeView === 'dashboard' && (
            <DashboardView
              profile={profile}
              selectedExam={selectedExam}
              setSelectedExam={setSelectedExam}
              setActiveView={setActiveView}
              mockTests={mockTests}
              notices={notices}
              mistakeCount={mistakes.length}
            />
          )}

          {activeView === 'study-planner' && (
            <StudyPlannerView
              profile={profile}
              onPlanUpdated={refreshData}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'exam-ecosystem' && (
            <ExamEcosystemView
              studentProfile={profile}
              onUpdateProfile={(up) => {
                setProfile(up);
                setSelectedExam(up.primaryTargetExam);
              }}
              onSelectPrimaryExam={(exId) => {
                setSelectedExam(exId);
                const updated = { ...profile, primaryTargetExam: exId };
                setProfile(updated);
                StorageService.saveProfile(updated);
              }}
              onNavigateToPractice={(subId) => {
                if (subId) setSelectedPracticeSubject(subId);
                setActiveView('practice');
              }}
            />
          )}

          {activeView === 'practice' && (
            <PracticeView
              questions={questions}
              profile={profile}
              selectedExam={selectedExam}
              initialSubject={selectedPracticeSubject}
              onQuestionSolved={handleQuestionSolved}
            />
          )}

          {activeView === 'mock-tests' && (
            <MockTestsView
              mockTests={mockTests}
              questions={questions}
              profile={profile}
              selectedExam={selectedExam}
              onAttemptSaved={handleAttemptSaved}
              onUpgradePlan={() => setActiveView('plans')}
            />
          )}

          {(activeView === 'pyqs' || activeView === 'question-papers') && (
            <QuestionPaperHubView
              isAdmin={isAdmin}
              userEmail={profile.email}
              onNavigateToAdmin={() => setActiveView('admin')}
            />
          )}

          {activeView === 'subjects' && (
            <SubjectsView
              initialExam={selectedExam}
              onSelectSubjectPractice={(subjId) => {
                setSelectedPracticeSubject(subjId);
                setActiveView('practice');
              }}
            />
          )}

          {(activeView === 'ebooks-notes' || activeView === 'materials') && (
            <EBooksNotesView
              materials={materials}
              profile={profile}
              isAdmin={isAdmin}
              onNavigateToAdmin={() => setActiveView('admin')}
              onUpgradePlan={() => setActiveView('plans')}
            />
          )}

          {activeView === 'notices' && (
            <CurrentRecruitmentView
              notices={notices}
              selectedExam={selectedExam}
              onSelectExam={(examId) => {
                setSelectedExam(examId);
                setActiveView('dashboard');
              }}
            />
          )}

          {activeView === 'ai-coach' && (
            <AICoachView profile={profile} selectedExam={selectedExam} />
          )}

          {activeView === 'mistakes' && (
            <MistakeNotebookView
              mistakes={mistakes}
              onMistakesUpdated={refreshData}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'spaced-revision' && (
            <SpacedRevisionView
              userEmail={profile.email}
              onNavigateToMistakes={() => setActiveView('mistakes')}
              onNavigateToPractice={() => setActiveView('practice')}
            />
          )}

          {activeView === 'formula-lab' && (
            <FormulaLabView
              userEmail={profile.email}
              onSelectCalculator={() => setActiveView('calculators')}
            />
          )}

          {activeView === 'calculators' && (
            <CalculatorSuiteView />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              profile={profile}
              testAttempts={testAttempts}
              onStartPractice={(subjId) => {
                if (subjId) setSelectedPracticeSubject(subjId);
                setActiveView('practice');
              }}
              onNavigateToMistakes={() => setActiveView('mistakes')}
              onNavigateToMockTests={() => setActiveView('mock-tests')}
            />
          )}

          {activeView === 'videos' && <VideosView />}

          {activeView === 'profile' && (
            <ProfileView
              profile={profile}
              onProfileUpdated={(up) => setProfile(up)}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'plans' && (
            <PlansPaymentsView
              profile={profile}
              onPlanUpgraded={refreshData}
              setActiveView={setActiveView}
            />
          )}

          {/* Dedicated Legal Pages (Razorpay & Statutory Merchant Compliance) */}
          {(activeView === 'terms-conditions' || activeView === 'terms-and-conditions' || activeView === 'terms') && (
            <TermsConditionsView
              onBack={() => setActiveView('dashboard')}
              setActiveView={setActiveView}
            />
          )}

          {(activeView === 'privacy-policy' || activeView === 'privacy') && (
            <PrivacyPolicyView
              onBack={() => setActiveView('dashboard')}
              setActiveView={setActiveView}
            />
          )}

          {(activeView === 'refund-policy' || activeView === 'refund' || activeView === 'cancellation-policy') && (
            <RefundPolicyView
              onBack={() => setActiveView('plans')}
              setActiveView={setActiveView}
            />
          )}

          {(activeView === 'shipping-policy' || activeView === 'shipping') && (
            <ShippingPolicyView
              onBack={() => setActiveView('dashboard')}
              setActiveView={setActiveView}
            />
          )}

          {(activeView === 'contact' || activeView === 'contact-us' || activeView === 'support') && (
            <ContactSupportView
              onBack={() => setActiveView('dashboard')}
              setActiveView={setActiveView}
            />
          )}

          {(activeView === 'account-deletion' || activeView === 'delete-account') && (
            <AccountDeletionView
              profile={profile}
              onBack={() => setActiveView('profile')}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onNotificationClick={(n) => {
                handleNotificationRead(n.id);
                if (n.actionLink) setActiveView(n.actionLink);
              }}
            />
          )}

          {activeView === 'daily-capsule' && (
            <DailyCapsuleView
              userEmail={profile.email}
              onOpenFormula={() => setActiveView('formula-lab')}
              onOpenPractice={() => setActiveView('practice')}
            />
          )}

          {activeView === 'site-practical' && (
            <SitePracticalView
              onOpenPractice={() => setActiveView('practice')}
            />
          )}

          {activeView === 'visual-learning' && (
            <VisualLearningView
              onOpenFormula={() => setActiveView('formula-lab')}
              onOpenPractice={() => setActiveView('practice')}
            />
          )}

          {activeView === 'gamification' && (
            <GamificationView profile={profile} />
          )}

          {activeView === 'referrals' && (
            <ReferralView profile={profile} />
          )}

          {activeView === 'admin' && (
            <AdminView
              notices={notices}
              questions={questions}
              mockTests={mockTests}
              materials={materials}
              onDataModified={refreshData}
            />
          )}

          {/* Executive Bottom Footer & Razorpay / Statutory Merchant Compliance */}
          <footer className="mt-12 pt-8 pb-4 border-t border-slate-200/90 text-slate-500 text-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-slate-900 font-mono tracking-tight text-sm">
                    ENGINEERING OFFICER BY MH
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Play Store Verified
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                    Razorpay Gateway Approved
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 max-w-xl leading-relaxed">
                  Operated and legally billed by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>. Registered under the Maharashtra Shops & Establishments Act and Ministry of MSME Udyam Registration (Govt. of India).
                </p>
              </div>

              {/* Dedicated Legal Pages Navigation */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setActiveView('terms-conditions')}
                  className="hover:text-sky-700 hover:underline cursor-pointer"
                >
                  नियम व अटी (Terms)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => setActiveView('privacy-policy')}
                  className="hover:text-sky-700 hover:underline cursor-pointer text-sky-800 font-bold"
                >
                  गोपनीयता धोरण (Privacy)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => setActiveView('refund-policy')}
                  className="hover:text-sky-700 hover:underline cursor-pointer"
                >
                  रिफंड धोरण (Refund Policy)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => setActiveView('shipping-policy')}
                  className="hover:text-sky-700 hover:underline cursor-pointer"
                >
                  वितरण धोरण (Shipping)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => setActiveView('contact-us')}
                  className="hover:text-sky-700 hover:underline cursor-pointer"
                >
                  विद्यार्थी सहाय्य कक्ष (Contact)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => setShowComplianceModal(true)}
                  className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>पडताळणी (Compliance)</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
              <span className="font-bold text-slate-800 shrink-0">शासकीय अस्वीकरण व मर्चंट माहिती (Disclaimer & Merchant Details):</span>
              <span>
                हे ॲप खाजगी शैक्षणिक अभ्यास व्यासपीठ असून ते <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> द्वारे संचालित आहे. हे कोणत्याही सरकारी आयोगाचे अधिकृत ॲप नाही. भरतीची सर्व माहिती अधिकृत राजपत्रांमधून संकलित केलेली आहे. सर्व देयके Razorpay सुरक्षित गेटवेद्वारे स्वीकारली जातात.
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenMore={() => setShowMobileMore(true)}
      />

      {/* Mobile "More" Full Screen Menu */}
      {showMobileMore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-sky-500/30 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 text-white space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm">All Civil Engineering Sections</h3>
              </div>
              <button
                onClick={() => setShowMobileMore(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Play Store Policy Trigger */}
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">प्ले स्टोअर धोरण व गोपनीयता</span>
              </div>
              <button
                onClick={() => {
                  setShowMobileMore(false);
                  setShowComplianceModal(true);
                }}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
              >
                पहा (View)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'dashboard', label: 'Home / Dashboard' },
                { id: 'daily-capsule', label: 'Daily Civil Capsule' },
                { id: 'exam-ecosystem', label: 'Target Exam Engine' },
                { id: 'study-planner', label: 'Study Planner & Tasks' },
                { id: 'practice', label: 'Practice MCQs' },
                { id: 'mock-tests', label: 'CBT Mock Tests' },
                { id: 'site-practical', label: 'Site Engineer Lab' },
                { id: 'visual-learning', label: 'Visual Diagrams Lab' },
                { id: 'formula-lab', label: 'Civil Formula Lab' },
                { id: 'calculators', label: 'Engineering Calculators' },
                { id: 'ai-coach', label: 'Er. SP AI Tutor' },
                { id: 'mistakes', label: 'Mistake Notebook' },
                { id: 'spaced-revision', label: 'Spaced Repetition' },
                { id: 'gamification', label: 'State Leaderboard' },
                { id: 'pyqs', label: 'Previous Papers (PYQs)' },
                { id: 'ebooks-notes', label: 'ई-बुक्स आणि ई-नोट्स' },
                { id: 'notices', label: 'Current Recruitment' },
                { id: 'materials', label: 'IS Codes & Notes' },
                { id: 'analytics', label: 'Speed & Accuracy' },
                { id: 'referrals', label: 'Refer & Earn Pro' },
                { id: 'profile', label: 'My Profile & Targets' },
                { id: 'plans', label: 'Plans & Upgrades' },
                { id: 'privacy-policy', label: '🔒 Privacy Policy (गोपनीयता)' },
                { id: 'terms-conditions', label: '📜 Terms & Conditions' },
                { id: 'refund-policy', label: '💳 Refund Policy' },
                { id: 'contact-us', label: '📞 Contact & Support' },
                { id: 'admin', label: 'Admin Console' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'admin') setIsAdmin(true);
                    setActiveView(item.id);
                    setShowMobileMore(false);
                  }}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    activeView === item.id
                      ? 'bg-sky-600 text-white border-sky-400 font-bold'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Google Play Store Compliance, Privacy Policy & Link Health Audit Modal */}
      <PlayStoreComplianceModal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
        onNavigateToView={(v) => setActiveView(v)}
      />

      {/* Student Onboarding & Personalization Modal */}
      <OnboardingModal
        profile={profile}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSaveProfile={(updated) => {
          const newProf = { ...profile, ...updated };
          StorageService.saveProfile(newProf);
          setProfile(newProf);
        }}
      />
    </div>
  );
}
