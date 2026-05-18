'use strict';
const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const { PORT, NODE_ENV, CLIENT_URL, SESSION_SECRET } = require('./config');

const app = express();

// CORS — 프론트엔드 도메인만 허용
app.use(cors({
  origin:      CLIENT_URL,
  credentials: true,
}));

app.use(express.json());

// 세션 (프로덕션에서는 Redis 스토어로 교체 권장)
app.use(session({
  secret:            SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7일
  },
}));

// 라우트
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/orders',          require('./routes/orders'));
app.use('/api/payments',        require('./routes/payments'));
app.use('/api/sample-requests', require('./routes/samples'));

// 헬스체크 (Render 업타임 모니터링)
app.get('/health', (_req, res) => res.json({ ok: true, env: NODE_ENV }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

// 글로벌 에러 핸들러
app.use((err, _req, res, _next) => {
  console.error('[server] 처리되지 않은 오류:', err.message);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`[server] 픽앤필 API 서버 시작 — port ${PORT} (${NODE_ENV})`);
});
