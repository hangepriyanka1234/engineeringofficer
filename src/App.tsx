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
import { AdminView } from './views/AdminView';
import { StudyPlannerView } from './views/StudyPlannerView';
import { ExamEcosystemView } from './views/ExamEcosystemView';
import { SitePracticalView } from './views/SitePracticalView';
import { VisualLearningView } from './views/VisualLearningView';
import { DailyCapsuleView } from './views/DailyCapsuleView';
import { GamificationView } from './views/GamificationView';
import { ReferralView } from './views/ReferralView';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { X, Layers, Building2 } from 'lucide-react';

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

          {activeView === 'pyqs' && (
            <PYQsView
              isAdmin={isAdmin}
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

          {activeView === 'materials' && (
            <StudyMaterialsView
              materials={materials}
              profile={profile}
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

          {activeView === 'contact' && <ContactSupportView />}

          {activeView === 'admin' && (
            <AdminView
              notices={notices}
              questions={questions}
              mockTests={mockTests}
              materials={materials}
              onDataModified={refreshData}
            />
          )}
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
                { id: 'notices', label: 'Current Recruitment' },
                { id: 'materials', label: 'IS Codes & Notes' },
                { id: 'analytics', label: 'Speed & Accuracy' },
                { id: 'referrals', label: 'Refer & Earn Pro' },
                { id: 'profile', label: 'My Profile & Targets' },
                { id: 'plans', label: 'Plans & Upgrades' },
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
