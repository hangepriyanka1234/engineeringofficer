import { VerifiedRecruitmentNotice } from "../src/types";

export class ServerRecruitmentEngine {
  private static notices: VerifiedRecruitmentNotice[] = [
    {
      id: "rec-pwd-2026",
      title: "Maharashtra Public Works Department (Maha PWD) Junior Engineer (Civil) Recruitment",
      authority: "Government of Maharashtra Public Works Department",
      examCategory: "maha_pwd",
      categoryLabel: "Maharashtra PWD",
      postName: "Junior Engineer (Civil) - Group B (Non-Gazetted)",
      totalVacanciesVerified: 2109,
      vacanciesCategoryBreakdown: {
        Open: 640,
        OBC: 390,
        EWS: 210,
        SC: 275,
        ST: 150,
        "VJ/NT": 444,
      },
      notificationDate: "2026-02-15",
      applicationStartDate: "2026-03-01",
      applicationEndDate: "2026-04-15",
      examDatesEstimated: "Expected June 2026 (CBT Mode)",
      officialNotificationPdfUrl: "https://pwd.maharashtra.gov.in/recruitment/je-civil-2026-advt.pdf",
      officialPortalUrl: "https://pwd.maharashtra.gov.in",
      educationalEligibility: "Diploma in Civil Engineering or B.E./B.Tech in Civil Engineering from a recognized University / Board.",
      ageLimit: "18 to 38 years (Relaxation up to 43 years for Reserved Categories).",
      applicationFee: "₹ 1,000 (Open) / ₹ 900 (Reserved Categories)",
      payScale: "Level S-14 (₹ 38,600 - ₹ 1,22,800) + DA + HRA",
      isVerified: true,
      verifiedByAdmin: "Er. SP (Chief Administrative Verification)",
      verificationTimestamp: "2026-03-10T11:00:00Z",
      status: "active",
      keyHighlights: [
        "200 Marks CBT Exam (100 Questions): 140 Marks Civil Engineering Technical + 60 Marks Non-Tech (Marathi, English, GS, Reasoning).",
        "No negative marking in preliminary CBT phase as per government gazette.",
        "Compulsory Marathi language proficiency test at 10th standard level.",
      ],
    },
    {
      id: "rec-wrd-2026",
      title: "Maharashtra Water Resources Department (WRD / Jalsampada) Assistant Engineer & JE Recruitment",
      authority: "Water Resources Department, Govt of Maharashtra",
      examCategory: "maha_wrd",
      categoryLabel: "Maharashtra WRD (Jalsampada)",
      postName: "Assistant Engineer (Grade-II) & Junior Engineer (Civil)",
      totalVacanciesVerified: 1470,
      notificationDate: "2026-02-20",
      applicationStartDate: "2026-03-10",
      applicationEndDate: "2026-04-20",
      examDatesEstimated: "July 2026 (TCS / IBPS Pattern)",
      officialNotificationPdfUrl: "https://wrd.maharashtra.gov.in/advt-wrd-civil-2026.pdf",
      officialPortalUrl: "https://wrd.maharashtra.gov.in",
      educationalEligibility: "Degree in Civil Engineering for AE-II; Diploma/Degree in Civil Engineering for JE.",
      ageLimit: "18 to 38 years (43 for backward classes)",
      applicationFee: "₹ 1,000 (General) / ₹ 900 (Backward)",
      payScale: "AE-II: Level S-15 (₹ 41,800 - ₹ 1,32,300), JE: Level S-14",
      isVerified: true,
      verifiedByAdmin: "Er. SP (Admin Verification Team)",
      verificationTimestamp: "2026-03-11T09:30:00Z",
      status: "active",
      keyHighlights: [
        "High weightage on Fluid Mechanics, Open Channel Flow, Dam Engineering, Hydrology & Irrigation Design.",
        "Computer-based Test administered via TCS iON portal.",
      ],
    },
    {
      id: "rec-ssc-je-2026",
      title: "Staff Selection Commission Junior Engineer (Civil) Examination (SSC JE)",
      authority: "Staff Selection Commission (Govt of India)",
      examCategory: "ssc_je",
      categoryLabel: "SSC JE (Central)",
      postName: "Junior Engineer (Civil) - CPWD, MES, Border Roads Org (BRO), CWC",
      totalVacanciesVerified: 1324,
      notificationDate: "2026-01-25",
      applicationStartDate: "2026-02-01",
      applicationEndDate: "2026-03-15",
      examDatesEstimated: "Paper-I: May 2026, Paper-II: August 2026",
      officialNotificationPdfUrl: "https://ssc.gov.in/notice-ssc-je-2026.pdf",
      officialPortalUrl: "https://ssc.gov.in",
      educationalEligibility: "Degree in Civil Engineering or 3-year Diploma in Civil with 2 years experience for CPWD/MES.",
      ageLimit: "Up to 30 years (CPWD) / 32 years (CWC) as on reference date.",
      applicationFee: "₹ 100 (Exempt for Women/SC/ST/PwD)",
      payScale: "Level-6 (₹ 35,400 - ₹ 1,12,400)",
      isVerified: true,
      verifiedByAdmin: "Central Exam Coordinator",
      verificationTimestamp: "2026-02-05T12:00:00Z",
      status: "active",
      keyHighlights: [
        "Paper-I: 200 Marks (100 Civil Tech + 50 General Intelligence & Reasoning + 50 General Awareness). Negative marking: 0.25 marks per wrong answer.",
        "Paper-II: 300 Marks Computer Based Test (100 questions × 3 marks, with 1 mark negative penalty).",
      ],
    },
    {
      id: "rec-bmc-2026",
      title: "Brihanmumbai Municipal Corporation (BMC) Sub-Engineer (Civil) Recruitment",
      authority: "Municipal Corporation of Greater Mumbai (MCGM / BMC)",
      examCategory: "municipal",
      categoryLabel: "BMC / MCGM Mumbai",
      postName: "Sub-Engineer (Civil) & Executive Engineer Cadre",
      totalVacanciesVerified: 690,
      notificationDate: "2026-03-01",
      applicationStartDate: "2026-03-15",
      applicationEndDate: "2026-04-30",
      examDatesEstimated: "August 2026",
      officialNotificationPdfUrl: "https://portal.mcgm.gov.in/recruitment/sub-engineer-civil-2026.pdf",
      officialPortalUrl: "https://portal.mcgm.gov.in",
      educationalEligibility: "Degree in Civil / Construction Engineering from recognized AICTE institution.",
      ageLimit: "18 to 38 years.",
      applicationFee: "₹ 1,000",
      payScale: "Level M-17 (₹ 41,800 - ₹ 1,32,300)",
      isVerified: true,
      verifiedByAdmin: "Er. SP",
      verificationTimestamp: "2026-03-12T16:00:00Z",
      status: "active",
      keyHighlights: [
        "Urban infrastructure, water distribution network, stormwater drains, and building development regulations (DCR 2034).",
      ],
    },
  ];

  static getNotices(filterCategory?: string): VerifiedRecruitmentNotice[] {
    if (!filterCategory || filterCategory === "all") {
      return this.notices;
    }
    return this.notices.filter((n) => n.examCategory === filterCategory);
  }

  static getNoticeById(id: string): VerifiedRecruitmentNotice | null {
    return this.notices.find((n) => n.id === id) || null;
  }
}
