import { DailyCapsuleItem, InAppNotification } from '../types';

export class CapsuleService {
  static async getTodayCapsule(): Promise<DailyCapsuleItem | null> {
    try {
      const res = await fetch('/api/capsule/today');
      const data = await res.json();
      return data.capsule || null;
    } catch (e) {
      console.error('[CapsuleService] Error:', e);
      return null;
    }
  }

  static async getNotifications(userEmail?: string): Promise<InAppNotification[]> {
    try {
      const url = userEmail ? `/api/notifications?userEmail=${encodeURIComponent(userEmail)}` : '/api/notifications';
      const res = await fetch(url);
      const data = await res.json();
      return data.notifications || [];
    } catch (e) {
      return [];
    }
  }

  static async markAsRead(notifId: string, userEmail?: string): Promise<InAppNotification[]> {
    try {
      const res = await fetch(`/api/notifications/${notifId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });
      const data = await res.json();
      return data.notifications || [];
    } catch (e) {
      return [];
    }
  }
}
