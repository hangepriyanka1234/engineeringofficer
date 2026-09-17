import { SyllabusSubject, SyllabusTopic, ExamTargetId } from '../types';
import { SYLLABUS_PART_1 } from './syllabusPart1';
import { SYLLABUS_PART_2 } from './syllabusPart2';
import { SYLLABUS_PART_3 } from './syllabusPart3';

// Complete 21-Subject Civil Engineering Master Syllabus Tree
export const INITIAL_SYLLABUS_TREE: SyllabusSubject[] = [
  ...SYLLABUS_PART_1,
  ...SYLLABUS_PART_2,
  ...SYLLABUS_PART_3,
];

export const SUBJECTS = INITIAL_SYLLABUS_TREE;
export const EXAM_TARGETS = [
  { id: 'upsc_ese', name: 'UPSC ESE/IES (Civil)', shortName: 'UPSC ESE' },
  { id: 'ssc_je', name: 'SSC JE (Civil)', shortName: 'SSC JE' },
  { id: 'rrb_je', name: 'RRB JE (Civil)', shortName: 'RRB JE' },
  { id: 'mpsc_civil', name: 'MPSC Civil Services (MES / AE / JE)', shortName: 'MPSC Civil' },
  { id: 'maha_pwd', name: 'Maharashtra PWD JE / CEA', shortName: 'Maha PWD' },
  { id: 'zp_civil', name: 'Zilla Parishad (ZP) Civil JE', shortName: 'ZP Civil' },
  { id: 'bmc_municipal', name: 'BMC / Municipal Corporations JE/AE', shortName: 'BMC Municipal' },
  { id: 'wrd_irrigation', name: 'WRD Irrigation Civil JE/AE', shortName: 'WRD Civil' },
  { id: 'mjp_civil', name: 'MJP Water Authority Civil JE/AE', shortName: 'MJP Civil' },
  { id: 'urban_dev_tp', name: 'Town Planning & Urban Development Assistant', shortName: 'Town Planning' },
  { id: 'housing_infra', name: 'MHADA / CIDCO / MMRDA Infrastructure', shortName: 'MHADA / CIDCO' },
  { id: 'road_transport', name: 'MSRDC / Metro Rail Civil', shortName: 'MSRDC / Metro' },
  { id: 'state_je_ae', name: 'Other State AE/JE Civil Recruitments', shortName: 'Other State AE/JE' },
  { id: 'psu_central', name: 'PSU Civil (GATE / Direct CBT)', shortName: 'PSU Civil' },
];

// Helper utilities for tree traversal and exam-level querying
export function getAllSyllabusTopics(tree: SyllabusSubject[] = INITIAL_SYLLABUS_TREE): SyllabusTopic[] {
  const topics: SyllabusTopic[] = [];
  tree.forEach((subject) => {
    if (subject.isActive) {
      subject.modules.forEach((mod) => {
        if (mod.isActive) {
          mod.topics.forEach((top) => {
            if (top.isActive) {
              topics.push(top);
            }
          });
        }
      });
    }
  });
  return topics;
}

export function getTopicsForExam(
  examId: ExamTargetId,
  tree: SyllabusSubject[] = INITIAL_SYLLABUS_TREE
): SyllabusTopic[] {
  return getAllSyllabusTopics(tree).filter((t) => t.examTargetIds.includes(examId));
}

export function getSubjectById(
  subjectId: string,
  tree: SyllabusSubject[] = INITIAL_SYLLABUS_TREE
): SyllabusSubject | undefined {
  return tree.find((s) => s.id === subjectId);
}

export function getTopicById(
  topicId: string,
  tree: SyllabusSubject[] = INITIAL_SYLLABUS_TREE
): SyllabusTopic | undefined {
  return getAllSyllabusTopics(tree).find((t) => t.id === topicId);
}
