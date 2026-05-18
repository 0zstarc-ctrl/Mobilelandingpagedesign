import { useEffect } from 'react';

const REFERRER_KEY = 'picknpill_referrer';

// 랜딩 진입 시 ?ref= 파라미터를 sessionStorage에 저장
export function useRefParam() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem(REFERRER_KEY, ref);
    }
  }, []);
}

// 로그인 시 백엔드에 전달할 referrer 값 읽기
export function getReferrer(): string | null {
  return sessionStorage.getItem(REFERRER_KEY);
}
