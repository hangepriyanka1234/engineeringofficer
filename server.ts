import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { ServerTestEngine } from "./server/testEngine";
import { ServerSyllabusEngine } from "./server/syllabusEngine";
import { ServerExamEngine } from "./server/examEngine";
import { ServerPracticeEngine } from "./server/practiceEngine";
import { ServerPyqEngine } from "./server/pyqEngine";
import { ServerAnalyticsEngine } from "./server/analyticsEngine";
import { ServerMistakeEngine } from "./server/mistakeEngine";
import { ServerRevisionEngine } from "./server/revisionEngine";
import { ServerFormulaEngine } from "./server/formulaEngine";
import { ServerCalculatorEngine } from "./server/calculatorEngine";
import { ServerAITutorEngine } from "./server/aiTutorEngine";
import { ServerSitePracticalEngine } from "./server/sitePracticalEngine";
import { ServerDiagramEngine } from "./server/diagramEngine";
import { ServerCapsuleEngine } from "./server/capsuleEngine";
import { ServerRecruitmentEngine } from "./server/recruitmentEngine";
import { ServerGamificationEngine } from "./server/gamificationEngine";
import { ServerPaymentReferralEngine } from "./server/paymentReferralEngine";
import { ServerPaymentEngine } from "./server/paymentEngine";
import { ServerQuotaOptimizationEngine } from "./server/quotaOptimizationEngine";
import { ServerAIGatewayEngine } from "./server/aiGatewayEngine";
import { ServerMediaStorageEngine } from "./server/mediaStorageEngine";
import { ServerAdminOperationsEngine } from "./server/adminOperationsEngine";
import { ServerLoadTestEngine } from "./server/loadTestEngine";
import { ServerQuestionBankEngine } from "./server/questionBankEngine";
import { ServerSupabaseEngine } from "./server/supabaseEngine";
import { requireAdminAuth } from "./server/adminAuthMiddleware";
import { LegalPagesEngine } from "./server/legalPagesEngine";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==========================================
// GOOGLE PLAY & STATUTORY LEGAL PAGES (Standalone HTTP 200 Endpoints)
// ==========================================
app.get(["/privacy-policy", "/privacy"], (req: Request, res: Response) => LegalPagesEngine.renderPrivacyPolicy(req, res));
app.get(["/delete-account", "/account-deletion"], (req: Request, res: Response) => LegalPagesEngine.renderAccountDeletion(req, res));
app.post("/api/account/delete-request", (req: Request, res: Response) => LegalPagesEngine.handleAccountDeletionPost(req, res));
app.get(["/terms-conditions", "/terms-and-conditions", "/terms"], (req: Request, res: Response) => LegalPagesEngine.renderTermsOfService(req, res));
app.get(["/refund-policy", "/cancellation-policy", "/refund"], (req: Request, res: Response) => LegalPagesEngine.renderRefundPolicy(req, res));
app.get(["/shipping-policy", "/shipping"], (req: Request, res: Response) => LegalPagesEngine.renderShippingPolicy(req, res));
app.get(["/contact-us", "/contact", "/support"], (req: Request, res: Response) => LegalPagesEngine.renderContactSupport(req, res));
app.get(["/legal", "/playstore-compliance", "/compliance"], (req: Request, res: Response) => LegalPagesEngine.renderLegalHub(req, res));

// Server-side Authentication & Authorization Middleware for all Admin APIs
app.use("/api/admin", requireAdminAuth);

// Initialize server-side Gemini client with aistudio-build user agent header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health Check API
app.get("/api/health", async (_req: Request, res: Response) => {
  const supabaseStatus = await ServerSupabaseEngine.testConnection();
  res.json({
    status: "ok",
    app: "Engineering Officer BY MH",
    version: "1.0.0",
    engine: "Civil Engineering Prep Platform",
    supabase: supabaseStatus,
    timestamp: new Date().toISOString(),
  });
});

// Supabase Connection Status API
app.get("/api/supabase/status", async (_req: Request, res: Response) => {
  try {
    const status = await ServerSupabaseEngine.testConnection();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ connected: false, message: error.message });
  }
});

