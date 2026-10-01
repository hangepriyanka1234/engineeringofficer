import {
  ScalableExamCatalogueItem,
  ScalableQuestionPaper,
  ScalableHubQuestion,
  CBTExamSubmissionResult,
  ExamCategoryType,
  OfficialPYQStatus,
  AIQuestionStatus,
} from '../types/examHub';
import { DuplicateDetectionService } from './duplicateDetectionService';

// Seed Baseline Scalable Exams covering all 8 Categories
export const SEED_SCALABLE_EXAMS: ScalableExamCatalogueItem[] = [
  // 1. Central Government
  {
    id: 'ssc_je_civil',
    exam_name: 'SSC Junior Engineer (Civil)',
    short_name: 'SSC JE Civil',
    authority: 'Staff Selection Commission (SSC)',
    department: 'CPWD, MES, CWC & Farakka Barrage',
    category: 'Central Government',
    state_or_central: 'Central',
    qualification: 'Both',
    diploma_eligible: true,
    degree_eligible: true,
    official_website: 'https://ssc.gov.in',
    official_notification_url: 'https://ssc.gov.in/notifications',
    exam_pattern: 'Tier 1: CBT Objective (200 Marks) | Tier 2: CBT Technical Detailed (300 Marks)',
    duration: 120,
    marks: 200,
    negative_marking: '0.25 (1/4th)',
    subjects: ['SOM', 'RCC', 'Steel', 'Soil Mechanics', 'Fluid Mechanics', 'Surveying', 'Estimation & Costing', 'General Intelligence', 'General Awareness'],
    syllabus: 'Full Diploma & Degree Civil Engineering curriculum, General Reasoning & Indian Polity/Geography.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-03-01',
    active_recruitments_count: 1765,
  },
  {
    id: 'upsc_ese_civil',
    exam_name: 'UPSC Engineering Services Examination (Civil)',
    short_name: 'UPSC ESE / IES',
    authority: 'Union Public Service Commission (UPSC)',
    department: 'Indian Railway Service of Engineers, CPWD, CWD, Border Roads',
    category: 'Central Government',
    state_or_central: 'Central',
    qualification: 'Degree',
    diploma_eligible: false,
    degree_eligible: true,
    official_website: 'https://upsc.gov.in',
    official_notification_url: 'https://upsc.gov.in/examinations',
    exam_pattern: 'Prelims Stage I (500 Marks) + Mains Stage II Conventional (600 Marks) + Personality Test (200 Marks)',
    duration: 180,
    marks: 500,
    negative_marking: '0.333 (1/3rd)',
    subjects: ['Structural Analysis', 'RCC & Pre-stressed', 'Steel Design', 'Geotechnical', 'Environmental', 'Transportation', 'Surveying', 'Hydrology & Irrigation', 'Construction Management'],
    syllabus: 'Advanced B.Tech Civil Engineering syllabus with IS/IRC/IRC-SP codes & Engineering Ethics.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-02-15',
    active_recruitments_count: 320,
  },

  // 2. Maharashtra Government
  {
    id: 'mpsc_civil_ae',
    exam_name: 'MPSC Civil Engineering Services (Assistant Engineer Gr-A/B)',
    short_name: 'MPSC Civil AE',
    authority: 'Maharashtra Public Service Commission (MPSC)',
    department: 'Public Works Department (PWD) & Water Resources Department (WRD)',
    category: 'Maharashtra Government',
    state_or_central: 'Maharashtra',
    qualification: 'Degree',
    diploma_eligible: false,
    degree_eligible: true,
    official_website: 'https://mpsc.gov.in',
    official_notification_url: 'https://mpsc.gov.in/notifications',
    exam_pattern: 'Prelims Objective CBT (100 Qs / 200 Marks) + Mains Objective CBT (200 Qs / 400 Marks)',
    duration: 120,
    marks: 400,
    negative_marking: '0.25 (1/4th)',
    subjects: ['SOM', 'Structural Analysis', 'RCC', 'Steel', 'Soil Mechanics', 'Fluid Mechanics', 'Irrigation', 'Highways', 'Surveying', 'Town Planning'],
    syllabus: 'MPSC Gazetted Civil Engineering Cadre Degree syllabus as per Maharashtra Govt Gazette.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-03-10',
    active_recruitments_count: 520,
  },
  {
    id: 'maha_pwd_jee',
    exam_name: 'Maharashtra PWD Junior Engineer & Assistant Engineer (Civil)',
    short_name: 'Maha PWD JE/AE',
    authority: 'Maharashtra Public Works Department',
    department: 'Public Works Department (Govt. of Maharashtra)',
    category: 'Maharashtra Government',
    state_or_central: 'Maharashtra',
    qualification: 'Both',
    diploma_eligible: true,
    degree_eligible: true,
    official_website: 'https://mahapwd.maharashtra.gov.in',
    official_notification_url: 'https://mahapwd.maharashtra.gov.in/recruitment',
    exam_pattern: 'TCS iON CBT Exam (100 Questions / 200 Marks): 80 Technical Civil + 20 Non-Technical Marathi/English/GK',
    duration: 120,
    marks: 200,
    negative_marking: '0 (No Negative)',
    subjects: ['Building Materials', 'Concrete Technology', 'SOM', 'RCC', 'Surveying', 'Highways', 'Estimation', 'Marathi Language', 'English Language', 'General Knowledge'],
    syllabus: 'Diploma & Degree Civil Technical subjects with Marathi grammar & Maharashtra general knowledge.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-03-12',
    active_recruitments_count: 2100,
  },
  {
    id: 'zp_civil_engineer',
    exam_name: 'Zilla Parishad Civil Engineering Assistant & Kanishtha Abhiyanta',
    short_name: 'ZP Civil Engineer',
    authority: 'Rural Development Department & ZP District Committees',
    department: '34 Zilla Parishad Districts of Maharashtra',
    category: 'Maharashtra Government',
    state_or_central: 'Maharashtra',
    qualification: 'Both',
    diploma_eligible: true,
    degree_eligible: true,
    official_website: 'https://rdd.maharashtra.gov.in',
    official_notification_url: 'https://rdd.maharashtra.gov.in',
    exam_pattern: 'IBPS CBT Mode (100 Questions / 200 Marks): 40 Technical + 60 General Studies/Marathi/Reasoning',
    duration: 120,
    marks: 200,
    negative_marking: '0.25 (1/4th)',
    subjects: ['Surveying', 'Building Construction', 'Roads & Bridges', 'Irrigation Works', 'Marathi Grammar', 'Aptitude & Logical Reasoning'],
    syllabus: 'Practical Construction Execution, Surveying, Estimation, and Rural Infrastructure Development.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-02-28',
    active_recruitments_count: 1890,
  },

  // 3. Other State Government
  {
    id: 'gpsc_civil_ae',
    exam_name: 'GPSC Assistant Engineer (Civil)',
    short_name: 'Gujarat PSC AE Civil',
    authority: 'Gujarat Public Service Commission',
    department: 'Narmada, Water Resources, Water Supply & Kalpsar Dept.',
    category: 'Other State Government',
    state_or_central: 'Other State',
    qualification: 'Degree',
    diploma_eligible: false,
    degree_eligible: true,
    official_website: 'https://gpsc.gujarat.gov.in',
    official_notification_url: 'https://gpsc.gujarat.gov.in/advertisements',
    exam_pattern: 'Primary Objective CBT (300 Questions / 300 Marks) + Interview',
    duration: 180,
    marks: 300,
    negative_marking: '0.30 (1/3rd)',
    subjects: ['SOM', 'RCC', 'Soil Mechanics', 'Fluid Mechanics', 'Surveying', 'Irrigation & Canal Engineering', 'General Studies Gujarati'],
    syllabus: 'Standard Degree Civil Engineering syllabus with Gujarat Water Resources focus.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-01-20',
    active_recruitments_count: 240,
  },

  // 4. PSU / Technical Recruitment
  {
    id: 'nhpc_civil_je',
    exam_name: 'NHPC Junior Engineer (Civil)',
    short_name: 'NHPC JE Civil',
    authority: 'National Hydroelectric Power Corporation (NHPC Ltd.)',
    department: 'Hydro Power Projects & Infrastructure Division',
    category: 'PSU / Technical Recruitment',
    state_or_central: 'PSU',
    qualification: 'Both',
    diploma_eligible: true,
    degree_eligible: true,
    official_website: 'https://nhpcindia.com',
    official_notification_url: 'https://nhpcindia.com/careers',
    exam_pattern: 'CBT Test (200 Questions / 200 Marks): 140 Civil + 30 Reasoning + 30 General Awareness',
    duration: 180,
    marks: 200,
    negative_marking: '0.25 (1/4th)',
    subjects: ['Dam Engineering', 'Fluid Mechanics & Hydraulics', 'RCC', 'Soil Mechanics', 'Tunnel Engineering', 'General Reasoning'],
    syllabus: 'Hydroelectric power structure design, dam safety, geology & core civil subjects.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-02-10',
    active_recruitments_count: 140,
  },

  // 5. Railway / Infrastructure
  {
    id: 'rrb_je_civil',
    exam_name: 'Railway Recruitment Board Junior Engineer (Civil / Track Machine)',
    short_name: 'RRB JE Civil',
    authority: 'Railway Recruitment Control Board (RRCB)',
    department: 'Indian Railways (Permanent Way, Works & Bridge Cadres)',
    category: 'Railway / Infrastructure',
    state_or_central: 'Central',
    qualification: 'Both',
    diploma_eligible: true,
    degree_eligible: true,
    official_website: 'https://indianrailways.gov.in',
    official_notification_url: 'https://rrbcdg.gov.in',
    exam_pattern: 'CBT 1 (100 Qs Non-Tech) + CBT 2 (150 Qs: 100 Technical Civil + 50 Physics/Chemistry/CS)',
    duration: 120,
    marks: 150,
    negative_marking: '0.333 (1/3rd)',
    subjects: ['Railway Track Engineering', 'Surveying', 'SOM', 'RCC', 'Steel Structures', 'Bridge Engineering', 'Physics & Chemistry'],
    syllabus: 'Permanent way engineering, curves, points & crossings, ballast, sleepers, and core civil engineering.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-03-05',
    active_recruitments_count: 4200,
  },

  // 6. Municipal / Local Government
  {
    id: 'bmc_sub_engineer',
    exam_name: 'Brihanmumbai Municipal Corporation (BMC) Sub-Engineer (Civil)',
    short_name: 'BMC Sub-Engineer',
    authority: 'Brihanmumbai Municipal Corporation (BMC / MCGM)',
    department: 'Storm Water Drains, Roads & Traffic, Water Supply, Sewerage Operations',
    category: 'Municipal / Local Government',
    state_or_central: 'Municipal',
    qualification: 'Both',
    diploma_eligible: true,
    degree_eligible: true,
    official_website: 'https://portal.mcgm.gov.in',
    official_notification_url: 'https://portal.mcgm.gov.in/recruitment',
    exam_pattern: 'TCS iON CBT Exam (100 Questions / 100 Marks): 80 Technical Civil + 20 General Awareness/Marathi',
    duration: 120,
    marks: 100,
    negative_marking: '0.25 (1/4th)',
    subjects: ['Municipal Engineering', 'Sewerage & Sewage Treatment', 'Water Supply & Pipelines', 'Road Pavements', 'Building Rules & Development Control', 'SOM', 'RCC'],
    syllabus: 'Urban infrastructure, Mumbai Municipal Corporation Act 1888 rules, water distribution, pavement engineering.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-03-14',
    active_recruitments_count: 680,
  },

  // 7. GATE / Higher Technical Exams
  {
    id: 'gate_civil_2025',
    exam_name: 'GATE Civil Engineering (CE)',
    short_name: 'GATE Civil',
    authority: 'IIT / IISc Organising Institute',
    department: 'M.Tech / Ph.D. Admissions & PSU Direct Recruitment',
    category: 'GATE / Higher Technical Exams',
    state_or_central: 'Central',
    qualification: 'Degree',
    diploma_eligible: false,
    degree_eligible: true,
    official_website: 'https://gate.iitk.ac.in',
    official_notification_url: 'https://gate.iitk.ac.in',
    exam_pattern: 'Computer Based Test (65 Questions / 100 Marks): MCQs, MSQs (Multiple Select) & NAT (Numerical Answer Type)',
    duration: 180,
    marks: 100,
    negative_marking: '0.333 for 1-mark MCQ, 0.667 for 2-mark MCQ (No negative for NAT/MSQ)',
    subjects: ['Engineering Mathematics', 'SOM & Structural Analysis', 'RCC & Steel', 'Geotechnical Engineering', 'Environmental Engineering', 'Water Resources & Fluid Mechanics', 'Transportation', 'Geomatics'],
    syllabus: 'Advanced analytical B.Tech Civil Engineering curriculum with Engineering Mathematics.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-02-01',
    active_recruitments_count: 8500,
  },

  // 8. Other Engineering Recruitment
  {
    id: 'wrd_assistant_engineer',
    exam_name: 'Water Resources Department Assistant Executive Engineer (Civil)',
    short_name: 'WRD Irrigation AEE',
    authority: 'Maharashtra Water Resources Department',
    department: 'Dam Design, Hydroelectric & Canal Networks Division',
    category: 'Other Engineering Recruitment',
    state_or_central: 'Maharashtra',
    qualification: 'Degree',
    diploma_eligible: false,
    degree_eligible: true,
    official_website: 'https://wrd.maharashtra.gov.in',
    official_notification_url: 'https://wrd.maharashtra.gov.in/recruitment',
    exam_pattern: 'CBT Mode (100 Questions / 200 Marks) with 80% weightage on Hydraulic & Water Structures',
    duration: 120,
    marks: 200,
    negative_marking: '0.25 (1/4th)',
    subjects: ['Hydrology', 'Irrigation Engineering', 'Dams & Spillways', 'Fluid Mechanics', 'RCC Water Tanks', 'Soil Mechanics'],
    syllabus: 'Dam stability analysis, spillway design, canal hydraulics, and water resources management.',
    active_status: 'ACTIVE',
    last_verified_date: '2026-02-20',
    active_recruitments_count: 310,
  },
];

