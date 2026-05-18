import React, { useState } from 'react';
import { 
  ChevronRight, 
  Lock, 
  Star, 
  ShieldCheck, 
  HeartPulse, 
  ShoppingBag, 
  CreditCard,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGhlYWx0aHklMjBuYXR1cmUlMjBsZWF2ZXN8ZW58MXx8fHwxNzc5MTA3MTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  product1: 'https://images.unsplash.com/photo-1760024888924-0bb9b5181f8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHN1cHBsZW1lbnQlMjBwYWNrZXQlMjByZWR8ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  product2: 'https://images.unsplash.com/photo-1633171036157-78d53387fdc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGdyZWVuJTIwc3VwcGxlbWVudCUyMGJvdHRsZXxlbnwxfHx8fDE3NzkxMDcxODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  product3: 'https://images.unsplash.com/photo-1707129785947-ddc627a8bab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYyUyMGJlYXV0eSUyMHN1cHBsZW1lbnQlMjBvcmFuZ2V8ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  product4: 'https://images.unsplash.com/photo-1531326184362-1c03948f23f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaW5zZW5nJTIwZXh0cmFjdCUyMHN0aWNrJTIwYnJvd258ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
};

const PRODUCTS = [
  { id: 1, name: '철분 스틱', category: '철분 보충', price: '42,000', badge: '카카오메이커스 명예의 전당', image: IMAGES.product1 },
  { id: 2, name: '바이탈 올인원 밀크씨슬+', category: '간 건강', price: '49,000', badge: '롯데면세점 베스트셀러', image: IMAGES.product2 },
  { id: 3, name: '비타C 레티놀 PDRN+', category: '이너뷰티', price: '42,000', badge: '롯데면세점 베스트셀러', image: IMAGES.product3 },
  { id: 4, name: '사삼스틱', category: '호흡기', price: '39,000', badge: '환절기 목 관리', image: IMAGES.product4 },
];

const SETS = [
  { id: 1, name: '맨즈 세트', desc: '밀크씨슬+ & 사삼스틱', originalPrice: '88,000', price: '58,000' },
  { id: 2, name: '우먼즈 세트', desc: '철분 스틱 & 비타C 레티놀', originalPrice: '84,000', price: '56,000' },
  { id: 3, name: '커플 세트', desc: '전 제품 4종', originalPrice: '172,000', price: '111,000' },
];

