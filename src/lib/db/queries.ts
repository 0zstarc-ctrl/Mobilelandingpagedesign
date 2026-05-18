import { supabase } from '../supabase';
import type {
  UserRow,
  DiagnosisAnswer,
  SampleRequestRow,
  OrderItem,
  PaymentMethod,
} from './types';

// ─── 회원 ────────────────────────────────────────────────────

export async function upsertUser(data: {
  kakao_id: string;
  nickname: string;
  gender: UserRow['gender'];
  age_range: string | null;
  referrer: string | null;
}) {
  const { data: user, error } = await supabase
    .from('users')
    .upsert(data, { onConflict: 'kakao_id' })
    .select()
    .single();

  if (error) throw error;
  return user;
}

export async function getUserByKakaoId(kakaoId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('kakao_id', kakaoId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

// ─── 건강 진단 ───────────────────────────────────────────────

export async function saveDiagnosis(data: {
  user_id: string;
  answers: DiagnosisAnswer[];
  recommended_products: string[];
}) {
  const { data: diagnosis, error } = await supabase
    .from('diagnosis')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return diagnosis;
}

// ─── 샘플팩 신청 ─────────────────────────────────────────────

export async function createSampleRequest(
  data: Omit<SampleRequestRow, 'id' | 'status' | 'created_at'>
) {
  const { data: request, error } = await supabase
    .from('sample_requests')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return request;
}

export async function hasSampleRequest(userId: string) {
  const { data } = await supabase
    .from('sample_requests')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  return data !== null;
}

// ─── 포인트 ──────────────────────────────────────────────────

export async function addPoints(userId: string, amount: number, reason: string) {
  const { error: historyError } = await supabase
    .from('point_history')
    .insert({ user_id: userId, amount, reason });

  if (historyError) throw historyError;

  const { error: updateError } = await supabase.rpc('increment_points', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (updateError) throw updateError;
}

// ─── 주문 ────────────────────────────────────────────────────

export async function createOrder(data: {
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
}) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return order;
}

export async function confirmOrder(orderId: string, impUid: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'paid', imp_uid: impUid })
    .eq('id', orderId);

  if (error) throw error;
}

// ─── CRM 스케줄 ──────────────────────────────────────────────

export async function scheduleCrm(userId: string, orderId: string) {
  const now = new Date();

  const schedules = [
    {
      user_id: userId,
      order_id: orderId,
      type: 'review_request' as const,
      trigger_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      order_id: orderId,
      type: 'repurchase' as const,
      trigger_at: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      order_id: orderId,
      type: 'health_checkin' as const,
      trigger_at: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { error } = await supabase.from('crm_schedules').insert(schedules);
  if (error) throw error;
}