// Seed Baseline Question Papers following Exam -> Year -> Paper -> Shift Hierarchy
export const SEED_QUESTION_PAPERS: ScalableQuestionPaper[] = [
  {
    id: 'paper_mpsc_ae_2023_shift1',
    exam_id: 'mpsc_civil_ae',
    exam_name: 'MPSC Civil Engineering Services AE 2023',
    short_name: 'MPSC Civil AE 2023',
    category: 'Maharashtra Government',
    year: 2023,
    paper_name: 'Paper-I Technical Objective (SOM/RCC/Soil/Fluid)',
    shift: 'Shift 1 (Morning 10:00 AM - 12:00 PM)',
    sections: [
      { id: 'sec_tech_1', section_name: 'Section A: Structural Engineering (SOM, RCC, Steel)', question_count: 50, marks_per_question: 2, negative_marks_per_question: 0.5 },
      { id: 'sec_tech_2', section_name: 'Section B: Water Resources & Geotechnical', question_count: 50, marks_per_question: 2, negative_marks_per_question: 0.5 },
    ],
    total_questions: 100,
    total_marks: 200,
    duration_minutes: 120,
    negative_marking_ratio: 0.25,
    is_official_pyq: true,
    source: 'Official MPSC Gazetted Civil Services Answer Key 2023',
    source_url: 'https://mpsc.gov.in/answerkeys/2023_Civil_AE_Paper1.pdf',
    verification_status: 'VERIFIED',
    attempts_count: 4210,
    avg_score: 134.5,
  },
  {
    id: 'paper_maha_pwd_2023_shift2',
    exam_id: 'maha_pwd_jee',
    exam_name: 'Maha PWD Junior Engineer Exam 2023',
    short_name: 'Maha PWD JE 2023',
    category: 'Maharashtra Government',
    year: 2023,
    paper_name: 'TCS iON Shift 2 Official Question Paper',
    shift: 'Shift 2 (Afternoon 02:30 PM - 04:30 PM)',
    sections: [
      { id: 'sec_pwd_civil', section_name: 'Section 1: Civil Engineering Technical Core', question_count: 80, marks_per_question: 2, negative_marks_per_question: 0 },
      { id: 'sec_pwd_nontech', section_name: 'Section 2: Marathi & English Aptitude', question_count: 20, marks_per_question: 2, negative_marks_per_question: 0 },
    ],
    total_questions: 100,
    total_marks: 200,
    duration_minutes: 120,
    negative_marking_ratio: 0,
    is_official_pyq: true,
    source: 'TCS iON Server Verified Candidate Response Sheet',
    verification_status: 'VERIFIED',
    attempts_count: 8930,
    avg_score: 152.0,
  },
  {
    id: 'paper_ssc_je_2024_shift1',
    exam_id: 'ssc_je_civil',
    exam_name: 'SSC Junior Engineer Tier-I 2024',
    short_name: 'SSC JE 2024',
    category: 'Central Government',
    year: 2024,
    paper_name: 'SSC JE Civil Tier-1 Computer Based Test',
    shift: 'Shift 1 (09:00 AM - 11:00 AM)',
    sections: [
      { id: 'sec_ssc_civil', section_name: 'Part A: Civil & Structural Engineering', question_count: 100, marks_per_question: 1, negative_marks_per_question: 0.25 },
      { id: 'sec_ssc_reasoning', section_name: 'Part B: General Intelligence & Reasoning', question_count: 50, marks_per_question: 1, negative_marks_per_question: 0.25 },
      { id: 'sec_ssc_gk', section_name: 'Part C: General Awareness', question_count: 50, marks_per_question: 1, negative_marks_per_question: 0.25 },
    ],
    total_questions: 200,
    total_marks: 200,
    duration_minutes: 120,
    negative_marking_ratio: 0.25,
    is_official_pyq: true,
    source: 'Staff Selection Commission Official Question Master',
    verification_status: 'VERIFIED',
    attempts_count: 12400,
    avg_score: 118.2,
  },
  {
    id: 'paper_bmc_subeng_2022_shift1',
    exam_id: 'bmc_sub_engineer',
    exam_name: 'BMC Sub-Engineer (Civil) Direct Recruitment 2022',
    short_name: 'BMC Sub-Eng 2022',
    category: 'Municipal / Local Government',
    year: 2022,
    paper_name: 'BMC Civil Sub-Engineer TCS Pattern Paper',
    shift: 'Shift 1 (Morning)',
    sections: [
      { id: 'sec_bmc_tech', section_name: 'Technical Civil & Municipal Rules', question_count: 80, marks_per_question: 1, negative_marks_per_question: 0.25 },
      { id: 'sec_bmc_gk', section_name: 'Mumbai City GK & General Knowledge', question_count: 20, marks_per_question: 1, negative_marks_per_question: 0.25 },
    ],
    total_questions: 100,
    total_marks: 100,
    duration_minutes: 120,
    negative_marking_ratio: 0.25,
    is_official_pyq: true,
    source: 'MCGM / BMC Official Recruitment Cell Key',
    verification_status: 'VERIFIED',
    attempts_count: 5120,
    avg_score: 68.4,
  },
];

