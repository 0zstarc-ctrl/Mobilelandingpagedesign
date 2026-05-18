'use strict';
const express     = require('express');
const router      = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { createSampleRequest, hasSampleRequest } = require('../services/queries');
const { sendSampleConfirm } = require('../services/solapi');
const { supabase } = require('../db');

// POST /api/sample-requests — 배송지 저장
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, phone, address, addressSub, zipcode } = req.body;

    if (!name || !phone || !address || !zipcode) {
      return res.status(400).json({ error: '필수 항목을 모두 입력해 주세요.' });
    }

    // 1인 1회 체크
    const already = await hasSampleRequest(req.session.userId);
    if (already) {
      return res.status(409).json({ error: '이미 샘플팩을 신청하셨습니다.' });
    }

    const request = await createSampleRequest({
      user_id:     req.session.userId,
      name,
      phone,
      address,
      address_sub: addressSub ?? null,
      zipcode,
    });

    // 전화번호를 users 테이블에도 저장 (알림톡 발송용)
    await supabase.from('users').update({ phone }).eq('id', req.session.userId);

    // 신청 완료 알림톡
    const { data: user } = await supabase.from('users').select('nickname').eq('id', req.session.userId).single();
    await sendSampleConfirm({ phone, nickname: user?.nickname })
      .catch(err => console.error('[samples] 알림톡 실패:', err.message));

    res.json({ ok: true, requestId: request.id });
  } catch (err) {
    console.error('[samples] 샘플팩 신청 실패:', err.message);
    res.status(500).json({ error: '샘플팩 신청 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
