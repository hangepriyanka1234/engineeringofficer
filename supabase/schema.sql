-- ====================================================================
-- ENGINEERING OFFICER BY SP - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Comprehensive schema with RLS policies, indexing, quota protection,
-- AI cost ledger, storage metadata, audit logs and performance views.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'Free',
  tier_expires_at TIMESTAMPTZ,
  target_exams TEXT[] DEFAULT '{"maha_pwd"}',
  preferred_language TEXT DEFAULT 'en',
  daily_study_hours NUMERIC DEFAULT 4.0,
  is_admin BOOLEAN DEFAULT FALSE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(subscription_tier);

-- 3. MISTAKE NOTEBOOK TABLE
CREATE TABLE IF NOT EXISTS public.mistake_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  canonical_question_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  selected_option_index INT,
  correct_option_index INT NOT NULL,
  error_category TEXT NOT NULL,
  personal_note TEXT,
  mastery_status TEXT NOT NULL DEFAULT 'active',
  attempt_count INT DEFAULT 1,
  next_revision_date DATE DEFAULT CURRENT_DATE,
  ease_factor NUMERIC DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mistake Notebook RLS & Indexing
ALTER TABLE public.mistake_notebook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mistake records"
  ON public.mistake_notebook FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mistakes_user_subject ON public.mistake_notebook(user_id, subject_name);
CREATE INDEX IF NOT EXISTS idx_mistakes_revision_date ON public.mistake_notebook(user_id, next_revision_date);
CREATE INDEX IF NOT EXISTS idx_mistakes_canonical_q ON public.mistake_notebook(canonical_question_id);

-- 4. TEST SESSIONS & SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  exam_target_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_marks NUMERIC DEFAULT 0,
  score_obtained NUMERIC DEFAULT 0,
  positive_marks NUMERIC DEFAULT 0,
  negative_marks NUMERIC DEFAULT 0,
  accuracy_percent NUMERIC DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view and insert own test sessions"
  ON public.test_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_test_sessions_user ON public.test_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_sessions_exam ON public.test_sessions(exam_target_id);

