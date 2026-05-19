import { useEffect, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { kakaoLogin } from '@/lib/api';

export default function KakaoCallback() {
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errParam = params.get('error');

    if (errParam || !code) {
      setError(errParam === 'access_denied' ? '로그인을 취소했습니다.' : '카카오 로그인에 실패했습니다.');
      return;
    }

    const benefit = sessionStorage.getItem('picknpill_benefit') ?? 'points';
    const answers: unknown[] = JSON.parse(sessionStorage.getItem('picknpill_answers') ?? '[]');

    kakaoLogin(code, benefit, answers)
      .then(() => {
        sessionStorage.setItem('picknpill_login_ok', '1');
        window.location.replace('/');
      })
      .catch(err => {
        console.error('[kakao callback]', err);
        setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center font-sans">
        <p className="text-3xl">😢</p>
        <p className="text-lg font-bold text-gray-800">{error}</p>
        <button
          onClick={() => window.location.replace('/')}
          className="mt-2 text-[#1A7F5A] underline underline-offset-2 text-sm hover:opacity-70 transition-opacity"
        >
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 font-sans">
      <div className="w-14 h-14 rounded-full bg-[#1A7F5A] flex items-center justify-center shadow-lg">
        <HeartPulse className="w-7 h-7 text-white" />
      </div>
      <div className="w-8 h-8 border-4 border-[#1A7F5A] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">카카오 로그인 처리 중...</p>
    </div>
  );
}
