# 🗄️ ERP 시스템 데이터베이스 상세 정보

## 📊 데이터베이스 개요

**데이터베이스 엔진**: Cloudflare D1 (SQLite)  
**위치**: `.wrangler/state/v3/d1` (로컬 개발)  
**데이터베이스명**: `webapp-production`  
**마이그레이션 파일**:
- `migrations/0001_initial_schema.sql` - 스키마 정의
- `migrations/0002_seed_data.sql` - 초기 데이터

---

## 📋 전체 테이블 목록 (20개)

| 번호 | 테이블명 | 설명 | 레코드 수 |
|-----|---------|------|----------|
| 1 | **employees** | 직원 정보 | 13명 |
| 2 | **departments** | 부서 정보 | 10개 |
| 3 | **positions** | 직급 정보 | 8개 |
| 4 | **users** | 사용자 계정 | 1개 (admin) |
| 5 | **attendances** | 근태 기록 | - |
| 6 | **attendance_types** | 근태 유형 | - |
| 7 | **leave_requests** | 휴가 신청 | - |
| 8 | **approval_documents** | 전자결재 문서 | - |
| 9 | **approval_lines** | 결재선 정보 | - |
| 10 | **approval_doc_types** | 결재 문서 유형 | 5개 |
| 11 | **approval_attachments** | 결재 첨부파일 | - |
| 12 | **sales** | 매출 관리 | - |
| 13 | **purchases** | 매입 관리 | - |
| 14 | **expenses** | 비용 관리 | - |
| 15 | **budgets** | 예산 관리 | - |
| 16 | **business_partners** | 거래처 정보 | - |
| 17 | **account_codes** | 계정과목 | 40개 |
| 18 | **d1_migrations** | 마이그레이션 이력 | - |
| 19 | **sqlite_sequence** | SQLite 시퀀스 | - |
| 20 | **_cf_METADATA** | Cloudflare 메타데이터 | - |

---

## 👥 1. EMPLOYEES (직원) 테이블

### 📐 스키마 구조
```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  employee_number TEXT UNIQUE NOT NULL,      -- 사원번호
  name TEXT NOT NULL,                        -- 이름
  name_en TEXT,                              -- 영문명
  department_id INTEGER,                     -- 부서 ID (FK)
  position_id INTEGER,                       -- 직급 ID (FK)
  email TEXT,                                -- 이메일
  phone TEXT,                                -- 전화번호
  mobile TEXT,                               -- 휴대폰
  hire_date DATE NOT NULL,                   -- 입사일
  resignation_date DATE,                     -- 퇴사일
  employment_type TEXT NOT NULL DEFAULT 'full_time',  -- 고용형태
  status TEXT NOT NULL DEFAULT 'active',     -- 상태
  birth_date DATE,                           -- 생년월일
  address TEXT,                              -- 주소
  emergency_contact TEXT,                    -- 긴급연락처
  emergency_phone TEXT,                      -- 긴급전화
  bank_name TEXT,                            -- 은행명
  bank_account TEXT,                         -- 계좌번호
  salary DECIMAL(15,2),                      -- 급여
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (position_id) REFERENCES positions(id)
)
```

### 📊 현재 데이터 (13명)

