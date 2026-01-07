# 중소기업 ERP 시스템

50-100명 규모의 중소기업을 위한 통합 ERP 시스템입니다.

## 📋 프로젝트 개요

- **목표**: 인사관리, 전자결재, 재무/회계를 통합한 중소기업용 ERP 솔루션
- **사용자 규모**: 50-100명
- **기술 스택**: Hono + TypeScript + Cloudflare D1 + Tailwind CSS

## 🌐 접속 URL

- **개발 서버**: https://3000-iwva1x7bntcgmjsllhk5m-b237eb32.sandbox.novita.ai
- **API 헬스체크**: https://3000-iwva1x7bntcgmjsllhk5m-b237eb32.sandbox.novita.ai/api/health
- **GitHub**: (아직 연동 안됨)

## ✅ 현재 완료된 기능

### 1. 인사관리 모듈
- ✅ **프론트엔드**: 직원 목록 조회, 검색, 등록 화면
- ✅ **백엔드**: 직원 정보 관리 (등록, 조회, 수정) API
- ✅ 부서 관리 (10개 기본 부서)
- ✅ 직급 관리 (8단계 직급 체계)
- ✅ **프론트엔드**: 출퇴근 체크 버튼, 근태 기록 조회
- ✅ **백엔드**: 근태 관리 (출퇴근 체크, 근무시간 계산)
- ✅ 휴가 신청 및 승인 API

### 2. 전자결재 모듈
- ✅ **프론트엔드**: 결재 문서 작성 모달, 문서 목록 (상태별 필터)
- ✅ **백엔드**: 결재 문서 작성, 결재선 설정
- ✅ 문서 상신 및 승인 워크플로우
- ✅ 결재 대기 문서 조회
- ✅ 문서 유형 관리 (휴가신청, 지출결의, 구매요청 등 5종)

### 3. 재무/회계 모듈
- ✅ **프론트엔드**: 매출/비용 등록 모달, 목록 조회
- ✅ **백엔드**: 매출 관리 (등록, 조회, 입금 처리) API
- ✅ 매입 관리 API
- ✅ 비용 처리 (신청, 승인) API
- ✅ 예산 관리 API
- ✅ 거래처 관리
- ✅ 계정과목 관리 (복식부기 체계)

### 4. 프론트엔드 UI (SPA)
- ✅ **로그인 페이지** (인증 처리)
- ✅ **대시보드** (통계 카드, 최근 활동)
- ✅ **사이드바 네비게이션** (모든 메뉴)
- ✅ **직원 관리 화면** (목록, 검색, 등록)
- ✅ **근태 관리 화면** (출퇴근 체크, 기록)
- ✅ **전자결재 화면** (문서 작성, 목록)
- ✅ **매출 관리 화면** (등록, 목록)
- ✅ **비용 관리 화면** (등록, 목록)

### 5. 인증 시스템
- ✅ 로그인 화면 및 API 연동
- ✅ LocalStorage 세션 관리
- ✅ 로그아웃 기능
- ⚠️ JWT 토큰 기반 인증 (구현 예정)

## 📊 API 엔드포인트

### 인증 API
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 인사관리 API
- `GET /api/hr/employees` - 직원 목록
- `GET /api/hr/employees/:id` - 직원 상세
- `POST /api/hr/employees` - 직원 등록
- `PUT /api/hr/employees/:id` - 직원 수정
- `GET /api/hr/departments` - 부서 목록
- `GET /api/hr/attendances` - 근태 기록
- `POST /api/hr/attendances/check-in` - 출근 체크
- `POST /api/hr/attendances/check-out` - 퇴근 체크
- `GET /api/hr/leave-requests` - 휴가 신청 목록
- `POST /api/hr/leave-requests` - 휴가 신청

### 전자결재 API
- `GET /api/approval/documents` - 결재 문서 목록
- `GET /api/approval/documents/:id` - 문서 상세
- `POST /api/approval/documents` - 문서 작성
- `POST /api/approval/documents/:id/submit` - 문서 상신
- `POST /api/approval/documents/:id/approve` - 결재 승인/반려
- `GET /api/approval/my-approvals` - 내 결재 대기 문서
- `GET /api/approval/doc-types` - 문서 유형 목록

### 재무/회계 API
- `GET /api/finance/sales` - 매출 목록
- `POST /api/finance/sales` - 매출 등록
- `POST /api/finance/sales/:id/payment` - 입금 처리
- `GET /api/finance/expenses` - 비용 목록
- `POST /api/finance/expenses` - 비용 등록
- `POST /api/finance/expenses/:id/approve` - 비용 승인
- `GET /api/finance/budgets` - 예산 목록
- `GET /api/finance/partners` - 거래처 목록
- `GET /api/finance/account-codes` - 계정과목 목록

## 🗄️ 데이터베이스 구조

### 핵심 테이블
1. **인사관리**: users, employees, departments, positions, attendances, leave_requests
2. **전자결재**: approval_documents, approval_lines, approval_doc_types, approval_attachments
3. **재무/회계**: sales, purchases, expenses, budgets, business_partners, account_codes

