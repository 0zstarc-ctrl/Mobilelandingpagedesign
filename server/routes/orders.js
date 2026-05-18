'use strict';
const express     = require('express');
const router      = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { createOrder, getOrderById } = require('../services/queries');

// POST /api/orders — 주문 생성 (결제 전)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, totalAmount, pointsUsed = 0, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '주문 항목이 없습니다.' });
    }
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return res.status(400).json({ error: '유효하지 않은 금액입니다.' });
    }

    // merchant_uid: 포트원에 전달할 고유 주문번호
    const merchantUid = `picknpill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const finalAmount = totalAmount - pointsUsed;

    const order = await createOrder({
      user_id:        req.session.userId,
      items,
      total_amount:   finalAmount,
      payment_method: paymentMethod,
      merchant_uid:   merchantUid,
      points_used:    pointsUsed,
    });

    res.json({ orderId: order.id, merchantUid, amount: finalAmount });
  } catch (err) {
    console.error('[orders] 주문 생성 실패:', err.message);
    res.status(500).json({ error: '주문 생성 중 오류가 발생했습니다.' });
  }
});

// GET /api/orders — 내 주문 목록
router.get('/', requireAuth, async (req, res) => {
  try {
    const { supabase } = require('../db');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.session.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ orders: data });
  } catch (err) {
    res.status(500).json({ error: '주문 조회 실패' });
  }
});

module.exports = router;