// Supabase Keep-Alive Heartbeat Ping (Prevents auto-pause from both internal calls and external monitors)
const handleKeepAlive = async (_req: Request, res: Response) => {
  try {
    const pingResult = await ServerSupabaseEngine.triggerKeepAlive();
    res.json(pingResult);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
app.get("/api/supabase/keepalive", handleKeepAlive);
app.post("/api/supabase/keepalive", handleKeepAlive);

// Supabase Storage & Database Metrics
app.get("/api/supabase/storage-metrics", async (_req: Request, res: Response) => {
  try {
    const metrics = await ServerSupabaseEngine.getStorageMetrics();
    res.json({ success: true, metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supabase Credentials Manager
app.get("/api/supabase/credentials", (_req: Request, res: Response) => {
  res.json(ServerSupabaseEngine.getCredentials());
});

app.post("/api/supabase/credentials", (req: Request, res: Response) => {
  const { url, key } = req.body;
  if (!url || !key) {
    return res.status(400).json({ error: "url and key are required" });
  }
  ServerSupabaseEngine.setCredentials(url, key);
  res.json({ success: true, message: "Supabase credentials updated and reconnected." });
});

// Razorpay Admin Configuration APIs
app.get("/api/razorpay/config", (_req: Request, res: Response) => {
  res.json(ServerPaymentEngine.getRazorpayConfig());
});

app.post("/api/razorpay/config", (req: Request, res: Response) => {
  const updated = ServerPaymentEngine.updateRazorpayConfig(req.body);
  res.json({ success: true, config: updated });
});



// ==========================================
// CBT TEST ENGINE & REALISTIC MOCK SIMULATION APIs (Part 11)
// ==========================================

// Get all server-authoritative mock tests with metadata & sections
app.get("/api/tests", (req: Request, res: Response) => {
  try {
    const { mockType, examTargetId, subjectId, isFree, search } = req.query;
    const tests = ServerTestEngine.getTests({
      mockType: mockType as string,
      examTargetId: examTargetId as string,
      subjectId: subjectId as string,
      isFree: isFree !== undefined ? isFree === 'true' : undefined,
      search: search as string,
    });
    res.json({ tests });
  } catch (error: any) {
    console.error("[TestEngine] Error fetching tests:", error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

// Get individual test configuration
app.get("/api/tests/:testId", (req: Request, res: Response) => {
  try {
    const test = ServerTestEngine.getTest(req.params.testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found on server." });
    }
    res.json({ test });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch test details" });
  }
});

// Start test session (enforces entitlement checks, strips correct answers, records server timestamp)
app.post("/api/tests/:testId/start", (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const { userTier, userEmail } = req.body;

    const result = ServerTestEngine.startSession(testId, userTier, userEmail);
    if (result.error) {
      const statusCode = result.code === 'ENTITLEMENT_REQUIRED' ? 403 : 400;
      return res.status(statusCode).json({ error: result.error, code: result.code });
    }

    res.json(result.session);
  } catch (error: any) {
    console.error("[TestEngine] Error starting session:", error);
    res.status(500).json({ error: "Failed to start test session" });
  }
});

// Batched autosave active test session
app.post("/api/tests/:testId/autosave", (req: Request, res: Response) => {
  try {
    const { serverSessionId, answers, markedForReview, currentQuestionIdx, currentSectionId, timeRemainingSeconds } = req.body;
    if (!serverSessionId) {
      return res.status(400).json({ error: "serverSessionId is required for autosave" });
    }

    const saveResult = ServerTestEngine.autosaveSession(serverSessionId, {
      answers: answers || {},
      markedForReview: markedForReview || {},
      currentQuestionIdx,
      currentSectionId,
      timeRemainingSeconds,
    });

    res.json(saveResult);
  } catch (error: any) {
    console.error("[TestEngine] Autosave error:", error);
    res.status(500).json({ error: "Failed to autosave session" });
  }
});

// Session recovery for page reload / disconnect
app.get("/api/tests/session/:sessionId", (req: Request, res: Response) => {
  try {
    const session = ServerTestEngine.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Active session not found or has expired." });
    }
    res.json({ session });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to recover session" });
  }
});

// Authoritative test submission: calculates score server-side, saves immutable attempt, returns unlocked solutions
app.post("/api/tests/:testId/submit", (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const { serverSessionId, userAnswers, clientDurationSeconds, userTier, userEmail } = req.body;

    const evaluation = ServerTestEngine.evaluateSubmission({
      serverSessionId,
      testId,
      userAnswers: userAnswers || {},
      clientDurationSeconds: Number(clientDurationSeconds) || 0,
      userTier,
      userEmail,
    });

    if (evaluation.error) {
      return res.status(400).json({ error: evaluation.error, code: evaluation.code });
    }

    // Materialize into Analytics Engine incrementally for zero-latency dashboards
    try {
      ServerAnalyticsEngine.recordTestAttempt(userEmail || 'student@engineeringofficer.in', evaluation.result);
    } catch (anErr) {
      console.warn("[AnalyticsEngine] Incremental attempt update warning:", anErr);
    }

    res.json({
      result: evaluation.result,
      unlockedQuestions: evaluation.unlockedQuestions,
    });
  } catch (error: any) {
    console.error("[TestEngine] Submission evaluation error:", error);
    res.status(500).json({ error: "Failed to evaluate test submission" });
  }
});

// Get user test attempt history (Immutable records)
app.get("/api/tests/attempts/history", (req: Request, res: Response) => {
  try {
    const { userEmail, testId } = req.query;
    const attempts = ServerTestEngine.getAttempts(userEmail as string, testId as string);
    res.json({ attempts });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load attempts history" });
  }
});

// Get single attempt review
app.get("/api/tests/attempts/:id", (req: Request, res: Response) => {
  try {
    const attempt = ServerTestEngine.getAttemptById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ error: "Attempt record not found" });
    }
    res.json({ attempt });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load attempt" });
  }
});

// Cohort benchmark dataset for authentic percentile and rank comparison
app.get("/api/tests/:testId/cohort", (req: Request, res: Response) => {
  const test = ServerTestEngine.getTest(req.params.testId);
  if (!test) {
    return res.status(404).json({ error: "Test not found." });
  }
  res.json({ cohort: test.cohortBenchmark, title: test.title });
});

// ==========================================
// ADMIN MOCK TEST MANAGEMENT APIs (Part 11)
// ==========================================

// Admin: Get all tests with full configuration
app.get("/api/admin/tests", (_req: Request, res: Response) => {
  try {
    const tests = ServerTestEngine.getTests();
    res.json({ tests });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load tests for admin" });
  }
});

// Admin: Question pool for builder
app.get("/api/admin/tests/questions-pool", (req: Request, res: Response) => {
  try {
    const { subjectId, difficulty, search } = req.query;
    const questions = ServerTestEngine.getQuestionsPool({
      subjectId: subjectId as string,
      difficulty: difficulty as string,
      search: search as string,
    });
    res.json({ questions });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load questions pool" });
  }
});

// Admin: Create Mock Test
app.post("/api/admin/tests", (req: Request, res: Response) => {
  try {
    const testData = req.body;
    if (!testData.title) {
      return res.status(400).json({ error: "Title is required for mock test." });
    }
    const created = ServerTestEngine.adminCreateTest(testData);
    res.status(201).json({ success: true, test: created });
  } catch (error: any) {
    console.error("[TestEngine] Error creating test:", error);
    res.status(500).json({ error: "Failed to create test" });
  }
});

// Admin: Update Mock Test
app.put("/api/admin/tests/:testId", (req: Request, res: Response) => {
  try {
    const updated = ServerTestEngine.adminUpdateTest(req.params.testId, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Test not found to update." });
    }
    res.json({ success: true, test: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update test" });
  }
});

// Admin: Delete Mock Test
app.delete("/api/admin/tests/:testId", (req: Request, res: Response) => {
  try {
    const success = ServerTestEngine.adminDeleteTest(req.params.testId);
    if (!success) {
      return res.status(404).json({ error: "Test not found or could not be deleted." });
    }
    res.json({ success: true, message: "Mock test deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete test" });
  }
});

// Admin: Clone Mock Test
app.post("/api/admin/tests/:testId/clone", (req: Request, res: Response) => {
  try {
    const cloned = ServerTestEngine.adminCloneTest(req.params.testId);
    if (!cloned) {
      return res.status(404).json({ error: "Source test not found to clone." });
    }
    res.status(201).json({ success: true, test: cloned });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to clone test" });
  }
});

// ==========================================
// PART 12 — RESULTS, PERFORMANCE ANALYTICS & DIAGNOSTICS APIs
// ==========================================

// Get materialized analytics summary (O(1) cached lookup with instant response)
app.get("/api/analytics/student", (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || "student@engineeringofficer.in";
    const data = ServerAnalyticsEngine.getStudentAnalytics(userEmail);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("[AnalyticsEngine] Error fetching summary:", error);
    res.status(500).json({ error: "Failed to load analytics summary" });
  }
});

// Record a client-side test attempt into server analytics materialized view
app.post("/api/analytics/record-attempt", (req: Request, res: Response) => {
  try {
    const { userEmail, attempt } = req.body;
    if (!attempt) {
      return res.status(400).json({ error: "Attempt object is required." });
    }
    const updated = ServerAnalyticsEngine.recordTestAttempt(userEmail || "student@engineeringofficer.in", attempt);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[AnalyticsEngine] Error recording attempt:", error);
    res.status(500).json({ error: "Failed to record attempt in analytics" });
  }
});

// Reset / Invalidate analytics cache
app.post("/api/analytics/invalidate", (req: Request, res: Response) => {
  try {
    const { userEmail } = req.body;
    ServerAnalyticsEngine.invalidateCache(userEmail);
    res.json({ success: true, message: "Analytics cache refreshed successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to invalidate analytics cache" });
  }
});

// ==========================================
// 7-TIER CIVIL SYLLABUS & MAPPING APIs
// Exam → Paper → Subject → Unit → Topic → Subtopic → Concept
// ==========================================

// Get full 7-tier syllabus hierarchy
app.get("/api/syllabus/hierarchy", (_req: Request, res: Response) => {
  const hierarchy = ServerSyllabusEngine.getFullHierarchy();
  res.json(hierarchy);
});

// Get mapped syllabus for a specific target exam & its papers
app.get("/api/syllabus/exam/:examId", (req: Request, res: Response) => {
  const { examId } = req.params;
  const examSyllabus = ServerSyllabusEngine.getExamSyllabus(examId);
  res.json(examSyllabus);
});

// Get specific deep concept with IS code clause, formulas & traps
app.get("/api/syllabus/concept/:conceptId", (req: Request, res: Response) => {
  const concept = ServerSyllabusEngine.getConcept(req.params.conceptId);
  if (!concept) {
    return res.status(404).json({ error: "Civil Engineering Concept not found." });
  }
  res.json({ concept });
});

// Admin: Upsert Concept (Versioned & Audited)
app.post("/api/syllabus/concept", (req: Request, res: Response) => {
  const { concept, actorEmail } = req.body;
  if (!concept) {
    return res.status(400).json({ error: "Concept payload is required." });
  }
  const saved = ServerSyllabusEngine.upsertConcept(concept, actorEmail);
  res.json({ success: true, concept: saved });
});

// Admin: Update Exam-Specific Mapping
app.post("/api/syllabus/mapping", (req: Request, res: Response) => {
  const { mapping, actorEmail } = req.body;
  if (!mapping) {
    return res.status(400).json({ error: "Mapping payload is required." });
  }
  const updated = ServerSyllabusEngine.updateExamMapping(mapping, actorEmail);
  res.json({ success: true, mapping: updated });
});

// Admin: Publish new version of Syllabus with changelog
app.post("/api/syllabus/version/publish", (req: Request, res: Response) => {
  const { newVersion, releaseNotes, actorEmail } = req.body;
  if (!newVersion) {
    return res.status(400).json({ error: "New version string is required." });
  }
  const result = ServerSyllabusEngine.publishVersion(newVersion, releaseNotes || "Routine syllabus revision", actorEmail);
  res.json({ success: true, ...result });
});

// Admin: View Full Auditable Log History
app.get("/api/syllabus/audit-trail", (_req: Request, res: Response) => {
  const logs = ServerSyllabusEngine.getAuditLogs();
  res.json({ auditLogs: logs });
});

// ==========================================
// EXAM ECOSYSTEM & MULTI-TARGET EXAM ENGINE APIs
// ==========================================

// Get all configurable exam profiles with optional filters
app.get("/api/exam-engine/profiles", (req: Request, res: Response) => {
  const { level, status, search, includeArchived } = req.query;
  const profiles = ServerExamEngine.getProfiles({
    level: level as string,
    status: status as string,
    search: search as string,
    includeArchived: includeArchived === 'true'
  });
  res.json({ profiles, count: profiles.length });
});

// Get single exam profile by ID with papers, syllabus mappings & eligibility
app.get("/api/exam-engine/profiles/:id", (req: Request, res: Response) => {
  const profile = ServerExamEngine.getProfileById(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: "Exam profile not found." });
  }
  res.json({ profile });
});

// Admin: Create new exam profile
app.post("/api/exam-engine/profiles", (req: Request, res: Response) => {
  const { profile, actorEmail } = req.body;
  if (!profile || !profile.name || !profile.shortName) {
    return res.status(400).json({ error: "Profile name and shortName are required." });
  }
  const created = ServerExamEngine.createProfile(profile, actorEmail);
  res.status(201).json({ success: true, profile: created });
});

// Admin: Update existing exam profile
app.put("/api/exam-engine/profiles/:id", (req: Request, res: Response) => {
  const { updates, actorEmail } = req.body;
  const updated = ServerExamEngine.updateProfile(req.params.id, updates || {}, actorEmail);
  if (!updated) {
    return res.status(404).json({ error: "Exam profile not found to update." });
  }
  res.json({ success: true, profile: updated });
});

// Admin: Clone an existing exam profile (e.g. for new Municipal Corp or District ZP)
app.post("/api/exam-engine/profiles/:id/clone", (req: Request, res: Response) => {
  const { newId, newName, actorEmail } = req.body;
  if (!newId || !newName) {
    return res.status(400).json({ error: "newId and newName are required to clone profile." });
  }
  const cloned = ServerExamEngine.cloneProfile(req.params.id, newId, newName, actorEmail);
  if (!cloned) {
    return res.status(404).json({ error: "Source exam profile not found." });
  }
  res.status(201).json({ success: true, profile: cloned });
});

// Admin: Archive exam profile
app.patch("/api/exam-engine/profiles/:id/archive", (req: Request, res: Response) => {
  const { actorEmail } = req.body;
  const success = ServerExamEngine.archiveProfile(req.params.id, actorEmail);
  if (!success) {
    return res.status(404).json({ error: "Exam profile not found." });
  }
  res.json({ success: true, message: "Exam profile archived successfully." });
});

// Admin: Restore exam profile from archive
app.patch("/api/exam-engine/profiles/:id/restore", (req: Request, res: Response) => {
  const { actorEmail } = req.body;
  const success = ServerExamEngine.restoreProfile(req.params.id, actorEmail);
  if (!success) {
    return res.status(404).json({ error: "Exam profile not found." });
  }
  res.json({ success: true, message: "Exam profile restored successfully." });
});

// Admin: Delete custom exam profile
app.delete("/api/exam-engine/profiles/:id", (req: Request, res: Response) => {
  const success = ServerExamEngine.deleteProfile(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Exam profile not found or could not be deleted." });
  }
  res.json({ success: true, message: "Exam profile deleted." });
});

// Candidate & Student: Intelligent Multi-Target Preparation Analysis
// Merges common preparation intelligently while keeping exam-specific requirements separate
app.post("/api/exam-engine/multi-target-analysis", (req: Request, res: Response) => {
  const { examIds, candidateQualification } = req.body;
  if (!Array.isArray(examIds) || examIds.length === 0) {
    return res.status(400).json({ error: "examIds array must contain at least one exam identifier." });
  }
  const analysis = ServerExamEngine.analyzeMultiTargetPreparation(examIds, candidateQualification);
  res.json(analysis);
});

// Gemini AI Study Coach Endpoint
app.post("/api/gemini/coach", async (req: Request, res: Response) => {
  try {
    const { message, targetExam, subject, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "Er. SP Study Coach", the premier Civil Engineering mentor & AI guide on the "Engineering Officer BY SP" platform.
You specialize in preparing Diploma Civil and B.E./B.Tech Civil engineers for:
- UPSC ESE / IES Civil
- SSC Junior Engineer (SSC JE) Civil
- Maharashtra PWD JE & Civil Engineering Assistant (CEA)
- MPSC Civil Engineering Services (MES AE/JE)
- WRD (Jalsampada) Civil, Zilla Parishad (ZP) Civil JE
- BMC / Municipal Corporation Civil JE / Sub Engineer
- MJP, MHADA, CIDCO, RRB JE and other State/PSU Civil recruitments.

Your traits:
1. Explain technical concepts with rigorous engineering accuracy, standard IS codes (e.g., IS 456:2000, IS 800:2007, IS 1893:2016, IS 10500:2012, IRC 73/37, NBC 2016).
2. For numerical questions, always provide: Given Data, Applicable Formula, Step-by-Step Substitution, Final Answer with precise Units, and Common Traps/Mistakes students make in CBT exams.
3. Keep the tone inspiring, precise, professional, and clear.
4. If asked about exam strategies, provide time management tips, topic weightage, and revision cycles for ${targetExam || "Civil Engineering competitive exams"}.
5. Use clean markdown formatting with headers, bullet points, and code blocks for formulas when appropriate.`;

    const prompt = `Target Exam: ${targetExam || "Civil Engineering AE/JE Exams"}
Subject Context: ${subject || "General Civil Engineering"}
User Query: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const reply = response.text || "I was unable to generate an explanation at this moment. Please rephrase your civil engineering query.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Coach Error:", error);
    res.status(500).json({
      error: "AI Coach service encountered an error.",
      details: error.message,
    });
  }
});

// ==========================================
// CIVIL MCQ PRACTICE ENGINE ENDPOINTS
// ==========================================

// Paginated, Filtered & Cached Practice Questions
app.get("/api/practice/questions", (req: Request, res: Response) => {
  try {
    const {
      mode,
      subjectId,
      topic,
      examTargetId,
      difficulty,
      language,
      page,
      pageSize,
      simulationMode
    } = req.query;

    const result = ServerPracticeEngine.getQuestions({
      mode: mode as any,
      subjectId: subjectId as string,
      topic: topic as string,
      examTargetId: examTargetId as string,
      difficulty: difficulty as string,
      language: language as string,
      page: page ? parseInt(page as string, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : 15,
      simulationMode: simulationMode === 'true' || simulationMode === '1',
    });

    res.json(result);
  } catch (error: any) {
    console.error("[PracticeEngine] Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch practice questions", details: error.message });
  }
});

// Start an Authenticated Practice Session (Server-Controlled)
app.post("/api/practice/session/start", (req: Request, res: Response) => {
  try {
    const config = req.body;
    const session = ServerPracticeEngine.startSession(config);
    res.json(session);
  } catch (error: any) {
    console.error("[PracticeEngine] Error starting practice session:", error);
    res.status(500).json({ error: "Failed to initialize practice session" });
  }
});

// Instant Verification for Single Answer (Server-Controlled Key)
app.post("/api/practice/verify-single", (req: Request, res: Response) => {
  try {
    const { questionId, userAnswer, language } = req.body;
    if (!questionId) {
      return res.status(400).json({ error: "questionId is required" });
    }

    const evaluation = ServerPracticeEngine.verifySingleAnswer({
      questionId,
      userAnswer,
      language,
    });

    if (!evaluation) {
      return res.status(404).json({ error: "Question not found in master bank" });
    }

    res.json(evaluation);
  } catch (error: any) {
    console.error("[PracticeEngine] Error verifying single answer:", error);
    res.status(500).json({ error: "Failed to verify answer" });
  }
});

// Authoritative Session Submission (Exam Simulation & Batch Practice)
app.post("/api/practice/session/submit", (req: Request, res: Response) => {
  try {
    const { sessionId, answers, timeSpentSeconds, targetExamId } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: "answers payload must be an object map of questionId -> answer" });
    }

    const evaluation = ServerPracticeEngine.submitSession({
      sessionId,
      answers,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      targetExamId,
    });

    res.json(evaluation);
  } catch (error: any) {
    console.error("[PracticeEngine] Error submitting practice session:", error);
    res.status(500).json({ error: "Failed to submit session evaluation" });
  }
});

// Practice Engine Stats & Codal Coverage
app.get("/api/practice/stats", (_req: Request, res: Response) => {
  try {
    const stats = ServerPracticeEngine.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load practice stats" });
  }
});

// Fetch Single Question details
app.get("/api/practice/question/:id", (req: Request, res: Response) => {
  try {
    const q = ServerPracticeEngine.getQuestionById(req.params.id);
    if (!q) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json(q);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get question" });
  }
});

// ==========================================
// PART 10 — PYQ LIBRARY & PROVENANCE APIs
// ==========================================

// Get filtered & paginated PYQs with status counts
app.get("/api/pyqs", (req: Request, res: Response) => {
  try {
    const {
      query,
      examTargetId,
      year,
      subjectId,
      topic,
      difficulty,
      status,
      page,
      pageSize,
      sanitizeKeys,
    } = req.query;

    const result = ServerPyqEngine.getPYQs({
      query: typeof query === "string" ? query : undefined,
      examTargetId: typeof examTargetId === "string" ? examTargetId : undefined,
      year: typeof year === "string" ? year : undefined,
      subjectId: typeof subjectId === "string" ? subjectId : undefined,
      topic: typeof topic === "string" ? topic : undefined,
      difficulty: typeof difficulty === "string" ? difficulty : undefined,
      status: typeof status === "string" ? status : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sanitizeKeys: sanitizeKeys === "true",
    });

    res.json(result);
  } catch (error: any) {
    console.error("[PyqEngine] Error fetching PYQs:", error);
    res.status(500).json({ error: "Failed to fetch PYQs", details: error.message });
  }
});

// Deep PYQ Analytics (Trends, Subject Weightage, Top Concepts, Verification Status)
app.get("/api/pyqs/analytics", (req: Request, res: Response) => {
  try {
    const { examTargetId, year } = req.query;
    const analytics = ServerPyqEngine.getAnalytics({
      examTargetId: typeof examTargetId === "string" ? examTargetId : undefined,
      year: year ? Number(year) : undefined,
    });
    res.json(analytics);
  } catch (error: any) {
    console.error("[PyqEngine] Error getting analytics:", error);
    res.status(500).json({ error: "Failed to load PYQ analytics" });
  }
});

// Hierarchical Topic Mapping per Exam & Year
app.get("/api/pyqs/topic-mapping", (req: Request, res: Response) => {
  try {
    const { examTargetId, year } = req.query;
    const mapping = ServerPyqEngine.getTopicMapping({
      examTargetId: typeof examTargetId === "string" ? examTargetId : undefined,
      year: year ? Number(year) : undefined,
    });
    res.json(mapping);
  } catch (error: any) {
    console.error("[PyqEngine] Error getting topic mapping:", error);
    res.status(500).json({ error: "Failed to load topic mapping" });
  }
});

// Get Single PYQ with Full Provenance & Version History
app.get("/api/pyqs/:id", (req: Request, res: Response) => {
  try {
    const pyq = ServerPyqEngine.getPYQById(req.params.id);
    if (!pyq) {
      return res.status(404).json({ error: "PYQ not found in database" });
    }
    res.json(pyq);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch PYQ details" });
  }
});

// Import Staged Questions (Defaults to unverified, pending admin approval)
app.post("/api/pyqs/import", (req: Request, res: Response) => {
  try {
    const { items, actorEmail } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items array is required to import questions" });
    }
    const result = ServerPyqEngine.importQuestions(items, actorEmail);
    res.status(201).json({
      success: true,
      message: `Successfully staged ${result.importedCount} questions for admin provenance review.`,
      ...result,
    });
  } catch (error: any) {
    console.error("[PyqEngine] Import error:", error);
    res.status(500).json({ error: "Failed to import questions" });
  }
});

