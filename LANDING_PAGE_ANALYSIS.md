# Mobile Landing Page Design 분석 문서

## 1. 분석 개요

이 저장소는 Figma UI AI 또는 Figma Make에서 생성된 모바일 중심 랜딩페이지 코드 번들로 보인다. `README.md`에 원본 Figma 링크가 명시되어 있으며, 구현은 Vite + React + Tailwind CSS 기반이다.

- 프로젝트명: Mobile Landing Page Design
- 원본 디자인: https://www.figma.com/design/D7c8iyBxS981q29GTqvE4a/Mobile-Landing-Page-Design
- 주요 구현 파일: `src/app/App.tsx`
- 실행 방식: `npm i` 후 `npm run dev`
- 현재 Git 상태: 변경 없음에서 분석 문서만 추가

## 2. 기술 스택

### 프레임워크 및 빌드

- Vite 6
- React 18
- TypeScript
- Tailwind CSS 4
- `@tailwindcss/vite` 플러그인 사용

### UI 라이브러리

`package.json`에는 shadcn/ui 기반으로 보이는 Radix UI 컴포넌트들이 다수 포함되어 있다.

- Radix UI 계열 컴포넌트
- lucide-react 아이콘
- Tailwind merge, clsx
- sonner, recharts, embla-carousel-react 등 범용 UI 의존성

다만 현재 랜딩페이지 본문에서는 대부분의 shadcn/ui 컴포넌트가 직접 사용되지는 않고, Tailwind utility class와 lucide-react 아이콘 중심으로 화면이 구성되어 있다.

## 3. 폴더 구조

```text
.
├─ index.html
├─ package.json
├─ vite.config.ts
├─ postcss.config.mjs
├─ README.md
├─ ATTRIBUTIONS.md
├─ guidelines/
│  └─ Guidelines.md
└─ src/
   ├─ main.tsx
   ├─ styles/
   │  ├─ index.css
   │  ├─ tailwind.css
   │  ├─ theme.css
   │  └─ fonts.css
   └─ app/
      ├─ App.tsx
      └─ components/
         ├─ figma/
         └─ ui/
```

### 핵심 파일 역할

- `src/main.tsx`: React 앱 진입점.
- `src/app/App.tsx`: 랜딩페이지 전체 화면 구현.
- `src/styles/index.css`: 폰트, Tailwind, 테마 CSS를 한 번에 import.
- `src/styles/theme.css`: Figma Make/shadcn 스타일의 CSS 변수와 기본 typography layer 정의.
- `src/styles/tailwind.css`: Tailwind 4 import 및 source 경로 정의.
- `vite.config.ts`: React, Tailwind, Figma asset resolver 플러그인 설정.

## 4. 화면 구성 분석

`App.tsx`는 단일 컴포넌트 안에 랜딩페이지 전체 섹션을 순차적으로 구성한다.

### 1. Header

- sticky header
- 브랜드 로고: HeartPulse 아이콘 + `Pick & Pill`
- 카카오 로그인 버튼 스타일
- 흰색 배경, 얇은 하단 border, backdrop blur 사용

### 2. Hero Section

- 전체 화면에 가까운 높이의 hero 영역
- Unsplash 자연 이미지 배경
- 모바일에서는 하단 어두운 gradient, 데스크톱에서는 좌우 gradient
- 주요 CTA 2개:
  - 건강 진단 시작
  - 카카오로 시작

### 3. Health Diagnosis Section

- 연녹색 배경의 진단 카드
- 질문/답변 선택 UI
- `useState`로 선택된 답변 상태 관리
- 결과 영역은 blur 처리와 lock 아이콘으로 잠금 상태를 표현

현재 동작은 1번 질문 선택까지만 구현되어 있으며, 실제 5문항 진단 로직이나 결과 계산 로직은 없다.

### 4. Product Lineup Section

- 2열 모바일, 4열 데스크톱 grid
- 제품 이미지, 카테고리 badge, 제품명, 설명, 가격으로 구성
- hover 시 이미지 확대와 텍스트 컬러 변경

