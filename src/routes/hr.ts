import { Hono } from 'hono'
import type { Bindings, Variables } from '../types/bindings'

const hr = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ============================================
// 직원 관리 API
// ============================================

// 직원 목록 조회
hr.get('/employees', async (c) => {
  try {
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 20)
    const search = c.req.query('search') || ''
    const department = c.req.query('department') || ''
    const status = c.req.query('status') || 'active'
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        e.*,
        d.name as department_name,
        p.name as position_name,
        p.level as position_level
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.status = ?
    `
    let params: any[] = [status]

    if (search) {
      query += ' AND (e.name LIKE ? OR e.employee_number LIKE ? OR e.email LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (department) {
      query += ' AND e.department_id = ?'
      params.push(department)
    }

    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const employees = await c.env.DB.prepare(query).bind(...params).all()

    // 총 개수 조회
    let countQuery = 'SELECT COUNT(*) as count FROM employees WHERE status = ?'
    let countParams: any[] = [status]
    if (search) {
      countQuery += ' AND (name LIKE ? OR employee_number LIKE ? OR email LIKE ?)'
      const searchPattern = `%${search}%`
      countParams.push(searchPattern, searchPattern, searchPattern)
    }
    if (department) {
      countQuery += ' AND department_id = ?'
      countParams.push(department)
    }
    const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first()

    return c.json({
      success: true,
      data: employees.results,
      pagination: {
        page,
        limit,
        total: countResult?.count || 0,
        totalPages: Math.ceil((countResult?.count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get employees error:', error)
    return c.json({ error: '직원 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 직원 상세 조회
hr.get('/employees/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const employee = await c.env.DB.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        p.name as position_name,
        p.level as position_level,
        u.username, u.email as user_email, u.role
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `).bind(id).first()

    if (!employee) {
      return c.json({ error: '직원을 찾을 수 없습니다.' }, 404)
    }

    return c.json({ success: true, data: employee })
  } catch (error) {
    console.error('Get employee error:', error)
    return c.json({ error: '직원 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 직원 등록
hr.post('/employees', async (c) => {
  try {
    const data = await c.req.json()

    // 필수 필드 검증
    if (!data.employee_number || !data.name || !data.hire_date) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    // 사원번호 중복 체크
    const existing = await c.env.DB.prepare(
      'SELECT id FROM employees WHERE employee_number = ?'
    ).bind(data.employee_number).first()

    if (existing) {
      return c.json({ error: '이미 존재하는 사원번호입니다.' }, 400)
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO employees (
        employee_number, name, name_en, department_id, position_id,
        email, phone, mobile, hire_date, employment_type, status,
        birth_date, address, emergency_contact, emergency_phone,
        bank_name, bank_account, salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.employee_number, data.name, data.name_en, data.department_id, data.position_id,
      data.email, data.phone, data.mobile, data.hire_date, data.employment_type || 'full_time',
      data.status || 'active', data.birth_date, data.address, data.emergency_contact,
      data.emergency_phone, data.bank_name, data.bank_account, data.salary
    ).run()

    return c.json({
      success: true,
      data: { id: result.meta.last_row_id, ...data }
    }, 201)
  } catch (error) {
    console.error('Create employee error:', error)
    return c.json({ error: '직원 등록 중 오류가 발생했습니다.' }, 500)
  }
})

// 직원 정보 수정
hr.put('/employees/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()

    const result = await c.env.DB.prepare(`
      UPDATE employees SET
        name = ?, name_en = ?, department_id = ?, position_id = ?,
        email = ?, phone = ?, mobile = ?, employment_type = ?, status = ?,
        birth_date = ?, address = ?, emergency_contact = ?, emergency_phone = ?,
        bank_name = ?, bank_account = ?, salary = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.name, data.name_en, data.department_id, data.position_id,
      data.email, data.phone, data.mobile, data.employment_type, data.status,
      data.birth_date, data.address, data.emergency_contact, data.emergency_phone,
      data.bank_name, data.bank_account, data.salary, id
    ).run()

    if (result.meta.changes === 0) {
      return c.json({ error: '직원을 찾을 수 없습니다.' }, 404)
    }

    return c.json({ success: true, message: '직원 정보가 수정되었습니다.' })
  } catch (error) {
    console.error('Update employee error:', error)
    return c.json({ error: '직원 정보 수정 중 오류가 발생했습니다.' }, 500)
  }
})

// ============================================
// 부서 관리 API
// ============================================

// 부서 목록 조회
hr.get('/departments', async (c) => {
  try {
    const departments = await c.env.DB.prepare(`
      SELECT 
        d.*,
        e.name as manager_name,
        (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND status = 'active') as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.manager_id = e.id
      ORDER BY d.code
    `).all()

    return c.json({ success: true, data: departments.results })
  } catch (error) {
    console.error('Get departments error:', error)
    return c.json({ error: '부서 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 부서 등록
hr.post('/departments', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.name || !data.code) {
      return c.json({ error: '부서명과 코드를 입력해주세요.' }, 400)
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO departments (name, code, parent_id, manager_id, description)
      VALUES (?, ?, ?, ?, ?)
    `).bind(data.name, data.code, data.parent_id, data.manager_id, data.description).run()

    return c.json({
      success: true,
      data: { id: result.meta.last_row_id, ...data }
    }, 201)
  } catch (error) {
    console.error('Create department error:', error)
    return c.json({ error: '부서 등록 중 오류가 발생했습니다.' }, 500)
  }
})

// ============================================
// 근태 관리 API
// ============================================

// 근태 기록 조회
hr.get('/attendances', async (c) => {
  try {
    const employeeId = c.req.query('employee_id')
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 31)
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        a.*,
        e.name as employee_name,
        e.employee_number,
        d.name as department_name
      FROM attendances a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `
    let params: any[] = []

    if (employeeId) {
      query += ' AND a.employee_id = ?'
      params.push(employeeId)
    }

    if (startDate) {
      query += ' AND a.attendance_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND a.attendance_date <= ?'
      params.push(endDate)
    }

    query += ' ORDER BY a.attendance_date DESC, e.name LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const attendances = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: attendances.results })
  } catch (error) {
    console.error('Get attendances error:', error)
    return c.json({ error: '근태 기록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 출근 체크
hr.post('/attendances/check-in', async (c) => {
  try {
    const { employee_id } = await c.req.json()
    const today = new Date().toISOString().split('T')[0]

    // 오늘 출근 기록이 있는지 확인
    const existing = await c.env.DB.prepare(
      'SELECT id FROM attendances WHERE employee_id = ? AND attendance_date = ?'
    ).bind(employee_id, today).first()

    if (existing) {
      return c.json({ error: '이미 출근 처리되었습니다.' }, 400)
    }

    const now = new Date().toISOString()
    const result = await c.env.DB.prepare(`
      INSERT INTO attendances (employee_id, attendance_date, check_in, status)
      VALUES (?, ?, ?, 'present')
    `).bind(employee_id, today, now).run()

    return c.json({
      success: true,
      data: { id: result.meta.last_row_id, check_in: now }
    }, 201)
  } catch (error) {
    console.error('Check-in error:', error)
    return c.json({ error: '출근 처리 중 오류가 발생했습니다.' }, 500)
  }
})

// 퇴근 체크
hr.post('/attendances/check-out', async (c) => {
  try {
    const { employee_id } = await c.req.json()
    const today = new Date().toISOString().split('T')[0]

    const attendance = await c.env.DB.prepare(
      'SELECT * FROM attendances WHERE employee_id = ? AND attendance_date = ?'
    ).bind(employee_id, today).first()

    if (!attendance) {
      return c.json({ error: '출근 기록이 없습니다.' }, 400)
    }

    if (attendance.check_out) {
      return c.json({ error: '이미 퇴근 처리되었습니다.' }, 400)
    }

    const now = new Date().toISOString()
    const checkIn = new Date(attendance.check_in as string)
    const checkOut = new Date(now)
    const workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)

    await c.env.DB.prepare(`
      UPDATE attendances SET
        check_out = ?,
        work_hours = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(now, workHours.toFixed(2), attendance.id).run()

    return c.json({
      success: true,
      data: { check_out: now, work_hours: workHours.toFixed(2) }
    })
  } catch (error) {
    console.error('Check-out error:', error)
    return c.json({ error: '퇴근 처리 중 오류가 발생했습니다.' }, 500)
  }
})

// 휴가 신청 목록
hr.get('/leave-requests', async (c) => {
  try {
    const employeeId = c.req.query('employee_id')
    const status = c.req.query('status')
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 20)
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        lr.*,
        e.name as employee_name,
        e.employee_number,
        at.name as leave_type_name,
        ap.name as approver_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN attendance_types at ON lr.attendance_type_id = at.id
      LEFT JOIN employees ap ON lr.approved_by = ap.id
      WHERE 1=1
    `
    let params: any[] = []

    if (employeeId) {
      query += ' AND lr.employee_id = ?'
      params.push(employeeId)
    }

    if (status) {
      query += ' AND lr.status = ?'
      params.push(status)
    }

    query += ' ORDER BY lr.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const requests = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: requests.results })
  } catch (error) {
    console.error('Get leave requests error:', error)
    return c.json({ error: '휴가 신청 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 휴가 신청
hr.post('/leave-requests', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.employee_id || !data.attendance_type_id || !data.start_date || !data.end_date) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO leave_requests (
        employee_id, attendance_type_id, start_date, end_date, days, reason, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      data.employee_id, data.attendance_type_id, data.start_date,
      data.end_date, data.days, data.reason
    ).run()

    return c.json({
      success: true,
      data: { id: result.meta.last_row_id, ...data, status: 'pending' }
    }, 201)
  } catch (error) {
    console.error('Create leave request error:', error)
    return c.json({ error: '휴가 신청 중 오류가 발생했습니다.' }, 500)
  }
})

// 휴가 승인/거절
hr.put('/leave-requests/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const { approved_by, status, comments } = await c.req.json()

    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ error: '올바르지 않은 상태입니다.' }, 400)
    }

    const now = new Date().toISOString()
    await c.env.DB.prepare(`
      UPDATE leave_requests SET
        status = ?,
        approved_by = ?,
        approved_at = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, approved_by, now, id).run()

    return c.json({
      success: true,
      message: status === 'approved' ? '승인되었습니다.' : '거절되었습니다.'
    })
  } catch (error) {
    console.error('Approve leave request error:', error)
    return c.json({ error: '휴가 승인 처리 중 오류가 발생했습니다.' }, 500)
  }
})

// 직급 목록
hr.get('/positions', async (c) => {
  try {
    const positions = await c.env.DB.prepare(
      'SELECT * FROM positions ORDER BY level'
    ).all()

    return c.json({ success: true, data: positions.results })
  } catch (error) {
    console.error('Get positions error:', error)
    return c.json({ error: '직급 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 근태 유형 목록
hr.get('/attendance-types', async (c) => {
  try {
    const types = await c.env.DB.prepare(
      'SELECT * FROM attendance_types ORDER BY code'
    ).all()

    return c.json({ success: true, data: types.results })
  } catch (error) {
    console.error('Get attendance types error:', error)
    return c.json({ error: '근태 유형 조회 중 오류가 발생했습니다.' }, 500)
  }
})

export default hr
