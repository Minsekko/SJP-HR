# 👥 직원 데이터 입력 가이드

실제 회사 직원 정보를 ERP 시스템에 입력하는 5가지 방법을 안내합니다.

---

## 📋 사전 준비

### 1️⃣ 부서 ID 확인
```bash
npx wrangler d1 execute webapp-production --local --command="SELECT id, name, code FROM departments"
```

| ID | 부서명 | 코드 |
|----|--------|------|
| 1 | 경영지원본부 | ADMIN |
| 2 | 인사팀 | HR |
| 3 | 총무팀 | GA |
| 4 | 재무팀 | FIN |
| 5 | 영업본부 | SALES |
| 6 | 영업1팀 | SALES1 |
| 7 | 영업2팀 | SALES2 |
| 8 | 기술본부 | TECH |
| 9 | 개발팀 | DEV |
| 10 | 품질관리팀 | QA |

### 2️⃣ 직급 ID 확인
```bash
npx wrangler d1 execute webapp-production --local --command="SELECT id, name, code, level FROM positions"
```

| ID | 직급명 | 코드 | 레벨 |
|----|--------|------|------|
| 1 | 대표이사 | CEO | 1 |
| 2 | 이사 | DIRECTOR | 2 |
| 3 | 부장 | GM | 3 |
| 4 | 차장 | DM | 4 |
| 5 | 과장 | MANAGER | 5 |
| 6 | 대리 | ASSISTANT_MANAGER | 6 |
| 7 | 주임 | SENIOR | 7 |
| 8 | 사원 | STAFF | 8 |

---

## 🚀 방법 1: SQL 파일 사용 (대량 입력 - 추천)

### 단계 1: insert_employees.sql 파일 수정

```sql
-- 예시: 10명의 직원 추가
INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES 
  ('2024001', '김대표', 1, 1, 'ceo@company.com', '010-1234-5678', '2020-01-01', 'full_time', 'active'),
  ('2024002', '박인사', 2, 5, 'hr1@company.com', '010-2345-6789', '2021-03-01', 'full_time', 'active'),
  ('2024003', '이주임', 2, 7, 'hr2@company.com', '010-3456-7890', '2022-06-15', 'full_time', 'active');
  -- ... 계속 추가
```

### 단계 2: 실행

```bash
# 로컬 DB에 실행
npx wrangler d1 execute webapp-production --local --file=./insert_employees.sql

# 프로덕션 DB에 실행 (배포 후)
npx wrangler d1 execute webapp-production --remote --file=./insert_employees.sql
```

### 단계 3: 확인

```bash
npx wrangler d1 execute webapp-production --local --command="
SELECT e.employee_number, e.name, d.name as dept, p.name as pos 
FROM employees e 
LEFT JOIN departments d ON e.department_id = d.id 
LEFT JOIN positions p ON e.position_id = p.id"
```

---

## 🖱️ 방법 2: 웹 UI 사용 (사용자 친화적)

### 단계 1: 브라우저 접속
```
URL: https://3000-iwva1x7bntcgmjsllhk5m-b237eb32.sandbox.novita.ai
```

### 단계 2: 로그인
- **ID**: admin
- **Password**: admin123

### 단계 3: 직원 등록
1. 좌측 메뉴에서 **"직원 관리"** 클릭
2. **"직원 등록"** 버튼 클릭
3. 정보 입력:
   - 사원번호
   - 이름
   - 부서 (드롭다운 선택)
   - 직급 (드롭다운 선택)
   - 이메일
   - 휴대폰
   - 입사일
   - 고용형태 (정규직/계약직/파트타임)
4. **"저장"** 버튼 클릭

---

## ⌨️ 방법 3: 직접 SQL 명령어 실행 (한 명씩)

```bash
# 한 명의 직원 추가
npx wrangler d1 execute webapp-production --local --command="
INSERT INTO employees (
  employee_number, name, department_id, position_id, 
  email, mobile, hire_date, employment_type, status
) VALUES (
  '2024011', '신입사원', 9, 8, 
  'new@company.com', '010-9999-9999', '2024-01-01', 
  'full_time', 'active'
)"

# 결과 확인
npx wrangler d1 execute webapp-production --local --command="
SELECT * FROM employees WHERE employee_number='2024011'"
```

---

## 📊 방법 4: CSV/Excel 파일에서 변환

### 단계 1: CSV 파일 준비
```csv
사원번호,이름,부서ID,직급ID,이메일,휴대폰,입사일
2024001,김대표,1,1,ceo@company.com,010-1234-5678,2020-01-01
2024002,박인사,2,5,hr1@company.com,010-2345-6789,2021-03-01
```

