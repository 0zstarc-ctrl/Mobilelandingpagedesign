import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Lock,
  Star,
  ShieldCheck,
  HeartPulse,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';

const ATTRIBUTION_STORAGE_KEY = 'picknpill_attribution';
const SESSION_STORAGE_KEY = 'picknpill_session_id';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGhlYWx0aHklMjBuYXR1cmUlMjBsZWF2ZXN8ZW58MXx8fHwxNzc5MTA3MTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  product1: 'https://images.unsplash.com/photo-1760024888924-0bb9b5181f8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHN1cHBsZW1lbnQlMjBwYWNrZXQlMjByZWR8ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  product2: 'https://images.unsplash.com/photo-1633171036157-78d53387fdc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGdyZWVuJTIwc3VwcGxlbWVudCUyMGJvdHRsZXxlbnwxfHx8fDE3NzkxMDcxODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  product3: 'https://images.unsplash.com/photo-1707129785947-ddc627a8bab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYyUyMGJlYXV0eSUyMHN1cHBsZW1lbnQlMjBvcmFuZ2V8ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  product4: 'https://images.unsplash.com/photo-1531326184362-1c03948f23f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaW5zZW5nJTIwZXh0cmFjdCUyMHN0aWNrJTIwYnJvd258ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
};

const PRODUCTS = [
  {
    id: 1,
    name: '철분 스틱',
    category: '철분 보충',
    price: '42,000',
    badge: '피로감과 활력 관리를 위한 데일리 루틴',
    image: IMAGES.product1,
  },
  {
    id: 2,
    name: '바이오 신바이오틱스',
    category: '장 건강',
    price: '49,000',
    badge: '가볍고 편안한 하루를 위한 장 케어',
    image: IMAGES.product2,
  },
  {
    id: 3,
    name: '비타민 C 뷰티 PDRN+',
    category: '이너뷰티',
    price: '42,000',
    badge: '항산화와 생기 관리를 위한 선택',
    image: IMAGES.product3,
  },
  {
    id: 4,
    name: '홍삼 스틱',
    category: '면역력',
    price: '39,000',
    badge: '바쁜 일상 속 면역 루틴 관리',
    image: IMAGES.product4,
  },
];

const SETS = [
  {
    id: 1,
    name: '밸런스 세트',
    desc: '바이오 신바이오틱스 & 홍삼 스틱',
    originalPrice: '88,000',
    price: '58,000',
  },
  {
    id: 2,
    name: '에너지 세트',
    desc: '철분 스틱 & 비타민 C 뷰티',
    originalPrice: '84,000',
    price: '56,000',
  },
  {
    id: 3,
    name: '패밀리 세트',
    desc: '대표 제품 4종 구성',
    originalPrice: '172,000',
    price: '111,000',
  },
];

const ANSWERS = ['자주 느껴요', '가끔 느껴요', '거의 없어요'];

const DIAGNOSIS_QUESTIONS = [
  {
    id: 'fatigue',
    title: '최근 피로감을 자주 느끼시나요?',
    options: [
      { id: 'often', label: '자주 느껴요', score: 3 },
      { id: 'sometimes', label: '가끔 느껴요', score: 2 },
      { id: 'rarely', label: '거의 없어요', score: 1 },
    ],
  },
  {
    id: 'digestion',
    title: '식사 후 속이 더부룩한 편인가요?',
    options: [
      { id: 'often', label: '자주 그래요', score: 3 },
      { id: 'sometimes', label: '가끔 그래요', score: 2 },
      { id: 'rarely', label: '편안한 편이에요', score: 1 },
    ],
  },
  {
    id: 'immunity',
    title: '환절기 컨디션 변화가 잦은가요?',
    options: [
      { id: 'often', label: '자주 흔들려요', score: 3 },
      { id: 'sometimes', label: '가끔 있어요', score: 2 },
      { id: 'rarely', label: '괜찮은 편이에요', score: 1 },
    ],
  },
  {
    id: 'beauty',
    title: '피부 생기나 항산화 관리에 관심이 있나요?',
    options: [
      { id: 'high', label: '관심이 많아요', score: 3 },
      { id: 'medium', label: '조금 있어요', score: 2 },
      { id: 'low', label: '아직은 적어요', score: 1 },
    ],
  },
  {
    id: 'routine',
    title: '영양제를 꾸준히 챙겨 먹기 어려운가요?',
    options: [
      { id: 'often', label: '자주 놓쳐요', score: 3 },
      { id: 'sometimes', label: '가끔 놓쳐요', score: 2 },
      { id: 'rarely', label: '잘 챙기는 편이에요', score: 1 },
    ],
  },
];

