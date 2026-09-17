/**
 * Admin Operations & Infrastructure Management Client Service
 * Connects to Parts 29, 30, 31, 32, 33 APIs
 */

export interface DatabaseMetrics {
  totalRegisteredStudents: number;
  activeConcurrentSessions: number;
  queryVolumeLast24h: number;
  batchedQueriesSavedCount: number;
  dbSizeBytes: number;
  dbSizeFormatted: string;
  storageUsageBytes: number;
  storageUsageFormatted: string;
  bandwidthUsageBytes: number;
  bandwidthUsageFormatted: string;
  edgeFunctionInvocationsCount: number;
  edgeFunctionErrorRatePercent: number;
  cacheHitEfficiencyPercent: number;
}

export interface RateLimitConfig {
  freeTierRpm: number;
  proTierRpm: number;
  masterTierRpm: number;
  ipBurstLimit: number;
  enabled: boolean;
}

export interface AIUsageRecord {
  id: string;
  userEmail: string;
  userTier: string;
  queryType: string;
  modelUsed: string;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  estimatedCostInr: number;
  cacheHit: boolean;
  latencyMs: number;
  status: 'SUCCESS' | 'CIRCUIT_FALLBACK' | 'RATE_LIMITED' | 'QUOTA_EXCEEDED' | 'ERROR';
  timestamp: string;
}

export interface AIBudgetConfig {
  monthlyBudgetCapInr: number;
  currentMonthlySpendInr: number;
  dailySpendAlertThresholdInr: number;
  freeTierDailyQuota: number;
  proTierDailyQuota: number;
  masterTierDailyQuota: number;
  circuitBreakerTripped: boolean;
  concurrencyLimit: number;
  currentActiveCalls: number;
}

export interface StorageObjectMetadata {
  id: string;
  filename: string;
  bucket: 'study-notes' | 'is-codes' | 'masterclass-videos' | 'diagram-assets';
  mimeType: string;
  sizeBytes: number;
  sizeFormatted: string;
  requiresTier: 'free' | 'pro' | 'master';
  downloadCount: number;
  isOrphan: boolean;
  uploadedAt: string;
  sha256Checksum: string;
}

export interface AdminAuditLog {
  id: string;
  actorEmail: string;
  actorRole: 'admin' | 'super_admin';
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'REJECTED';
}

export interface ManagedStudent {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'master';
  targetExams: string[];
  totalQuestionsSolved: number;
  accuracyPercent: number;
  joinedAt: string;
  lastActiveAt: string;
  status: 'active' | 'suspended' | 'deleted_pending';
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface ProductionAuditReport {
  timestamp: string;
  overallStatus: 'RELEASE_READY_PASS' | 'NEEDS_ATTENTION';
  version: string;
  testedUserBase: number;
  scenarios: {
    scenarioName: string;
    simulatedUsers: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    errorRatePercent: number;
    latencyP50Ms: number;
    latencyP95Ms: number;
    latencyP99Ms: number;
    throughputRps: number;
    status: 'PASS' | 'WARN' | 'FAIL';
  }[];
  securityVerification: {
    clientSecretsExposed: boolean;
    rlsCrossTenantIsolationVerified: boolean;
    serverControlledAnswerKeys: boolean;
    paymentSignatureVerification: boolean;
    protectedAdminDeletion: boolean;
    orphanFileCleanupVerified: boolean;
  };
  databaseHealth: {
    indexesConfigured: number;
    batchingEfficiencyGain: string;
    selectiveColumnProjectionSaving: string;
    averageQueryLatencyMs: number;
  };
  aiGatewayPerformance: {
    cacheHitRate: string;
    concurrencyProtection: string;
    budgetThresholdEnforced: boolean;
  };
  releaseChecklistPassedCount: number;
  totalChecklistCount: number;
}

export const AdminOperationsService = {
  // Part 29: DB Metrics
  async getDbMetrics(): Promise<DatabaseMetrics> {
    const res = await fetch('/api/db/metrics');
    const data = await res.json();
    return data.metrics;
  },

  async getRateLimits(): Promise<RateLimitConfig> {
    const res = await fetch('/api/db/rate-limits');
    const data = await res.json();
    return data.limits;
  },

  async updateRateLimits(config: Partial<RateLimitConfig>): Promise<RateLimitConfig> {
    const res = await fetch('/api/db/rate-limits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    return data.limits;
  },

  // Part 30: AI Gateway Ledger & Budgets
  async getAILedger(): Promise<{ ledger: AIUsageRecord[]; budget: AIBudgetConfig }> {
    const res = await fetch('/api/ai/ledger');
    return await res.json();
  },

  async updateAIBudgetConfig(config: Partial<AIBudgetConfig>): Promise<AIBudgetConfig> {
    const res = await fetch('/api/ai/budget-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    return data.budget;
  },

  // Part 31: Storage Objects & Signed URLs
  async getStorageObjects(): Promise<StorageObjectMetadata[]> {
    const res = await fetch('/api/storage/objects');
    const data = await res.json();
    return data.objects || [];
  },

  async requestSignedUrl(objectId: string, userEmail: string, userTier: string) {
    const res = await fetch('/api/storage/sign-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectId, userEmail, userTier }),
    });
    return await res.json();
  },

  async cleanOrphans(): Promise<{ deletedCount: number; bytesReclaimed: number }> {
    const res = await fetch('/api/storage/clean-orphans', { method: 'POST' });
    return await res.json();
  },

  // Part 32: Audit Logs & Students
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    const res = await fetch('/api/admin/audit-logs');
    const data = await res.json();
    return data.logs || [];
  },

  async getStudents(search?: string, tier?: string): Promise<ManagedStudent[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tier) params.set('tier', tier);
    const res = await fetch(`/api/admin/students?${params.toString()}`);
    const data = await res.json();
    return data.students || [];
  },

  async updateStudentTier(studentEmail: string, newTier: 'free' | 'pro' | 'master', actorEmail: string, actorRole: string) {
    const res = await fetch('/api/admin/students/tier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentEmail, newTier, actorEmail, actorRole }),
    });
    return await res.json();
  },

  async deleteStudent(studentEmail: string, actorEmail: string, actorRole: string, confirmationSecret: string) {
    const res = await fetch('/api/admin/students/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentEmail, actorEmail, actorRole, confirmationSecret }),
    });
    return await res.json();
  },

  // Part 33: Production Load Test & Release Gate
  async runProductionLoadTest(): Promise<ProductionAuditReport> {
    const res = await fetch('/api/admin/run-load-test', { method: 'POST' });
    const data = await res.json();
    return data.report;
  },
};
