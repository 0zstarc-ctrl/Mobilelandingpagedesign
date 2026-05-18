// Supabase 테이블 타입 정의
// HLD §6 DB 스키마 기반

export type Gender = 'male' | 'female';
export type PaymentMethod = 'kakaopay' | 'naverpay' | 'card';
export type OrderStatus = 'paid' | 'shipped' | 'delivered';
export type SampleStatus = 'pending' | 'shipped' | 'done';
export type CrmType = 'review_request' | 'repurchase' | 'health_checkin';
export type CrmStatus = 'pending' | 'sent' | 'failed';

// ─── 테이블 Row 타입 ────────────────────────────────────────

export interface UserRow {
  id: string;
  kakao_id: string;
  nickname: string | null;
  gender: Gender | null;
  age_range: string | null;        // '20~29' | '30~39' | '40~49' 등
  referrer: string | null;         // 유튜버 ref 코드
  point: number;
  created_at: string;
}

export interface DiagnosisRow {
  id: string;
  user_id: string;
  answers: DiagnosisAnswer[];
  recommended_products: string[];  // 제품 ID 배열
  created_at: string;
}

export interface DiagnosisAnswer {
  question_id: number;
  answer_index: number;
}

export interface SampleRequestRow {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  address_sub: string | null;
  zipcode: string;
  status: SampleStatus;
  created_at: string;
}

export interface PointHistoryRow {
  id: string;
  user_id: string;
  amount: number;                  // 양수: 적립, 음수: 사용
  reason: string;                  // 'diagnosis_complete' | 'review' | 'purchase'
  created_at: string;
}

export interface OrderRow {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  imp_uid: string | null;          // 포트원 결제 고유번호
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  qty: number;
  price: number;
}

export interface CrmScheduleRow {
  id: string;
  user_id: string;
  order_id: string;
  type: CrmType;
  trigger_at: string;
  status: CrmStatus;
}

// ─── Supabase Database 제네릭 타입 ─────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, 'id' | 'point' | 'created_at'> & {
          id?: string;
          point?: number;
        };
        Update: Partial<Omit<UserRow, 'id' | 'created_at'>>;
      };
      diagnosis: {
        Row: DiagnosisRow;
        Insert: Omit<DiagnosisRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<DiagnosisRow, 'id' | 'created_at'>>;
      };
      sample_requests: {
        Row: SampleRequestRow;
        Insert: Omit<SampleRequestRow, 'id' | 'status' | 'created_at'> & {
          id?: string;
          status?: SampleStatus;
        };
        Update: Partial<Omit<SampleRequestRow, 'id' | 'created_at'>>;
      };
      point_history: {
        Row: PointHistoryRow;
        Insert: Omit<PointHistoryRow, 'id' | 'created_at'> & { id?: string };
        Update: never;
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, 'id' | 'status' | 'created_at'> & {
          id?: string;
          status?: OrderStatus;
        };
        Update: Partial<Omit<OrderRow, 'id' | 'created_at'>>;
      };
      crm_schedules: {
        Row: CrmScheduleRow;
        Insert: Omit<CrmScheduleRow, 'id' | 'status'> & {
          id?: string;
          status?: CrmStatus;
        };
        Update: Pick<CrmScheduleRow, 'status'>;
      };
    };
    Views: {
      youtuber_settlement: {
        Row: {
          youtuber_code: string;
          period: string;
          new_members: number;
          order_count: number;
          total_revenue: number;
          avg_order_value: number;
        };
      };
    };
  };
}