type Attribution = {
  creator?: string;
  creatorId?: string;
  creatorDisplayName?: string;
  campaign?: string;
  campaignId?: string;
  benefitLabel?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  contentId?: string;
  landingUrl?: string;
  referrer?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  visitStatus?: 'pending' | 'recorded' | 'skipped';
};

type CreatorRow = {
  id: string;
  slug: string;
  display_name: string;
};

type CampaignRow = {
  id: string;
  code: string;
  benefit_label: string | null;
};

type DiagnosisAnswer = {
  questionId: string;
  optionId: string;
  label: string;
  score: number;
};

type DiagnosisResult = {
  code: string;
  title: string;
  summary: string;
};

type CustomerSyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';

function formatCreatorName(slug?: string) {
  if (!slug) {
    return '';
  }

  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function readStoredAttribution(): Attribution | null {
  try {
    const stored = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Attribution) : null;
  } catch {
    return null;
  }
}

function getSessionId() {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
}

function persistAttribution(attribution: Attribution) {
  window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
}

function buildDiagnosisAnswers(selectedAnswers: Record<string, string>): DiagnosisAnswer[] {
  return DIAGNOSIS_QUESTIONS.flatMap((question) => {
    const optionId = selectedAnswers[question.id];
    const option = question.options.find((item) => item.id === optionId);

    if (!option) {
      return [];
    }

    return [
      {
        questionId: question.id,
        optionId: option.id,
        label: option.label,
        score: option.score,
      },
    ];
  });
}

function getDiagnosisResult(answers: DiagnosisAnswer[]): DiagnosisResult {
  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
  const topAnswer = [...answers].sort((a, b) => b.score - a.score)[0];

  if (topAnswer?.questionId === 'digestion') {
    return {
      code: 'gut_balance',
      title: '장 건강 밸런스 루틴',
      summary: '속 편한 하루를 위해 장 건강과 데일리 루틴을 함께 챙기는 구성이 잘 맞습니다.',
    };
  }

  if (topAnswer?.questionId === 'beauty') {
    return {
      code: 'inner_beauty',
      title: '이너뷰티 항산화 루틴',
      summary: '생기와 항산화 관리에 초점을 맞춘 비타민 C 중심 루틴을 추천합니다.',
    };
  }

  if (totalScore >= 12) {
    return {
      code: 'energy_recovery',
      title: '피로 회복 집중 루틴',
      summary: '최근 컨디션 관리가 필요해 보여요. 철분, 홍삼, 장 건강 루틴을 함께 살펴보세요.',
    };
  }

  return {
    code: 'daily_balance',
    title: '데일리 밸런스 루틴',
    summary: '현재 컨디션을 유지하면서 부족한 성분을 가볍게 보완하는 구성이 잘 맞습니다.',
  };
}

