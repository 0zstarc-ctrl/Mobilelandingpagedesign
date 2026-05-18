'use strict';
const express   = require('express');
const router    = express.Router();
const { getAccessToken, getUserInfo } = require('../services/kakao');
const { upsertUser, getUserById, saveDiagnosis, addPoints } = require('../services/queries');
const requireAuth = require('../middleware/requireAuth');

// POST /api/auth/kakao/callback
// body: { code, referrer?, benefit?, answers?, recommendedProducts? }
router.post('/kakao/callback', async (req, res) => {
  try {
    const { code, referrer, benefit, answers, recommendedProducts } = req.body;

    if (!code) return res.status(400).json({ error: 'code가 필요합니다.' });

    // 1. 인가코드 → 액세스 토큰
    const accessToken = await getAccessToken(code);

    // 2. 카카오 사용자 정보 조회
    const kakaoUser = await getUserInfo(accessToken);

    // 3. DB upsert (referrer는 첫 로그인 시에만 저장)
    const user = await upsertUser({
      kakao_id:  kakaoUser.kakao_id,
      nickname:  kakaoUser.nickname,
      gender:    kakaoUser.gender,
      age_range: kakaoUser.age_range,
      referrer:  referrer ?? null,
    });

    // 4. 세션 저장
    req.session.userId = user.id;

    // 5. 진단 결과 저장 (answers가 있을 때만)
    if (Array.isArray(answers) && answers.length > 0) {
      await saveDiagnosis({
        user_id:              user.id,
        answers,
        recommended_products: recommendedProducts ?? [],
      }).catch(err => console.error('[auth] saveDiagnosis 실패:', err.message));
    }

    // 6. 혜택 처리
    if (benefit === 'points') {
      await addPoints(user.id, 500, 'diagnosis_complete')
        .catch(err => console.error('[auth] addPoints 실패:', err.message));
    }
    // 'sample'은 /api/sample-requests 에서 배송지 입력 후 처리

    res.json({ user });
  } catch (err) {
    console.error('[auth] 카카오 로그인 실패:', err.message);
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

// GET /api/me — 세션 사용자 조회
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: '사용자 조회 실패' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

module.exports = router;
