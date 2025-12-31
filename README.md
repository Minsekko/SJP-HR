# 중소기업 ERP 시스템

## 프로젝트 개요
- **이름**: 중소기업 그룹웨어 ERP 통합 시스템
- **목표**: 50-100명 규모의 중소기업을 위한 통합 업무 관리 시스템
- **주요 기능**: 인사관리, 전자결재, 재무/회계 통합 관리

## 🔗 URL
- **개발 서버**: https://3000-iwva1x7bntcgmjsllhk5m-b237eb32.sandbox.novita.ai
- **API 헬스체크**: https://3000-iwva1x7bntcgmjsllhk5m-b237eb32.sandbox.novita.ai/api/health

## ✨ 현재 구현 완료된 기능

### 1. 인사관리 모듈
- ✅ 직원 정보 관리 (등록, 조회, 수정)
- ✅ 부서 관리 (조직도 구조)
- ✅ 직급 관리
- ✅ 근태 관리 (출퇴근 체크, 근무시간 계산)
- ✅ 휴가 신청/승인 시스템

### 2. 전자결재 모듈
- ✅ 결재 문서 작성 및 관리
- ✅ 결재선 설정 (다단계 결재 지원)
- ✅ 결재 승인/반려 워크플로우
- ✅ 문서 유형별 폼 템플릿
- ✅ 긴급도 설정 기능
- ✅ 결재 현황 조회

### 3. 재무/회계 모듈
- ✅ 매출 관리 (등록, 조회, 입금 처리)
- ✅ 매입 관리
- ✅ 비용 처리 (신청, 승인, 정산)
- ✅ 예산 관리 (부서별, 계정별 예산 설정)
- ✅ 거래처 관리
- ✅ 계정과목 관리 (자산, 부채, 자본, 수익, 비용)

## 📊 데이터 아키텍처

### 데이터베이스 구조
- **플랫폼**: Cloudflare D1 (SQLite)
- **테이블 수**: 19개
- **주요 테이블**:
  - 사용자/인증: users
  - 인사: employees, departments, positions, attendances, leave_requests
  - 전자결재: approval_documents, approval_lines, approval_doc_types
  - 재무: sales, purchases, expenses, budgets, business_partners, account_codes

### 초기 데이터
- 8개 기본 직급 (대표이사 ~ 사원)
- 10개 기본 부서 (경영지원본부, 인사팀, 재무팀 등)
- 7개 근태 유형 (연차, 반차, 병가 등)
- 5개 결재 문서 유형 (휴가신청서, 지출결의서 등)
- 30개 기본 계정과목 (자산, 부채, 수익, 비용 등)

## 🔌 API 엔드포인트 요약

### 인증 API (`/api/auth`)
- `POST /login` - 로그인
- `GET /me` - 현재 사용자 정보

### 인사관리 API (`/api/hr`)
- `GET /employees` - 직원 목록 조회 (페이지네이션, 검색, 필터링)
- `GET /employees/:id` - 직원 상세 조회
- `POST /employees` - 직원 등록
- `PUT /employees/:id` - 직원 정보 수정
- `GET /departments` - 부서 목록
- `POST /departments` - 부서 등록
- `GET /positions` - 직급 목록
- `GET /attendances` - 근태 기록 조회
- `POST /attendances/check-in` - 출근 체크
- `POST /attendances/check-out` - 퇴근 체크
- `GET /leave-requests` - 휴가 신청 목록
- `POST /leave-requests` - 휴가 신청
- `PUT /leave-requests/:id/approve` - 휴가 승인/거절
- `GET /attendance-types` - 근태 유형 목록

### 전자결재 API (`/api/approval`)
- `GET /documents` - 결재 문서 목록 (상태별, 기안자별 필터)
- `GET /documents/:id` - 결재 문서 상세 (결재선, 첨부파일 포함)
- `POST /documents` - 결재 문서 작성
- `POST /documents/:id/submit` - 문서 상신
- `POST /documents/:id/approve` - 결재 승인/반려
- `GET /my-approvals` - 내가 결재할 문서 목록
- `GET /doc-types` - 문서 유형 목록
- `GET /doc-types/:id` - 문서 유형 상세

### 재무/회계 API (`/api/finance`)
- `GET /sales` - 매출 목록 (기간별, 거래처별 필터, 합계 제공)
- `POST /sales` - 매출 등록
- `PUT /sales/:id` - 매출 수정
- `POST /sales/:id/payment` - 매출 입금 처리
- `GET /purchases` - 매입 목록
- `POST /purchases` - 매입 등록
- `GET /expenses` - 비용 목록
- `POST /expenses` - 비용 등록
- `POST /expenses/:id/approve` - 비용 승인/거절
- `GET /budgets` - 예산 목록 (연도, 월, 부서별)
- `POST /budgets` - 예산 등록/수정
- `GET /partners` - 거래처 목록
- `POST /partners` - 거래처 등록
- `GET /account-codes` - 계정과목 목록

