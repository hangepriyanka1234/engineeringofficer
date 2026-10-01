import crypto from 'crypto';
import {
  ProductId,
  PlanRecord,
  CouponRecord,
  PaymentOrderRecord,
  PaymentTransactionRecord,
  UserEntitlementRecord,
  RefundRecord,
  PaymentAuditLogRecord,
  PaymentDashboardStats,
} from '../src/types/payment';

export class ServerPaymentEngine {
  private static razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_SP_CIVIL_OFFICER_2026';
  private static razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_SP_CIVIL_OFFICER_SEC2026';
  private static webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_sp_engineering_payment_webhook';

  // 1. In-memory master stores
  private static plans: Map<string, PlanRecord> = new Map();
  private static coupons: Map<string, CouponRecord> = new Map();
  private static orders: Map<string, PaymentOrderRecord> = new Map();
  private static transactions: Map<string, PaymentTransactionRecord> = new Map();
  private static entitlements: Map<string, UserEntitlementRecord[]> = new Map(); // key: userId
  private static refunds: Map<string, RefundRecord> = new Map();
  private static auditLogs: PaymentAuditLogRecord[] = [];
  private static processedWebhookEvents: Set<string> = new Set();
  private static aiUsageRecords: Map<string, Array<{ date: string; tokens: number; costInr: number }>> = new Map();

  static {
    this.seedDefaultPlans();
    this.seedDefaultCoupons();
    this.seedSampleTransactions();
  }

