import {
  PlanRecord,
  CouponRecord,
  PaymentTransactionRecord,
  UserEntitlementRecord,
  PaymentDashboardStats,
  ProductId,
  RazorpayCheckoutOptions,
} from '../types/payment';
import { StudentProfile } from '../types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export class PaymentService {
  private static cachedPlans: PlanRecord[] | null = null;
  private static cachedEntitlements: Map<string, UserEntitlementRecord[]> = new Map();

  // Load Razorpay Script Dynamically
  static loadRazorpaySDK(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Failed to load external Razorpay SDK script, using sandbox gateway mode');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  // =========================================================================
  // 1. PUBLIC / STUDENT APIs
  // =========================================================================

  static async getPlans(): Promise<PlanRecord[]> {
    try {
      const res = await fetch('/api/payments/plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      this.cachedPlans = data.plans || [];
      return this.cachedPlans!;
    } catch (err) {
      console.warn('Using cached or fallback plans', err);
      return this.cachedPlans || [];
    }
  }

  static async validateCoupon(code: string, planId: string, userEmail: string) {
    const res = await fetch('/api/payments/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, planId, userEmail }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid coupon');
    }
    return res.json();
  }

  static async createOrder(params: {
    planId: string;
    userId: string;
    userEmail: string;
    couponCode?: string;
  }) {
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create order');
    }
    return res.json();
  }

  static async verifyPaymentSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userId: string;
    userEmail: string;
    planId: string;
  }) {
    const res = await fetch('/api/payments/verify-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Signature verification failed');
    }
    const data = await res.json();
    // Invalidate cached entitlements
    this.cachedEntitlements.delete(params.userId);
    return data;
  }

  static async getUserEntitlements(userId: string): Promise<UserEntitlementRecord[]> {
    try {
      const res = await fetch(`/api/payments/entitlements/${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Failed to fetch entitlements');
      const data = await res.json();
      const list = data.entitlements || [];
      this.cachedEntitlements.set(userId, list);
      return list;
    } catch {
      return this.cachedEntitlements.get(userId) || [];
    }
  }

  static async checkProductAccess(userId: string, productId: ProductId): Promise<{
    hasAccess: boolean;
    status: string;
    expiresAt?: string;
    planName?: string;
  }> {
    try {
      const res = await fetch('/api/payments/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      if (!res.ok) throw new Error('Access check failed');
      return res.json();
    } catch {
      // Offline / fallback check
      const userEnts = this.cachedEntitlements.get(userId) || [];
      const now = new Date();
      const active = userEnts.find(
        (e) =>
          (e.product_id === productId || e.product_id === 'COMBO_ALL') &&
          e.status === 'ACTIVE' &&
          new Date(e.expires_at) > now
      );
      if (active) {
        return { hasAccess: true, status: 'ACTIVE', expiresAt: active.expires_at, planName: active.plan_name };
      }
      return { hasAccess: productId === 'FORMULA_LAB', status: productId === 'FORMULA_LAB' ? 'FREE_TIER' : 'NO_ENTITLEMENT' };
    }
  }

  static async getUserTransactions(userId: string): Promise<PaymentTransactionRecord[]> {
    try {
      const res = await fetch(`/api/payments/user-transactions/${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      return data.transactions || [];
    } catch {
      return [];
    }
  }

  // =========================================================================
  // 2. RAZORPAY CHECKOUT TRIGGER
  // =========================================================================

  static async triggerRazorpayCheckout(params: {
    orderData: {
      orderId: string;
      razorpayOrderId: string;
      amountRupees: number;
      amountPaisa: number;
      currency: string;
      planName: string;
      keyId: string;
    };
    planId: string;
    profile: StudentProfile;
    onSuccess: (verifyResult: any) => void;
    onFailure: (errorMsg: string) => void;
  }) {
    const { orderData, planId, profile, onSuccess, onFailure } = params;

    // Free order directly succeeds
    if (orderData.amountRupees <= 0) {
      try {
        const verifyRes = await this.verifyPaymentSignature({
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: `pay_free_${Date.now()}`,
          razorpaySignature: 'test_verified_signature',
          userId: profile.email || 'student',
          userEmail: profile.email || 'student@sp-engineering.gov.in',
          planId,
        });
        onSuccess(verifyRes);
      } catch (err: any) {
        onFailure(err.message || 'Free activation failed');
      }
      return;
    }

    const sdkLoaded = await this.loadRazorpaySDK();

    if (sdkLoaded && window.Razorpay) {
      const options: RazorpayCheckoutOptions = {
        key: orderData.keyId,
        amount: orderData.amountPaisa,
        currency: orderData.currency || 'INR',
        name: 'PRIME MULTI SERVICES AND SUPPLIERS',
        description: `${orderData.planName} - Engineering Officer BY MH`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: profile.name,
          email: profile.email,
          contact: profile.phone || '',
        },
        theme: {
          color: '#1e3a8a', // High contrast navy blue
        },
        handler: async (response) => {
          try {
            const verifyResult = await this.verifyPaymentSignature({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              userId: profile.email,
              userEmail: profile.email,
              planId,
            });
            onSuccess(verifyResult);
          } catch (err: any) {
            onFailure(err.message || 'Payment signature verification failed on server');
          }
        },
        modal: {
          ondismiss: () => {
            onFailure('Payment checkout window was cancelled by student.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        onFailure(resp.error?.description || 'Payment was declined by issuing bank/UPI.');
      });
      rzp.open();
    } else {
      // Sandbox fallback in container sandbox
      const mockPayId = `pay_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      try {
        const verifyResult = await this.verifyPaymentSignature({
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: mockPayId,
          razorpaySignature: 'test_verified_signature',
          userId: profile.email,
          userEmail: profile.email,
          planId,
        });
        onSuccess(verifyResult);
      } catch (err: any) {
        onFailure(err.message || 'Payment processing failed');
      }
    }
  }

  // =========================================================================
  // 3. ADMIN APIS
  // =========================================================================

  static async getAdminDashboard(): Promise<PaymentDashboardStats> {
    const res = await fetch('/api/admin/payments/dashboard');
    if (!res.ok) throw new Error('Failed to load dashboard statistics');
    const data = await res.json();
    return data.stats;
  }

  static async getAdminPlans(): Promise<PlanRecord[]> {
    const res = await fetch('/api/admin/payments/plans');
    if (!res.ok) throw new Error('Failed to fetch admin plans');
    const data = await res.json();
    return data.plans;
  }

  static async saveAdminPlan(plan: Partial<PlanRecord>, adminEmail?: string) {
    const res = await fetch('/api/admin/payments/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plan, adminEmail }),
    });
    if (!res.ok) throw new Error('Failed to save plan');
    return res.json();
  }

  static async getAdminCoupons(): Promise<CouponRecord[]> {
    const res = await fetch('/api/admin/payments/coupons');
    if (!res.ok) throw new Error('Failed to fetch coupons');
    const data = await res.json();
    return data.coupons;
  }

  static async saveAdminCoupon(coupon: Partial<CouponRecord>) {
    const res = await fetch('/api/admin/payments/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon),
    });
    if (!res.ok) throw new Error('Failed to save coupon');
    return res.json();
  }

  static async deleteAdminCoupon(code: string) {
    const res = await fetch(`/api/admin/payments/coupons/${encodeURIComponent(code)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
  }

  static async getAdminTransactions(): Promise<PaymentTransactionRecord[]> {
    const res = await fetch('/api/admin/payments/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    return data.transactions;
  }

  static async processRefund(paymentId: string, amount?: number, reason?: string, adminEmail?: string) {
    const res = await fetch('/api/admin/payments/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, amount, reason, adminEmail }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Refund processing failed');
    }
    return res.json();
  }

  static async manualEntitlementGrant(params: {
    userId: string;
    userEmail: string;
    planId: string;
    durationDays: number;
    adminReason: string;
    adminEmail?: string;
  }) {
    const res = await fetch('/api/admin/payments/manual-entitlement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Manual entitlement failed');
    return res.json();
  }

  static async getAdminAuditLogs() {
    const res = await fetch('/api/admin/payments/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const data = await res.json();
    return data.logs;
  }
}