## 🔐 테스트 계정
- **아이디**: admin
- **비밀번호**: admin123
- **권한**: 관리자 (모든 기능 접근 가능)

## 🚧 미구현 기능

### 우선순위 높음
1. **프론트엔드 UI** - 관리자 대시보드 및 각 모듈 화면
2. **인증/권한 시스템** - JWT 기반 인증, 역할별 접근 제어
3. **첨부파일 업로드** - R2 Storage 연동
4. **통계 및 리포팅** - 대시보드 차트, 각종 보고서

### 우선순위 중간
5. **알림 시스템** - 결재 알림, 일정 알림
6. **검색 기능 고도화** - 전체 검색, 필터링 개선
7. **데이터 내보내기** - Excel, PDF 내보내기
8. **감사 로그** - 모든 작업 이력 추적

### 향후 확장 기능
9. **프로젝트 관리** - 프로젝트, 태스크, 일정 관리
10. **고객관리(CRM)** - 고객 정보, 영업 기회 관리
11. **재고관리** - 입출고, 재고 현황
12. **게시판/공지** - 사내 커뮤니케이션

## 📋 권장 다음 단계

### 1단계: 인증 시스템 강화
- JWT 토큰 기반 인증 구현
- 미들웨어로 권한 검증 추가
- 비밀번호 해싱 (bcrypt) 적용

### 2단계: 프론트엔드 UI 개발
- 로그인 페이지
- 관리자 대시보드
- 각 모듈별 CRUD 화면
- 결재 워크플로우 UI

### 3단계: 고급 기능 추가
- 파일 업로드 (Cloudflare R2)
- 통계 차트 및 리포트
- 실시간 알림
- 모바일 반응형 UI

### 4단계: 프로덕션 배포
- Cloudflare Pages 배포
- 환경 변수 설정
- 도메인 연결
- 성능 최적화

## 🛠 기술 스택
- **백엔드**: Hono (v4.11.3)
- **데이터베이스**: Cloudflare D1 (SQLite)
- **프론트엔드**: Tailwind CSS, Vanilla JavaScript
- **배포**: Cloudflare Pages/Workers
- **개발 도구**: TypeScript, Vite, Wrangler

## 📦 프로젝트 구조
```
webapp/
├── src/
│   ├── index.tsx           # 메인 애플리케이션
│   ├── routes/
│   │   ├── auth.ts        # 인증 API
│   │   ├── hr.ts          # 인사관리 API
│   │   ├── approval.ts    # 전자결재 API
│   │   └── finance.ts     # 재무/회계 API
│   └── types/
│       └── bindings.ts    # TypeScript 타입 정의
├── migrations/
│   ├── 0001_initial_schema.sql  # 데이터베이스 스키마
│   └── 0002_seed_data.sql       # 초기 데이터
├── public/                # 정적 파일
├── dist/                  # 빌드 출력
├── wrangler.jsonc        # Cloudflare 설정
├── vite.config.ts        # Vite 설정
└── package.json          # 프로젝트 메타데이터

```

## 🚀 로컬 개발 환경 실행

### 1. 의존성 설치
```bash
cd /home/user/webapp
npm install
```

### 2. 데이터베이스 마이그레이션
```bash
npm run db:migrate:local
```

### 3. 빌드
```bash
npm run build
```

### 4. 개발 서버 시작
```bash
pm2 start ecosystem.config.cjs
```

### 5. 서버 확인
```bash
curl http://localhost:3000/api/health
```

## 📝 사용자 가이드

### 직원 등록 예시
```bash
curl -X POST http://localhost:3000/api/hr/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employee_number": "EMP002",
    "name": "홍길동",
    "department_id": 2,
    "position_id": 5,
    "email": "hong@company.com",
    "hire_date": "2024-01-01",
    "employment_type": "full_time",
    "status": "active"
  }'
```

### 결재 문서 작성 예시
```bash
curl -X POST http://localhost:3000/api/approval/documents \
  -H "Content-Type: application/json" \
  -d '{
    "doc_type_id": 1,
    "title": "연차 사용 신청",
    "content": {"start_date": "2024-12-25", "end_date": "2024-12-25", "reason": "개인 사유"},
    "drafter_id": 1,
    "urgency": "normal",
    "approval_lines": [
      {"approver_id": 2, "approval_type": "approval"}
    ]
  }'
```

### 매출 등록 예시
```bash
curl -X POST http://localhost:3000/api/finance/sales \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": 1,
    "sale_date": "2024-12-31",
    "due_date": "2025-01-31",
    "account_code_id": 11,
    "amount": 1000000,
    "description": "12월 상품 매출",
    "employee_id": 1
  }'
```

## 🔄 배포 상태
- **현재 상태**: ✅ 로컬 개발 환경 구축 완료
- **다음 단계**: Cloudflare Pages 프로덕션 배포 대기

## 📅 마지막 업데이트
- **날짜**: 2025-12-31
- **버전**: v1.0.0-beta
- **상태**: 백엔드 API 구현 완료, 프론트엔드 UI 개발 필요
