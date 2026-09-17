import {
  CanonicalSubject,
  CivilExamHierarchyProfile,
  ExamSyllabusMapping,
  SyllabusAuditLog
} from '../types';
import {
  INITIAL_CANONICAL_SUBJECTS,
  INITIAL_EXAMS_HIERARCHY,
  INITIAL_EXAM_MAPPINGS,
  INITIAL_AUDIT_LOGS
} from '../../server/syllabusEngine';

export {
  INITIAL_CANONICAL_SUBJECTS,
  INITIAL_EXAMS_HIERARCHY,
  INITIAL_EXAM_MAPPINGS,
  INITIAL_AUDIT_LOGS
};

export interface FullSyllabusHierarchyData {
  version: string;
  exams: CivilExamHierarchyProfile[];
  subjects: CanonicalSubject[];
  mappings: ExamSyllabusMapping[];
  auditLogs: SyllabusAuditLog[];
}
