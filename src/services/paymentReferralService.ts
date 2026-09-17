import { EntitlementPlanItem, ReferralStudentStatus } from '../types';

export class PaymentReferralService {
  static async getPlans(): Promise<EntitlementPlanItem[]> {
    try {
      const res = await fetch('/api/payments/plans');
      const data = await res.json();
      return data.plans || [];
    } catch (e) {
      console.error('[PaymentReferralService] Error:', e);
      return [];
    }
  }

  static async createOrder(planId: string, userEmail: string): Promise<any> {
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userEmail }),
      });
      return await res.json();
    } catch (e) {
      throw e;
    }
  }

  static async verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    signature: string;
    userEmail: string;
    planId: string;
  }): Promise<any> {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      throw e;
    }
  }

  static async getReferralStatus(userEmail: string, userName: string): Promise<ReferralStudentStatus | null> {
    try {
      const res = await fetch(`/api/referrals/status?userEmail=${encodeURIComponent(userEmail)}&userName=${encodeURIComponent(userName)}`);
      const data = await res.json();
      return data.status || null;
    } catch (e) {
      return null;
    }
  }
}
