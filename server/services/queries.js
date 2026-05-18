'use strict';
const { supabase } = require('../db');

// ─── 회원 ─────────────────────────────────────────────────────

async function upsertUser({ kakao_id, nickname, gender, age_range, referrer, phone }) {
  const payload = { kakao_id, nickname, gender: gender ?? null, age_range: age_range ?? null, referrer: referrer ?? null };
  if (phone) payload.phone = phone;

  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'kakao_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ─── 건강 진단 ────────────────────────────────────────────────

async function saveDiagnosis({ user_id, answers, recommended_products }) {
  const { data, error } = await supabase
    .from('diagnosis')
    .insert({ user_id, answers, recommended_products })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── 포인트 ───────────────────────────────────────────────────

async function addPoints(userId, amount, reason) {
  const { error: histErr } = await supabase
    .from('point_history')
    .insert({ user_id: userId, amount, reason });
  if (histErr) throw histErr;

  const { error: rpcErr } = await supabase.rpc('increment_points', {
    p_user_id: userId,
    p_amount: amount,
  });
  if (rpcErr) throw rpcErr;
}

// ─── 샘플팩 ───────────────────────────────────────────────────

async function createSampleRequest({ user_id, name, phone, address, address_sub, zipcode }) {
  const { data, error } = await supabase
    .from('sample_requests')
    .insert({ user_id, name, phone, address, address_sub: address_sub ?? null, zipcode })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function hasSampleRequest(userId) {
  const { data } = await supabase
    .from('sample_requests')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return data !== null;
}

// ─── 주문 ─────────────────────────────────────────────────────

async function createOrder({ user_id, items, total_amount, payment_method, merchant_uid, points_used }) {
  const { data, error } = await supabase
    .from('orders')
    .insert({ user_id, items, total_amount, payment_method, merchant_uid, points_used: points_used ?? 0 })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

async function confirmOrder(orderId, impUid) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'paid', imp_uid: impUid })
    .eq('id', orderId);

  if (error) throw error;
}

async function getOrderCountByUser(userId) {
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'paid');

  if (error) throw error;
  return count ?? 0;
}

// ─── CRM 스케줄 ───────────────────────────────────────────────

async function scheduleCrm(userId, orderId) {
  const now = new Date();
  const days = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

  const schedules = [
    { user_id: userId, order_id: orderId, type: 'review_request', trigger_at: days(7) },
    { user_id: userId, order_id: orderId, type: 'repurchase',     trigger_at: days(25) },
    { user_id: userId, order_id: orderId, type: 'health_checkin', trigger_at: days(60) },
  ];

  const { error } = await supabase.from('crm_schedules').insert(schedules);
  if (error) throw error;
}

module.exports = {
  upsertUser, getUserById,
  saveDiagnosis,
  addPoints,
  createSampleRequest, hasSampleRequest,
  createOrder, getOrderById, confirmOrder, getOrderCountByUser,
  scheduleCrm,
};