| ID | 사원번호 | 이름 | 부서 | 직급 | 이메일 | 입사일 |
|----|---------|------|------|------|--------|--------|
| 1 | EMP001 | 시스템관리자 | 경영지원본부(1) | 대표이사(1) | admin@company.com | 2025-12-31 |
| 2 | EMP002 | 김철수 | 인사팀(2) | 과장(5) | kim@company.com | 2024-01-01 |
| 3 | 20260107001 | 박승주 | 총무팀(3) | 대리(6) | sjpark@sjpulp.com | 2024-01-01 |
| 4 | 2024001 | 김대표 | 경영지원본부(1) | 대표이사(1) | ceo@company.com | 2020-01-01 |
| 5 | 2024002 | 박인사 | 인사팀(2) | 과장(5) | hr1@company.com | 2021-03-01 |
| 6 | 2024003 | 이주임 | 인사팀(2) | 주임(7) | hr2@company.com | 2022-06-15 |
| 7 | 2024004 | 최부장 | 재무팀(4) | 부장(3) | finance1@company.com | 2019-05-01 |
| 8 | 2024005 | 정과장 | 재무팀(4) | 과장(5) | finance2@company.com | 2020-08-20 |
| 9 | 2024006 | 강차장 | 영업1팀(6) | 차장(4) | sales1@company.com | 2021-01-10 |
| 10 | 2024007 | 오대리 | 영업1팀(6) | 대리(6) | sales2@company.com | 2022-03-15 |
| 11 | 2024008 | 송사원 | 영업1팀(6) | 사원(8) | sales3@company.com | 2023-09-01 |
| 12 | 2024009 | 한차장 | 개발팀(9) | 차장(4) | dev1@company.com | 2020-02-01 |
| 13 | 2024010 | 윤과장 | 개발팀(9) | 과장(5) | dev2@company.com | 2021-07-01 |

### 🔑 중요 필드 설명
- **employment_type**: `full_time` (정규직), `part_time` (파트타임), `contract` (계약직)
- **status**: `active` (재직), `resigned` (퇴사), `on_leave` (휴직)

---

## 🏢 2. DEPARTMENTS (부서) 테이블

### 📐 스키마 구조
```sql
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                        -- 부서명
  code TEXT UNIQUE NOT NULL,                 -- 부서코드
  parent_id INTEGER,                         -- 상위 부서 ID
  manager_id INTEGER,                        -- 부서장 직원 ID
  description TEXT,                          -- 설명
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES departments(id),
  FOREIGN KEY (manager_id) REFERENCES employees(id)
)
```

### 📊 현재 데이터 (10개 부서)

| ID | 부서명 | 코드 | 설명 |
|----|--------|------|------|
| 1 | 경영지원본부 | ADMIN | 경영 지원 및 관리 총괄 |
| 2 | 인사팀 | HR | 인사 관리 |
| 3 | 총무팀 | GA | 총무 및 자산 관리 |
| 4 | 재무팀 | FIN | 재무 및 회계 |
| 5 | 영업본부 | SALES | 영업 총괄 |
| 6 | 영업1팀 | SALES1 | 영업 1팀 |
| 7 | 영업2팀 | SALES2 | 영업 2팀 |
| 8 | 기술본부 | TECH | 기술 개발 총괄 |
| 9 | 개발팀 | DEV | 시스템 개발 |
| 10 | 품질관리팀 | QA | 품질 관리 |

---

## 🎖️ 3. POSITIONS (직급) 테이블