export default function App() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <div className="bg-white min-h-screen relative text-[#1C2B20] font-sans selection:bg-[#1A7F5A] selection:text-white">
      
      {/* 1. Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1A7F5A] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Pick & Pill</span>
          </div>
          <button className="flex items-center gap-1.5 bg-[#FEE500] text-[#371D1E] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#f4db00] transition-colors">
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
            <button className="w-full sm:w-auto px-6 lg:px-8 bg-[#1A7F5A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#146648] transition-colors shadow-lg">
              내 건강 진단하기 <ChevronRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-6 lg:px-8 bg-[#FEE500] text-[#371D1E] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#f4db00] transition-colors shadow-lg">
              <MessageCircle className="w-5 h-5 fill-current" /> 카카오로 3초만에 시작
            </button>
          </div>
        </div>
      </section>

      {/* 3. Health Diagnosis Section */}
      <section className="bg-[#EAF6EF] px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">내 건강 상태 체크하기</h2>
            <p className="text-[#1A7F5A] font-medium md:text-lg">5가지 질문으로 맞는 영양제 찾기</p>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm border border-[#1A7F5A]/10 relative overflow-hidden max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-[#1A7F5A] bg-[#EAF6EF] px-3 py-1.5 rounded-full">Q 1</span>
              <span className="text-sm font-medium text-gray-400">1/5</span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-8 md:mb-10 text-center">최근 피로감을 자주 느끼시나요?</h3>
            
            <div className="flex flex-col gap-3 mb-8 relative z-10">
              {['자주 느낀다', '가끔 느낀다', '아니다'].map((answer, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full py-4 px-6 rounded-xl border text-center md:text-lg font-medium transition-all ${
                    selectedAnswer === idx 
                      ? 'border-[#1A7F5A] bg-[#1A7F5A]/5 text-[#1A7F5A]' 
                      : 'border-gray-200 hover:border-[#1A7F5A]/50 text-gray-700'
                  }`}
                >
                  {answer}
                </button>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200 pt-6">
              <p className="text-sm text-center text-gray-500 font-medium">
                🎁 결과 확인 시 샘플팩 증정 (카카오 로그인 필요)
              </p>
            </div>

            {/* Blurred Result Preview */}
            <div className="mt-10 pt-10 border-t border-gray-100 relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pt-8">
                <div className="w-14 h-14 bg-[#1A7F5A] rounded-full flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <p className="font-bold text-base text-[#1A7F5A]">진단 완료 후 결과 보기</p>
              </div>
              
              <div className="opacity-40 blur-[3px] pointer-events-none px-4">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 mx-auto"></div>
                <div className="h-24 bg-gray-100 rounded-xl w-full mb-4"></div>
                <div className="h-12 bg-[#1A7F5A]/20 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Lineup Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center md:text-left mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              픽앤필이 깐깐하게<br className="hidden md:block"/> 고른 4가지 제품
            </h2>
            <p className="text-gray-500 md:text-lg">전문 약사가 엄선한 프리미엄 라인업</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="group cursor-pointer flex flex-col">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 md:mb-6">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <div className="flex flex-col items-start flex-1">
                  <span className="text-xs md:text-sm font-bold text-[#1A7F5A] bg-[#EAF6EF] px-2.5 py-1 rounded-sm mb-3">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-1 group-hover:text-[#1A7F5A] transition-colors">{product.name}</h3>
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
                <button className="w-full bg-[#1C2B20] text-white py-4 rounded-xl text-sm md:text-base font-bold hover:bg-black transition-colors">
                  세트 구매하기
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
            <div className="bg-white/10 rounded-2xl md:rounded-3xl p-8 backdrop-blur-sm border border-white/10 flex flex-row md:flex-col items-center md:text-center gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#F4A200] rounded-full flex items-center justify-center shrink-0">
                <ShoppingBag className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <p className="text-sm md:text-base text-white/70 mb-1 md:mb-2">누적 판매량</p>
                <p className="text-2xl md:text-4xl font-bold">300만개+</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-2xl md:rounded-3xl p-8 backdrop-blur-sm border border-white/10 flex flex-row md:flex-col items-center md:text-center gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#F4A200] rounded-full flex items-center justify-center shrink-0">
                <Star className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <p className="text-sm md:text-base text-white/70 mb-1 md:mb-2">리뷰 만족도</p>
                <p className="text-2xl md:text-4xl font-bold">98%</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-2xl md:rounded-3xl p-8 backdrop-blur-sm border border-white/10 flex flex-row md:flex-col items-center md:text-center gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#F4A200] rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <p className="text-sm md:text-base text-white/70 mb-1 md:mb-2">입점처</p>
                <p className="text-xl md:text-2xl font-bold leading-tight">롯데면세점 &<br/>무신사 동시 입점</p>
              </div>
            </div>
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
      <section className="bg-[#1A7F5A] px-6 py-16 md:py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">지금 바로 시작하세요</h2>
          <p className="text-white/90 text-sm md:text-lg mb-10">5만원 이상 구매 시 전 품목 무료배송</p>
          
          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 max-w-3xl mx-auto">
            <button className="w-full md:flex-1 bg-[#FEE500] text-[#371D1E] py-4 md:py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#f4db00] transition-colors md:text-lg">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-current" /> 카카오페이 결제
            </button>
            <button className="w-full md:flex-1 bg-[#03C75A] text-white py-4 md:py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#02b351] transition-colors md:text-lg">
              <div className="w-5 h-5 md:w-6 md:h-6 font-black flex items-center justify-center text-lg md:text-xl">N</div> 
              네이버페이 결제
            </button>
            <button className="w-full md:flex-1 bg-transparent border-2 border-white/30 text-white py-4 md:py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors mt-2 md:mt-0 md:text-lg">
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
                <span className="font-bold text-lg text-white/80">Pick & Pill</span>
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
            <p>© 2026 Pick & Pill. All rights reserved.</p>
            <div className="flex gap-4 text-white/60">
              <button className="hover:text-white transition-colors">이용약관</button>
              <button className="hover:text-white transition-colors font-bold">개인정보처리방침</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
