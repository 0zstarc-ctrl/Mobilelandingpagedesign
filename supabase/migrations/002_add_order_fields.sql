-- 주문 테이블에 포트원 merchant_uid, 포인트 사용 컬럼 추가
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS merchant_uid  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS points_used   INT NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_merchant_uid
  ON orders(merchant_uid)
  WHERE merchant_uid IS NOT NULL;

-- 회원 테이블에 전화번호 컬럼 추가 (알림톡 발송용)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
