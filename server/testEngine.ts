import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MASTER_CIVIL_QUESTIONS } from './practiceEngine';

export interface ServerQuestion {
  id: string;
  subjectId: string;
  subject?: string;
  topicId?: string;
  topic?: string;
  stem: string;
  options: string[];
  correctOption: number;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks: number;
  explanation: string;
  isCodeReference?: string;
  diagramSvg?: string;
}

export interface ServerTestSection {
  id: string;
  name: string;
  questionIds: string[];
  durationMinutes?: number;
  marksPerQuestion: number;
  negativeMarksPerQuestion: number;
}

export interface ServerMockTest {
  id: string;
  title: string;
  examTargetId: string;
  mockCategory: string;
  mockType: 'full_length' | 'sectional' | 'subject' | 'topic' | 'custom';
  subjectId?: string;
  topicId?: string;
  topicName?: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: number;
  negativeMarkingScheme: 'none' | 'one_third' | 'one_fourth' | 'custom';
  passingScore: number;
  questionIds: string[];
  sections: ServerTestSection[];
  hasSectionTiming: boolean;
  randomizeQuestions: boolean;
  difficulty: 'Standard' | 'Advanced' | 'PYQ Replica';
  isFree: boolean;
  requiredTier: 'Free Starter' | 'Blueprint Pro JE' | 'Officer Master AE/IES';
  totalAttempts: number;
  avgScore: number;
  createdAt: string;
  instructions: string[];
  cohortBenchmark: {
    totalCandidates: number;
    averageScore: number;
    medianScore: number;
    highestScore: number;
    passingPercentage: number;
    scoreDistribution: { percentile: number; minScore: number }[];
  };
  attemptPolicy?: {
    maxAttempts?: number;
    allowRetakes?: boolean;
    cooldownHours?: number;
    randomizeQuestions?: boolean;
    shuffleOptions?: boolean;
    allowSectionSwitching?: boolean;
    allowReview?: boolean;
  };
  sectionRules?: {
    enforceSectionOrder?: boolean;
    enforceSectionTimeLimit?: boolean;
    lockSubmittedSections?: boolean;
    allowSectionSwitching?: boolean;
  };
}

export interface ActiveSession {
  sessionId: string;
  testId: string;
  userEmail: string;
  userTier: string;
  startTime: number;
  durationMinutes: number;
  sections: ServerTestSection[];
  questionIds: string[];
  sanitizedQuestions: any[];
  answers: Record<string, number | string | null>;
  markedForReview: Record<string, boolean>;
  currentQuestionIdx: number;
  currentSectionId: string;
  timeRemainingSeconds: number;
  lastAutosavedAt: string;
  isSubmitted: boolean;
}

export interface ImmutableAttemptRecord {
  id: string;
  testId: string;
  testTitle: string;
  examTargetId: string;
  mockType: string;
  userEmail: string;
  date: string;
  durationSpentSeconds: number;
  avgTimePerQuestionSeconds: number;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  totalMarks: number;
  negativeMarkLoss: number;
  accuracy: number;
  percentile: number;
  cohortRank: number;
  cohortTotal: number;
  passingScore: number;
  passed: boolean;
  serverVerified: boolean;
  verificationSignature: string;
  userAnswers: Record<string, number | string | null>;
  subjectBreakdown: Record<string, any>;
  topicBreakdown: Record<string, any>;
  difficultyBreakdown: Record<string, any>;
  sectionBreakdown: Record<string, any>;
  flaggedQuestionIds: string[];
  timestamp: string;
}