### 초기 데이터
- 8개 직급 (대표이사 ~ 사원)
- 10개 부서 (경영지원본부, 인사팀, 재무팀 등)
- 7개 근태 유형 (연차, 반차, 병가 등)
- 5개 결재 문서 유형 (휴가신청서, 지출결의서 등)
- 기본 계정과목 체계 (자산, 부채, 자본, 수익, 비용)

### 테스트 계정
- **아이디**: admin
- **비밀번호**: admin123
- **권한**: 시스템 관리자

## 🚀 로컬 개발 환경

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 로컬 D1 데이터베이스 마이그레이션
npm run db:migrate:local

# 빌드
npm run build

# 개발 서버 시작 (PM2)
pm2 start ecosystem.config.cjs

# 서버 확인
curl http://localhost:3000/api/health
```

### 유용한 명령어
```bash
# 포트 정리
npm run clean-port

# 데이터베이스 초기화
npm run db:reset

# 로컬 데이터베이스 콘솔
npm run db:console:local

# PM2 로그 확인
pm2 logs webapp --nostream
```

## ⚠️ 아직 구현되지 않은 기능

### 1. 고급 기능
- ❌ 파일 업로드 (R2 스토리지 연동)
- ❌ 이메일 알림
- ❌ 대시보드 통계 차트 (Chart.js)
- ❌ 엑셀 내보내기
- ❌ 다국어 지원
- ❌ 반응형 모바일 최적화

### 2. 인증/권한 강화
- ❌ JWT 토큰 기반 인증
- ❌ 역할 기반 접근 제어 (RBAC)
- ❌ API 미들웨어 인증 체크
- ❌ 비밀번호 암호화 (bcrypt)
- ❌ 비밀번호 변경 기능

### 3. 추가 모듈
- ❌ 프로젝트 관리
- ❌ 고객관리 (CRM)
- ❌ 재고관리
- ❌ 게시판/공지사항

### 4. 배포
- ❌ GitHub 연동
- ❌ Cloudflare Pages 프로덕션 배포
- ❌ 프로덕션 D1 데이터베이스 설정
- ❌ 환경 변수 설정

## 🔧 다음 단계 권장사항

### 우선순위 1: 인증 시스템 강화
1. JWT 토큰 발급 및 검증 미들웨어 구현
2. 비밀번호 bcrypt 암호화
3. 역할 기반 API 접근 제어
4. 세션 만료 처리

### 우선순위 2: UI/UX 개선
1. 대시보드 통계 차트 (Chart.js 통합)
2. 페이지네이션 개선
3. 모바일 반응형 최적화
4. 로딩 스피너 및 에러 메시지 개선
5. 날짜 선택기 개선 (Date Picker)

### 우선순위 3: 고급 기능
1. 파일 업로드 (Cloudflare R2)
2. 엑셀 내보내기 (Export)
3. 이메일 알림 (SendGrid 또는 Mailgun)
4. 검색 기능 강화

### 우선순위 4: 프로덕션 배포
1. GitHub 리포지토리 연동
2. Cloudflare Pages 배포
3. 프로덕션 D1 데이터베이스 설정
4. 프로덕션 환경 변수 설정

## 📁 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx              # 메인 애플리케이션
│   ├── routes/                # API 라우트
│   │   ├── auth.ts           # 인증 API
│   │   ├── hr.ts             # 인사관리 API
│   │   ├── approval.ts       # 전자결재 API
│   │   └── finance.ts        # 재무/회계 API
│   ├── types/
│   │   └── bindings.ts       # 타입 정의
│   └── utils/                # 유틸리티 함수
├── migrations/               # D1 마이그레이션
│   ├── 0001_initial_schema.sql
│   └── 0002_seed_data.sql
├── public/                   # 정적 파일
│   └── static/              # JavaScript 파일
│       ├── app.js          # 메인 앱 (로그인, 레이아웃, 대시보드)
│       ├── pages.js        # 인사관리 페이지
│       └── approval-finance.js  # 전자결재, 재무 페이지
├── dist/                     # 빌드 결과물
├── ecosystem.config.cjs      # PM2 설정
├── wrangler.jsonc           # Cloudflare 설정
├── package.json
└── README.md
```

## 💡 기술 스택

- **Backend**: Hono (Edge-optimized web framework)
- **Database**: Cloudflare D1 (Distributed SQLite)
- **Deployment**: Cloudflare Pages
- **Frontend**: Tailwind CSS + Vanilla JavaScript
- **Development**: PM2, Wrangler, TypeScript

## 📝 라이선스

MIT License

## 👥 개발 정보

- **버전**: v1.0.0
- **최종 업데이트**: 2026-01-07
- **개발 환경**: Cloudflare Pages + D1 Database
- **프론트엔드**: Single Page Application (SPA)
- **총 코드 라인**: ~2,000+ 줄
