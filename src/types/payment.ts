export type ProductId =
  | 'MCQ_BANK'
  | 'PYQ_BANK'
  | 'TEST_SERIES'
  | 'FULL_TESTS'
  | 'FORMULA_LAB'
  | 'AI_PRO'
  | 'STUDY_PLANNER'
  | 'RECRUITMENT_PREMIUM'
  | 'VIDEO_LIBRARY'
  | 'COMBO_ALL';

export type BillingType = 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION';
export type DurationUnit = 'days' | 'months' | 'years' | 'lifetime';
export type EntitlementStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED' | 'SUSPENDED';

export interface PlanRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  currency: string;
  duration: number;
  duration_unit: DurationUnit;
  billing_type: BillingType;
  product_type: 'mcq_bank' | 'pyq_bank' | 'test_series' | 'ai_pro' | 'video_library' | 'bundle' | 'single_item';
  active: boolean;
  featured: boolean;
  display_order: number;
  included_products: ProductId[];
  ai_daily_limit: number;
  ai_monthly_limit: number;
  question_access_limit: number; // -1 = unlimited
  test_access_limit: number;     // -1 = unlimited
  video_access: boolean;
  badge?: string;
  features: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CouponRecord {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount: number;
  maximum_discount: number;
  usage_limit: number;
  used_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
  applicable_plans: string[];
  created_at?: string;
}

export interface PaymentOrderRecord {
  id: string;
  user_id: string;
  user_email: string;
  plan_id: string;
  razorpay_order_id: string;
  amount: number;
  discount_amount: number;
  coupon_code?: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
}

export interface PaymentTransactionRecord {
  id: string;
  user_id: string;
  user_email: string;
  plan_id: string;
  plan_name?: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  payment_method: string;
  verified_at: string;
  created_at: string;
}

export interface UserEntitlementRecord {
  id: string;
  user_id: string;
  product_id: ProductId;
  plan_id: string;
  plan_name?: string;
  source: 'purchase' | 'admin_grant' | 'referral_reward' | 'trial';
  payment_id?: string;
  status: EntitlementStatus;
  starts_at: string;
  expires_at: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface RefundRecord {
  id: string;
  payment_id: string;
  razorpay_refund_id: string;
  amount: number;
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
  reason?: string;
  admin_id?: string;
  created_at: string;
}

export interface PaymentAuditLogRecord {
  id: string;
  action:
    | 'ORDER_CREATED'
    | 'PAYMENT_VERIFIED'
    | 'ENTITLEMENT_ACTIVATED'
    | 'REFUND_PROCESSED'
    | 'PLAN_MODIFIED'
    | 'COUPON_APPLIED'
    | 'WEBHOOK_RECEIVED'
    | 'MANUAL_ENTITLEMENT_GRANT'
    | 'MANUAL_ENTITLEMENT_REVOKE';
  user_id?: string;
  order_id?: string;
  payment_id?: string;
  details_json: any;
  ip_address?: string;
  created_at: string;
}

export interface PaymentDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  successfulPayments: number;
  failedPayments: number;
  refundCount: number;
  refundTotal: number;
  activeSubscribers: number;
  expiredPlans: number;
  planSalesBreakdown: Array<{
    planId: string;
    planName: string;
    count: number;
    revenue: number;
  }>;
  dateWiseSales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  couponUsage: Array<{
    code: string;
    usedCount: number;
    totalDiscountGiven: number;
  }>;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}