### 📐 스키마 구조
```sql
CREATE TABLE positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                        -- 직급명
  code TEXT UNIQUE NOT NULL,                 -- 직급코드
  level INTEGER NOT NULL,                    -- 직급 레벨 (1이 최상위)
  description TEXT,                          -- 설명
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 📊 현재 데이터 (8개 직급)

| ID | 직급명 | 코드 | 레벨 | 설명 |
|----|--------|------|------|------|
| 1 | 대표이사 | CEO | 1 | 최고경영자 |
| 2 | 이사 | DIRECTOR | 2 | 이사급 |
| 3 | 부장 | GM | 3 | 부서장급 |
| 4 | 차장 | DM | 4 | 차장급 |
| 5 | 과장 | MANAGER | 5 | 관리자급 |
| 6 | 대리 | ASSISTANT_MANAGER | 6 | 대리급 |
| 7 | 주임 | SENIOR | 7 | 주임급 |
| 8 | 사원 | STAFF | 8 | 사원급 |

---

## 📝 4. APPROVAL_DOC_TYPES (전자결재 문서 유형) 테이블

### 📊 현재 데이터 (5개 유형)

| ID | 문서유형 | 코드 | 설명 | 필드 |
|----|----------|------|------|------|
| 1 | 휴가신청서 | LEAVE | 휴가 신청 | start_date, end_date, leave_type, reason |
| 2 | 지출결의서 | EXPENSE | 지출 결의 | expense_date, amount, category, purpose, receipt |
| 3 | 구매요청서 | PURCHASE | 구매 요청 | item_name, quantity, unit_price, total_price, supplier, purpose |
| 4 | 계약서 | CONTRACT | 계약 승인 | partner_name, contract_amount, contract_period, contract_type, terms |
| 5 | 일반기안서 | GENERAL | 일반 기안 | subject, content, attachments |

---

## 💰 5. ACCOUNT_CODES (계정과목) 테이블

### 📊 주요 계정과목 (40개 중 20개 샘플)

| 코드 | 계정과목명 | 유형 | 레벨 | 설명 |
|------|-----------|------|------|------|
| **1000** | 자산 | asset | 1 | 자산 총계 |
| 1100 | 유동자산 | asset | 2 | 1년 이내 현금화 가능 자산 |
| 1110 | 현금및현금성자산 | asset | 3 | 현금, 보통예금 등 |
| 1120 | 매출채권 | asset | 3 | 상품 및 용역 판매 채권 |
| 1200 | 비유동자산 | asset | 2 | 장기 보유 자산 |
| 1210 | 유형자산 | asset | 3 | 토지, 건물, 기계장치 등 |
| **2000** | 부채 | liability | 1 | 부채 총계 |
| 2100 | 유동부채 | liability | 2 | 1년 이내 상환 부채 |
| 2110 | 매입채무 | liability | 3 | 상품 및 용역 구매 채무 |
| 2120 | 단기차입금 | liability | 3 | 단기 차입금 |
| 2200 | 비유동부채 | liability | 2 | 장기 부채 |
| 2210 | 장기차입금 | liability | 3 | 장기 차입금 |
| **3000** | 자본 | equity | 1 | 자본 총계 |
| 3100 | 자본금 | equity | 2 | 자본금 |
| 3200 | 이익잉여금 | equity | 2 | 이익잉여금 |
| **4000** | 수익 | revenue | 1 | 수익 총계 |
| 4100 | 매출액 | revenue | 2 | 매출액 |
| 4110 | 상품매출 | revenue | 3 | 상품 판매 수익 |
| 4120 | 용역매출 | revenue | 3 | 용역 제공 수익 |
| **5000** | 비용 | expense | 1 | 비용 총계 |

### 💡 계정과목 유형
- **asset** - 자산
- **liability** - 부채
- **equity** - 자본
- **revenue** - 수익
- **expense** - 비용

---

## 🔧 데이터베이스 관리 명령어

### 1️⃣ 데이터 조회

```bash
# 전체 직원 목록
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM employees"

# 부서별 직원 수
npx wrangler d1 execute webapp-production --local --command="
SELECT d.name, COUNT(e.id) as count 
FROM departments d 
LEFT JOIN employees e ON d.id = e.department_id 
GROUP BY d.name"

# 직급별 직원 수
npx wrangler d1 execute webapp-production --local --command="
SELECT p.name, COUNT(e.id) as count 
FROM positions p 
LEFT JOIN employees e ON p.id = e.position_id 
GROUP BY p.name"

# 특정 직원 상세 정보
npx wrangler d1 execute webapp-production --local --command="
SELECT 
  e.employee_number,
  e.name,
  d.name as department,
  p.name as position,
  e.email,
  e.mobile,
  e.hire_date,
  e.status
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
WHERE e.id = 1"
```

### 2️⃣ 데이터 삽입

```bash
# 새 직원 추가
npx wrangler d1 execute webapp-production --local --command="
INSERT INTO employees (
  employee_number, name, department_id, position_id, 
  email, mobile, hire_date, employment_type, status
) VALUES (
  '2024011', '신입사원', 9, 8, 
  'new@company.com', '010-9999-9999', '2024-01-01', 
  'full_time', 'active'
)"
```

### 3️⃣ 데이터 수정

```bash
# 직원 정보 수정
npx wrangler d1 execute webapp-production --local --command="
UPDATE employees 
SET department_id = 3, position_id = 6, updated_at = datetime('now')
WHERE id = 3"
```

### 4️⃣ 데이터 삭제

```bash
# 특정 직원 삭제
npx wrangler d1 execute webapp-production --local --command="
DELETE FROM employees WHERE id = 13"