// Canonical Questions Bank on Server (Answer keys never leaked before submission)
export const SERVER_QUESTIONS: Record<string, ServerQuestion> = {
  'q-101': {
    id: 'q-101',
    subjectId: 'rcc_concrete',
    subject: 'RCC & Prestressed Concrete',
    topic: 'Minimum Reinforcement & Detailing',
    stem: 'According to IS 456:2000 (Clause 26.5.1.1), what is the minimum percentage of tensile reinforcement (Ast,min / bd) required in a beam using Fe 415 steel?',
    options: ['0.205%', '0.340%', '0.400%', '0.120%'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'As per IS 456:2000 Cl. 26.5.1.1, Ast / (b * d) >= 0.85 / fy. For Fe 415 steel, Ast/(b*d) = 0.85 / 415 = 0.002048 = 0.205%.',
    isCodeReference: 'IS 456:2000 Cl. 26.5.1.1',
  },
  'q-102': {
    id: 'q-102',
    subjectId: 'som',
    subject: 'Strength of Materials',
    topic: 'Flexure Formula & Section Modulus',
    stem: 'A rectangular beam of width b and depth d is subjected to maximum bending moment M. What is its section modulus Z about the neutral axis?',
    options: ['bd² / 6', 'bd³ / 12', 'b²d / 6', 'bd / 6'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Moment of inertia I = bd³/12. Neutral axis distance y_max = d/2. Section Modulus Z = I / y_max = (bd³/12) / (d/2) = bd²/6.',
    isCodeReference: 'Pure Bending Theory (Euler-Bernoulli)',
  },
  'q-103': {
    id: 'q-103',
    subjectId: 'soil_mechanics',
    subject: 'Soil Mechanics & Foundations',
    topic: 'Terzaghi Bearing Capacity',
    stem: 'According to Terzaghi bearing capacity theory, the ultimate bearing capacity (qu) for a continuous strip footing on purely cohesive clay (φ = 0, c = cu) with surface load is:',
    options: ['qu = 5.7 cu', 'qu = 5.14 cu', 'qu = 6.2 cu', 'qu = 3.14 cu'],
    correctOption: 0,
    difficulty: 'medium',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Terzaghi formula for strip footing: qu = c*Nc + q*Nq + 0.5*γ*B*Nγ. For φ = 0, Nc = 5.7, Nq = 1.0, Nγ = 0. At surface, q = 0, hence qu = 5.7 * cu. Note: 5.14 is Prandtl/Skempton value.',
    isCodeReference: 'IS 6403:1981 / Terzaghi',
  },
  'q-104': {
    id: 'q-104',
    subjectId: 'fluid_mechanics',
    subject: 'Fluid Mechanics & Hydraulics',
    topic: 'Hydraulic Jump & Specific Energy',
    stem: 'In a rectangular horizontal channel, when a hydraulic jump occurs from Froude number F1 = 4.0, the conjugate depth ratio y2 / y1 is governed by the Bélanger equation. The flow regime before the jump is:',
    options: ['Supercritical flow (F1 > 1)', 'Subcritical flow (F1 < 1)', 'Critical flow (F1 = 1)', 'Tranquil flow (F1 = 0)'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'A hydraulic jump transitions flow from supercritical state (F1 > 1, high velocity, shallow depth) to subcritical state (F2 < 1, low velocity, high depth). Energy is dissipated in the roller.',
    isCodeReference: 'Bélanger Equation (1828)',
  },
  'q-105': {
    id: 'q-105',
    subjectId: 'building_materials',
    subject: 'Building Materials & Construction',
    topic: 'Portland Cement Compounds & Setting',
    stem: 'Which Bogue compound in Portland cement is primarily responsible for the ultimate long-term strength (after 28 days to 1 year) and chemical resistance?',
    options: ['Dicalcium Silicate (C2S)', 'Tricalcium Silicate (C3S)', 'Tricalcium Aluminate (C3A)', 'Tetracalcium Aluminoferrite (C4AF)'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'C2S (Belite) hydrates slowly with low heat of hydration and provides progressive long-term strength beyond 28 days and resists chemical attack. C3S provides early strength (first 7-28 days).',
    isCodeReference: 'IS 269:2015',
  },
  'q-106': {
    id: 'q-106',
    subjectId: 'steel_structures',
    subject: 'Design of Steel Structures',
    topic: 'Plastic Analysis & Shape Factor',
    stem: 'What is the theoretical plastic shape factor (Zp / Ze) for a standard solid circular cross-section beam according to IS 800:2007?',
    options: ['1.70', '1.50', '1.18', '2.00'],
    correctOption: 0,
    difficulty: 'medium',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Shape factor = Plastic Modulus Zp / Elastic Modulus Ze. For solid circular section, Ze = π*d³/32, Zp = d³/6. Shape factor = (d³/6) / (π*d³/32) = 16 / (3π) ≈ 1.697 ≈ 1.70.',
    isCodeReference: 'IS 800:2007 Section 8',
  },
  'q-107': {
    id: 'q-107',
    subjectId: 'surveying',
    subject: 'Surveying & Geomatics',
    topic: 'Two-Peg Test & Reciprocal Levelling',
    stem: 'Reciprocal levelling between two bench marks across a wide river bank effectively eliminates errors caused by:',
    options: [
      'Both atmospheric curvature & collimation error',
      'Atmospheric curvature only',
      'Refraction only',
      'Staff graduation errors',
    ],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Reciprocal levelling eliminates: 1. Curvature error of earth, 2. Collimation error of telescope, 3. Constant portion of atmospheric refraction error (assuming equal conditions).',
    isCodeReference: 'IS 1492 / Surveying Standard Levelling',
  },
  'q-108': {
    id: 'q-108',
    subjectId: 'environmental',
    subject: 'Environmental Engineering',
    topic: 'BOD Kinetics & Water Treatment',
    stem: 'The standard Biochemical Oxygen Demand (BOD5) test in Indian municipal environmental engineering practice is incubated at:',
    options: ['20°C for 5 days', '27°C for 3 days', '37°C for 2 days', '25°C for 7 days'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Standard BOD5 is performed at 20°C for 5 days (BOD5 at 20°C). Note: Central Pollution Control Board (CPCB) also recognizes 3 days at 27°C as rapid tropical standard.',
    isCodeReference: 'IS 3025 (Part 44):1993',
  },
  'q-109': {
    id: 'q-109',
    subjectId: 'transportation',
    subject: 'Highway & Transportation Engineering',
    topic: 'Geometric Design of Highways & IRC Standards',
    stem: 'According to IRC:73 and IRC:37, what is the standard recommended camber percentage for bituminous concrete (asphalt) pavement surface in heavy rainfall zones?',
    options: ['2.0% (1 in 50)', '2.5% (1 in 40)', '1.7% (1 in 60)', '3.0% (1 in 33)'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'As per IRC:73 Table 4.1: For High Type Bituminous / Thin Bituminous surface in Heavy Rainfall areas, camber is 2.0% (1 in 50). In light rainfall, it is 1.7% (1 in 60).',
    isCodeReference: 'IRC:73-1980 Clause 4.2',
  },
  'q-110': {
    id: 'q-110',
    subjectId: 'hydrology_irrigation',
    subject: 'Hydrology & Water Resources',
    topic: 'Duty, Delta & Base Period',
    stem: 'If the base period of a crop is 120 days and the total depth of water required (Delta Δ) is 90 cm, the duty (D) in hectares/cumec is:',
    options: ['1152 ha/cumec', '864 ha/cumec', '960 ha/cumec', '1280 ha/cumec'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Formula: D = 8.64 * B / Δ (where B is in days, Δ is in meters). Here B = 120, Δ = 0.90 m. D = (8.64 * 120) / 0.90 = 1036.8 / 0.90 = 1152 hectares/cumec.',
    isCodeReference: 'Irrigation Engineering Standard Formula',
  },
  'q-111': {
    id: 'q-111',
    subjectId: 'structural_analysis',
    subject: 'Structural Analysis',
    topic: 'Indeterminacy & Energy Principles',
    stem: 'A propped cantilever beam of span L with one fixed end and one simple roller prop has a static indeterminacy degree of:',
    options: ['1', '2', '0 (determinate)', '3'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Total external reactions R = 3 (at fixed end: HA, VA, MA) + 1 (at roller: VB) = 4. Number of 2D equilibrium equations E = 3 (ΣFx=0, ΣFy=0, ΣM=0). Degree of static indeterminacy Ds = 4 - 3 = 1.',
    isCodeReference: 'Structural Analysis DS Principles',
  },
  'q-112': {
    id: 'q-112',
    subjectId: 'rcc_concrete',
    subject: 'RCC & Prestressed Concrete',
    topic: 'Limit State of Shear & Diagonal Tension',
    stem: 'In a reinforced concrete beam designed as per IS 456:2000, if nominal shear stress (τv) exceeds maximum shear strength (τc,max), the correct engineering design action is:',
    options: [
      'Redesign and increase the beam cross-section dimensions (b or d)',
      'Increase the spacing of vertical stirrups',
      'Add bent-up bars to resist shear',
      'Increase the tensile steel area only',
    ],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'As per IS 456:2000 Clause 40.2.3: Under no circumstance shall the nominal shear stress τv exceed τc,max. When τv > τc,max, diagonal compression failure occurs; the section MUST be redesigned by increasing b and/or d.',
    isCodeReference: 'IS 456:2000 Cl. 40.2.3',
  },
  'q-113': {
    id: 'q-113',
    subjectId: 'som',
    subject: 'Strength of Materials',
    topic: 'Mohr Circle & Principal Stresses',
    stem: 'At a point in a strained material, the principal stresses are σ1 = 80 MPa (tensile) and σ2 = 20 MPa (compressive). What is the maximum in-plane shear stress τmax?',
    options: ['50 MPa', '30 MPa', '60 MPa', '100 MPa'],
    correctOption: 0,
    difficulty: 'medium',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Maximum shear stress τmax = (σ1 - σ2) / 2 = (80 - (-20)) / 2 = 100 / 2 = 50 MPa. Radius of Mohr circle equals 50 MPa.',
    isCodeReference: 'Mohr Circle Theory',
  },
  'q-114': {
    id: 'q-114',
    subjectId: 'soil_mechanics',
    subject: 'Soil Mechanics & Foundations',
    topic: 'Effective Stress & Quick Sand Condition',
    stem: 'The critical hydraulic gradient (ic) for upward seepage through a sand stratum with specific gravity G = 2.65 and void ratio e = 0.65 is:',
    options: ['1.00', '0.65', '1.65', '0.85'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Formula for critical hydraulic gradient: ic = (G - 1) / (1 + e) = (2.65 - 1) / (1 + 0.65) = 1.65 / 1.65 = 1.00. At this gradient, effective stress becomes zero (boiling/quick condition).',
    isCodeReference: 'IS 2720 / Seepage Flow',
  },
  'q-115': {
    id: 'q-115',
    subjectId: 'fluid_mechanics',
    subject: 'Fluid Mechanics & Hydraulics',
    topic: 'Chezy & Manning Uniform Flow',
    stem: 'For a hydraulically most efficient trapezoidal open channel section with side slope 1:m (horizontal : vertical = m : 1), the optimum hydraulic radius R is equal to:',
    options: ['Half of the depth of flow (y / 2)', 'Full depth of flow (y)', 'Quarter depth of flow (y / 4)', '2 * y'],
    correctOption: 0,
    difficulty: 'medium',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'For a most efficient trapezoidal channel (half of a regular hexagon), hydraulic radius R = Area / Wetted Perimeter = y / 2.',
    isCodeReference: 'Open Channel Flow Hydraulics',
  },
  'q-116': {
    id: 'q-116',
    subjectId: 'steel_structures',
    subject: 'Design of Steel Structures',
    topic: 'Tension Members & Slenderness Limits',
    stem: 'According to IS 800:2007 (Table 3), what is the maximum permissible effective slenderness ratio (KL/r) for a tension member in which a reversal of direct stress occurs due to loads other than wind or seismic forces?',
    options: ['180', '250', '350', '400'],
    correctOption: 0,
    difficulty: 'medium',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'As per IS 800:2007 Table 3: Member normally acting as tie in a roof truss or bracing, subjected to reversal of stress resulting from action of loads other than wind/seismic forces: maximum slenderness ratio is 180.',
    isCodeReference: 'IS 800:2007 Table 3',
  },
  'q-117': {
    id: 'q-117',
    subjectId: 'surveying',
    subject: 'Surveying & Geomatics',
    topic: 'Total Station & EDM Principles',
    stem: 'An Electronic Distance Measurement (EDM) instrument measures distances by comparing the phase difference between transmitted and reflected modulated infrared or microwave beams. The fundamental equation is:',
    options: ['D = (n * λ + Δλ) / 2', 'D = c * t', 'D = λ / 4', 'D = n * λ * 2'],
    correctOption: 0,
    difficulty: 'medium',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'The two-way transit distance is 2D = n*λ + p. Hence one-way distance D = (n * λ + Δλ) / 2, where n is integer number of full wavelengths and Δλ is phase shift fraction.',
    isCodeReference: 'Electronic Distance Measurement Principle',
  },
  'q-118': {
    id: 'q-118',
    subjectId: 'environmental',
    subject: 'Environmental Engineering',
    topic: 'Water Quality Standards & IS 10500',
    stem: 'As per IS 10500:2012 (Drinking Water Specification), the acceptable limit for Fluoride (as F) in drinking water is:',
    options: ['1.0 mg/L (permissible up to 1.5 mg/L)', '2.0 mg/L', '0.5 mg/L', '3.0 mg/L'],
    correctOption: 0,
    difficulty: 'easy',
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'According to IS 10500:2012 Table 2: Acceptable limit of Fluoride is 1.0 mg/L. In the absence of alternate source, permissible limit is 1.5 mg/L. Fluoride > 1.5 causes dental fluorosis.',
    isCodeReference: 'IS 10500:2012 Table 2',
  },
};

// Merge MASTER_CIVIL_QUESTIONS into lookup
export function getServerQuestion(id: string): ServerQuestion | undefined {
  if (SERVER_QUESTIONS[id]) return SERVER_QUESTIONS[id];
  const master = MASTER_CIVIL_QUESTIONS.find((q) => q.id === id || q.questionId === id);
  if (master) {
    return {
      id: master.id,
      subjectId: master.subjectId,
      subject: master.subject,
      topicId: master.topicId,
      topic: master.topic,
      stem: master.stem || master.text,
      options: master.options,
      correctOption: typeof master.correctOption === 'number' ? master.correctOption : 0,
      difficulty: master.difficulty || 'medium',
      marks: master.marks || 2,
      negativeMarks: master.negativeMarks || 0.5,
      explanation: master.explanation || 'Refer to standard civil engineering codes.',
      isCodeReference: master.isCodeReference,
      diagramSvg: master.diagramSvg,
    };
  }
  return undefined;
}

// Built-in Seed Mocks covering ALL 5 Mock Types
const DEFAULT_MOCK_TESTS: ServerMockTest[] = [
  // 1. FULL-LENGTH: Maha PWD Civil JE
  {
    id: 'mock-pwd-je-full-1',
    title: 'Maha PWD Junior Engineer (Civil) All-Maharashtra CBT Simulation',
    examTargetId: 'maha_pwd',
    mockCategory: 'maha_pwd_full',
    mockType: 'full_length',
    durationMinutes: 120,
    totalMarks: 200,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 110,
    questionIds: ['q-101', 'q-102', 'q-103', 'q-104', 'q-105', 'q-106', 'q-107', 'q-108', 'q-109', 'q-110', 'q-111', 'q-112'],
    sections: [
      {
        id: 'sec-pwd-tech',
        name: 'Technical Civil Engineering Core',
        questionIds: ['q-101', 'q-102', 'q-103', 'q-104', 'q-105', 'q-106', 'q-111', 'q-112'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
      {
        id: 'sec-pwd-infra',
        name: 'Infrastructure, Survey & Environment',
        questionIds: ['q-107', 'q-108', 'q-109', 'q-110'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
    ],
    hasSectionTiming: false,
    randomizeQuestions: true,
    difficulty: 'Standard',
    isFree: true,
    requiredTier: 'Free Starter',
    totalAttempts: 4120,
    avgScore: 118.4,
    createdAt: '2025-01-10',
    instructions: [
      'Official Maharashtra PWD JE examination pattern.',
      'Paper carries 200 Marks. 1/4th (0.50 Marks) deducted per wrong response.',
      'Total duration: 120 Minutes. Questions can be reviewed and edited prior to final submission.',
      'Automatic submission occurs when the countdown expires.',
    ],
    cohortBenchmark: {
      totalCandidates: 4120,
      averageScore: 118.4,
      medianScore: 115.0,
      highestScore: 184.0,
      passingPercentage: 54.0,
      scoreDistribution: [
        { percentile: 99, minScore: 168 },
        { percentile: 95, minScore: 154 },
        { percentile: 90, minScore: 142 },
        { percentile: 75, minScore: 128 },
        { percentile: 50, minScore: 115 },
        { percentile: 25, minScore: 92 },
      ],
    },
    attemptPolicy: {
      maxAttempts: 3,
      allowRetakes: true,
      cooldownHours: 24,
      randomizeQuestions: true,
      allowSectionSwitching: true,
      allowReview: true,
    },
    sectionRules: {
      enforceSectionOrder: false,
      allowSectionSwitching: true,
    },
  },

  // 2. FULL-LENGTH: MPSC MES Mains Paper-I
  {
    id: 'mock-mpsc-mes-mains-1',
    title: 'MPSC Civil Engineering Services (MES Mains) Paper-I All-India Mock',
    examTargetId: 'mpsc_civil',
    mockCategory: 'mpsc_mes_full',
    mockType: 'full_length',
    durationMinutes: 120,
    totalMarks: 200,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 100,
    questionIds: ['q-101', 'q-102', 'q-103', 'q-105', 'q-106', 'q-111', 'q-112', 'q-113', 'q-114', 'q-116'],
    sections: [
      {
        id: 'sec-mpsc-str',
        name: 'Structural Mechanics & Design',
        questionIds: ['q-101', 'q-102', 'q-106', 'q-111', 'q-112', 'q-113', 'q-116'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
      {
        id: 'sec-mpsc-geo',
        name: 'Geotechnical Engineering & Materials',
        questionIds: ['q-103', 'q-105', 'q-114'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
    ],
    hasSectionTiming: false,
    randomizeQuestions: true,
    difficulty: 'Advanced',
    isFree: false,
    requiredTier: 'Officer Master AE/IES',
    totalAttempts: 1890,
    avgScore: 98.2,
    createdAt: '2025-01-12',
    instructions: [
      'Official MPSC MES Assistant Executive Engineer / Assistant Engineer standard.',
      'Paper carries 200 Marks with strict 25% negative marking.',
      'Section navigation is unrestricted.',
    ],
    cohortBenchmark: {
      totalCandidates: 1890,
      averageScore: 98.2,
      medianScore: 95.0,
      highestScore: 162.0,
      passingPercentage: 38.5,
      scoreDistribution: [
        { percentile: 99, minScore: 150 },
        { percentile: 95, minScore: 136 },
        { percentile: 90, minScore: 124 },
        { percentile: 75, minScore: 108 },
        { percentile: 50, minScore: 95 },
        { percentile: 25, minScore: 78 },
      ],
    },
    attemptPolicy: {
      maxAttempts: 2,
      allowRetakes: true,
      cooldownHours: 48,
      randomizeQuestions: true,
      allowSectionSwitching: true,
      allowReview: true,
    },
  },

  // 3. FULL-LENGTH: SSC JE Civil
  {
    id: 'mock-ssc-je-full-1',
    title: 'SSC Junior Engineer (Civil) Paper-I — National CBT Simulation',
    examTargetId: 'ssc_je',
    mockCategory: 'ssc_je_full',
    mockType: 'full_length',
    durationMinutes: 120,
    totalMarks: 200,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 120,
    questionIds: ['q-101', 'q-102', 'q-103', 'q-104', 'q-105', 'q-107', 'q-108', 'q-109', 'q-110', 'q-111'],
    sections: [
      {
        id: 'sec-ssc-tech',
        name: 'Part A: Civil & Structural Engineering (Technical)',
        questionIds: ['q-101', 'q-102', 'q-103', 'q-104', 'q-105', 'q-106'],
        marksPerQuestion: 1,
        negativeMarksPerQuestion: 0.25,
      },
      {
        id: 'sec-ssc-infra',
        name: 'Part B: Infrastructure, Surveying & Estimation',
        questionIds: ['q-107', 'q-108', 'q-109', 'q-111'],
        marksPerQuestion: 1,
        negativeMarksPerQuestion: 0.25,
      },
    ],
    hasSectionTiming: false,
    randomizeQuestions: true,
    difficulty: 'Standard',
    isFree: true,
    requiredTier: 'Free Starter',
    totalAttempts: 3420,
    avgScore: 134.2,
    createdAt: '2025-01-15',
    instructions: [
      'Staff Selection Commission CBT pattern.',
      '+1 Mark for correct answer, -0.25 Mark deduction for incorrect response.',
      'Total duration: 120 Minutes.',
    ],
    cohortBenchmark: {
      totalCandidates: 3420,
      averageScore: 134.2,
      medianScore: 131.5,
      highestScore: 182.0,
      passingPercentage: 58.2,
      scoreDistribution: [
        { percentile: 99, minScore: 174 },
        { percentile: 95, minScore: 161 },
        { percentile: 90, minScore: 152 },
        { percentile: 75, minScore: 140 },
        { percentile: 50, minScore: 131.5 },
        { percentile: 25, minScore: 112 },
      ],
    },
  },

  // 4. SECTIONAL MOCK: Maha PWD Technical & General Sectional
  {
    id: 'mock-sec-pwd-tech-infra',
    title: 'Maha PWD Sectional Mock: Structural & Geotechnical Section',
    examTargetId: 'maha_pwd',
    mockCategory: 'sectional',
    mockType: 'sectional',
    durationMinutes: 60,
    totalMarks: 100,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 55,
    questionIds: ['q-101', 'q-102', 'q-103', 'q-106', 'q-111', 'q-112', 'q-113', 'q-114'],
    sections: [
      {
        id: 'sec-str-som',
        name: 'Section 1: RCC & Strength of Materials',
        questionIds: ['q-101', 'q-102', 'q-106', 'q-112', 'q-113'],
        durationMinutes: 30,
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
      {
        id: 'sec-soil-geo',
        name: 'Section 2: Soil Mechanics & Structures',
        questionIds: ['q-103', 'q-111', 'q-114'],
        durationMinutes: 30,
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
    ],
    hasSectionTiming: true,
    randomizeQuestions: true,
    difficulty: 'Standard',
    isFree: true,
    requiredTier: 'Free Starter',
    totalAttempts: 1250,
    avgScore: 61.5,
    createdAt: '2025-02-01',
    instructions: [
      'Sectional timing enabled: 30 Minutes allocated for each section.',
      'Sections can be reviewed within their active window.',
      'Negative marking: 0.25 penalty per wrong question.',
    ],
    cohortBenchmark: {
      totalCandidates: 1250,
      averageScore: 61.5,
      medianScore: 59.0,
      highestScore: 92.0,
      passingPercentage: 62.0,
      scoreDistribution: [
        { percentile: 99, minScore: 86 },
        { percentile: 90, minScore: 74 },
        { percentile: 50, minScore: 59 },
      ],
    },
    sectionRules: {
      enforceSectionTimeLimit: true,
      enforceSectionOrder: false,
      allowSectionSwitching: true,
    },
  },

  // 5. SUBJECT MOCK: RCC & Concrete Technology
  {
    id: 'mock-subj-rcc-mastery',
    title: 'RCC & Prestressed Concrete — IS 456 Codal Mastery Subject Mock',
    examTargetId: 'maha_pwd',
    mockCategory: 'subject_test',
    mockType: 'subject',
    subjectId: 'rcc_concrete',
    durationMinutes: 45,
    totalMarks: 60,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 36,
    questionIds: ['q-101', 'q-105', 'q-112', 'q-102', 'q-106'],
    sections: [
      {
        id: 'sec-rcc-core',
        name: 'RCC Subject Questions',
        questionIds: ['q-101', 'q-105', 'q-112', 'q-102', 'q-106'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
    ],
    hasSectionTiming: false,
    randomizeQuestions: true,
    difficulty: 'Advanced',
    isFree: true,
    requiredTier: 'Free Starter',
    totalAttempts: 2100,
    avgScore: 38.4,
    createdAt: '2025-02-05',
    instructions: [
      'Focuses strictly on IS 456:2000, mix design, shear, flexure, and detailing clauses.',
      'Duration: 45 Minutes.',
      '+2 Marks for correct answer, -0.50 Mark deduction for wrong answer.',
    ],
    cohortBenchmark: {
      totalCandidates: 2100,
      averageScore: 38.4,
      medianScore: 36.0,
      highestScore: 56.0,
      passingPercentage: 64.0,
      scoreDistribution: [
        { percentile: 99, minScore: 54 },
        { percentile: 90, minScore: 46 },
        { percentile: 50, minScore: 36 },
      ],
    },
  },

  // 6. SUBJECT MOCK: Strength of Materials (SOM)
  {
    id: 'mock-subj-som-mastery',
    title: 'Strength of Materials (SOM) — High-Yield Subject Mock',
    examTargetId: 'mpsc_civil',
    mockCategory: 'subject_test',
    mockType: 'subject',
    subjectId: 'som',
    durationMinutes: 45,
    totalMarks: 60,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 36,
    questionIds: ['q-102', 'q-111', 'q-113', 'q-106', 'q-101'],
    sections: [
      {
        id: 'sec-som-core',
        name: 'SOM Core Questions',
        questionIds: ['q-102', 'q-111', 'q-113', 'q-106', 'q-101'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
    ],
    hasSectionTiming: false,
    randomizeQuestions: true,
    difficulty: 'Standard',
    isFree: true,
    requiredTier: 'Free Starter',
    totalAttempts: 1750,
    avgScore: 37.8,
    createdAt: '2025-02-08',
    instructions: [
      'Tests bending stress, torsion, deflection, Mohr circle, and shear center.',
      'Duration: 45 Minutes. Real-time timer and autosave enabled.',
    ],
    cohortBenchmark: {
      totalCandidates: 1750,
      averageScore: 37.8,
      medianScore: 35.0,
      highestScore: 58.0,
      passingPercentage: 60.0,
      scoreDistribution: [
        { percentile: 99, minScore: 54 },
        { percentile: 90, minScore: 45 },
        { percentile: 50, minScore: 35 },
      ],
    },
  },

  // 7. TOPIC MOCK: Terzaghi Bearing Capacity & Settlement
  {
    id: 'mock-topic-bearing-capacity',
    title: 'Topic Mock: Terzaghi Bearing Capacity, Shallow Footings & IS 6403',
    examTargetId: 'maha_pwd',
    mockCategory: 'chapter_test',
    mockType: 'topic',
    subjectId: 'soil_mechanics',
    topicId: 'terzaghi_bearing_capacity',
    topicName: 'Terzaghi Bearing Capacity',
    durationMinutes: 25,
    totalMarks: 30,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 18,
    questionIds: ['q-103', 'q-114', 'q-105', 'q-107'],
    sections: [
      {
        id: 'sec-topic-bc',
        name: 'Bearing Capacity & Effective Stress MCQs',
        questionIds: ['q-103', 'q-114', 'q-105', 'q-107'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
    ],
    hasSectionTiming: false,
    randomizeQuestions: true,
    difficulty: 'Standard',
    isFree: true,
    requiredTier: 'Free Starter',
    totalAttempts: 940,
    avgScore: 21.4,
    createdAt: '2025-02-14',
    instructions: [
      'Focused rapid sprint on soil bearing capacity factors (Nc, Nq, Nγ) and effective stress.',
      'Total duration: 25 Minutes.',
    ],
    cohortBenchmark: {
      totalCandidates: 940,
      averageScore: 21.4,
      medianScore: 20.0,
      highestScore: 30.0,
      passingPercentage: 68.0,
      scoreDistribution: [
        { percentile: 99, minScore: 28 },
        { percentile: 90, minScore: 24 },
        { percentile: 50, minScore: 20 },
      ],
    },
  },

  // 8. TOPIC MOCK: Open Channel Flow & Hydraulic Jump
  {
    id: 'mock-topic-hydraulic-jump',
    title: 'Topic Mock: Open Channel Flow, Bélanger Jump & Energy Dissipation',
    examTargetId: 'wrd_civil',
    mockCategory: 'chapter_test',
    mockType: 'topic',
    subjectId: 'fluid_mechanics',
    topicId: 'hydraulic_jump',
    topicName: 'Hydraulic Jump & Specific Energy',
    durationMinutes: 25,
    totalMarks: 30,
    negativeMarking: 0.25,
    negativeMarkingScheme: 'one_fourth',
    passingScore: 18,
    questionIds: ['q-104', 'q-115', 'q-110'],
    sections: [
      {
        id: 'sec-topic-jump',
        name: 'Hydraulics Core MCQs',
        questionIds: ['q-104', 'q-115', 'q-110'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.5,
      },
    ],
    hasSectionTiming: false,
    randomizeQuestions: true,
    difficulty: 'Standard',
    isFree: true,
    requiredTier: 'Free Starter',
    totalAttempts: 780,
    avgScore: 20.2,
    createdAt: '2025-02-18',
    instructions: [
      'Tests Froude number criteria, conjugate depths, specific energy diagram, and jump efficiency.',
      'Duration: 25 Minutes.',
    ],
    cohortBenchmark: {
      totalCandidates: 780,
      averageScore: 20.2,
      medianScore: 19.0,
      highestScore: 30.0,
      passingPercentage: 65.0,
      scoreDistribution: [
        { percentile: 99, minScore: 28 },
        { percentile: 90, minScore: 23 },
        { percentile: 50, minScore: 19 },
      ],
    },
  },

  // 9. CUSTOM MOCK: Student Speed Diagnostic
  {
    id: 'mock-custom-speed-diagnostic',
    title: 'Custom Mock: Civil Technical Speed & Accuracy Diagnostic',
    examTargetId: 'maha_pwd',
    mockCategory: 'custom_admin',
    mockType: 'custom',
    durationMinutes: 30,
    totalMarks: 40,
    negativeMarking: 0.3333,
    negativeMarkingScheme: 'one_third',
    passingScore: 24,
    questionIds: ['q-101', 'q-102', 'q-103', 'q-104', 'q-106', 'q-109', 'q-113', 'q-114'],
    sections: [
      {
        id: 'sec-custom-speed',
        name: 'Mixed Multi-Subject Sprint',
        questionIds: ['q-101', 'q-102', 'q-103', 'q-104', 'q-106', 'q-109', 'q-113', 'q-114'],
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0.666,
      },
    ],
    hasSectionTiming: false,
    randomizeQuestions: true,
    difficulty: 'Standard',
    isFree: true,
    requiredTier: 'Free Starter',
    totalAttempts: 520,
    avgScore: 26.5,
    createdAt: '2025-02-20',
    instructions: [
      'Custom timed mock configured to measure accuracy under tight time pressure.',
      'Duration: 30 Minutes with strict 1/3rd penalty for wrong answers.',
    ],
    cohortBenchmark: {
      totalCandidates: 520,
      averageScore: 26.5,
      medianScore: 25.0,
      highestScore: 38.0,
      passingPercentage: 66.0,
      scoreDistribution: [
        { percentile: 99, minScore: 36 },
        { percentile: 90, minScore: 31 },
        { percentile: 50, minScore: 25 },
      ],
    },
    attemptPolicy: {
      maxAttempts: 5,
      allowRetakes: true,
      cooldownHours: 1,
      randomizeQuestions: true,
      allowSectionSwitching: true,
      allowReview: true,
    },
  },
];

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const MOCK_TESTS_FILE = path.join(DATA_DIR, 'mock_tests.json');
const MOCK_ATTEMPTS_FILE = path.join(DATA_DIR, 'mock_attempts.json');

// In-memory cache synced with disk
let inMemoryTests: ServerMockTest[] = [];
let inMemoryAttempts: ImmutableAttemptRecord[] = [];

function ensureDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(MOCK_TESTS_FILE)) {
      fs.writeFileSync(MOCK_TESTS_FILE, JSON.stringify(DEFAULT_MOCK_TESTS, null, 2), 'utf-8');
      inMemoryTests = [...DEFAULT_MOCK_TESTS];
    } else {
      const data = fs.readFileSync(MOCK_TESTS_FILE, 'utf-8');
      inMemoryTests = JSON.parse(data);
    }

    if (!fs.existsSync(MOCK_ATTEMPTS_FILE)) {
      fs.writeFileSync(MOCK_ATTEMPTS_FILE, JSON.stringify([], null, 2), 'utf-8');
      inMemoryAttempts = [];
    } else {
      const data = fs.readFileSync(MOCK_ATTEMPTS_FILE, 'utf-8');
      inMemoryAttempts = JSON.parse(data);
    }
  } catch (err) {
    console.error('[ServerTestEngine] Failed to initialize data files:', err);
    inMemoryTests = [...DEFAULT_MOCK_TESTS];
    inMemoryAttempts = [];
  }
}

function saveTestsToDisk() {
  try {
    fs.writeFileSync(MOCK_TESTS_FILE, JSON.stringify(inMemoryTests, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerTestEngine] Failed to save mock tests to disk:', err);
  }
}

function saveAttemptsToDisk() {
  try {
    fs.writeFileSync(MOCK_ATTEMPTS_FILE, JSON.stringify(inMemoryAttempts, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerTestEngine] Failed to save mock attempts to disk:', err);
  }
}

// Initialize on load
ensureDataFiles();

// In-memory active sessions map (Server-authoritative timestamp & state tracking)
export const ACTIVE_SESSIONS = new Map<string, ActiveSession>();

// Secret key for HMAC result verification
const SERVER_HMAC_SECRET = process.env.TEST_SECRET_KEY || 'engineering-officer-by-sp-cbt-secret-key-2025';

export class ServerTestEngine {
  // Get all mock tests with optional filtering
  static getTests(filter?: {
    mockType?: string;
    examTargetId?: string;
    subjectId?: string;
    isFree?: boolean;
    search?: string;
  }): ServerMockTest[] {
    ensureDataFiles();
    let result = [...inMemoryTests];

    if (filter?.mockType && filter.mockType !== 'all') {
      result = result.filter((t) => t.mockType === filter.mockType || t.mockCategory === filter.mockType);
    }

    if (filter?.examTargetId && filter.examTargetId !== 'all') {
      result = result.filter((t) => t.examTargetId === filter.examTargetId);
    }

    if (filter?.subjectId && filter.subjectId !== 'all') {
      result = result.filter((t) => t.subjectId === filter.subjectId);
    }

    if (filter?.isFree !== undefined) {
      result = result.filter((t) => t.isFree === filter.isFree);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.instructions.some((ins) => ins.toLowerCase().includes(q)));
    }

    return result;
  }

  // Get specific test definition
  static getTest(testId: string): ServerMockTest | undefined {
    ensureDataFiles();
    return inMemoryTests.find((t) => t.id === testId);
  }

  // Start test session: strips correctOption and answers!
  static startSession(
    testId: string,
    userTier: string = 'Free Starter',
    userEmail: string = 'student@example.com'
  ): { error?: string; code?: string; session?: any } {
    ensureDataFiles();
    const test = inMemoryTests.find((t) => t.id === testId);
    if (!test) {
      return { error: `Test with ID ${testId} not found on server.`, code: 'TEST_NOT_FOUND' };
    }

    // Entitlement verification
    if (!test.isFree) {
      const allowed =
        userTier === 'Officer Master AE/IES' ||
        (test.requiredTier === 'Blueprint Pro JE' &&
          (userTier === 'Blueprint Pro JE' || userTier === 'Officer Master AE/IES'));

      if (!allowed) {
        return {
          error: `Access Denied: This test requires a '${test.requiredTier}' subscription. Your current tier is '${userTier}'. Please upgrade to unlock full-length tests and CBT simulations.`,
          code: 'ENTITLEMENT_REQUIRED',
        };
      }
    }

    // Check attempt policy
    if (test.attemptPolicy?.maxAttempts) {
      const userAttempts = inMemoryAttempts.filter((a) => a.testId === testId && a.userEmail === userEmail);
      if (userAttempts.length >= test.attemptPolicy.maxAttempts) {
        return {
          error: `Attempt Policy: Maximum attempts (${test.attemptPolicy.maxAttempts}) reached for this examination.`,
          code: 'MAX_ATTEMPTS_EXCEEDED',
        };
      }
    }

    // Generate secure session ID
    const sessionId = `sess_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const startTime = Date.now();

    // Prepare questions list (shuffled if randomization enabled)
    let questionIds = [...test.questionIds];
    if (test.randomizeQuestions || test.attemptPolicy?.randomizeQuestions) {
      questionIds.sort(() => Math.random() - 0.5);
    }

    // Sanitize questions: strip correct answers, explanations, solutions
    const sanitizedQuestions = questionIds
      .map((id) => {
        const q = getServerQuestion(id);
        if (!q) return null;
        return {
          id: q.id,
          questionId: q.id,
          subjectId: q.subjectId,
          subject: q.subject,
          topicId: q.topicId,
          topic: q.topic,
          stem: q.stem,
          text: q.stem,
          options: q.options,
          difficulty: q.difficulty,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          diagramSvg: q.diagramSvg,
          // CRITICAL: correctOption and explanation are NEVER included!
        };
      })
      .filter(Boolean);

    const session: ActiveSession = {
      sessionId,
      testId,
      userEmail,
      userTier,
      startTime,
      durationMinutes: test.durationMinutes,
      sections: test.sections,
      questionIds,
      sanitizedQuestions,
      answers: {},
      markedForReview: {},
      currentQuestionIdx: 0,
      currentSectionId: test.sections?.[0]?.id || 'sec-main',
      timeRemainingSeconds: test.durationMinutes * 60,
      lastAutosavedAt: new Date().toISOString(),
      isSubmitted: false,
    };

    ACTIVE_SESSIONS.set(sessionId, session);

    return {
      session: {
        serverSessionId: sessionId,
        serverStartTime: new Date(startTime).toISOString(),
        testId: test.id,
        title: test.title,
        examTargetId: test.examTargetId,
        mockCategory: test.mockCategory,
        mockType: test.mockType,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        negativeMarking: test.negativeMarking,
        negativeMarkingScheme: test.negativeMarkingScheme,
        passingScore: test.passingScore,
        questionIds,
        questions: sanitizedQuestions,
        sections: test.sections,
        hasSectionTiming: test.hasSectionTiming,
        sectionRules: test.sectionRules,
        attemptPolicy: test.attemptPolicy,
        instructions: test.instructions,
      },
    };
  }

  // Autosave active test session with batching
  static autosaveSession(
    sessionId: string,
    payload: {
      answers: Record<string, number | string | null>;
      markedForReview: Record<string, boolean>;
      currentQuestionIdx?: number;
      currentSectionId?: string;
      timeRemainingSeconds?: number;
    }
  ): { success: boolean; savedAt: string; totalAnswered: number; totalMarked: number; error?: string } {
    const session = ACTIVE_SESSIONS.get(sessionId);
    if (!session) {
      return {
        success: false,
        savedAt: new Date().toISOString(),
        totalAnswered: 0,
        totalMarked: 0,
        error: 'Active session expired or not found on server.',
      };
    }

    // Merge answers and review flags
    session.answers = { ...session.answers, ...payload.answers };
    session.markedForReview = { ...session.markedForReview, ...payload.markedForReview };

    if (payload.currentQuestionIdx !== undefined) {
      session.currentQuestionIdx = payload.currentQuestionIdx;
    }
    if (payload.currentSectionId) {
      session.currentSectionId = payload.currentSectionId;
    }
    if (payload.timeRemainingSeconds !== undefined) {
      session.timeRemainingSeconds = payload.timeRemainingSeconds;
    }

    session.lastAutosavedAt = new Date().toISOString();

    const answeredCount = Object.values(session.answers).filter(
      (v) => v !== undefined && v !== null && v !== ''
    ).length;
    const markedCount = Object.values(session.markedForReview).filter(Boolean).length;

    return {
      success: true,
      savedAt: session.lastAutosavedAt,
      totalAnswered: answeredCount,
      totalMarked: markedCount,
    };
  }

  // Retrieve active session for reconnection / reload recovery
  static getSession(sessionId: string): ActiveSession | undefined {
    return ACTIVE_SESSIONS.get(sessionId);
  }

  // Authoritative submission evaluation & validation
  static evaluateSubmission(payload: {
    serverSessionId?: string;
    testId: string;
    userAnswers: Record<string, number | string | null>;
    clientDurationSeconds: number;
    userTier?: string;
    userEmail?: string;
  }): {
    error?: string;
    code?: string;
    result?: any;
    unlockedQuestions?: any[];
  } {
    ensureDataFiles();
    const test = inMemoryTests.find((t) => t.id === payload.testId);
    if (!test) {
      return { error: 'Test not found on server.', code: 'TEST_NOT_FOUND' };
    }

    let actualDurationSpentSeconds = payload.clientDurationSeconds;
    let serverVerified = false;

    // Check server session if available
    let session = payload.serverSessionId ? ACTIVE_SESSIONS.get(payload.serverSessionId) : undefined;
    if (session) {
      const elapsedServerSeconds = Math.round((Date.now() - session.startTime) / 1000);
      actualDurationSpentSeconds = Math.min(test.durationMinutes * 60, Math.max(1, elapsedServerSeconds));
      serverVerified = true;
      session.isSubmitted = true;
      ACTIVE_SESSIONS.delete(payload.serverSessionId!);
    }

    // Authoritative score computation
    let correctCount = 0;
    let wrongCount = 0;
    let attemptedCount = 0;
    let negativeMarksLost = 0;

    const subjectBreakdown: Record<string, { correct: number; total: number; wrong: number; score: number }> = {};
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    const difficultyBreakdown: Record<string, { correct: number; wrong: number; total: number }> = {
      easy: { correct: 0, wrong: 0, total: 0 },
      medium: { correct: 0, wrong: 0, total: 0 },
      hard: { correct: 0, wrong: 0, total: 0 },
    };
    const sectionBreakdown: Record<string, { name: string; attempted: number; correct: number; wrong: number; score: number; total: number }> = {};

    // Standard marks per question default
    const marksPerQ = test.totalMarks / (test.questionIds.length || 1);
    const penaltyPerQ = marksPerQ * test.negativeMarking;

    // Initialize sections breakdown
    test.sections.forEach((sec) => {
      sectionBreakdown[sec.id] = {
        name: sec.name,
        attempted: 0,
        correct: 0,
        wrong: 0,
        score: 0,
        total: sec.questionIds.length,
      };
    });

    // Unlocked questions with solutions
    const unlockedQuestions: any[] = [];

    test.questionIds.forEach((qId) => {
      const q = getServerQuestion(qId);
      if (!q) return;

      const subId = q.subjectId;
      if (!subjectBreakdown[subId]) {
        subjectBreakdown[subId] = { correct: 0, total: 0, wrong: 0, score: 0 };
      }
      subjectBreakdown[subId].total += 1;

      if (q.topic) {
        if (!topicBreakdown[q.topic]) {
          topicBreakdown[q.topic] = { correct: 0, total: 0 };
        }
        topicBreakdown[q.topic].total += 1;
      }

      if (difficultyBreakdown[q.difficulty]) {
        difficultyBreakdown[q.difficulty].total += 1;
      }

      const userAns = payload.userAnswers[qId];
      const isAttempted = userAns !== undefined && userAns !== null && userAns !== '';

      const parentSection = test.sections.find((s) => s.questionIds.includes(qId));

      let isCorrect = false;
      if (isAttempted) {
        attemptedCount += 1;
        if (parentSection && sectionBreakdown[parentSection.id]) {
          sectionBreakdown[parentSection.id].attempted += 1;
        }

        isCorrect = Number(userAns) === q.correctOption;

        if (isCorrect) {
          correctCount += 1;
          subjectBreakdown[subId].correct += 1;
          subjectBreakdown[subId].score += marksPerQ;
          if (q.topic) topicBreakdown[q.topic].correct += 1;
          if (difficultyBreakdown[q.difficulty]) difficultyBreakdown[q.difficulty].correct += 1;
          if (parentSection && sectionBreakdown[parentSection.id]) {
            sectionBreakdown[parentSection.id].correct += 1;
            sectionBreakdown[parentSection.id].score += marksPerQ;
          }
        } else {
          wrongCount += 1;
          subjectBreakdown[subId].wrong += 1;
          subjectBreakdown[subId].score -= penaltyPerQ;
          negativeMarksLost += penaltyPerQ;
          if (difficultyBreakdown[q.difficulty]) difficultyBreakdown[q.difficulty].wrong += 1;
          if (parentSection && sectionBreakdown[parentSection.id]) {
            sectionBreakdown[parentSection.id].wrong += 1;
            sectionBreakdown[parentSection.id].score -= penaltyPerQ;
          }
        }
      }

      unlockedQuestions.push({
        id: q.id,
        questionId: q.id,
        subjectId: q.subjectId,
        subject: q.subject,
        topicId: q.topicId,
        topic: q.topic,
        stem: q.stem,
        text: q.stem,
        options: q.options,
        correctOption: q.correctOption,
        correctAnswer: q.correctOption,
        userAnswer: userAns,
        isCorrect,
        isAttempted,
        explanation: q.explanation,
        isCodeReference: q.isCodeReference,
        diagramSvg: q.diagramSvg,
      });
    });

    const unansweredCount = test.questionIds.length - attemptedCount;
    const rawScore = correctCount * marksPerQ - wrongCount * penaltyPerQ;
    const finalScore = Math.max(0, Number(rawScore.toFixed(2)));
    const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;
    const avgTimePerQuestion = attemptedCount > 0 ? Math.round(actualDurationSpentSeconds / attemptedCount) : 0;

    // Percentile & Rank calculation
    let percentile = 50.0;
    let cohortRank = 0;
    const cohort = test.cohortBenchmark;

    if (cohort && cohort.totalCandidates > 0) {
      let calculatedPercentile = 25;
      const sorted = [...cohort.scoreDistribution].sort((a, b) => b.percentile - a.percentile);

      for (const tier of sorted) {
        if (finalScore >= tier.minScore) {
          calculatedPercentile = tier.percentile;
          break;
        }
      }

      if (finalScore >= cohort.highestScore) {
        percentile = 99.8;
      } else {
        const factor = (finalScore / test.totalMarks) * 100;
        percentile = Math.min(99.5, Math.max(5.0, Number((calculatedPercentile * 0.7 + factor * 0.3).toFixed(1))));
      }

      cohortRank = Math.max(1, Math.round(((100 - percentile) / 100) * cohort.totalCandidates));
    }

    // Cryptographic server signature validating results
    const signaturePayload = `${payload.testId}:${finalScore}:${correctCount}:${wrongCount}:${Date.now()}`;
    const verificationSignature = crypto.createHmac('sha256', SERVER_HMAC_SECRET).update(signaturePayload).digest('hex').substring(0, 24);

    const resultData = {
      score: finalScore,
      totalMarks: test.totalMarks,
      negativeMarkLoss: Number(negativeMarksLost.toFixed(2)),
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      attemptedQuestions: attemptedCount,
      totalQuestions: test.questionIds.length,
      accuracy,
      percentile,
      cohortRank,
      cohortTotal: cohort?.totalCandidates || 0,
      hasComparisonDataset: !!cohort && cohort.totalCandidates > 0,
      avgTimePerQuestionSeconds: avgTimePerQuestion,
      durationSpentSeconds: actualDurationSpentSeconds,
      passingScore: test.passingScore,
      passed: finalScore >= test.passingScore,
      subjectBreakdown,
      topicBreakdown,
      difficultyBreakdown,
      sectionBreakdown,
      serverVerified,
      verificationSignature,
      timestamp: new Date().toISOString(),
    };

    // Save immutable attempt record
    const attemptRecord: ImmutableAttemptRecord = {
      id: `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      testId: test.id,
      testTitle: test.title,
      examTargetId: test.examTargetId,
      mockType: test.mockType,
      userEmail: payload.userEmail || 'student@example.com',
      date: new Date().toISOString().split('T')[0],
      durationSpentSeconds: actualDurationSpentSeconds,
      avgTimePerQuestionSeconds: avgTimePerQuestion,
      totalQuestions: test.questionIds.length,
      attemptedQuestions: attemptedCount,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      score: finalScore,
      totalMarks: test.totalMarks,
      negativeMarkLoss: Number(negativeMarksLost.toFixed(2)),
      accuracy,
      percentile,
      cohortRank,
      cohortTotal: cohort?.totalCandidates || 0,
      passingScore: test.passingScore,
      passed: finalScore >= test.passingScore,
      serverVerified,
      verificationSignature,
      userAnswers: payload.userAnswers,
      subjectBreakdown,
      topicBreakdown,
      difficultyBreakdown,
      sectionBreakdown,
      flaggedQuestionIds: [],
      timestamp: new Date().toISOString(),
    };

    inMemoryAttempts.unshift(attemptRecord);
    saveAttemptsToDisk();

    // Update test stats
    test.totalAttempts = (test.totalAttempts || 0) + 1;
    test.avgScore = Number((((test.avgScore || 0) * (test.totalAttempts - 1) + finalScore) / test.totalAttempts).toFixed(1));
    saveTestsToDisk();

    return {
      result: resultData,
      unlockedQuestions,
    };
  }

  // Get attempts history
  static getAttempts(userEmail?: string, testId?: string): ImmutableAttemptRecord[] {
    ensureDataFiles();
    let res = [...inMemoryAttempts];
    if (userEmail) {
      res = res.filter((a) => a.userEmail === userEmail);
    }
    if (testId) {
      res = res.filter((a) => a.testId === testId);
    }
    return res;
  }

  // Get specific attempt details
  static getAttemptById(attemptId: string): ImmutableAttemptRecord | undefined {
    ensureDataFiles();
    return inMemoryAttempts.find((a) => a.id === attemptId);
  }

  // Admin: Create Mock Test
  static adminCreateTest(data: Partial<ServerMockTest>): ServerMockTest {
    ensureDataFiles();
    const id = data.id || `mock-${data.mockType || 'full'}-${Date.now()}`;
    const newTest: ServerMockTest = {
      id,
      title: data.title || 'New Civil Engineering Mock Test',
      examTargetId: data.examTargetId || 'maha_pwd',
      mockCategory: data.mockCategory || data.mockType || 'full_length',
      mockType: data.mockType || 'full_length',
      subjectId: data.subjectId,
      topicId: data.topicId,
      topicName: data.topicName,
      durationMinutes: data.durationMinutes || 120,
      totalMarks: data.totalMarks || 200,
      negativeMarking: data.negativeMarking ?? 0.25,
      negativeMarkingScheme: data.negativeMarkingScheme || 'one_fourth',
      passingScore: data.passingScore || 100,
      questionIds: data.questionIds || ['q-101', 'q-102', 'q-103', 'q-104'],
      sections: data.sections || [
        {
          id: 'sec-1',
          name: 'Core Technical Section',
          questionIds: data.questionIds || ['q-101', 'q-102', 'q-103', 'q-104'],
          marksPerQuestion: 2,
          negativeMarksPerQuestion: 0.5,
        },
      ],
      hasSectionTiming: data.hasSectionTiming || false,
      randomizeQuestions: data.randomizeQuestions ?? true,
      difficulty: data.difficulty || 'Standard',
      isFree: data.isFree ?? true,
      requiredTier: data.requiredTier || 'Free Starter',
      totalAttempts: 0,
      avgScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
      instructions: data.instructions || [
        'Standard Civil Engineering CBT Examination rules apply.',
        'Negative marking deducted for wrong answers.',
      ],
      cohortBenchmark: data.cohortBenchmark || {
        totalCandidates: 1000,
        averageScore: 110,
        medianScore: 105,
        highestScore: 180,
        passingPercentage: 50,
        scoreDistribution: [
          { percentile: 99, minScore: 165 },
          { percentile: 90, minScore: 140 },
          { percentile: 50, minScore: 105 },
        ],
      },
      attemptPolicy: data.attemptPolicy || {
        maxAttempts: 3,
        allowRetakes: true,
        cooldownHours: 24,
        randomizeQuestions: true,
        allowSectionSwitching: true,
        allowReview: true,
      },
      sectionRules: data.sectionRules || {
        enforceSectionOrder: false,
        allowSectionSwitching: true,
      },
    };

    inMemoryTests.unshift(newTest);
    saveTestsToDisk();
    return newTest;
  }

  // Admin: Update Mock Test
  static adminUpdateTest(testId: string, updates: Partial<ServerMockTest>): ServerMockTest | undefined {
    ensureDataFiles();
    const idx = inMemoryTests.findIndex((t) => t.id === testId);
    if (idx === -1) return undefined;

    inMemoryTests[idx] = {
      ...inMemoryTests[idx],
      ...updates,
      id: testId, // immutable id
    };

    saveTestsToDisk();
    return inMemoryTests[idx];
  }

  // Admin: Delete Mock Test
  static adminDeleteTest(testId: string): boolean {
    ensureDataFiles();
    const lenBefore = inMemoryTests.length;
    inMemoryTests = inMemoryTests.filter((t) => t.id !== testId);
    if (inMemoryTests.length !== lenBefore) {
      saveTestsToDisk();
      return true;
    }
    return false;
  }

  // Admin: Clone Mock Test
  static adminCloneTest(testId: string): ServerMockTest | undefined {
    ensureDataFiles();
    const original = inMemoryTests.find((t) => t.id === testId);
    if (!original) return undefined;

    const clonedId = `mock-${original.mockType || 'test'}-${Date.now()}`;
    const cloned: ServerMockTest = {
      ...original,
      id: clonedId,
      title: `${original.title} (Copy)`,
      totalAttempts: 0,
      avgScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    inMemoryTests.unshift(cloned);
    saveTestsToDisk();
    return cloned;
  }

  // Admin: Question pool for test builder
  static getQuestionsPool(filter?: { subjectId?: string; difficulty?: string; search?: string }): any[] {
    const all = [
      ...Object.values(SERVER_QUESTIONS),
      ...MASTER_CIVIL_QUESTIONS.map((q) => ({
        id: q.id,
        subjectId: q.subjectId,
        subject: q.subject,
        topic: q.topic,
        stem: q.stem || q.text,
        options: q.options,
        correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
        difficulty: q.difficulty || 'medium',
        marks: q.marks || 2,
        negativeMarks: q.negativeMarks || 0.5,
        explanation: q.explanation || '',
        isCodeReference: q.isCodeReference,
      })),
    ];

    // Unique by id
    const uniqueMap = new Map<string, any>();
    all.forEach((q) => {
      if (!uniqueMap.has(q.id)) {
        uniqueMap.set(q.id, q);
      }
    });

    let list = Array.from(uniqueMap.values());
    if (filter?.subjectId && filter.subjectId !== 'all') {
      list = list.filter((q) => q.subjectId === filter.subjectId);
    }
    if (filter?.difficulty && filter.difficulty !== 'all') {
      list = list.filter((q) => q.difficulty === filter.difficulty);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((item) => item.stem.toLowerCase().includes(q) || (item.topic && item.topic.toLowerCase().includes(q)));
    }

    return list;
  }
}