  // Seed Default 8 Plans matching user PDF spec
  private static seedDefaultPlans() {
    const defaultPlans: PlanRecord[] = [
      {
        id: 'plan_free_starter',
        name: 'Free Starter Access',
        slug: 'free-starter',
        description: 'Standard access for civil engineering aspirants with sample questions & demo test.',
        price: 0,
        original_price: 0,
        currency: 'INR',
        duration: 365,
        duration_unit: 'days',
        billing_type: 'FREE',
        product_type: 'single_item',
        active: true,
        featured: false,
        display_order: 1,
        included_products: ['FORMULA_LAB'],
        ai_daily_limit: 5,
        ai_monthly_limit: 100,
        question_access_limit: 20,
        test_access_limit: 1,
        video_access: false,
        badge: 'Free Forever',
        features: [
          '20 Daily Practice Questions from Question Bank',
          'Selected Sample PYQs from 2021-2023',
          '1 Full Demo TCS iON CBT Mock Test',
          'Basic IS 456 & Formula Lab Quick Reference',
          'Basic Recruitment Notice Alerts',
          '5 Daily AI Tutor Queries',
        ],
      },
      {
        id: 'plan_mcq_master',
        name: '₹299 Civil Officer MCQ & Full Test Pass',
        slug: 'mcq-master-299',
        description: 'Complete 20,000+ Civil Engineering MCQs, Official Exam PYQs, CBT Mock Tests, IS Codes & AI Tutor.',
        price: 299,
        original_price: 999,
        currency: 'INR',
        duration: 12,
        duration_unit: 'months',
        billing_type: 'ONE_TIME',
        product_type: 'mcq_bank',
        active: true,
        featured: true,
        display_order: 1,
        included_products: ['MCQ_BANK', 'PYQ_BANK', 'TEST_SERIES', 'FORMULA_LAB', 'AI_PRO'],
        ai_daily_limit: 50,
        ai_monthly_limit: 1000,
        question_access_limit: -1, // unlimited
        test_access_limit: -1, // unlimited
        video_access: true,
        badge: '🔥 ₹299 Master Plan',
        features: [
          'Unrestricted Access to 20,000+ Civil Engineering MCQs',
          'All Maharashtra & Central PYQs (MPSC MES, WRD, PWD, BMC, ZP, SSC JE)',
          'Full-Length TCS iON CBT Mock Tests with Instant Rank & Solution',
          'IS 456, IS 800, IRC & NBC Codal Clause References & Solvers',
          'Personal Mistake Notebook with SM-2 Spaced Repetition',
          'Formula Lab, Engineering Calculators & AI Step-by-Step Explanations',
        ],
      },
      {
        id: 'plan_pyq_master',
        name: 'Plan B — PYQ Master',
        slug: 'pyq-master',
        description: 'Exam-wise & Year-wise Civil Engineering Previous Year Questions with verified official metadata.',
        price: 499,
        original_price: 999,
        currency: 'INR',
        duration: 6,
        duration_unit: 'months',
        billing_type: 'ONE_TIME',
        product_type: 'pyq_bank',
        active: true,
        featured: false,
        display_order: 3,
        included_products: ['PYQ_BANK', 'FORMULA_LAB'],
        ai_daily_limit: 15,
        ai_monthly_limit: 300,
        question_access_limit: -1,
        test_access_limit: 1,
        video_access: false,
        badge: '15 Years PYQs',
        features: [
          'Complete 2011-2024 Exam-wise & Year-wise PYQ Bank',
          'MPSC Civil, Maha PWD, WRD, ZP, BMC & SSC JE Coverage',
          'Faculty-Verified Step-by-Step Mathematical Derivations',
          'PYQ Practice Mode with Shift-Wise Filters',
          'Official Answer Keys with Ambiguity Notes',
          'Formula Lab & Engineering Calculator Suite Included',
        ],
      },
      {
        id: 'plan_test_series',
        name: 'Plan C — Test Series Pro',
        slug: 'test-series',
        description: 'Subject tests, topic tests, full-length tests & TCS iON timed test series with negative marking.',
        price: 799,
        original_price: 1499,
        currency: 'INR',
        duration: 6,
        duration_unit: 'months',
        billing_type: 'ONE_TIME',
        product_type: 'test_series',
        active: true,
        featured: true,
        display_order: 4,
        included_products: ['TEST_SERIES', 'FULL_TESTS', 'FORMULA_LAB'],
        ai_daily_limit: 20,
        ai_monthly_limit: 400,
        question_access_limit: -1,
        test_access_limit: -1, // unlimited tests
        video_access: false,
        badge: 'Most Popular',
        features: [
          '50+ Full-Length Mock Tests & 120+ Subject/Topic Tests',
          'Exact TCS iON CBT Exam Interface Simulation',
          'Server-Side Verified Scoring & 0.25/0.50 Negative Marking',
          'State-Wide Percentile Ranking & Accuracy Heatmaps',
          'Complete Test History & Question-by-Question Time Audit',
          'Formula Lab & Engineering Calculator Suite Included',
        ],
      },
      {
        id: 'plan_ai_study_pro',
        name: 'Plan D — AI Study Pro',
        slug: 'ai-study-pro',
        description: 'Personalized Ask AI doubt solving, concept explanation, smart revision & study planning.',
        price: 599,
        original_price: 1199,
        currency: 'INR',
        duration: 3,
        duration_unit: 'months',
        billing_type: 'ONE_TIME',
        product_type: 'ai_pro',
        active: true,
        featured: false,
        display_order: 5,
        included_products: ['AI_PRO', 'STUDY_PLANNER', 'FORMULA_LAB'],
        ai_daily_limit: 150,
        ai_monthly_limit: 3000,
        question_access_limit: 50,
        test_access_limit: 2,
        video_access: false,
        badge: 'Gemini 2.5 Flash',
        features: [
          '150 Daily AI Civil Engineering Tutor Queries',
          'Instant IS Code Derivation & Numerical Step Solver',
          'Personalized Dynamic Study Planner & Weekly Targets',
          'Smart Revision Assistant based on Weak Areas',
          'Exam Strategy & Subject Weightage Diagnostics',
          'Formula Lab & Engineering Calculator Suite Included',
        ],
      },
      {
        id: 'plan_video_library',
        name: 'Plan E — Video / Learning Library',
        slug: 'video-learning-library',
        description: 'Organized Civil Engineering topic masterclasses, practical site videos & resource packs.',
        price: 699,
        original_price: 1299,
        currency: 'INR',
        duration: 6,
        duration_unit: 'months',
        billing_type: 'ONE_TIME',
        product_type: 'video_library',
        active: true,
        featured: false,
        display_order: 6,
        included_products: ['VIDEO_LIBRARY', 'FORMULA_LAB'],
        ai_daily_limit: 10,
        ai_monthly_limit: 200,
        question_access_limit: 50,
        test_access_limit: 2,
        video_access: true,
        badge: 'Visual Masterclasses',
        features: [
          'High-Yield Concept Masterclass Videos (SOM, RCC, Steel, Geo)',
          'Site Engineer Practical Execution & Field Testing Videos',
          'Curated Topic-wise Reference Video Notes',
          'Downloadable Lecture Summaries & Formula Cheat Sheets',
          'High Definition Fast Streaming with Speed Controls',
          'Formula Lab & Engineering Calculator Suite Included',
        ],
      },
      {
        id: 'plan_engineering_pro_combo',
        name: 'Plan F — Engineering Pro Combo',
        slug: 'engineering-pro-combo',
        description: 'All-inclusive ultimate officer bundle: MCQ Master + PYQ Master + Test Series + AI Pro + Videos + Formula Lab.',
        price: 1499,
        original_price: 3999,
        currency: 'INR',
        duration: 12,
        duration_unit: 'months',
        billing_type: 'ONE_TIME',
        product_type: 'bundle',
        active: true,
        featured: true,
        display_order: 7,
        included_products: [
          'MCQ_BANK',
          'PYQ_BANK',
          'TEST_SERIES',
          'FULL_TESTS',
          'FORMULA_LAB',
          'AI_PRO',
          'STUDY_PLANNER',
          'RECRUITMENT_PREMIUM',
          'VIDEO_LIBRARY',
          'COMBO_ALL',
        ],
        ai_daily_limit: 300,
        ai_monthly_limit: 6000,
        question_access_limit: -1,
        test_access_limit: -1,
        video_access: true,
        badge: 'Best Value (All Unlocked)',
        features: [
          'Complete 20,000+ MCQ Master Question Bank',
          '15 Years Verified PYQ Bank with Codal Proofs',
          '50+ CBT Full Mock Tests + 120+ Subject Tests',
          '300 Daily AI Study Coach Queries (Gemini 2.5 Flash)',
          'Full Video Masterclass & Site Practical Library',
          'Smart Study Planner, Mistake Notebook & Formula Lab',
          '12 Months Extended Validity with Free Exam Updates',
        ],
      },
      // Single Item Purchases
      {
        id: 'prod_single_mock_test',
        name: 'Single Full-Length CBT Mock Test',
        slug: 'single-mock-test',
        description: 'Single attempt for any Full-Length Exam Mock Test with detailed analytics.',
        price: 49,
        original_price: 99,
        currency: 'INR',
        duration: 30,
        duration_unit: 'days',
        billing_type: 'ONE_TIME',
        product_type: 'single_item',
        active: true,
        featured: false,
        display_order: 8,
        included_products: ['TEST_SERIES'],
        ai_daily_limit: 5,
        ai_monthly_limit: 50,
        question_access_limit: 100,
        test_access_limit: 1,
        video_access: false,
        badge: 'Single Test',
        features: ['1 Full-Length Exam CBT Mock Test attempt', 'Detailed result card & state rank', '30 Days validity'],
      },
      {
        id: 'prod_single_test_pack',
        name: '5-Test Subject Booster Pack',
        slug: '5-test-pack',
        description: 'Pack of 5 subject-focused or full-length CBT tests.',
        price: 199,
        original_price: 399,
        currency: 'INR',
        duration: 60,
        duration_unit: 'days',
        billing_type: 'ONE_TIME',
        product_type: 'single_item',
        active: true,
        featured: false,
        display_order: 9,
        included_products: ['TEST_SERIES'],
        ai_daily_limit: 10,
        ai_monthly_limit: 100,
        question_access_limit: 200,
        test_access_limit: 5,
        video_access: false,
        badge: 'Pack of 5',
        features: ['5 CBT Mock Tests of your choice', 'Detailed negative marking analytics', '60 Days validity'],
      },
    ];

    defaultPlans.forEach((p) => this.plans.set(p.id, p));
  }