# 테스트 데이터 전체 삭제 (ID > 3만 삭제)
npx wrangler d1 execute webapp-production --local --command="
DELETE FROM employees WHERE id > 3"
```

### 5️⃣ 데이터베이스 초기화

```bash
# 전체 데이터 초기화 및 재생성
npm run db:reset

# 또는 수동으로
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply webapp-production --local
```

### 6️⃣ 파일로 SQL 실행

```bash
# SQL 파일 실행
npx wrangler d1 execute webapp-production --local --file=./insert_employees.sql

# 대량 데이터 삽입
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

---

## 📊 통계 쿼리

```bash
# 전체 직원 수
npx wrangler d1 execute webapp-production --local --command="
SELECT COUNT(*) as total FROM employees WHERE status='active'"

# 부서별 통계
npx wrangler d1 execute webapp-production --local --command="
SELECT 
  d.name as 부서,
  COUNT(e.id) as 직원수,
  AVG(JULIANDAY('now') - JULIANDAY(e.hire_date))/365 as 평균근속년수
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
GROUP BY d.name"

# 직급별 통계
npx wrangler d1 execute webapp-production --local --command="
SELECT 
  p.name as 직급,
  p.level as 레벨,
  COUNT(e.id) as 인원
FROM positions p
LEFT JOIN employees e ON p.id = e.position_id
GROUP BY p.name
ORDER BY p.level"
```

---

## 🔐 로그인 계정 정보

### 기본 관리자 계정
- **ID**: `admin`
- **Password**: `admin123`
- **이메일**: `admin@company.com`
- **권한**: 시스템 관리자 (모든 기능 접근 가능)

---

## 🚀 빠른 시작 가이드

### 1. 데이터베이스 상태 확인
```bash
cd /home/user/webapp
npx wrangler d1 execute webapp-production --local --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### 2. 직원 데이터 확인
```bash
npx wrangler d1 execute webapp-production --local --command="SELECT COUNT(*) FROM employees"
```

### 3. 웹 UI로 확인
```
URL: https://3000-iwva1x7bntcgmjsllhk5m-b237eb32.sandbox.novita.ai
로그인: admin / admin123
메뉴: 직원 관리 → 직원 목록 확인
```

---

## 📁 관련 파일 위치

```
/home/user/webapp/
├── migrations/
│   ├── 0001_initial_schema.sql    # 테이블 스키마
│   └── 0002_seed_data.sql         # 초기 데이터
├── insert_employees.sql           # 직원 데이터 삽입 SQL
├── EMPLOYEE_DATA_GUIDE.md         # 직원 데이터 입력 가이드
├── DATABASE_INFO.md               # 이 문서
└── .wrangler/state/v3/d1/         # 로컬 데이터베이스 파일
```

---

## ⚠️ 주의사항

1. **로컬 개발 환경**: 현재 `--local` 모드로 작동 중 (`.wrangler/state/v3/d1`)
2. **프로덕션 배포**: 실제 배포 시 Cloudflare D1 프로덕션 데이터베이스 생성 필요
3. **외래 키 제약**: SQLite 외래 키 제약이 활성화되어 있으므로 삭제 시 주의
4. **마이그레이션**: 스키마 변경 시 새 마이그레이션 파일 생성 필요

---

## 📞 문의 및 지원

- 데이터베이스 구조 문의: `EMPLOYEE_DATA_GUIDE.md` 참조
- SQL 쿼리 예제: 이 문서의 "데이터베이스 관리 명령어" 섹션 참조
- 웹 UI 접근: https://3000-iwva1x7bntcgmjsllhk5m-b237eb32.sandbox.novita.ai

---

**마지막 업데이트**: 2026-01-07  
**데이터베이스 버전**: v1.0  
**총 직원 수**: 13명  
**총 테이블 수**: 20개
