-- ============================================================
-- Pick & Pill — Supabase 초기 스키마
-- Supabase 대시보드 > SQL Editor 에서 실행
-- ============================================================

-- ── 1. 회원 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kakao_id    VARCHAR(50)  UNIQUE NOT NULL,
  nickname    VARCHAR(100),
  gender      VARCHAR(10),          -- 'male' | 'female'
  age_range   VARCHAR(10),          -- '20~29' | '30~39' | '40~49'
  referrer    VARCHAR(100),         -- 유튜버 ref 코드 (ytA, healthking 등)
  point       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. 건강 진단 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnosis (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers              JSONB NOT NULL,
  recommended_products JSONB NOT NULL DEFAULT '[]',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. 샘플팩 신청 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sample_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 1인 1회
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  address     VARCHAR(300) NOT NULL,
  address_sub VARCHAR(100),
  zipcode     VARCHAR(10)  NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending', -- pending | shipped | done
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. 포인트 내역 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS point_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INT  NOT NULL,        -- 양수: 적립, 음수: 사용
  reason      VARCHAR(100) NOT NULL, -- 'diagnosis_complete' | 'review' | 'purchase'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. 주문 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items          JSONB NOT NULL,
  total_amount   INT  NOT NULL,
  payment_method VARCHAR(20),       -- 'kakaopay' | 'naverpay' | 'card'
  imp_uid        VARCHAR(100),      -- 포트원 결제 고유번호
  status         VARCHAR(20) NOT NULL DEFAULT 'paid', -- paid | shipped | delivered
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. CRM 발송 스케줄 ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type        VARCHAR(30) NOT NULL,  -- 'review_request' | 'repurchase' | 'health_checkin'
  trigger_at  TIMESTAMPTZ NOT NULL,
  status      VARCHAR(10) NOT NULL DEFAULT 'pending' -- pending | sent | failed
);

-- ── 7. 인덱스 ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_referrer       ON users(referrer);
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_crm_trigger_status   ON crm_schedules(trigger_at, status);
CREATE INDEX IF NOT EXISTS idx_diagnosis_user_id    ON diagnosis(user_id);

-- ── 8. 포인트 증감 RPC 함수 ──────────────────────────────────
CREATE OR REPLACE FUNCTION increment_points(p_user_id UUID, p_amount INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users SET point = point + p_amount WHERE id = p_user_id;
END;
$$;

-- ── 9. 유튜버 정산 뷰 ────────────────────────────────────────
CREATE OR REPLACE VIEW youtuber_settlement AS
  SELECT
    u.referrer                                AS youtuber_code,
    DATE_TRUNC('month', o.created_at)         AS period,
    COUNT(DISTINCT u.id)                      AS new_members,
    COUNT(o.id)                               AS order_count,
    COALESCE(SUM(o.total_amount), 0)          AS total_revenue,
    COALESCE(ROUND(AVG(o.total_amount)), 0)   AS avg_order_value
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  WHERE u.referrer IS NOT NULL
  GROUP BY u.referrer, DATE_TRUNC('month', o.created_at);

-- ── 10. Row Level Security ───────────────────────────────────
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_schedules   ENABLE ROW LEVEL SECURITY;

-- 백엔드 서버는 service_role 키를 사용하므로 RLS bypass.
-- 아래 정책은 클라이언트 직접 접근 시 보안 레이어로 동작.

CREATE POLICY "본인 데이터만 조회" ON users
  FOR SELECT USING (auth.uid()::text = kakao_id);

CREATE POLICY "본인 진단 조회" ON diagnosis
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE auth.uid()::text = kakao_id
  ));

CREATE POLICY "본인 주문 조회" ON orders
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE auth.uid()::text = kakao_id
  ));