### 5. Set Configuration Section

- 1열 모바일, 3열 데스크톱 grid
- 세트명, 설명, 할인율, 원가, 판매가, 구매 버튼 표시
- 흰색 카드와 가벼운 shadow 사용

### 6. Trust Section

- 어두운 녹색 배경
- 누적 판매량, 리뷰 만족도, 입점처를 3개 카드로 표현
- ShoppingBag, Star, ShieldCheck 아이콘 사용

### 7. Purchase CTA Section

- 녹색 배경의 최종 구매 CTA
- 카카오페이, 네이버페이, 일반 카드 결제 버튼 구성

### 8. Footer

- 브랜드 설명
- 사업자 정보
- 고객 지원 정보
- 약관/개인정보처리방침 버튼

## 5. 디자인 시스템 및 스타일

### 컬러

페이지는 건강기능식품/웰니스 브랜드에 맞춰 녹색 계열을 중심으로 구성되어 있다.

- Primary green: `#1A7F5A`
- Deep green/text: `#1C2B20`
- Dark footer: `#152018`
- Light green background: `#EAF6EF`
- Kakao yellow: `#FEE500`
- Naver green: `#03C75A`
- Accent orange: `#F4A200`

### 레이아웃

- 모바일 우선 반응형 설계
- `max-w-6xl`, `max-w-4xl`, `max-w-3xl` 등으로 콘텐츠 폭 제한
- `grid`, `flex`, `md:` breakpoint를 활용한 구조 전환
- 각 섹션은 충분한 vertical padding을 사용해 랜딩페이지 리듬을 만든다.

### 컴포넌트 스타일

- 둥근 버튼과 카드 중심의 부드러운 모바일 커머스 UI
- `rounded-xl`, `rounded-2xl`, `rounded-3xl` 빈도가 높음
- 그림자와 border는 비교적 약하게 사용
- CTA 버튼은 명확한 색상 대비를 사용

## 6. 데이터 구조

`App.tsx` 내부에 이미지와 제품/세트 데이터가 상수로 선언되어 있다.

- `IMAGES`: hero 및 제품 이미지 URL
- `PRODUCTS`: 제품 카드 데이터
- `SETS`: 세트 상품 데이터

현재는 정적 데이터이며 외부 API, CMS, 라우팅, 상태 관리 라이브러리는 사용하지 않는다.

## 7. 현재 문제점

### 7.1 한국어 텍스트 인코딩 깨짐

`App.tsx`와 `guidelines/Guidelines.md` 일부에 한국어가 깨진 문자열로 들어가 있다. 예를 들어 제품명, 설명, 버튼 라벨, footer 문구가 정상적인 한국어로 보이지 않는다.

영향:

- 사용자에게 표시되는 카피가 대부분 읽을 수 없음
- 디자인 검수와 콘텐츠 검수가 어려움
- 일부 문자열은 따옴표나 JSX 태그까지 깨져 문법 오류를 만들 가능성이 높음

### 7.2 JSX 문법 오류 가능성

깨진 문자열 때문에 다음과 같은 문제가 의심된다.

- 닫히지 않은 문자열
- 닫히지 않은 JSX 태그
- 배열 문자열 리터럴 파손
- `p` 태그 종료부 손상

특히 `PRODUCTS`, `SETS`, hero 문구, 버튼 라벨, footer 영역에서 문법 파손 가능성이 높다.

### 7.3 미사용 의존성과 컴포넌트가 많음

Figma Make에서 생성한 번들 특성상 `src/app/components/ui`에는 많은 shadcn/ui 컴포넌트가 포함되어 있으나, 현재 랜딩페이지에서는 거의 사용되지 않는다.

영향:

- 저장소가 실제 구현 대비 무겁게 보임
- 유지보수자가 필요한 파일을 찾기 어려울 수 있음
- 빌드 번들에는 tree-shaking으로 제외될 가능성이 있지만, 코드베이스 가독성에는 부담

### 7.4 접근성 보완 필요

