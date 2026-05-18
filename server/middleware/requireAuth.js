'use strict';

// 세션 인증 미들웨어 — userId 없으면 401 반환
module.exports = function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  next();
};
