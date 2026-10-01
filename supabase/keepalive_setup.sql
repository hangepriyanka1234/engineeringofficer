-- ==============================================================================
-- Supabase 24/7 Anti-Pause & Keep-Alive Table Definition
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create Keep-Alive Logs Table
CREATE TABLE IF NOT EXISTS public.keepalive_logs (
    id BIGSERIAL PRIMARY KEY,
    pinged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    source TEXT NOT NULL DEFAULT 'server_heartbeat_daemon',
    status TEXT NOT NULL DEFAULT 'ok',
    notes TEXT DEFAULT 'Automatic 24/7 Anti-Pause Ping'
);

-- 2. Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_keepalive_pinged_at ON public.keepalive_logs (pinged_at DESC);

-- 3. Enable RLS (Row Level Security) with read/write policies
ALTER TABLE public.keepalive_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon and service_role to insert keepalive logs
CREATE POLICY "Allow public inserts for keepalive pings"
    ON public.keepalive_logs
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (true);

-- Allow reading logs
CREATE POLICY "Allow reading keepalive logs"
    ON public.keepalive_logs
    FOR SELECT
    TO anon, authenticated, service_role
    USING (true);

-- 4. Initial seed entry to verify connection
INSERT INTO public.keepalive_logs (source, status, notes)
VALUES ('initial_setup', 'active', 'Engineering Officer BY MH Supabase Keep-Alive Engine initialized');
