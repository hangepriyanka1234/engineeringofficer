import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe lazy initialization of Supabase client
let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || (typeof window !== 'undefined' ? (window as any).__ENV__?.SUPABASE_URL : '') || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (window as any).__ENV__?.SUPABASE_ANON_KEY : '') || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const isConfigured = Boolean(url && (anonKey || serviceRoleKey));

  return {
    url,
    anonKey,
    serviceRoleKey,
    isConfigured,
  };
};

// Client for authenticated / public operations (safe for browser & server)
export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClient;
};

// Admin client with service_role key for backend operations (Server-side ONLY)
export const getSupabaseAdmin = (): SupabaseClient | null => {
  const { url, serviceRoleKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured || !url || !serviceRoleKey) {
    return null;
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdminClient;
};