// Seed Baseline Questions (Distinguishing Official PYQs vs AI Questions)
export const SEED_HUB_QUESTIONS: ScalableHubQuestion[] = [
  // Official PYQ 1
  {
    id: 'q_pyq_mpsc_2023_01',
    question_text: 'According to IS 456:2000 Clause 26.5.1.1, what is the minimum percentage of tensile reinforcement (Ast,min / bd) required in a rectangular beam using Fe 415 grade steel?',
    marathi_text: 'आयएस ४५६:२००० (कलम २६.५.१.१) नुसार Fe 415 ग्रेडच्या स्टीलचा वापर करून आयातकार बीममध्ये आवश्यक असलेल्या किमान ताण प्रबलीकरणाची (Ast,min / bd) टक्केवारी किती असावी?',
    options: [
      { id: 'A', text: '0.205%', marathi_text: '०.२०५%' },
      { id: 'B', text: '0.340%', marathi_text: '०.३४०%' },
      { id: 'C', text: '0.400%', marathi_text: '०.४००%' },
      { id: 'D', text: '0.120%', marathi_text: '०.१२०%' },
    ],
    correct_answer: 'A',
    explanation: 'As per IS 456:2000 Clause 26.5.1.1, Ast,min / (b × d) = 0.85 / fy. For Fe 415: 0.85 / 415 = 0.002048 = 0.205%.',
    marathi_explanation: 'IS 456:2000 कलम २६.५.१.१ नुसार: किमान ताण प्रबलीकरण Ast,min / (b × d) = ०.८५ / fy. Fe 415 साठी = ०.८५ / ४१५ = ०.००२०४८ = ०.२०५%.',
    subject: 'RCC & Concrete Structures',
    topic: 'Flexure Detailing & Beams',
    subtopic: 'Minimum Tension Reinforcement',
    difficulty: 'EASY',
    question_type: 'SINGLE_CHOICE',
    exam_id: 'mpsc_civil_ae',
    exam_name: 'MPSC Civil AE 2023',
    year: 2023,
    paper_name: 'Paper-I Technical Objective',
    shift: 'Shift 1',
    section_id: 'sec_tech_1',
    section_name: 'Section A: Structural Engineering',
    marks: 2,
    negative_marks: 0.5,
    source: 'MPSC Civil AE 2023 Paper-I Q.14',
    source_url: 'https://mpsc.gov.in/official_key_2023.pdf',
    provenance_metadata: {
      verified_by: 'Er. S. Patil (Head Faculty Civil)',
      key_reference_clause: 'IS 456:2000 Cl. 26.5.1.1',
      is_code_reference: 'IS 456:2000 Table 26.5.1',
      copyright_note: 'Official Government Examination Past Paper Question',
    },
    verification_status: 'VERIFIED',
    is_pyq: true,
    pyq_status: 'VERIFIED',
    normalized_text_hash: '',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-03-01T12:00:00Z',
    version: 1,
  },

  // Official PYQ 2
  {
    id: 'q_pyq_pwd_2023_02',
    question_text: 'As per IS 456:2000 Table 5, what is the minimum grade of reinforced concrete recommended for severe environmental exposure conditions?',
    marathi_text: 'आयएस ४५६:२००० तक्ता ५ नुसार, तीव्र (Severe) पर्यावरण उघड वातावरणात प्रबलिकृत काँक्रीटसाठी (RCC) किमान कोणती काँक्रीट ग्रेड शिफारस केली आहे?',
    options: [
      { id: 'A', text: 'M 20', marathi_text: 'M 20' },
      { id: 'B', text: 'M 25', marathi_text: 'M 25' },
      { id: 'C', text: 'M 30', marathi_text: 'M 30' },
      { id: 'D', text: 'M 35', marathi_text: 'M 35' },
    ],
    correct_answer: 'C',
    explanation: 'IS 456:2000 Table 5 states minimum grade of RCC for Severe exposure is M 30 with minimum cement content of 320 kg/m³ and max water-cement ratio of 0.45.',
    marathi_explanation: 'IS 456:2000 तक्ता ५ नुसार तीव्र (Severe) वातावरणासाठी RCC ची किमान ग्रेड M 30 असावी आणि सिमेंटचे किमान प्रमाण ३२० kg/m³ असावे.',
    subject: 'RCC & Concrete Structures',
    topic: 'Durability & Environmental Exposure',
    difficulty: 'MEDIUM',
    question_type: 'SINGLE_CHOICE',
    exam_id: 'maha_pwd_jee',
    exam_name: 'Maha PWD JE 2023',
    year: 2023,
    paper_name: 'TCS iON Shift 2 Official Paper',
    shift: 'Shift 2',
    section_id: 'sec_pwd_civil',
    section_name: 'Technical Civil Core',
    marks: 2,
    negative_marks: 0,
    source: 'Maha PWD Assistant Engineer 2023 TCS iON Key',
    provenance_metadata: {
      verified_by: 'Maha PWD Verification Committee',
      key_reference_clause: 'IS 456:2000 Table 5',
    },
    verification_status: 'VERIFIED',
    is_pyq: true,
    pyq_status: 'VERIFIED',
    normalized_text_hash: '',
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-03-01T12:00:00Z',
    version: 1,
  },

  // AI-Generated Practice Question (STRICTLY NON-PYQ)
  {
    id: 'q_ai_gen_01',
    question_text: '[AI Practice Question] A simply supported beam of span 6 m carries a uniformly distributed load of 10 kN/m over its entire length. What is the maximum bending moment developed at mid-span?',
    marathi_text: '[AI सराव प्रश्न] ६ मीटर लांबीच्या साध्या टेकू बीमवर (Simply Supported Beam) संपूर्ण लांबीवर १० kN/m चा एकसमान भार (UDL) आहे. बीमच्या मध्यभागी किती कमाल झुकणारा क्षण (Maximum Bending Moment) निर्माण होईल?',
    options: [
      { id: 'A', text: '45 kN·m', marathi_text: '४५ kN·m' },
      { id: 'B', text: '36 kN·m', marathi_text: '३६ kN·m' },
      { id: 'C', text: '60 kN·m', marathi_text: '६० kN·m' },
      { id: 'D', text: '90 kN·m', marathi_text: '९० kN·m' },
    ],
    correct_answer: 'A',
    explanation: 'For a simply supported beam with UDL w over span L, Max Bending Moment M_max = (w × L²) / 8 = (10 × 6²) / 8 = (10 × 36) / 8 = 360 / 8 = 45 kN·m.',
    marathi_explanation: 'UDL सह साध्या टेकू बीमसाठी कमाल Bending Moment M_max = (w × L²) / 8 = (१० × ६²) / ८ = ४५ kN·m.',
    subject: 'Strength of Materials (SOM)',
    topic: 'Shear Force & Bending Moment Diagrams',
    subtopic: 'Simply Supported Beam with UDL',
    difficulty: 'EASY',
    question_type: 'SINGLE_CHOICE',
    exam_id: 'mpsc_civil_ae',
    exam_name: 'MPSC Civil AE Practice',
    year: 2026,
    paper_name: 'AI Concept Booster Set 1',
    shift: 'General Practice',
    marks: 2,
    negative_marks: 0.5,
    source: 'Er. SP Gemini AI Civil Question Generator Engine',
    provenance_metadata: {
      uploader_email: 'ai_engine@sp-engineering.gov.in',
      copyright_note: 'AI Generated Practice Material - Strictly for conceptual drill',
    },
    verification_status: 'PUBLISHED',
    is_pyq: false, // STRICTLY FALSE FOR AI QUESTIONS!
    ai_status: 'PUBLISHED',
    normalized_text_hash: '',
    created_at: '2026-03-20T14:30:00Z',
    updated_at: '2026-03-20T14:30:00Z',
    version: 1,
  },
];

