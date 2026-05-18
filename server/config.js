'use strict';

function get(key, fallback) {
  const val = process.env[key] ?? fallback;
  if (val === undefined) throw new Error(`Missing required env var: ${key}`);
  return val;
}

module.exports = {
  PORT:                    get('PORT', '3000'),
  NODE_ENV:                get('NODE_ENV', 'development'),
  CLIENT_URL:              get('CLIENT_URL', 'http://localhost:5173'),
  SESSION_SECRET:          get('SESSION_SECRET'),

  // Supabase — service_role 키는 절대 프론트엔드에 노출 금지
  SUPABASE_URL:            get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: get('SUPABASE_SERVICE_ROLE_KEY'),

  // 카카오
  KAKAO_REST_API_KEY:      get('KAKAO_REST_API_KEY'),
  KAKAO_CLIENT_SECRET:     get('KAKAO_CLIENT_SECRET', ''),
  KAKAO_REDIRECT_URI:      get('KAKAO_REDIRECT_URI'),

  // 포트원(I'mport)
  IMP_KEY:                 get('IMP_KEY', ''),
  IMP_SECRET:              get('IMP_SECRET', ''),

  // 솔라피
  SOLAPI_API_KEY:          get('SOLAPI_API_KEY', ''),
  SOLAPI_API_SECRET:       get('SOLAPI_API_SECRET', ''),
  SOLAPI_SENDER:           get('SOLAPI_SENDER', ''),
  KAKAO_CHANNEL_ID:        get('KAKAO_CHANNEL_ID', ''),
  SOLAPI_TEMPLATE_REVIEW:     get('SOLAPI_TEMPLATE_REVIEW', ''),
  SOLAPI_TEMPLATE_REPURCHASE: get('SOLAPI_TEMPLATE_REPURCHASE', ''),
  SOLAPI_TEMPLATE_CHECKIN:    get('SOLAPI_TEMPLATE_CHECKIN', ''),
};