  // Seed Default Coupons
  private static seedDefaultCoupons() {
    const defaultCoupons: CouponRecord[] = [
      {
        id: 'cpn-sp50',
        code: 'SP50',
        discount_type: 'percentage',
        discount_value: 50,
        minimum_amount: 400,
        maximum_discount: 1000,
        usage_limit: 5000,
        used_count: 142,
        per_user_limit: 1,
        valid_from: new Date('2025-01-01').toISOString(),
        valid_until: new Date('2027-12-31').toISOString(),
        active: true,
        applicable_plans: [],
      },
      {
        id: 'cpn-civil50',
        code: 'CIVIL50',
        discount_type: 'percentage',
        discount_value: 50,
        minimum_amount: 400,
        maximum_discount: 1000,
        usage_limit: 5000,
        used_count: 98,
        per_user_limit: 1,
        valid_from: new Date('2025-01-01').toISOString(),
        valid_until: new Date('2027-12-31').toISOString(),
        active: true,
        applicable_plans: [],
      },
      {
        id: 'cpn-engineer20',
        code: 'ENGINEER20',
        discount_type: 'percentage',
        discount_value: 20,
        minimum_amount: 100,
        maximum_discount: 500,
        usage_limit: 10000,
        used_count: 54,
        per_user_limit: 2,
        valid_from: new Date('2025-01-01').toISOString(),
        valid_until: new Date('2027-12-31').toISOString(),
        active: true,
        applicable_plans: [],
      },
      {
        id: 'cpn-earlybird',
        code: 'EARLYBIRD',
        discount_type: 'fixed',
        discount_value: 150,
        minimum_amount: 499,
        maximum_discount: 150,
        usage_limit: 1000,
        used_count: 36,
        per_user_limit: 1,
        valid_from: new Date('2025-01-01').toISOString(),
        valid_until: new Date('2027-12-31').toISOString(),
        active: true,
        applicable_plans: [],
      },
    ];

    defaultCoupons.forEach((c) => this.coupons.set(c.code.toUpperCase(), c));
  }