### 단계 2: Python 스크립트로 SQL 생성

```python
import csv

with open('employees.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)")
        print(f"VALUES ('{row['사원번호']}', '{row['이름']}', {row['부서ID']}, {row['직급ID']}, '{row['이메일']}', '{row['휴대폰']}', '{row['입사일']}', 'full_time', 'active');")
        print()
```

### 단계 3: 생성된 SQL을 파일로 저장 후 실행

---

## 🔄 방법 5: API 호출 (프로그래밍 방식)

```bash
# curl로 직원 등록 API 호출
curl -X POST http://localhost:3000/api/hr/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employee_number": "2024011",
    "name": "신입사원",
    "department_id": 9,
    "position_id": 8,
    "email": "new@company.com",
    "mobile": "010-9999-9999",
    "hire_date": "2024-01-01",
    "employment_type": "full_time",
    "status": "active"
  }'
```

---

## ✅ 필수 입력 필드

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| employee_number | TEXT | ✅ | 사원번호 (고유) | '2024001' |
| name | TEXT | ✅ | 이름 | '홍길동' |
| department_id | INTEGER | ✅ | 부서 ID | 2 (인사팀) |
| position_id | INTEGER | ✅ | 직급 ID | 5 (과장) |
| email | TEXT | ✅ | 이메일 (고유) | 'hong@company.com' |
| mobile | TEXT | ✅ | 휴대폰 | '010-1234-5678' |
| hire_date | DATE | ✅ | 입사일 | '2024-01-01' |
| employment_type | TEXT | ✅ | 고용형태 | 'full_time' |
| status | TEXT | ✅ | 상태 | 'active' |

### 선택 입력 필드
- name_en (영문명)
- phone (전화번호)
- birth_date (생년월일)
- address (주소)
- emergency_contact (긴급연락처)
- emergency_phone (긴급전화)
- bank_name (은행명)
- bank_account (계좌번호)
- salary (급여)

---

## 🔍 데이터 확인 명령어

### 전체 직원 수
```bash
npx wrangler d1 execute webapp-production --local --command="
SELECT COUNT(*) as total FROM employees WHERE status='active'"
```

### 부서별 직원 수
```bash
npx wrangler d1 execute webapp-production --local --command="
SELECT d.name, COUNT(e.id) as count 
FROM departments d 
LEFT JOIN employees e ON d.id = e.department_id 
GROUP BY d.name"
```

### 특정 직원 검색
```bash
npx wrangler d1 execute webapp-production --local --command="
SELECT * FROM employees WHERE name LIKE '%김%'"
```

### 최근 등록된 직원 10명
```bash
npx wrangler d1 execute webapp-production --local --command="
SELECT e.employee_number, e.name, d.name as dept, p.name as pos, e.created_at
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
ORDER BY e.created_at DESC
LIMIT 10"
```

---

## ⚠️ 주의사항

1. **사원번호 중복 확인**: 사원번호는 고유해야 합니다
2. **이메일 중복 확인**: 이메일도 고유해야 합니다
3. **날짜 형식**: 'YYYY-MM-DD' 형식 사용
4. **부서/직급 ID**: 반드시 존재하는 ID 사용
5. **고용형태**: `full_time`, `part_time`, `contract` 중 선택
6. **상태**: `active`, `resigned`, `on_leave` 중 선택

---

## 🔧 문제 해결

### 사원번호 중복 오류
```sql
-- 기존 사원번호 확인
SELECT employee_number FROM employees;

-- 중복 사원 삭제 (주의!)
DELETE FROM employees WHERE employee_number = '2024001';
```

### 이메일 중복 오류
```sql
-- 기존 이메일 확인
SELECT email FROM employees;

-- 이메일 수정
UPDATE employees 
SET email = 'new_email@company.com' 
WHERE employee_number = '2024001';
```

### 부서/직급 ID 오류
```sql
-- 유효한 부서 ID 확인
SELECT id, name FROM departments;

-- 유효한 직급 ID 확인
SELECT id, name FROM positions;
```

---

## 📞 지원

- 더 자세한 정보: `DATABASE_INFO.md` 참조
- 웹 UI 접근: https://3000-iwva1x7bntcgmjsllhk5m-b237eb32.sandbox.novita.ai
- 테스트 계정: admin / admin123

---

**작성일**: 2026-01-07  
**버전**: 1.0