function useAttribution() {
  const [attribution, setAttribution] = useState<Attribution | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveAttribution() {
      const params = new URLSearchParams(window.location.search);
      const now = new Date().toISOString();
      const stored = readStoredAttribution();
      const creator = params.get('creator') || stored?.creator;
      const campaign = params.get('campaign') || params.get('utm_campaign') || stored?.campaign;

      let next: Attribution = {
        creator: creator || undefined,
        creatorId: stored?.creatorId,
        creatorDisplayName: stored?.creatorDisplayName,
        campaign: campaign || undefined,
        campaignId: stored?.campaignId,
        benefitLabel: stored?.benefitLabel,
        utmSource: params.get('utm_source') || stored?.utmSource || 'youtube',
        utmMedium: params.get('utm_medium') || stored?.utmMedium || 'influencer',
        utmCampaign: params.get('utm_campaign') || stored?.utmCampaign || campaign || undefined,
        contentId: params.get('content_id') || stored?.contentId || undefined,
        landingUrl: window.location.href,
        referrer: document.referrer || stored?.referrer || undefined,
        firstSeenAt: stored?.firstSeenAt || now,
        lastSeenAt: now,
        visitStatus: supabase ? 'pending' : 'skipped',
      };

      if (!cancelled) {
        setAttribution(next);
      }
      persistAttribution(next);

      if (!supabase || !creator) {
        return;
      }

      const { data: creatorRow } = await supabase
        .from('creators')
        .select('id, slug, display_name')
        .eq('slug', creator)
        .maybeSingle<CreatorRow>();

      if (!creatorRow) {
        next = { ...next, visitStatus: 'skipped' };
        if (!cancelled) {
          setAttribution(next);
        }
        persistAttribution(next);
        return;
      }

      let campaignRow: CampaignRow | null = null;
      if (campaign) {
        const { data } = await supabase
          .from('creator_campaigns')
          .select('id, code, benefit_label')
          .eq('code', campaign)
          .eq('creator_id', creatorRow.id)
          .maybeSingle<CampaignRow>();
        campaignRow = data;
      }

      next = {
        ...next,
        creatorId: creatorRow.id,
        creatorDisplayName: creatorRow.display_name,
        campaignId: campaignRow?.id,
        benefitLabel: campaignRow?.benefit_label || next.benefitLabel,
      };

      const snapshot = {
        creator: next.creator,
        creatorId: next.creatorId,
        creatorDisplayName: next.creatorDisplayName,
        campaign: next.campaign,
        campaignId: next.campaignId,
        benefitLabel: next.benefitLabel,
        utmSource: next.utmSource,
        utmMedium: next.utmMedium,
        utmCampaign: next.utmCampaign,
        contentId: next.contentId,
      };

      const { error } = await supabase.from('visits').insert({
        session_id: getSessionId(),
        creator_id: next.creatorId,
        campaign_id: next.campaignId,
        landing_url: next.landingUrl,
        referrer: next.referrer,
        utm_source: next.utmSource,
        utm_medium: next.utmMedium,
        utm_campaign: next.utmCampaign,
        content_id: next.contentId,
        user_agent: window.navigator.userAgent,
        attribution_snapshot: snapshot,
      });

      next = {
        ...next,
        visitStatus: error ? 'skipped' : 'recorded',
      };

      if (!cancelled) {
        setAttribution(next);
      }
      persistAttribution(next);
    }

    resolveAttribution();

    return () => {
      cancelled = true;
    };
  }, []);

  return attribution;
}

function useKakaoAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, isAuthLoading };
}

