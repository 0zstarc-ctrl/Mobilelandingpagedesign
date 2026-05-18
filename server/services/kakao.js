'use strict';
const { KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI } = require('../config');

const TOKEN_URL   = 'https://kauth.kakao.com/oauth/token';
const USERINFO_URL = 'https://kapi.kakao.com/v2/user/me';

// 인가코드 → 액세스 토큰 교환
async function getAccessToken(code) {
  const params = new URLSearchParams({
    grant_type:   'authorization_code',
    client_id:    KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    code,
    ...(KAKAO_CLIENT_SECRET ? { client_secret: KAKAO_CLIENT_SECRET } : {}),
  });

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(`카카오 토큰 오류: ${body.error_description ?? body.error}`);
  }

  const { access_token } = await res.json();
  return access_token;
}

// 사용자 정보 조회
async function getUserInfo(accessToken) {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('카카오 사용자 정보 조회 실패');

  const data = await res.json();
  const acct = data.kakao_account ?? {};

  return {
    kakao_id:  String(data.id),
    nickname:  acct.profile?.nickname ?? null,
    gender:    acct.gender ?? null,        // 'male' | 'female' | null
    age_range: acct.age_range ?? null,     // '20~29' | '30~39' 등
  };
}

module.exports = { getAccessToken, getUserInfo };
