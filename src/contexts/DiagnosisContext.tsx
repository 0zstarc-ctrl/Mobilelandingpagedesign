import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { DIAGNOSIS_QUESTIONS, computeRecommendations } from '@/lib/constants';
import type { DiagnosisAnswerInput } from '@/lib/constants';

export type DiagnosisStep = 'quiz' | 'gate' | 'address' | 'result';
export type BenefitType = 'sample' | 'points';

interface DiagnosisState {
  step: DiagnosisStep;
  currentQuestion: number;        // 0-indexed
  answers: DiagnosisAnswerInput[];
  recommendedProducts: string[];
  selectedBenefit: BenefitType | null;
  toast: string | null;
  setAnswer: (questionId: number, answerIndex: number) => void;
  goNext: () => void;
  selectBenefit: (benefit: BenefitType) => void;
  completeLogin: () => void;      // 로그인 완료 후 결과 화면으로
  backToGate: () => void;         // 주소 입력 → 혜택 선택으로 돌아가기
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
      // 5문항 완료 → 추천 계산 → 로그인 게이트
      const recs = computeRecommendations(answers);
      setRecommendedProducts(recs);
      setStep('gate');
    }
  }

  function selectBenefit(benefit: BenefitType) {
    setSelectedBenefit(benefit);
    if (benefit === 'sample') {
      setStep('address');
    }
    // 'points'는 로그인 버튼 클릭 시 처리
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
      setAnswer, goNext, selectBenefit, completeLogin, backToGate, reset,
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
