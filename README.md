# PALPAL - 중고거래 플랫폼

신뢰할 수 있는 중고거래, 실시간 채팅으로 더 가깝게

본 프로젝트는 대구소프트웨어마이스터고등학교의 나르샤 프로젝트로 실사용 서비스가 아님을 알립니다

## 프로젝트 개요

PALPAL은 중고나라의 기능을 개선한 풀스택 중고거래 플랫폼입니다. 사용자는 중고물품을 간편하게 등록·판매하고, 실시간 채팅으로 거래자와 직접 소통할 수 있습니다.

**핵심 가치:**
- AI 사진 분석 - OpenAI Vision으로 상품 상태 자동 인식
- 실시간 채팅 - Socket.io 기반 1:1 즉시 메시징
- 빠른 로딩 - 스켈레톤 로딩으로 300ms 로딩 시간 달성
- 체계적 정보 - 상품 상태, 구매일자, 배송비 등 구조화된 데이터

**배포 URL:** https://palpalshop.shop

---

## 기술 스택

### 프론트엔드
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Socket.io Client
- React Context

### 백엔드
- Node.js
- Express.js + TypeScript
- MongoDB + Mongoose
- Redis
- Socket.io Server
- OpenAI Vision API
- SMTP (Gmail)

### 인프라
- AWS EC2
- Nginx (리버스 프록시)
- PM2 (프로세스 관리)
- Let's Encrypt (SSL/TLS)

---

## 주요 기능

### 상품 관리
- 이미지 다중 업로드 (WebP 최적화)
- 카테고리별 상품 분류 (10개 카테고리)
- 구조화된 상품 정보 (상태/구매일자/배송비/거래방식)
- 상품 상태 관리 (판매중/예약/완료)
- 가격대별 필터링

### 실시간 채팅
- Socket.io 기반 1:1 실시간 메시징
- 이미지 직접 전송 (클립보드 붙여넣기)
- 메시지 우클릭 삭제
- 웹 알림 (Notification API)
- 자동 스크롤 및 스켈레톤 로딩

### 사용자 시스템
- 이메일 인증 (SMTP/Gmail)
- JWT 토큰 기반 인증
- 프로필 이미지 최적화
- 닉네임 수정

### 검색 및 추천
- 전문 검색 (제목, 설명)
- 좋아요 시스템 (찜하기)
- 인기 상품 추천
- 카테고리별 상품 추천

### AI 사진 분석
- OpenAI Vision API로 상품 상태 자동 인식
- 카테고리 자동 분류
- 설명 자동 생성

---

## 성능 최적화

### 로딩 속도 개선

| 단계 | 방법 | 결과 |
|------|------|------|
| 기존 | API 응답 대기 | 3,000ms |
| 1단계 | Gzip Compression | 2,000ms |
| 2단계 | 스켈레톤 로딩 + WebP + 캐싱 | 300ms |

**Lighthouse 성능:** 60점 → 88점

### 최적화 기법
- 이미지 WebP 압축 (50% 용량 감소)
- Redis 캐싱 (DB 부하 감소)
- 스켈레톤 로딩 (즉각적 피드백)
- MongoDB select() (응답 크기 최소화)
- Nginx gzip compression (네트워크 대역폭 감소)

---

## 시작하기

### 환경 설정

필수 요구사항:
- Node.js 18+
- MongoDB
- Redis

### 설치
```bash
git clone https://github.com/yourusername/palpal.git
cd palpal

cd backend
npm install
cp .env.example .env
npm run build

cd ../frontend
npm install
cp .env.example .env
```

### 환경 변수 설정

backend/.env
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/palpal
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=sk-...
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
PORT=4000
```

frontend/.env
```
VITE_API_BASE=http://localhost:4000/api
```

### 개발 서버 실행
```bash
cd backend
npm run dev

cd frontend
npm run dev
```

---

## 트러블슈팅

### Socket.io 중복 메시지

문제: 메시지가 2-3번 중복으로 수신됨

해결:
```typescript
useEffect(() => {
  return () => {
    socket?.off('receive_message');
    socket?.disconnect();
  };
}, []);
```

### 이미지 업로드 실패 (PayloadTooLargeError)

문제: 대용량 파일 업로드 불가

해결:
```typescript
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
```

### 카테고리 필터링 미작동

문제: category 필드가 로드되지 않음

해결:
```typescript
.select("_id title price images location status seller likeCount createdAt category")
```

---

## 개발 현황

- 상품 관리 (CRUD)
- 실시간 채팅 (Socket.io)
- 사용자 인증 (JWT)
- AI 사진 분석 (OpenAI Vision)
- 프로덕션 배포 (AWS EC2)
- 성능 최적화 (300ms 로딩)

향후 계획:
- 결제 시스템 통합 (PortOne)
- 지역 기반 추천 (Geolocation)
- 채팅 검색 기능

---

MIT License
