/**
 * Push & Native System Notification Service for Engineering Officer BY MH
 * Delivers Android Heads-Up Notifications, Lock Screen Alerts, and Status Bar Badges.
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

export interface PushNotificationPreferences {
  enabled: boolean;
  examAlerts: boolean;
  mockTestAlerts: boolean;
  dailyStudyReminders: boolean;
  vibration: boolean;
  sound: boolean;
  reminderTime: string; // e.g. "09:00"
}

const DEFAULT_PREFERENCES: PushNotificationPreferences = {
  enabled: false,
  examAlerts: true,
  mockTestAlerts: true,
  dailyStudyReminders: true,
  vibration: true,
  sound: true,
  reminderTime: '09:00',
};

const PREFS_STORAGE_KEY = 'eo_push_notification_prefs_v1';

export class PushNotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static isInitialized = false;

  /**
   * Check if Native Web Notifications and Service Workers are supported by the browser/device
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current OS/browser notification permission
   */
  static getPermissionState(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Initialize Service Worker and register sw.js
   */
  static async init(): Promise<ServiceWorkerRegistration | null> {
    if (this.isInitialized && this.swRegistration) {
      return this.swRegistration;
    }

    if (!this.isSupported()) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      this.swRegistration = reg;
      this.isInitialized = true;
      console.log('[PushNotificationService] Service Worker registered with scope:', reg.scope);
      return reg;
    } catch (err) {
      console.warn('[PushNotificationService] Service Worker registration failed:', err);
      return null;
    }
  }

  /**
   * Request user permission for Native Android notifications
   */
  static async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) {
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const prefs = this.getPreferences();
        prefs.enabled = true;
        this.savePreferences(prefs);
        await this.init();

        // Register device subscription with server backend & Supabase database
        try {
          const storedEmail = localStorage.getItem('eo_current_user_email') || 'student@engineeringofficer.in';
          fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: `browser-${navigator.userAgent.slice(0, 40)}-${Date.now()}`,
              userEmail: storedEmail,
            }),
          }).catch(() => {});
        } catch (_e) {
          // Non-blocking
        }
      }
      return permission;
    } catch (err) {
      console.error('[PushNotificationService] Permission request failed:', err);
      return 'denied';
    }
  }

  /**
   * Trigger a real Android System Notification (slides down from status bar & shows on lock screen)
   */
  static async sendSystemNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('[PushNotificationService] Notifications unsupported in this environment');
      return false;
    }

    // If permission not granted yet, attempt to ask
    if (Notification.permission !== 'granted') {
      const result = await this.requestPermission();
      if (result !== 'granted') {
        return false;
      }
    }

    const title = payload.title || 'Engineering Officer BY MH';
    const body = payload.body || 'नवीन सिव्हिल इंजिनिअरिंग अभ्यास अपडेट उपलब्ध!';
    const icon = payload.icon || '/icon.svg';
    const badge = payload.badge || '/badge.svg';
    const url = payload.url || '/#notifications';
    const tag = payload.tag || 'eo-alert-' + Date.now();

    // 1. Try displaying via Service Worker registration (gives full Android heads-up + lock screen banner)
    try {
      const reg = await this.init();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon,
          badge,
          tag,
          renotify: true,
          vibrate: [250, 100, 250, 100, 250],
          data: { url, timestamp: Date.now() },
        } as NotificationOptions);
        this.playNotificationSound();
        return true;
      }
    } catch (swErr) {
      console.warn('[PushNotificationService] Service Worker showNotification failed, trying fallback:', swErr);
    }

    // 2. Direct fallback using window Notification API
    try {
      const notif = new Notification(title, {
        body,
        icon,
        tag,
      });

      notif.onclick = () => {
        window.focus();
        if (url && window.location.hash !== url) {
          window.location.href = url;
        }
        notif.close();
      };

      this.playNotificationSound();
      return true;
    } catch (directErr) {
      console.error('[PushNotificationService] Direct Notification failed:', directErr);
      return false;
    }
  }

  /**
   * Plays a subtle notification sound using Web Audio API
   */
  private static playNotificationSound() {
    try {
      const prefs = this.getPreferences();
      if (!prefs.sound) return;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (_err) {
      // Audio autoplay might be restricted before user gesture
    }
  }

  /**
   * Pre-packaged realistic notification scenarios for testing and demonstration
   */
  static async sendPresetNotification(
    presetKey: 'exam_ad' | 'mock_live' | 'daily_quiz' | 'study_reminder' | 'rank_update'
  ): Promise<boolean> {
    const presets: Record<string, NotificationPayload> = {
      exam_ad: {
        title: 'MPSC Civil Engineering 2026',
        body: '📢 450 जागांची अधिकृत जाहिरात प्रसिद्ध! त्वरित सिलॅबस व पात्रता तपासा.',
        icon: '/icon.svg',
        url: '/#pyqs',
        tag: 'mpsc-recruitment-alert',
      },
      mock_live: {
        title: 'CBT Mock Test #03 is LIVE!',
        body: '🎯 All Maharashtra Civil Engineering Rank Test सुरू झाला आहे. 100 प्रश्न · 120 मिनिटे.',
        icon: '/icon.svg',
        url: '/#mock-tests',
        tag: 'mock-test-live-alert',
      },
      daily_quiz: {
        title: 'दैनिक सराव आव्हान (Daily Practice)',
        body: '📝 RCC आणि Soil Mechanics चे 15 महत्त्वाचे MCQs उपलब्ध. रँक सुधारा!',
        icon: '/icon.svg',
        url: '/#practice',
        tag: 'daily-practice-alert',
      },
      study_reminder: {
        title: 'अभ्यास स्मरणपत्र (Study Reminder)',
        body: '⏱️ आजचे ठरवलेले उद्दिष्ट पूर्ण करण्यासाठी अजून 20 मिनिटे बाकी आहेत!',
        icon: '/icon.svg',
        url: '/#practice',
        tag: 'daily-study-reminder',
      },
      rank_update: {
        title: 'रँक अपडेट (Percentile Alert)',
        body: '🏆 PWD JE सराव टेस्टमध्ये तुम्ही 94.2 Percentile मिळवून टॉप 5% मध्ये आला आहात!',
        icon: '/icon.svg',
        url: '/#analytics',
        tag: 'percentile-alert',
      },
    };

    const target = presets[presetKey] || presets.exam_ad;
    return this.sendSystemNotification(target);
  }

  /**
   * Load saved user notification preferences
   */
  static getPreferences(): PushNotificationPreferences {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
      }
    } catch (_e) {
      // ignore JSON parse errors
    }
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Save user notification preferences
   */
  static savePreferences(prefs: PushNotificationPreferences): void {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch (_e) {
      // ignore storage errors
    }
  }
}
