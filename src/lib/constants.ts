// 진단 문항 + 추천 로직 + 제품 표시 정보

export interface ProductInfo {
  id: string;
  name: string;
  category: string;
  price: number;
  priceStr: string;
  badge: string;
  image: string;
}

export const PRODUCT_INFO: Record<string, ProductInfo> = {
  'iron-stick': {
    id: 'iron-stick',
    name: '철분 스틱',
    category: '철분 보충',
    price: 42000,
    priceStr: '42,000',
    badge: '카카오메이커스 명예의 전당',
    image: 'https://images.unsplash.com/photo-1760024888924-0bb9b5181f8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHN1cHBsZW1lbnQlMjBwYWNrZXQlMjByZWR8ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  'vitalmilk': {
    id: 'vitalmilk',
    name: '바이탈 올인원 밀크씨슬+',
    category: '간 건강',
    price: 49000,
    priceStr: '49,000',
    badge: '롯데면세점 베스트셀러',
    image: 'https://images.unsplash.com/photo-1633171036157-78d53387fdc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGdyZWVuJTIwc3VwcGxlbWVudCUyMGJvdHRsZXxlbnwxfHx8fDE3NzkxMDcxODN8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
  'vitac-retinol': {
    id: 'vitac-retinol',
    name: '비타C 레티놀 PDRN+',
    category: '이너뷰티',
    price: 42000,
    priceStr: '42,000',
    badge: '롯데면세점 베스트셀러',
    image: 'https://images.unsplash.com/photo-1707129785947-ddc627a8bab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYyUyMGJlYXV0eSUyMHN1cHBsZW1lbnQlMjBvcmFuZ2V8ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  'sasam-stick': {
    id: 'sasam-stick',
    name: '사삼스틱',
    category: '호흡기',
    price: 39000,
    priceStr: '39,000',
    badge: '환절기 목 관리',
    image: 'https://images.unsplash.com/photo-1531326184362-1c03948f23f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaW5zZW5nJTIwZXh0cmFjdCUyMHN0aWNrJTIwYnJvd258ZW58MXx8fHwxNzc5MTA3MTgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
};

export interface DiagnosisQuestion {
  id: number;
  text: string;
  answers: readonly string[];
  scoreMap: Record<number, string[]>;
}

export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  {
    id: 1,
    text: '최근 피로감을 자주 느끼시나요?',
    answers: ['자주 느낀다', '가끔 느낀다', '아니다'],
    scoreMap: { 0: ['iron-stick'], 1: ['iron-stick'], 2: [] },
  },
  {
    id: 2,
    text: '간 건강이나 음주 빈도가 걱정되시나요?',
    answers: ['자주 걱정된다', '가끔 걱정된다', '아니다'],
    scoreMap: { 0: ['vitalmilk'], 1: ['vitalmilk'], 2: [] },
  },
  {
    id: 3,
    text: '피부·미용에 관심이 많으신가요?',
    answers: ['매우 관심 있다', '약간 있다', '아니다'],
    scoreMap: { 0: ['vitac-retinol'], 1: ['vitac-retinol'], 2: [] },
  },
  {
    id: 4,
    text: '요즘 호흡기(목, 코)가 불편하신가요?',
    answers: ['자주 불편하다', '가끔 불편하다', '아니다'],
    scoreMap: { 0: ['sasam-stick'], 1: ['sasam-stick'], 2: [] },
  },
  {
    id: 5,
    text: '현재 복용 중인 영양제가 있으신가요?',
    answers: ['있다', '없다'],
    scoreMap: { 0: [], 1: [] },
  },
];

export interface DiagnosisAnswerInput {
  question_id: number;
  answer_index: number;
}

export function computeRecommendations(answers: DiagnosisAnswerInput[]): string[] {
  const productSet = new Set<string>();
  for (const ans of answers) {
    const q = DIAGNOSIS_QUESTIONS.find(q => q.id === ans.question_id);
    if (!q) continue;
    (q.scoreMap[ans.answer_index] ?? []).forEach(p => productSet.add(p));
  }
  if (productSet.size === 0) return ['iron-stick', 'vitalmilk'];
  return Array.from(productSet);
}