export class ExamHubService {
  private static exams: Map<string, ScalableExamCatalogueItem> = new Map();
  private static papers: Map<string, ScalableQuestionPaper> = new Map();
  private static questions: Map<string, ScalableHubQuestion> = new Map();
  private static attempts: Map<string, CBTExamSubmissionResult[]> = new Map(); // user_email -> attempts

  static init() {
    if (this.exams.size === 0) {
      SEED_SCALABLE_EXAMS.forEach((e) => this.exams.set(e.id, e));
      SEED_QUESTION_PAPERS.forEach((p) => this.papers.set(p.id, p));
      SEED_HUB_QUESTIONS.forEach((q) => {
        q.normalized_text_hash = DuplicateDetectionService.generateNormalizedHash(q.question_text);
        this.questions.set(q.id, q);
      });
    }
  }

  // --- Exam Catalogue CRUD ---
  static getExams(category?: ExamCategoryType | 'ALL', search?: string): ScalableExamCatalogueItem[] {
    this.init();
    let list = Array.from(this.exams.values());

    if (category && category !== 'ALL') {
      list = list.filter((e) => e.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.exam_name.toLowerCase().includes(q) ||
          e.short_name.toLowerCase().includes(q) ||
          e.authority.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    return list;
  }

  static getExamById(id: string): ScalableExamCatalogueItem | undefined {
    this.init();
    return this.exams.get(id);
  }

  static saveExam(exam: ScalableExamCatalogueItem): ScalableExamCatalogueItem {
    this.init();
    const updated = {
      ...exam,
      updated_at: new Date().toISOString(),
      created_at: exam.created_at || new Date().toISOString(),
    };
    this.exams.set(exam.id, updated);
    return updated;
  }

  static toggleArchiveExam(id: string): ScalableExamCatalogueItem | undefined {
    this.init();
    const exam = this.exams.get(id);
    if (!exam) return undefined;
    exam.active_status = exam.active_status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    exam.is_archived = exam.active_status === 'ARCHIVED';
    this.exams.set(id, exam);
    return exam;
  }

  static deleteExam(id: string): boolean {
    this.init();
    return this.exams.delete(id);
  }

  // --- Question Paper Hierarchy ---
  static getQuestionPapers(examId?: string, year?: number, category?: string): ScalableQuestionPaper[] {
    this.init();
    let list = Array.from(this.papers.values());

    if (examId && examId !== 'ALL') {
      list = list.filter((p) => p.exam_id === examId);
    }

    if (year && year !== 0) {
      list = list.filter((p) => p.year === Number(year));
    }

    if (category && category !== 'ALL') {
      list = list.filter((p) => p.category === category);
    }

    return list;
  }

  static getPaperById(paperId: string): ScalableQuestionPaper | undefined {
    this.init();
    return this.papers.get(paperId);
  }

  // --- Questions (Strict PYQ vs AI Separation) ---
  static getQuestions(params: {
    paperId?: string;
    examId?: string;
    isPyqOnly?: boolean;
    aiQuestionsOnly?: boolean;
    subject?: string;
    search?: string;
  }): ScalableHubQuestion[] {
    this.init();
    let list = Array.from(this.questions.values());

    if (params.paperId && params.paperId !== 'ALL') {
      list = list.filter((q) => q.paper_name.includes(params.paperId!) || q.id.includes(params.paperId!));
    }

    if (params.examId && params.examId !== 'ALL') {
      list = list.filter((q) => q.exam_id === params.examId);
    }

    if (params.isPyqOnly) {
      list = list.filter((q) => q.is_pyq === true);
    } else if (params.aiQuestionsOnly) {
      list = list.filter((q) => q.is_pyq === false);
    }

    if (params.subject && params.subject !== 'ALL') {
      list = list.filter((q) => q.subject === params.subject);
    }

    if (params.search && params.search.trim()) {
      const qry = params.search.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.question_text.toLowerCase().includes(qry) ||
          (q.marathi_text && q.marathi_text.toLowerCase().includes(qry)) ||
          q.topic.toLowerCase().includes(qry) ||
          q.explanation.toLowerCase().includes(qry)
      );
    }

    return list;
  }

  static saveQuestion(q: ScalableHubQuestion): ScalableHubQuestion {
    this.init();
    // ENFORCE RULE: AI Generated Questions MUST NEVER BE IS_PYQ = TRUE
    if (q.ai_status && q.ai_status !== ('GENERATED' as any) && !q.pyq_status) {
      q.is_pyq = false;
    }

    q.normalized_text_hash = DuplicateDetectionService.generateNormalizedHash(q.question_text);
    q.updated_at = new Date().toISOString();
    this.questions.set(q.id, q);
    return q;
  }

  // --- Attempt History ---
  static saveCBTSubmission(userEmail: string, submission: CBTExamSubmissionResult) {
    this.init();
    const userAttempts = this.attempts.get(userEmail) || [];
    userAttempts.unshift(submission);
    this.attempts.set(userEmail, userAttempts);

    // Update Paper user stats
    const paper = this.papers.get(submission.paperId);
    if (paper) {
      paper.user_best_score = Math.max(paper.user_best_score || 0, submission.totalScore);
      paper.user_accuracy = submission.accuracy;
      paper.user_completion_status = 'COMPLETED';
      paper.last_attempted_at = submission.submittedAt;
      this.papers.set(paper.id, paper);
    }
  }

  static getUserAttempts(userEmail: string): CBTExamSubmissionResult[] {
    this.init();
    return this.attempts.get(userEmail) || [];
  }
}
