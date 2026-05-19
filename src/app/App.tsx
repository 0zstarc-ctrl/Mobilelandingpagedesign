import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Star,
  ShieldCheck,
  HeartPulse,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  ArrowLeft,
  X,
  Package,
  Coins,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';
import { DiagnosisProvider, useDiagnosis } from '@/contexts/DiagnosisContext';
import { DIAGNOSIS_QUESTIONS, PRODUCT_INFO } from '@/lib/constants';
import { useRefParam } from '@/lib/hooks/useRefParam';
import { submitSampleRequest } from '@/lib/api';
import KakaoCallback from '@/pages/KakaoCallback';

// ─── 정적 데이터 ──────────────────────────────────────────────

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGhlYWx0aHklMjBuYXR1cmUlMjBsZWF2ZXN8ZW58MXx8fHwxNzc5MTA3MTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  product1: 'https://images.unsplash.com/photo-1760024888924-0bb9b5181f8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHN1cHBsZW1lbnQlMjBwYWNrZXQlMjByZWR8ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  product2: 'https://images.unsplash.com/photo-1633171036157-78d53387fdc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGdyZWVuJTIwc3VwcGxlbWVudCUyMGJvdHRsZXxlbnwxfHx8fDE3NzkxMDcxODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  product3: 'https://images.unsplash.com/photo-1707129785947-ddc627a8bab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYyUyMGJlYXV0eSUyMHN1cHBsZW1lbnQlMjBvcmFuZ2V8ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  product4: 'https://images.unsplash.com/photo-1531326184362-1c03948f23f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaW5zZW5nJTIwZXh0cmFjdCUyMHN0aWNrJTIwYnJvd258ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
};

const PRODUCTS = [
  { id: 1, name: '철분 스틱',              category: '철분 보충', price: '42,000', badge: '카카오메이커스 명예의 전당', image: IMAGES.product1 },
  { id: 2, name: '바이탈 올인원 밀크씨슬+', category: '간 건강',   price: '49,000', badge: '롯데면세점 베스트셀러',      image: IMAGES.product2 },
  { id: 3, name: '비타C 레티놀 PDRN+',      category: '이너뷰티', price: '42,000', badge: '롯데면세점 베스트셀러',      image: IMAGES.product3 },
  { id: 4, name: '사삼스틱',               category: '호흡기',   price: '39,000', badge: '환절기 목 관리',            image: IMAGES.product4 },
];

const SETS = [
  { id: 1, name: '맨즈 세트',   desc: '밀크씨슬+ & 사삼스틱',    originalPrice: '88,000',  price: '58,000' },
  { id: 2, name: '우먼즈 세트', desc: '철분 스틱 & 비타C 레티놀', originalPrice: '84,000',  price: '56,000' },
  { id: 3, name: '커플 세트',   desc: '전 제품 4종',             originalPrice: '172,000', price: '111,000' },
];

// ─── 토스트 배너 ──────────────────────────────────────────────

function ToastBanner() {
  const { toast } = useDiagnosis();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-3rem)] max-w-sm
                    bg-[#1C2B20] text-white text-sm font-medium px-5 py-3.5 rounded-2xl shadow-xl
                    flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <span className="text-lg shrink-0">💡</span>
      <span className="leading-snug">{toast}</span>
    </div>
  );
}

// ─── 스크롤 헬퍼 ─────────────────────────────────────────────

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── 건강 진단 섹션 ───────────────────────────────────────────