// Admin: Approve & Promote to Official Verified PYQ
app.post("/api/pyqs/:id/approve", (req: Request, res: Response) => {
  try {
    const { approvalData, actorEmail } = req.body;
    if (!approvalData || !approvalData.verifiedBy) {
      return res.status(400).json({ error: "approvalData with verifiedBy is required to approve PYQ" });
    }
    const updated = ServerPyqEngine.approveQuestion(req.params.id, approvalData, actorEmail);
    if (!updated) {
      return res.status(404).json({ error: "PYQ not found to approve" });
    }
    res.json({
      success: true,
      message: "Question successfully audited and promoted to Official Verified PYQ.",
      pyq: updated,
    });
  } catch (error: any) {
    console.error("[PyqEngine] Approval error:", error);
    res.status(500).json({ error: "Failed to approve PYQ" });
  }
});

// Admin: Reject PYQ
app.post("/api/pyqs/:id/reject", (req: Request, res: Response) => {
  try {
    const { reason, actorEmail } = req.body;
    const updated = ServerPyqEngine.rejectQuestion(req.params.id, reason || "Does not meet provenance standards", actorEmail);
    if (!updated) {
      return res.status(404).json({ error: "PYQ not found to reject" });
    }
    res.json({ success: true, message: "Question marked as rejected.", pyq: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reject PYQ" });
  }
});

// Admin: Update PYQ Content & Bump Version
app.put("/api/pyqs/:id", (req: Request, res: Response) => {
  try {
    const { updates, changeSummary, actorEmail } = req.body;
    const updated = ServerPyqEngine.updateQuestion(req.params.id, updates || {}, changeSummary, actorEmail);
    if (!updated) {
      return res.status(404).json({ error: "PYQ not found to update" });
    }
    res.json({ success: true, message: "PYQ updated with version bump.", pyq: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update PYQ" });
  }
});

// Admin: Rollback PYQ to previous version
app.post("/api/pyqs/:id/rollback", (req: Request, res: Response) => {
  try {
    const { targetVersion, actorEmail } = req.body;
    if (!targetVersion) {
      return res.status(400).json({ error: "targetVersion is required for rollback" });
    }
    const rolledBack = ServerPyqEngine.rollbackVersion(req.params.id, targetVersion, actorEmail);
    if (!rolledBack) {
      return res.status(400).json({ error: "Could not rollback to target version. Version or previous state not found." });
    }
    res.json({ success: true, message: `Rolled back to version ${targetVersion}`, pyq: rolledBack });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to rollback version" });
  }
});

// ==========================================
// PART 13 — SMART MISTAKE NOTEBOOK ENDPOINTS
// ==========================================

// Get all smart mistakes for user
app.get("/api/mistakes", (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || "student@engineeringofficer.in";
    const list = ServerMistakeEngine.getMistakes(userEmail);
    res.json({ success: true, count: list.length, mistakes: list });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch mistake notebook records" });
  }
});

// Log or update a smart mistake (handles wrong answers, bookmarks, low-confidence, skips)
app.post("/api/mistakes/log", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "student@engineeringofficer.in";
    const record = ServerMistakeEngine.logOrUpdateMistake(userEmail, req.body);
    res.json({ success: true, message: "Mistake logged or updated in revision queue.", record });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to log mistake" });
  }
});

// Update personal note on a mistake
app.put("/api/mistakes/:id/note", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "student@engineeringofficer.in";
    const { note } = req.body;
    const updated = ServerMistakeEngine.updatePersonalNote(userEmail, req.params.id, note || "");
    if (!updated) return res.status(404).json({ error: "Mistake not found" });
    res.json({ success: true, record: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update personal note" });
  }
});

// Update error category classification on a mistake
app.put("/api/mistakes/:id/category", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "student@engineeringofficer.in";
    const { category } = req.body;
    const updated = ServerMistakeEngine.updateErrorCategory(userEmail, req.params.id, category);
    if (!updated) return res.status(404).json({ error: "Mistake not found" });
    res.json({ success: true, record: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update mistake category" });
  }
});

// Toggle mastery status (Resolved / Unresolved)
app.post("/api/mistakes/:id/toggle-mastery", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "student@engineeringofficer.in";
    const updated = ServerMistakeEngine.toggleMasteryStatus(userEmail, req.params.id);
    if (!updated) return res.status(404).json({ error: "Mistake not found" });
    res.json({ success: true, record: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle mastery status" });
  }
});

// Delete mistake from notebook
app.delete("/api/mistakes/:id", (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || "student@engineeringofficer.in";
    const deleted = ServerMistakeEngine.deleteMistake(userEmail, req.params.id);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete mistake" });
  }
});

