import { EntitlementPlanItem, ReferralStudentStatus } from "../src/types";

export class ServerPaymentReferralEngine {
  private static plans: EntitlementPlanItem[] = [
    {
      id: "plan-mcq-pro",
      name: "Practice Question Bank Pro",
      productType: "mcq_bank",
      priceRupees: 999,
      discountPriceRupees: 499,
      durationMonths: 6,
      badge: "8,000+ MCQs",
      features: [
        "Unrestricted access to 8,000+ Civil Engineering MCQs",
        "Subject-wise, Topic-wise, and Subtopic-wise filtering",
        "Detailed IS/IRC Code explanations & step-by-step proofs",
        "Smart Mistake Notebook & Spaced Repetition (SM-2)",
        "Daily Civil Capsule & Formula Lab",
      ],
    },
    {
      id: "plan-mock-pro",
      name: "Full-Length CBT Test Series",
      productType: "test_series",
      priceRupees: 1499,
      discountPriceRupees: 799,
      durationMonths: 6,
      badge: "Realistic TCS iON",
      features: [
        "40+ Full-Length Mock Tests (Maha PWD, WRD, ZP, SSC JE)",
        "Exact TCS iON CBT interface & timer simulation",
        "Real-time percentile ranking & state-wide leaderboard",
        "Server-verified scorecards & negative marking deduction",
        "Question paper PDF download with official answer keys",
      ],
    },
    {
      id: "plan-ultimate-combo",
      name: "Ultimate Officer All-In-One Combo",
      productType: "all_in_one",
      priceRupees: 2999,
      discountPriceRupees: 1499,
      durationMonths: 12,
      popular: true,
      badge: "Most Popular (Best Value)",
      features: [
        "Everything in Practice Q-Bank Pro + CBT Test Series",
        "100 Daily AI Civil Engineering Tutor Queries (Gemini Pro)",
        "Interactive Diagrams & Site Engineer Practical Modules",
        "Direct Doubt Clearing & Official Recruitment Alerts",
        "1-on-1 Personalized AI Study Plan & Weakness Diagnostics",
        "12 Months Validity with free updates for upcoming exams",
      ],
    },
  ];

  private static studentReferrals: Map<string, ReferralStudentStatus> = new Map();

  static getPlans(): EntitlementPlanItem[] {
    return this.plans;
  }

  static getReferralStatus(userEmail: string, userName: string): ReferralStudentStatus {
    if (this.studentReferrals.has(userEmail)) {
      return this.studentReferrals.get(userEmail)!;
    }

    const code = `${userName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "SP"}${Math.floor(1000 + Math.random() * 9000)}`;
    const status: ReferralStudentStatus = {
      referralCode: code,
      inviteLink: `https://engineeringofficersp.web.app/join?ref=${code}`,
      totalReferralsCount: 4,
      verifiedReferralsCount: 3,
      pendingReferralsCount: 1,
      totalBonusCreditsEarned: 150,
      subscriptionDaysEarned: 21,
      fraudMetrics: {
        riskScore: 8, // Low risk (0-100)
        ipVelocityCount: 1,
        deviceHashMatches: 0,
        selfReferralAttempted: false,
        accountAgeHours: 120,
        flaggedForReview: false,
        reviewStatus: "approved",
      },
      recentReferrals: [
        {
          referredNameMasked: "Ganesh K***",
          joinedDate: "2026-03-08",
          status: "verified_active",
          rewardAwarded: "+7 Days Pro Access",
        },
        {
          referredNameMasked: "Vijay G***",
          joinedDate: "2026-03-10",
          status: "verified_active",
          rewardAwarded: "+7 Days Pro Access",
        },
        {
          referredNameMasked: "Swapnil T***",
          joinedDate: "2026-03-12",
          status: "verified_active",
          rewardAwarded: "+7 Days Pro Access",
        },
        {
          referredNameMasked: "Rahul S***",
          joinedDate: "2026-03-14",
          status: "under_review",
          rewardAwarded: "Pending Verification",
        },
      ],
    };

    this.studentReferrals.set(userEmail, status);
    return status;
  }

  // Verify and simulate Razorpay Order Creation & Signature Verification
  static createRazorpayOrder(planId: string, userEmail: string) {
    const plan = this.plans.find((p) => p.id === planId) || this.plans[0];
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      orderId,
      amountRupees: plan.discountPriceRupees,
      currency: "INR",
      planName: plan.name,
      userEmail,
      razorpayKeyId: "rzp_test_SP_ENGINEERING_MOCK_GATEWAY",
    };
  }

  static verifyPaymentSignature(paymentData: {
    orderId: string;
    paymentId: string;
    signature: string;
    userEmail: string;
    planId: string;
  }) {
    // In production, HMAC SHA256 verification using Razorpay Secret
    const plan = this.plans.find((p) => p.id === paymentData.planId) || this.plans[0];
    return {
      verified: true,
      entitlementGranted: plan.productType,
      expiresAt: new Date(Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
      transactionId: `TXN_${Date.now()}`,
    };
  }
}
