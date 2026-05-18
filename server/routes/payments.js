'use strict';
const express     = require('express');
const router      = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { getOrderById, confirmOrder, addPoints, getOrderCountByUser, scheduleCrm } = require('../services/queries');
const { sendOrderConfirm } = require('../services/solapi');
const { supabase } = require('../db');
const { IMP_KEY, IMP_SECRET } = require('../config');

// 포트원 액세스 토큰 발급
async function getImpToken() {
  const res = await fetch('https://api.iamport.kr/users/getToken', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ imp_key: IMP_KEY, imp_secret: IMP_SECRET }),
  });
  const { response } = await res.json();
  return response.access_token;
}

// 포트원 결제 정보 조회
async function getImpPayment(impUid, token) {
  const res = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
    headers: { Authorization: token },
  });
  const { response } = await res.json();
  return response; // { status, amount, merchant_uid, ... }
}

// 포트원 환불
async function refundPayment(impUid, token, reason) {
  await fetch('https://api.iamport.kr/payments/cancel', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body:    JSON.stringify({ imp_uid: impUid, reason }),
  });
}

// POST /api/payments/verify
// body: { impUid, orderId, pointsUsed? }
router.post('/verify', requireAuth, async (req, res) => {
  const { impUid, orderId, pointsUsed = 0 } = req.body;

  if (!impUid || !orderId) {
    return res.status(400).json({ error: 'impUid와 orderId가 필요합니다.' });
  }

  let impToken;
  try {
    impToken = await getImpToken();
  } catch {
    return res.status(502).json({ error: '포트원 연결 실패' });
  }

  try {
    // 1. 포트원에서 결제 정보 조회
    const payment = await getImpPayment(impUid, impToken);

    if (payment.status !== 'paid') {
      return res.status(400).json({ error: '결제가 완료되지 않았습니다.' });
    }

    // 2. DB에서 주문 금액 확인
    const order = await getOrderById(orderId);

    if (!order || order.user_id !== req.session.userId) {
      return res.status(403).json({ error: '유효하지 않은 주문입니다.' });
    }

    // 3. 금액 검증 (클라이언트 위변조 방지)
    if (payment.amount !== order.total_amount) {
      await refundPayment(impUid, impToken, '금액 불일치 자동 환불');
      return res.status(400).json({ error: '결제 금액이 일치하지 않아 자동 환불되었습니다.' });
    }

    // 4. 주문 확정
    await confirmOrder(orderId, impUid);

    // 5. 포인트 처리
    if (pointsUsed > 0) {
      await addPoints(req.session.userId, -pointsUsed, 'use_purchase');
    }

    // 재구매 포인트 (2번째 주문부터 1%)
    const orderCount = await getOrderCountByUser(req.session.userId);
    if (orderCount >= 2) {
      const cashback = Math.floor(order.total_amount * 0.01);
      if (cashback > 0) await addPoints(req.session.userId, cashback, 'purchase');
    }

    // 6. CRM 스케줄 등록 (D+7 / D+25 / D+60)
    await scheduleCrm(req.session.userId, orderId)
      .catch(err => console.error('[payments] CRM 스케줄 실패:', err.message));

    // 7. 주문 완료 알림톡
    const { data: user } = await supabase.from('users').select('nickname, phone').eq('id', req.session.userId).single();
    if (user?.phone) {
      await sendOrderConfirm({ phone: user.phone, nickname: user.nickname, orderAmount: order.total_amount })
        .catch(err => console.error('[payments] 알림톡 실패:', err.message));
    }

    res.json({ ok: true, orderId });
  } catch (err) {
    console.error('[payments] 결제 검증 실패:', err.message);
    res.status(500).json({ error: '결제 처리 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
