-- ============================================
-- 중소기업 ERP 시스템 초기 스키마
-- 모듈: 인사관리, 전자결재, 재무/회계
-- ============================================

-- ============================================
-- 1. 인증 및 사용자 관리
-- ============================================

-- 사용자 테이블 (로그인 계정)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee', -- admin, manager, employee
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 인사관리 모듈
-- ============================================

-- 부서 테이블
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  parent_id INTEGER,
  manager_id INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES departments(id),
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- 직급 테이블
CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  level INTEGER NOT NULL, -- 직급 레벨 (낮을수록 높은 직급)
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 직원 테이블
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  employee_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  department_id INTEGER,
  position_id INTEGER,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  hire_date DATE NOT NULL,
  resignation_date DATE,
  employment_type TEXT NOT NULL DEFAULT 'full_time', -- full_time, part_time, contract
  status TEXT NOT NULL DEFAULT 'active', -- active, on_leave, resigned
  birth_date DATE,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  bank_name TEXT,
  bank_account TEXT,
  salary DECIMAL(15,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (position_id) REFERENCES positions(id)
);

-- 근태 유형 테이블
CREATE TABLE IF NOT EXISTS attendance_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_paid INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 근태 기록 테이블
CREATE TABLE IF NOT EXISTS attendances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  attendance_date DATE NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  work_hours DECIMAL(4,2),
  overtime_hours DECIMAL(4,2),
  status TEXT NOT NULL DEFAULT 'present', -- present, absent, late, early_leave, on_leave
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  UNIQUE(employee_id, attendance_date)
);

-- 휴가/결근 신청 테이블
CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  attendance_type_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(3,1) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_by INTEGER,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (attendance_type_id) REFERENCES attendance_types(id),
  FOREIGN KEY (approved_by) REFERENCES employees(id)
);

-- ============================================
-- 3. 전자결재 모듈
-- ============================================

-- 결재 문서 유형 테이블
CREATE TABLE IF NOT EXISTS approval_doc_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  form_template TEXT, -- JSON 형식의 폼 템플릿
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 결재 문서 테이블
CREATE TABLE IF NOT EXISTS approval_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_type_id INTEGER NOT NULL,
  doc_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- JSON 형식의 문서 내용
  drafter_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending, approved, rejected, cancelled
  current_step INTEGER NOT NULL DEFAULT 0,
  urgency TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (doc_type_id) REFERENCES approval_doc_types(id),
  FOREIGN KEY (drafter_id) REFERENCES employees(id)
);

-- 결재선 테이블
CREATE TABLE IF NOT EXISTS approval_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  approver_id INTEGER NOT NULL,
  step_order INTEGER NOT NULL,
  approval_type TEXT NOT NULL DEFAULT 'approval', -- approval, agreement, reference
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, skipped
  comments TEXT,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES approval_documents(id),
  FOREIGN KEY (approver_id) REFERENCES employees(id)
);

-- 결재 첨부파일 테이블
CREATE TABLE IF NOT EXISTS approval_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT,
  file_url TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES approval_documents(id),
  FOREIGN KEY (uploaded_by) REFERENCES employees(id)
);

-- ============================================
-- 4. 재무/회계 모듈
-- ============================================

-- 계정과목 테이블
CREATE TABLE IF NOT EXISTS account_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
  parent_id INTEGER,
  level INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES account_codes(id)
);

-- 거래처 테이블
CREATE TABLE IF NOT EXISTS business_partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_type TEXT NOT NULL, -- customer, supplier, both
  company_name TEXT NOT NULL,
  business_number TEXT UNIQUE,
  representative TEXT,
  email TEXT,
  phone TEXT,
  fax TEXT,
  address TEXT,
  bank_name TEXT,
  bank_account TEXT,
  credit_limit DECIMAL(15,2),
  is_active INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 매출 테이블
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_number TEXT UNIQUE NOT NULL,
  partner_id INTEGER NOT NULL,
  sale_date DATE NOT NULL,
  due_date DATE,
  account_code_id INTEGER NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  vat DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, partial, paid
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  description TEXT,
  employee_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES business_partners(id),
  FOREIGN KEY (account_code_id) REFERENCES account_codes(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- 매입 테이블
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_number TEXT UNIQUE NOT NULL,
  partner_id INTEGER NOT NULL,
  purchase_date DATE NOT NULL,
  due_date DATE,
  account_code_id INTEGER NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  vat DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, partial, paid
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  description TEXT,
  employee_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES business_partners(id),
  FOREIGN KEY (account_code_id) REFERENCES account_codes(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- 비용 처리 테이블
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_number TEXT UNIQUE NOT NULL,
  employee_id INTEGER NOT NULL,
  expense_date DATE NOT NULL,
  account_code_id INTEGER NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  vat DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL, -- transportation, meal, supplies, etc
  description TEXT NOT NULL,
  receipt_url TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_by INTEGER,
  approved_at DATETIME,
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, paid
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (account_code_id) REFERENCES account_codes(id),
  FOREIGN KEY (approved_by) REFERENCES employees(id)
);

-- 예산 테이블
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  department_id INTEGER,
  account_code_id INTEGER NOT NULL,
  budgeted_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (account_code_id) REFERENCES account_codes(id),
  UNIQUE(year, month, department_id, account_code_id)
);

-- ============================================
-- 인덱스 생성
-- ============================================

-- 사용자 인덱스
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 직원 인덱스
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_number ON employees(employee_number);

-- 부서 인덱스
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager ON departments(manager_id);

-- 근태 인덱스
CREATE INDEX IF NOT EXISTS idx_attendances_employee ON attendances(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(attendance_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- 결재 인덱스
CREATE INDEX IF NOT EXISTS idx_approval_docs_drafter ON approval_documents(drafter_id);
CREATE INDEX IF NOT EXISTS idx_approval_docs_status ON approval_documents(status);
CREATE INDEX IF NOT EXISTS idx_approval_docs_type ON approval_documents(doc_type_id);
CREATE INDEX IF NOT EXISTS idx_approval_lines_document ON approval_lines(document_id);
CREATE INDEX IF NOT EXISTS idx_approval_lines_approver ON approval_lines(approver_id);

-- 재무 인덱스
CREATE INDEX IF NOT EXISTS idx_sales_partner ON sales(partner_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_partner ON purchases(partner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(approval_status);
CREATE INDEX IF NOT EXISTS idx_budgets_year_month ON budgets(year, month);
CREATE INDEX IF NOT EXISTS idx_budgets_department ON budgets(department_id);