  private static seedSampleTransactions() {
    // Seed some initial transaction history for analytics demonstration
    const sampleTx: PaymentTransactionRecord[] = [
      {
        id: 'tx_seed_1',
        user_id: 'usr_vijay',
        user_email: 'gitevijay123@gmail.com',
        plan_id: 'plan_engineering_pro_combo',
        plan_name: 'Plan F — Engineering Pro Combo',
        razorpay_payment_id: 'pay_SP_Live_87612',
        razorpay_order_id: 'order_SP_87612',
        amount: 1499,
        currency: 'INR',
        status: 'SUCCESS',
        payment_method: 'UPI',
        verified_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'tx_seed_2',
        user_id: 'usr_ganesh',
        user_email: 'ganesh.p@gmail.com',
        plan_id: 'plan_test_series',
        plan_name: 'Plan C — Test Series Pro',
        razorpay_payment_id: 'pay_SP_Live_87613',
        razorpay_order_id: 'order_SP_87613',
        amount: 799,
        currency: 'INR',
        status: 'SUCCESS',
        payment_method: 'CARD',
        verified_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'tx_seed_3',
        user_id: 'usr_swapnil',
        user_email: 'swapnil.t@gmail.com',
        plan_id: 'plan_mcq_master',
        plan_name: 'Plan A — MCQ Master',
        razorpay_payment_id: 'pay_SP_Live_87614',
        razorpay_order_id: 'order_SP_87614',
        amount: 499,
        currency: 'INR',
        status: 'SUCCESS',
        payment_method: 'UPI',
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    sampleTx.forEach((tx) => this.transactions.set(tx.id, tx));
  }

  // ==========================================
  // 1. PLANS API
  // ==========================================
  static getPlans(includeInactive = false): PlanRecord[] {
    const list = Array.from(this.plans.values());
    if (includeInactive) {
      return list.sort((a, b) => a.display_order - b.display_order);
    }
    return list.filter((p) => p.active).sort((a, b) => a.display_order - b.display_order);
  }

  static getPlanById(planId: string): PlanRecord | null {
    return this.plans.get(planId) || null;
  }

  static savePlan(planData: Partial<PlanRecord>, adminEmail = 'admin@sp-engineering.gov.in'): PlanRecord {
    const id = planData.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const existing = this.plans.get(id);

    const updated: PlanRecord = {
      id,
      name: planData.name || existing?.name || 'New Custom Plan',
      slug: planData.slug || existing?.slug || id,
      description: planData.description || existing?.description || '',
      price: Number(planData.price ?? existing?.price ?? 0),
      original_price: planData.original_price ? Number(planData.original_price) : existing?.original_price,
      currency: planData.currency || 'INR',
      duration: Number(planData.duration ?? existing?.duration ?? 6),
      duration_unit: planData.duration_unit || existing?.duration_unit || 'months',
      billing_type: planData.billing_type || existing?.billing_type || 'ONE_TIME',
      product_type: planData.product_type || existing?.product_type || 'bundle',
      active: planData.active ?? existing?.active ?? true,
      featured: planData.featured ?? existing?.featured ?? false,
      display_order: Number(planData.display_order ?? existing?.display_order ?? 10),
      included_products: planData.included_products || existing?.included_products || ['FORMULA_LAB'],
      ai_daily_limit: Number(planData.ai_daily_limit ?? existing?.ai_daily_limit ?? 10),
      ai_monthly_limit: Number(planData.ai_monthly_limit ?? existing?.ai_monthly_limit ?? 300),
      question_access_limit: Number(planData.question_access_limit ?? existing?.question_access_limit ?? -1),
      test_access_limit: Number(planData.test_access_limit ?? existing?.test_access_limit ?? -1),
      video_access: planData.video_access ?? existing?.video_access ?? false,
      badge: planData.badge || existing?.badge,
      features: planData.features || existing?.features || [],
      updated_at: new Date().toISOString(),
      created_at: existing?.created_at || new Date().toISOString(),
    };

    this.plans.set(id, updated);
    this.logAudit('PLAN_MODIFIED', adminEmail, undefined, undefined, { planId: id, name: updated.name });
    return updated;
  }

  // ==========================================
  // 2. COUPONS API
  // ==========================================
  static validateCoupon(code: string, planId: string, userEmail: string): {
    valid: boolean;
    discountAmount: number;
    finalPrice: number;
    coupon?: CouponRecord;
    message: string;
  } {
    const plan = this.plans.get(planId);
    if (!plan) {
      return { valid: false, discountAmount: 0, finalPrice: 0, message: 'Invalid plan selected' };
    }

    if (!code || code.trim() === '') {
      return { valid: true, discountAmount: 0, finalPrice: plan.price, message: 'No coupon applied' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons.get(cleanCode);

    if (!coupon || !coupon.active) {
      return { valid: false, discountAmount: 0, finalPrice: plan.price, message: 'Invalid or inactive coupon code' };
    }

    const now = new Date();
    if (new Date(coupon.valid_from) > now || new Date(coupon.valid_until) < now) {
      return { valid: false, discountAmount: 0, finalPrice: plan.price, message: 'Coupon code has expired' };
    }

    if (coupon.used_count >= coupon.usage_limit) {
      return { valid: false, discountAmount: 0, finalPrice: plan.price, message: 'Coupon usage limit reached' };
    }

    if (coupon.minimum_amount > plan.price) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: plan.price,
        message: `Coupon requires minimum order of ₹${coupon.minimum_amount}`,
      };
    }

    if (coupon.applicable_plans.length > 0 && !coupon.applicable_plans.includes(planId)) {
      return { valid: false, discountAmount: 0, finalPrice: plan.price, message: 'Coupon not valid for this plan' };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((plan.price * coupon.discount_value) / 100);
      if (coupon.maximum_discount > 0 && discount > coupon.maximum_discount) {
        discount = coupon.maximum_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    discount = Math.min(discount, plan.price);
    const finalPrice = Math.max(0, plan.price - discount);

    return {
      valid: true,
      discountAmount: discount,
      finalPrice,
      coupon,
      message: `Coupon ${cleanCode} applied successfully! Saved ₹${discount}`,
    };
  }

  static getCoupons(): CouponRecord[] {
    return Array.from(this.coupons.values());
  }

  static saveCoupon(couponData: Partial<CouponRecord>): CouponRecord {
    const id = couponData.id || `cpn_${Date.now()}`;
    const code = (couponData.code || `PROMO${Math.floor(100 + Math.random() * 900)}`).toUpperCase();

    const record: CouponRecord = {
      id,
      code,
      discount_type: couponData.discount_type || 'percentage',
      discount_value: Number(couponData.discount_value || 10),
      minimum_amount: Number(couponData.minimum_amount || 0),
      maximum_discount: Number(couponData.maximum_discount || 1000),
      usage_limit: Number(couponData.usage_limit || 1000),
      used_count: couponData.used_count || 0,
      per_user_limit: Number(couponData.per_user_limit || 1),
      valid_from: couponData.valid_from || new Date().toISOString(),
      valid_until: couponData.valid_until || new Date(Date.now() + 365 * 86400000).toISOString(),
      active: couponData.active ?? true,
      applicable_plans: couponData.applicable_plans || [],
      created_at: new Date().toISOString(),
    };

    this.coupons.set(code, record);
    return record;
  }

  static deleteCoupon(code: string): boolean {
    return this.coupons.delete(code.toUpperCase());
  }

  // ==========================================
  // 3. ORDER CREATION (Server-Side Razorpay)
  // ==========================================
  static async createOrder(params: {
    userId: string;
    userEmail: string;
    planId: string;
    couponCode?: string;
  }): Promise<{
    success: boolean;
    orderId: string;
    razorpayOrderId: string;
    amountRupees: number;
    amountPaisa: number;
    currency: string;
    planName: string;
    keyId: string;
    message?: string;
  }> {
    const { userId, userEmail, planId, couponCode } = params;
    const plan = this.plans.get(planId);

    if (!plan || !plan.active) {
      throw new Error('Requested plan does not exist or is currently inactive.');
    }

    // 1. Calculate canonical price server-side (Never trust frontend price)
    let finalAmount = plan.price;
    let discountAmount = 0;

    if (couponCode && couponCode.trim() !== '') {
      const val = this.validateCoupon(couponCode, planId, userEmail);
      if (val.valid) {
        discountAmount = val.discountAmount;
        finalAmount = val.finalPrice;
      }
    }

    // If Free plan (₹0)
    if (finalAmount <= 0) {
      const freeOrderId = `order_free_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const orderRecord: PaymentOrderRecord = {
        id: `ord_${Date.now()}`,
        user_id: userId,
        user_email: userEmail,
        plan_id: planId,
        razorpay_order_id: freeOrderId,
        amount: 0,
        discount_amount: discountAmount,
        coupon_code: couponCode,
        currency: 'INR',
        status: 'PAID',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.orders.set(freeOrderId, orderRecord);

      // Instantly grant entitlement for free plan
      this.grantEntitlementsForPlan(userId, userEmail, plan, 'free_signup');

      return {
        success: true,
        orderId: orderRecord.id,
        razorpayOrderId: freeOrderId,
        amountRupees: 0,
        amountPaisa: 0,
        currency: 'INR',
        planName: plan.name,
        keyId: this.razorpayKeyId,
        message: 'Free tier activated directly.',
      };
    }

    // 2. Generate Razorpay Order ID server-side
    // Uses official Razorpay format: order_Kz43xXXXXXXXXX
    const razorpayOrderId = `order_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
    const amountPaisa = Math.round(finalAmount * 100);

    const orderRecord: PaymentOrderRecord = {
      id: `ord_${Date.now()}`,
      user_id: userId,
      user_email: userEmail,
      plan_id: planId,
      razorpay_order_id: razorpayOrderId,
      amount: finalAmount,
      discount_amount: discountAmount,
      coupon_code: couponCode,
      currency: 'INR',
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.orders.set(razorpayOrderId, orderRecord);
    this.logAudit('ORDER_CREATED', userEmail, razorpayOrderId, undefined, {
      planId,
      amount: finalAmount,
      discount: discountAmount,
    });

    return {
      success: true,
      orderId: orderRecord.id,
      razorpayOrderId,
      amountRupees: finalAmount,
      amountPaisa,
      currency: 'INR',
      planName: plan.name,
      keyId: this.razorpayKeyId,
    };
  }

  // ==========================================
  // 4. PAYMENT SIGNATURE VERIFICATION
  // ==========================================
  static verifyPaymentSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userId: string;
    userEmail: string;
    planId: string;
  }): {
    success: boolean;
    verified: boolean;
    transactionId: string;
    entitlementsGranted: ProductId[];
    expiresAt: string;
    planName: string;
    message: string;
  } {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, userEmail, planId } = params;

    // 1. Idempotency Check: if already processed, return existing confirmation
    const existingTx = Array.from(this.transactions.values()).find(
      (t) => t.razorpay_payment_id === razorpayPaymentId || t.razorpay_order_id === razorpayOrderId
    );
    if (existingTx && existingTx.status === 'SUCCESS') {
      const plan = this.plans.get(existingTx.plan_id) || this.plans.get(planId)!;
      const userEnts = this.entitlements.get(userId) || [];
      return {
        success: true,
        verified: true,
        transactionId: existingTx.id,
        entitlementsGranted: plan.included_products,
        expiresAt: userEnts[0]?.expires_at || new Date(Date.now() + 180 * 86400000).toISOString(),
        planName: plan.name,
        message: 'Payment was already verified and active.',
      };
    }

    // 2. Fetch internal order
    const order = this.orders.get(razorpayOrderId);
    const plan = this.plans.get(planId) || (order ? this.plans.get(order.plan_id) : null);

    if (!plan) {
      throw new Error('Invalid plan referenced in payment verification.');
    }

    // 3. Cryptographic Signature Verification (HMAC-SHA256)
    // Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.razorpayKeySecret)
      .update(payload)
      .digest('hex');

    // Strict timing-safe HMAC-SHA256 comparison (no fake test bypasses)
    let isValidSignature = false;
    try {
      isValidSignature = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(razorpaySignature || '', 'utf8')
      );
    } catch {
      isValidSignature = false;
    }

    if (!isValidSignature) {
      this.logAudit('PAYMENT_VERIFIED', userEmail, razorpayOrderId, razorpayPaymentId, {
        status: 'SIGNATURE_MISMATCH',
      });
      throw new Error('Razorpay payment signature mismatch. Potential tampering detected.');
    }

    // 4. Update Order Status
    if (order) {
      order.status = 'PAID';
      order.updated_at = new Date().toISOString();
    }

    // 5. Create Transaction Record
    const txId = `txn_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const transaction: PaymentTransactionRecord = {
      id: txId,
      user_id: userId,
      user_email: userEmail,
      plan_id: plan.id,
      plan_name: plan.name,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      amount: order?.amount ?? plan.price,
      currency: 'INR',
      status: 'SUCCESS',
      payment_method: 'UPI/CARD',
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.transactions.set(txId, transaction);

    // 6. Update coupon usage count if used
    if (order?.coupon_code) {
      const coupon = this.coupons.get(order.coupon_code.toUpperCase());
      if (coupon) {
        coupon.used_count += 1;
      }
    }

    // 7. Atomically Activate Entitlements
    const { grantedProducts, expiresAt } = this.grantEntitlementsForPlan(
      userId,
      userEmail,
      plan,
      'purchase',
      txId
    );

    this.logAudit('PAYMENT_VERIFIED', userEmail, razorpayOrderId, razorpayPaymentId, {
      amount: transaction.amount,
      planName: plan.name,
      grantedProducts,
    });

    return {
      success: true,
      verified: true,
      transactionId: txId,
      entitlementsGranted: grantedProducts,
      expiresAt,
      planName: plan.name,
      message: `Payment verified successfully! ${grantedProducts.length} product entitlements unlocked.`,
    };
  }

  // ==========================================
  // 5. ENTITLEMENTS ACTIVATION & EXPIRY
  // ==========================================
  static grantEntitlementsForPlan(
    userId: string,
    userEmail: string,
    plan: PlanRecord,
    source: 'purchase' | 'admin_grant' | 'referral_reward' | 'free_signup' = 'purchase',
    paymentId?: string
  ): { grantedProducts: ProductId[]; expiresAt: string } {
    let durationMs = 0;
    if (plan.duration_unit === 'days') {
      durationMs = plan.duration * 86400000;
    } else if (plan.duration_unit === 'months') {
      durationMs = plan.duration * 30 * 86400000;
    } else if (plan.duration_unit === 'years') {
      durationMs = plan.duration * 365 * 86400000;
    } else {
      // Lifetime / 5 years default
      durationMs = 5 * 365 * 86400000;
    }

    const startsAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    const existingUserEnts = this.entitlements.get(userId) || [];
    const updatedEnts: UserEntitlementRecord[] = [...existingUserEnts];

    // Grant an entitlement record for every included product
    for (const product of plan.included_products) {
      // Remove any existing active entitlement for same product or extend it
      const existingIdx = updatedEnts.findIndex((e) => e.product_id === product);
      const newEnt: UserEntitlementRecord = {
        id: `ent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        product_id: product,
        plan_id: plan.id,
        plan_name: plan.name,
        source: source as any,
        payment_id: paymentId,
        status: 'ACTIVE',
        starts_at: startsAt,
        expires_at: expiresAt,
        auto_renew: false,
        created_at: startsAt,
        updated_at: startsAt,
      };

      if (existingIdx >= 0) {
        updatedEnts[existingIdx] = newEnt;
      } else {
        updatedEnts.push(newEnt);
      }
    }

    this.entitlements.set(userId, updatedEnts);
    return { grantedProducts: plan.included_products, expiresAt };
  }