function readMetadataString(metadata: Record<string, unknown> | undefined, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function readKakaoProfile(session: Session) {
  const userMetadata = session.user.user_metadata as Record<string, unknown> | undefined;
  const kakaoIdentity = session.user.identities?.find((identity) => identity.provider === 'kakao');
  const identityData = kakaoIdentity?.identity_data as Record<string, unknown> | undefined;

  return {
    displayName:
      readMetadataString(identityData, ['name', 'nickname', 'full_name']) ||
      readMetadataString(userMetadata, ['name', 'nickname', 'full_name']),
    email: session.user.email || readMetadataString(identityData, ['email']),
    kakaoUserId:
      readMetadataString(identityData, ['sub', 'id']) ||
      (typeof kakaoIdentity?.id === 'string' ? kakaoIdentity.id : undefined),
  };
}

export default function App() {
  const attribution = useAttribution();
  const { session, isAuthLoading } = useKakaoAuthSession();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [diagnosisAnswers, setDiagnosisAnswers] = useState<Record<string, string>>({});
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isSavingDiagnosis, setIsSavingDiagnosis] = useState(false);
  const [diagnosisSaved, setDiagnosisSaved] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [landingCustomerId, setLandingCustomerId] = useState<string | null>(null);
  const [customerSyncStatus, setCustomerSyncStatus] = useState<CustomerSyncStatus>('idle');

  const creatorName = useMemo(
    () => attribution?.creatorDisplayName || formatCreatorName(attribution?.creator),
    [attribution?.creator, attribution?.creatorDisplayName],
  );
  const heroEyebrow = creatorName ? `${creatorName} 구독자 전용 건강 루틴` : '유튜버 추천 건강기능식품';
  const benefitLabel = attribution?.benefitLabel || (attribution?.campaign ? '채널 전용 혜택 적용 가능' : '5만원 이상 구매 시 무료배송');
  const currentQuestion = DIAGNOSIS_QUESTIONS[currentQuestionIndex];
  const selectedOptionId = diagnosisAnswers[currentQuestion.id];
  const answeredCount = Object.keys(diagnosisAnswers).length;
  const isDiagnosisComplete = answeredCount === DIAGNOSIS_QUESTIONS.length;
  const isLoggedIn = Boolean(session);
  const kakaoLoginLabel = isLoggedIn ? '로그인 완료' : isAuthLoading ? '로그인 확인 중' : '카카오 로그인';

  useEffect(() => {
    if (!supabase || !session) {
      setLandingCustomerId(null);
      setCustomerSyncStatus('idle');
      return;
    }

    let cancelled = false;

    async function syncLandingCustomer() {
      const profile = readKakaoProfile(session);

      setCustomerSyncStatus('syncing');
      const { data, error } = await supabase.rpc('sync_landing_customer', {
        p_session_id: getSessionId(),
        p_marketing_opt_in: marketingOptIn,
        p_creator_id: attribution?.creatorId || null,
        p_campaign_id: attribution?.campaignId || null,
        p_display_name: profile.displayName || null,
        p_email: profile.email || null,
        p_kakao_user_id: profile.kakaoUserId || null,
      });

      if (cancelled) {
        return;
      }

      if (error || typeof data !== 'string') {
        setCustomerSyncStatus('failed');
        setAuthError('로그인은 완료됐지만 고객 정보 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      setLandingCustomerId(data);
      setCustomerSyncStatus('synced');
      setAuthError(null);
    }

    syncLandingCustomer();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id, attribution?.creatorId, attribution?.campaignId, marketingOptIn]);

  async function handleKakaoLogin() {
    if (isLoggedIn) {
      return;
    }

    if (!supabase) {
      setAuthError('Supabase 환경 변수가 설정되지 않아 카카오 로그인을 시작할 수 없습니다.');
      return;
    }

    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        scopes: 'profile_nickname profile_image',
      },
    });

    if (error) {
      setAuthError('카카오 로그인 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  async function saveDiagnosis(nextAnswers: Record<string, string>) {
    const answers = buildDiagnosisAnswers(nextAnswers);
    const result = getDiagnosisResult(answers);

    setDiagnosisResult(result);
    setDiagnosisSaved(false);

    if (!supabase) {
      return;
    }

    setIsSavingDiagnosis(true);
    const { error } = await supabase.from('diagnoses').insert({
      session_id: getSessionId(),
      landing_customer_id: landingCustomerId,
      creator_id: attribution?.creatorId,
      campaign_id: attribution?.campaignId,
      answers,
      result,
      result_code: result.code,
    });
    setIsSavingDiagnosis(false);
    setDiagnosisSaved(!error);
  }

  function handleDiagnosisAnswer(optionId: string) {
    const nextAnswers = {
      ...diagnosisAnswers,
      [currentQuestion.id]: optionId,
    };
    setDiagnosisAnswers(nextAnswers);

    if (currentQuestionIndex < DIAGNOSIS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }

    saveDiagnosis(nextAnswers);
  }

  return (
    <div className="bg-white min-h-screen relative text-[#1C2B20] font-sans selection:bg-[#1A7F5A] selection:text-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1A7F5A] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Pick & Pill</span>
          </div>
          <button
            onClick={handleKakaoLogin}
            disabled={isLoggedIn || isAuthLoading}
            className="flex items-center gap-1.5 bg-[#FEE500] text-[#371D1E] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#f4db00] transition-colors disabled:cursor-default disabled:opacity-80"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            {kakaoLoginLabel}
          </button>
        </div>
      </header>

      <section className="relative h-[80vh] min-h-[500px] md:min-h-[600px] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.hero} alt="푸른 잎이 있는 건강한 자연 배경" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 md:via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-12 md:pb-20 pt-20 text-white flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-sm md:text-base font-medium mb-3 text-white/90">{heroEyebrow}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4 md:mb-6">
              내 몸에 맞는 성분을
              <br />
              쉽고 빠르게 찾으세요
            </h1>
            <p className="text-white/80 md:text-lg mb-8 text-sm leading-relaxed max-w-md">
              5문항 건강 체크 후 나에게 맞는 영양 성분과 상품을 추천받으세요. 전체 결과 확인은 카카오 로그인 후 제공됩니다.
            </p>
            {attribution?.creator && (
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs md:text-sm font-semibold text-white backdrop-blur">
                <span>유입 채널 저장됨</span>
                <span className="text-white/70">creator={attribution.creator}</span>
                {attribution.campaign && <span className="text-white/70">campaign={attribution.campaign}</span>}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a href="#diagnosis" className="w-full sm:w-auto px-6 lg:px-8 bg-[#1A7F5A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#146648] transition-colors shadow-lg">
              건강 진단하기 <ChevronRight className="w-5 h-5" />
            </a>
            <button
              onClick={handleKakaoLogin}
              disabled={isLoggedIn || isAuthLoading}
              className="w-full sm:w-auto px-6 lg:px-8 bg-[#FEE500] text-[#371D1E] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#f4db00] transition-colors shadow-lg disabled:cursor-default disabled:opacity-80"
            >
              <MessageCircle className="w-5 h-5 fill-current" /> {isLoggedIn ? '카카오 로그인 완료' : '카카오로 3초 만에 시작'}
            </button>
          </div>
        </div>
      </section>

      <section id="diagnosis" className="bg-[#EAF6EF] px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">건강 상태 체크하기</h2>
            <p className="text-[#1A7F5A] font-medium md:text-lg">5가지 질문으로 나에게 맞는 영양 루틴 찾기</p>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm border border-[#1A7F5A]/10 relative overflow-hidden max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-[#1A7F5A] bg-[#EAF6EF] px-3 py-1.5 rounded-full">
                Q {currentQuestionIndex + 1}
              </span>
              <span className="text-sm font-medium text-gray-400">
                {answeredCount}/{DIAGNOSIS_QUESTIONS.length}
              </span>
            </div>

            <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-[#1A7F5A] transition-all"
                style={{ width: `${(answeredCount / DIAGNOSIS_QUESTIONS.length) * 100}%` }}
              />
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-8 md:mb-10 text-center">{currentQuestion.title}</h3>

            <div className="flex flex-col gap-3 mb-8 relative z-10">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleDiagnosisAnswer(option.id)}
                  className={`w-full py-4 px-6 rounded-xl border text-center md:text-lg font-medium transition-all ${
                    selectedOptionId === option.id
                      ? 'border-[#1A7F5A] bg-[#1A7F5A]/5 text-[#1A7F5A]'
                      : 'border-gray-200 hover:border-[#1A7F5A]/50 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {currentQuestionIndex > 0 && !isDiagnosisComplete && (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="mb-8 w-full text-sm font-bold text-[#1A7F5A] hover:text-[#146648]"
              >
                이전 질문으로 돌아가기
              </button>
            )}

            <div className="border-t border-dashed border-gray-200 pt-6">
              <p className="text-sm text-center text-gray-500 font-medium">
                결과 확인 시 추천 성분과 전용 혜택을 안내합니다. 카카오 로그인이 필요합니다.
              </p>
              {diagnosisResult && (
                <div className="mt-5 rounded-2xl bg-[#EAF6EF] p-5 text-left">
                  <p className="text-xs font-bold text-[#1A7F5A] mb-2">
                    {diagnosisSaved ? '진단 결과 저장 완료' : isSavingDiagnosis ? '진단 결과 저장 중' : '진단 결과 미리보기'}
                  </p>
                  <h4 className="text-lg font-bold mb-2">{diagnosisResult.title}</h4>
                  <p className="text-sm text-gray-600">{diagnosisResult.summary}</p>
                  <label className="mt-5 flex items-start gap-3 rounded-xl bg-white/70 p-4 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={marketingOptIn}
                      onChange={(event) => setMarketingOptIn(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#1A7F5A]"
                    />
                    <span>
                      카카오 알림톡으로 진단 결과, 주문/배송 안내, 재구매 혜택을 받아볼게요.
                    </span>
                  </label>
                  {authError && (
                    <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {authError}
                    </p>
                  )}
                  {isLoggedIn && customerSyncStatus !== 'idle' && !authError && (
                    <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm font-medium text-[#1A7F5A]">
                      {customerSyncStatus === 'synced' ? '카카오 고객 정보 연결 완료' : '카카오 고객 정보 연결 중'}
                    </p>
                  )}
                  <button
                    onClick={handleKakaoLogin}
                    disabled={isLoggedIn || isAuthLoading}
                    className="mt-4 w-full rounded-xl bg-[#FEE500] px-5 py-4 font-bold text-[#371D1E] transition-colors hover:bg-[#f4db00] disabled:cursor-default disabled:opacity-80"
                  >
                    {isLoggedIn ? '로그인 완료 - 전체 결과 준비 중' : '카카오 로그인하고 전체 결과 보기'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-10 pt-10 border-t border-gray-100 relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pt-8">
                <div className="w-14 h-14 bg-[#1A7F5A] rounded-full flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <p className="font-bold text-base text-[#1A7F5A]">진단 완료 후 결과 보기</p>
              </div>

              <div className="opacity-40 blur-[3px] pointer-events-none px-4">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 mx-auto" />
                <div className="h-24 bg-gray-100 rounded-xl w-full mb-4" />
                <div className="h-12 bg-[#1A7F5A]/20 rounded-xl w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center md:text-left mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              Pick & Pill이 엄선한
              <br className="hidden md:block" /> 대표 제품 4종
            </h2>
            <p className="text-gray-500 md:text-lg">건강 루틴에 맞춰 선택하기 쉬운 프리미엄 라인업</p>
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

      <section className="bg-gray-50 px-6 py-16 md:py-24 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[#1A7F5A] font-bold mb-2">{benefitLabel}</p>
            <h2 className="text-2xl md:text-3xl font-bold">나에게 맞는 세트 고르기</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {SETS.map((set) => (
              <div key={set.id} className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex flex-col mb-8">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{set.name}</h3>
                  <p className="text-gray-500 md:text-base">{set.desc}</p>
                </div>
                <div className="mt-auto mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#1A7F5A] font-bold">35% 할인</span>
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

      <section className="bg-[#1C2B20] text-white px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-12 md:mb-16 text-center">Pick & Pill이 신뢰받는 이유</h2>

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
                <p className="text-sm md:text-base text-white/70 mb-1 md:mb-2">입점 채널</p>
                <p className="text-xl md:text-2xl font-bold leading-tight">롯데면세점 &<br />무신사 동시 입점</p>
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

      <section className="bg-[#1A7F5A] px-6 py-16 md:py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">지금 바로 시작하세요</h2>
          <p className="text-white/90 text-sm md:text-lg mb-10">{benefitLabel}</p>

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
              <p className="text-white/80 font-medium mb-4 text-base">성분대답 (Ingredient Answer)</p>
              <p className="max-w-sm">
                내 몸에 맞는 성분을 찾고, 믿을 수 있는 건강 루틴으로 이어주는 프리미엄 건강기능식품 큐레이션 서비스입니다.
              </p>
            </div>

            <div className="md:col-span-4 lg:col-span-4 space-y-1">
              <h4 className="text-white/80 font-bold mb-4 text-sm">사업자 정보</h4>
              <p>상호명: 주식회사 픽앤필</p>
              <p>대표자: 김건강</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>통신판매업신고: 2026-서울강남-0123</p>
              <p>주소: 서울특별시 강남구 테헤란로 123, 4층</p>
            </div>

            <div className="md:col-span-4 lg:col-span-3 space-y-1">
              <h4 className="text-white/80 font-bold mb-4 text-sm">고객 지원</h4>
              <p>고객센터: 1588-0000</p>
              <p>운영시간: 평일 10:00 - 17:00</p>
              <p>점심시간: 12:00 - 13:00</p>
              <p className="pt-2">카카오톡 채널: @picknpill</p>
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
