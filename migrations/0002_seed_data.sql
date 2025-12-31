-- ============================================
-- 초기 데이터 삽입
-- ============================================

-- 기본 직급 데이터
INSERT INTO positions (name, code, level, description) VALUES
('대표이사', 'CEO', 1, '최고경영자'),
('이사', 'DIRECTOR', 2, '이사급'),
('부장', 'GM', 3, '부서장급'),
('차장', 'DM', 4, '차장급'),
('과장', 'MANAGER', 5, '관리자급'),
('대리', 'ASSISTANT_MANAGER', 6, '대리급'),
('주임', 'SENIOR', 7, '주임급'),
('사원', 'STAFF', 8, '사원급');

-- 기본 부서 데이터
INSERT INTO departments (name, code, description) VALUES
('경영지원본부', 'ADMIN', '경영 지원 및 관리 총괄'),
('인사팀', 'HR', '인사 관리'),
('총무팀', 'GA', '총무 및 자산 관리'),
('재무팀', 'FIN', '재무 및 회계'),
('영업본부', 'SALES', '영업 총괄'),
('영업1팀', 'SALES1', '영업 1팀'),
('영업2팀', 'SALES2', '영업 2팀'),
('기술본부', 'TECH', '기술 개발 총괄'),
('개발팀', 'DEV', '시스템 개발'),
('품질관리팀', 'QA', '품질 관리');

-- 기본 근태 유형 데이터
INSERT INTO attendance_types (name, code, is_paid, description) VALUES
('연차', 'ANNUAL', 1, '연차 휴가'),
('반차', 'HALF_DAY', 1, '반일 휴가'),
('병가', 'SICK', 1, '병가'),
('경조사', 'FAMILY', 1, '경조사 휴가'),
('무급휴가', 'UNPAID', 0, '무급 휴가'),
('출장', 'BUSINESS_TRIP', 1, '업무 출장'),
('재택근무', 'REMOTE', 1, '재택 근무');

-- 기본 결재 문서 유형 데이터
INSERT INTO approval_doc_types (name, code, description, form_template) VALUES
('휴가신청서', 'LEAVE', '휴가 신청', '{"fields":["start_date","end_date","leave_type","reason"]}'),
('지출결의서', 'EXPENSE', '지출 결의', '{"fields":["expense_date","amount","category","purpose","receipt"]}'),
('구매요청서', 'PURCHASE', '구매 요청', '{"fields":["item_name","quantity","unit_price","total_price","supplier","purpose"]}'),
('계약서', 'CONTRACT', '계약 승인', '{"fields":["partner_name","contract_amount","contract_period","contract_type","terms"]}'),
('일반기안서', 'GENERAL', '일반 기안', '{"fields":["subject","content","attachments"]}');

-- 기본 계정과목 데이터
INSERT INTO account_codes (code, name, type, level, description) VALUES
-- 자산
('1000', '자산', 'asset', 1, '자산 총계'),
('1100', '유동자산', 'asset', 2, '1년 이내 현금화 가능 자산'),
('1110', '현금및현금성자산', 'asset', 3, '현금, 보통예금 등'),
('1120', '매출채권', 'asset', 3, '상품 및 용역 판매 채권'),
('1200', '비유동자산', 'asset', 2, '장기 보유 자산'),
('1210', '유형자산', 'asset', 3, '토지, 건물, 기계장치 등'),

-- 부채
('2000', '부채', 'liability', 1, '부채 총계'),
('2100', '유동부채', 'liability', 2, '1년 이내 상환 부채'),
('2110', '매입채무', 'liability', 3, '상품 및 용역 구매 채무'),
('2120', '단기차입금', 'liability', 3, '단기 차입금'),
('2200', '비유동부채', 'liability', 2, '장기 부채'),
('2210', '장기차입금', 'liability', 3, '장기 차입금'),

-- 자본
('3000', '자본', 'equity', 1, '자본 총계'),
('3100', '자본금', 'equity', 2, '자본금'),
('3200', '이익잉여금', 'equity', 2, '이익잉여금'),

-- 수익
('4000', '수익', 'revenue', 1, '수익 총계'),
('4100', '매출액', 'revenue', 2, '매출액'),
('4110', '상품매출', 'revenue', 3, '상품 판매 수익'),
('4120', '용역매출', 'revenue', 3, '용역 제공 수익'),

-- 비용
('5000', '비용', 'expense', 1, '비용 총계'),
('5100', '매출원가', 'expense', 2, '매출원가'),
('5200', '판매비와관리비', 'expense', 2, '판매 및 관리 비용'),
('5210', '급여', 'expense', 3, '직원 급여'),
('5220', '복리후생비', 'expense', 3, '복리후생비'),
('5230', '접대비', 'expense', 3, '접대비'),
('5240', '여비교통비', 'expense', 3, '여비 및 교통비'),
('5250', '통신비', 'expense', 3, '통신비'),
('5260', '소모품비', 'expense', 3, '소모품비'),
('5270', '임차료', 'expense', 3, '임차료'),
('5280', '감가상각비', 'expense', 3, '감가상각비');

-- 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO users (username, password_hash, email, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@company.com', 'admin');

-- 관리자 직원 정보
INSERT INTO employees (user_id, employee_number, name, department_id, position_id, email, hire_date, employment_type, status) VALUES
(1, 'EMP001', '시스템관리자', 1, 1, 'admin@company.com', date('now'), 'full_time', 'active');