function DiagnosisSection() {
  const { step, currentQuestion, answers, setAnswer, goNext, registerScrollRef } = useDiagnosis();
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerScrollRef(sectionRef.current);
  }, []);

  const question = DIAGNOSIS_QUESTIONS[currentQuestion];
  const currentAnswerIndex = answers.find(a => a.question_id === question.id)?.answer_index ?? null;
  const progress = ((currentQuestion + 1) / DIAGNOSIS_QUESTIONS.length) * 100;

  if (step === 'result') {
    return <DiagnosisResult />;
  }

  return (
    <section ref={sectionRef} id="diagnosis" className="bg-[#EAF6EF] px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">내 건강 상태 체크하기</h2>
          <p className="text-[#1A7F5A] font-medium md:text-lg">5가지 질문으로 맞는 영양제 찾기</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm border border-[#1A7F5A]/10 max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[#1A7F5A] bg-[#EAF6EF] px-3 py-1.5 rounded-full">
              Q {question.id}
            </span>
            <span className="text-sm font-medium text-gray-400">{currentQuestion + 1}/5</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
            <div
              className="bg-[#1A7F5A] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h3 className="text-xl md:text-2xl font-bold mb-8 md:mb-10 text-center">
            {question.text}
          </h3>

          <div className="flex flex-col gap-3 mb-8">
            {question.answers.map((answer, idx) => (
              <button
                key={idx}
                onClick={() => setAnswer(question.id, idx)}
                className={`w-full py-4 px-6 rounded-xl border text-center md:text-lg font-medium transition-all ${
                  currentAnswerIndex === idx
                    ? 'border-[#1A7F5A] bg-[#1A7F5A]/5 text-[#1A7F5A]'
                    : 'border-gray-200 hover:border-[#1A7F5A]/50 text-gray-700'
                }`}
              >
                {answer}
              </button>
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={currentAnswerIndex === null}
            className="w-full py-4 bg-[#1A7F5A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#146648] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentQuestion < DIAGNOSIS_QUESTIONS.length - 1 ? (
              <>다음 질문 <ChevronRight className="w-5 h-5" /></>
            ) : (
              <>결과 확인하기 <Sparkles className="w-5 h-5" /></>
            )}
          </button>

          {currentQuestion === 0 && (
            <div className="border-t border-dashed border-gray-200 pt-5 mt-6">
              <p className="text-sm text-center text-gray-500 font-medium">
                🎁 결과 확인 시 샘플팩 또는 500P 증정 (카카오 로그인 필요)
              </p>
            </div>
          )}
        </div>
      </div>

      <LoginGateModal />
      <SampleRequestModal />
    </section>
  );
}

// ─── 로그인 게이트 모달 ───────────────────────────────────────

function LoginGateModal() {
  const { step, selectedBenefit, selectBenefit, startKakaoLogin, reset } = useDiagnosis();
  if (step !== 'gate') return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md p-8 relative">
        <button
          onClick={reset}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold mb-1">진단 완료!</h3>
          <p className="text-gray-500 text-sm">카카오 로그인으로 맞춤 결과를 확인하고 혜택을 받으세요.</p>
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">혜택 선택</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => selectBenefit('sample')}
            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-2 ${
              selectedBenefit === 'sample'
                ? 'border-[#1A7F5A] bg-[#EAF6EF]'
                : 'border-gray-200 hover:border-[#1A7F5A]/50'
            }`}
          >
            <Package className={`w-8 h-8 ${selectedBenefit === 'sample' ? 'text-[#1A7F5A]' : 'text-gray-400'}`} />
            <span className="font-bold text-sm">샘플팩 받기</span>
            <span className="text-xs text-gray-500 text-center leading-tight">실물 샘플 배송<br />(배송지 입력)</span>
          </button>
          <button
            onClick={() => selectBenefit('points')}
            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-2 ${
              selectedBenefit === 'points'
                ? 'border-[#1A7F5A] bg-[#EAF6EF]'
                : 'border-gray-200 hover:border-[#1A7F5A]/50'
            }`}
          >
            <Coins className={`w-8 h-8 ${selectedBenefit === 'points' ? 'text-[#1A7F5A]' : 'text-gray-400'}`} />
            <span className="font-bold text-sm">500P 받기</span>
            <span className="text-xs text-gray-500 text-center leading-tight">즉시 포인트 적립<br />(배송지 불필요)</span>
          </button>
        </div>

        <button
          onClick={() => selectedBenefit && startKakaoLogin(selectedBenefit)}
          disabled={!selectedBenefit}
          className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#371D1E] py-4 rounded-xl font-bold hover:bg-[#f4db00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          {selectedBenefit === 'sample' ? '카카오로 로그인 후 배송지 입력' :
           selectedBenefit === 'points' ? '카카오로 로그인 후 500P 받기' :
           '혜택을 선택하세요'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          로그인 시 닉네임·성별·나이대 제공에 동의합니다.
        </p>
      </div>
    </div>
  );
}

// ─── 샘플팩 주소 입력 모달 ────────────────────────────────────