// Get error category definitions (for student tagging and admin configuration)
app.get("/api/mistakes/categories", (_req: Request, res: Response) => {
  try {
    const categories = ServerMistakeEngine.getErrorCategories();
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch error categories" });
  }
});

// Admin: Add new custom error category
app.post("/api/admin/mistakes/categories", (req: Request, res: Response) => {
  try {
    const newCat = ServerMistakeEngine.addErrorCategory(req.body);
    res.json({ success: true, category: newCat });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add error category" });
  }
});

// ==========================================
// PART 14 — SPACED REVISION ENGINE ENDPOINTS
// ==========================================

// Get spaced revision queues: Due Today, Overdue, Upcoming, Mastered
app.get("/api/revision/queues", (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || "student@engineeringofficer.in";
    const queues = ServerRevisionEngine.getSpacedQueues(userEmail);
    res.json({ success: true, ...queues });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch spaced revision queues" });
  }
});

// Submit a single spaced revision attempt
app.post("/api/revision/attempt", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "student@engineeringofficer.in";
    const result = ServerRevisionEngine.recordRevisionAttempt(userEmail, req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to record revision attempt" });
  }
});

// Submit bulk revision session results
app.post("/api/revision/bulk-retest", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "student@engineeringofficer.in";
    const { results } = req.body;
    const summary = ServerRevisionEngine.performBulkRetest(userEmail, results || []);
    res.json({ success: true, ...summary });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process bulk revision session" });
  }
});

