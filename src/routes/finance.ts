import { Hono } from 'hono'
import type { Bindings, Variables } from '../types/bindings'

const finance = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ============================================
// 매출 관리 API
// ============================================

// 매출 목록 조회
finance.get('/sales', async (c) => {
  try {
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 20)
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    const partnerId = c.req.query('partner_id')
    const paymentStatus = c.req.query('payment_status')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        s.*,
        bp.company_name as partner_name,
        ac.name as account_name,
        e.name as employee_name
      FROM sales s
      LEFT JOIN business_partners bp ON s.partner_id = bp.id
      LEFT JOIN account_codes ac ON s.account_code_id = ac.id
      LEFT JOIN employees e ON s.employee_id = e.id
      WHERE 1=1
    `
    let params: any[] = []

    if (startDate) {
      query += ' AND s.sale_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND s.sale_date <= ?'
      params.push(endDate)
    }

    if (partnerId) {
      query += ' AND s.partner_id = ?'
      params.push(partnerId)
    }

    if (paymentStatus) {
      query += ' AND s.payment_status = ?'
      params.push(paymentStatus)
    }

    query += ' ORDER BY s.sale_date DESC, s.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const sales = await c.env.DB.prepare(query).bind(...params).all()

    // 합계 조회
    let sumQuery = 'SELECT SUM(total_amount) as total, SUM(paid_amount) as paid FROM sales WHERE 1=1'
    let sumParams: any[] = []
    if (startDate) {
      sumQuery += ' AND sale_date >= ?'
      sumParams.push(startDate)
    }
    if (endDate) {
      sumQuery += ' AND sale_date <= ?'
      sumParams.push(endDate)
    }
    if (partnerId) {
      sumQuery += ' AND partner_id = ?'
      sumParams.push(partnerId)
    }
    if (paymentStatus) {
      sumQuery += ' AND payment_status = ?'
      sumParams.push(paymentStatus)
    }

    const sumResult = await c.env.DB.prepare(sumQuery).bind(...sumParams).first()

    return c.json({
      success: true,
      data: sales.results,
      summary: {
        total_amount: sumResult?.total || 0,
        paid_amount: sumResult?.paid || 0,
        unpaid_amount: (sumResult?.total || 0) - (sumResult?.paid || 0)
      }
    })
  } catch (error) {
    console.error('Get sales error:', error)
    return c.json({ error: '매출 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 매출 등록
finance.post('/sales', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.partner_id || !data.sale_date || !data.account_code_id || !data.amount) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    // 매출 번호 생성
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM sales WHERE substr(sale_number, 3, 8) = ?'
    ).bind(today).first()
    const seq = String((countResult?.count as number || 0) + 1).padStart(4, '0')
    const saleNumber = `S-${today}-${seq}`

    const vat = data.amount * 0.1 // 부가세 10%
    const totalAmount = data.amount + vat

    const result = await c.env.DB.prepare(`
      INSERT INTO sales (
        sale_number, partner_id, sale_date, due_date, account_code_id,
        amount, vat, total_amount, payment_status, paid_amount, description, employee_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 0, ?, ?)
    `).bind(
      saleNumber, data.partner_id, data.sale_date, data.due_date, data.account_code_id,
      data.amount, vat, totalAmount, data.description, data.employee_id
    ).run()

    return c.json({
      success: true,
      data: {
        id: result.meta.last_row_id,
        sale_number: saleNumber,
        ...data,
        vat,
        total_amount: totalAmount
      }
    }, 201)
  } catch (error) {
    console.error('Create sale error:', error)
    return c.json({ error: '매출 등록 중 오류가 발생했습니다.' }, 500)
  }
})

// 매출 수정
finance.put('/sales/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()

    const vat = data.amount * 0.1
    const totalAmount = data.amount + vat

    const result = await c.env.DB.prepare(`
      UPDATE sales SET
        sale_date = ?,
        due_date = ?,
        amount = ?,
        vat = ?,
        total_amount = ?,
        description = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(data.sale_date, data.due_date, data.amount, vat, totalAmount, data.description, id).run()

    if (result.meta.changes === 0) {
      return c.json({ error: '매출을 찾을 수 없습니다.' }, 404)
    }

    return c.json({ success: true, message: '매출 정보가 수정되었습니다.' })
  } catch (error) {
    console.error('Update sale error:', error)
    return c.json({ error: '매출 수정 중 오류가 발생했습니다.' }, 500)
  }
})