function SampleRequestModal() {
  const { step, completeLogin, backToGate, showToast } = useDiagnosis();
  const [form, setForm] = useState({ name: '', phone: '', address: '', addressSub: '', zipcode: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (step !== 'address') return null;

  function openPostcodeSearch() {
    const win = window as any;
    if (!win.daum?.Postcode) {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => openPostcodeSearch();
      document.head.appendChild(script);
      return;
    }
    new win.daum.Postcode({
      oncomplete(data: { zonecode: string; address: string }) {
        setForm(f => ({ ...f, zipcode: data.zonecode, address: data.address }));
      },
    }).open();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitSampleRequest({
        name: form.name,
        phone: form.phone,
        address: form.address,
        addressSub: form.addressSub || undefined,
        zipcode: form.zipcode,
      });
      setDone(true);
      setTimeout(() => {
        completeLogin();
        setDone(false);
        setForm({ name: '', phone: '', address: '', addressSub: '', zipcode: '' });
      }, 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '샘플팩 신청 중 오류가 발생했습니다.';
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md p-10 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="text-xl font-bold mb-2">샘플팩 신청 완료!</h3>
          <p className="text-gray-500 text-sm">3~5 영업일 내 발송 예정입니다.<br />카카오톡으로 배송 안내를 드릴게요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToGate} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold">샘플팩 배송지 입력</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            placeholder="받는 분 이름 *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A7F5A] transition-colors"
          />
          <input
            required
            type="tel"
            placeholder="휴대폰 번호 * (알림톡 수신)"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A7F5A] transition-colors"
          />
          <div className="flex gap-2">
            <input
              readOnly
              placeholder="우편번호"
              value={form.zipcode}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 cursor-not-allowed"
            />
            <button
              type="button"
              onClick={openPostcodeSearch}
              className="px-4 py-3 bg-[#1A7F5A] text-white rounded-xl text-sm font-bold whitespace-nowrap hover:bg-[#146648] transition-colors"
            >
              주소 검색
            </button>
          </div>
          <input
            readOnly
            placeholder="주소"
            value={form.address}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 cursor-not-allowed"
          />
          <input
            placeholder="상세 주소 (동·호수 등)"
            value={form.addressSub}
            onChange={e => setForm(f => ({ ...f, addressSub: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A7F5A] transition-colors"
          />
          <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
            🔒 수집된 개인정보는 샘플팩 발송 목적으로만 사용되며, 발송 완료 후 폐기됩니다.
          </p>
          <button
            type="submit"
            disabled={loading || !form.zipcode || !form.name || !form.phone}
            className="w-full py-4 bg-[#1A7F5A] text-white rounded-xl font-bold hover:bg-[#146648] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '신청 중...' : '샘플팩 신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── 진단 결과 화면 ───────────────────────────────────────────

function DiagnosisResult() {
  const { recommendedProducts, selectedBenefit, reset, showToast } = useDiagnosis();

  function handleBuyClick() {
    scrollTo('purchase');
  }

  function handleMoreClick() {
    scrollTo('products');
  }

  return (
    <section id="diagnosis" className="bg-[#EAF6EF] px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#1A7F5A] text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            <CheckCircle2 className="w-4 h-4" /> 진단 완료
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {selectedBenefit === 'sample' ? '🎁 샘플팩 신청 완료!' : '🎉 500P 적립 완료!'}
          </h2>
          <p className="text-gray-600 md:text-lg">
            {selectedBenefit === 'sample'
              ? '3~5 영업일 내 발송 예정입니다. 지금 추천 제품을 확인해보세요.'
              : '포인트가 적립되었습니다. 아래 추천 제품으로 첫 구매 시 사용해보세요.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm border border-[#1A7F5A]/10">
          <h3 className="font-bold text-lg mb-1 text-[#1A7F5A]">나에게 맞는 픽앤필 제품</h3>
          <p className="text-sm text-gray-500 mb-6">진단 결과를 바탕으로 엄선한 추천 라인업입니다.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {recommendedProducts.map(productId => {
              const product = PRODUCT_INFO[productId];
              if (!product) return null;
              return (
                <div key={productId} className="flex gap-4 p-4 bg-[#EAF6EF]/60 rounded-2xl border border-[#1A7F5A]/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex flex-col justify-between min-w-0">
                    <div>
                      <span className="text-xs font-bold text-[#1A7F5A] bg-white px-2 py-0.5 rounded-sm">
                        {product.category}
                      </span>
                      <p className="font-bold mt-1 text-sm leading-tight line-clamp-2">{product.name}</p>
                    </div>
                    <p className="font-bold text-[#1A7F5A] mt-1">{product.priceStr}원</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBuyClick}
              className="flex-1 py-4 bg-[#FEE500] text-[#371D1E] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#f4db00] transition-colors"
            >
              <MessageCircle className="w-5 h-5 fill-current" /> 지금 구매하기
            </button>
            <button
              onClick={handleMoreClick}
              className="flex-1 py-4 bg-[#1A7F5A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#146648] transition-colors"
            >
              전체 제품 보기 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={reset}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            처음부터 다시 진단하기
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── 구매 유도 훅 (진단 미완료 시 진단 섹션으로 안내) ───────────

function usePurchaseAction() {
  const { step, showToast } = useDiagnosis();

  return function handlePurchase() {
    if (step !== 'result') {
      showToast('건강 진단을 먼저 완료하면 맞춤 제품을 추천해 드려요!');
      scrollTo('diagnosis');
    } else {
      scrollTo('purchase');
    }
  };
}

// ─── 메인 앱 ──────────────────────────────────────────────────

export default function App() {
  useRefParam();

  // 카카오 OAuth 콜백 경로 처리
  if (window.location.pathname === '/auth/kakao/callback') {
    return <KakaoCallback />;
  }

  return (
    <DiagnosisProvider>
      <AppInner />
    </DiagnosisProvider>
  );
}

function AppInner() {
  const { showToast } = useDiagnosis();
  const handlePurchase = usePurchaseAction();

  function handleLoginClick() {
    scrollTo('diagnosis');
    showToast('건강 진단을 완료하면 카카오 로그인으로 혜택을 받을 수 있어요!');
  }

  return (
    <div className="bg-white min-h-screen relative text-[#1C2B20] font-sans selection:bg-[#1A7F5A] selection:text-white">

      {/* 1. Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1A7F5A] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Pick &amp; Pill</span>
          </div>
          <button
            onClick={handleLoginClick}
            className="flex items-center gap-1.5 bg-[#FEE500] text-[#371D1E] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#f4db00] transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            카카오 로그인
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] md:min-h-[600px] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.hero} alt="Hero Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 md:via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-12 md:pb-20 pt-20 text-white flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-sm md:text-base font-medium mb-3 text-white/90">유튜버 추천 영양제</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4 md:mb-6">
              깐깐하게 고른<br />나만의 성분해답
            </h1>
            <p className="text-white/80 md:text-lg mb-8 text-sm leading-relaxed max-w-md">
              매일 먹는 영양제,<br className="md:hidden" />이제 성분부터 확인하고 구매할 시간입니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => scrollTo('diagnosis')}
              className="w-full sm:w-auto px-6 lg:px-8 bg-[#1A7F5A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#146648] transition-colors shadow-lg"
            >
              내 건강 진단하기 <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollTo('diagnosis')}
              className="w-full sm:w-auto px-6 lg:px-8 bg-[#FEE500] text-[#371D1E] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#f4db00] transition-colors shadow-lg"
            >
              <MessageCircle className="w-5 h-5 fill-current" /> 카카오로 3초만에 시작
            </button>
          </div>
        </div>
      </section>

      {/* 3. 건강 진단 섹션 */}
      <DiagnosisSection />

      {/* 4. Product Lineup Section */}
      <section id="products" className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center md:text-left mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              픽앤필이 깐깐하게<br className="hidden md:block" /> 고른 4가지 제품
            </h2>
            <p className="text-gray-500 md:text-lg">전문 약사가 엄선한 프리미엄 라인업</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                onClick={handlePurchase}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 md:mb-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  {/* 호버 시 장바구니 오버레이 */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#1A7F5A] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <ShoppingCart className="w-3.5 h-3.5" /> 구매하기
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start flex-1">
                  <span className="text-xs md:text-sm font-bold text-[#1A7F5A] bg-[#EAF6EF] px-2.5 py-1 rounded-sm mb-3">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-1 group-hover:text-[#1A7F5A] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 line-clamp-1">{product.badge}</p>
                  <p className="font-bold text-lg md:text-xl mt-auto">{product.price}원</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Set Configuration Section */}
      <section className="bg-gray-50 px-6 py-16 md:py-24 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">나에게 맞는 세트 고르기</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {SETS.map((set) => (
              <div key={set.id} className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex flex-col mb-8">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{set.name}</h3>
                  <p className="text-gray-500 md:text-base">{set.desc}</p>
                </div>
                <div className="mt-auto mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#1A7F5A] font-bold">35% ↓</span>
                    <p className="text-sm md:text-base text-gray-400 line-through">{set.originalPrice}원</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[#1A7F5A]">{set.price}원</p>
                </div>
                <button
                  onClick={handlePurchase}
                  className="w-full bg-[#1C2B20] text-white py-4 rounded-xl text-sm md:text-base font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> 세트 구매하기
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Trust Section */}
      <section className="bg-[#1C2B20] text-white px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-12 md:mb-16 text-center">픽앤필이 신뢰받는 이유</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {[
              { icon: ShoppingBag, color: '#F4A200', label: '누적 판매량', value: '300만개+' },
              { icon: Star,        color: '#F4A200', label: '리뷰 만족도', value: '98%' },
              { icon: ShieldCheck, color: '#F4A200', label: '입점처',      value: '롯데면세점 &\n무신사 동시 입점' },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="bg-white/10 rounded-2xl md:rounded-3xl p-8 backdrop-blur-sm border border-white/10 flex flex-row md:flex-col items-center md:text-center gap-6">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm md:text-base text-white/70 mb-1 md:mb-2">{label}</p>
                  <p className="text-2xl md:text-4xl font-bold whitespace-pre-line leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-center opacity-50">
            <p className="text-xs md:text-sm tracking-widest uppercase mb-2">vital habit by</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-serif font-bold text-xl">Healthy Picker</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Purchase CTA Section */}
      <section id="purchase" className="bg-[#1A7F5A] px-6 py-16 md:py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">지금 바로 시작하세요</h2>
          <p className="text-white/90 text-sm md:text-lg mb-10">5만원 이상 구매 시 전 품목 무료배송</p>

          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 max-w-3xl mx-auto">
            <button
              onClick={() => showToast('카카오페이 결제 연동을 준비 중입니다. 곧 오픈됩니다! 🙏')}
              className="w-full md:flex-1 bg-[#FEE500] text-[#371D1E] py-4 md:py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#f4db00] transition-colors md:text-lg"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-current" /> 카카오페이 결제
            </button>
            <button
              onClick={() => showToast('네이버페이 결제 연동을 준비 중입니다. 곧 오픈됩니다! 🙏')}
              className="w-full md:flex-1 bg-[#03C75A] text-white py-4 md:py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#02b351] transition-colors md:text-lg"
            >
              <div className="w-5 h-5 md:w-6 md:h-6 font-black flex items-center justify-center text-lg md:text-xl">N</div>
              네이버페이 결제
            </button>
            <button
              onClick={() => showToast('신용카드 결제 연동을 준비 중입니다. 곧 오픈됩니다! 🙏')}
              className="w-full md:flex-1 bg-transparent border-2 border-white/30 text-white py-4 md:py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors mt-2 md:mt-0 md:text-lg"
            >
              <CreditCard className="w-5 h-5 md:w-6 md:h-6" /> 일반 신용카드
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#152018] text-white/50 px-6 py-16 text-xs md:text-sm leading-relaxed">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6">
            <div className="md:col-span-4 lg:col-span-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-white/50" />
                </div>
                <span className="font-bold text-lg text-white/80">Pick &amp; Pill</span>
              </div>
              <p className="text-white/80 font-medium mb-4 text-base">성분해답 (Ingredient Answer)</p>
              <p className="max-w-sm">깐깐한 당신을 위한 프리미엄 영양제 큐레이션. 이제 전문가가 엄선한 성분해답으로 매일의 건강을 지키세요.</p>
            </div>

            <div className="md:col-span-4 lg:col-span-4 space-y-1">
              <h4 className="text-white/80 font-bold mb-4 text-sm">사업자 정보</h4>
              <p>상호명: 주식회사 픽앤필</p>
              <p>대표자: 김건강</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>통신판매업신고: 제2026-서울강남-0123호</p>
              <p>주소: 서울특별시 강남구 테헤란로 123, 4층</p>
            </div>

            <div className="md:col-span-4 lg:col-span-3 space-y-1">
              <h4 className="text-white/80 font-bold mb-4 text-sm">고객 지원</h4>
              <p>고객센터: 1588-0000</p>
              <p>운영시간: 평일 10:00 - 17:00</p>
              <p>점심시간: 12:00 - 13:00</p>
              <p className="pt-2">카카오톡 채널: @픽앤필</p>
              <p>이메일: partner@picknpill.co.kr</p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p>© 2026 Pick &amp; Pill. All rights reserved.</p>
            <div className="flex gap-4 text-white/60">
              <button className="hover:text-white transition-colors">이용약관</button>
              <button className="hover:text-white transition-colors font-bold">개인정보처리방침</button>
            </div>
          </div>
        </div>
      </footer>

      {/* 전역 토스트 */}
      <ToastBanner />

    </div>
  );
}