현재 주요 버튼은 시각적으로 명확하지만, 실제 서비스 기준에서는 아래 보완이 필요하다.

- CTA 버튼 클릭 동작 정의
- form/진단 질문의 semantic 구조 보완
- 잠금 결과 영역의 접근성 설명
- 이미지 alt 텍스트를 실제 콘텐츠 의미에 맞게 개선

### 7.5 실제 서비스 로직 부재

랜딩페이지 목업에 가까운 상태로, 아래 기능은 아직 구현되지 않았다.

- 건강 진단 5문항 진행
- 진단 결과 계산
- 로그인 연동
- 결제 연동
- 상품 상세/구매 이동
- footer 약관 링크

## 8. 개선 우선순위

### P0: 빌드 가능한 상태로 복구

가장 먼저 `App.tsx`의 깨진 한국어 문구와 JSX 문법을 복구해야 한다.

권장 작업:

- 깨진 카피를 정상 한국어로 재작성
- `npm run build`로 문법 검증
- 브라우저에서 모바일/데스크톱 레이아웃 확인

### P1: 랜딩페이지 카피 정리

현재 브랜드명은 `Pick & Pill`, 슬로건은 `Ingredient Answer` 계열로 보인다. 제품/서비스 방향이 건강기능식품 추천 및 구매라면 아래 카피 체계를 명확히 하는 것이 좋다.

- Hero: 핵심 가치 제안
- Diagnosis: 진단 참여 유도
- Product: 제품 신뢰와 효능 범주
- Set: 가격 혜택과 구매 이유
- Trust: 판매량/리뷰/입점처 근거
- CTA: 결제 또는 상담 전환

### P2: 컴포넌트 분리

`App.tsx`가 모든 섹션을 포함하고 있어 파일이 길다. 빌드 복구 후 아래 단위로 분리하면 유지보수가 쉬워진다.

- `Header`
- `HeroSection`
- `DiagnosisSection`
- `ProductLineupSection`
- `SetSection`
- `TrustSection`
- `PurchaseCtaSection`
- `Footer`

단, 현재 단계에서는 먼저 정상 동작 복구가 우선이며, 분리는 그 다음 단계가 적절하다.

### P3: 실제 인터랙션 연결

목업을 실제 랜딩페이지로 발전시키려면 다음 연결이 필요하다.

- CTA 클릭 시 카카오 로그인/채널/결제 URL 이동
- 진단 문항 진행 및 결과 표시
- 제품/세트 구매 버튼 링크
- 약관 및 개인정보처리방침 링크
- 이벤트 tracking

## 9. 검증 체크리스트

다음 순서로 검증하는 것을 권장한다.

1. `npm i`
2. `npm run build`
3. `npm run dev`
4. 모바일 viewport에서 hero, 진단 카드, 제품 grid 확인
5. 데스크톱 viewport에서 hero gradient, 4열 제품 grid, 3열 trust/set grid 확인
6. CTA 버튼 텍스트 줄바꿈 및 overflow 확인
7. 외부 Unsplash 이미지 로딩 실패 시 fallback UX 확인

### 현재 검증 상태

- `git status --short`: 분석 문서 `LANDING_PAGE_ANALYSIS.md`만 신규 추가됨
- `node_modules`: 없음
- `npm run build`: 현재 셸에서 `npm` 명령을 찾지 못해 실행 불가

## 10. 결론

이 저장소는 Figma 기반 랜딩페이지를 React 코드로 옮긴 초기 산출물이다. 시각적 섹션 구성, 반응형 레이아웃, 색상 방향성은 이미 잡혀 있지만, 현재 가장 큰 문제는 한국어 텍스트 인코딩 깨짐과 그로 인한 JSX 문법 오류 가능성이다.

따라서 다음 작업은 디자인 개선보다 먼저 `App.tsx`의 문구와 문법을 정상화하고 빌드가 통과하는지 확인하는 것이 좋다. 이후 카피 정리, 컴포넌트 분리, 실제 진단/결제 플로우 연결 순서로 진행하면 안정적으로 제품화할 수 있다.
