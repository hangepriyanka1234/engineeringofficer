import { DailyCapsuleItem, InAppNotification } from "../src/types";

export class ServerCapsuleEngine {
  private static dailyCapsules: Map<string, DailyCapsuleItem> = new Map();
  private static userNotifications: Map<string, InAppNotification[]> = new Map();

  static getTodayCapsule(): DailyCapsuleItem {
    const today = new Date().toISOString().split("T")[0];
    if (this.dailyCapsules.has(today)) {
      return this.dailyCapsules.get(today)!;
    }

    const capsule: DailyCapsuleItem = {
      id: `capsule-${today}`,
      dateStr: today,
      conceptTitle: "Bending Moment & Shear Force at Point of Contraflexure",
      conceptSubject: "Strength of Materials",
      conceptBody: "A point of contraflexure (or inflection) in a structural beam is the section where the Bending Moment changes its sign (from sagging positive to hogging negative or vice versa). At this point, Bending Moment = 0, but Shear Force is NOT necessarily zero.",
      formulaId: "f-som-02",
      formulaSnapshot: {
        title: "Bending Stress Equation (Euler-Bernoulli)",
        expression: "M / I = \\sigma / y = E / R",
        isCode: "IS 800:2007 Cl 8.2",
      },
      mcqs: [
        {
          id: "capsule-mcq-1",
          question: "At the point of contraflexure in an overhanging beam, which of the following is strictly zero?",
          options: ["Shear force", "Bending moment", "Deflection", "Slope"],
          correctIndex: 1,
          explanation: "By definition, the bending moment changes sign through zero at a point of contraflexure.",
          isCode: "Mechanics of Materials Standard Theory",
        },
        {
          id: "capsule-mcq-2",
          question: "What is the minimum 28-day characteristic compressive strength for reinforced concrete exposed to 'Severe' environmental condition as per IS 456:2000 Table 5?",
          options: ["M 20", "M 25", "M 30", "M 35"],
          correctIndex: 2,
          explanation: "IS 456 Table 5 specifies minimum grade for RCC: Mild = M20, Moderate = M25, Severe = M30, Very Severe = M35, Extreme = M40.",
          isCode: "IS 456:2000 Table 5",
        },
        {
          id: "capsule-mcq-3",
          question: "In a compaction curve, zero air voids line corresponds to degree of saturation (Sr) equal to:",
          options: ["0%", "50%", "95%", "100%"],
          correctIndex: 3,
          explanation: "Zero air voids line represents theoretical maximum dry density when soil is 100% saturated (Sr = 1.0 or 100%).",
          isCode: "IS 2720 Part 7",
        },
      ],
      pyqHighlight: {
        examName: "Maha PWD JE 2019",
        year: 2019,
        question: "For Fe 415 grade steel in RCC beam design, the limiting depth of neutral axis (xu,max) is:",
        options: ["0.53 d", "0.48 d", "0.46 d", "0.44 d"],
        correctIndex: 1,
        solution: "xu,max/d = 700 / (1100 + 0.87*415) = 0.479 ≈ 0.48 d as per IS 456:2000 Clause 38.1.",
      },
      numericalChallenge: {
        problemStatement: "A cantilever beam of length 3m carries a point load of 15 kN at its free end. Find the maximum bending moment and maximum deflection if EI = 8000 kNm².",
        formula: "M_max = P * L, \\delta_max = (P * L^3) / (3 * EI)",
        answer: "M_max = 45 kNm (hogging at fixed end), delta_max = 16.875 mm",
        steps: [
          "1. Maximum Moment occurs at fixed support: M_max = 15 kN * 3m = 45 kNm.",
          "2. Maximum Deflection at free end: delta = (15 * 3^3) / (3 * 8000) = 405 / 24000 = 0.016875 m = 16.88 mm.",
        ],
      },
      siteEngineerTip: "While casting columns, ensure concrete is dropped from a height NOT exceeding 1.5 meters to prevent coarse aggregate segregation (IS 456 Cl 13.2).",
      examAlertNote: "Maharashtra Water Resources Dept (WRD) exam notification verification completed. Review syllabus weightage for Fluid Mechanics & Irrigation.",
    };

    this.dailyCapsules.set(today, capsule);
    return capsule;
  }

  static getNotifications(userEmail: string): InAppNotification[] {
    const list = this.userNotifications.get(userEmail) || [
      {
        id: "notif-01",
        title: "Daily Civil Capsule Ready",
        message: "Your daily Civil Engineering capsule with 3 MCQs, 1 PYQ, and SOM formula is live!",
        category: "study_reminder",
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: "notif-02",
        title: "Spaced Revision Due: 3 Questions",
        message: "You have 3 mistake notebook questions scheduled for SM-2 interval revision today.",
        category: "revision_due",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: "notif-03",
        title: "Maha PWD JE Recruitment Update",
        message: "Official notification source link verified for PWD Civil Engineering branch.",
        category: "exam_alert",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ];
    return list;
  }

  static markNotificationRead(userEmail: string, notifId: string) {
    const list = this.getNotifications(userEmail);
    const updated = list.map((n) => (n.id === notifId ? { ...n, read: true } : n));
    this.userNotifications.set(userEmail, updated);
    return updated;
  }
}
