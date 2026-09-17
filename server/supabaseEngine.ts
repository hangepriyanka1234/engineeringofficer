import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client singleton with automatic graceful fallback
class ServerSupabaseEngine {
  private static client: SupabaseClient | null = null;
  private static adminClient: SupabaseClient | null = null;

  public static isConfigured(): boolean {
    return Boolean(
      process.env.SUPABASE_URL && 
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
    );
  }

  public static getClient(): SupabaseClient | null {
    if (!this.isConfigured()) {
      return null;
    }
    if (!this.client) {
      const url = process.env.SUPABASE_URL!;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
      this.client = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('[SupabaseEngine] Connected to Supabase project at', url);
    }
    return this.client;
  }

  // Health check & test connectivity
  public static async testConnection(): Promise<{
    connected: boolean;
    url?: string;
    message: string;
    tablesFound?: string[];
  }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'Supabase credentials not configured in environment variables (SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY). Using server-authoritative local storage engine.',
      };
    }

    try {
      const client = this.getClient();
      if (!client) {
        return { connected: false, message: 'Failed to initialize Supabase client.' };
      }

      // Perform light ping query to profiles table or check database status
      const { data, error } = await client.from('profiles').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116') {
        // If table doesn't exist yet, it's connected to Supabase but schema needs to be run
        if (error.message.includes('relation "profiles" does not exist') || error.code === '42P01') {
          return {
            connected: true,
            url: process.env.SUPABASE_URL,
            message: 'Connected to Supabase! (Note: Remember to execute schema.sql in Supabase SQL Editor to create tables).',
          };
        }
        return {
          connected: false,
          url: process.env.SUPABASE_URL,
          message: `Supabase connection error: ${error.message}`,
        };
      }

      return {
        connected: true,
        url: process.env.SUPABASE_URL,
        message: 'Supabase PostgreSQL database connected and operational with Real-Time & RLS capabilities.',
      };
    } catch (err: any) {
      return {
        connected: false,
        url: process.env.SUPABASE_URL,
        message: `Connection attempt failed: ${err.message}`,
      };
    }
  }

  // Synchronize student profile
  public static async syncProfile(profile: {
    id?: string;
    email: string;
    name: string;
    role?: string;
    tier?: string;
    targetExams?: string[];
  }) {
    const client = this.getClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('profiles').upsert(
        {
          email: profile.email,
          name: profile.name,
          role: profile.role || 'student',
          tier: profile.tier || 'free',
          target_exams: profile.targetExams || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
      if (error) console.warn('[SupabaseEngine] Profile sync warning:', error.message);
      return data;
    } catch (err) {
      console.warn('[SupabaseEngine] Profile sync failed:', err);
      return null;
    }
  }

  // Record test attempt into Supabase
  public static async recordTestAttempt(attempt: {
    userId: string;
    testId: string;
    score: number;
    totalMarks: number;
    accuracyPercent: number;
    timeSpentSeconds: number;
    answers: Record<string, any>;
  }) {
    const client = this.getClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('test_attempts').insert({
        user_id: attempt.userId,
        test_id: attempt.testId,
        score: attempt.score,
        total_marks: attempt.totalMarks,
        accuracy_percent: attempt.accuracyPercent,
        time_spent_seconds: attempt.timeSpentSeconds,
        answers_json: attempt.answers,
        submitted_at: new Date().toISOString(),
      });
      if (error) console.warn('[SupabaseEngine] Attempt recording warning:', error.message);
      return data;
    } catch (err) {
      console.warn('[SupabaseEngine] Attempt recording failed:', err);
      return null;
    }
  }
}

export { ServerSupabaseEngine };
