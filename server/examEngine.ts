import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  ExamProfile,
  ExamPaperConfig,
  ExamSubjectMappingConfig,
  MultiExamAnalysisResult
} from '../src/types';

// Default authentic civil recruitment profiles
export const DEFAULT_EXAM_PROFILES: ExamProfile[] = [
  {
    id: 'upsc_ese',
    name: 'UPSC Engineering Services Examination (ESE / IES) — Civil Engineering',
    shortName: 'UPSC ESE (IES)',
    cadre: 'Group-A Central Engineering Services (Gazetted Executive)',
    organization: 'Union Public Service Commission (UPSC)',
    department: 'Central Engineering Services (CPWD, MES, IRSE, BRO, CWES)',
    authority: 'UPSC Dholpur House, New Delhi',
    level: 'Central',
    qualification: 'Degree in Civil Engineering (B.E. / B.Tech or equivalent from a recognized University / Institution). Final year eligible.',
    eligibilityType: 'Degree Only',
    diplomaEligible: false,
    degreeEligible: true,
    minAge: 21,
    maxAge: 30,
    ageRules: '21 to 30 years on 1st January of examination year. Relaxation: SC/ST 5 yrs, OBC 3 yrs, PwBD 10 yrs.',
    experience: 'None (Fresh graduates fully eligible).',
    categoryNotes: 'Central GoI reservation roster: SC 15%, ST 7.5%, OBC 27%, EWS 10%, PwBD horizontal.',
    stages: [
      'Stage-I: Preliminary Examination (Objective CBT/OMR - 500 Marks)',
      'Stage-II: Mains Examination (Conventional Technical Papers - 600 Marks)',
      'Stage-III: Personality Test / Interview (200 Marks)',
      'Stage-IV: Medical Examination and Document Verification'
    ],
    paperPattern: 'Prelims: Paper-1 GS & Engineering Aptitude (200 Marks, 2 Hrs) + Paper-2 Civil Discipline (300 Marks, 3 Hrs). Mains: Two 300 Marks Conventional Papers.',
    subjects: [
      'Strength of Materials',
      'Structural Analysis',
      'Design of Concrete & Prestressed Structures',
      'Design of Steel Structures',
      'Building Materials & Construction Management',
      'Fluid Mechanics & Hydraulic Machines',
      'Hydrology & Water Resources Engineering',
      'Environmental Engineering',
      'Soil Mechanics & Foundation Engineering',
      'Surveying & Geology',
      'Highway & Transportation Engineering'
    ],
    questionTypes: ['standard_mcq', 'assertion_reason', 'numerical'],
    negativeMarking: '0.33 (1/3rd) deduction per wrong answer in Prelims',
    questionCount: 250,
    duration: 'Prelims: 2 Hours (GS) + 3 Hours (Tech) = 5 Hours total',
    syllabus: 'Official UPSC ESE notification syllabus covering entire core civil engineering curriculum and engineering aptitude compendium.',
    selectionProcess: 'Cumulative merit: Stage-I (500) + Stage-II (600) + Stage-III Interview (200) = 1300 Total Marks.',
    applicationDates: 'September to October annually as per UPSC calendar.',
    examDate: '2026-02-15',
    admitCardDate: '3 weeks prior to exam via upsc.gov.in',
    resultDate: 'Prelims March; Mains August; Final in November/December.',
    officialSource: 'UPSC Official Examination Gazette & Notification (upsc.gov.in)',
    officialWebsite: 'https://upsc.gov.in',
    officialNotificationUrl: 'https://upsc.gov.in/examinations/Engineering-Services-Examination',
    officialApplicationUrl: 'https://upsconline.nic.in',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'National benchmark exam for Group-A Gazetted posts. Recommended target for candidates aiming for executive central leadership.',
    papers: [
      {
        id: 'ese-p1',
        paperNumber: 1,
        paperName: 'Paper-I: General Studies and Engineering Aptitude',
        code: 'ESE-GS-P1',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: '0.33 (1/3rd) negative marking',
        negativeMarksPerQuestion: 0.67,
        marksPerQuestion: 2,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['general_studies', 'engg_ethics']
      },
      {
        id: 'ese-p2',
        paperNumber: 2,
        paperName: 'Paper-II: Civil Engineering Discipline (Comprehensive)',
        code: 'ESE-CE-P2',
        totalMarks: 300,
        durationMinutes: 180,
        negativeMarking: '0.33 (1/3rd) negative marking',
        negativeMarksPerQuestion: 0.67,
        marksPerQuestion: 2,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['som', 'rcc', 'steel', 'geotechnical', 'fluid_mechanics', 'transportation', 'environmental']
      }
    ],
    syllabusMappings: [
      { subjectId: 'som', subjectName: 'Strength of Materials & Structural Analysis', weightagePercent: 18, depthLevel: 'advanced_ese', inclusionStatus: 'core_compulsory', pyqFrequencyText: '18-22 MCQs annually' },
      { subjectId: 'rcc', subjectName: 'Design of Concrete & Prestressed Structures', weightagePercent: 16, depthLevel: 'advanced_ese', inclusionStatus: 'core_compulsory', pyqFrequencyText: '16-20 MCQs annually' },
      { subjectId: 'geotechnical', subjectName: 'Soil Mechanics & Foundation Engineering', weightagePercent: 15, depthLevel: 'advanced_ese', inclusionStatus: 'core_compulsory', pyqFrequencyText: '15-18 MCQs annually' },
      { subjectId: 'fluid_mechanics', subjectName: 'Fluid Mechanics & Open Channel Hydraulics', weightagePercent: 14, depthLevel: 'advanced_ese', inclusionStatus: 'core_compulsory', pyqFrequencyText: '14-16 MCQs annually' },
      { subjectId: 'steel', subjectName: 'Design of Steel Structures (IS 800:2007)', weightagePercent: 12, depthLevel: 'advanced_ese', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-14 MCQs annually' },
      { subjectId: 'transportation', subjectName: 'Transportation & Highway Engineering', weightagePercent: 12, depthLevel: 'advanced_ese', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs annually' },
      { subjectId: 'environmental', subjectName: 'Environmental Engineering & Water Supply', weightagePercent: 13, depthLevel: 'advanced_ese', inclusionStatus: 'core_compulsory', pyqFrequencyText: '12-15 MCQs annually' }
    ]
  },
  {
    id: 'ssc_je',
    name: 'Staff Selection Commission Junior Engineer (SSC JE) — Civil',
    shortName: 'SSC JE (Civil)',
    cadre: 'Junior Engineer (Group-B Non-Gazetted) in CPWD, MES, CWC, BRO, NTRO',
    organization: 'Staff Selection Commission (Government of India)',
    department: 'Central Public Works Department (CPWD), Military Engineer Services (MES), Central Water Commission (CWC), Border Roads Organisation (BRO)',
    authority: 'Staff Selection Commission (DoPT, GoI)',
    level: 'Central',
    qualification: '3-year Diploma in Civil Engineering OR Degree (B.E. / B.Tech) in Civil Engineering.',
    eligibilityType: 'Both Diploma & Degree',
    diplomaEligible: true,
    degreeEligible: true,
    minAge: 18,
    maxAge: 32,
    ageRules: 'Up to 30 years (CPWD/CWC) and 32 years (MES). Standard GoI age relaxations: OBC 3 yrs, SC/ST 5 yrs.',
    experience: 'Fresh Diploma & Degree eligible for CPWD/CWC. 2 years experience required for Diploma in MES/BRO.',
    categoryNotes: 'Central category reservation applies. BRO posts restricted to male candidates with physical efficiency test.',
    stages: [
      'Paper-I: Computer Based Examination (CBT - 200 Questions, 200 Marks, 2 Hours)',
      'Paper-II: Computer Based Examination Technical (100 Questions, 300 Marks, 2 Hours)',
      'Document Verification & Final Merit List'
    ],
    paperPattern: 'Paper-I: 50 General Intelligence & Reasoning + 50 General Awareness + 100 Civil Engg (200 Marks). Paper-II: 100 Technical MCQs (300 Marks, 3 Marks each). Negative: 0.25 in Paper-I, 1.00 in Paper-II.',
    subjects: [
      'Building Materials & Concrete Technology',
      'Estimating, Costing & Valuation',
      'Surveying',
      'Soil Mechanics & Foundation',
      'Hydraulics & Fluid Mechanics',
      'Irrigation Engineering',
      'Transportation Engineering',
      'Environmental Engineering',
      'Theory of Structures & RCC',
      'Steel Design',
      'General Intelligence & Reasoning',
      'General Awareness'
    ],
    questionTypes: ['standard_mcq'],
    negativeMarking: '0.25 marks in Paper-I (1/4th); 1.00 mark in Paper-II (1/3rd)',
    questionCount: 200,
    duration: 'Paper-I: 120 Minutes (2 Hours); Paper-II: 120 Minutes (2 Hours)',
    syllabus: 'Part-A General Engineering (Civil & Structural) aligned with CPWD/GoI standard technical requirements.',
    selectionProcess: 'Cumulative score across CBT Paper-I (200) + CBT Paper-II (300) = 500 Total Marks.',
    applicationDates: 'March - April annually.',
    examDate: '2026-06-05',
    admitCardDate: '10 days before exam date via regional SSC portals.',
    resultDate: 'Paper-I within 60 days; Final within 4 months.',
    officialSource: 'SSC Annual Exam Calendar & Official Notice (ssc.gov.in)',
    officialWebsite: 'https://ssc.gov.in',
    officialNotificationUrl: 'https://ssc.gov.in/notice-board',
    officialApplicationUrl: 'https://ssc.gov.in/login',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'Largest regular central exam for Diploma civil students. Heavy weightage on Building Materials, Surveying, and Estimation.',
    papers: [
      {
        id: 'ssc-p1',
        paperNumber: 1,
        paperName: 'Paper-I: CBT (Civil Technical + Reasoning + General Awareness)',
        code: 'SSC-JE-CBT-1',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: '0.25 marks per wrong answer',
        negativeMarksPerQuestion: 0.25,
        marksPerQuestion: 1,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['rcc', 'som', 'surveying', 'building_materials', 'estimating_costing', 'geotechnical', 'fluid_mechanics']
      },
      {
        id: 'ssc-p2',
        paperNumber: 2,
        paperName: 'Paper-II: CBT Advanced Civil Technical (100 Questions x 3 Marks)',
        code: 'SSC-JE-CBT-2',
        totalMarks: 300,
        durationMinutes: 120,
        negativeMarking: '1.00 mark per wrong answer (1/3rd)',
        negativeMarksPerQuestion: 1.00,
        marksPerQuestion: 3,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['rcc', 'steel', 'som', 'geotechnical', 'fluid_mechanics', 'transportation']
      }
    ],
    syllabusMappings: [
      { subjectId: 'building_materials', subjectName: 'Building Materials & Concrete Technology', weightagePercent: 18, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '18-22 MCQs in Paper-I' },
      { subjectId: 'surveying', subjectName: 'Surveying & Levelling', weightagePercent: 15, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '12-16 MCQs in Paper-I' },
      { subjectId: 'estimating_costing', subjectName: 'Estimating, Costing & Valuation', weightagePercent: 12, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-14 MCQs in Paper-I' },
      { subjectId: 'rcc', subjectName: 'Design of RCC & Structures', weightagePercent: 14, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '12-15 MCQs in Paper-I' },
      { subjectId: 'geotechnical', subjectName: 'Soil Mechanics & Foundation', weightagePercent: 12, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs in Paper-I' },
      { subjectId: 'fluid_mechanics', subjectName: 'Hydraulics & Fluid Mechanics', weightagePercent: 11, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-12 MCQs in Paper-I' },
      { subjectId: 'transportation', subjectName: 'Highway & Transportation Engineering', weightagePercent: 10, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in Paper-I' },
      { subjectId: 'steel', subjectName: 'Design of Steel Structures (IS 800)', weightagePercent: 8, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '6-8 MCQs in Paper-I' }
    ]
  },
  {
    id: 'rrb_je',
    name: 'Railway Recruitment Boards Junior Engineer (RRB JE) — Civil Engineering',
    shortName: 'RRB JE (Civil)',
    cadre: 'Junior Engineer (Civil, Works, Track Machine, Bridge, P-Way) in Indian Railways',
    organization: 'Ministry of Railways (Railway Recruitment Control Board)',
    department: 'Indian Railways (Zonal Divisions: Central, Western, South Central, Northern, etc.)',
    authority: 'Railway Recruitment Boards (RRB Mumbai, RRB Pune, etc.)',
    level: 'Central',
    qualification: '3-year Diploma in Civil Engineering OR B.E. / B.Tech in Civil Engineering.',
    eligibilityType: 'Both Diploma & Degree',
    diplomaEligible: true,
    degreeEligible: true,
    minAge: 18,
    maxAge: 33,
    ageRules: '18 to 33 years. Age relaxation: OBC 3 yrs, SC/ST 5 yrs, Ex-SM, and Railway apprentices.',
    experience: 'None (Fresh graduates & Diploma holders fully eligible).',
    categoryNotes: 'Strict Railway medical standards: Aye-Three (A-3) physical & visual fitness mandatory for P-Way.',
    stages: [
      '1st Stage CBT (Screening Test - 100 MCQs, 90 Minutes)',
      '2nd Stage CBT (Technical + Science - 150 MCQs, 120 Minutes)',
      'Document Verification and Medical Examination'
    ],
    paperPattern: 'CBT-1: Mathematics (30) + General Intelligence (25) + General Science (30) + General Awareness (15) = 100 Marks. CBT-2: Technical Civil (100) + Physics/Chemistry (15) + Computers (10) + Environment (10) + General Awareness (15) = 150 Marks. Negative: 1/3rd.',
    subjects: [
      'Building Materials & Construction',
      'Strength of Materials & Mechanics',
      'RCC & Pre-stressed Structures',
      'Steel Structures & Railway Track Engg',
      'Surveying & Advanced Instruments',
      'Soil Mechanics & Foundation',
      'Hydraulics & Water Resources',
      'Highway, Railway & Bridge Engineering',
      'General Science (Physics & Chemistry)',
      'Basics of Computers & Environment'
    ],
    questionTypes: ['standard_mcq', 'numerical'],
    negativeMarking: '1/3rd (0.33) marks deducted per incorrect answer in both CBT-1 & CBT-2',
    questionCount: 150,
    duration: 'CBT-1: 90 Minutes; CBT-2: 120 Minutes',
    syllabus: 'CEN Notification technical syllabus for Civil & Allied Engineering Exam Group.',
    selectionProcess: 'Shortlisting for CBT-2 based on CBT-1 marks. Final merit prepared exclusively on CBT-2 normalized score.',
    applicationDates: 'Periodically notified based on zonal railway vacancies.',
    examDate: '2026-07-20',
    admitCardDate: '4 days prior to CBT date via respective RRB website.',
    resultDate: 'CBT-1 within 45 days; CBT-2 within 60 days.',
    officialSource: 'Railway Recruitment Control Board Centralized Employment Notice (CEN)',
    officialWebsite: 'https://indianrailways.gov.in',
    officialNotificationUrl: 'https://rrbcdg.gov.in',
    officialApplicationUrl: 'https://www.rrbapply.gov.in',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'High-volume central recruitment. General Science in CBT-1 and Railway Track Engineering in CBT-2 require specific attention.',
    papers: [
      {
        id: 'rrb-cbt1',
        paperNumber: 1,
        paperName: '1st Stage CBT: Common Screening (Maths, Reasoning, General Science, GA)',
        code: 'RRB-JE-CBT1',
        totalMarks: 100,
        durationMinutes: 90,
        negativeMarking: '1/3rd (0.33) deduction',
        negativeMarksPerQuestion: 0.33,
        marksPerQuestion: 1,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['engg_maths', 'general_studies']
      },
      {
        id: 'rrb-cbt2',
        paperNumber: 2,
        paperName: '2nd Stage CBT: Technical Civil & Structural Engineering Group',
        code: 'RRB-JE-CBT2',
        totalMarks: 150,
        durationMinutes: 120,
        negativeMarking: '1/3rd (0.33) deduction',
        negativeMarksPerQuestion: 0.33,
        marksPerQuestion: 1,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['rcc', 'steel', 'som', 'surveying', 'geotechnical', 'fluid_mechanics', 'transportation']
      }
    ],
    syllabusMappings: [
      { subjectId: 'building_materials', subjectName: 'Building Materials & Concrete Technology', weightagePercent: 16, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '16-18 MCQs in CBT-2' },
      { subjectId: 'surveying', subjectName: 'Surveying & Advanced Techniques', weightagePercent: 14, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '14-16 MCQs in CBT-2' },
      { subjectId: 'transportation', subjectName: 'Railway Permanent Way & Highway Engineering', weightagePercent: 15, depthLevel: 'diploma_je', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '15-18 MCQs in CBT-2' },
      { subjectId: 'rcc', subjectName: 'Design of Concrete Structures', weightagePercent: 13, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '12-14 MCQs in CBT-2' },
      { subjectId: 'som', subjectName: 'Mechanics & Strength of Materials', weightagePercent: 12, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs in CBT-2' },
      { subjectId: 'geotechnical', subjectName: 'Soil Mechanics & Foundation', weightagePercent: 11, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs in CBT-2' },
      { subjectId: 'steel', subjectName: 'Design of Steel Structures', weightagePercent: 10, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in CBT-2' },
      { subjectId: 'fluid_mechanics', subjectName: 'Hydraulics & Water Resources', weightagePercent: 9, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in CBT-2' }
    ]
  },
  {
    id: 'mpsc_civil',
    name: 'Maharashtra Civil Engineering Services Examination (MPSC MES — AE/AEE)',
    shortName: 'MPSC MES Civil',
    cadre: 'Assistant Executive Engineer (AEE Gr-A) & Assistant Engineer (AE Gr-A/B Gazetted)',
    organization: 'Maharashtra Public Service Commission (MPSC)',
    department: 'Public Works Department (PWD) and Water Resources Department (WRD), Govt of Maharashtra',
    authority: 'MPSC, Mantralaya / Cooperage Telephone Nigam Building, Mumbai',
    level: 'State',
    qualification: 'Degree in Civil Engineering (B.E. / B.Tech or equivalent from a recognized University / Institution). Final year eligible.',
    eligibilityType: 'Degree Only',
    diplomaEligible: false,
    degreeEligible: true,
    minAge: 19,
    maxAge: 38,
    ageRules: '19 to 38 years for Open. 43 years for Reserved categories (OBC, SC, ST, SEBC, EWS). 45 years for PwBD.',
    experience: 'None (Fresh engineering graduates fully eligible).',
    categoryNotes: 'Maharashtra state domicile and Non-Creamy Layer (NCL) certificate mandatory for OBC/SEBC quota.',
    stages: [
      'Prelims: Combined State Services / Engineering Prelims (Objective CBT - 100 Qs, 100 Marks)',
      'Mains: Civil Engineering Discipline Papers (Paper-1 200 Marks + Paper-2 200 Marks = 400 Marks)',
      'Personality Test / Interview (50 Marks)',
      'Document Verification & Medical Cadre Posting'
    ],
    paperPattern: 'Mains: Paper-I Civil Engineering (100 MCQs, 200 Marks, 2 Hours) + Paper-II Civil Engineering (100 MCQs, 200 Marks, 2 Hours). Total Mains: 400 Marks. Negative: 0.25 (1/4th).',
    subjects: [
      'Building Construction & Materials',
      'Strength of Materials',
      'Theory of Structures & Structural Analysis',
      'Design of Steel Structures (IS 800:2007)',
      'Design of Reinforced Concrete Structures (IS 456:2000)',
      'Prestressed Concrete (IS 1343:2012)',
      'Construction Planning & Management (CPM/PERT)',
      'Fluid Mechanics & Open Channel Hydraulics',
      'Hydrology & Water Resources Engineering',
      'Irrigation Engineering',
      'Environmental Engineering',
      'Geotechnical & Foundation Engineering',
      'Surveying & Advanced Geomatics',
      'Bridge & Highway Engineering'
    ],
    questionTypes: ['standard_mcq', 'numerical', 'assertion_reason'],
    negativeMarking: '0.25 (1/4th) deduction per incorrect response in both Prelims and Mains',
    questionCount: 200,
    duration: 'Mains: Paper-1 120 Minutes + Paper-2 120 Minutes = 240 Minutes total',
    syllabus: 'Official MPSC Civil Engineering Services Gazetted syllabus with extensive focus on structural IS codes and state hydraulic design.',
    selectionProcess: 'Final merit calculated on Mains (400) + Interview (50) = 450 Total Marks.',
    applicationDates: 'Annually notified based on department requisitions.',
    examDate: '2026-10-18',
    admitCardDate: '7 days prior to exam via mpsc.gov.in',
    resultDate: 'Prelims within 45 days; Mains within 3 months.',
    officialSource: 'MPSC Official Examination Gazette & Notification (mpsc.gov.in)',
    officialWebsite: 'https://mpsc.gov.in',
    officialNotificationUrl: 'https://mpsc.gov.in/advertisements',
    officialApplicationUrl: 'https://mpsconline.gov.in',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'Premier state engineering competitive examination. Crucial to master IS 456, IS 800, IS 1343, and deep analytical mechanics.',
    papers: [
      {
        id: 'mpsc-p1',
        paperNumber: 1,
        paperName: 'Paper-I: Civil Engineering (Structures, Materials, Mechanics & Steel)',
        code: 'MPSC-MES-P1',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: '0.25 (1/4th) deduction per wrong answer',
        negativeMarksPerQuestion: 0.50,
        marksPerQuestion: 2,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['rcc', 'som', 'steel', 'building_materials', 'cpm_pert']
      },
      {
        id: 'mpsc-p2',
        paperNumber: 2,
        paperName: 'Paper-II: Civil Engineering (Fluids, Irrigation, Geotech, Highway & Environmental)',
        code: 'MPSC-MES-P2',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: '0.25 (1/4th) deduction per wrong answer',
        negativeMarksPerQuestion: 0.50,
        marksPerQuestion: 2,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['geotechnical', 'fluid_mechanics', 'transportation', 'environmental', 'surveying']
      }
    ],
    syllabusMappings: [
      { subjectId: 'rcc', subjectName: 'Design of RCC & Prestressed Structures', weightagePercent: 16, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '16-18 MCQs in Paper-1' },
      { subjectId: 'som', subjectName: 'Strength of Materials & Structural Analysis', weightagePercent: 15, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '15-18 MCQs in Paper-1' },
      { subjectId: 'geotechnical', subjectName: 'Soil Mechanics & Foundation Engineering', weightagePercent: 14, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '14-16 MCQs in Paper-2' },
      { subjectId: 'fluid_mechanics', subjectName: 'Fluid Mechanics, Hydrology & Irrigation', weightagePercent: 14, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '14-16 MCQs in Paper-2' },
      { subjectId: 'steel', subjectName: 'Design of Steel Structures (IS 800:2007)', weightagePercent: 12, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '12-14 MCQs in Paper-1' },
      { subjectId: 'transportation', subjectName: 'Highway, Bridge & Pavement Engineering', weightagePercent: 11, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs in Paper-2' },
      { subjectId: 'environmental', subjectName: 'Environmental Engineering & Pollution Control', weightagePercent: 10, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs in Paper-2' },
      { subjectId: 'surveying', subjectName: 'Surveying & Modern Geomatics', weightagePercent: 8, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in Paper-2' }
    ]
  },
  {
    id: 'maha_pwd',
    name: 'Maharashtra Public Works Department (PWD JE & CEA)',
    shortName: 'Maha PWD JE & CEA',
    cadre: 'Junior Engineer (Civil) Group-B Non-Gazetted & Civil Engineering Assistant (CEA)',
    organization: 'Public Works Department (Govt of Maharashtra)',
    department: 'PWD (Buildings, Roads, Bridges & Quality Control Wings)',
    authority: 'Chief Engineer (HQ), PWD Maharashtra / TCS-IBPS Recruitment Partner',
    level: 'State',
    qualification: 'Diploma in Civil Engineering / Civil Engineering Assistant (CEA) Course / B.E. / B.Tech in Civil Engineering.',
    eligibilityType: 'Both Diploma & Degree',
    diplomaEligible: true,
    degreeEligible: true,
    minAge: 18,
    maxAge: 38,
    ageRules: '18 to 38 years for Open. 43 years for Reserved. Marathi language 10th standard certificate required.',
    experience: 'None (Fresh diploma & degree holders fully eligible).',
    categoryNotes: '30% horizontal reservation for Women candidates possessing Maharashtra Domicile and NCL.',
    stages: [
      'Single Stage Computer Based Test (CBT - 100 Questions, 200 Marks)',
      'Document Verification and Zone Allocation'
    ],
    paperPattern: '100 MCQs, 200 Marks (60 Civil Engineering Technical = 120 Marks + 40 Marathi, English, GK, Reasoning = 80 Marks). Duration: 120 Minutes. Marking: 2 Marks per correct answer.',
    subjects: [
      'Building Materials & Construction Practices',
      'Strength of Materials',
      'Concrete Technology & RCC (IS 456:2000)',
      'Design of Steel Structures (IS 800:2007)',
      'Surveying & Levelling',
      'Highway Engineering & IRC Specifications',
      'Estimating, Costing & PWD Red Book Schedule of Rates (DSR)',
      'Soil Mechanics & Foundation',
      'Fluid Mechanics & Hydraulics',
      'General Studies, Marathi & Aptitude'
    ],
    questionTypes: ['standard_mcq'],
    negativeMarking: 'No negative marking (or 0.25 as prescribed in specific session notice)',
    questionCount: 100,
    duration: '120 Minutes (2 Hours)',
    syllabus: 'PWD Technical Syllabus aligned with Maharashtra State Board of Technical Education (MSBTE) diploma standard.',
    selectionProcess: 'Direct selection based strictly on CBT normalized marks followed by Document Verification.',
    applicationDates: 'Notified via official portal as per sanctioned state vacancies.',
    examDate: '2026-11-12',
    admitCardDate: '7 days prior to CBT on mahapwd.gov.in',
    resultDate: 'CBT marks within 30 days; Final merit list within 60 days.',
    officialSource: 'Govt of Maharashtra PWD Gazette & GR (mahapwd.gov.in)',
    officialWebsite: 'https://mahapwd.gov.in',
    officialNotificationUrl: 'https://mahapwd.gov.in/recruitments',
    officialApplicationUrl: 'https://mahapwd.gov.in/apply',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'Highest candidate volume in Maharashtra. Focus heavily on PWD Red Book DSR specifications, Building Materials, Surveying, and IRC Highway clauses.',
    papers: [
      {
        id: 'pwd-p1',
        paperNumber: 1,
        paperName: 'Technical & General CBT: Civil Engineering (60 Qs) + Non-Tech (40 Qs)',
        code: 'PWD-CBT-100',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: 'Nil / No negative marking',
        negativeMarksPerQuestion: 0,
        marksPerQuestion: 2,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['building_materials', 'estimating_costing', 'surveying', 'transportation', 'rcc', 'som', 'geotechnical']
      }
    ],
    syllabusMappings: [
      { subjectId: 'building_materials', subjectName: 'Building Materials & Concrete Tech', weightagePercent: 18, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs (20-24 Marks)' },
      { subjectId: 'estimating_costing', subjectName: 'Estimating, Costing & PWD Red Book DSR', weightagePercent: 16, depthLevel: 'diploma_je', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '9-11 MCQs (18-22 Marks)' },
      { subjectId: 'surveying', subjectName: 'Surveying & Levelling', weightagePercent: 15, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs (16-20 Marks)' },
      { subjectId: 'transportation', subjectName: 'Highway & IRC Road Specifications', weightagePercent: 14, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs (16-20 Marks)' },
      { subjectId: 'rcc', subjectName: 'Concrete Technology & RCC Design', weightagePercent: 13, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '7-9 MCQs (14-18 Marks)' },
      { subjectId: 'som', subjectName: 'Strength of Materials', weightagePercent: 12, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '6-8 MCQs (12-16 Marks)' },
      { subjectId: 'geotechnical', subjectName: 'Soil Mechanics & Foundation', weightagePercent: 12, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '6-8 MCQs (12-16 Marks)' }
    ]
  },
  {
    id: 'zp_civil',
    name: 'Zilla Parishad & District Panchayat Samiti Civil JE / CEA Recruitment',
    shortName: 'ZP Civil JE / CEA',
    cadre: 'Junior Engineer (Civil) & Civil Engineering Assistant (District Cadre)',
    organization: 'Rural Development Department (Govt of Maharashtra) & District Selection Committees',
    department: 'Zilla Parishad Engineering Division (Works, Minor Irrigation & RWSS)',
    authority: 'District Selection Committees (34 District ZPs across Maharashtra) / IBPS',
    level: 'Local Body',
    qualification: 'Diploma in Civil Engineering / CEA Certificate Course / B.E. Civil.',
    eligibilityType: 'Both Diploma & Degree',
    diplomaEligible: true,
    degreeEligible: true,
    minAge: 18,
    maxAge: 38,
    ageRules: '18 to 38 years for Open. 43 years for Reserved. Candidate applies for specific District ZP.',
    experience: 'None (Freshers fully eligible).',
    categoryNotes: 'District-wise domicile and reservation rosters apply strictly per district.',
    stages: [
      'Online Computer Based Test (IBPS Pattern - 100 Questions, 200 Marks)',
      'District Document Verification and Selection List'
    ],
    paperPattern: '40 Technical Civil MCQs (80 Marks) + 15 Marathi + 15 English + 15 General Knowledge + 15 Reasoning (120 Marks) = 100 Qs, 200 Marks. Duration: 120 Minutes.',
    subjects: [
      'Building Construction & Materials',
      'Rural Roads & Pavement Design',
      'Minor Irrigation, Bandharas & Check Dams',
      'Rural Water Supply (RWSS) & Sanitation',
      'Surveying & Levelling',
      'Estimating & Costing of Rural Works',
      'RCC & Concrete Technology',
      'Marathi Grammar, English, GK & Reasoning'
    ],
    questionTypes: ['standard_mcq'],
    negativeMarking: 'No negative marking (Standard IBPS ZP pattern)',
    questionCount: 100,
    duration: '120 Minutes (2 Hours)',
    syllabus: 'Standard technical syllabus with specialized rural engineering, check dams, and local water supply.',
    selectionProcess: 'Single-stage CBT examination conducted by IBPS followed by District Counseling.',
    applicationDates: 'District-wise notifications released on IBPS portal.',
    examDate: '2026-11-25',
    admitCardDate: '7 days prior to exam date.',
    resultDate: 'Scorecards declared within 3 weeks of CBT completion.',
    officialSource: 'Rural Development Department (RDD) & Zilla Parishad District Gazettes',
    officialWebsite: 'https://rdd.maharashtra.gov.in',
    officialNotificationUrl: 'https://ibpsonline.ibps.in',
    officialApplicationUrl: 'https://ibpsonline.ibps.in',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'Focus on Rural Infrastructure, Minor Irrigation, Check Dams, and high-accuracy IBPS Marathi/English sections.',
    papers: [
      {
        id: 'zp-cbt',
        paperNumber: 1,
        paperName: 'ZP Written CBT: Civil Technical (40 Qs) + Non-Tech (60 Qs)',
        code: 'ZP-CBT-200',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: 'Nil',
        negativeMarksPerQuestion: 0,
        marksPerQuestion: 2,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['building_materials', 'estimating_costing', 'surveying', 'fluid_mechanics', 'rcc']
      }
    ],
    syllabusMappings: [
      { subjectId: 'building_materials', subjectName: 'Building Materials & Construction', weightagePercent: 20, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in Tech Section' },
      { subjectId: 'estimating_costing', subjectName: 'Estimating & Costing of Rural Infrastructure', weightagePercent: 20, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in Tech Section' },
      { subjectId: 'surveying', subjectName: 'Surveying & Leveling', weightagePercent: 18, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '7-9 MCQs in Tech Section' },
      { subjectId: 'fluid_mechanics', subjectName: 'Minor Irrigation, Check Dams & Water Supply', weightagePercent: 18, depthLevel: 'diploma_je', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '7-9 MCQs in Tech Section' },
      { subjectId: 'rcc', subjectName: 'Concrete Technology & RCC Design', weightagePercent: 14, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '5-7 MCQs in Tech Section' },
      { subjectId: 'transportation', subjectName: 'Rural Roads (PMGSY/MMGSY) & IRC Guidelines', weightagePercent: 10, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '4-6 MCQs in Tech Section' }
    ]
  },
  {
    id: 'bmc_municipal',
    name: 'Municipal Corporation Civil JE / Sub Engineer (BMC, PMC, PCMC, NMMC, KDMC)',
    shortName: 'BMC / Municipal Civil JE',
    cadre: 'Sub Engineer (Civil) & Junior Engineer (Civil) Group-B',
    organization: 'Brihanmumbai Municipal Corporation (BMC) & Maharashtra Municipal Corporations',
    department: 'Stormwater Drains, Sewerage, Roads & Traffic, Building Proposal (DCR), Water Supply Wings',
    authority: 'Municipal Commissioner & Chief Personnel Officer (BMC / PMC / PCMC)',
    level: 'Local Body',
    qualification: 'Diploma in Civil / Environmental Engineering OR Degree (B.E. / B.Tech) in Civil Engineering.',
    eligibilityType: 'Both Diploma & Degree',
    diplomaEligible: true,
    degreeEligible: true,
    minAge: 18,
    maxAge: 38,
    ageRules: '18 to 38 years for Open. 43 years for Reserved categories. Marathi language mandatory.',
    experience: 'None (Fresh candidates eligible).',
    categoryNotes: 'Corporation service rules apply. Highest pay scales among urban municipal cadres.',
    stages: [
      'Online Computer Based Test (CBT - 100 Questions, 100 Marks, 90 Minutes)',
      'Document Verification and Ward / Department Allotment'
    ],
    paperPattern: '100 Questions: 80 Civil Technical + 20 General Knowledge / Mental Ability. Duration: 90-120 Minutes.',
    subjects: [
      'Building Construction & Materials',
      'Structural Analysis & Mechanics',
      'RCC & Pre-stressed Concrete Design',
      'Steel Structures (IS 800:2007)',
      'Soil Mechanics & Deep Foundation (Piles)',
      'Environmental Engineering, Sewage Treatment & Solid Waste',
      'Urban Drainage, Stormwater & Hydraulics',
      'Highway, Bituminous Pavements & Traffic Engg',
      'Surveying & Modern Instruments (Total Station/GPS)',
      'Development Control Regulations (DCR / DCPR 2034) & Building Bye-Laws'
    ],
    questionTypes: ['standard_mcq'],
    negativeMarking: '0.25 marks per wrong answer',
    questionCount: 100,
    duration: '90 Minutes (or 120 Minutes)',
    syllabus: 'Urban Municipal Infrastructure Syllabus with special emphasis on Water Supply, Sewerage, and Mumbai DCPR 2034 bye-laws.',
    selectionProcess: 'Merit list based strictly on CBT score.',
    applicationDates: 'Notified on corporation recruitment portals (portal.mcgm.gov.in).',
    examDate: '2026-12-08',
    admitCardDate: '7 days prior to exam date on portal.mcgm.gov.in',
    resultDate: 'Answer key within 7 days; Results within 45 days.',
    officialSource: 'BMC Official Recruitment Portal & Municipal Corporation Gazettes',
    officialWebsite: 'https://portal.mcgm.gov.in',
    officialNotificationUrl: 'https://portal.mcgm.gov.in/irj/portal/anonymous/recruitment',
    officialApplicationUrl: 'https://portal.mcgm.gov.in/irj/portal/anonymous/recruitment',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'Urban engineering heavy: Environmental Engineering, Stormwater Hydraulics, and Mumbai DCPR 2034 rules carry substantial weightage.',
    papers: [
      {
        id: 'bmc-p1',
        paperNumber: 1,
        paperName: 'Municipal Sub Engineer Technical CBT: Civil & Urban Infrastructure',
        code: 'BMC-SE-100',
        totalMarks: 100,
        durationMinutes: 90,
        negativeMarking: '0.25 deduction per wrong answer',
        negativeMarksPerQuestion: 0.25,
        marksPerQuestion: 1,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['environmental', 'rcc', 'fluid_mechanics', 'transportation', 'geotechnical', 'building_materials', 'som']
      }
    ],
    syllabusMappings: [
      { subjectId: 'environmental', subjectName: 'Environmental Engineering & Wastewater Treatment', weightagePercent: 20, depthLevel: 'degree_ae', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '16-18 MCQs in CBT' },
      { subjectId: 'fluid_mechanics', subjectName: 'Urban Stormwater Hydraulics & Pipe Distribution', weightagePercent: 16, depthLevel: 'degree_ae', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '12-15 MCQs in CBT' },
      { subjectId: 'rcc', subjectName: 'RCC Design (IS 456) & Deep Foundations', weightagePercent: 15, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '12-14 MCQs in CBT' },
      { subjectId: 'transportation', subjectName: 'Urban Roads, Concrete Pavements & Traffic', weightagePercent: 14, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs in CBT' },
      { subjectId: 'geotechnical', subjectName: 'Soil Mechanics, Piles & Retaining Walls', weightagePercent: 12, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs in CBT' },
      { subjectId: 'building_materials', subjectName: 'Materials & Building Proposal / Bye-Laws', weightagePercent: 12, depthLevel: 'degree_ae', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '10-12 MCQs in CBT' },
      { subjectId: 'som', subjectName: 'Structural Mechanics & Steel Design', weightagePercent: 11, depthLevel: 'degree_ae', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in CBT' }
    ]
  },
  {
    id: 'mjp_civil',
    name: 'Maharashtra Jeevan Pradhikaran (MJP) Civil Engineering Recruitment',
    shortName: 'MJP Civil JE/AE',
    cadre: 'Assistant Engineer (Civil) & Junior Engineer (Civil)',
    organization: 'Maharashtra Jeevan Pradhikaran (Water Supply & Sewerage Board)',
    department: 'Water Supply Schemes, Water Treatment Plants (WTP), Reservoirs & Distribution Networks',
    authority: 'Member Secretary, Maharashtra Jeevan Pradhikaran, CIDCO Bhavan, Navi Mumbai',
    level: 'State',
    qualification: 'Diploma in Civil / Environmental Engg OR B.E. / B.Tech in Civil / Environmental Engineering.',
    eligibilityType: 'Both Diploma & Degree',
    diplomaEligible: true,
    degreeEligible: true,
    minAge: 18,
    maxAge: 38,
    ageRules: '18 to 38 years for Open. 43 years for Reserved. State domicile required.',
    experience: 'None (Fresh candidates eligible).',
    categoryNotes: 'State water authority recruitment roster applied per Government Resolutions.',
    stages: [
      'Online CBT Examination (100 MCQs, 200 Marks, 120 Minutes)',
      'Document Verification and Posting'
    ],
    paperPattern: '100 Questions: 70 Technical (Water Supply, Hydraulics, WTP, RCC) + 30 Non-Tech (GK, Marathi, English, Aptitude).',
    subjects: [
      'Water Supply Engineering & Distribution Networks',
      'Water Quality Standards (IS 10500:2012) & Treatment (WTP)',
      'Sewage Treatment (STP) & Underground Sewerage',
      'Fluid Mechanics, Pipe Hydraulics & Pumping Stations',
      'Hydrology & Surface Water Resources',
      'RCC Water Retaining Structures (IS 3370:2021)',
      'Surveying, Pipeline Alignment & Soil Mechanics'
    ],
    questionTypes: ['standard_mcq', 'numerical'],
    negativeMarking: 'No negative marking (or 0.25 as notified in exam guidelines)',
    questionCount: 100,
    duration: '120 Minutes (2 Hours)',
    syllabus: 'Dedicated Water Supply, Public Health Engineering (PHE), and IS 3370 liquid retaining structure syllabus.',
    selectionProcess: 'Direct merit list based on CBT marks.',
    applicationDates: 'Announced on official portal mjpradhikaran.gov.in.',
    examDate: '2026-12-20',
    admitCardDate: '7 days before exam on official portal.',
    resultDate: 'Within 45 days of exam completion.',
    officialSource: 'Maharashtra Jeevan Pradhikaran Official Portal (mjpradhikaran.gov.in)',
    officialWebsite: 'https://mjpradhikaran.gov.in',
    officialNotificationUrl: 'https://mjpradhikaran.gov.in/tenders-recruitments',
    officialApplicationUrl: 'https://mjpradhikaran.gov.in/apply',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'Highly specialized in Public Health Engineering (PHE). Heavy emphasis on IS 10500 drinking water parameters and IS 3370 water tanks.',
    papers: [
      {
        id: 'mjp-p1',
        paperNumber: 1,
        paperName: 'MJP Technical CBT: Water Supply, Environmental & Hydraulic Engineering',
        code: 'MJP-CBT-200',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: 'Nil',
        negativeMarksPerQuestion: 0,
        marksPerQuestion: 2,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['environmental', 'fluid_mechanics', 'rcc', 'surveying', 'geotechnical']
      }
    ],
    syllabusMappings: [
      { subjectId: 'environmental', subjectName: 'Water Supply Engineering & IS 10500 Standards', weightagePercent: 30, depthLevel: 'diploma_je', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '20-22 MCQs in Technical Section' },
      { subjectId: 'fluid_mechanics', subjectName: 'Fluid Mechanics, Pipe Flow & Pumps', weightagePercent: 24, depthLevel: 'diploma_je', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '16-18 MCQs in Technical Section' },
      { subjectId: 'rcc', subjectName: 'RCC Liquid Retaining Structures (IS 3370)', weightagePercent: 18, depthLevel: 'diploma_je', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '12-14 MCQs in Technical Section' },
      { subjectId: 'surveying', subjectName: 'Surveying & Pipeline Alignment', weightagePercent: 14, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in Technical Section' },
      { subjectId: 'geotechnical', subjectName: 'Soil Mechanics & Trench Excavation', weightagePercent: 14, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in Technical Section' }
    ]
  },
  {
    id: 'wrd_irrigation',
    name: 'Water Resources Department (WRD / Jalsampada Vibhag) Civil Recruitment',
    shortName: 'WRD Irrigation Civil',
    cadre: 'Junior Engineer (Civil) & Assistant Engineer (Civil) Group-B',
    organization: 'Water Resources Department (Govt of Maharashtra)',
    department: 'Jalsampada Vibhag (Dams, Canals, Lift Irrigation, Barrages & Hydrology)',
    authority: 'Secretary (CAD & WRD), Mantralaya, Mumbai / TCS-IBPS Partner',
    level: 'State',
    qualification: 'Diploma in Civil Engineering OR Degree (B.E. / B.Tech) in Civil Engineering.',
    eligibilityType: 'Both Diploma & Degree',
    diplomaEligible: true,
    degreeEligible: true,
    minAge: 18,
    maxAge: 38,
    ageRules: '18 to 38 years for Open. 43 years for Reserved. State domicile required.',
    experience: 'None (Fresh candidates eligible).',
    categoryNotes: 'Standard Maharashtra state reservation roster applies.',
    stages: [
      'Single Stage Computer Based Test (CBT - 100 Questions, 200 Marks)',
      'Document Verification and Circle Allotment'
    ],
    paperPattern: '100 Questions: 60 Technical Civil (120 Marks) + 40 Non-Tech (Marathi, English, GK, Aptitude = 80 Marks). Total: 200 Marks. Duration: 120 Minutes.',
    subjects: [
      'Fluid Mechanics & Open Channel Hydraulics',
      'Hydrology, Rainfall & Runoff Analysis',
      'Irrigation Engineering, Canal Design & Cross-Drainage Works',
      'Gravity Dams, Earthen Dams & Spillways',
      'Weirs, Barrages & Seepage (Bligh/Khosla Theory)',
      'Concrete Technology & RCC Design (IS 456)',
      'Soil Mechanics & Embankment Stability',
      'Surveying & Canal Alignments'
    ],
    questionTypes: ['standard_mcq'],
    negativeMarking: 'No negative marking (or 0.25 as prescribed in specific session)',
    questionCount: 100,
    duration: '120 Minutes (2 Hours)',
    syllabus: 'Water Resources & Irrigation syllabus with heavy emphasis on Canal Design, Lacey/Kennedy theories, and Dam engineering.',
    selectionProcess: 'Direct recruitment based on CBT merit list.',
    applicationDates: 'Periodically notified per departmental requirements.',
    examDate: '2027-01-15',
    admitCardDate: '7 days prior to exam on wrd.maharashtra.gov.in',
    resultDate: 'Results declared within 45 days of exam.',
    officialSource: 'Govt of Maharashtra WRD Gazette (wrd.maharashtra.gov.in)',
    officialWebsite: 'https://wrd.maharashtra.gov.in',
    officialNotificationUrl: 'https://wrd.maharashtra.gov.in/recruitment',
    officialApplicationUrl: 'https://wrd.maharashtra.gov.in/apply',
    status: 'Active',
    isActive: true,
    isArchived: false,
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Prof. S. Patil (Head, Civil Faculty)',
    adminNotes: 'Core domain for water engineers. 35% of technical marks come from Hydraulics, Hydrology, Canal Design (Lacey/Kennedy), and Dams.',
    papers: [
      {
        id: 'wrd-p1',
        paperNumber: 1,
        paperName: 'WRD Technical & Non-Tech CBT: Irrigation, Hydraulics & Core Civil',
        code: 'WRD-CBT-200',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: 'Nil',
        negativeMarksPerQuestion: 0,
        marksPerQuestion: 2,
        pattern: 'Objective CBT',
        questionType: 'standard_mcq',
        subjectIds: ['fluid_mechanics', 'geotechnical', 'rcc', 'surveying', 'building_materials', 'som']
      }
    ],
    syllabusMappings: [
      { subjectId: 'fluid_mechanics', subjectName: 'Hydraulics, Hydrology & Canal Design', weightagePercent: 35, depthLevel: 'diploma_je', inclusionStatus: 'specialized_heavy', pyqFrequencyText: '20-22 MCQs in Technical Section' },
      { subjectId: 'geotechnical', subjectName: 'Soil Mechanics, Seepage & Dam Stability', weightagePercent: 18, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '10-12 MCQs in Technical Section' },
      { subjectId: 'rcc', subjectName: 'Concrete Technology & RCC Design', weightagePercent: 14, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '8-10 MCQs in Technical Section' },
      { subjectId: 'surveying', subjectName: 'Surveying & Canal Alignments', weightagePercent: 12, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '6-8 MCQs in Technical Section' },
      { subjectId: 'building_materials', subjectName: 'Building Materials & Masonry', weightagePercent: 11, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '6-8 MCQs in Technical Section' },
      { subjectId: 'som', subjectName: 'Strength of Materials & Mechanics', weightagePercent: 10, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory', pyqFrequencyText: '6-8 MCQs in Technical Section' }
    ]
  }
];

// Persistent state management
class ExamEngineState {
  private profiles: ExamProfile[] = [];
  private readonly dataFilePath = path.join(process.cwd(), 'server', 'data', 'exam_profiles.json');

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.profiles = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read persistent exam profiles, falling back to defaults', e);
    }
    this.profiles = [...DEFAULT_EXAM_PROFILES];
    this.persist();
  }

  private persist() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.profiles, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not save persistent exam profiles to disk', e);
    }
  }

  public getProfiles(filter?: { category?: string; level?: string; status?: string; search?: string; includeArchived?: boolean }): ExamProfile[] {
    return this.profiles.filter((p) => {
      if (!filter?.includeArchived && p.isArchived) return false;
      if (filter?.level && filter.level !== 'all' && p.level !== filter.level) return false;
      if (filter?.status && filter.status !== 'all' && p.status !== filter.status) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.shortName.toLowerCase().includes(q) ||
          p.authority.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }

  public getProfileById(id: string): ExamProfile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public createProfile(profileData: Partial<ExamProfile>, actorEmail: string = 'admin@engineeringofficer.in'): ExamProfile {
    const id = profileData.id || `exam_${Date.now()}`;
    const newProfile: ExamProfile = {
      id,
      name: profileData.name || 'New Civil Engineering Recruitment Examination',
      shortName: profileData.shortName || 'Civil Exam',
      cadre: profileData.cadre || 'Junior Engineer (Civil)',
      organization: profileData.organization || 'Government Department',
      department: profileData.department || 'Civil Engineering Department',
      authority: profileData.authority || 'State Recruitment Board',
      level: profileData.level || 'State',
      qualification: profileData.qualification || 'Diploma in Civil Engineering / B.E. Civil',
      eligibilityType: profileData.eligibilityType || 'Both Diploma & Degree',
      diplomaEligible: profileData.diplomaEligible ?? true,
      degreeEligible: profileData.degreeEligible ?? true,
      minAge: profileData.minAge || 18,
      maxAge: profileData.maxAge || 38,
      ageRules: profileData.ageRules || '18 to 38 years as per standard government rules.',
      experience: profileData.experience || 'Nil / Fresh graduates eligible.',
      categoryNotes: profileData.categoryNotes || 'Standard reservation rules apply.',
      stages: profileData.stages || ['Stage 1: CBT Written Test', 'Stage 2: Document Verification'],
      paperPattern: profileData.paperPattern || '100 Questions, 200 Marks (120 Minutes)',
      subjects: profileData.subjects || ['Building Materials', 'SOM', 'RCC', 'Surveying', 'Fluid Mechanics'],
      questionTypes: profileData.questionTypes || ['standard_mcq'],
      negativeMarking: profileData.negativeMarking || '0.25 marks per wrong answer',
      questionCount: profileData.questionCount || 100,
      duration: profileData.duration || '120 Minutes',
      syllabus: profileData.syllabus || 'Civil Engineering syllabus aligned with SP curriculum.',
      selectionProcess: profileData.selectionProcess || 'Direct recruitment based on CBT merit list.',
      applicationDates: profileData.applicationDates || 'Refer official notification',
      examDate: profileData.examDate || 'Tentative 2026-12-31',
      admitCardDate: profileData.admitCardDate || '7 days prior to exam',
      resultDate: profileData.resultDate || 'Within 45 days',
      officialSource: profileData.officialSource || 'Official Government Gazette',
      officialWebsite: profileData.officialWebsite || 'https://maharashtra.gov.in',
      officialNotificationUrl: profileData.officialNotificationUrl || '',
      officialApplicationUrl: profileData.officialApplicationUrl || '',
      status: profileData.status || 'Active',
      isActive: profileData.isActive ?? true,
      isArchived: false,
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      verifiedBy: actorEmail,
      adminNotes: profileData.adminNotes || 'Created via Admin Exam Ecosystem Manager.',
      papers: profileData.papers || [
        {
          id: `${id}-p1`,
          paperNumber: 1,
          paperName: 'Technical Paper: Civil Engineering (CBT)',
          code: `${id.toUpperCase()}-P1`,
          totalMarks: 200,
          durationMinutes: 120,
          negativeMarking: '0.25 deduction',
          negativeMarksPerQuestion: 0.5,
          marksPerQuestion: 2,
          pattern: 'Objective CBT',
          questionType: 'standard_mcq',
          subjectIds: ['rcc', 'som', 'surveying', 'building_materials', 'geotechnical']
        }
      ],
      syllabusMappings: profileData.syllabusMappings || [
        { subjectId: 'building_materials', subjectName: 'Building Materials & Concrete Technology', weightagePercent: 20, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory' },
        { subjectId: 'surveying', subjectName: 'Surveying & Levelling', weightagePercent: 18, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory' },
        { subjectId: 'rcc', subjectName: 'Design of Concrete & Structures', weightagePercent: 16, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory' },
        { subjectId: 'som', subjectName: 'Strength of Materials & Mechanics', weightagePercent: 15, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory' },
        { subjectId: 'geotechnical', subjectName: 'Soil Mechanics & Foundation', weightagePercent: 15, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory' },
        { subjectId: 'fluid_mechanics', subjectName: 'Fluid Mechanics & Hydraulics', weightagePercent: 16, depthLevel: 'diploma_je', inclusionStatus: 'core_compulsory' }
      ]
    };

    this.profiles.push(newProfile);
    this.persist();
    return newProfile;
  }

  public updateProfile(id: string, updates: Partial<ExamProfile>, actorEmail: string = 'admin@engineeringofficer.in'): ExamProfile | undefined {
    const index = this.profiles.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const existing = this.profiles[index];
    const updated: ExamProfile = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      verifiedBy: actorEmail
    };

    this.profiles[index] = updated;
    this.persist();
    return updated;
  }

  public cloneProfile(sourceId: string, newId: string, newName: string, actorEmail: string = 'admin@engineeringofficer.in'): ExamProfile | undefined {
    const source = this.profiles.find((p) => p.id === sourceId);
    if (!source) return undefined;

    const cloned: ExamProfile = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: newName,
      shortName: `${source.shortName} (Copy)`,
      status: 'Active',
      isArchived: false,
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      verifiedBy: actorEmail,
      adminNotes: `Cloned from ${source.name} on ${new Date().toLocaleDateString()}`
    };

    this.profiles.push(cloned);
    this.persist();
    return cloned;
  }

  public archiveProfile(id: string, actorEmail: string = 'admin@engineeringofficer.in'): boolean {
    const profile = this.profiles.find((p) => p.id === id);
    if (!profile) return false;

    profile.isArchived = true;
    profile.status = 'Archived';
    profile.lastVerifiedDate = new Date().toISOString().split('T')[0];
    profile.verifiedBy = actorEmail;
    this.persist();
    return true;
  }

  public restoreProfile(id: string, actorEmail: string = 'admin@engineeringofficer.in'): boolean {
    const profile = this.profiles.find((p) => p.id === id);
    if (!profile) return false;

    profile.isArchived = false;
    profile.status = 'Active';
    profile.lastVerifiedDate = new Date().toISOString().split('T')[0];
    profile.verifiedBy = actorEmail;
    this.persist();
    return true;
  }

  public deleteProfile(id: string): boolean {
    const initialLen = this.profiles.length;
    this.profiles = this.profiles.filter((p) => p.id !== id);
    if (this.profiles.length < initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // ==========================================
  // MULTI-TARGET EXAM PREPARATION ENGINE
  // Intelligently merges common preparation while preserving differentiators
  // ==========================================
  public analyzeMultiTargetPreparation(examIds: string[], candidateQualification?: string): MultiExamAnalysisResult {
    // Resolve chosen exam profiles
    const selectedExams = this.profiles.filter((p) => examIds.includes(p.id));
    if (selectedExams.length === 0) {
      // Fallback default: Maha PWD + SSC JE
      return this.analyzeMultiTargetPreparation(['maha_pwd', 'ssc_je'], candidateQualification);
    }

    // Canonical subject metadata dictionary
    const subjectMeta: Record<string, { name: string; isCodes: string[]; coreImportance: 'Critical' | 'High' | 'Medium'; summary: string }> = {
      building_materials: {
        name: 'Building Materials & Concrete Technology',
        isCodes: ['IS 383 (Aggregates)', 'IS 456:2000', 'IS 269 (OPC)', 'IS 10262 (Mix Design)'],
        coreImportance: 'Critical',
        summary: 'Universal foundational module tested across all Diploma and Degree exams. Heavy weightage in SSC JE (18%) and Maha PWD (18%).'
      },
      rcc: {
        name: 'Design of Reinforced Concrete Structures (RCC)',
        isCodes: ['IS 456:2000 Cl. 38/26', 'SP 16', 'IS 1343:2012 (Prestressed)'],
        coreImportance: 'Critical',
        summary: 'Constitutes 14-16% of total technical marks in every single board. Common focus: Limit State Method, Neutral axis limits, minimum shear/flexural steel.'
      },
      surveying: {
        name: 'Surveying & Advanced Geomatics',
        isCodes: ['Standard Surveyor Practices', 'IRC 73 (Alignment)'],
        coreImportance: 'Critical',
        summary: 'Universal core across state and central boards. Direct calculations on Levelling (HI & Rise/Fall), Contouring, Tacheometry, and Earthwork volumes.'
      },
      som: {
        name: 'Strength of Materials & Structural Analysis',
        isCodes: ['IS 800:2007', 'Standard Engineering Mechanics'],
        coreImportance: 'Critical',
        summary: 'Theoretical backbone of civil engineering. SFD/BMD, Bending/Shear stresses, Principal stresses (Mohr Circle), and Euler Column buckling.'
      },
      geotechnical: {
        name: 'Soil Mechanics & Foundation Engineering',
        isCodes: ['IS 2720 (Soil Testing)', 'IS 6403 (Bearing Capacity)', 'IS 2911 (Piles)'],
        coreImportance: 'Critical',
        summary: 'Standard high-yield subject (12-15%). Terzaghi 1D consolidation, Rankine/Coulomb earth pressures, and Mohr-Coulomb shear strength.'
      },
      fluid_mechanics: {
        name: 'Fluid Mechanics & Open Channel Hydraulics',
        isCodes: ['IS 1192', 'IS 9108 (Weirs & Notches)'],
        coreImportance: 'Critical',
        summary: 'Core water engineering subject. Bernoulli theorem, pipe head losses (Darcy-Weisbach), hydraulic jumps, and specific energy curves.'
      },
      transportation: {
        name: 'Highway & Transportation Engineering',
        isCodes: ['IRC 73 (Geometric Design)', 'IRC 37 (Flexible Pavements)', 'IRC 58 (Rigid Pavements)'],
        coreImportance: 'High',
        summary: 'Standard road design module. Superelevation calculation, stopping sight distance (SSD), CBR test, and Los Angeles abrasion test.'
      },
      estimating_costing: {
        name: 'Estimating, Costing & Valuation',
        isCodes: ['IS 1200 (Method of Measurement)', 'PWD Red Book DSR'],
        coreImportance: 'High',
        summary: 'Crucial for Maha PWD (16%), ZP (20%), and SSC JE (12%). Center-line method, long-wall short-wall, depreciation, and rate analysis.'
      },
      steel: {
        name: 'Design of Steel Structures (IS 800:2007)',
        isCodes: ['IS 800:2007 (Table 3, Table 5)', 'IS 875 (Wind Loads)'],
        coreImportance: 'High',
        summary: 'Code-intensive module. Slenderness ratio limits, throat thickness of fillet welds, and plastic section modulus.'
      },
      environmental: {
        name: 'Environmental Engineering & Water Supply',
        isCodes: ['IS 10500:2012 (Drinking Water)', 'CPHEEO Manual'],
        coreImportance: 'High',
        summary: 'Primary subject for BMC (20%), MJP (30%), and ESE (13%). Water treatment units (coagulation, filtration, chlorination) and BOD kinetics.'
      }
    };

    // Track which subjects appear in which exams
    const subjectAppearances: Record<string, { examIds: string[]; totalWeightage: number }> = {};

    selectedExams.forEach((exam) => {
      const mappings = exam.syllabusMappings || [];
      mappings.forEach((m) => {
        if (!subjectAppearances[m.subjectId]) {
          subjectAppearances[m.subjectId] = { examIds: [], totalWeightage: 0 };
        }
        subjectAppearances[m.subjectId].examIds.push(exam.id);
        subjectAppearances[m.subjectId].totalWeightage += m.weightagePercent;
      });
    });

    const totalSelectedExamsCount = selectedExams.length;

    // Classify into Universal Core vs Differential
    const universalCoreSubjects: MultiExamAnalysisResult['universalCoreSubjects'] = [];
    const differentialSubjects: MultiExamAnalysisResult['differentialSubjects'] = [];

    Object.entries(subjectAppearances).forEach(([subjId, data]) => {
      const appearanceRatio = data.examIds.length / totalSelectedExamsCount;
      const meta = subjectMeta[subjId] || {
        name: subjId.replace(/_/g, ' ').toUpperCase(),
        isCodes: ['Standard Civil Engineering Practice'],
        coreImportance: 'Medium' as const,
        summary: 'Relevant discipline across civil recruitment syllabus.'
      };

      const avgWeight = Math.round(data.totalWeightage / data.examIds.length);

      // If present in >= 60% of chosen exams or present in all if only 2 exams
      if (appearanceRatio >= 0.6 || (totalSelectedExamsCount <= 2 && data.examIds.length === totalSelectedExamsCount)) {
        universalCoreSubjects.push({
          subjectId: subjId,
          subjectName: meta.name,
          averageWeightage: avgWeight,
          appearsInExamIds: data.examIds,
          isCodes: meta.isCodes,
          importance: meta.coreImportance,
          summary: meta.summary
        });
      }
    });

    // Sort Universal Core by average weightage descending
    universalCoreSubjects.sort((a, b) => b.averageWeightage - a.averageWeightage);

    // Identify exam-specific differentiators (unique to 1 exam, or specialized heavy)
    selectedExams.forEach((exam) => {
      const mappings = exam.syllabusMappings || [];
      mappings.forEach((m) => {
        const isCore = universalCoreSubjects.some((c) => c.subjectId === m.subjectId);
        const isUnique = (subjectAppearances[m.subjectId]?.examIds.length || 0) === 1;

        if (isUnique || m.inclusionStatus === 'specialized_heavy' || (!isCore && m.weightagePercent >= 12)) {
          let strategicNote = '';
          if (m.subjectId === 'fluid_mechanics' && exam.id === 'wrd_irrigation') {
            strategicNote = 'Extraordinary 35% weightage in WRD! Focus on Lacey/Kennedy silt theories, canal regulators, and dam spillways.';
          } else if (m.subjectId === 'environmental' && (exam.id === 'bmc_municipal' || exam.id === 'mjp_civil')) {
            strategicNote = 'Heavy municipal water/wastewater weightage. Strict focus on IS 10500:2012 parameters, STP activated sludge, and pipe distribution.';
          } else if (m.subjectId === 'estimating_costing' && exam.id === 'maha_pwd') {
            strategicNote = 'PWD Red Book Schedule of Rates (DSR), lead charges, and standard contract specifications heavily tested.';
          } else if (m.subjectId === 'transportation' && exam.id === 'rrb_je') {
            strategicNote = 'Railway Permanent Way (P-Way), sleeper density (M+x), coning of wheels, and points/crossings required.';
          } else {
            strategicNote = `${exam.shortName} specific emphasis (${m.weightagePercent}% weightage). Requires targeted board-specific study.`;
          }

          differentialSubjects.push({
            examId: exam.id,
            examShortName: exam.shortName,
            subjectId: m.subjectId,
            subjectName: m.subjectName,
            weightage: m.weightagePercent,
            depthLevel: m.depthLevel,
            strategicNote,
            isUniqueToThisExam: isUnique
          });
        }
      });
    });

    // Compute overlap percentage
    const totalSubjectEntries = Object.keys(subjectAppearances).length;
    const coreCount = universalCoreSubjects.length;
    const overlapPercentage = totalSubjectEntries > 0
      ? Math.min(95, Math.max(55, Math.round((coreCount / totalSubjectEntries) * 100 + (totalSelectedExamsCount > 3 ? 10 : 0))))
      : 80;

    // Build pattern comparison matrix
    const patternComparison: MultiExamAnalysisResult['patternComparison'] = selectedExams.map((ex) => ({
      examId: ex.id,
      shortName: ex.shortName,
      totalMarks: ex.papers?.reduce((acc, p) => acc + p.totalMarks, 0) || 200,
      duration: ex.duration || '120 Minutes',
      negativeMarking: ex.negativeMarking || '0.25 marks',
      questionCount: ex.questionCount || 100,
      qualification: ex.qualification || 'Diploma / B.E. Civil',
      diplomaAllowed: ex.diplomaEligible ?? true,
      degreeAllowed: ex.degreeEligible ?? true,
      officialSource: ex.officialSource || 'Official Gazette',
      conductingBody: ex.authority || ex.organization || 'Exam Board'
    }));

    // Build Unified Preparation Strategy
    const baseDailyTarget = 60;
    const coreRatio = Math.max(65, Math.min(85, overlapPercentage));
    const diffRatio = 100 - coreRatio;
    const coreQuestions = Math.round((baseDailyTarget * coreRatio) / 100);
    const diffQuestions = baseDailyTarget - coreQuestions;

    const actionItems: string[] = [
      `Anchor your foundation in the Universal Core (${universalCoreSubjects.slice(0, 4).map((s) => s.subjectName.split(' ')[0]).join(', ')}): Master once to gain score yield in all ${selectedExams.length} selected target exams simultaneously.`,
      `Allocate ${coreRatio}% of daily study hours to shared IS code provisions (IS 456, IS 800, IS 2720) and ${diffRatio}% to exam-specific differentiators.`,
      `Respect negative marking rules: When taking ${selectedExams.map((e) => e.shortName).join(' vs ')}, calibrate risk threshold (${selectedExams.map((e) => `${e.shortName}: ${e.negativeMarking?.split(' ')[0] || 'Rule'}`).join(', ')}).`,
      `Schedule dedicated Saturday/Sunday blocks exclusively for Differential Modules (${differentialSubjects.slice(0, 3).map((d) => `${d.examShortName} ${d.subjectName.split(' ')[0]}`).join(', ')}).`
    ];

    if (candidateQualification) {
      const isDiploma = candidateQualification.toLowerCase().includes('diploma');
      const degreeOnlyExams = selectedExams.filter((e) => !e.diplomaEligible);
      if (isDiploma && degreeOnlyExams.length > 0) {
        actionItems.unshift(
          `⚠️ ELIGIBILITY WARNING: You selected ${degreeOnlyExams.map((e) => e.shortName).join(', ')} which strictly requires a Degree (B.E./B.Tech). Verify notifications if you hold a Diploma only.`
        );
      }
    }

    // Build Timeline Milestones
    const now = new Date();
    const timelineMilestones: MultiExamAnalysisResult['timelineMilestones'] = selectedExams.map((ex) => {
      const examDateObj = ex.examDate ? new Date(ex.examDate) : new Date(now.getTime() + 90 * 86400000);
      const diffDays = Math.ceil((examDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        examId: ex.id,
        examShortName: ex.shortName,
        event: `${ex.shortName} CBT Examination`,
        date: ex.examDate || 'Tentative 2026',
        status: diffDays > 0 ? 'Upcoming' : 'Active',
        daysRemaining: diffDays > 0 ? diffDays : undefined
      };
    });

    timelineMilestones.sort((a, b) => (a.daysRemaining || 999) - (b.daysRemaining || 999));

    return {
      selectedExams,
      overlapPercentage,
      universalCoreSubjects,
      differentialSubjects,
      patternComparison,
      unifiedStrategy: {
        recommendedCoreRatio: coreRatio,
        recommendedDifferentialRatio: diffRatio,
        dailyQuestionGoal: baseDailyTarget,
        coreDailyQuestions: coreQuestions,
        diffDailyQuestions: diffQuestions,
        keyActionItems: actionItems
      },
      timelineMilestones
    };
  }
}

export const ServerExamEngine = new ExamEngineState();
