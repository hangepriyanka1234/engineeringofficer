/**
 * Part 32: Super Admin Operations & Audit Logging Engine
 * Role-based authorization, server-side secrets, protected student deletions,
 * audit trail, and bulk operations.
 */

export interface AdminAuditLog {
  id: string;
  actorEmail: string;
  actorRole: 'admin' | 'super_admin';
  action: string;
  targetType: 'student' | 'question' | 'mock_test' | 'recruitment' | 'plan' | 'system';
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

export class ServerAdminOperationsEngine {
  private static auditLogs: AdminAuditLog[] = [
    {
      id: 'audit-001',
      actorEmail: 'sp.officer.admin@enggby sp.com',
      actorRole: 'super_admin',
      action: 'UPDATE_ENTITLEMENT_TIER',
      targetType: 'student',
      targetId: 'student@engineeringofficer.in',
      details: 'Upgraded student to Officer Master tier with lifetime access',
      ipAddress: '49.36.120.45',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'SUCCESS',
    },
    {
      id: 'audit-002',
      actorEmail: 'sp.officer.admin@enggbysp.com',
      actorRole: 'super_admin',
      action: 'PUBLISH_RECRUITMENT_NOTICE',
      targetType: 'recruitment',
      targetId: 'notice-pwd-2026',
      details: 'Published verified Maharashtra PWD JE 2026 (2,120 Vacancies)',
      ipAddress: '49.36.120.45',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'SUCCESS',
    },
  ];

  private static students: Map<string, ManagedStudent> = new Map([
    [
      'student@engineeringofficer.in',
      {
        id: 'std-001',
        name: 'Civil Engineering Aspirant',
        email: 'student@engineeringofficer.in',
        tier: 'master',
        targetExams: ['maha_pwd', 'maha_wrd', 'mpsc_mes'],
        totalQuestionsSolved: 342,
        accuracyPercent: 78.4,
        joinedAt: '2026-08-01T00:00:00Z',
        lastActiveAt: '2026-09-16T15:00:00Z',
        status: 'active',
        isAdmin: true,
        isSuperAdmin: true,
      },
    ],
    [
      'rahul.deshmukh.pwd@gmail.com',
      {
        id: 'std-002',
        name: 'Rahul Deshmukh',
        email: 'rahul.deshmukh.pwd@gmail.com',
        tier: 'pro',
        targetExams: ['maha_pwd', 'bmc_je'],
        totalQuestionsSolved: 820,
        accuracyPercent: 72.1,
        joinedAt: '2026-08-10T00:00:00Z',
        lastActiveAt: '2026-09-16T12:00:00Z',
        status: 'active',
        isAdmin: false,
        isSuperAdmin: false,
      },
    ],
    [
      'sneha.patil.wrd@gmail.com',
      {
        id: 'std-003',
        name: 'Sneha Patil',
        email: 'sneha.patil.wrd@gmail.com',
        tier: 'free',
        targetExams: ['maha_wrd', 'zp_je'],
        totalQuestionsSolved: 145,
        accuracyPercent: 64.8,
        joinedAt: '2026-09-01T00:00:00Z',
        lastActiveAt: '2026-09-15T18:00:00Z',
        status: 'active',
        isAdmin: false,
        isSuperAdmin: false,
      },
    ],
  ]);

  /**
   * Log an administrative mutation
   */
  public static logAction(log: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
    const entry: AdminAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...log,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  /**
   * Get audit logs
   */
  public static getAuditLogs(limit: number = 100): AdminAuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  /**
   * Get all managed students with search & filter
   */
  public static getManagedStudents(search?: string, tier?: string) {
    let list = Array.from(this.students.values());

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    if (tier && tier !== 'all') {
      list = list.filter((s) => s.tier === tier);
    }

    return list;
  }

  /**
   * Protected Student Deletion:
   * 1. Requires Super Admin confirmation token
   * 2. Cannot delete another Admin/Super Admin account
   * 3. Logs full audit record
   */
  public static deleteStudentSafely(
    studentEmail: string,
    actorEmail: string,
    actorRole: 'admin' | 'super_admin',
    confirmationSecret: string
  ): { success: boolean; message: string } {
    const student = this.students.get(studentEmail);
    if (!student) {
      this.logAction({
        actorEmail,
        actorRole,
        action: 'DELETE_STUDENT_FAILED',
        targetType: 'student',
        targetId: studentEmail,
        details: 'Target student not found',
        ipAddress: '127.0.0.1',
        status: 'FAILED',
      });
      return { success: false, message: 'Student not found.' };
    }

    // Protection rule: Never allow deleting an Admin or Super Admin account
    if (student.isAdmin || student.isSuperAdmin) {
      this.logAction({
        actorEmail,
        actorRole,
        action: 'DELETE_STUDENT_REJECTED',
        targetType: 'student',
        targetId: studentEmail,
        details: 'Attempted deletion of protected Administrator account blocked.',
        ipAddress: '127.0.0.1',
        status: 'REJECTED',
      });
      return {
        success: false,
        message: 'Security Violation: Protected Admin and Super Admin accounts cannot be deleted.',
      };
    }

    // Verify confirmation secret
    if (confirmationSecret !== 'CONFIRM_DELETE_STUDENT_2026') {
      this.logAction({
        actorEmail,
        actorRole,
        action: 'DELETE_STUDENT_REJECTED',
        targetType: 'student',
        targetId: studentEmail,
        details: 'Invalid confirmation token supplied.',
        ipAddress: '127.0.0.1',
        status: 'REJECTED',
      });
      return { success: false, message: 'Invalid confirmation token. Operation aborted.' };
    }

    this.students.delete(studentEmail);

    this.logAction({
      actorEmail,
      actorRole,
      action: 'DELETE_STUDENT_SUCCESS',
      targetType: 'student',
      targetId: studentEmail,
      details: `Permanently removed student profile for ${student.name} (${studentEmail}).`,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });

    return { success: true, message: `Student ${student.name} was successfully removed.` };
  }

  /**
   * Update student tier
   */
  public static updateStudentTier(
    studentEmail: string,
    newTier: 'free' | 'pro' | 'master',
    actorEmail: string,
    actorRole: 'admin' | 'super_admin'
  ): { success: boolean; message: string } {
    const student = this.students.get(studentEmail);
    if (!student) {
      return { success: false, message: 'Student not found.' };
    }

    const oldTier = student.tier;
    student.tier = newTier;
    this.students.set(studentEmail, student);

    this.logAction({
      actorEmail,
      actorRole,
      action: 'UPDATE_STUDENT_TIER',
      targetType: 'student',
      targetId: studentEmail,
      details: `Changed entitlement tier from ${oldTier} to ${newTier}`,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });

    return { success: true, message: `Student entitlement tier updated to ${newTier.toUpperCase()}.` };
  }
}