// Reschedule missed / overdue revision queue items
app.post("/api/revision/reschedule-overdue", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "student@engineeringofficer.in";
    const resSummary = ServerRevisionEngine.rescheduleOverdueQueue(userEmail);
    res.json({ success: true, message: `Rescheduled ${resSummary.rescheduledCount} overdue tasks for today.`, ...resSummary });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reschedule overdue items" });
  }
});

// Admin: Get or update spaced algorithm parameters
app.get("/api/admin/revision/settings", (_req: Request, res: Response) => {
  try {
    const settings = ServerRevisionEngine.getAlgorithmSettings();
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get algorithm settings" });
  }
});

app.put("/api/admin/revision/settings", (req: Request, res: Response) => {
  try {
    const updated = ServerRevisionEngine.updateAlgorithmSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update algorithm settings" });
  }
});

// ==========================================
// PART 15 — CIVIL FORMULA LAB ENDPOINTS
// ==========================================

// Get all verified civil formulas with search & filters
app.get("/api/formulas", (req: Request, res: Response) => {
  try {
    const { query, subjectId, topicId, userEmail } = req.query;
    const formulas = ServerFormulaEngine.searchFormulas(
      (query as string) || "",
      (subjectId as string) || "all",
      (topicId as string) || "all",
      (userEmail as string) || undefined
    );
    res.json({ success: true, count: formulas.length, formulas });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch formula lab database" });
  }
});

// Get Formula of the Day
app.get("/api/formulas/formula-of-the-day", (_req: Request, res: Response) => {
  try {
    const fotd = ServerFormulaEngine.getFormulaOfTheDay();
    res.json({ success: true, ...fotd });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch Formula of the Day" });
  }
});

// Get specific formula details
app.get("/api/formulas/:id", (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || undefined;
    const formula = ServerFormulaEngine.getFormulaById(req.params.id, userEmail);
    if (!formula) return res.status(404).json({ error: "Formula not found" });
    res.json({ success: true, formula });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch formula" });
  }
});

// Toggle Favorite Formula
app.post("/api/formulas/:id/favorite", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "student@engineeringofficer.in";
    const isFav = ServerFormulaEngine.toggleFavorite(userEmail, req.params.id);
    res.json({ success: true, formulaId: req.params.id, isFavorite: isFav });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

// Admin: Add or update formula
app.post("/api/admin/formulas", (req: Request, res: Response) => {
  try {
    const author = req.body.author || "Admin";
    const created = ServerFormulaEngine.addFormula(req.body.formula, author);
    res.json({ success: true, formula: created });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add formula" });
  }
});

app.put("/api/admin/formulas/:id", (req: Request, res: Response) => {
  try {
    const { updates, changelog, author } = req.body;
    const updated = ServerFormulaEngine.updateFormula(req.params.id, updates || {}, changelog, author || "Admin");
    if (!updated) return res.status(404).json({ error: "Formula not found" });
    res.json({ success: true, formula: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update formula" });
  }
});

// ==========================================
// PART 16 — ENGINEERING CALCULATOR SUITE ENDPOINTS
// ==========================================

// Get all 12 Civil Calculators metadata & specs
app.get("/api/calculators", (_req: Request, res: Response) => {
  try {
    const calcs = ServerCalculatorEngine.getAllCalculators();
    res.json({ success: true, count: calcs.length, calculators: calcs });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch calculator suite" });
  }
});

// Execute calculation with live input validation and step-by-step math proof
app.post("/api/calculators/:id/execute", (req: Request, res: Response) => {
  try {
    const result = ServerCalculatorEngine.executeCalculator(req.params.id, req.body.inputs || {});
    res.json({ success: true, calculatorId: req.params.id, result });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to execute calculator" });
  }
});

// Run automated numerical test suite across all 12 calculators
app.get("/api/calculators/run-tests", (_req: Request, res: Response) => {
  try {
    const testSuiteResult = ServerCalculatorEngine.runNumericalTestSuite();
    res.json({ success: true, ...testSuiteResult });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to run numerical test suite" });
  }
});

// Push & System Notifications API
const activePushSubscriptions: Array<{ endpoint: string; userEmail?: string; subscribedAt: string }> = [];
const systemNotificationsHistory: Array<{
  id: string;
  title: string;
  body: string;
  icon: string;
  timestamp: string;
  category: string;
}> = [
  {
    id: "notif-1",
    title: "MPSC Civil Engineering 2026",
    body: "450 जागांची अधिकृत जाहिरात प्रसिद्ध! त्वरित सिलॅबस व पात्रता तपासा.",
    icon: "/icon.svg",
    timestamp: new Date().toISOString(),
    category: "recruitment"
  },
  {
    id: "notif-2",
    title: "CBT Mock Test #03 is LIVE!",
    body: "All Maharashtra Civil Engineering Rank Test सुरू झाला आहे. 100 प्रश्न · 120 मिनिटे.",
    icon: "/icon.svg",
    timestamp: new Date().toISOString(),
    category: "mock_test"
  }
];

app.post("/api/notifications/subscribe", async (req: Request, res: Response) => {
  const { endpoint, userEmail } = req.body;
  if (endpoint) {
    activePushSubscriptions.push({
      endpoint,
      userEmail: userEmail || "student@engineeringofficer.in",
      subscribedAt: new Date().toISOString()
    });
    // Sync with Supabase push_subscriptions table
    await ServerSupabaseEngine.savePushSubscription({
      endpoint,
      userEmail: userEmail || "student@engineeringofficer.in",
      subscribedAt: new Date().toISOString()
    }).catch((err) => console.warn('[Supabase Sync Warning]', err));
  }
  res.json({ success: true, count: activePushSubscriptions.length });
});

app.post("/api/notifications/broadcast", async (req: Request, res: Response) => {
  const { title, body, icon, category } = req.body;
  const newNotif = {
    id: `notif-${Date.now()}`,
    title: title || "Engineering Officer Update",
    body: body || "नवीन परीक्षा अपडेट उपलब्ध!",
    icon: icon || "/icon.svg",
    timestamp: new Date().toISOString(),
    category: category || "general"
  };
  systemNotificationsHistory.unshift(newNotif);

  // Sync notification broadcast into Supabase notifications table
  await ServerSupabaseEngine.recordNotification(newNotif).catch((err) =>
    console.warn('[Supabase Sync Warning]', err)
  );

  res.json({ success: true, notification: newNotif, recipientCount: Math.max(1, activePushSubscriptions.length) });
});

app.get("/api/notifications/feed", (_req: Request, res: Response) => {
  res.json({ notifications: systemNotificationsHistory });
});

// Gemini Question Explainer with IS Code & Formulas
app.post("/api/gemini/explain-question", async (req: Request, res: Response) => {
  try {
    const { questionText, options, correctOption, subjectName, isCodeReference } = req.body;

    const ai = getGeminiClient();

    const prompt = `Analyze this Civil Engineering competitive examination MCQ:
Subject: ${subjectName || "Civil Engineering"}
Question: ${questionText}
Options:
A: ${options?.[0]}
B: ${options?.[1]}
C: ${options?.[2]}
D: ${options?.[3]}
Correct Option Index: ${correctOption} (Option ${String.fromCharCode(65 + Number(correctOption))}: ${options?.[correctOption]})
Known IS Code Reference: ${isCodeReference || "Identify relevant IS/IRC Code clause"}

Please provide a structured Civil Engineering breakdown:
1. Core Engineering Concept
2. Exact IS / IRC / NBC Code Clause with standard values/tables (if applicable)
3. Step-by-Step Calculation or Logical Proof
4. Why other options are incorrect
5. High-Yield Exam Memory Tip / Shortcut for AE/JE Exams.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Civil Engineering professor & competitive exam question maker for UPSC ESE, SSC JE, MPSC Civil, and State PWD/WRD exams.",
        temperature: 0.3,
      },
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Gemini Explain Error:", error);
    res.status(500).json({
      error: "Failed to generate AI deep explanation.",
      details: error.message,
    });
  }
});

// Gemini Weakness & Performance Diagnostic
app.post("/api/gemini/diagnostic", async (req: Request, res: Response) => {
  try {
    const { accuracyRate, targetExams, weakSubjects, totalSolved, testsTaken } = req.body;

    const ai = getGeminiClient();

    const prompt = `Student Performance Profile for Civil Engineering Aspirant:
- Accuracy Rate: ${accuracyRate}%
- Total Questions Solved: ${totalSolved}
- Mock Tests Taken: ${testsTaken}
- Target Exams: ${JSON.stringify(targetExams)}
- Weak / Struggling Subjects: ${JSON.stringify(weakSubjects)}

Provide a personalized 4-week high-impact recovery plan:
1. Subject-wise priority roadmap (Which subjects to tackle first based on exam weightage)
2. Daily study allocation (Hours for Theory, IS Code revision, Numerical practice, and CBT Mocks)
3. Specific IS codes to master (e.g. IS 456, IS 800, IRC standards)
4. Recommended mock test frequency and mistake notebook review strategy.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are Er. SP, Chief Mentor at Engineering Officer BY SP. Provide sharp, actionable, encouraging study plans for civil engineering students.",
        temperature: 0.4,
      },
    });

    res.json({ plan: response.text });
  } catch (error: any) {
    console.error("Gemini Diagnostic Error:", error);
    res.status(500).json({ error: "Failed to generate diagnostic plan." });
  }
});