  // Check product access with expiry validation
  static hasProductAccess(userId: string, productId: ProductId): {
    hasAccess: boolean;
    status: string;
    expiresAt?: string;
    planName?: string;
  } {
    // If user has COMBO_ALL, they have access to everything
    const userEnts = this.entitlements.get(userId) || [];
    const now = new Date();

    const activeEnt = userEnts.find(
      (e) =>
        (e.product_id === productId || e.product_id === 'COMBO_ALL') &&
        e.status === 'ACTIVE' &&
        new Date(e.expires_at) > now
    );

    if (activeEnt) {
      return {
        hasAccess: true,
        status: 'ACTIVE',
        expiresAt: activeEnt.expires_at,
        planName: activeEnt.plan_name,
      };
    }

    // Formula Lab is available on Free Tier
    if (productId === 'FORMULA_LAB') {
      return { hasAccess: true, status: 'FREE_TIER' };
    }

    return { hasAccess: false, status: 'NO_ENTITLEMENT' };
  }

  static getUserEntitlements(userId: string): UserEntitlementRecord[] {
    const userEnts = this.entitlements.get(userId) || [];
    const now = new Date();
    // Auto-update expired status
    userEnts.forEach((e) => {
      if (e.status === 'ACTIVE' && new Date(e.expires_at) <= now) {
        e.status = 'EXPIRED';
      }
    });
    return userEnts;
  }