// 매출 입금 처리
finance.post('/sales/:id/payment', async (c) => {
  try {
    const id = c.req.param('id')
    const { amount } = await c.req.json()

    const sale = await c.env.DB.prepare('SELECT * FROM sales WHERE id = ?').bind(id).first()

    if (!sale) {
      return c.json({ error: '매출을 찾을 수 없습니다.' }, 404)
    }

    const newPaidAmount = (sale.paid_amount as number) + amount
    const totalAmount = sale.total_amount as number

    let paymentStatus = 'unpaid'
    if (newPaidAmount >= totalAmount) {
      paymentStatus = 'paid'
    } else if (newPaidAmount > 0) {
      paymentStatus = 'partial'
    }

    await c.env.DB.prepare(`
      UPDATE sales SET
        paid_amount = ?,
        payment_status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(newPaidAmount, paymentStatus, id).run()

    return c.json({
      success: true,
      message: '입금 처리되었습니다.',
      data: {
        paid_amount: newPaidAmount,
        remaining_amount: totalAmount - newPaidAmount,
        payment_status: paymentStatus
      }
    })
  } catch (error) {
    console.error('Process payment error:', error)
    return c.json({ error: '입금 처리 중 오류가 발생했습니다.' }, 500)
  }
})

// ============================================
// 매입 관리 API
// ============================================

// 매입 목록 조회
finance.get('/purchases', async (c) => {
  try {
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 20)
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    const partnerId = c.req.query('partner_id')
    const paymentStatus = c.req.query('payment_status')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        p.*,
        bp.company_name as partner_name,
        ac.name as account_name,
        e.name as employee_name
      FROM purchases p
      LEFT JOIN business_partners bp ON p.partner_id = bp.id
      LEFT JOIN account_codes ac ON p.account_code_id = ac.id
      LEFT JOIN employees e ON p.employee_id = e.id
      WHERE 1=1
    `
    let params: any[] = []

    if (startDate) {
      query += ' AND p.purchase_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND p.purchase_date <= ?'
      params.push(endDate)
    }

    if (partnerId) {
      query += ' AND p.partner_id = ?'
      params.push(partnerId)
    }

    if (paymentStatus) {
      query += ' AND p.payment_status = ?'
      params.push(paymentStatus)
    }

    query += ' ORDER BY p.purchase_date DESC, p.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const purchases = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: purchases.results })
  } catch (error) {
    console.error('Get purchases error:', error)
    return c.json({ error: '매입 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 매입 등록
finance.post('/purchases', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.partner_id || !data.purchase_date || !data.account_code_id || !data.amount) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    // 매입 번호 생성
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM purchases WHERE substr(purchase_number, 3, 8) = ?'
    ).bind(today).first()
    const seq = String((countResult?.count as number || 0) + 1).padStart(4, '0')
    const purchaseNumber = `P-${today}-${seq}`

    const vat = data.amount * 0.1
    const totalAmount = data.amount + vat

    const result = await c.env.DB.prepare(`
      INSERT INTO purchases (
        purchase_number, partner_id, purchase_date, due_date, account_code_id,
        amount, vat, total_amount, payment_status, paid_amount, description, employee_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 0, ?, ?)
    `).bind(
      purchaseNumber, data.partner_id, data.purchase_date, data.due_date, data.account_code_id,
      data.amount, vat, totalAmount, data.description, data.employee_id
    ).run()

    return c.json({
      success: true,
      data: {
        id: result.meta.last_row_id,
        purchase_number: purchaseNumber,
        ...data,
        vat,
        total_amount: totalAmount
      }
    }, 201)
  } catch (error) {
    console.error('Create purchase error:', error)
    return c.json({ error: '매입 등록 중 오류가 발생했습니다.' }, 500)
  }
})

// ============================================
// 비용 처리 API
// ============================================

// 비용 목록 조회
finance.get('/expenses', async (c) => {
  try {
    const page = Number(c.req.query('page') || 1)
    const limit = Number(c.req.query('limit') || 20)
    const employeeId = c.req.query('employee_id')
    const approvalStatus = c.req.query('approval_status')
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        ex.*,
        e.name as employee_name,
        e.employee_number,
        d.name as department_name,
        ac.name as account_name,
        ap.name as approver_name
      FROM expenses ex
      LEFT JOIN employees e ON ex.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN account_codes ac ON ex.account_code_id = ac.id
      LEFT JOIN employees ap ON ex.approved_by = ap.id
      WHERE 1=1
    `
    let params: any[] = []

    if (employeeId) {
      query += ' AND ex.employee_id = ?'
      params.push(employeeId)
    }

    if (approvalStatus) {
      query += ' AND ex.approval_status = ?'
      params.push(approvalStatus)
    }

    if (startDate) {
      query += ' AND ex.expense_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND ex.expense_date <= ?'
      params.push(endDate)
    }

    query += ' ORDER BY ex.expense_date DESC, ex.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const expenses = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: expenses.results })
  } catch (error) {
    console.error('Get expenses error:', error)
    return c.json({ error: '비용 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 비용 등록
finance.post('/expenses', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.employee_id || !data.expense_date || !data.account_code_id || !data.amount || !data.description) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    // 비용 번호 생성
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM expenses WHERE substr(expense_number, 3, 8) = ?'
    ).bind(today).first()
    const seq = String((countResult?.count as number || 0) + 1).padStart(4, '0')
    const expenseNumber = `E-${today}-${seq}`

    const vat = (data.vat !== undefined) ? data.vat : (data.amount * 0.1)
    const totalAmount = data.amount + vat

    const result = await c.env.DB.prepare(`
      INSERT INTO expenses (
        expense_number, employee_id, expense_date, account_code_id,
        amount, vat, total_amount, category, description, receipt_url,
        approval_status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')
    `).bind(
      expenseNumber, data.employee_id, data.expense_date, data.account_code_id,
      data.amount, vat, totalAmount, data.category || 'etc',
      data.description, data.receipt_url
    ).run()

    return c.json({
      success: true,
      data: {
        id: result.meta.last_row_id,
        expense_number: expenseNumber,
        ...data,
        vat,
        total_amount: totalAmount
      }
    }, 201)
  } catch (error) {
    console.error('Create expense error:', error)
    return c.json({ error: '비용 등록 중 오류가 발생했습니다.' }, 500)
  }
})

// 비용 승인/거절
finance.post('/expenses/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const { approved_by, status } = await c.req.json()

    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ error: '올바르지 않은 상태입니다.' }, 400)
    }

    const now = new Date().toISOString()
    await c.env.DB.prepare(`
      UPDATE expenses SET
        approval_status = ?,
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
    console.error('Approve expense error:', error)
    return c.json({ error: '비용 승인 처리 중 오류가 발생했습니다.' }, 500)
  }
})

// ============================================
// 예산 관리 API
// ============================================

// 예산 목록 조회
finance.get('/budgets', async (c) => {
  try {
    const year = c.req.query('year')
    const month = c.req.query('month')
    const departmentId = c.req.query('department_id')

    let query = `
      SELECT 
        b.*,
        d.name as department_name,
        ac.name as account_name,
        ac.code as account_code
      FROM budgets b
      LEFT JOIN departments d ON b.department_id = d.id
      LEFT JOIN account_codes ac ON b.account_code_id = ac.id
      WHERE 1=1
    `
    let params: any[] = []

    if (year) {
      query += ' AND b.year = ?'
      params.push(year)
    }

    if (month) {
      query += ' AND b.month = ?'
      params.push(month)
    }

    if (departmentId) {
      query += ' AND b.department_id = ?'
      params.push(departmentId)
    }

    query += ' ORDER BY b.year DESC, b.month DESC, d.name, ac.code'

    const budgets = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: budgets.results })
  } catch (error) {
    console.error('Get budgets error:', error)
    return c.json({ error: '예산 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 예산 등록/수정
finance.post('/budgets', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.year || !data.month || !data.account_code_id || !data.budgeted_amount) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    // 기존 예산이 있는지 확인
    const existing = await c.env.DB.prepare(`
      SELECT id FROM budgets 
      WHERE year = ? AND month = ? AND department_id = ? AND account_code_id = ?
    `).bind(data.year, data.month, data.department_id, data.account_code_id).first()

    if (existing) {
      // 기존 예산 수정
      await c.env.DB.prepare(`
        UPDATE budgets SET
          budgeted_amount = ?,
          notes = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(data.budgeted_amount, data.notes, existing.id).run()

      return c.json({ success: true, message: '예산이 수정되었습니다.' })
    } else {
      // 새 예산 등록
      const result = await c.env.DB.prepare(`
        INSERT INTO budgets (
          year, month, department_id, account_code_id, budgeted_amount, actual_amount, notes
        ) VALUES (?, ?, ?, ?, ?, 0, ?)
      `).bind(
        data.year, data.month, data.department_id, data.account_code_id,
        data.budgeted_amount, data.notes
      ).run()

      return c.json({
        success: true,
        data: { id: result.meta.last_row_id, ...data }
      }, 201)
    }
  } catch (error) {
    console.error('Create/Update budget error:', error)
    return c.json({ error: '예산 등록/수정 중 오류가 발생했습니다.' }, 500)
  }
})

// ============================================
// 거래처 관리 API
// ============================================

// 거래처 목록
finance.get('/partners', async (c) => {
  try {
    const partnerType = c.req.query('partner_type')
    const search = c.req.query('search')

    let query = 'SELECT * FROM business_partners WHERE is_active = 1'
    let params: any[] = []

    if (partnerType) {
      query += ' AND (partner_type = ? OR partner_type = "both")'
      params.push(partnerType)
    }

    if (search) {
      query += ' AND (company_name LIKE ? OR business_number LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    query += ' ORDER BY company_name'

    const partners = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: partners.results })
  } catch (error) {
    console.error('Get partners error:', error)
    return c.json({ error: '거래처 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 거래처 등록
finance.post('/partners', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.partner_type || !data.company_name) {
      return c.json({ error: '필수 정보를 입력해주세요.' }, 400)
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO business_partners (
        partner_type, company_name, business_number, representative,
        email, phone, fax, address, bank_name, bank_account, credit_limit, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.partner_type, data.company_name, data.business_number, data.representative,
      data.email, data.phone, data.fax, data.address, data.bank_name,
      data.bank_account, data.credit_limit, data.notes
    ).run()

    return c.json({
      success: true,
      data: { id: result.meta.last_row_id, ...data }
    }, 201)
  } catch (error) {
    console.error('Create partner error:', error)
    return c.json({ error: '거래처 등록 중 오류가 발생했습니다.' }, 500)
  }
})

// 계정과목 목록
finance.get('/account-codes', async (c) => {
  try {
    const type = c.req.query('type')

    let query = 'SELECT * FROM account_codes WHERE is_active = 1'
    let params: any[] = []

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    query += ' ORDER BY code'

    const accounts = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: accounts.results })
  } catch (error) {
    console.error('Get account codes error:', error)
    return c.json({ error: '계정과목 조회 중 오류가 발생했습니다.' }, 500)
  }
})

export default finance