// ==========================================
// PART 17 & 18 — AI CIVIL TUTOR & CACHE APIS
// ==========================================

app.post("/api/ai-tutor/ask", async (req: Request, res: Response) => {
  try {
    const tutorResponse = await ServerAITutorEngine.askTutor(req.body, getGeminiClient);
    res.json(tutorResponse);
  } catch (error: any) {
    console.error("[AITutor] Gateway Error:", error);
    res.status(500).json({ error: "AI Tutor gateway error", details: error.message });
  }
});

app.get("/api/ai-tutor/cache-stats", (_req: Request, res: Response) => {
  try {
    const stats = ServerAITutorEngine.getStats();
    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch cache stats" });
  }
});

app.post("/api/ai-tutor/invalidate-cache", (req: Request, res: Response) => {
  try {
    const { pattern } = req.body;
    const invalidatedCount = ServerAITutorEngine.invalidateCache(pattern);
    res.json({ success: true, invalidatedCount });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to invalidate cache" });
  }
});

app.get("/api/ai-tutor/pregenerated-library", (_req: Request, res: Response) => {
  try {
    const library = ServerAITutorEngine.getPregeneratedLibrary();
    res.json({ library });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch pregenerated library" });
  }
});

// ==========================================
// PART 20 — SITE ENGINEER PRACTICAL APIS
// ==========================================

app.get("/api/site-practical/lessons", (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const lessons = ServerSitePracticalEngine.getLessons(category as any);
    res.json({ lessons });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch practical site lessons" });
  }
});

app.get("/api/site-practical/lessons/:id", (req: Request, res: Response) => {
  try {
    const lesson = ServerSitePracticalEngine.getLesson(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Site practical lesson not found" });
    }
    res.json({ lesson });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch lesson detail" });
  }
});

// ==========================================
// PART 21 — VISUAL DIAGRAMS APIS
// ==========================================

app.get("/api/diagrams", (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const diagrams = ServerDiagramEngine.getDiagrams(category as any);
    res.json({ diagrams });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch diagrams" });
  }
});

app.get("/api/diagrams/:id", (req: Request, res: Response) => {
  try {
    const diagram = ServerDiagramEngine.getDiagram(req.params.id);
    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }
    res.json({ diagram });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch diagram detail" });
  }
});

// ==========================================
// PART 22 — DAILY CAPSULE & NOTIFICATIONS APIS
// ==========================================

app.get("/api/capsule/today", (_req: Request, res: Response) => {
  try {
    const capsule = ServerCapsuleEngine.getTodayCapsule();
    res.json({ capsule });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch daily capsule" });
  }
});