-- 5. AI USAGE LEDGER & COST TRACKING (Part 30)
CREATE TABLE IF NOT EXISTS public.ai_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_tier TEXT NOT NULL,
  query_type TEXT NOT NULL DEFAULT 'concept',
  model_used TEXT NOT NULL,
  prompt_tokens INT DEFAULT 0,
  response_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  estimated_cost_inr NUMERIC(10, 4) DEFAULT 0.0000,
  cache_hit BOOLEAN DEFAULT FALSE,
  latency_ms INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own AI usage ledger"
  ON public.ai_usage_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Server inserts AI usage logs"
  ON public.ai_usage_ledger FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ai_ledger_user_date ON public.ai_usage_ledger(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_ledger_status ON public.ai_usage_ledger(status);

-- 6. VERIFIED RECRUITMENT NOTICES
CREATE TABLE IF NOT EXISTS public.recruitment_notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authority TEXT NOT NULL,
  exam_category TEXT NOT NULL,
  post_name TEXT NOT NULL,
  total_vacancies INT,
  notification_date DATE,
  application_start_date DATE,
  application_end_date DATE,
  official_pdf_url TEXT,
  official_portal_url TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recruitment_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified recruitment notices"
  ON public.recruitment_notices FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_notices_status ON public.recruitment_notices(status, application_end_date);

-- 7. PAYMENTS & ENTITLEMENTS
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT,
  amount_rupees NUMERIC NOT NULL,
  plan_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  razorpay_signature TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payments"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payment_transactions(user_id, status);

-- 8. REFERRAL CODES & FRAUD PREVENTION
CREATE TABLE IF NOT EXISTS public.referral_accounts (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  total_referrals INT DEFAULT 0,
  verified_referrals INT DEFAULT 0,
  bonus_credits INT DEFAULT 0,
  risk_score INT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referral stats"
  ON public.referral_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- 9. ADMIN AUDIT LOGS (Part 32)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.admin_audit_logs(actor_email);

-- 10. STORAGE METADATA & ORPHAN AUDIT (Part 31)
CREATE TABLE IF NOT EXISTS public.storage_objects (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  bucket TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  requires_tier TEXT NOT NULL DEFAULT 'free',
  download_count INT DEFAULT 0,
  is_orphan BOOLEAN DEFAULT FALSE,
  sha256_checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.storage_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view object metadata"
  ON public.storage_objects FOR SELECT
  USING (true);

-- 11. SUMMARY MATERIALIZED VIEW FOR DASHBOARD AGGREGATION (Part 29 Optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_student_daily_activity AS
SELECT
  p.id AS user_id,
  p.subscription_tier,
  COUNT(DISTINCT ts.id) AS total_tests_attempted,
  COALESCE(AVG(ts.accuracy_percent), 0) AS avg_accuracy,
  COUNT(DISTINCT mn.id) AS active_mistakes_count
FROM public.profiles p
LEFT JOIN public.test_sessions ts ON ts.user_id = p.id
LEFT JOIN public.mistake_notebook mn ON mn.user_id = p.id AND mn.mastery_status = 'active'
GROUP BY p.id, p.subscription_tier;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_student_daily_user ON public.mv_student_daily_activity(user_id);

-- Refresh procedure
CREATE OR REPLACE FUNCTION public.refresh_student_daily_activity()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_student_daily_activity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 12. 20,000+ CIVIL ENGINEERING QUESTION BANK & BULK IMPORT ENGINE
-- High-performance schema supporting 20k+ questions, version control,
-- duplicate hashing, audit logs, and AI explanation queues.
-- ====================================================================

-- Master Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D' or numeric
  explanation TEXT,
  subject_id TEXT NOT NULL,
  subject_name TEXT,
  topic_id TEXT NOT NULL DEFAULT 'general',
  topic_name TEXT,
  subtopic_id TEXT,
  exam_id TEXT NOT NULL DEFAULT 'maha_pwd',
  exam_year INT DEFAULT 2024,
  question_type TEXT NOT NULL DEFAULT 'standard_mcq', -- 'standard_mcq', 'numerical', 'multiple_choice', 'assertion_reason', 'match_the_following', 'statement_based'
  difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  language TEXT NOT NULL DEFAULT 'English', -- 'English', 'Marathi', 'Hindi', 'Bilingual'
  is_pyq BOOLEAN NOT NULL DEFAULT FALSE,
  source TEXT,
  source_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified', -- 'unverified', 'under_review', 'verified', 'rejected'
  image_url TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  version INT NOT NULL DEFAULT 1,
  text_hash TEXT NOT NULL,
  is_code_reference TEXT,
  formula TEXT,
  unit TEXT,
  marks NUMERIC DEFAULT 2.0,
  negative_marks NUMERIC DEFAULT 0.5,
  reviewer TEXT,
  options_json JSONB DEFAULT '[]'::jsonb,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for sub-second query performance over 20,000+ records
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_year ON public.questions(exam_id, exam_year DESC);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_verification ON public.questions(verification_status);
CREATE INDEX IF NOT EXISTS idx_questions_is_pyq ON public.questions(is_pyq);
CREATE INDEX IF NOT EXISTS idx_questions_is_archived ON public.questions(is_archived);
CREATE INDEX IF NOT EXISTS idx_questions_text_hash ON public.questions(text_hash);
CREATE INDEX IF NOT EXISTS idx_questions_type_lang ON public.questions(question_type, language);

-- Full-Text Search index for rapid question stem lookups
CREATE INDEX IF NOT EXISTS idx_questions_text_fts ON public.questions USING gin(to_tsvector('english', question_text));

-- Question Bank RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Students and authenticated users can view active, non-archived questions
CREATE POLICY "Public / Students can view published active questions"
  ON public.questions FOR SELECT
  USING (is_archived = false AND (verification_status = 'verified' OR is_pyq = false));

-- Only Admins and Super Admins can insert, update, archive, or delete questions
CREATE POLICY "Admins full management on question bank"
  ON public.questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

-- 13. QUESTION VERSIONING & CHANGELOG AUDIT
CREATE TABLE IF NOT EXISTS public.question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL REFERENCES public.questions(question_id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  snapshot_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.question_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view question revision history"
  ON public.question_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE INDEX IF NOT EXISTS idx_q_versions_qid ON public.question_versions(question_id, version_number DESC);

-- 14. BULK IMPORT AUDIT HISTORY
CREATE TABLE IF NOT EXISTS public.import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id TEXT NOT NULL UNIQUE,
  admin_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  upload_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_rows INT NOT NULL DEFAULT 0,
  imported_count INT NOT NULL DEFAULT 0,
  duplicate_count INT NOT NULL DEFAULT 0,
  rejected_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'COMPLETED', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
  duration_ms INT NOT NULL DEFAULT 0,
  error_log_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view import histories"
  ON public.import_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE INDEX IF NOT EXISTS idx_import_history_created ON public.import_history(created_at DESC);

-- 15. AI EXPLANATION GENERATION QUEUE
CREATE TABLE IF NOT EXISTS public.ai_explanation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL REFERENCES public.questions(question_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'generating', 'generated', 'approved', 'rejected'
  generated_explanation TEXT,
  model_used TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  cost_inr NUMERIC(10, 4) DEFAULT 0.0000,
  prompt_tokens INT DEFAULT 0,
  response_tokens INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

ALTER TABLE public.ai_explanation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI explanation queue"
  ON public.ai_explanation_queue FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON public.ai_explanation_queue(status);

-- ====================================================================
-- 16. MONETIZATION, PLANS, ENTITLEMENTS & RAZORPAY PAYMENT SYSTEM
-- ====================================================================

-- A. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  original_price NUMERIC(10, 2),
  currency TEXT NOT NULL DEFAULT 'INR',
  duration INT NOT NULL DEFAULT 6, -- e.g. 6
  duration_unit TEXT NOT NULL DEFAULT 'months', -- 'days', 'months', 'years', 'lifetime'
  billing_type TEXT NOT NULL DEFAULT 'ONE_TIME', -- 'FREE', 'ONE_TIME', 'SUBSCRIPTION'
  product_type TEXT NOT NULL DEFAULT 'bundle', -- 'mcq_bank', 'pyq_bank', 'test_series', 'ai_pro', 'video_library', 'bundle', 'single_item'
  active BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 1,
  included_products TEXT[] NOT NULL DEFAULT '{}', -- e.g. '{"MCQ_BANK", "PYQ_BANK", "TEST_SERIES"}'
  ai_daily_limit INT DEFAULT 10,
  ai_monthly_limit INT DEFAULT 300,
  question_access_limit INT DEFAULT -1, -- -1 = unlimited
  test_access_limit INT DEFAULT -1,
  video_access BOOLEAN DEFAULT FALSE,
  badge TEXT,
  features_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (active = TRUE OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

-- B. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value NUMERIC(10, 2) NOT NULL, -- e.g. 50 (for 50%) or 200 (for ₹200)
  minimum_amount NUMERIC(10, 2) DEFAULT 0.00,
  maximum_discount NUMERIC(10, 2) DEFAULT 1000.00,
  usage_limit INT DEFAULT 1000,
  used_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  applicable_plans TEXT[] DEFAULT '{}', -- empty = all plans
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can query active coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (active = TRUE);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

-- C. PAYMENT ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  razorpay_order_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  coupon_code TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED', 'EXPIRED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment orders"
  ON public.payment_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment orders"
  ON public.payment_orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_rzp ON public.payment_orders(razorpay_order_id);

-- D. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  razorpay_order_id TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'REFUNDED'
  payment_method TEXT DEFAULT 'UPI', -- 'UPI', 'CARD', 'NETBANKING', 'WALLET'
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.payment_transactions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE INDEX IF NOT EXISTS idx_payment_tx_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_rzp_pay ON public.payment_transactions(razorpay_payment_id);

-- E. USER ENTITLEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- 'MCQ_BANK', 'PYQ_BANK', 'TEST_SERIES', 'FULL_TESTS', 'FORMULA_LAB', 'AI_PRO', 'STUDY_PLANNER', 'VIDEO_LIBRARY', etc.
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  source TEXT NOT NULL DEFAULT 'purchase', -- 'purchase', 'admin_grant', 'referral_reward', 'trial'
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'SUSPENDED'
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements"
  ON public.user_entitlements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user entitlements"
  ON public.user_entitlements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE INDEX IF NOT EXISTS idx_entitlements_user_prod ON public.user_entitlements(user_id, product_id, status);
CREATE INDEX IF NOT EXISTS idx_entitlements_expiry ON public.user_entitlements(expires_at);

-- F. REFUNDS TABLE
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL,
  razorpay_refund_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROCESSED', -- 'PROCESSED', 'PENDING', 'FAILED'
  reason TEXT,
  admin_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view and manage refunds"
  ON public.refunds FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

-- G. PAYMENT AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- 'ORDER_CREATED', 'PAYMENT_VERIFIED', 'ENTITLEMENT_ACTIVATED', 'REFUND_PROCESSED', 'PLAN_MODIFIED', 'COUPON_APPLIED', 'WEBHOOK_RECEIVED'
  user_id TEXT,
  order_id TEXT,
  payment_id TEXT,
  details_json JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment audit logs"
  ON public.payment_audit_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR is_super_admin = true)
  ));

CREATE INDEX IF NOT EXISTS idx_payment_audit_action ON public.payment_audit_logs(action, created_at DESC);

