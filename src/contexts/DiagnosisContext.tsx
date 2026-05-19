import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { DIAGNOSIS_QUESTIONS, computeRecommendations } from '@/lib/constants';
import type { DiagnosisAnswerInput } from '@/lib/constants';

export type DiagnosisStep = 'quiz' | 'gate' | 'address' | 'result';
export type BenefitType = 'sample' | 'points';

interface DiagnosisState {
  step: DiagnosisStep;
  currentQuestion: number;
  answers: DiagnosisAnswerInput[];
  recommendedProducts: string[];
  selectedBenefit: BenefitType | null;
  toast: string | null;
  setAnswer: (questionId: number, answerIndex: number) => void;
  goNext: () => void;
  selectBenefit: (benefit: BenefitType) => void;
  startKakaoLogin: (benefit: BenefitType) => void;
  completeLogin: () => void;
  backToGate: () => void;
  reset: () => void;
  scrollToQuiz: () => void;
  showToast: (message: string, duration?: number) => void;
  registerScrollRef: (el: HTMLElement | null) => void;
}

const DiagnosisContext = createContext<DiagnosisState | null>(null);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<DiagnosisStep>('quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswerInput[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<string[]>([]);
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [quizRef, setQuizRef] = useState<HTMLElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // OAuth 콜백 후 sessionStorage에서 상태 복원
  useEffect(() => {
    const loginOk = sessionStorage.getItem('picknpill_login_ok');
    if (!loginOk) return;

    sessionStorage.removeItem('picknpill_login_ok');
    const savedBenefit = sessionStorage.getItem('picknpill_benefit') as BenefitType | null;
    const savedAnswers: DiagnosisAnswerInput[] = JSON.parse(
      sessionStorage.getItem('picknpill_answers') ?? '[]'
    );
    const savedProducts: string[] = JSON.parse(
      sessionStorage.getItem('picknpill_products') ?? '[]'
    );

    sessionStorage.removeItem('picknpill_benefit');
    sessionStorage.removeItem('picknpill_answers');
    sessionStorage.removeItem('picknpill_products');

    if (savedAnswers.length > 0) setAnswers(savedAnswers);
    if (savedProducts.length > 0) setRecommendedProducts(savedProducts);
    if (savedBenefit) setSelectedBenefit(savedBenefit);

    // sample: 배송지 입력 모달 / points: 바로 결과 화면
    setStep(savedBenefit === 'sample' ? 'address' : 'result');
  }, []);

  function registerScrollRef(el: HTMLElement | null) {
    setQuizRef(el);
  }

  function scrollToQuiz() {
    quizRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setAnswer(questionId: number, answerIndex: number) {
    setAnswers(prev => {
      const next = prev.filter(a => a.question_id !== questionId);
      return [...next, { question_id: questionId, answer_index: answerIndex }];
    });
  }

  function goNext() {
    if (currentQuestion < DIAGNOSIS_QUESTIONS.length - 1) {
      setCurrentQuestion(q => q + 1);
    } else {
      const recs = computeRecommendations(answers);
      setRecommendedProducts(recs);
      setStep('gate');
    }
  }

  function selectBenefit(benefit: BenefitType) {
    setSelectedBenefit(benefit);
    // 로그인 전이므로 step은 'gate' 유지 — 실제 이동은 startKakaoLogin 후 OAuth 복원 시 처리
  }

  function startKakaoLogin(benefit: BenefitType) {
    // OAuth 리다이렉트 전 진단 상태 저장
    sessionStorage.setItem('picknpill_benefit', benefit);
    sessionStorage.setItem('picknpill_answers', JSON.stringify(answers));
    sessionStorage.setItem('picknpill_products', JSON.stringify(recommendedProducts));

    const clientId = import.meta.env.VITE_KAKAO_REST_API_KEY as string;
    const appUrl = (import.meta.env.VITE_APP_URL as string) || window.location.origin;
    const redirectUri = `${appUrl}/auth/kakao/callback`;

    const url = new URL('https://kauth.kakao.com/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'profile_nickname,gender,age_range');

    window.location.href = url.toString();
  }

  function completeLogin() {
    setStep('result');
  }

  function backToGate() {
    setStep('gate');
  }

  function showToast(message: string, duration = 3000) {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  }

  function reset() {
    setStep('quiz');
    setCurrentQuestion(0);
    setAnswers([]);
    setRecommendedProducts([]);
    setSelectedBenefit(null);
  }

  return (
    <DiagnosisContext.Provider value={{
      step, currentQuestion, answers, recommendedProducts, selectedBenefit, toast,
      setAnswer, goNext, selectBenefit, startKakaoLogin, completeLogin, backToGate, reset,
      scrollToQuiz, showToast, registerScrollRef,
    }}>
      {children}
    </DiagnosisContext.Provider>
  );
}

export function useDiagnosis() {
  const ctx = useContext(DiagnosisContext);
  if (!ctx) throw new Error('useDiagnosis must be used inside DiagnosisProvider');
  return ctx;
}
