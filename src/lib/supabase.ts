import { createClient } from '@supabase/supabase-js';
import type { Database } from './db/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.\n.env 파일을 확인하세요.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
