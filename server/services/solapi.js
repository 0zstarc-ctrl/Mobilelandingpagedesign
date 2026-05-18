'use strict';
const crypto = require('crypto');
const { SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER, KAKAO_CHANNEL_ID } = require('../config');

const BASE_URL = 'https://api.solapi.com';

function makeAuthHeader() {
  const date      = new Date().toISOString();
  const salt      = crypto.randomBytes(16).toString('hex');
  const signature = crypto
    .createHmac('sha256', SOLAPI_API_SECRET)
    .update(`${date}${salt}`)
    .digest('hex');

  return `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
}

// 알림톡 단건 발송
async function sendAlimtalk({ to, templateCode, variables }) {
  if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET) {
    console.warn('[solapi] API 키 미설정 — 알림톡 전송 건너뜀');
    return;
  }

  const res = await fetch(`${BASE_URL}/messages/v4/send`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  makeAuthHeader(),
    },
    body: JSON.stringify({
      message: {
        to,
        from: SOLAPI_SENDER,
        kakaoOptions: {
          pfId:       KAKAO_CHANNEL_ID,
          templateId: templateCode,
          variables,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`솔라피 오류: ${body.errorMessage ?? res.statusText}`);
  }

  return res.json();
}

// 주문 완료 알림톡
async function sendOrderConfirm({ phone, nickname, orderAmount }) {
  return sendAlimtalk({
    to:           phone,
    templateCode: process.env.SOLAPI_TEMPLATE_ORDER,
    variables: {
      '#{이름}':     nickname ?? '고객',
      '#{주문금액}':  orderAmount.toLocaleString(),
    },
  });
}

// 샘플팩 신청 완료 알림톡
async function sendSampleConfirm({ phone, nickname }) {
  return sendAlimtalk({
    to:           phone,
    templateCode: process.env.SOLAPI_TEMPLATE_SAMPLE,
    variables: { '#{이름}': nickname ?? '고객' },
  });
}

module.exports = { sendAlimtalk, sendOrderConfirm, sendSampleConfirm };