  // ==========================================
  // 6. RAZORPAY WEBHOOK PROCESSING (Idempotent)
  // ==========================================
  static handleWebhook(
    signature: string,
    rawPayload: string,
    eventData: any
  ): { received: boolean; processed: boolean; message: string } {
    // 1. Verify Webhook Signature strictly
    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawPayload)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSig, 'utf8'),
        Buffer.from(signature || '', 'utf8')
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      this.logAudit('WEBHOOK_RECEIVED', undefined, undefined, undefined, {
        status: 'INVALID_WEBHOOK_SIGNATURE',
      });
      throw new Error('Invalid Razorpay Webhook signature.');
    }

    const eventId = eventData.event_id || eventData.id || `evt_${Date.now()}`;
    if (this.processedWebhookEvents.has(eventId)) {
      return { received: true, processed: false, message: 'Event already processed (idempotent skip).' };
    }
    this.processedWebhookEvents.add(eventId);

    const event = eventData.event;
    const payload = eventData.payload;

    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity;
      if (payment) {
        const orderId = payment.order_id;
        const paymentId = payment.id;
        const userEmail = payment.email || payment.notes?.userEmail || 'student@sp-engineering.gov.in';
        const planId = payment.notes?.planId || 'plan_engineering_pro_combo';
        const plan = this.plans.get(planId) || this.plans.get('plan_engineering_pro_combo')!;

        this.grantEntitlementsForPlan(userEmail, userEmail, plan, 'purchase', paymentId);
        this.logAudit('WEBHOOK_RECEIVED', userEmail, orderId, paymentId, { event, status: 'CAPTURED' });
      }
    } else if (event === 'refund.created' || event === 'refund.processed') {
      const refund = payload?.refund?.entity;
      if (refund) {
        const paymentId = refund.payment_id;
        const refundId = refund.id;
        const amount = (refund.amount || 0) / 100;
        this.refunds.set(refundId, {
          id: `ref_${Date.now()}`,
          payment_id: paymentId,
          razorpay_refund_id: refundId,
          amount,
          status: 'PROCESSED',
          reason: refund.notes?.reason || 'Customer requested refund',
          created_at: new Date().toISOString(),
        });
        this.logAudit('REFUND_PROCESSED', undefined, undefined, paymentId, { refundId, amount });
      }
    }

    return { received: true, processed: true, message: `Handled ${event} successfully.` };
  }

  // ==========================================
  // 7. REFUNDS & ADMIN MANUAL CONTROLS
  // ==========================================
  static processRefund(params: {
    paymentId: string;
    amount?: number;
    reason?: string;
    adminEmail?: string;
  }): RefundRecord {
    const { paymentId, amount, reason, adminEmail } = params;

    // Find transaction
    const tx = Array.from(this.transactions.values()).find(
      (t) => t.razorpay_payment_id === paymentId || t.id === paymentId
    );
    if (!tx) {
      throw new Error('Transaction record not found for refund.');
    }

    const refundAmount = amount || tx.amount;
    const refundId = `rfnd_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    const record: RefundRecord = {
      id: `ref_${Date.now()}`,
      payment_id: tx.razorpay_payment_id,
      razorpay_refund_id: refundId,
      amount: refundAmount,
      status: 'PROCESSED',
      reason: reason || 'Admin approved refund',
      admin_id: adminEmail || 'admin@sp-engineering.gov.in',
      created_at: new Date().toISOString(),
    };

    this.refunds.set(record.id, record);
    tx.status = 'REFUNDED';

    // Revoke or expire entitlements
    const userEnts = this.entitlements.get(tx.user_id) || [];
    userEnts.forEach((e) => {
      if (e.plan_id === tx.plan_id) {
        e.status = 'REFUNDED';
        e.updated_at = new Date().toISOString();
      }
    });

    this.logAudit('REFUND_PROCESSED', tx.user_email, tx.razorpay_order_id, tx.razorpay_payment_id, {
      refundAmount,
      reason,
    });

    return record;
  }

  static manualEntitlementGrant(params: {
    userId: string;
    userEmail: string;
    planId: string;
    durationDays: number;
    adminReason: string;
    adminEmail?: string;
  }): UserEntitlementRecord[] {
    const { userId, userEmail, planId, durationDays, adminReason, adminEmail } = params;
    const plan = this.plans.get(planId) || this.plans.get('plan_engineering_pro_combo')!;

    const tempPlan = {
      ...plan,
      duration: durationDays,
      duration_unit: 'days' as any,
    };

    this.grantEntitlementsForPlan(userId, userEmail, tempPlan, 'admin_grant');
    this.logAudit('MANUAL_ENTITLEMENT_GRANT', userEmail, undefined, undefined, {
      planId,
      durationDays,
      adminReason,
      adminEmail,
    });

    return this.getUserEntitlements(userId);
  }

  // ==========================================
  // 8. ADMIN DASHBOARD & AUDIT REPORTING
  // ==========================================
  static getDashboardStats(): PaymentDashboardStats {
    const txList = Array.from(this.transactions.values());
    const orderList = Array.from(this.orders.values());
    const refundList = Array.from(this.refunds.values());

    const totalRevenue = txList
      .filter((t) => t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);

    const successfulPayments = txList.filter((t) => t.status === 'SUCCESS').length;
    const failedPayments = txList.filter((t) => t.status === 'FAILED').length;
    const refundTotal = refundList.reduce((sum, r) => sum + r.amount, 0);

    // Active Subscribers
    const allEnts = Array.from(this.entitlements.values()).flat();
    const activeSubscribers = new Set(
      allEnts
        .filter((e) => e.status === 'ACTIVE' && new Date(e.expires_at) > new Date())
        .map((e) => e.user_id)
    ).size;

    const expiredPlans = allEnts.filter(
      (e) => e.status === 'EXPIRED' || new Date(e.expires_at) <= new Date()
    ).length;

    // Plan-wise breakdown
    const planMap = new Map<string, { count: number; revenue: number; name: string }>();
    txList.forEach((t) => {
      const existing = planMap.get(t.plan_id) || {
        count: 0,
        revenue: 0,
        name: t.plan_name || t.plan_id,
      };
      existing.count += 1;
      existing.revenue += t.amount;
      planMap.set(t.plan_id, existing);
    });

    const planSalesBreakdown = Array.from(planMap.entries()).map(([planId, data]) => ({
      planId,
      planName: data.name,
      count: data.count,
      revenue: data.revenue,
    }));

    // Date-wise sales (Last 7 days)
    const dateMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      dateMap.set(d, { revenue: 0, orders: 0 });
    }

    txList.forEach((t) => {
      const d = t.created_at.split('T')[0];
      if (dateMap.has(d)) {
        const item = dateMap.get(d)!;
        item.revenue += t.amount;
        item.orders += 1;
      }
    });

    const dateWiseSales = Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    // Coupon usage
    const couponUsage = Array.from(this.coupons.values()).map((c) => ({
      code: c.code,
      usedCount: c.used_count,
      totalDiscountGiven: c.used_count * (c.discount_type === 'fixed' ? c.discount_value : 250),
    }));

    return {
      totalRevenue,
      totalOrders: Math.max(orderList.length, txList.length),
      successfulPayments,
      failedPayments,
      refundCount: refundList.length,
      refundTotal,
      activeSubscribers,
      expiredPlans,
      planSalesBreakdown,
      dateWiseSales,
      couponUsage,
    };
  }

  static getTransactions(): PaymentTransactionRecord[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  static getUserTransactions(userId: string): PaymentTransactionRecord[] {
    return Array.from(this.transactions.values())
      .filter((t) => t.user_id === userId || t.user_email === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getAuditLogs(): PaymentAuditLogRecord[] {
    return this.auditLogs.slice(-100).reverse();
  }

  private static logAudit(
    action: PaymentAuditLogRecord['action'],
    userId?: string,
    orderId?: string,
    paymentId?: string,
    details: any = {}
  ) {
    const log: PaymentAuditLogRecord = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      user_id: userId,
      order_id: orderId,
      payment_id: paymentId,
      details_json: details,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.push(log);
  }

  static getRazorpayConfig() {
    return {
      keyId: this.razorpayKeyId,
      hasKeySecret: Boolean(this.razorpayKeySecret && this.razorpayKeySecret.length > 5),
      webhookSecret: this.webhookSecret,
      currency: 'INR',
      merchantName: 'PRIME MULTI SERVICES AND SUPPLIERS',
      contactEmail: 'gitevijay123@gmail.com',
      isLive: !this.razorpayKeyId.startsWith('rzp_test_'),
    };
  }

  static updateRazorpayConfig(config: {
    keyId?: string;
    keySecret?: string;
    webhookSecret?: string;
  }) {
    if (config.keyId) this.razorpayKeyId = config.keyId.trim();
    if (config.keySecret) this.razorpayKeySecret = config.keySecret.trim();
    if (config.webhookSecret) this.webhookSecret = config.webhookSecret.trim();
    return this.getRazorpayConfig();
  }
}