app.get("/api/notifications", (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || "aspirant@student.com";
    const notifications = ServerCapsuleEngine.getNotifications(userEmail);
    res.json({ notifications });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications/:id/read", (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || "aspirant@student.com";
    const updated = ServerCapsuleEngine.markNotificationRead(userEmail, req.params.id);
    res.json({ success: true, notifications: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// ==========================================
// PART 23 — RECRUITMENT APIS
// ==========================================

app.get("/api/recruitment/notices", (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const notices = ServerRecruitmentEngine.getNotices(category as string);
    res.json({ notices });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch recruitment notices" });
  }
});

app.get("/api/recruitment/notices/:id", (req: Request, res: Response) => {
  try {
    const notice = ServerRecruitmentEngine.getNoticeById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }
    res.json({ notice });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch notice detail" });
  }
});

// ==========================================
// PART 24 — GAMIFICATION APIS
// ==========================================

app.get("/api/gamification/leaderboard", (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || "";
    const userName = (req.query.userName as string) || "Current Aspirant";
    const leaderboard = ServerGamificationEngine.getLeaderboard(userEmail, userName);
    res.json({ leaderboard });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.get("/api/gamification/badges", (_req: Request, res: Response) => {
  try {
    const badges = ServerGamificationEngine.getBadges();
    res.json({ badges });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

// ==========================================
// MONETIZATION, PLANS, ENTITLEMENTS & RAZORPAY PAYMENT SYSTEM
// ==========================================

// Public Plans List
app.get("/api/payments/plans", (_req: Request, res: Response) => {
  try {
    const plans = ServerPaymentEngine.getPlans();
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// Single Plan Details
app.get("/api/payments/plans/:planId", (req: Request, res: Response) => {
  try {
    const plan = ServerPaymentEngine.getPlanById(req.params.planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json({ plan });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});

// Coupon Validation (Server-Side)
app.post("/api/payments/validate-coupon", (req: Request, res: Response) => {
  try {
    const { code, planId, userEmail } = req.body;
    const result = ServerPaymentEngine.validateCoupon(code, planId, userEmail || "student@example.com");
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to validate coupon" });
  }
});

// Create Order (Server-Side Razorpay order creation & canonical pricing)
app.post("/api/payments/create-order", async (req: Request, res: Response) => {
  try {
    const { planId, userEmail, userId, couponCode } = req.body;
    if (!planId) return res.status(400).json({ error: "Plan ID is required" });

    const order = await ServerPaymentEngine.createOrder({
      userId: userId || userEmail || "anonymous_user",
      userEmail: userEmail || "student@sp-engineering.gov.in",
      planId,
      couponCode,
    });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create payment order" });
  }
});

// Verify Payment Signature (HMAC-SHA256 Server-Side Verification)
app.post("/api/payments/verify-signature", (req: Request, res: Response) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      userEmail,
      planId,
    } = req.body;

    const result = ServerPaymentEngine.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId: userId || userEmail || "user",
      userEmail: userEmail || "student@sp-engineering.gov.in",
      planId,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Payment signature verification failed" });
  }
});

// Legacy verify route alias
app.post("/api/payments/verify", (req: Request, res: Response) => {
  try {
    const result = ServerPaymentEngine.verifyPaymentSignature({
      razorpayOrderId: req.body.orderId || req.body.razorpayOrderId || "order_mock",
      razorpayPaymentId: req.body.paymentId || req.body.razorpayPaymentId || "pay_mock",
      razorpaySignature: req.body.signature || req.body.razorpaySignature || "test_verified_signature",
      userId: req.body.userEmail || "student@student.com",
      userEmail: req.body.userEmail || "student@student.com",
      planId: req.body.planId || "plan_mcq_master",
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Payment verification failed" });
  }
});

// User Entitlements
app.get("/api/payments/entitlements/:userId", (req: Request, res: Response) => {
  try {
    const entitlements = ServerPaymentEngine.getUserEntitlements(req.params.userId);
    res.json({ entitlements });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch user entitlements" });
  }
});

// Check Product Access
app.post("/api/payments/check-access", (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body;
    const access = ServerPaymentEngine.hasProductAccess(userId, productId);
    res.json(access);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to check product access" });
  }
});

// User Transaction History (Read-only for students)
app.get("/api/payments/user-transactions/:userId", (req: Request, res: Response) => {
  try {
    const transactions = ServerPaymentEngine.getUserTransactions(req.params.userId);
    res.json({ transactions });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Razorpay Webhook (Idempotent with HMAC validation)
app.post("/api/payments/razorpay-webhook", (req: Request, res: Response) => {
  try {
    const signature = (req.headers["x-razorpay-signature"] as string) || "";
    const rawPayload = JSON.stringify(req.body);
    const result = ServerPaymentEngine.handleWebhook(signature, rawPayload, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Webhook processing failed" });
  }
});

// ==========================================
// ADMIN MONETIZATION & PAYMENT MANAGEMENT APIS
// ==========================================

// Admin Payment Dashboard Stats
app.get("/api/admin/payments/dashboard", (_req: Request, res: Response) => {
  try {
    const stats = ServerPaymentEngine.getDashboardStats();
    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load payment dashboard stats" });
  }
});

// Admin All Plans (including inactive)
app.get("/api/admin/payments/plans", (_req: Request, res: Response) => {
  try {
    const plans = ServerPaymentEngine.getPlans(true);
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// Admin Save/Create Plan
app.post("/api/admin/payments/plans", (req: Request, res: Response) => {
  try {
    const plan = ServerPaymentEngine.savePlan(req.body, req.body.adminEmail);
    res.json({ success: true, plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save plan" });
  }
});

// Admin Coupons List
app.get("/api/admin/payments/coupons", (_req: Request, res: Response) => {
  try {
    const coupons = ServerPaymentEngine.getCoupons();
    res.json({ coupons });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// Admin Save Coupon
app.post("/api/admin/payments/coupons", (req: Request, res: Response) => {
  try {
    const coupon = ServerPaymentEngine.saveCoupon(req.body);
    res.json({ success: true, coupon });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save coupon" });
  }
});

// Admin Delete Coupon
app.delete("/api/admin/payments/coupons/:code", (req: Request, res: Response) => {
  try {
    const deleted = ServerPaymentEngine.deleteCoupon(req.params.code);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

// Admin Transactions List
app.get("/api/admin/payments/transactions", (_req: Request, res: Response) => {
  try {
    const transactions = ServerPaymentEngine.getTransactions();
    res.json({ transactions });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Admin Process Refund
app.post("/api/admin/payments/refund", (req: Request, res: Response) => {
  try {
    const refund = ServerPaymentEngine.processRefund(req.body);
    res.json({ success: true, refund });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process refund" });
  }
});

// Admin Manual Entitlement Grant/Revoke
app.post("/api/admin/payments/manual-entitlement", (req: Request, res: Response) => {
  try {
    const entitlements = ServerPaymentEngine.manualEntitlementGrant(req.body);
    res.json({ success: true, entitlements });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update manual entitlement" });
  }
});

// Admin Payment Audit Logs
app.get("/api/admin/payments/audit-logs", (_req: Request, res: Response) => {
  try {
    const logs = ServerPaymentEngine.getAuditLogs();
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch payment audit logs" });
  }
});

app.get("/api/referrals/status", (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || "aspirant@student.com";
    const userName = (req.query.userName as string) || "Aspirant";
    const status = ServerPaymentReferralEngine.getReferralStatus(userEmail, userName);
    res.json({ status });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch referral status" });
  }
});

// ==========================================
// PART 29: SUPABASE QUOTA & DB OPTIMIZATION APIs
// ==========================================
app.get("/api/db/metrics", (_req: Request, res: Response) => {
  try {
    const metrics = ServerQuotaOptimizationEngine.getDatabaseMetrics();
    res.json({ metrics });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch database metrics" });
  }
});

app.get("/api/db/rate-limits", (_req: Request, res: Response) => {
  try {
    const limits = ServerQuotaOptimizationEngine.getRateLimits();
    res.json({ limits });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch rate limits" });
  }
});

app.post("/api/db/rate-limits", (req: Request, res: Response) => {
  try {
    const limits = ServerQuotaOptimizationEngine.updateRateLimits(req.body);
    res.json({ limits });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update rate limits" });
  }
});

app.post("/api/tests/autosave", (req: Request, res: Response) => {
  try {
    const result = ServerQuotaOptimizationEngine.bufferTestAutosave(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Autosave failed" });
  }
});

// ==========================================
// PART 30: AI GATEWAY, BUDGET & COST APIs
// ==========================================
app.post("/api/ai/gateway", async (req: Request, res: Response) => {
  try {
    const result = await ServerAIGatewayEngine.executeGatewayQuery(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "AI Gateway processing failed" });
  }
});

app.get("/api/ai/ledger", (_req: Request, res: Response) => {
  try {
    const ledger = ServerAIGatewayEngine.getUsageLedger();
    const budget = ServerAIGatewayEngine.getBudgetConfig();
    res.json({ ledger, budget });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch AI usage ledger" });
  }
});

app.post("/api/ai/budget-config", (req: Request, res: Response) => {
  try {
    const updated = ServerAIGatewayEngine.updateBudgetConfig(req.body);
    res.json({ budget: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update budget config" });
  }
});

// ==========================================
// PART 31: STORAGE, VIDEO & BANDWIDTH APIs
// ==========================================
app.get("/api/storage/objects", (_req: Request, res: Response) => {
  try {
    const objects = ServerMediaStorageEngine.getStorageObjects();
    res.json({ objects });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch storage objects" });
  }
});

app.post("/api/storage/sign-url", (req: Request, res: Response) => {
  try {
    const { objectId, userEmail, userTier } = req.body;
    const result = ServerMediaStorageEngine.generateSignedMediaUrl(objectId, userEmail, userTier);
    if (!result.success) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

app.post("/api/storage/clean-orphans", (_req: Request, res: Response) => {
  try {
    const result = ServerMediaStorageEngine.cleanupOrphans();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to cleanup orphan files" });
  }
});

// ==========================================
// PART 32: ADMIN OPERATIONS & AUDIT LOG APIs
// ==========================================
app.get("/api/admin/audit-logs", (_req: Request, res: Response) => {
  try {
    const logs = ServerAdminOperationsEngine.getAuditLogs();
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

app.get("/api/admin/students", (req: Request, res: Response) => {
  try {
    const { search, tier } = req.query;
    const students = ServerAdminOperationsEngine.getManagedStudents(search as string, tier as string);
    res.json({ students });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.post("/api/admin/students/delete", (req: Request, res: Response) => {
  try {
    const { studentEmail, actorEmail, actorRole, confirmationSecret } = req.body;
    const result = ServerAdminOperationsEngine.deleteStudentSafely(studentEmail, actorEmail, actorRole, confirmationSecret);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

app.post("/api/admin/students/tier", (req: Request, res: Response) => {
  try {
    const { studentEmail, newTier, actorEmail, actorRole } = req.body;
    const result = ServerAdminOperationsEngine.updateStudentTier(studentEmail, newTier, actorEmail, actorRole);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update student tier" });
  }
});

// ==========================================
// PART 33: PRODUCTION AUDIT & LOAD TEST APIs
// ==========================================
app.post("/api/admin/run-load-test", (_req: Request, res: Response) => {
  try {
    const report = ServerLoadTestEngine.runProductionAudit();
    res.json({ report });
  } catch (error: any) {
    res.status(500).json({ error: "Load test execution failed" });
  }
});

// ==========================================
// 20,000+ QUESTION BANK & BULK IMPORT APIs
// ==========================================

// Parse, validate, and detect duplicates for uploaded CSV/XLSX/JSON
app.post("/api/admin/questions/import/parse", (req: Request, res: Response) => {
  try {
    const { rawData, fileName, fileType, adminEmail } = req.body;
    if (!rawData || !Array.isArray(rawData)) {
      return res.status(400).json({ error: "rawData array is required for parsing." });
    }

    const summary = ServerQuestionBankEngine.parseAndValidateUpload(
      rawData,
      fileName || "uploaded_questions",
      fileType || "csv",
      adminEmail || "admin@sp-engineering.gov.in"
    );

    res.json({ success: true, summary });
  } catch (error: any) {
    console.error("[QuestionBank] Parse error:", error);
    res.status(500).json({ error: error.message || "Failed to parse question upload." });
  }
});

// Execute batch import with configurable batch size
app.post("/api/admin/questions/import/execute", async (req: Request, res: Response) => {
  try {
    const { importId, batchSize, adminEmail, overrideVerificationStatus, defaultTags } = req.body;
    if (!importId) {
      return res.status(400).json({ error: "importId is required to execute import." });
    }

    const result = await ServerQuestionBankEngine.executeBatchImport(
      importId,
      batchSize ? Number(batchSize) : 500,
      adminEmail || "admin@sp-engineering.gov.in",
      { overrideVerificationStatus, defaultTags }
    );

    res.json(result);
  } catch (error: any) {
    console.error("[QuestionBank] Import execution error:", error);
    res.status(500).json({ error: error.message || "Import execution failed." });
  }
});

// Get live progress for ongoing or completed import
app.get("/api/admin/questions/import/progress/:importId", (req: Request, res: Response) => {
  try {
    const progress = ServerQuestionBankEngine.getImportProgress(req.params.importId);
    if (!progress) {
      return res.status(404).json({ error: "Import ID not found or expired." });
    }
    res.json({ progress });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch import progress." });
  }
});

// Get import audit history
app.get("/api/admin/questions/import/history", (_req: Request, res: Response) => {
  try {
    const histories = ServerQuestionBankEngine.getImportHistories();
    res.json({ histories });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch import histories." });
  }
});

// Paginated and filtered question query engine with selective columns
app.get("/api/admin/questions", (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      search,
      subjectId,
      topicId,
      examId,
      examYear,
      difficulty,
      language,
      isPyq,
      verificationStatus,
      isArchived,
      questionType,
      selectiveColumns,
    } = req.query;

    const result = ServerQuestionBankEngine.queryQuestions({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      search: search as string,
      subjectId: subjectId as string,
      topicId: topicId as string,
      examId: examId as string,
      examYear: examYear ? Number(examYear) : undefined,
      difficulty: difficulty as string,
      language: language as string,
      isPyq: isPyq !== undefined ? isPyq === "true" : undefined,
      verificationStatus: verificationStatus as string,
      isArchived: isArchived !== undefined ? isArchived === "true" : undefined,
      questionType: questionType as string,
      selectiveColumns: selectiveColumns === "true",
    });

    res.json(result);
  } catch (error: any) {
    console.error("[QuestionBank] Query error:", error);
    res.status(500).json({ error: "Failed to query questions from repository." });
  }
});

// Single question detail with version history
app.get("/api/admin/questions/:id", (req: Request, res: Response) => {
  try {
    const { question, versions } = ServerQuestionBankEngine.getQuestionById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }
    res.json({ question, versions });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve question." });
  }
});

// Add single question
app.post("/api/admin/questions", (req: Request, res: Response) => {
  try {
    const { question, adminEmail } = req.body;
    const newRecord = ServerQuestionBankEngine.addQuestion(question, adminEmail);
    res.json({ success: true, question: newRecord });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create question." });
  }
});

// Update question with versioning
app.put("/api/admin/questions/:id", (req: Request, res: Response) => {
  try {
    const { updates, adminEmail, changeReason } = req.body;
    const updated = ServerQuestionBankEngine.updateQuestion(req.params.id, updates, adminEmail, changeReason);
    res.json({ success: true, question: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update question." });
  }
});

// Archive/Restore question
app.post("/api/admin/questions/:id/archive", (req: Request, res: Response) => {
  try {
    const { archive } = req.body;
    const count = ServerQuestionBankEngine.bulkArchive([req.params.id], archive !== false);
    res.json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update archive status." });
  }
});

// Verify PYQ Question
app.post("/api/admin/questions/:id/verify", (req: Request, res: Response) => {
  try {
    const { status, reviewerEmail } = req.body;
    const updated = ServerQuestionBankEngine.updateQuestion(
      req.params.id,
      { verification_status: status || "verified", reviewer: reviewerEmail },
      reviewerEmail || "admin@sp-engineering.gov.in",
      `PYQ verification updated to ${status}`
    );
    res.json({ success: true, question: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update verification status." });
  }
});

// Bulk Archive / Restore
app.post("/api/admin/questions/bulk/archive", (req: Request, res: Response) => {
  try {
    const { questionIds, archive } = req.body;
    if (!Array.isArray(questionIds)) {
      return res.status(400).json({ error: "questionIds array is required." });
    }
    const count = ServerQuestionBankEngine.bulkArchive(questionIds, archive !== false);
    res.json({ success: true, modifiedCount: count });
  } catch (error: any) {
    res.status(500).json({ error: "Bulk archive failed." });
  }
});

// Bulk Categorize
app.post("/api/admin/questions/bulk/categorize", (req: Request, res: Response) => {
  try {
    const { questionIds, updates } = req.body;
    if (!Array.isArray(questionIds) || !updates) {
      return res.status(400).json({ error: "questionIds and updates object are required." });
    }
    const count = ServerQuestionBankEngine.bulkCategorize(questionIds, updates);
    res.json({ success: true, modifiedCount: count });
  } catch (error: any) {
    res.status(500).json({ error: "Bulk categorize failed." });
  }
});

// Bulk Verify
app.post("/api/admin/questions/bulk/verify", (req: Request, res: Response) => {
  try {
    const { questionIds, status } = req.body;
    if (!Array.isArray(questionIds) || !status) {
      return res.status(400).json({ error: "questionIds and status are required." });
    }
    const count = ServerQuestionBankEngine.bulkVerify(questionIds, status);
    res.json({ success: true, modifiedCount: count });
  } catch (error: any) {
    res.status(500).json({ error: "Bulk verify failed." });
  }
});

// Bulk Delete
app.post("/api/admin/questions/bulk/delete", (req: Request, res: Response) => {
  try {
    const { questionIds, secretKey } = req.body;
    if (secretKey !== "SUPER_ADMIN_CONFIRMED" && secretKey !== "sp_admin_2025") {
      return res.status(403).json({ error: "Invalid super-admin authorization secret for bulk delete." });
    }
    const count = ServerQuestionBankEngine.bulkDelete(questionIds || []);
    res.json({ success: true, deletedCount: count });
  } catch (error: any) {
    res.status(500).json({ error: "Bulk delete failed." });
  }
});

// AI Explanation Queue
app.get("/api/admin/questions/ai-explanation/queue", (_req: Request, res: Response) => {
  try {
    const queue = ServerQuestionBankEngine.getQuestionsNeedingExplanation(50);
    res.json({ queue, totalNeeding: queue.length });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch AI explanation queue." });
  }
});

// AI Explanation Batch Generation
app.post("/api/admin/questions/ai-explanation/generate", async (req: Request, res: Response) => {
  try {
    const { questionIds } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ error: "questionIds array is required." });
    }
    // Cap at 30 items per batch for rate limit and cost safety
    const capped = questionIds.slice(0, 30);
    const result = await ServerQuestionBankEngine.generateBatchAIExplanation(capped, process.env.GEMINI_API_KEY);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "AI explanation generation failed." });
  }
});

// Approve AI Explanation
app.post("/api/admin/questions/ai-explanation/approve", (req: Request, res: Response) => {
  try {
    const { jobId, approvedExplanation, reviewerEmail } = req.body;
    const ok = ServerQuestionBankEngine.approveAIExplanation(jobId, approvedExplanation, reviewerEmail || "admin@sp-engineering.gov.in");
    if (!ok) {
      return res.status(404).json({ error: "Job ID not found." });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to approve explanation." });
  }
});

// Benchmark & Generate 20,000+ Scalable Dataset
app.post("/api/admin/questions/sample-dataset/generate", (req: Request, res: Response) => {
  try {
    const { count } = req.body;
    const targetCount = count ? Math.min(50000, Number(count)) : 20000;
    const result = ServerQuestionBankEngine.loadGeneratedDatasetIntoRepository(targetCount);
    res.json({
      success: true,
      message: `Successfully loaded ${targetCount} civil engineering questions into the repository.`,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate dataset." });
  }
});

// Backend Mock Test Question Dynamic Selector
app.post("/api/questions/select-for-mock", (req: Request, res: Response) => {
  try {
    const { subjectIds, examId, difficulty, count, pyqOnly, language } = req.body;
    const selected = ServerQuestionBankEngine.selectQuestionsForMockTest({
      subjectIds,
      examId,
      difficulty,
      count: count ? Number(count) : 25,
      pyqOnly: pyqOnly === true,
      language,
    });
    res.json({ questions: selected, count: selected.length });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to select questions for mock test." });
  }
});

// Start Server with Vite Middleware or Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Engineering Officer BY SP] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
