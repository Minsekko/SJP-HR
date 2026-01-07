-- ========================================
-- 직원 데이터 삽입 SQL 파일
-- ========================================
-- 이 파일은 실제 회사 직원 데이터를 데이터베이스에 입력하기 위한 템플릿입니다.
-- 아래 샘플 데이터를 실제 직원 정보로 수정하여 사용하세요.

-- ========================================
-- 사용 방법
-- ========================================
-- 1. 아래 INSERT 문의 값들을 실제 직원 정보로 수정
-- 2. 터미널에서 실행:
--    npx wrangler d1 execute webapp-production --local --file=./insert_employees.sql
-- 3. 또는 프로덕션 DB에 실행:
--    npx wrangler d1 execute webapp-production --remote --file=./insert_employees.sql

-- ========================================
-- 부서 ID 참고 (departments 테이블)
-- ========================================
-- 1: 경영지원본부
-- 2: 인사팀
-- 3: 총무팀
-- 4: 재무팀
-- 5: 영업본부
-- 6: 영업1팀
-- 7: 영업2팀
-- 8: 기술본부
-- 9: 개발팀
-- 10: 품질관리팀

-- ========================================
-- 직급 ID 참고 (positions 테이블)
-- ========================================
-- 1: 대표이사 (CEO)
-- 2: 이사 (DIRECTOR)
-- 3: 부장 (GM)
-- 4: 차장 (DM)
-- 5: 과장 (MANAGER)
-- 6: 대리 (ASSISTANT_MANAGER)
-- 7: 주임 (SENIOR)
-- 8: 사원 (STAFF)

-- ========================================
-- 샘플 직원 데이터 (실제 정보로 수정 필요)
-- ========================================

-- 경영지원본부 (1)
INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024001', '김대표', 1, 1, 'ceo@company.com', '010-1234-5678', '2020-01-01', 'full_time', 'active');

-- 인사팀 (2)
INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024002', '박인사', 2, 5, 'hr1@company.com', '010-2345-6789', '2021-03-01', 'full_time', 'active');

INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024003', '이주임', 2, 7, 'hr2@company.com', '010-3456-7890', '2022-06-15', 'full_time', 'active');

-- 재무팀 (4)
INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024004', '최부장', 4, 3, 'finance1@company.com', '010-4567-8901', '2019-05-01', 'full_time', 'active');

INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024005', '정과장', 4, 5, 'finance2@company.com', '010-5678-9012', '2020-08-20', 'full_time', 'active');

-- 영업1팀 (6)
INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024006', '강차장', 6, 4, 'sales1@company.com', '010-6789-0123', '2021-01-10', 'full_time', 'active');

INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024007', '오대리', 6, 6, 'sales2@company.com', '010-7890-1234', '2022-03-15', 'full_time', 'active');

INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024008', '송사원', 6, 8, 'sales3@company.com', '010-8901-2345', '2023-09-01', 'full_time', 'active');

-- 개발팀 (9)
INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024009', '한차장', 9, 4, 'dev1@company.com', '010-9012-3456', '2020-02-01', 'full_time', 'active');

INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('2024010', '윤과장', 9, 5, 'dev2@company.com', '010-0123-4567', '2021-07-01', 'full_time', 'active');

-- ========================================
-- 추가 직원 입력 템플릿
-- ========================================
-- 아래 템플릿을 복사하여 필요한 만큼 추가하세요

/*
INSERT INTO employees (employee_number, name, department_id, position_id, email, mobile, hire_date, employment_type, status)
VALUES ('사원번호', '이름', 부서ID, 직급ID, 'email@company.com', '010-0000-0000', '입사일', 'full_time', 'active');
*/

-- ========================================
-- 주의사항
-- ========================================
-- 1. employee_number는 고유해야 합니다 (중복 불가)
-- 2. email도 고유해야 합니다 (중복 불가)
-- 3. hire_date 형식: 'YYYY-MM-DD' (예: '2024-01-01')
-- 4. employment_type: 'full_time', 'part_time', 'contract' 중 선택
-- 5. status: 'active', 'resigned', 'on_leave' 중 선택
-- 6. mobile 형식: '010-0000-0000'

-- ========================================
-- 실행 후 확인
-- ========================================
-- 입력된 직원 확인:
-- npx wrangler d1 execute webapp-production --local --command="SELECT e.employee_number, e.name, d.name as dept, p.name as pos FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN positions p ON e.position_id = p.id"
